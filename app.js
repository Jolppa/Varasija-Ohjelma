const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");

const app = express();

// Configure static folder
app.use(express.static(path.join(__dirname, "public")));

app.engine(".hbs", exphbs({ extname: ".hbs" }));
app.set("view engine", ".hbs");

app.use("/", require("./routes/routes"));

app.listen(3000, () => console.log("Server Running..."));
