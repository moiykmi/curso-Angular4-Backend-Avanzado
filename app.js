'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//cargar routas
var user_routes = require('./routes/user');
var animal_routes = require('./routes/animal');


//middlewares de body-parser
app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());

//Configurar cabeceras y cors

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});


//rutas base
app.use('/api', user_routes);
app.use('/api', animal_routes);



module.exports = app;
