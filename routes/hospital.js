var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');


// Obtener todos los Hospitales
app.get('/', (req, res) => {

    var desde = req.query.desde;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });                
                
            }
        );
});

// Crear un nuevo hospital
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        hospital: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });    

});

// Eliminar un Hospital
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No Existe un hospital con el id ' + id,
                errors: {message: 'No Existe un hospital con el id ' + id }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

});

// Actualizar un Hospital
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        
        if (err) {
            return res.status(500).json({
                ok: true,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: true,
                mensaje: 'El hospital con el id' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese Id'}
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id
        
        hospital.save( (err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });

});



module.exports = app