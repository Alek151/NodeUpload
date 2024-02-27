const express = require("express");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");


//se realizan cambios existentes
const app = express();
app.use(express.json());

// Usar las rutas de autenticación y carga de archivos
app.use("/api", authRoutes);
app.use("/api", uploadRoutes);

// Iniciar el servidor en el puerto 3000
app.listen(3000, function () {
    console.log("Aplicacion corriendo en el puerto 3000");
});
