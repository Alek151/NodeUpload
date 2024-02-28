const mysql = require("mysql2/promise");
const express = require("express");
require("dotenv").config();
const router = express.Router();
const dbConfig = require("../db/db")

router.get("/propiedadesEnArea", async (req, res) => {
    try {
        const { latitud, longitud, distancia } = req.query;

        // Validar que se proporcionen la latitud, longitud y distancia
        if (!latitud || !longitud || !distancia) {
            return res.status(400).json({ error: "Por favor, proporcione latitud, longitud y distancia." });
        }

        // Construir la consulta SQL para seleccionar las propiedades dentro del área especificada
        const sqlQuery = `
        SELECT *
        FROM tabla_csv
        WHERE 
            SQRT(POW(69.1 * (latitud - ?), 2) + POW(69.1 * (? - longitud) * COS(latitud / 57.3), 2)) <= ?
        `;
        const params = [latitud, longitud, distancia];

        // Ejecutar la consulta en la base de datos
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(sqlQuery, params);
        await connection.end();

        // Devolver la lista de propiedades dentro del área especificada en formato JSON
        res.json({ propiedades_en_area: rows });
    } catch (error) {
        console.error('Error al obtener propiedades en el área especificada:', error);
        res.status(500).json({ error: 'Error al obtener propiedades en el área especificada.' });
    }
});


module.exports = router;
