
import os
import logging
from datetime import datetime
from typing import List, Dict, Any




import httpx

logger = logging.getLogger("notion_integration")

NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID")
NOTION_API_URL = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"

async def create_wellness_entry(
    mood: str,
    energy: str,
    objectives: List[str],
    summary: str
) -> Dict[str, Any]:
    """Create a wellness check-in entry in Notion database."""
    
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        return {
            "success": False,
            "message": "Missing NOTION_API_KEY or NOTION_DATABASE_ID in environment"
        }
    
    # Get current date and time
    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")
    
    # Create the title for the Report Card property
    title = f"Report Card - {now.strftime('%B %d, %Y')}"
    
    # Build the Notion page properties
  
    properties = {
        "Report Card": {  # Title property
            "title": [
                {
                    "text": {
                        "content": title
                    }
                }
            ]
        },
        "Date": {  # Date property
            "date": {
                "start": date_str
            }
        },
        "Time": {  # Text property
            "rich_text": [
                {
                    "text": {
                        "content": time_str
                    }
                }
            ]
        },
        "Mood": { 
            "select": {
                "name": mood
            }
        },
        "Energy": {  
            "select": {
                "name": energy
            }
        },
        "Objectives": {  # Multi-select property
            "multi_select": [
                {"name": obj} for obj in objectives
            ]
        },
        "Summary": {  # Text property
            "rich_text": [
                {
                    "text": {
                        "content": summary or ""
                    }
                }
            ]
        }
    }
    
    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION
    }
    
    payload = {
        "parent": {"database_id": NOTION_DATABASE_ID},
        "properties": properties
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{NOTION_API_URL}/pages",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            
            if response.status_code == 200:
                logger.info(f"Successfully created Notion entry: {title}")
                return {
                    "success": True,
                    "message": "Entry created successfully",
                    "page_id": response.json().get("id")
                }
            else:
                error_msg = response.json().get("message", "Unknown error")
                logger.error(f"Notion API error {response.status_code}: {error_msg}")
                return {
                    "success": False,
                    "message": f"Notion API error: {error_msg}"
                }
                
    except Exception as e:
        logger.error(f"Failed to create Notion entry: {e}")
        return {
            "success": False,
            "message": f"Exception: {str(e)}"
        }