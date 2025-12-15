import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProducts } from "../services/productService";

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getAllProducts();
        setItems(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("Ürünler yüklenemedi");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Ürünler</h2>
      
      {loading && <p>Yükleniyor...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {!loading && !error && (
        <div>
          {items.length === 0 ? (
            <p>Henüz ürün bulunmuyor.</p>
          ) : (
            items.map((p) => (
              <div key={p.id} style={{ margin: "10px 0" }}>
                <Link to={`/products/${p.id}`}>{p.name}</Link> - {p.price}₺
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
