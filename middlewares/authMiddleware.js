const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    jwt.verify(bearerToken, "secretKey", (err, authData) => {
      // Verificar el token JWT
      if (err) {
        res.sendStatus(403); // Forbidden si el token es inválido
        logger.error("Token JWT inválido.");
      } else {
        req.authData = authData; // Almacenar los datos de autenticación en el objeto de solicitud
        next(); // Pasar al siguiente middleware
      }
    });
  } else {
    res.sendStatus(403); // Forbidden si no se proporciona el token JWT
    console.error("No se ha proporcionado ningún token JWT.");
  }
}

module.exports = verifyToken;
