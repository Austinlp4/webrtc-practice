/**
 * Static HTTP Server
 *
 * Create a static file server instance to serve files
 * and folder in the './public' folder
 */

// modules
// var static = require( 'node-static' ),
//     port = 8080,
//     http = require( 'http' );

// // config
// var file = new static.Server( './public', {
//     cache: 3600,
//     gzip: true
// } );

// // serve
// http.createServer( function ( request, response ) {
//     request.addListener( 'end', function () {
//         file.serve( request, response );
//     } ).resume();
// } ).listen( port );

const WebSocket = require('ws');
 
const wss = new WebSocket.Server({ port: 8080 });

const users = {}
 
wss.on('connection', function connection(connection) {
  console.log('user connected')
  connection.on('message', function incoming(message) {
    let data;

    try{
        data = JSON.parse(message);
    } catch(e){
        console.log('Error parsing JSON');
        data = {};
    }

    switch(data.type){
        case "login":
            console.log("User logged in as", data.name);
            if(users[data.name]){
                sendTo(connection, {
                    type: "login",
                    success: false
                });
            }else{
                users[data.name] = connection;
                connection.name = data.name;
                sendTo(connection, {
                    type: "login",
                    success: true
                });
            }
            break;
        default:
            sendTo(connection, {
                type: "error",
                message: "Unrecognized command:" + data.type
            });
            break;
    }
  });
 
  connection.send('something');

  connection.on('close', function(){
      if(connection.name){
          delete users[connection.name];
      }
  });
});

function sendTo(conn, message){
    conn.send(JSON.stringify(message));
}