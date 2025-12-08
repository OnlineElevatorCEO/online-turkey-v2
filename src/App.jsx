import { useEffect, useState } from "react";

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

      {products.length === 0 ? (
        <p>Ürünler yükleniyor...</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              {p.name} – {p.price}₺
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
