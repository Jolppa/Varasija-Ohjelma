const router = require("express").Router();
const parser = require("../controllers/parser");

router.get("/", parser.updateData);

module.exports = router;
