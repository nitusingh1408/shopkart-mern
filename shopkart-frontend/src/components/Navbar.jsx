
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const { cartCount, clearCart } = useCart();

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearCart();
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <Link to="/home" className="navbar-brand">
        ShopKart
      </Link>

      <div className="navbar-links">
        <Link to="/products">Products</Link>
        <Link to="/wishlist">Wishlist</Link>
        <Link to="/cart">Cart ({cartCount})</Link>
        <Link to="/orders">My Orders</Link>

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;