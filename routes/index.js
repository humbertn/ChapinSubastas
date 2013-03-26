
/*
 * GET home page.
 */
exports.index = function(req, res){
	
	scripts = ["/socket.io/socket.io.js", "/js/jquery-1.7.2.min.js", 
				"/js/bootstrap.min.js",
				"/js/underscore-min.js", "/js/backbone-min.js", 
				"/js/index.js"]
	stylesheets = ["/css/bootstrap.min.css"]
	res.render('index.ejs', {titulo: 'Inicio', scripts: scripts, stylesheets: stylesheets});
};
exports.producto = function(req, res) {
	scripts = ["/socket.io/socket.io.js", "/js/jquery-1.7.2.min.js", 
				"/js/bootstrap.min.js",
				"/js/underscore-min.js", "/js/backbone-min.js", 
				"/js/producto.js"]
	stylesheets = ["/css/bootstrap.min.css"]
	res.render('producto.ejs', {titulo: '', scripts:scripts, stylesheets:stylesheets, codprod:req.params.codprod});
}
exports.chat = function(req, res){
	scripts = ["/socket.io/socket.io.js", "/js/jquery-1.7.2.min.js", "/js/chat.js"]
	stylesheets = ["/css/chat.css"]
	res.render('chat.ejs', {titulo: 'Chat - Chapin Subastas', scripts:scripts, stylesheets:stylesheets})
}
