'use strict'
//modulos
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');

//modelos
var User = require('../models/user');

//importar servicios
var jwt = require('../services/jwt');

//acciones
function pruebas(req,res){
	res.status(200).send ({
		message : 'Probando el controlador de usuario y la acción pruebas',
		user : req.user
	});
}

function saveUser(req,res){
	//Crear objeto usuario
	var user = new User();

	//Recoger el body(parametro) de la peticion
	var params = req.body;

	//Asignar valores al bojeto de usuario
	if(params.password && params.name && params.surname && params.email){
		user.name = params.name;
		user.surname = params.surname;
		user.email = params.email;
		user.role = 'ROLE_USER';
		user.image = null;

		User.findOne({email : user.email.toLowerCase()},(err,userIn) =>{
			if(err) {
				res.status(500).send({ message : 'Error al comprobar el usaurio'});
			}else{
				if(!userIn){
					//Cifrar contraseña
					bcrypt.hash(params.password, null,null, function(err,hash){
						user.password = hash;

						//Guardar usuario en bd
						user.save((err,userStored)=>{
							if(err){
								res.status(500).send({ message : 'Error al guardar el usuario'});
							}else{
								if(!userStored){
									res.status(404).send({ message : 'No se ha registrado  el usuario'});
								}else{
									res.status(200).send({ user : userStored});
								}
							}

						})
					});
				}else{
					res.status(404).send({ message : 'El usuario no puede registrarse'});
				}
			}
		});
		
	}else{
		res.status(200).send({ message : 'Introduce los datos correctamente para poder registrar al usuario'});
	}
}

function login (req,res){

	var params = req.body;
	var email = params.email;
	var password = params.password;

	User.findOne({ email : email.toLowerCase()}, (err, user) =>{
		if (err) {
			res.status(500).send({ message : 'Error al comprobar el usuario'});
		}else{
			if(user){
				bcrypt.compare(password, user.password,(err,check) =>{
					if(check){
						if(params.gettoken){
							//devolcer el token
							res.status(200).send({
								token : jwt.createToken(user)
							});
						}else{

						}
		
					}else{
						res.status(404).send({
						message : 'El usuario no ha podido logearse'
						});
					}
				});
				
			}else{
				res.status(404).send({
					message : 'El usuario no ha podido logearse'
				});
			}
		}
	});

}


function updateUser(req, res){

	var userID = req.params.id;
	var update = req.body;

	console.log(update);
	if(userID != req.user.sub){
		return res.status(500).send({
			message : ' no tienes permiso para actualizar el usuario'
		});
	}else{
		User.findByIdAndUpdate(userID , update, {new :true}, (err,userUpdate) =>{
			if(err){
				res.status(500).send({
					message : 'Error al actualizar el usuario'
				});
			}else{
				if(!userUpdate){
					res.status(404).send({
						message : 'No se ha podido actualizar el usuario'
					});
				}else{
					res.status(200).send({user : userUpdate});
				}
			}
		});
	}
}

function uploadImage(req,res){
	var userID = req.params.id;
	var file_name = 'No subido....';

	if(req.files){
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
			User.findByIdAndUpdate(userID , {image : file_name}, {new :true}, (err,userUpdate) =>{
				if(err){
					res.status(500).send({
						message : 'Error al actualizar el usuario'
					});
				}else{
					if(!userUpdate){
						res.status(404).send({
							message : 'No se ha podido actualizar el usuario'
						});
					}else{
						res.status(200).send({user : userUpdate, image : file_name});
					}
				}
			});

		}else{
			fs.unlink(file_path, (err) =>{
				if(err){
					res.status(200).send({
						message : 'Extensión no valida y fichero no guardado'
					});

				}else{
					res.status(200).send({
						message : 'Extensión no valida'
					});
				}
			});
			
		}
	}else{
		res.status(200).send({
			message : 'No se han subidos ficheros'
		});
	}
}

function getImageFile(req, res){
	var imageFile = req.params.imageFile;
	var path_file = './uploads/users/'+imageFile;

	fs.exists(path_file, function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(404).send({
				message : 'Imagen no existe'
			});
		}
	});
}

function getKeepers(req,res){
	User.find({role : 'ROLE_ADMIN'}).exec((err,users) =>{
		if(err){
			res.status(500).send({ message : 'Error en la petición'});
		}else{
			if(!users){
				res.status(404).send({ message : 'No hay cuidadores'});
			}else{
				res.status(200).send({users});
			}
		}
	});
	
}

module.exports = {
	pruebas,
	saveUser,
	login,
	updateUser,
	uploadImage,
	getImageFile,
	getKeepers
}