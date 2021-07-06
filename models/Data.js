const mongoose = require("mongoose");
const { Schema } = mongoose;
const dateformat = require("dateformat");

const dataSchema = new Schema({
  varasija: { type: Number, required: true },
  paikkoja_jäljellä: { type: Number, required: true },
  päivämäärä: {
    type: String,
    default: dateformat(undefined, "dd.mm.yy, HH:MM:ss"),
  },
});

module.exports = mongoose.model("Data", dataSchema);
