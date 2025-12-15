import { useEffect, useState } from "react";
import { getAllProducts } from "./services/productService";

export default function App() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getAllProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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

        {loading && <p>Yükleniyor...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && (
          <ul>
            {products.map((p) => (
              <li key={p.id}>
                {p.name} — {p.price || p.fiyat}₺
              </li>
            ))}
          </ul>
        )}
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

      {loading && <p>Yükleniyor...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
