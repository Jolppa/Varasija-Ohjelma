const mongoose = require("mongoose");
const { Schema } = mongoose;

const dataSchema = new Schema({
  varasija: { type: Number, required: true },
  paikkoja_jäljellä: { type: Number, required: true },
  luotu_päivämäärä: { type: Date },
  päivitetty_päivämäärä: { type: Date },
});

module.exports = mongoose.model("Data", dataSchema);
