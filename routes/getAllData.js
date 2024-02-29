const express = require("express");
const mysql = require("mysql2/promise");
require('dotenv').config();
const dbConfig = require("../db/db");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");

// Endpoint para obtener propiedades filtradas
router.get("/propiedadesFiltradas", verifyToken, async (req, res) => {
    try {
        // Obtener los parámetros de consulta
        console.log(req.query)
        const { habitaciones, precioMin, precioMax, latitud, longitud, distancia, balc_n, se_admiten_mascotas, piscina, jard_n } = req.query;

        // Construir la consulta SQL para obtener propiedades filtradas
        let sqlQuery = `
            SELECT *
            FROM tabla_csv
            WHERE 1 = 1
        `;
        const params = [];

        // Agregar condiciones basadas en los parámetros de consulta
        if (habitaciones) {
            sqlQuery += ` AND habitaciones = ?`;
            params.push(habitaciones);
        }
        if (precioMin) {
            sqlQuery += ` AND precio >= ?`;
            params.push(precioMin);
        }
        if (precioMax) {
            sqlQuery += ` AND precio <= ?`;
            params.push(precioMax);
        }
        if (latitud && longitud && distancia) {
            sqlQuery += ` AND SQRT(POW(69.1 * (latitud - ?), 2) + POW(69.1 * (? - longitud) * COS(latitud / 57.3), 2)) <= ?`;
            params.push(latitud, longitud, distancia);
        }
        if (balc_n) {
            sqlQuery += ` AND balc_n = ?`;
            params.push(balc_n);
        }
        if (se_admiten_mascotas) {
            sqlQuery += ` AND se_admiten_mascotas = ?`;
            params.push(se_admiten_mascotas);
        }
        if (piscina) {
            sqlQuery += ` AND piscina = ?`;
            params.push(piscina);
        }
        if (jard_n) {
            sqlQuery += ` AND jard_n = ?`;
            params.push(jard_n);
        }

        // Ejecutar la consulta en la base de datos
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(sqlQuery, params);
        await connection.end();

        // Devolver las propiedades filtradas
        res.json({ propiedades_en_area: rows });
    } catch (error) {
        console.error('Error al obtener propiedades filtradas:', error);
        res.status(500).json({ error: 'Error al obtener propiedades filtradas.' });
    }
});

module.exports = router;
