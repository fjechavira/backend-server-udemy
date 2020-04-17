var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


// Obtener todos los Medicos
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medico: medicos,
                        total: conteo
                    });
                });
                
                
            }
        );
});

// Crear un nuevo medico
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    
    // Obtener el Id del Hospital buscandolo por el nombre que nos va proporcionar el usuario
    Hospital.findOne({nombre: body.hospital}, (err, idHospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!idHospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales invalidas para la busqueda',
                errors: err
            });
        }

        medico.hospital = idHospital.id;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear medico',
                    errors: err
                });
            }           

            res.status(201).json({
                ok: true,
                medico: medicoGuardado
            });

        });           
    });
});

// Actualizar un medico
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        
        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: true,
                mensaje: 'El medico con el id' + id + 'no existe',
                errors: { message: 'No existe un medico con ese Id'}
            });
        }

        // Valido si el Id del Hospital que quiere editar es Valido
        Hospital.findOne({nombre: body.hospital}, (err, idHospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }

            if (!idHospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El Hospital ingresado no es valido',
                    errors: err
                });
            }

            medico.nombre = body.nombre;
            medico.usuario = req.usuario._id,
            medico.hospital = idHospital.id;

            medico.save( (err, medicoGuardado) => {

                if (err) {
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Error al actualizar medico',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    medico: medicoGuardado,
                    mensaje: 'Medico Editado correctamente'
                });

            });
            
            
        });

        

        

        // console.log('Los datos a editar son: ', medico);
        
        

    });

});

// Eliminar un medico
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No Existe un medico con el id ' + id,
                errors: {message: 'No Existe un medico con el id ' + id }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoEliminado
        });
 
    });

});

module.exports = app