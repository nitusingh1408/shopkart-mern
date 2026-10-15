import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";

function Wishlist() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/wishlist");

      setWishlist(response.data.wishlist);

    } catch (error) {
      setError(
        "We couldn't load your wishlist."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWishlist();
  }, []);

  const handleRemove = (productId) => {
    setWishlist(
      wishlist.filter(
        (product) => product._id !== productId
      )
    );
  };

  return (
    <>
      <Navbar />

      <div className="wishlist-page">

        <h1>My Wishlist</h1>

        {loading && (
          <p>Loading your wishlist...</p>
        )}

        {error && (
          <div>
            <p className="error">
              Something went wrong.
            </p>

            <p>{error}</p>

            <button onClick={getWishlist}>
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          wishlist.length === 0 && (
            <div className="empty-wishlist">
              <h2>❤️</h2>

              <h2>
                Your wishlist is empty
              </h2>

              <p>
                Save products you love and
                find them here later.
              </p>

              <button
                onClick={() =>
                  navigate("/products")
                }
              >
                Browse Products
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          wishlist.length > 0 && (
            <>
              <p>
                {wishlist.length} products saved
              </p>

              <div className="products-grid">
                {wishlist.map((product) => (
                  <WishlistCard
                    key={product._id}
                    product={product}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </>
          )}

      </div>
    </>
  );
}

export default Wishlist;