const router = require("express").Router();
const parser = require("../controllers/main");

router.get("/", parser.refreshData);

module.exports = router;
