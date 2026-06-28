import google.generativeai as genai
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
else:
    model = None


def clean_json(text):
    return (
        text.replace("```json", "")
        .replace("```", "")
        .strip()
    )


def analyze_issue(description):
    prompt = f"""
You are a civic infrastructure inspector.

Determine:
- issue_type
- severity
- priority_score
- department
- description

Choose issue_type ONLY from:
- Road Damage
- Garbage Dump
- Water Leakage
- Streetlight Failure
- Drainage Issue
- Illegal Dumping
- Traffic Signal Issue
- Other

Issue:
{description}

Return ONLY JSON.

Format:
{{
  "issue_type":"string",
  "severity":"Low|Medium|High",
  "priority_score":0,
  "department":"string",
  "description":"string"
}}
"""

    if not model:
        return """
{
  "issue_type":"Other",
  "severity":"Low",
  "priority_score":0,
  "department":"Unknown",
  "description":"GEMINI_API_KEY not configured"
}
"""

    try:
        response = model.generate_content(prompt)
        return clean_json(response.text)

    except Exception as e:
        print("TEXT ERROR:", e)

        return """
{
  "issue_type":"Other",
  "severity":"Low",
  "priority_score":0,
  "department":"Unknown",
  "description":"Failed to analyze issue"
}
"""


def analyze_image(image_path):
    if not model:
        return """
    {
        "issue_type":"Other",
        "severity":"Low",
        "priority_score":0,
        "department":"Unknown",
        "description":"GEMINI_API_KEY not configured"
        }
"""

    try:
        image = Image.open(image_path)

        prompt = """
You are a civic infrastructure inspector.

Determine:
- issue_type
- severity
- priority_score
- department
- description

Choose issue_type ONLY from:
- Road Damage
- Garbage Dump
- Water Leakage
- Streetlight Failure
- Drainage Issue
- Illegal Dumping
- Traffic Signal Issue
- Other

Analyze this image.

Return ONLY JSON.

Format:
{
  "issue_type":"string",
  "severity":"Low|Medium|High",
  "priority_score":0,
  "department":"string",
  "description":"string"
}
"""

        response = model.generate_content([prompt, image])

        image.close()

        return clean_json(response.text)

    except Exception as e:
        print("IMAGE ERROR FULL:", str(e))
        return f"""
    {{
        "issue_type":"Other",
        "severity":"Low",
        "priority_score":0,
        "department":"Unknown",
        "description":"{str(e)}"
        }}
"""


def generate_complaint(issue_data):
    complaint_id = "CHA-" + str(uuid.uuid4())[:8].upper()

    timestamp = datetime.now().strftime(
        "%d-%m-%Y %H:%M:%S"
    )

    location_text = "Location not provided"

    if issue_data.get("location"):
        location = issue_data["location"]

        location_text = (
            f"{location['latitude']}, "
            f"{location['longitude']}"
        )

    complaint_text = f"""
Complaint ID: {complaint_id}
Reported On: {timestamp}

To,
The {issue_data['department']}

Subject: Complaint regarding {issue_data['issue_type']}

Respected Sir/Madam,

I would like to bring to your attention a civic issue regarding
{issue_data['issue_type']}.

Issue Description:
{issue_data['description']}

Severity Level: {issue_data['severity']}
Priority Score: {issue_data['priority_score']}

Issue Location:
{location_text}

I kindly request the concerned department to inspect the issue and take necessary action as soon as possible.

Thank you.

Sincerely,
Concerned Citizen
"""

    return {
        "complaint": complaint_text,
        "complaint_id": complaint_id,
        "timestamp": timestamp
    }