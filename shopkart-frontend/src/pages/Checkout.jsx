
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, refreshCart } = useCart();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value
    });
  };

  const validateAddress = () => {
    for (const [key, value] of Object.entries(address)) {
      if (!value.trim()) {
        return `${key} is required`;
      }
    }

    if (!/^[0-9]{10}$/.test(address.phone.trim())) {
      return "Phone must contain exactly 10 digits";
    }

    if (!/^[0-9]{6}$/.test(address.pincode.trim())) {
      return "Pincode must contain exactly 6 digits";
    }

    return "";
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateAddress();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Could not load Razorpay Checkout");
      }

      const { data } = await api.post(
        "/orders/create-payment-order",
        { shippingAddress: address }
      );

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Purchase",
        order_id: data.razorpayOrderId,

        prefill: {
          name: address.fullName,
          contact: address.phone
        },

        handler: async (response) => {
          try {
            const verification = await api.post(
              "/orders/verify-payment",
              {
                shopKartOrderId: data.shopKartOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            );

            if (verification.data.success) {
              await refreshCart();
              navigate(`/order-success/${data.shopKartOrderId}`);
            }
          } catch (err) {
            setError(
              err.response?.data?.message ||
              "Payment verification failed. Do not retry blindly; check your order status."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => setLoading(false)
        },

        theme: {
          color: "#2563eb"
        }
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", (response) => {
        setError(
          response.error?.description ||
          "Payment failed. Your cart has not been cleared."
        );
        setLoading(false);
      });

      paymentObject.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Could not start checkout"
      );
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
        <button onClick={() => navigate("/products")}>
          Continue Shopping
        </button>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <h1>Checkout</h1>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handlePlaceOrder}>
        <h2>Shipping Details</h2>

        <input
          name="fullName"
          placeholder="Full Name"
          value={address.fullName}
          onChange={handleChange}
          required
        />

        <input
          name="phone"
          placeholder="10-digit Phone Number"
          value={address.phone}
          onChange={handleChange}
          inputMode="numeric"
          maxLength={10}
          required
        />

        <input
          name="addressLine1"
          placeholder="Address"
          value={address.addressLine1}
          onChange={handleChange}
          required
        />

        <input
          name="city"
          placeholder="City"
          value={address.city}
          onChange={handleChange}
          required
        />

        <input
          name="state"
          placeholder="State"
          value={address.state}
          onChange={handleChange}
          required
        />

        <input
          name="pincode"
          placeholder="6-digit Pincode"
          value={address.pincode}
          onChange={handleChange}
          inputMode="numeric"
          maxLength={6}
          required
        />

        <h2>Order Summary</h2>

        {cartItems.map((item) => {
          const product = item.product || item;
          const quantity = Number(item.quantity || 1);

          return (
            <div key={product._id}>
              <p>
                {product.name} × {quantity}
              </p>
              <p>
                ₹{(Number(product.price) * quantity).toFixed(2)}
              </p>
            </div>
          );
        })}

        <h3>Estimated total: ₹{Number(subtotal).toFixed(2)}</h3>
        <p>The final amount is calculated again by the server.</p>

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Pay with Razorpay"}
        </button>
      </form>
    </main>
  );
}

export default Checkout;