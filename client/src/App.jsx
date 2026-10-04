import { useState } from "react";

function App() {
const [goal, setGoal] = useState("");
const [result, setResult] = useState(null);
const [loading, setLoading] = useState(false);
const [approvalPending, setApprovalPending] = useState(false);

const handleApproval = async (approved) => {
if (!result?.plan) return;

try {
  const response = await fetch(
    "http://localhost:5000/api/operator/approval",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        approved,
        plan: result.plan
      })
    }
  );

  const data = await response.json();

  setResult(data);
  setApprovalPending(false);
} catch (error) {
  setResult({
    success: false,
    error: "Unable to submit the approval decision."
  });
}

};

const runOperator = async () => {
if (!goal.trim()) return;

setLoading(true);
setResult(null);

try {
  const response = await fetch(
    "http://localhost:5000/api/operator/run",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ goal })
    }
  );

  const data = await response.json();

  setResult(data);
  setApprovalPending(data.requiresApproval === true);
} catch (error) {
  setResult({
    success: false,
    error: "Unable to connect to the computer operator."
  });
} finally {
  setLoading(false);
}

};

return (
<div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
<h1>Computer Operator</h1>

  <p>
    Describe the business task you want the operator to complete.
  </p>

  <textarea
    value={goal}
    onChange={(event) => setGoal(event.target.value)}
    placeholder="Example: Review order #1057. If it can be cancelled, cancel it."
    rows={5}
    style={{
      width: "100%",
      maxWidth: "700px",
      padding: "12px",
      fontSize: "16px"
    }}
  />

  <br />
  <br />

  <button
    onClick={runOperator}
    disabled={loading || !goal.trim()}
  >
    {loading ? "Operator Running..." : "Run Operator"}
  </button>

  {result && (
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        maxWidth: "700px"
      }}
    >
      <h2>
        {result.success ? "Task Completed" : "Task Not Completed"}
      </h2>

      {result.error && <p>{result.error}</p>}

      {result.message && <p>{result.message}</p>}

      {result.recovery && (
        <p>
          <strong>Recovery:</strong> {result.recovery}
        </p>
      )}

      {approvalPending && (
        <div style={{ marginTop: "20px" }}>
          <p>
            <strong>Human approval required.</strong>
          </p>

          <button
            onClick={() => handleApproval(true)}
            style={{ marginRight: "10px" }}
          >
            Approve
          </button>

          <button onClick={() => handleApproval(false)}>
            Reject
          </button>
        </div>
      )}

      {result.plan && (
        <div>
          <p>
            <strong>Order:</strong> #{result.plan.orderId}
          </p>

          <p>
            <strong>Action:</strong> {result.plan.action}
          </p>
        </div>
      )}

      {result.verification && (
        <p>
          <strong>Verification:</strong>{" "}
          {result.verification.reason}
        </p>
      )}

      {result.evidencePath && (
        <p>
          <strong>Evidence:</strong> {result.evidencePath}
        </p>
      )}
    </div>
  )}
</div>

);
}

export default App;