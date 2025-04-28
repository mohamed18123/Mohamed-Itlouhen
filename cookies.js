// server.js (Sessions)
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("./models/User");

const app = express();

// Connexion MongoDB
mongoose.connect("mongodb://localhost/auth_demo");

// Middleware pour les sessions
app.use(
  session({
    secret: "votre_secret_session",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 }, // secure: true en HTTPS
  })
);

// Middleware pour parser les données du formulaire
app.use(express.urlencoded({ extended: true }));

// Route de connexion
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Email incorrect");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Mot de passe incorrect");

    // Création de la session
    req.session.userId = user._id;
    res.redirect("/profile");
  } catch (err) {
    res.status(500).send("Erreur serveur");
  }
});

// Route protégée (exemple)
app.get("/profile", (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  res.send("Bienvenue sur votre profil !");
});

// Déconnexion
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.listen(3000, () => console.log("Serveur démarré sur http://localhost:3000"));