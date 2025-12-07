const express = require("express");
const router = express.Router();

router.use(require("./productRoutes"));

module.exports = router;
