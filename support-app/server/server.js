const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path"); 
let simulateNextCancellationFailure = false;

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, "..", "data");

function readData(fileName) {
  const filePath = path.join(dataPath, fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

app.get("/api/orders", (req, res) => {
  res.json(readData("orders.json"));
}); 
app.post("/api/test/fail-next-cancellation", (req, res) => {
  simulateNextCancellationFailure = true;

  res.json({
    success: true,
    message: "The next cancellation request will simulate a transient failure."
  });
});

app.get("/api/orders/:id", (req, res) => {
  const orders = readData("orders.json");
  const order = orders.find((item) => item.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  res.json(order);
});

app.get("/api/customers", (req, res) => {
  res.json(readData("customers.json"));
});

app.get("/api/policies", (req, res) => {
  res.json(readData("policies.json"));
});

app.post("/api/orders/:id/cancel", (req, res) => {
  const orders = readData("orders.json");
  const orderIndex = orders.findIndex((item) => item.id === req.params.id);

  if (orderIndex === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  const order = orders[orderIndex]; 
  if (simulateNextCancellationFailure) {
  simulateNextCancellationFailure = false;

  orders[orderIndex] = {
    ...order,
    status: "cancelled",
    cancellationEligible: false
  };

  fs.writeFileSync(
    path.join(dataPath, "orders.json"),
    JSON.stringify(orders, null, 2)
  );

  return res.status(503).json({
    error: "Temporary support portal failure after the cancellation was processed."
  });
}

  if (!order.cancellationEligible || order.status !== "processing") {
    return res.status(400).json({
      error: "Order is not eligible for cancellation"
    });
  }

  orders[orderIndex] = {
    ...order,
    status: "cancelled",
    cancellationEligible: false
  };

  fs.writeFileSync(
    path.join(dataPath, "orders.json"),
    JSON.stringify(orders, null, 2)
  );

  res.json({
    success: true,
    message: "Order cancelled successfully",
    order: orders[orderIndex]
  });
});
app.post("/api/orders/:id/refund", (req, res) => {
  const orders = readData("orders.json");
  const orderIndex = orders.findIndex((item) => item.id === req.params.id);

  if (orderIndex === -1) {
    return res.status(404).json({
      error: "Order not found"
    });
  }

  const order = orders[orderIndex];

  if (!order.refundEligible) {
    return res.status(400).json({
      error: "Order is not eligible for a refund"
    });
  }

  if (order.refundIssued) {
    return res.status(400).json({
      error: "Refund has already been issued"
    });
  }

  orders[orderIndex] = {
    ...order,
    refundIssued: true
  };

  fs.writeFileSync(
    path.join(dataPath, "orders.json"),
    JSON.stringify(orders, null, 2)
  );

  res.json({
    success: true,
    message: "Refund issued successfully",
    order: orders[orderIndex]
  });
});

app.listen(PORT, () => {
  console.log(`Support portal API running on http://localhost:${PORT}`);
});