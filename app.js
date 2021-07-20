const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const database = require("./util/database");
const app = express();
let dotenv;

process.env.NODE_ENV === "development"
  ? (dotenv = require("dotenv").config({ path: "./util/test_Secrets.env" }))
  : (dotenv = require("dotenv").config({ path: "./util/secrets.env" }));

console.log(`Current environment: ${process.env.NODE_ENV}`);

// Connect to the database
database.connect();

// Configure static folder
app.use(express.static(path.join(__dirname, "public")));

// Configure template engine
app.engine(".hbs", exphbs({ extname: ".hbs" }));
app.set("view engine", ".hbs");

// Routes
app.use("/", require("./routes/indexRoutes"));
app.use("/refresh", require("./routes/dataRoutes"));

// Error middleware
app.use((error, req, res, next) => {
  console.log("in error middleware");
  res.render("index", { layout: false, error });
});

app.listen(process.env.PORT, () => console.log("Server Running..."));
