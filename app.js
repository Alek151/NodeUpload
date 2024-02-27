const express = require("express");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const getData = require("./routes/getData")

const port = process.env.PORT || 3000;

//se realizan cambios existentes
const app = express();
app.use(express.json());

// Usar las rutas de autenticación y carga de archivos
app.use("/api", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api", getData);

// Iniciar el servidor en el puerto configurado en el archivo .env o en el puerto 3000 por defecto
app.listen(port, function () {
    console.log(`Aplicacion corriendo en el puerto ${port}`);
});