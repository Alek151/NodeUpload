const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
const { password } = require("../db/db");

const router = express.Router();

// Configuración de la conexión a la base de datos MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'sistema_inmobiliario'
};

// Endpoint para crear un nuevo usuario
router.post("/usuarios", async (req, res) => {
    const { email, password } = req.body;

    // Verificar si se proporcionan correo electrónico y contraseña
    if (!email || !password) {
        return res.status(400).json({
            error: "Por favor, proporcione correo electrónico y contraseña.",
        });
    }

    try {
        // Generar el hash de la contraseña
        //const hashedPassword = await bcrypt.hash(password, 10); // El segundo parámetro es el coste del algoritmo de hashing

        // Conectar a la base de datos
        const connection = await mysql.createConnection(dbConfig);
        
        // Insertar el nuevo usuario en la base de datos con la contraseña encriptada
        await connection.execute(
            'INSERT INTO usuarios (email, password) VALUES (?, ?)',
            [email, password]
        );

        // Cerrar la conexión
        await connection.end();

        res.status(201).json({ message: "Usuario creado correctamente." });

    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(500).json({ error: "Error al crear el usuario." });
    }
});

// Endpoint para actualizar la contraseña del usuario
router.put("/usuarios/:email", async (req, res) => {
    const { email } = req.params;
    const { newPassword } = req.body;

    try {
        // Generar el hash de la nueva contraseña
       // const hashedPassword = await bcrypt.hash(newPassword, 10); // El segundo parámetro es el coste del algoritmo de hashing
        const password = newPassword
        // Conectar a la base de datos
        const connection = await mysql.createConnection(dbConfig);
        
        // Actualizar la contraseña del usuario en la base de datos
        await connection.execute(
            'UPDATE usuarios SET password = ? WHERE email = ?',
            [password, email]
        );

        // Cerrar la conexión
        await connection.end();

        res.json({ message: "Contraseña actualizada correctamente." });

    } catch (error) {
        console.error("Error al actualizar la contraseña del usuario:", error);
        res.status(500).json({ error: "Error al actualizar la contraseña del usuario." });
    }
});

module.exports = router;
