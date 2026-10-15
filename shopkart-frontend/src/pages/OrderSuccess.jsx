
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then((response) => setOrder(response.data.order))
      .catch((err) => {
        setError(
          err.response?.data?.message || "Could not load order"
        );
      });
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!order) return <p>Loading order...</p>;

  return (
    <main className="order-success">
      <h1>Order Placed Successfully!</h1>
      <p>Order ID: {order._id}</p>
      <p>Total: ₹{Number(order.totalAmount).toFixed(2)}</p>
      <p>Payment: {order.paymentStatus}</p>
      <p>Status: {order.status}</p>

      <Link to="/orders">View My Orders</Link>
      {" | "}
      <Link to="/products">Continue Shopping</Link>
    </main>
  );
}

export default OrderSuccess;