const pool = require("./db");
(async () => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");
    console.log("MYSQL BAĞLANTI BAŞARILI:", rows);
    process.exit(0);
  } catch (err) {
    console.error("MYSQL BAĞLANTI HATASI:", err.message);
    process.exit(1);
  }
})();
