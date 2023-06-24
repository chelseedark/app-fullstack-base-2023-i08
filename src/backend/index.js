/*Configuración, importaciones y datos*/

var PORT = 3000;

var express = require('express');
var app = express();
var utils = require('./mysql-connector');

/*Para parsear application/json*/
app.use(express.json());
/*Para servir ficheros estáticos*/
app.use(express.static('/home/node/app/static/'));

/*Validación de datos*/
function validateInput(datos) {
    return ((datos.name != "" && datos.hasOwnProperty("name")) && (datos.hasOwnProperty("type")));
}

/*Lista los dispositivos de la base de datos*/
app.get('/listDevices/', function (req, res) {
    console.log("Se solicitó ver la base de datos");
    utils.query('SELECT * FROM Devices', (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(400).send(err);
        }
        res.status(200).json(rows);
    });
});

/*Agrega un dispositivo con los datos enviados en el cuerpo del POST*/
app.post("/insertDevice", function (req, res) {
    console.log("Se solicitó insertar en la base de datos");
    let data = req.body;
    console.log(data);
    
    if (!validateInput(data)) {
        return res.status(300).send("Bad Data");
    }

    let querydescription = req.body.description || "";
    let querystate = req.body.state === 0 || req.body.state === 1 ? req.body.state : 0;
    let querydimmable = req.body.dimmable === 0 || req.body.dimmable === 1 ? req.body.dimmable : 0;

    let query = 'INSERT INTO Devices (name, description, type, state, dimmable) VALUES (?, ?, ?, ?, ?)';
    let values = [req.body.name, querydescription, req.body.type, querystate, querydimmable];

    utils.query(query, values, (err, response) => {
        if (err) {
            console.error(err);
            return res.status(300).send("Error creando dispositivo");
        }
        res.status(200).json(response);
    });
});

/*Cambia el estado del dispositivo*/
app.post("/updateState", function (req, res) {
    console.log("Se solicitó un cambio en la intensidad del dispositivo en un valor de " + req.body.state);
    let data = req.body;
    let query = 'UPDATE Devices SET state = ? WHERE id = ?';
    let values = [req.body.state, req.body.id];

    utils.query(query, values, (err, response) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error actualizando el estado del dispositivo");
        }
        res.status(200).json(response);
    });
});

/*Cambiar cualquier campo del dispositivo*/
app.post("/updateDevice", function (req, res) {
    console.log("Se pidió cambiar valores del dispositivo en la base de datos, con estos datos");
    console.log(req.body);
    let deviceId = req.body.id;
    let queryDevice = 'SELECT * FROM Devices WHERE id = ?';
    
    utils.query(queryDevice, [deviceId], (err, device) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error obteniendo el dispositivo");
        }
        
        if (device.length > 0) {
            let updateFields = {
                name: req.body.name || device[0].name,
                description: req.body.description || device[0].description,
                type: (req.body.type === 0 || req.body.type === 1) ? req.body.type : device[0].type,
                state: (req.body.state === 0 || req.body.state === 1) ? req.body.state : device[0].state,
                dimmable: (req.body.dimmable === 0 || req.body.dimmable === 1) ? req.body.dimmable : device[0].dimmable
            };

            let query = 'UPDATE Devices SET name = ?, description = ?, type = ?, state = ?, dimmable = ? WHERE id = ?';
            console.log(query);

            let values = [
                updateFields.name,
                updateFields.description,
                updateFields.type,
                updateFields.state,
                updateFields.dimmable,
                deviceId
            ];

            utils.query(query, values, (err, response) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Error actualizando el dispositivo");
                }
                res.status(200).json(response);
            });
        } else {
            res.status(300).send("Bad Data");
        }
    });
});


/* Para borrar un dispositivo de la base de datos*/
app.post("/deleteDevice", function (req, res) {
    console.log("Se pidió eliminar un dispositivo de la base de datos");
    let deviceId = req.body.id;
    let query = 'DELETE from Devices WHERE id = ?';
    console.log(query);

    utils.query(query, [deviceId], (err, response) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error eliminando el dispositivo");
        }

        res.status(200).json(response);
    });
});


/*Validación de un usuario*/
app.post('/loginUser', function(req, res) {
    console.log("Se pidió la validación de un usuario");
    let data = req.body;

    utils.query('SELECT COUNT(*) AS count FROM `Users` WHERE username = ? AND password = ?', 
    [data.username, data.password], function(err, response, field) {

        if (err) {
            console.error(err);
            return res.status(500).send("Error en la validación del usuario");
        }
        
        if (response[0].count === 0) {
            return res.status(401).send("Error de autenticación");
        } 
        
        res.status(200).send("OK");
        console.log("Usuario validado");
        
    });
});


app.listen(PORT, function (req, res) {
    console.log("NodeJS API corriendo correctamente");
});

/*Fin de código*/
