
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Cart() {
  const {
    cartItems,
    loading,
    error,
    cartCount,
    subtotal,
    refreshCart,
    updateQuantity,
    removeFromCart
  } = useCart();

  const navigate = useNavigate();

  const [busyProductId, setBusyProductId] = useState("");
  const [actionError, setActionError] = useState("");

  const handleQuantity = async (productId, quantity) => {
    try {
      setBusyProductId(productId);
      setActionError("");

      await updateQuantity(productId, quantity);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Unable to update quantity."
      );
    } finally {
      setBusyProductId("");
    }
  };

  const handleRemove = async (productId) => {
    try {
      setBusyProductId(productId);
      setActionError("");

      await removeFromCart(productId);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Unable to remove product."
      );
    } finally {
      setBusyProductId("");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="cart-page">
          <p>Loading your cart...</p>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="cart-page">
          <p className="error-message">{error}</p>
          <button type="button" onClick={refreshCart}>
            Try Again
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="cart-page">
        <h1>My Cart</h1>

        {actionError && (
          <p className="error-message">{actionError}</p>
        )}

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <h2>Your cart is empty 🛒</h2>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/products">Browse Products</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-items">
              {cartItems.map((item) => {
                const product = item.product;

                if (!product) return null;

                const itemBusy = busyProductId === product._id;

                return (
                  <article
                    className="cart-item"
                    key={product._id}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="cart-image"
                    />

                    <div className="cart-item-details">
                      <h3>{product.name}</h3>

                      <p>
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </p>

                      <p>
                        Item total: ₹
                        {(
                          Number(product.price) * item.quantity
                        ).toLocaleString("en-IN")}
                      </p>

                      <div className="quantity-controls">
                        <button
                          type="button"
                          disabled={itemBusy || item.quantity <= 1}
                          onClick={() =>
                            handleQuantity(
                              product._id,
                              item.quantity - 1
                            )
                          }
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          disabled={
                            itemBusy ||
                            item.quantity >= product.stock
                          }
                          onClick={() =>
                            handleQuantity(
                              product._id,
                              item.quantity + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={itemBusy}
                        onClick={() => handleRemove(product._id)}
                      >
                        {itemBusy ? "Please wait..." : "Remove"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="cart-summary">
              <h2>Order Summary</h2>

              <p>Total units: {cartCount}</p>

              <p>
                Subtotal: ₹
                {subtotal.toLocaleString("en-IN")}
              </p>

              <button
                onClick={() => navigate("/checkout")}
                disabled={!cartItems || cartItems.length === 0}
              >
              Proceed to Checkout
              </button>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

export default Cart;