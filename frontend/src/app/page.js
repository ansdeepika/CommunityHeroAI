"use client";

import { useState } from "react";

export default function Home() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [result, setResult] = useState(null);
  const [complaint, setComplaint] = useState("");

  const [loading, setLoading] = useState(false);

  const [location, setLocation] = useState(null);

  const parseResult = (text) => {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        alert("Unable to fetch location");
      }
    );
  };

  const analyzeText = async () => {
    if (!description.trim()) {
      alert("Please enter issue description");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://communityhero-backend-787820491307.asia-south1.run.app/analyze?description=${encodeURIComponent(
          description
        )}`
      );

      const data = await response.json();

      setResult(parseResult(data.result));
      setComplaint("");
    } catch (err) {
      console.log(err);
      alert("Analysis failed");
    }

    setLoading(false);
  };

  const analyzeImage = async () => {
    if (!image) {
      alert("Please select image");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", image);

      const response = await fetch(
        "https://communityhero-backend-787820491307.asia-south1.run.app/analyze-image",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      setResult(parseResult(data.result));
      setComplaint("");
    } catch (err) {
      console.log(err);
      alert("Image analysis failed");
    }

    setLoading(false);
  };

  const generateComplaint = async () => {
    if (!result) return;

    setLoading(true);

    try {
      const response = await fetch(
        "https://communityhero-backend-787820491307.asia-south1.run.app/generate-complaint",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...result,
            location,
          }),
        }
      );

      const data = await response.json();

setComplaint(data.complaint);

const oldComplaints =
  JSON.parse(
    localStorage.getItem("complaints")
  ) || [];

oldComplaints.push({
  ...result,
  complaint_id: data.complaint_id,
  timestamp: data.timestamp,
  status: "Reported",
});

localStorage.setItem(
  "complaints",
  JSON.stringify(oldComplaints)
);

if (data.complaint_id) {
  setResult((prev) => ({
    ...prev,
    complaint_id: data.complaint_id,
    timestamp: data.timestamp,
  }));
}
    } catch (err) {
      console.log(err);
      alert("Complaint generation failed");
    }

    setLoading(false);
  };

  const downloadComplaint = async () => {
    if (!result) return;

    try {
      const response = await fetch(
        "https://communityhero-backend-787820491307.asia-south1.run.app/download-complaint",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...result,
            location,
          }),
        }
      );

      if (!response.ok) {
        alert("PDF download failed");
        return;
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "complaint.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log(err);
      alert("PDF download failed");
    }
  };

  const severityColor = (severity) => {
    if (severity === "High") return "bg-red-500";
    if (severity === "Medium") return "bg-yellow-500";
    return "bg-green-500";
  };
  const resolutionTime = (severity) => {
  if (severity === "High") return "24 Hours";
  if (severity === "Medium") return "3 Days";
  return "7 Days";
};

const riskLevel = (score) => {
  if (score >= 80) return "Critical";
  if (score >= 50) return "Moderate";
  return "Low";
};

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-blue-700">
            Community Hero AI
          </h1>

          <p className="text-gray-600 mt-4 text-lg">
            AI Powered Civic Issue Reporting System
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Describe Issue
          </h2>

          <textarea
            className="border rounded-lg p-4 w-full"
            rows="5"
            placeholder="Describe civic issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            onClick={analyzeText}
            className="bg-black text-white px-6 py-3 rounded-lg mt-4"
          >
            Analyze Text
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Upload Image
          </h2>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setImage(e.target.files[0]);

              if (e.target.files[0]) {
                setImagePreview(
                  URL.createObjectURL(e.target.files[0])
                );
              }
            }}
          />

          {imagePreview && (
            <img
              src={imagePreview}
              alt="preview"
              className="mt-5 rounded-lg max-h-72"
            />
          )}

          <button
            onClick={analyzeImage}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg mt-5"
          >
            Analyze Image
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Location
          </h2>

          <button
            onClick={getLocation}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg"
          >
            Get Current Location
          </button>

          {location && (
            <div className="mt-4">
              <p>
                Latitude: {location.latitude}
              </p>

              <p>
                Longitude: {location.longitude}
              </p>

              <a
                href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                target="_blank"
                className="text-blue-600 underline"
              >
                Open in Google Maps
              </a>
              <div className="mt-5">
  <iframe
    width="100%"
    height="300"
    style={{ border: 0 }}
    loading="lazy"
    allowFullScreen
    src={`https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`}
  />
</div>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center text-xl font-bold text-blue-600 mb-6">
            Processing...
          </div>
        )}

        {result && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-5">
              Analysis Result
            </h2>

            <p>
              <strong>Issue Type:</strong> {result.issue_type}
            </p>

            <p className="mt-3">
              <strong>Severity:</strong>

              <span
                className={`ml-3 text-white px-3 py-1 rounded-full ${severityColor(
                  result.severity
                )}`}
              >
                {result.severity}
              </span>
            </p>

            <p className="mt-3">
              <strong>Priority Score:</strong>{" "}
              {result.priority_score}
            </p>
            <div className="mt-4 bg-red-50 p-4 rounded-lg">
  <strong>Community Risk Index:</strong>{" "}

  {result.priority_score > 80
    ? "Critical"
    : result.priority_score > 50
    ? "Moderate"
    : "Low"}
</div>
            <div className="w-full bg-gray-300 rounded-full h-5 mt-2 mb-5">
              <div
                className="bg-red-500 h-5 rounded-full"
                style={{
                  width: `${result.priority_score}%`,
                }}
              />
            </div>

            <p>
              <strong>Department:</strong>{" "}
              {result.department}
            </p>

            <p className="mt-3">
  <strong>Description:</strong>{" "}
  {result.description}
</p>
<div className="bg-blue-50 p-5 rounded-lg mt-6">
  <h3 className="font-bold text-lg mb-3 text-blue-700">
    AI Recommended Action Plan
  </h3>

  <ol className="list-decimal ml-5 space-y-2">
    <li>Notify {result.department}</li>
    <li>Mark issue as {result.severity} priority</li>
    <li>Schedule field inspection</li>
    <li>Assign repair/maintenance team</li>
    <li>Citizen follow-up after resolution</li>
  </ol>
</div>
<div className="bg-white border rounded-lg p-5 mt-6">
  <h3 className="font-bold text-lg mb-4">
    Resolution Workflow
  </h3>

  <div className="flex flex-wrap gap-3">

    <div className="bg-green-500 text-white px-4 py-2 rounded">
      Reported ✓
    </div>

    <div className="bg-green-500 text-white px-4 py-2 rounded">
      AI Reviewed ✓
    </div>

    <div className="bg-yellow-500 text-white px-4 py-2 rounded">
      Assigned
    </div>

    <div className="bg-gray-400 text-white px-4 py-2 rounded">
      In Progress
    </div>

    <div className="bg-gray-400 text-white px-4 py-2 rounded">
      Resolved
    </div>

  </div>
</div>
<div className="bg-white border rounded-lg p-5 mt-6">
  <h3 className="font-bold text-lg mb-4">
    Resolution Workflow
  </h3>

  <div className="flex flex-wrap gap-3">

    <div className="bg-green-500 text-white px-4 py-2 rounded">
      Reported ✓
    </div>

    <div className="bg-green-500 text-white px-4 py-2 rounded">
      AI Reviewed ✓
    </div>

    <div className="bg-yellow-500 text-white px-4 py-2 rounded">
      Assigned
    </div>

    <div className="bg-gray-400 text-white px-4 py-2 rounded">
      In Progress
    </div>

    <div className="bg-gray-400 text-white px-4 py-2 rounded">
      Resolved
    </div>

  </div>
</div>

<div className="grid md:grid-cols-3 gap-4 mt-6">

  <div className="bg-blue-50 p-4 rounded-lg">
    <p className="font-bold text-blue-700">
      Estimated Resolution
    </p>

    <p>
      {resolutionTime(result.severity)}
    </p>
  </div>

  <div className="bg-red-50 p-4 rounded-lg">
    <p className="font-bold text-red-700">
      Risk Level
    </p>

    <p>
      {riskLevel(result.priority_score)}
    </p>
  </div>

  <div className="bg-green-50 p-4 rounded-lg">
    <p className="font-bold text-green-700">
      Department
    </p>

    <p>
      {result.department}
    </p>
  </div>

</div>

            {result.complaint_id && (
              <>
                <p className="mt-3">
                  <strong>Complaint ID:</strong>{" "}
                  {result.complaint_id}
                </p>

                <p className="mt-2">
                  <strong>Timestamp:</strong>{" "}
                  {result.timestamp}
                </p>
              </>
            )}

            <div className="flex gap-4 mt-6 flex-wrap">
              <button
                onClick={generateComplaint}
                className="bg-green-600 text-white px-6 py-3 rounded-lg"
              >
                Generate Complaint
              </button>

              <button
                onClick={downloadComplaint}
                className="bg-red-600 text-white px-6 py-3 rounded-lg"
              >
                Download PDF
              </button>
              <button
  onClick={() => {
    navigator.clipboard.writeText(
      complaint || JSON.stringify(result, null, 2)
    );

    alert("Copied Successfully");
  }}
  className="bg-purple-600 text-white px-6 py-3 rounded-lg"
>
  Copy Report
</button>
            </div>
          </div>
        )}

        {complaint && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-5">
              Complaint Letter
            </h2>

            <pre className="whitespace-pre-wrap text-gray-700">
              {complaint}
            </pre>
          </div>
        )}

      </div>
    </main>
  );
}