import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const getCustomer = async () => {
      try {
        const response = await api.get("/customers/me");
        setCustomer(response.data);
      } catch (error) {
        navigate("/login");
      }
    };

    getCustomer();
  }, [navigate]);

  if (!customer) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Navbar />

      <div className="home">
        <h1>Welcome, {customer.fullName}!</h1>

        <div className="customer-card">
          <h2>Customer Information</h2>

          <p>
            <strong>Name:</strong> {customer.fullName}
          </p>

          <p>
            <strong>Email:</strong> {customer.email}
          </p>

          <p>
            <strong>Phone:</strong> {customer.phone}
          </p>

          <button onClick={() => navigate("/products")}>
            Shop Products
          </button>
        </div>
      </div>
    </>
  );
}

export default Home;