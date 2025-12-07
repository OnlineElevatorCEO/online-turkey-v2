exports.getProducts = async (req, res) => {
  try {
    const products = [
      { id: 1, name: "Telefon", price: 12000 },
      { id: 2, name: "Laptop", price: 35000 },
      { id: 3, name: "Kulaklık", price: 650 }
    ];

    res.json(products);
  } catch (err) {
    console.error("ÜRÜN LİSTELEME HATASI:", err);
    res.status(500).json({ error: "Server Error" });
  }
};
