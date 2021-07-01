const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const dotenv = require("dotenv").config({ path: "./util/secrets.env" });

const database = require("./util/database");
const app = express();

database.connect();

// Configure static folder
app.use(express.static(path.join(__dirname, "public")));

// Configure template engine
app.engine(".hbs", exphbs({ extname: ".hbs" }));
app.set("view engine", ".hbs");

// Routes
app.use("/", require("./routes/indexRoutes"));
app.use("/refresh", require("./routes/dataRoutes"));

app.listen(process.env.PORT, () => console.log("Server Running..."));
