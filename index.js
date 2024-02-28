const express = require("express");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const getData = require("./routes/getData");
const precioPromedio = require("./routes/precioPromedio")
const usuario = require("./routes/usuariosCR")
const port = 3000;

//se realizan cambios existentes
const app = express();
app.use(express.json());

// Usar las rutas de autenticación y carga de archivos
app.use("/api", [authRoutes, uploadRoutes, getData, getData, precioPromedio, usuario]);


// Iniciar el servidor en el puerto configurado en el archivo .env o en el puerto 3000 por defecto
app.listen(3000, function () {
  console.log(`Aplicacion corriendo en el puerto ${port}`);
});
