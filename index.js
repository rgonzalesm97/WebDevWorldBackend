const express = require('express');
const cors = require('cors');
const path = require('path');
const { dbConnection } = require('./database/config');

//variables de entorno
require('dotenv').config();

const app = express();

dbConnection();

//Directorio Publico
app.use(express.static('public'));

// CORS 
app.use(cors());

//lectura y parseo del body
app.use(express.json());


app.use('/api/article', require('./routes/article'));


//Manejar las demas rutas (propias de el frontend que desplegamos en la carpeta public)
app.get( '*', (req, res) => {
    res.sendFile( path.resolve( __dirname, 'public/index.html'));
});


// Para levantar el servidor. El puerto cuando se desplieguep va a ser una variable porque no sabemos que puerto se nos asignara, eso depende del hosting
app.listen( process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
});