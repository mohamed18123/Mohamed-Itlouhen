// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  nom: String,
  prenom: String,
  naissance: Date,
  sexe: String,
  filiere: String,
  etablissement: String,
  password: String, // سيتم تشفيرها
});

module.exports = mongoose.model("User", userSchema);