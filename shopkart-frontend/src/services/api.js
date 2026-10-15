import axios from "axios";

const api = axios.create({
  baseURL: "https://shopkart-mern-sigx.onrender.com",
  withCredentials: true
});

export default api;