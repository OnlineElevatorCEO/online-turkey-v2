const pool = require("../db/db");

async function getAllProducts(category, search) {
  let query = "SELECT * FROM products WHERE 1=1";
  let params = [];

  if (category && category !== "Tümü") {
    query += " AND category = ?";
    params.push(category);
  }

  if (search && search.trim() !== "") {
    query += " AND (name LIKE ? OR description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getProductById(id) {
  const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
  return rows[0] || null;
}

async function getCategories() {
  const [rows] = await pool.query("SELECT DISTINCT category FROM products");
  return rows.map(r => r.category);
}

module.exports = {
  getAllProducts,
  getProductById,
  getCategories
};
