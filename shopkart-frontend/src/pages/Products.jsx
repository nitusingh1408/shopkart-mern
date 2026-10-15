import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

function Products() {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products", {
        params: {
          search,
          category
        }
      });

      setProducts(response.data.products);

    } catch (error) {
      setError(
        "Something went wrong while loading products."
      );
    } finally {
      setLoading(false);
    }
  };

  const getWishlist = async () => {
    try {
      const response = await api.get("/wishlist");
      setWishlist(response.data.wishlist);
    } catch (error) {
      setWishlist([]);
    }
  };

  useEffect(() => {
    getProducts();
    getWishlist();
  }, [search, category]);

  const handleWishlistAdded = (productId) => {
    setWishlist([
      ...wishlist,
      { _id: productId }
    ]);
  };

  const isWishlisted = (productId) => {
    return wishlist.some(
      (product) => product._id === productId
    );
  };

  return (
    <div className="products-page">

      <h1>ShopKart Products</h1>

      <div className="filters">

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Books">Books</option>
          <option value="Home">Home</option>
        </select>

      </div>

      {loading && (
        <p>Loading products...</p>
      )}

      {error && (
        <p className="error">{error}</p>
      )}

      {!loading &&
        !error &&
        products.length === 0 && (
          <p>No products found.</p>
        )}

      <div className="products-grid">

        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            isWishlisted={isWishlisted(product._id)}
            onWishlistAdded={handleWishlistAdded}
          />
        ))}

      </div>

    </div>
  );
}

export default Products;