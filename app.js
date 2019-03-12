var http = require('http');
var fs = require('fs');
var ent = require('ent');

// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Chargement de socket.io
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket,params) {
    console.log('une connection !');
    // Dès qu'on nous donne un pseudo, on vrifie la validite et si c est bon on requete la base
    socket.on('nouvelle_connexion', function(params) {
        console.log('identification tentee');
        login=params.login;
        pw=params.pw;
        login = ent.encode(login);

        const mysql = require('mysql');

        var conn = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'motdepasse',
            database: 'db_poc'
        });
        conn.connect(function(error) {
            if (!error) {
                console.log('connecte a la base de donnees !');
            } else {
                console.log('erreur !');
            }
        });

        conn.query("SELECT nom,password FROM compte",function(error,rows,fields) {
        //conn.query("SELECT nom,password FROM compte WHERE nom='"+login+"'",function(error,rows,fields) {
            var reponse='';
            var reponses=[];
            if (!error) {
                for (var i=0;i<rows.length;i++) {
                    if ((rows[i].nom===login) && (rows[i].password===pw)) {
                        console.log("mdp correct !");
                        console.log("le mdp de "+rows[i].nom+" est bien "+rows[i].password);
                        for (var j=0;j<rows.length;j++) { 
                            reponse={n:rows[j].nom,p:rows[j].password};
                            console.log(reponse);
                            reponses.push(reponse);
                        }
                        //var data="Tu est logue donc je dump la table par exemple\n"+reponse;
                        console.log(reponses);
                        socket.emit('resultat_requete', reponses);
                        break;
                    } else {
                        console.log("et non le mdp ne correspond pas !");
                    }
                
                }
            }
        });
    });
});

server.listen(8080);
