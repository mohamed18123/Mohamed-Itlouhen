require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'users.json');
let users = [];

// Charger les utilisateurs
async function loadUsers() {
  try {
    const data = await fs.readFile(DATA_FILE);
    users = JSON.parse(data);
  } catch {
    users = [];
  }
}
loadUsers();

// Sauvegarder les utilisateurs
async function saveUsers() {
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
}

// Configuration email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Générer un code de 6 chiffres
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Route d'inscription
app.post('/inscription', async (req, res) => {
  const { email, nom, prenom, naissance, sexe, filiere, etablissement } = req.body;

  // Validation
  if (!email?.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  if (users.some(u => u.email === email)) {
    return res.status(400).json({ error: 'Email déjà utilisé' });
  }

  const verificationCode = generateCode();
  const codeExpiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const newUser = {
    id: Date.now().toString(),
    email,
    nom,
    prenom,
    naissance,
    sexe,
    filiere,
    etablissement,
    verified: false,
    verificationCode,
    codeExpiration: codeExpiration.toISOString()
  };

  users.push(newUser);
  await saveUsers();

  // Envoi du code par email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Code de vérification',
    html: `<p>Votre code de vérification est : <strong>${verificationCode}</strong></p>
          <p>Ce code expirera dans 15 minutes</p>`
  };

  await transporter.sendMail(mailOptions);

  res.status(201).json({ 
    message: 'Code envoyé à votre email',
    userId: newUser.id 
  });
});

// Vérification du code
app.post('/verify-code', async (req, res) => {
  const { userId, code } = req.body;

  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  if (new Date(user.codeExpiration) < new Date()) {
    return res.status(400).json({ error: 'Code expiré' });
  }

  if (user.verificationCode !== code) {
    return res.status(400).json({ error: 'Code incorrect' });
  }

  user.verified = true;
  user.verificationCode = null;
  await saveUsers();

  res.json({ message: 'Email vérifié avec succès' });
});

const PORT = 3000;
app.listen(PORT, () => console.log('Serveur démarré'));