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

  if (selected) {
    return (
      <div style={{ padding: "20px" }}>
        <button onClick={() => setSelected(null)}> Geri dön</button>
        <h1>{selected.name}</h1>
        <p>Fiyat: {selected.price}?</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Ürünler</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}
              style={{ cursor: "pointer", marginBottom: "8px" }}
              onClick={() => setSelected(p)}
          >
            {p.name}  {p.price}?
          </li>
        ))}
      </ul>
    </div>
  );
}
