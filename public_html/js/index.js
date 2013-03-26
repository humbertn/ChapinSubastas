jQuery(document).ready(function (){
	// Comienza la parte de Sockets
	socket_cliente = io.connect('/principal') // unica variable global
	socket_cliente.on('stockBids', function(top5Bids){
		bidList.reset(top5Bids) // llenar la collection de models de ofertas
		setTimeout(requerirActualizacion, 5000) // cada 5 segundos requerir actualizacion
	})
	socket_cliente.on('stockProd', function(topXProd){
		if (productoList.length == 5)
			productoList.reset([])
		productoList.add(topXProd) // llenar la collection de models de ofertas
		if (productoList.length == 5)
			productoListView.render()
	})
	function requerirActualizacion(){
		socket_cliente.emit('restock')
	}
	socket_cliente.on('disconnect', function () {
		$(".alert-error").removeClass("hide")  // desaparecio el servidor
	})
})

var ver_input = $('input[type=number]')
ver_input.change(function(){
	$('#ver-a').attr('href', '/producto/'+ ver_input.val())
})

var BidItem = Backbone.Model.extend({}),
ProductoItem = Backbone.Model.extend({})

var BidList = Backbone.Collection.extend({model: BidItem}),
ProductoList = Backbone.Collection.extend({model: ProductoItem})

var bidList = new BidList(),
productoList = new ProductoList()

var BidsView = Backbone.View.extend({
	tagName: 'li',
	template: _.template(
		'<p class="text-success">Q.<%= bid%> <%= nombre%> '
	),
	render: function(){
		this.$el.html(this.template(this.model.toJSON()))
		return this
	}
}), BidsListView = Backbone.View.extend({
	el: $('#bids-view'),
	initialize: function(){
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
}), ProductoView = Backbone.View.extend({
	tagName: 'li',
	className: 'span9',
	template: _.template(
		'<a href="/producto/<%= codprod%>" class="thumbnail" target="_blank" rel="tooltip" data-placement="top" title="<%= nombre%>">' +
		'<img src="<%= foto%>"/>' +
		'<p><%= nombre%></a>'
	),
	render: function(){
		this.$el.html(this.template(this.model.toJSON()))
		return this
	}
}), ProductoListView = Backbone.View.extend({
	el: $('#productos-view'),
	addOne: function(productoItem){
		var productoView = new ProductoView({model: productoItem})
		this.$el.append(productoView.render().el)
	},
	render: function(){
		this.$el.find('li').remove()
		this.collection.forEach(this.addOne, this)
	}
})
bidsListView = new BidsListView({collection: bidList}),
productoListView = new ProductoListView({collection: productoList})
