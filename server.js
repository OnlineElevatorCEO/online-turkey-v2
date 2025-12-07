require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const routes = require("./routes");

const app = express();
app.use(cors());
app.use(express.json());

// ENV port veya 5000
const PORT = process.env.PORT || 5000;

// ROUTES
app.use("/api", routes);

// FRONTEND
const frontendDir = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendDir));

// SPA yönlendirme
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

// SERVER START
app.listen(PORT, () => {
  console.log("ONLINE TURKEY BACKEND ÇALIŞIYOR  PORT:", PORT);
});
