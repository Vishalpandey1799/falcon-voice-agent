import logging
from dotenv import load_dotenv

import wellness_manager
import notion_integration

from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    MetricsCollectedEvent,
    RoomInputOptions,
    WorkerOptions,
    cli,
    metrics,
    tokenize,
    function_tool,
    RunContext
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("wellness_agent")

load_dotenv(".env")


class WellnessCompanion(Agent):
    def __init__(self) -> None:
        history_context = wellness_manager.format_history_for_context()
        
        system_prompt = f"""
You are a supportive Health & Wellness Voice Companion.
Your role is to help users check in with themselves daily about their mood, energy, and goals.

IMPORTANT: You are NOT a medical professional. You do NOT diagnose or provide medical advice.
You are a supportive friend who helps users reflect.

YOUR CONVERSATION FLOW:

1. GREETING & HISTORY REFERENCE
   - Greet warmly
   - Reference past check-in if available
   - Example: "Last time you mentioned being stressed. How are things today?"

2. MOOD & ENERGY CHECK-IN
   Ask naturally, one at a time:
   - "How are you feeling today?"
   - "What's your energy like?"
   - "Anything on your mind or stressing you out?"

3. DAILY OBJECTIVES
   - "What are 1–3 things you'd like to accomplish today?"
   - "Anything you want to do for yourself - rest, exercise, hobby?"

4. SIMPLE, GROUNDED ADVICE
   - "Breaking that into smaller steps might help"
   - "Remember to take breaks"
   - "A 5-minute walk can help clear your mind"
   - Never diagnose or give medical advice

5. RECAP & CONFIRMATION
   - Summarize: mood, energy, and 1-3 objectives
   - Ask: "Does this sound right?"
   - Once confirmed, decide next step:
     * If user says "save to Notion" or "add to Notion", call save_to_notion tool
     * Otherwise call finalize_checkin tool

IMPORTANT: Only call save_to_notion if user explicitly says they want to save to Notion.
If user doesn't mention Notion, use finalize_checkin instead.

PREVIOUS CHECK-IN CONTEXT:
{history_context}

Be warm, non-judgmental, encouraging. Keep check-ins brief (5-10 minutes).
"""
        
        super().__init__(instructions=system_prompt)

    @function_tool
    async def finalize_checkin(
        self,
        ctx: RunContext,
        mood: str,
        energy: str,
        objectives: str,
        summary: str
    ) -> str:
        """Save wellness check-in after user confirms."""
        logger.info(f"Saving wellness check-in: mood={mood}, energy={energy}")
        
        try:
            objectives_list = [obj.strip() for obj in objectives.split(",") if obj.strip()]
            
            wellness_manager.save_wellness_checkin(
                mood=mood,
                energy=energy,
                objectives=objectives_list,
                summary=summary
            )
            
            return "Your check-in has been saved. See you next time!"
        except Exception as e:
            logger.error(f"Error saving wellness check-in: {e}")
            return "Error saving check-in, but let's continue."

    @function_tool
    async def save_to_notion(
        self,
        ctx: RunContext,
        mood: str,
        energy: str,
        objectives: str,
        summary: str
    ) -> str:
        """Save wellness check-in to Notion database."""
        logger.info("Saving wellness check-in to Notion...")
        
        try:
            objectives_list = [obj.strip() for obj in objectives.split(",") if obj.strip()]
            
            result = await notion_integration.create_wellness_entry(
                mood=mood,
                energy=energy,
                objectives=objectives_list,
                summary=summary
            )
            
            if result.get("success"):
                return "I've saved your wellness check-in to Notion. Your mood, energy, and goals are now in your wellness database."
            else:
                return f"I tried to save to Notion but encountered an error: {result.get('message')}"
        except Exception as e:
            logger.error(f"Error saving to Notion: {e}")
            return f"Error: {str(e)}"


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(
            voice="en-US-matthew",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
            text_pacing=True
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent):
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

    async def log_usage():
        summary = usage_collector.get_summary()
        logger.info(f"Usage: {summary}")

    ctx.add_shutdown_callback(log_usage)

    await session.start(
        agent=WellnessCompanion(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
