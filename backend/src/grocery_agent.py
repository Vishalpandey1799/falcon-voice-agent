import logging
import json
import uuid
import os
import glob
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List
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

logger = logging.getLogger("grocery_agent")
logging.basicConfig(level=logging.INFO)

load_dotenv(".env")


 

def load_catalog() -> List[Dict[str, Any]]:
    try:
        with open("shared-data/catalog.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error("Catalog file not found")
        return []


def load_recipes() -> Dict[str, List[str]]:
    try:
        with open("shared-data/recipes.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error("Recipes file not found")
        return {}


def get_order_filename(order_id: str) -> str:
    return f"shared-data/order_{order_id}.json"


def save_order(order: Dict[str, Any]) -> None:
    filename = get_order_filename(order["orderId"])
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "w") as f:
        json.dump(order, f, indent=2)
    logger.info(f"Order saved: {filename}")


def load_order(order_id: str) -> Optional[Dict[str, Any]]:
    filename = get_order_filename(order_id)
    try:
        with open(filename, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return None


 
 

STATUS_FLOW = ["received", "confirmed", "preparing", "out_for_delivery", "delivered"]
STATUS_THRESHOLDS = [0, 30, 60, 90, 120]  # seconds


def progress_order_status_by_time(order: Dict[str, Any]) -> Dict[str, Any]:
    ts_str = order.get("timestamp")
    if not ts_str:
        return order

    try:
        created_at = datetime.fromisoformat(ts_str.replace("Z", ""))
    except Exception:
        return order

    elapsed = (datetime.utcnow() - created_at).total_seconds()

    # determine target index
    target_idx = max(
        i for i, threshold in enumerate(STATUS_THRESHOLDS) if elapsed >= threshold
    )
    target_status = STATUS_FLOW[target_idx]

    current_status = order.get("status", "received")
    if current_status not in STATUS_FLOW:
        return order

    current_idx = STATUS_FLOW.index(current_status)

    # only move forward
    if target_idx > current_idx:
        order["status"] = target_status
        save_order(order)
        logger.info(f"[AUTO] {order['orderId']} → {order['status']}")

    return order


 
 

async def auto_progress_all_orders():
    """
    Automatically updates every order's status every 10 seconds.
    """
    while True:
        order_files = glob.glob("shared-data/order_*.json")

        for file in order_files:
            try:
                with open(file, "r") as f:
                    order = json.load(f)
            except:
                continue

            updated = progress_order_status_by_time(order)
            save_order(updated)

        await asyncio.sleep(10)  # RUN EVERY 10 SECONDS

 

def build_system_prompt() -> str:
    return """
You are a food and grocery ordering assistant for a fictional brand called QuickBasket.
You help users order groceries, manage their cart, handle recipe-based requests,
place orders, and check order statuses.

Always confirm cart changes clearly.
Never assume quantity unless told.
Use the provided tools for cart and order functions.
"""


 

class GroceryAgent(Agent):
    def __init__(self):
        print(">>> [AGENT INIT]")
        self.cart: List[Dict[str, Any]] = []
        self.catalog = load_catalog()
        self.recipes = load_recipes()
        super().__init__(instructions=build_system_prompt())

 
    def find_item_by_name(self, name: str):
        name = name.lower()
        return next((item for item in self.catalog if item["name"].lower() == name), None)

    def find_item_by_id(self, id: str):
        return next((item for item in self.catalog if item["id"] == id), None)

    def get_cart_item(self, id: str):
        return next((item for item in self.cart if item["id"] == id), None)

    def get_cart_summary(self) -> str:
        if not self.cart:
            return "Your cart is empty."

        lines = ["Your cart contains:"]
        total = 0

        for cart_item in self.cart:
            product = self.find_item_by_id(cart_item["id"])
            if product:
                subtotal = product["price"] * cart_item["quantity"]
                total += subtotal
                lines.append(f"- {product['name']} (x{cart_item['quantity']}) — ₹{subtotal}")

        lines.append(f"\nTotal: ₹{total}")
        return "\n".join(lines)

 

    @function_tool
    async def add_to_cart(self, ctx: RunContext, item_name: str, quantity: int = 1) -> str:
        product = self.find_item_by_name(item_name)
        if not product:
            return f"'{item_name}' is not in the catalog."

        cart_item = self.get_cart_item(product["id"])
        if cart_item:
            cart_item["quantity"] += quantity
        else:
            self.cart.append({"id": product["id"], "quantity": quantity})

        return f"Added {quantity} × {product['name']}.\n{self.get_cart_summary()}"

    @function_tool
    async def remove_from_cart(self, ctx: RunContext, item_name: str, quantity: int = None):
        product = self.find_item_by_name(item_name)
        if not product:
            return f"'{item_name}' is not in your cart."

        cart_item = self.get_cart_item(product["id"])
        if not cart_item:
            return f"'{item_name}' is not in your cart."

        if quantity is None or quantity >= cart_item["quantity"]:
            self.cart.remove(cart_item)
            return f"Removed all {product['name']}.\n{self.get_cart_summary()}"

        cart_item["quantity"] -= quantity
        return f"Removed {quantity} × {product['name']}.\n{self.get_cart_summary()}"

    @function_tool
    async def update_cart_quantity(self, ctx: RunContext, item_name: str, quantity: int):
        product = self.find_item_by_name(item_name)
        if not product:
            return f"'{item_name}' is not in the catalog."

        cart_item = self.get_cart_item(product["id"])
        if not cart_item:
            return f"{product['name']} is not in your cart."

        if quantity <= 0:
            self.cart.remove(cart_item)
            return f"Removed {product['name']} from your cart."

        cart_item["quantity"] = quantity
        return f"Updated quantity.\n{self.get_cart_summary()}"

    @function_tool
    async def show_cart(self, ctx: RunContext):
        return self.get_cart_summary()

    @function_tool
    async def add_recipe_ingredients(self, ctx: RunContext, recipe_name: str):
        key = recipe_name.lower().replace(" ", "_")

        if key not in self.recipes:
            return f"No recipe found for '{recipe_name}'."

        added = []
        for id in self.recipes[key]:
            item = self.find_item_by_id(id)
            if not item:
                continue

            cart_item = self.get_cart_item(id)
            if cart_item:
                cart_item["quantity"] += 1
            else:
                self.cart.append({"id": id, "quantity": 1})

            added.append(item["name"])

        return f"Added ingredients for {recipe_name}: {', '.join(added)}.\n{self.get_cart_summary()}"

    @function_tool
    async def place_order(self, ctx: RunContext):
        if not self.cart:
            return "Your cart is empty."

        items = []
        total = 0

        for c in self.cart:
            p = self.find_item_by_id(c["id"])
            subtotal = p["price"] * c["quantity"]
            total += subtotal
            items.append({"id": c["id"], "qty": c["quantity"], "price": p["price"]})

        order = {
            "orderId": f"order_{uuid.uuid4().hex[:6]}",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "items": items,
            "total": total,
            "status": "received"
        }

        save_order(order)
        self.cart.clear()

        return f"Order placed! Your order ID is {order['orderId']}. Total ₹{total}."

    @function_tool
    async def check_order_status(self, ctx: RunContext, order_id: str):
        order = load_order(order_id)
        if not order:
            return f"No order found with ID {order_id}."

        order = progress_order_status_by_time(order)

        messages = {
            "received": "Your order has been received.",
            "confirmed": "Your order is confirmed and being prepared.",
            "preparing": "Your order is currently being prepared.",
            "out_for_delivery": "Your order is out for delivery.",
            "delivered": "Your order has been delivered!"
        }

        return messages.get(order["status"], f"Status: {order['status']}")

 

def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    print(">>> [BOOT] Grocery Agent starting...")

    vad = ctx.proc.userdata["vad"]

  
    asyncio.create_task(auto_progress_all_orders())

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
        agent=GroceryAgent(),
        room=ctx.room,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
