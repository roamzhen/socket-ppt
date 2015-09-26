'use strict';

var express = require('express');
var app = express();
var os = require('os');

// 加载hbs模块
var hbs = require('hbs');

// 获取本地IP
var local_ip = require('./asset/getlocal')(os);

// 设定views变量，意为视图存放的目录
app.set('views', 'views');

// 设定view engine变量，意为网页模板引擎
app.set('view engine', 'jade');

// 设定静态资源
app.use(express.static(__dirname + '/public/dist'));

// 设定路由
var routes = require('./routes')(app);

var server = require('http').createServer(app);

server.listen(3000);

var io = require('socket.io')(server);

/**
* Data model
*/

var ppt = {
	"controll" : {
		"connected" : false
	},
	"view" : {
		"page" : 0,
		"length" : 0,
		"connectedList" : [
		]
	}

}

/*
* 监听
*/

io.sockets.on('connection', function(socket) {
	socket.on('join', function (type, view_length) {
		switch(type){
			case 'view':
				if(view_length != 0 && ppt.view.length === 0){
					ppt.view.length = view_length;
					//socket.emit('screen-shower', ppt.view.page);
				}

				socket.emit('connected', {
					"page" : ppt.view.page,
					"length" : ppt.view.length,
					"local_ip": local_ip
				});
				socket.emit('move-to', ppt.view.page);
				break;
			case 'controller':
				socket.emit('connected', {
					"page" : ppt.view.page,
					"length" : ppt.view.length
				});
				socket.emit('move-to', ppt.view.page);
				break;
			default:
				console.log('worry connection type!!');
				return;
				break;
		}

	});


	socket.on('change-page', function (page, fn) {
		console.log(page);
		ppt.view.page = page;
		socket.emit('move-to', page);
		socket.broadcast.emit('move-to', page);
		
		fn && fn();
	});

});

