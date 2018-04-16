'use strict'


var mongoose = require('mongoose');
var app = require('./app');

var port = process.env.PORT || 3789;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/zoo', (err,res) =>{
	if(err){
		throw err;
	}else{
		console.log('La conexión a la base de datos se ha realizado correctamente ...');

		app.listen(port, () =>{
			console.log("El servido local con Node y Express esta corriendo correctamente ...");
		});
	}

});