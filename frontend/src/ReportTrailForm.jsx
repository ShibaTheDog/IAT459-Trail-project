// this is handling the reporting of other peoples posts

import { useState } from "react";
import "./stylesheets/report.css";

function ReportTrailForm({ trailId, onSuccess }) {
  const [reason, setReason] = useState("offensive");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // submission by sending post request to backend, using token
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/trails/${trailId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report");
      }

      setSuccess("Report submitted.");
      setMessage("");

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // visual UI for the submit form for reporting posts
  return (
    <form onSubmit={handleSubmit} className="report-form">
      <div className="report-form-group">
        <label>
          Report reason:
          <br />
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="report-form-select"
          >
            <option value="offensive">Offensive content</option>
            <option value="harassment">Harassment</option>
            <option value="hate_speech">Hate speech</option>
            <option value="spam">Spam</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>

      <div className="report-form-group">
        <label>
          Extra details:
          <br />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a short explanation"
            rows="4"
            className="report-form-textarea"
          />
        </label>
      </div>

      {error && <p className="report-form-error">{error}</p>}
      {success && <p className="report-form-success">{success}</p>}

      <button
        type="submit"
        disabled={submitting}
        className={`report-form-submit${submitting ? " report-form-submit--submitting" : ""}`}
      >
        {submitting ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  );
}

export default ReportTrailForm;
