import { useState } from "react";

function ReportTrailForm({ trailId, onSuccess }) {
  const [reason, setReason] = useState("offensive");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Report reason:
          <br />
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ marginTop: "0.5rem", padding: "0.5rem", width: "100%" }}
          >
            <option value="offensive">Offensive content</option>
            <option value="harassment">Harassment</option>
            <option value="hate_speech">Hate speech</option>
            <option value="spam">Spam</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Extra details:
          <br />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a short explanation"
            rows="4"
            style={{ marginTop: "0.5rem", padding: "0.5rem", width: "100%" }}
          />
        </label>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: "0.75rem 1rem",
          border: "none",
          borderRadius: "8px",
          cursor: submitting ? "not-allowed" : "pointer",
        }}
      >
        {submitting ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  );
}

export default ReportTrailForm;