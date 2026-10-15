import { useNavigate } from "react-router-dom";
import api from "../services/api";

function WishlistCard({ product, onRemove }) {
  const navigate = useNavigate();

  const removeProduct = async () => {
    try {
      await api.delete(`/wishlist/${product._id}`);

      onRemove(product._id);

    } catch (error) {
      alert("Unable to remove product.");
    }
  };

  return (
    <div className="product-card">

      <img
        src={product.image}
        alt={product.name}
      />

      <h2>{product.name}</h2>

      <p>{product.category}</p>

      <h3>₹{product.price}</h3>

      <p>
        {product.stock > 0
          ? `${product.stock} units left`
          : "Out of stock"}
      </p>

      <button
        onClick={() =>
          navigate(`/products/${product._id}`)
        }
      >
        View Details
      </button>

      <button onClick={removeProduct}>
        Remove from Wishlist
      </button>

    </div>
  );
}

export default WishlistCard;