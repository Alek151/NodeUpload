const mysql = require("mysql2/promise");
const express = require("express");
const jwt = require("jsonwebtoken"); // Importar jwt
require("dotenv").config();
const dbConfig = require("../db/db")
const router = express.Router();

// Middleware para verificar el token JWT
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    jwt.verify(bearerToken, "secretKey", (err, authData) => {
      // Verificar el token JWT
      if (err) {
        res.sendStatus(403); // Forbidden si el token es inválido
        logger.error("Token JWT inválido.");
      } else {
        req.authData = authData; // Almacenar los datos de autenticación en el objeto de solicitud
        next(); // Pasar al siguiente middleware
      }
    });
  } else {
    res.sendStatus(403); // Forbidden si no se proporciona el token JWT
    console.error("No se ha proporcionado ningún token JWT.");
  }
}

// Endpoint para filtrar la data, protegido con JWT

// Endpoint para filtrar la data, protegido con JWT
router.get("/filtrar", verifyToken, async (req, res) => {
  // Aplicar el middleware de verificación de token JWT
  try {
    const { precioMinimo, precioMaximo, numHabitaciones } = req.query;

    // Construir la consulta SQL para filtrar la data
    let sqlQuery = "SELECT * FROM tabla_csv WHERE 1=1";
    const params = [];

    if (precioMinimo) {
      sqlQuery += " AND precio >= ?";
      params.push(precioMinimo);
    }

    if (precioMaximo) {
      sqlQuery += " AND precio <= ?";
      params.push(precioMaximo);
    }

    if (numHabitaciones) {
      sqlQuery += " AND habitaciones = ?";
      params.push(numHabitaciones);
    }

    // Ejecutar la consulta en la base de datos
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(sqlQuery, params);
    await connection.end();

    // Devolver los resultados filtrados
    res.json({ data: rows });
  } catch (error) {
    console.error("Error al filtrar la data:", error);
    res.status(500).json({ error: "Error al filtrar la data." });
  }
});
module.exports = router;
