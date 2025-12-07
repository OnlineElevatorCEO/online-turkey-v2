import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../client";

export default function Products() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/products").then((res) => {
      setItems(res.data);
    });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Ürünler</h2>
      {items.map((p) => (
        <div key={p.id} style={{ margin: "10px 0" }}>
          <Link to={`/products/${p.id}`}>{p.name}</Link> - {p.price}₺
        </div>
      ))}
    </div>
  );
}
