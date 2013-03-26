var mongoose = require('mongoose')
mongoose.connect("mongodb://192.168.122.172/chapinsubastas") // 192.168.128.1272:17
//mongoose.connect("mongodb://localhost/chapinsubastas") // 192.168.128.1272:17

var Schema = mongoose.Schema

var BIDS_Schema = new Schema({
	codprod: Number,
	nombre: String,
	bid: Number
})

var PRODUCTO_Schema = new Schema({
	codprod: Number,
	nombre: String,
	descripcion: String,
	foto: String,
	fecha: Date
})

var Producto_Model = mongoose.model('productos', PRODUCTO_Schema)
var Oferta_Model = mongoose.model('ofertas', BIDS_Schema)

exports.connect_principal = function (socket) {
	stock = function(){
		
		Oferta_Model.aggregate( // visto en http://docs.mongodb.org/manual/tutorial/aggregation-examples/
			{ $group: {_id: '$codprod', conteo: {$sum: 1}} },
			{ 	$project: {_id:0, codprod:1, conteo:1}, 
				$sort: {conteo:-1}
			},
			{	$limit: 5	},
			function(err, res){
				for (var i = 0; i < 5; i ++){
					Producto_Model.find({codprod: res[i]._id}, {_id:0, descripcion:0, fecha:0}, function(err, topXProd){
						socket.emit('stockProd', topXProd[0])
					})
				}
				var consulta_top5Bids = Oferta_Model.find({}, {_id:0, codprod:0}).sort('-bid').limit(5)
				consulta_top5Bids.exec(function(err, top5Bids){
					socket.emit('stockBids', top5Bids)
				})
			}
		)
		
	}
	stock()
	socket.on('restock', stock)
}
exports.connect_producto = function  (socket) {
	socket.on('conn', function(params){
		var consulta_producto = Producto_Model.find({codprod:params.codprod}, {_id:0})
		var consulta_top5Bids = Oferta_Model.find({codprod:params.codprod}, {_id:0, codprod:0}).sort('-bid').limit(5)
		var consulta_menorBid = Oferta_Model.find({codprod:params.codprod}, {_id:0, codprod:0}).sort('bid').limit(1)
		var consulta_count = Oferta_Model.find({codprod:params.codprod}).count()
		/*
		 * enviar 4 cosas en este orden: 
		 * 1.) el producto como objeto, 5
		 * 2.) los top 5 bid (ofertados) como vector (si es necesario), 
		 * 3.) el menor bid (ofertado) como objeto, 
		 * 4.) y el tamano de bids (numero total de ofertados) como entero
		 * */
		consulta_producto.exec(function(err, docs){
			if (err != null || docs.length == 0){
				socket.emit('error', {message: 'Producto ' + params.codprod + ' no existe'})
			} else {
				consulta_top5Bids.exec(function(err, top5Bids){
					consulta_menorBid.exec(function(err, menorBid){
						consulta_count.exec(function(err, count){
							socket.emit('cargaProducto', {
								producto:docs[0], 
								top5Bids: top5Bids,
								menorBid: menorBid[0], 
								totalBids: count
							})
						})
					})
				})	
			}	
		})
		
	})
	socket.on('restock', function(params){
		var consulta_top5Bids = Oferta_Model.find({codprod:params.codprod}, {_id:0, codprod:0}).sort('-bid').limit(5)
		var consulta_menorBid = Oferta_Model.find({codprod:params.codprod}, {_id:0, codprod:0}).sort('bid').limit(1)
		var consulta_count = Oferta_Model.find({codprod:params.codprod}).count()
		/*
		 * enviar 4 cosas en este orden: 
		 * 2.) los top 5 bid (ofertados) como vector (si es necesario), 
		 * 3.) el menor bid (ofertado) como objeto, 
		 * 4.) y el tamano de bids (numero total de ofertados) como entero
		 * */
		consulta_top5Bids.exec(function(err, top5Bids){
			if (err != null){
				socket.emit('error', {message: 'Producto ' + params.codprod + ' no existe'})
			} else {
				consulta_menorBid.exec(function(err, menorBid){
					consulta_count.exec(function(err, count){
						socket.emit('restocked', {
							top5Bids: top5Bids,
							menorBid: menorBid[0], 
							totalBids: count
						})
					})
				})
			}
		})
		
	})
	socket.on('newOferta', function  (codprod, data) {
		//console.log("bid de id", codprod)
		new Oferta_Model({
			codprod: codprod,
			nombre: data.nombre,
			bid: data.bid
		}).save(function(err, docs){
			//console.log('guardar')
			//console.log(docs)
			socket.emit('nuevobid', data)
		})
	})
}

exports.insert = function(req, res){
	if (req.query.codprod && req.query.usr && req.query.bid){
		new Oferta_Model({
			codprod: req.query.codprod,
			nombre: req.query.usr,
			bid: req.query.bid
		}).save(function(err, docs){
			//console.log('guardar')
			//console.log(docs)
		})
	}
	res.end()
}
