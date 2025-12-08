import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import ProductDetail from "./pages/ProductDetail";

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("https://ot-backend-2.onrender.com/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("API ERROR:", err));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Online Turkey – Ürün Listesi</h1>

      <Routes>
        <Route
          path="/"
          element={
            products.length === 0 ? (
              <p>Ürünler yükleniyor...</p>
            ) : (
              <ul>
                {products.map((p) => (
                  <li key={p.id} style={{ marginBottom: "10px" }}>
                    <Link to={`/product/${p.id}`}>
                      {p.name} – {p.price}₺
                    </Link>
                  </li>
                ))}
              </ul>
            )
          }
        />

        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </div>
  );
}

export default App;
