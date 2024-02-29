const express = require("express");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const csv = require("csv-parser");
const fs = require("fs");
const multer = require("multer");
const { createLogger, transports, format } = require("winston");
require("dotenv").config();
const dbConfig = require("../db/db");
const verifyToken = require("../middlewares/authMiddleware");
const router = express.Router();

// Configuración de los logs
const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.File({ filename: "app.log" })],
});

// Configuración de `multer` para manejar archivos adjuntos
const upload = multer({ dest: "uploads/" });

// Función para normalizar los nombres de las columnas
function normalizeColumnName(columnName) {
  // Convertir el nombre de la columna a minúsculas y luego reemplazar espacios y caracteres no alfanuméricos con guiones bajos
  return columnName.toLowerCase().replace(/\s+/g, "_").replace(/\W+/g, "_");
}

// Endpoint para cargar un archivo CSV
router.post(
  "/uploadCsv",
  upload.single("csvFile"),
  verifyToken,
  async (req, res) => {
    try {
      console.log("Proceso de carga de CSV iniciado...");
      
      // Verificar si se ha proporcionado un archivo CSV
      if (!req.file || Object.keys(req.file).length === 0) {
        logger.error("No se ha proporcionado ningún archivo CSV.");
        return res
          .status(400)
          .send("No se ha proporcionado ningún archivo CSV.");
      }

      // Obtener el archivo CSV
      const csvFile = req.file;

      // Crear una conexión a la base de datos
      const connection = await mysql.createConnection(dbConfig);

      // Leer el archivo CSV y procesar los datos
      const columnNames = [];
      fs.createReadStream(csvFile.path)
        .pipe(csv())
        .on("data", async (row) => {
          // Normalizar los nombres de las columnas y almacenarlos
          for (const [key, value] of Object.entries(row)) {
            const normalizedKey = normalizeColumnName(key);
            if (!columnNames.includes(normalizedKey)) {
              columnNames.push(normalizedKey);
            }
          }
        })
        .on("end", async () => {
          try {
            console.log("Lectura del archivo CSV completa. Procesando datos...");

            // Crear una tabla si no existe
            const createTableQuery = `CREATE TABLE IF NOT EXISTS tabla_csv (id_int INT AUTO_INCREMENT PRIMARY KEY, ${columnNames
              .map((key) => `${key} VARCHAR(255)`)
              .join(", ")})`;
            await connection.query(createTableQuery);

            // Leer el archivo CSV nuevamente y insertar los datos en la tabla
            fs.createReadStream(csvFile.path)
              .pipe(csv())
              .on("data", async (row) => {
                const normalizedRow = {};
                // Normalizar los nombres de las columnas y asignar valores a las columnas correspondientes
                for (const [key, value] of Object.entries(row)) {
                  const normalizedKey = normalizeColumnName(key);
                  // Truncar los valores que excedan los 255 caracteres
                  const truncatedValue = value.substring(0, 255);
                  normalizedRow[normalizedKey] = truncatedValue;
                }

                // Insertar los datos del CSV en la tabla
                const insertQuery = `INSERT INTO tabla_csv SET ?`;
                await connection.query(insertQuery, normalizedRow);
              })
              .on("end", async () => {
                console.log("Proceso de importación de datos completado.");

                const authData = req.authData; // Obtener authData del middleware

                logger.info("Importación de datos completada.");
                await connection.end();
                res.json({
                  mensaje: "Data fue analizada y creada",
                  authData: authData // Agregar authData a la respuesta JSON
                });
              });
          } catch (error) {
            console.log("Error al procesar datos:", error);

            logger.error(
              "Error al crear la tabla o insertar los datos:",
              error
            );
            res
              .status(500)
              .send("Error al crear la tabla o insertar los datos.");
          }
        });
    } catch (error) {
      console.log("Error al cargar el archivo CSV:", error);

      logger.error("Error al importar datos:", error);
      res.status(500).send("Error al importar datos.");
    }
  }
);

module.exports = router;
