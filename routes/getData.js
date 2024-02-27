const mysql = require("mysql2/promise");
const express = require("express");
require('dotenv').config();
const router = express.Router();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'sistema_inmobiliario'
};

// Endpoint para filtrar la data
router.get("/filtrar", async (req, res) => {
    try {
        const { precioMinimo, precioMaximo, numHabitaciones } = req.query;

        // Construir la consulta SQL para filtrar la data
        let sqlQuery = 'SELECT * FROM tabla_csv WHERE 1=1';
        const params = [];

        if (precioMinimo) {
            sqlQuery += ' AND Precio >= ?';
            params.push(precioMinimo);
        }
        
        if (precioMaximo) {
            sqlQuery += ' AND Precio <= ?';
            params.push(precioMaximo);
        }

        if (numHabitaciones) {
            sqlQuery += ' AND Habitaciones = ?';
            params.push(numHabitaciones);
        }

        // Ejecutar la consulta en la base de datos
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(sqlQuery, params);
        await connection.end();

        // Devolver los resultados filtrados
        res.json({ data: rows });
    } catch (error) {
        console.error('Error al filtrar la data:', error);
        res.status(500).json({ error: 'Error al filtrar la data.' });
    }
});

module.exports = router;
