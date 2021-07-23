const inicioDebug =require('debug')('app:inicio');//para poder activar las depuraciones al inicar la app
const dbDebug = require('debug')('app:db');
const express = require('express');
const config = require('config');
const  app = express();
const Joi = require('joi');
//const logger = require('./logger');
const morgan = require('morgan');
const port = process.env.PORT || 5000;

app.use(express.json());//body
app.use(express.urlencoded({extended:true}));// recibir el body en la url
app.use(express.static('public'));

//configuración de entornos
console.log('Aplicación: '+config.get('nombre'));
console.log('BD server: '+config.get('configDB.host'));

//app.use(logger);

//uso de un middleware de terceros - morgan: es un log de detalles de las peticiones http
if(app.get('env')=== 'development'){
    app.use(morgan('tiny'));
    //console.log('morgan habilitado');
    inicioDebug('Morgan está habilitado'); 
}

//trabajos con la BD
dbDebug('conectando con la base de datos');



/*
//funciones middleware
app.use(function(req,res,next){
    console.log('iniciando sesión');
    next();
});
*/
const usuarios = [
    {id:1,nombre:'Manuel'},
    {id:2,nombre:'Luis'},
    {id:3,nombre:'Fernando'},
    {id:4,nombre:'José'}
];



app.get('/',(req,res) => {
    res.send('conección exitosa al servidor.');
});

app.get('/api/usuarios',(req,res) => {
    res.send(usuarios);
});

// cuando coloco :algo es un parametro variable en la url
app.get('/api/usuarios/:id',(req,res) => {
    // req.pararams.algo me devuelve ese parametro
    // req.query me permite enviar en la url parametros query como /api/usuarios/x? sexo=M
    let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    if(!usuario)
    res.status(404).send('El usuario no fue econtrado');
    else
    res.send (usuario);
});

app.post('/api/usuarios', (req,res) => {

    const schema = Joi.object({
        nombre: Joi.string()
        .min(3)
        .required()
    });

    const {error,value} = schema.validate({nombre: req.body.nombre});

    if(!error){
        const usuario = {
            id:usuarios.length +1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    }else{
        const mensaje = error.details[0].message
        res.status(400).send(mensaje);
    }
});

app.put('/api/usuarios/:id',(req,res) => {
    
    let user = existeUsuario(req.params.id);
    if(!user){
        res.status(404).send('El usuario no fue enonctrado');
        return;
    }
    const schema = Joi.object({
       nombre:  Joi.string().min(3).required()
    });
    let {error, value} = schema.validate({nombre: req.body.nombre});
    if(error){
        const mensajeError = error.details[0].message;
        res.status(400).send(mensajeError);
        return;
    }
    user.nombre = value.nombre;
    res.send(user); 
    
});

app.delete('/api/usuarios/:id', (req,res) => {
    let usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('el usuario no fue encontrado');
        return;
    }
    const index = usuarios.indexOf(usuario);
    usuarios.splice(index,1);

    res.send(usuario);
});


app.listen(port, () => { 
    console.log(`escuchando en el puerto ${port}`);
});

function existeUsuario(id){
    return (usuarios.find( u => u.id === parseInt(id)))
    
}

//function validarUsuario()