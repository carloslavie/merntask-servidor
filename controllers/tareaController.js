const Tarea = require('../models/Tarea');
const Proyecto = require('../models/Proyecto');
const { validationResult } = require('express-validator');
const router = require('../routes/usuarios');

exports.crearTarea = async(req, res) => {

    //revisar si hay errores
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()})
    }
    
    try {
        //Extraer el proyecto y verificar si existe
        const { proyecto } = req.body;

        const existeProyecto = await Proyecto.findById(proyecto);
        if(!existeProyecto){
            return res.status(404).json({msg:'Proyecto no encontrado'})
        }

        //Revisar si el proyecto actual pertenece al usuario autenticado
        if(existeProyecto.creador.toString() !== req.usuario.id){
            return res.status(401).json({msg:'No autorizado'})
        }

        //Creamos la tarea
        const tarea = new Tarea(req.body);
        await tarea.save();
        res.json({tarea});


    } catch (error) {
        console.log(error);
        return res.status(500).send('Hubo un error')
    }
}

//Obtener las tareas por proyecto
exports.obtenerTareas = async(req, res) => {

    try {

        //Extraer el proyecto y verificar si existe
        const { proyecto } = req.query;//cuando lo mandan por params, ver get de tareas en cliente/tareaState

        const existeProyecto = await Proyecto.findById(proyecto);
        if(!existeProyecto){
            return res.status(404).json({msg:'Proyecto no encontrado'})
        }

        //Revisar si el proyecto actual pertenece al usuario autenticado
        if(existeProyecto.creador.toString() !== req.usuario.id){
            return res.status(401).json({msg:'No autorizado'})
        }

        const tareas = await Tarea.find({proyecto}).sort({creado: -1 });
        res.json({tareas});

    } catch (error) {
        console.log(error);
        return res.status(500).send('Hubo un error')
    }
}

exports.actualizarTarea = async(req, res) =>{
    
    try {        
        
        //Extraer el proyecto y verificar si existe
        const { proyecto, nombre, estado } = req.body;
        
        //Revisar si la tarea existe
        let tarea = await Tarea.findById(req.params.id);

        if(!tarea){
            return res.status(404).json({msg:'No existe esa tarea'})
        }

        //Extraer proyecto para asegurarnos que la persona que lo edita pertenece al mismo
        const existeProyecto = await Proyecto.findById(proyecto);
        
        //Revisar si el proyecto actual pertenece al usuario autenticado
        if(existeProyecto.creador.toString() !== req.usuario.id){
            return res.status(401).json({msg:'No autorizado'})
        }
        
        //Crear objeto con la nueva informacion
        const nuevaTarea = {};

        nuevaTarea.nombre = nombre;
        nuevaTarea.estado = estado;
        
        //Guardar nueva tarea
        tarea = await Tarea.findOneAndUpdate({_id: req.params.id}, nuevaTarea, {new: true});

        res.json({tarea});
        
    } catch (error) {
        console.log(error);
        return res.status(500).send('Hubo un error');
    }
}

exports.eliminarTarea = async(req, res) => {

    try {                
        //Extraer el proyecto y verificar si existe
        const { proyecto } = req.query;
        
        //Revisar si la tarea existe
        let tarea = await Tarea.findById(req.params.id);

        if(!tarea){
            return res.status(404).json({msg:'No existe esa tarea'})
        }

        //Extraer proyecto para asegurarnos que la persona que lo edita pertenece al mismo
        const existeProyecto = await Proyecto.findById(proyecto);
        
        //Revisar si el proyecto actual pertenece al usuario autenticado
        if(existeProyecto.creador.toString() !== req.usuario.id){
            return res.status(401).json({msg:'No autorizado'})
        }
        
        //Eliminar
        await Tarea.findOneAndRemove({_id: req.params.id});
        res.json({msg: 'Tarea eliminada'});
        
    } catch (error) {
        console.log(error);
        return res.status(500).send('Hubo un error');
    }
}