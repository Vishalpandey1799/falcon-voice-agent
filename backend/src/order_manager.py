# order_manager.py
import json
import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger("order_manager")

def save_order_to_json(drink_type, size, milk, extras, name):
    """
    Saves the order details to JSON files.
    - orders_history.json: Appends to array for multiple orders
    - order_summary.json: Latest order only (for UI quick access)
    """
    order_data = {
        "id": int(datetime.now().timestamp() * 1000),
        "drinkType": drink_type,
        "size": size,
        "milk": milk,
        "extras": extras,
        "name": name,
        "timestamp": datetime.now().isoformat()
    }
    
    # Save to orders history (all orders)
    orders_file = "orders_history.json"
    try:
        if Path(orders_file).exists():
            with open(orders_file, "r") as f:
                orders = json.load(f)
                if not isinstance(orders, list):
                    orders = []
        else:
            orders = []
        
        orders.append(order_data)
        
        with open(orders_file, "w") as f:
            json.dump(orders, f, indent=2)
        
        logger.info(f"Order added to {orders_file}: {order_data}")
    except Exception as e:
        logger.error(f"Failed to save to {orders_file}: {e}")
    
    # Also save latest order to order_summary.json for UI quick access
    summary_file = "order_summary.json"
    try:
        with open(summary_file, "w") as f:
            json.dump(order_data, f, indent=2)
        
        logger.info(f"Latest order saved to {summary_file}: {order_data}")
        return "Order saved successfully."
    except Exception as e:
        logger.error(f"Failed to save to {summary_file}: {e}")
        return "Failed to save order."