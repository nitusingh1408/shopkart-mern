
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      setMessage("");
      setError("");

      await addToCart(product._id);

      setMessage("Added to cart!");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to add product."
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />
        <h3>{product.name}</h3>
      </Link>

      <p>{product.description}</p>

      <p className="product-price">
        ₹{Number(product.price).toLocaleString("en-IN")}
      </p>

      <p>Stock: {product.stock}</p>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={adding || product.stock < 1}
      >
        {adding ? "Adding..." : "Add to Cart"}
      </button>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default ProductCard;