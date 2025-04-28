// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration de la base de données
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Création de la table (à exécuter une fois)
async function createTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS utilisateurs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      nom VARCHAR(100) NOT NULL,
      prenom VARCHAR(100) NOT NULL,
      date_naissance DATE NOT NULL,
      sexe ENUM('homme', 'femme') NOT NULL,
      filiere VARCHAR(100) NOT NULL,
      etablissement VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(createTableQuery);
}
createTable();

// Route d'inscription
app.post('/inscription', async (req, res) => {
  const { 
    email,
    nom,
    prenom,
    naissance,
    sexe,
    filiere,
    etablissement 
  } = req.body;

  // Validation simple
  const errors = [];
  if (!email?.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)) {
    errors.push('Email invalide');
  }
  if (!nom || nom.length < 2) errors.push('Nom requis');
  if (!prenom || prenom.length < 2) errors.push('Prénom requis');
  if (!naissance) errors.push('Date de naissance requise');
  if (!['homme', 'femme'].includes(sexe)) errors.push('Sexe invalide');
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO utilisateurs 
      (email, nom, prenom, date_naissance, sexe, filiere, etablissement)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, nom, prenom, naissance, sexe, filiere, etablissement]
    );
    
    res.status(201).json({ 
      message: 'Inscription réussie', 
      id: result.insertId 
    });
    
  } catch (err) {
    console.error(err);
    let errorMessage = 'Erreur serveur';
    if (err.code === 'ER_DUP_ENTRY') {
      errorMessage = 'Cet email est déjà utilisé';
    }
    res.status(500).json({ error: errorMessage });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});