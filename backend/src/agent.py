
import logging
import json  
from dotenv import load_dotenv
 
import order_manager 

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

logger = logging.getLogger("agent")

load_dotenv(".env")

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""
            You are a order agent  at 'Third wave coffee shop'.
            Your ONLY goal is to take coffee orders from customers.
            You are NOT a general assistant - you ONLY take coffee orders.
            
            You MUST collect these 5 specific details:
            1. Drink Type (Latte, Cappuccino, Espresso, Americano, Mocha, Flat White, etc.)
            2. Size (Small, Medium, Large)
            3. Milk preference (Whole, Oat, Almond, Soy, etc.)
            4. Extras (Sugar, Whipped Cream, Caramel Drizzle, etc. or "None")
            5. Customer Name
            
            RULES:
            - Ask questions ONE by ONE. Be conversational and friendly.
            - Do NOT make up or assume information.
            - Once you have ALL 5 pieces, call 'finalize_order' IMMEDIATELY.
            - After calling the tool, tell the customer their coffee will be ready in 5 minutes.
            - Do NOT answer questions unrelated to ordering coffee.
            - Always redirect to taking their order.
            """,
        )

    @function_tool
    async def finalize_order(
        self, 
        ctx: RunContext, 
        drink_type: str, 
        size: str, 
        milk: str, 
        extras: str, 
        name: str
    ) -> str:
        """
        Finalize and save the customer's coffee order.
        Call this ONLY after collecting all 5 required details.
        
        Args:
            drink_type: Type of coffee (Latte, Cappuccino, etc.)
            size: Size of drink (Small, Medium, Large)
            milk: Milk preference (Whole, Oat, Almond, Soy, etc.)
            extras: Extra items (Sugar, Whipped Cream, etc. or "None")
            name: Customer's name
            
        Returns:
            Confirmation message
        """
        logger.info(f"Finalizing order for {name}: {drink_type} ({size}), {milk} milk, extras: {extras}")
        
        try:
            result = order_manager.save_order_to_json(drink_type, size, milk, extras, name)
            logger.info(f"Order result: {result}")
            return "Order placed successfully! Tell the customer their coffee will be ready in 5 minutes."
        except Exception as e:
            logger.error(f"Error saving order: {e}")
            return "Sorry, there was an error. Please try again."


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        # Your existing LLM config
        llm=google.LLM(
                model="gemini-2.5-flash",
            ),
        # Your existing Murf config
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
        agent=Assistant(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))