const express = require("express");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const csv = require("csv-parser");
const fs = require("fs");
const multer = require("multer");
const { createLogger, transports, format } = require("winston");
require('dotenv').config();

const router = express.Router();

// Configuración de los logs
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.File({ filename: 'app.log' })
    ]
});

// Configuración de la conexión a la base de datos MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'sistema_inmobiliario'
};
// Configuración de `multer` para manejar archivos adjuntos
const upload = multer({ dest: 'uploads/' });

// Función para normalizar los nombres de las columnas
function normalizeColumnName(columnName) {
    // Convertir el nombre de la columna a minúsculas y luego reemplazar espacios y caracteres no alfanuméricos con guiones bajos
    return columnName.toLowerCase().replace(/\s+/g, '_').replace(/\W+/g, '_');
}

// Endpoint para cargar un archivo CSV
router.post("/uploadCsv", upload.single('csvFile'), verifyToken, async (req, res) => {
    try {
        const authData = jwt.verify(req.token, 'secretKey');
        // Verificar si se ha proporcionado un archivo CSV
        if (!req.file || Object.keys(req.file).length === 0) {
            logger.error('No se ha proporcionado ningún archivo CSV.');
            return res.status(400).send('No se ha proporcionado ningún archivo CSV.');
        }

        // Obtener el archivo CSV
        const csvFile = req.file;

        // Crear una conexión a la base de datos
        const connection = await mysql.createConnection(dbConfig);

        // Leer el archivo CSV y procesar los datos
        const columnNames = [];
        fs.createReadStream(csvFile.path)
            .pipe(csv())
            .on('data', async (row) => {
                // Normalizar los nombres de las columnas y almacenarlos
                for (const [key, value] of Object.entries(row)) {
                    const normalizedKey = normalizeColumnName(key);
                    if (!columnNames.includes(normalizedKey)) {
                        columnNames.push(normalizedKey);
                    }
                }
            })
            .on('end', async () => {
                try {
                    // Crear una tabla si no existe
                    const createTableQuery = `CREATE TABLE IF NOT EXISTS tabla_csv (id_int INT AUTO_INCREMENT PRIMARY KEY, ${columnNames.map(key => `${key} VARCHAR(255)`).join(', ')})`;
                    await connection.query(createTableQuery);

                    // Leer el archivo CSV nuevamente y insertar los datos en la tabla
                    fs.createReadStream(csvFile.path)
                        .pipe(csv())
                        .on('data', async (row) => {
                            const normalizedRow = {};
                            // Normalizar los nombres de las columnas y asignar valores a las columnas correspondientes
                            for (const [key, value] of Object.entries(row)) {
                                const normalizedKey = normalizeColumnName(key);
                                normalizedRow[normalizedKey] = value;
                            }

                            // Insertar los datos del CSV en la tabla
                            const insertQuery = `INSERT INTO tabla_csv SET ?`;
                            await connection.query(insertQuery, normalizedRow);
                        })
                        .on('end', async () => {
                            logger.info('Importación de datos completada.');
                            await connection.end();
                            res.json({
                                mensaje: "Data fue analizada y creada",
                                authData
                            });
                        });
                } catch (error) {
                    logger.error('Error al crear la tabla o insertar los datos:', error);
                    res.status(500).send('Error al crear la tabla o insertar los datos.');
                }
            });
    } catch (error) {
        logger.error('Error al importar datos:', error);
        res.status(500).send('Error al importar datos.');
    }
});

// Función para verificar el token JWT en el encabezado de la solicitud
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(" ")[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
        logger.error('No se ha proporcionado ningún token JWT.');
    }
}

module.exports = router;
