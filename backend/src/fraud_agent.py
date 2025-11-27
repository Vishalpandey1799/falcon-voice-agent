import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv

from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    RoomInputOptions,
    WorkerOptions,
    cli,
    tokenize,
    function_tool,
    RunContext,
)
from livekit.plugins import murf, silero, google, deepgram, noise_cancellation
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from database import init_db, load_fraud_cases, save_fraud_cases

logger = logging.getLogger("fraud_agent")
logging.basicConfig(level=logging.INFO)

load_dotenv(".env")

# Initialize DB
init_db()


def build_system_prompt() -> str:
    return """
You are Alex, a Fraud Detection Officer from SecureBank.

FLOW:
1. Introduce yourself.
2. Ask customer for their name.
3. Load their fraud case using the provided tools.
4. Ask the security question from the database.
5. If verification passes:
   - Read the suspicious transaction details.
   - Ask if they made the transaction.
6. If yes → mark as safe.
7. If no → mark as fraudulent.
8. If verification fails → politely end call.

Never ask for PINs, full card numbers, or passwords.
"""


class FraudAgent(Agent):
    def __init__(self):
        print(">>> [FRAUD AGENT INIT]")
        self.current_case = None
        self.verified = False
        super().__init__(instructions=build_system_prompt())

    # -------------------------------
    # LOAD FRAUD CASE
    # -------------------------------
    @function_tool
    async def load_fraud_case(self, ctx: RunContext, user_name: str) -> str:
        """Load fraud case matching user's name"""
        print(f">>> [FRAUD] Loading case for: {user_name}")

        cases = load_fraud_cases()

        for case in cases:
            if case.get("userName", "").lower() == user_name.lower():
                self.current_case = case
                print(f">>> [FRAUD] Case loaded: {case}")

                return (
                    f"Thank you, {user_name}. To verify your identity, "
                    f"please answer this question: {case.get('securityQuestion')}"
                )

        return (
            f"I couldn't find an account for {user_name}. "
            "Please repeat your name or contact customer support."
        )

    # -------------------------------
    # VERIFY USER
    # -------------------------------
    @function_tool
    async def verify_identity(self, ctx: RunContext, answer: str) -> str:
        print(f">>> [FRAUD] Verifying answer: {answer}")

        if not self.current_case:
            return "I need your name first."

        correct = self.current_case["securityAnswer"].lower()

        if answer.lower() == correct:
            self.verified = True
            case = self.current_case

            return (
                f"Identity verified. I’m calling regarding a suspicious charge of "
                f"${case.get('transactionAmount')} at {case.get('transactionName')} "
                f"through {case.get('transactionSource')} in {case.get('location')} "
                f"on {case.get('transactionTime')}. "
                "Did you make this transaction? Say yes or no."
            )

        return (
            "That answer does not match our records. "
            "For your security, we cannot continue this verification."
        )

    # -------------------------------
    # MARK AS SAFE / FRAUD
    # -------------------------------
    @function_tool
    async def mark_transaction(self, ctx: RunContext, is_legitimate: bool) -> str:
        print(f">>> [FRAUD] Marking transaction: {is_legitimate}")

        if not self.current_case or not self.verified:
            return "I need to verify your identity first."

        cases = load_fraud_cases()

        for i, case in enumerate(cases):
            if case["id"] == self.current_case["id"]:
                if is_legitimate:
                    cases[i]["status"] = "confirmed_safe"
                    note = (
                        "Thanks. I've marked the transaction as legitimate. "
                        "Your card remains active."
                    )
                else:
                    cases[i]["status"] = "confirmed_fraud"
                    note = (
                        f"I’ve blocked your card ending in {case.get('cardEnding')} "
                        "and initiated a dispute. A new card will arrive soon."
                    )

                save_fraud_cases(cases)
                return note + " Can I help you with anything else?"

        return "Something went wrong updating your case."

    # -------------------------------
    # END CALL
    # -------------------------------
    @function_tool
    async def end_call(self, ctx: RunContext) -> str:
        print(">>> [FRAUD] Ending call")

        if self.current_case:
            return (
                f"Thank you for your time. Your updated case status is "
                f"{self.current_case.get('status')}. Have a good day."
            )

        return "Thank you. Have a good day."


# -------------------------------
# STARTUP / WORKER BOOT
# -------------------------------
def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    print(">>> [BOOT] Fraud Agent starting...")

    vad = ctx.proc.userdata["vad"]

    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=murf.TTS(
            voice="en-US-ken",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=vad,
        preemptive_generation=True,
    )

    await ctx.connect()

    await session.start(
        agent=FraudAgent(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
