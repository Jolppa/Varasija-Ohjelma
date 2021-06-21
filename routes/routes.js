const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.render("index", { layout: false });
});

module.exports = router;
