//#!/usr/bin/env node
/**
 * Module dependencies.
 */

var express = require('express')
  , io = require('socket.io')
  , routes = require('./routes')
  , productos = require('./productos')
  , chatter = require('chatter')
  

/*var cluster = require('cluster')
var numCPUs = require('os').cpus().length
if (cluster.isMaster){
	// Fork workers
	for(var i = 0; i < numCPUs; i++){
		cluster.fork()
	}
	cluster.on('death', function(){
		console.log('worker ' + worker.pid + ' died')
		cluster.fork()
	})
} else {*/
//io.set('log level', 1)
var app = module.exports = express.createServer()
	, chat_room = io.listen(app, {log:false})
	
sockets = chat_room.of("/chats")
chatter.set_sockets(sockets)

sockets.on('connection', function (socket) {
  chatter.connect_chatter({
	socket: socket,
	username: socket.id
  })
})

sockets = chat_room.of("/principal")
sockets.on('connection', function(socket){
	productos.connect_principal(socket)
})

sockets = chat_room.of("/bids")
sockets.on('connection', function (socket) {
  productos.connect_producto(socket)
})

app.configure(function(){
  app.set('views', __dirname + '/views')
  app.set('view engine', 'ejs')
  app.use(express.bodyParser())
  //app.use(express.favicon(__dirname + '/public_html/img/favicon.ico'))
  app.use(express.favicon())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(express.static(__dirname + '/public_html'))
})

/*app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
})

app.configure('production', function(){
  app.use(express.errorHandler())
})*/

// Routes

app.get('/', routes.index)

app.get('/producto', routes.index)

app.get('/producto/:codprod',  routes.producto)

app.get('/insert', productos.insert)

app.get('/chat', routes.chat)

app.listen(3000, function(){
  //console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env)
})
//}
