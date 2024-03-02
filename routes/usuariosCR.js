const express = require("express");
const mysql = require("mysql2/promise");
const dbConfig = require("../db/db");
const router = express.Router();

// Función para verificar si la tabla usuarios existe
async function verificarTablaUsuarios(connection) {
    const [rows, fields] = await connection.execute(
        "SHOW TABLES LIKE 'usuarios'"
    );
    return rows.length > 0;
}

// Función para crear la tabla usuarios si no existe
async function crearTablaUsuarios(connection) {
    await connection.execute(
        "CREATE TABLE usuarios (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL)"
    );
}

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
        // Conectar a la base de datos
        const connection = await mysql.createConnection(dbConfig);

        // Verificar si la tabla usuarios existe
        const tablaUsuariosExiste = await verificarTablaUsuarios(connection);

        // Si la tabla no existe, crearla
        if (!tablaUsuariosExiste) {
            await crearTablaUsuarios(connection);
        }

        // Insertar el nuevo usuario en la base de datos
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
        // Conectar a la base de datos
        const connection = await mysql.createConnection(dbConfig);

        // Verificar si la tabla usuarios existe
        const tablaUsuariosExiste = await verificarTablaUsuarios(connection);

        // Si la tabla no existe, retornar un error
        if (!tablaUsuariosExiste) {
            return res.status(404).json({ error: "La tabla usuarios no existe." });
        }

        // Actualizar la contraseña del usuario en la base de datos
        await connection.execute(
            'UPDATE usuarios SET password = ? WHERE email = ?',
            [newPassword, email]
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
