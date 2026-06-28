import os
import tempfile

from fastapi import FastAPI, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
)
from reportlab.lib.styles import getSampleStyleSheet

try:
    from .vision_agent import (
        analyze_issue,
        analyze_image,
        generate_complaint,
    )
except ImportError:  # pragma: no cover - supports direct script execution
    from vision_agent import (
        analyze_issue,
        analyze_image,
        generate_complaint,
    )

app = FastAPI()

# Temporary in-memory storage for hackathon demo
complaints_db = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Community Hero AI Backend Running"
    }


@app.get("/analyze")
def analyze(description: str):
    result = analyze_issue(description)

    return {
        "result": result
    }


@app.post("/analyze-image")
async def analyze_image_endpoint(
    file: UploadFile = File(...)
):
    try:
        contents = await file.read()

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".jpg"
        ) as temp:
            temp.write(contents)
            temp_path = temp.name

        result = analyze_image(temp_path)

        try:
            os.remove(temp_path)
        except:
            pass

        return {
            "result": result
        }

    except Exception as e:
        print("ANALYZE IMAGE ERROR:", e)

        return {
            "result": """
{
  "issue_type":"Other",
  "severity":"Low",
  "priority_score":0,
  "department":"Unknown",
  "description":"Image analysis failed"
}
"""
        }


@app.post("/generate-complaint")
def complaint(
    data: dict = Body(...)
):
    result = generate_complaint(data)

    complaints_db.append({
        "complaint_id": result["complaint_id"],
        "timestamp": result["timestamp"],
        "issue_type": data.get("issue_type"),
        "severity": data.get("severity"),
        "department": data.get("department"),
        "description": data.get("description"),
        "status": "Pending"
    })

    return {
        "complaint": result["complaint"],
        "complaint_id": result["complaint_id"],
        "timestamp": result["timestamp"]
    }


@app.post("/download-complaint")
def download_complaint(
    data: dict = Body(...)
):
    result = generate_complaint(data)

    complaint_text = result["complaint"]

    pdf_path = "complaint.pdf"

    doc = SimpleDocTemplate(pdf_path)

    styles = getSampleStyleSheet()

    story = []

    for line in complaint_text.split("\n"):
        story.append(
            Paragraph(
                line,
                styles["Normal"]
            )
        )

        story.append(
            Spacer(
                1,
                8
            )
        )

    doc.build(story)

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename="complaint.pdf"
    )


@app.get("/admin/complaints")
def admin_complaints():

    total = len(complaints_db)

    pending = len(
        [c for c in complaints_db if c["status"] == "Pending"]
    )

    resolved = len(
        [c for c in complaints_db if c["status"] == "Resolved"]
    )

    return {
        "total": total,
        "pending": pending,
        "resolved": resolved,
        "complaints": complaints_db
    }


@app.post("/admin/resolve/{complaint_id}")
def resolve_complaint(complaint_id: str):

    for complaint in complaints_db:
        if complaint["complaint_id"] == complaint_id:
            complaint["status"] = "Resolved"
            return {
                "message": "Complaint Resolved"
            }

    return {
        "message": "Complaint Not Found"
    }