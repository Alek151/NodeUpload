const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Endpoint para iniciar sesión y obtener un token JWT
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Verificar si se proporcionan correo electrónico y contraseña
    if (!email || !password) {
        return res.status(400).json({ error: "Por favor, proporcione correo electrónico y contraseña." });
    }

    // Aquí deberías tener tu lógica de autenticación, por ejemplo, consultar una base de datos para verificar las credenciales del usuario
    // Por simplicidad, aquí solo estamos comparando las credenciales con un valor fijo
    if (email !== 'bryangar266@gmail.com' || password !== 'contraseña') {
        return res.status(401).json({ error: "Credenciales inválidas. Por favor, inténtelo de nuevo." });
    }

    // Si las credenciales son válidas, generamos el token JWT
    jwt.sign({ email: email }, 'secretKey', {expiresIn:'10s'}, (err, token) => {
        if (err) {
            return res.status(500).json({ error: "Error al generar el token JWT." });
        }
        res.json({
            token: token
        });
    });
});

module.exports = router;
