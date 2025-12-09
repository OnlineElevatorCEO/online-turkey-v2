import { useEffect, useState } from "react";

const API_URL = "https://ot-backend-2.onrender.com/api/products";

export default function App() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  // ÜRÜNLER SAYFASI
  if (selected === "urunler") {
    return (
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <button
          onClick={() => setSelected(null)}
          style={{ marginBottom: "20px" }}
        >
          Ana Menüye Dön
        </button>

        <h2>Ürünler</h2>

        <ul>
          {products.map((p) => (
            <li key={p.id}>
              {p.name} — {p.fiyat}₺
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // ANA MENÜ
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Online Turkey Menü</h1>

      <button
        onClick={() => setSelected("urunler")}
        style={{ marginBottom: "20px" }}
      >
        Ürünleri Gör
      </button>
    </div>
  );
}
