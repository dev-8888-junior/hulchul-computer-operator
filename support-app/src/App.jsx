import { useEffect, useState } from "react";

const API_URL = "http://localhost:4000";

function App() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/orders`)
      .then((response) => response.json())
      .then((data) => setOrders(data))
      .catch(() => setMessage("Unable to load orders."));
  }, []);

  const viewOrder = (order) => {
    setSelectedOrder(order);
    setMessage("");
  };

  const cancelOrder = async () => {
    if (!selectedOrder) return;

    const response = await fetch(
      `${API_URL}/api/orders/${selectedOrder.id}/cancel`,
      {
        method: "POST"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error);
      return;
    }

    setSelectedOrder(data.order);

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === data.order.id ? data.order : order
      )
    );

    setMessage(data.message);
  }; 
  const refundOrder = async () => {
  if (!selectedOrder) return;

  const response = await fetch(
    `${API_URL}/api/orders/${selectedOrder.id}/refund`,
    {
      method: "POST"
    }
  );

  const data = await response.json();

  if (!response.ok) {
    setMessage(data.error);
    return;
  }

  setSelectedOrder(data.order);

  setOrders((currentOrders) =>
    currentOrders.map((order) =>
      order.id === data.order.id ? data.order : order
    )
  );

  setMessage(data.message);
};

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>Customer Support Portal</h1>

      <p>Orders</p>

      <div>
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ccc",
              padding: "16px",
              marginBottom: "12px",
              borderRadius: "8px"
            }}
          >
            <strong>Order #{order.id}</strong>
            <p>{order.customerName}</p>
            <p>{order.product}</p>
            <p>Status: {order.status}</p>

            <button onClick={() => viewOrder(order)}>
              View Order
            </button>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "2px solid #333",
            borderRadius: "8px"
          }}
        >
          <h2>Order #{selectedOrder.id}</h2>

          <p>
            <strong>Customer:</strong> {selectedOrder.customerName}
          </p>

          <p>
            <strong>Product:</strong> {selectedOrder.product}
          </p>

          <p>
            <strong>Price:</strong> ₹{selectedOrder.price}
          </p>

          <p>
            <strong>Status:</strong> {selectedOrder.status}
          </p>

          <p>
            <strong>Customer Request:</strong>{" "}
            {selectedOrder.customerRequest}
          </p>

          {selectedOrder.cancellationEligible && (
            <button onClick={cancelOrder}>
              Cancel Order
            </button>
          )}  
          {selectedOrder.refundEligible && !selectedOrder.refundIssued && (
  <button onClick={refundOrder}>Issue Refund</button>
)}

          {message && (
            <p style={{ marginTop: "15px" }}>
              <strong>{message}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;