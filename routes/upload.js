var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

// default options
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion validos 
    var colecciones = ['hospitales', 'medicos', 'usuarios'];

    if(colecciones.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Coleccion no es valida',
            errors: { message: 'Tipo de coleccion no valida' }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length -1];

    // Solo estas extensiones permitimos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0 ) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    //Mover el archivo del temporal al path
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirporTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extensionArchivo: extensionArchivo
        // })


    })

    

});


function subirporTipo(tipo, id, nombreArchivo, res){

    if (tipo === 'usuarios'){

        Usuario.findById(id, (err, usuario) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No se encontro el usuario',
                    errors: err
                });

            } else {
                var pathViejo = './uploads/usuarios/' + usuario.img;

                // Si existe elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo,(err => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Ocurrio un error al eliminar Imagen anterior',
                                errors: err
                            });
                        }
                    }));
                }

            }            

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar la imagen del usario',
                        errors: err
                    });
                } else {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });

                }                
                

            });

        });

    }

    if (tipo === 'medicos'){

        Medico.findById(id, (err, medico) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No se encontro el medico',
                    errors: err
                });

            } else {
                var pathViejo = './uploads/medicos/' + medico.img;

                // Si existe elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo,(err => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Ocurrio un error al eliminar Imagen anterior',
                                errors: err
                            });
                        }
                    }));
                }

            }            

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar la imagen del medico',
                        errors: err
                    });
                } else {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        medico: medicoActualizado
                    });

                }                
                

            });

        });

    }

    if (tipo === 'hospitales'){

        Hospital.findById(id, (err, hospital) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'No se encontro el hospital',
                    errors: err
                });

            } else {
                var pathViejo = './uploads/hospitales/' + hospital.img;

                // Si existe elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo,(err => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Ocurrio un error al eliminar Imagen anterior',
                                errors: err
                            });
                        }
                    }));
                }

            }            

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar la imagen del hospital',
                        errors: err
                    });
                } else {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hospital: hospitalActualizado
                    });

                }                
                

            });

        });

    }

}


module.exports = app