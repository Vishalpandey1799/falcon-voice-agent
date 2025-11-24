import json
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

logger = logging.getLogger("wellness_manager")

WELLNESS_LOG_FILE = "wellness_log.json"


def load_wellness_history() -> List[Dict[str, Any]]:
    """Load all wellness check-in history from JSON file."""
    try:
        if Path(WELLNESS_LOG_FILE).exists():
            with open(WELLNESS_LOG_FILE, "r") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        return []
    except Exception as e:
        logger.error(f"Failed to load wellness history: {e}")
        return []


def save_wellness_checkin(mood: str, energy: str, objectives: List[str], summary: str = None) -> Dict[str, Any]:
    """Save a wellness check-in to the JSON file."""
    check_in_data = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "time": datetime.now().strftime("%H:%M:%S"),
        "mood": mood,
        "energy": energy,
        "objectives": objectives,
        "summary": summary,
    }
    
    try:
        history = load_wellness_history()
        history.append(check_in_data)
        
        with open(WELLNESS_LOG_FILE, "w") as f:
            json.dump(history, f, indent=2)
        
        logger.info(f"Wellness check-in saved: {check_in_data}")
        return check_in_data
    except Exception as e:
        logger.error(f"Failed to save wellness check-in: {e}")
        raise


def get_last_checkin() -> Optional[Dict[str, Any]]:
    """Get the most recent wellness check-in."""
    history = load_wellness_history()
    if history:
        return history[-1]
    return None


def format_history_for_context() -> str:
    """Format recent wellness history for agent context."""
    last = get_last_checkin()
    if not last:
        return "No previous wellness check-ins."
    
    date = last.get("date", "Unknown")
    mood = last.get("mood", "Unknown")
    energy = last.get("energy", "Unknown")
    objectives = last.get("objectives", [])
    obj_str = ", ".join(objectives) if objectives else "None"
    
    return f"Previous check-in ({date}): Mood was {mood}, Energy was {energy}, Goals were: {obj_str}"
