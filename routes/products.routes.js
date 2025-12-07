const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/", productController.listProducts);
router.get("/:id", productController.getProduct);

module.exports = router;
