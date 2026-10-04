const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  executeGoal,
  executeApprovedPlan
} = require("./services/operator");

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5174";

app.use(
  cors({
    origin: CLIENT_URL
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "computer-operator"
  });
});

app.post("/api/operator/run", async (req, res) => {
  const { goal } = req.body;

  if (!goal || typeof goal !== "string") {
    return res.status(400).json({
      success: false,
      error: "A plain-English goal is required."
    });
  }

  try {
    const result = await executeGoal(goal);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

 app.post("/api/operator/approval", async (req, res) => {
  const { approved, plan } = req.body;

  if (typeof approved !== "boolean" || !plan) {
    return res.status(400).json({
      success: false,
      error: "Approval decision and plan are required."
    });
  }

  if (!approved) {
    return res.json({
      success: false,
      stage: "approval",
      message: `Refund action for order #${plan.orderId} was rejected by the user.`,
      plan
    });
  }

  try {
    const result = await executeApprovedPlan(plan);

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      stage: "execution",
      error: error.message,
      plan
    });
  }
});
app.listen(PORT, () => {
  console.log(`Computer operator API running on http://localhost:${PORT}`);
});