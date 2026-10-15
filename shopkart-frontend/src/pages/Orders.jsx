
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/orders")
      .then((response) => setOrders(response.data.orders))
      .catch((err) => {
        setError(
          err.response?.data?.message || "Could not load orders"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading your orders...</p>;

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (orders.length === 0) {
    return (
      <main>
        <h1>My Orders</h1>
        <p>You have not placed any orders yet.</p>
        <Link to="/products">Start Shopping</Link>
      </main>
    );
  }

  return (
    <main>
      <h1>My Orders</h1>

      {orders.map((order) => (
        <article className="order-card" key={order._id}>
          <h2>Order #{order._id}</h2>

          <p>
            {new Date(order.createdAt).toLocaleString()}
          </p>

          {order.items.map((item, index) => (
            <p key={`${order._id}-${index}`}>
              {item.name} × {item.quantity} — ₹
              {(item.price * item.quantity).toFixed(2)}
            </p>
          ))}

          <h3>
            Total: ₹{Number(order.totalAmount).toFixed(2)}
          </h3>

          <p>Payment: {order.paymentStatus}</p>
          <p>Status: {order.status}</p>

          <Link to={`/order-success/${order._id}`}>
            View Details
          </Link>
        </article>
      ))}
    </main>
  );
}

export default Orders;