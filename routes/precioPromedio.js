const express = require("express");
const mysql = require("mysql2/promise");
require('dotenv').config();

const router = express.Router();

// Configuración de la conexión a la base de datos MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'sistema_inmobiliario',
    port: process.env.PORT || '44283'

};

// Endpoint para calcular el precio promedio del metro cuadrado dentro de un radio de X kilómetros
router.get("/precioPromedio", async (req, res) => {
    try {
        const { latitud, longitud, distancia } = req.query;

        // Validar que se proporcionen la latitud, longitud y distancia
        if (!latitud || !longitud || !distancia) {
            return res.status(400).json({ error: "Por favor, proporcione latitud, longitud y distancia." });
        }

        // Construir la consulta SQL para calcular el precio promedio del metro cuadrado dentro del radio especificado
        const sqlQuery = `
        SELECT AVG(precio / metros_cuadrados) AS precio_promedio_metro_cuadrado
        FROM tabla_csv
        WHERE 
            SQRT(POW(69.1 * (latitud - ?), 2) + POW(69.1 * (? - longitud) * COS(latitud / 57.3), 2)) <= ?
        
        `;
        const params = [latitud, longitud, distancia];

        // Ejecutar la consulta en la base de datos
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(sqlQuery, params);
        await connection.end();

        // Devolver el precio promedio del metro cuadrado dentro del radio especificado
        res.json({ precio_promedio_metro_cuadrado: rows[0].precio_promedio_metro_cuadrado });
    } catch (error) {
        console.error('Error al calcular el precio promedio del metro cuadrado:', error);
        res.status(500).json({ error: 'Error al calcular el precio promedio del metro cuadrado.' });
    }
});

module.exports = router;
