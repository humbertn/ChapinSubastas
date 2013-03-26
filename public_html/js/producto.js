jQuery(document).ready(function (){
	// Comienza la parte de Sockets
	socket_cliente = io.connect('/bids') // unica variable global
	socket_cliente.on('connect', function(){
		socket_cliente.emit('conn', {codprod:jQuery('#codprod').val()}) // llamada inicial
	})
	socket_cliente.on('cargaProducto', function(data){
		productoItem.set(data.producto) // llenar el model de producto
		cargar(data)
	})
	requerirActualizacion = function (){
		socket_cliente.emit('restock', {codprod:productoItem.get('codprod')})
	}
	
	socket_cliente.on('restocked', function(data){
		cargar(data)
	})
	
	socket_cliente.on('error', function(data){
		$(".alert-error").removeClass("hide").find('p').text(data.message) // mensaje de error del servidor
	})
	socket_cliente.on('disconnect', function () {$(".alert-error").removeClass("hide")}) // desaparecio el servidor
	
	socket_cliente.on('nuevobid', function(data){
		bidList.add(data)
	})
})
var ProductoItem = Backbone.Model.extend({})
var BidItem = Backbone.Model.extend({
	defaults: {bid:'0.25', nombre:'David'},
	sendNewBid: function(newBid, nombre){
		this.set({bid: newBid, nombre: nombre})
		socket_cliente.emit('newOferta', productoItem.get('codprod'), this.toJSON())
		this.set({bid:'0.25'}) // valor default
		window.setTimeout(function(){
			$(".alert-success").addClass("hide")
		}, 3000)
		$(".alert-success").removeClass("hide")
	}
})

var productoItem = new ProductoItem(),
bidItem = new BidItem()

var BidList = Backbone.Collection.extend({model: BidItem})
var bidList = new BidList(), estadList = new BidList()

var EstadisticasView = Backbone.View.extend({
	initialize: function(){
		this.collection.on('reset', this.render, this)
	},
	render: function(){
		var maBidItem = this.collection.at(0), meBidItem = this.collection.at(1)
		$('#maQ').text(maBidItem.get('bid'))
		$('#maNom').text(maBidItem.get('nombre'))
		$('#meQ').text(meBidItem.get('bid'))
		$('#meNom').text(meBidItem.get('nombre'))
	}
}),
ProductoView = Backbone.View.extend({
	el: $('#producto-view'),
	initialize: function(){
		this.model.on("change", this.render, this)
	},
	events: {
		"click h3": "alertStatus"
	},
	alertStatus: function(e){
		alert('Hey you clicked the h3!')
	},
	render: function(){
		var attributes = this.model.toJSON()
		this.$el.find('legend').text(attributes.nombre)
		this.$el.find('span.codprod').text(attributes.codprod)
		this.$el.find('img').attr('src', attributes.foto)
		this.$el.find('p.lead').text(attributes.descripcion)
		this.$el.find('span.date').text(attributes.fecha)
		this.$el.find('input[type=datetime-local]').val(attributes.fecha.substr(0,16))
		document.title = attributes.nombre + document.title // cambiamos el titulo
	}
}), BidView = Backbone.View.extend({
	el: $('#bid-view'),
	events: {
		"keypress input[type=number]": "sendNewBid",
		"click button.btn": "sendNewBid"
	},
	initialize: function(){
		this.model.on('change', this.render, this)
		this.render()
	},
	sendNewBid: function(e){
		if (e.which == 13){
			this.model.sendNewBid(e.srcElement.value, this.$el.find('input[type=text]').val())
		} else if (e.type === 'click') {
			this.model.sendNewBid(this.$el.find('input[type=number]').val(), this.$el.find('input[type=text]').val())
		}
	},
	render: function(){
		this.$el.find('input[type=text]').val(this.model.get('nombre'))
		this.$el.find('input[type=number]').val(this.model.get('bid'))
	}
}), BidsView = Backbone.View.extend({
	tagName: 'li',
	template: _.template(
		'<p class="text-success">Q.<%= bid%> <%= nombre%>'
	),
	render: function(){
		this.$el.html(this.template(this.model.toJSON()))
		return this
	}
}), BidsListView = Backbone.View.extend({
	el: $('#bids-view'),
	initialize: function(){
		this.collection.on('add', this.addOne, this) // ni se utilza el metodo 'add' del collection
		this.collection.on('reset', this.render, this)
	},
	addOne: function(bidsItem){
		var bidsView = new BidsView({model: bidsItem})
		this.$el.append(bidsView.render().el)
	},
	render: function(){
		this.$el.find('li').remove() // quitar los elementos html anteriores
		this.collection.forEach(this.addOne, this)
	}
})

var estadisticasView = new EstadisticasView({collection: estadList}),
productoView = new ProductoView({model: productoItem}),
bidsListView = new BidsListView({collection: bidList}),
bidView = new BidView({model: bidItem})
function cargar(data){
	bidList.reset(data.top5Bids)
	
	estadList.reset([data.top5Bids[0], data.menorBid])
	
	$('.totalOfertas').text(data.totalBids)
	
	setTimeout(requerirActualizacion, 5000) // cada 5 segundos requerir actualizacion
}
