import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductById } from "../services/productService";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Ürün yüklenemedi");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p style={{ color: "red", padding: "20px" }}>{error}</p>;
  if (!product) return <p>Ürün bulunamadı</p>;

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
