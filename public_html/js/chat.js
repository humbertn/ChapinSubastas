jQuery(document).ready(function () {
	var log_chat_message = function  (message, type) {
		var li = jQuery('<li />').text(message);
		
		if (type === 'system') {
			li.css({'font-weight': 'bold'});
		} else if (type === 'leave' || type === 'error') {
			li.css({'font-weight': 'bold', 'color': '#F00'});
		}
				
		jQuery('#chat_log').append(li);
	};

	var socket = io.connect('/chats');

	socket.on('entrance', function  (data) {
		log_chat_message(data.message, 'system');
	});

	socket.on('exit', function  (data) {
		log_chat_message(data.message, 'leave');
	});

	socket.on('chat', function  (data) {
		log_chat_message(data.message, 'normal');
	});

	socket.on('error', function  (data) {
		log_chat_message(data.message, 'error');
	});

	jQuery('#chat_box').keypress(function (event) {
		if (event.which == 13) {
			socket.emit('chat', {message: jQuery('#chat_box').val()});
			jQuery('#chat_box').val('');
		}
	});
});
