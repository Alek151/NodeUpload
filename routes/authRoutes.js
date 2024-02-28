const express = require("express");
const jwt = require("jsonwebtoken");
//const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
const dbConfig = require("../db/db")
const router = express.Router();

// Endpoint para iniciar sesión y obtener un token JWT
router.post("/login", async (req, res) => {
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
        
        // Consultar la contraseña encriptada del usuario
        const [rows] = await connection.execute(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        // Verificar si se encontró un usuario con el correo electrónico proporcionado
        if (rows.length === 0) {
            return res.status(401).json({
                error: "Credenciales inválidas. Por favor, inténtelo de nuevo.",
            });
        }

        // Verificar la contraseña utilizando bcrypt
        const user = rows[0];
        //const passwordMatch = await bcrypt.compare(password, user.password);

        // Si la contraseña no coincide, devolver un error de credenciales inválidas
        if (password !== user.password) {
            return res.status(401).json({
                error: "Credenciales inválidas. Por favor, inténtelo de nuevo.",
            });
        }

        // Generar el token JWT después de que el usuario haya sido autenticado con éxito
        const token = jwt.sign(
            { email: email },
            "secretKey",
            { expiresIn: "300s" }
        );

        // Devolver el token JWT al cliente
        res.json({ token: token });

    } catch (error) {
        console.error("Error al autenticar al usuario:", error);
        res.status(500).json({ error: "Error al autenticar al usuario." });
    }
});

module.exports = router;
