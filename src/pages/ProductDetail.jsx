import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`https://ot-backend-2.onrender.com/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error("DETAIL API ERROR:", err));
  }, [id]);

  if (!product) return <p>Yükleniyor...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>{product.name}</h2>
      <p>Fiyat: {product.price}₺</p>
      <p>Açıklama: {product.description}</p>

      <br />
      <a href="/" style={{ textDecoration: "underline", color: "blue" }}>
        ← Listeye Dön
      </a>
    </div>
  );
}
