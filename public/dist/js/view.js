(function(window){

	'use strict';

	var host_all = window.location.host;

	var socket = io.connect(host_all);

	var $ppt_list = $('#ppt_list');
	var $selector_wrap = $('.selector-wrap');
	var $follow_btn = $('#follow_btn');

	var $ppt_list_native = $ppt_list[0];

	var ppt_model = {
	}

	var move_page = 0;

	/* flag var */
	var internet_connect = false;
	var isFollow = true;


	/* defalut var */
	var tap = (document.ontouchend !== undefined) ? "touchstart" : "click";

	/* touchEvent */
	var touchHandler = (function(wrapper, opt){
		function TouchHandler (wrapper, opt) {
			var that = this;

			this.startX = 0;
			this.startY = 0;

			this.callback = opt;

			wrapper.on('touchstart',function(e){
				that.touchstart.call(that,e);
			});
			wrapper.on('touchmove',function(e){
				that.touchmove.call(that,e);
			});
			wrapper.on('touchend',function(e){
				that.touchend.call(that,e);
			});
			wrapper.on('toucncancel',function(e){
				that.toucncancel.call(that,e);
			});
		}

		TouchHandler.prototype.touchstart = function (e) {
			this.startX = e.changedTouches[0].pageX;
			this.startY = e.changedTouches[0].pageY;
		}
		TouchHandler.prototype.touchmove = function (e) {
		}
		TouchHandler.prototype.touchend = function (e) {
			var nowX = e.changedTouches[0].pageX;
			var nowY = e.changedTouches[0].pageY;

			var disX = nowX - this.startX;

			if( disX > 100 ){
				this.callback.moveNext && this.callback.moveNext();
			} else if ( disX < -100 ){
				this.callback.movePre && this.callback.movePre();
			}
		}
		TouchHandler.prototype.toucncancel = function (e) {

		}

		return new TouchHandler(wrapper, opt);
	}($(document.body), {
		movePre : function() {
		  if(!isFollow && move_page < ppt_model.length-1){
		   moveTo( move_page + 1 );
		  }
		},
		moveNext : function() {
		  if(!isFollow && move_page > 0){
		    moveTo( move_page - 1 );
		  }
		}
	}));

	var Qrcode = {
		hadSetQrcoded : false,
		$qrcodeWrap : $('.qrcode-wrap'),

		show : function(){
			Qrcode.$qrcodeWrap.addClass("show");		
		},
		hide : function(){
			Qrcode.$qrcodeWrap.removeClass("show");		
		},
		make : function(){
			//qrcode
			var qrcode = new QRCode($('.qrcode')[0], {
			    width : 300,//设置宽高
			    height : 300
			});

			if(internet_connect){
				qrcode.makeCode("http://119.29.26.68:3000/view.html");
			}else {
				qrcode.makeCode("http://"+ppt_model.local_ip + ":3000/controller.html");
			}

			Qrcode.hadSetQrcoded = true;
		}
	}

	socket.on('connect', function () {
		var ppt_item_length = $ppt_list.find('.ppt-item').length;
		socket.emit('join',"view",ppt_item_length);
	});

	socket.on('connected', function (ppt_model_server) {
		ppt_model = ppt_model_server;

		if(!Qrcode.hadSetQrcoded){
			Qrcode.make();
		}
		

	});

	socket.on('screen-shower',function () {
		$follow_btn.css("display","none");
	});

	socket.on('move-to',function (page) {
		ppt_model.page = page;
		if(isFollow){
		  moveTo(ppt_model.page);
		}
		
	});

	/* Dom event */
	$follow_btn.on(tap, function(e){
		isFollow = !isFollow;
		if(isFollow){
			$follow_btn.addClass("active");

	  		moveTo(ppt_model.page);
		}else {
	  		$follow_btn.removeClass("active");
		}
	});

	stopWindowDrag();

	//切换函数
	function moveTo (page) {
		move_page = page;
		console.log(page);

		var p_index = $ppt_list_native.className.indexOf('ppt-item'),
			pl_index =$ppt_list_native.className.indexOf(' ',p_index);

		var back_class = "";
		if(p_index != -1 && pl_index === -1){
			back_class = $ppt_list_native.className.slice(p_index);
		}else{
			back_class = $ppt_list_native.className.slice(p_index,pl_index);
		}

		$ppt_list.removeClass(back_class);
		$ppt_list.addClass('ppt-item'+(page+1));
	}

	function stopWindowDrag(){

	  var selScrollable = '.scrollable';
	  // Uses document because document will be topmost level in bubbling
	  $(document).on('touchmove',function(e){
	    e.preventDefault();
	  });
	  // Uses body because jQuery on events are called off of the element they are
	  // added to, so bubbling would not work if we used document instead.
	  $('body').on('touchstart', selScrollable, function(e) {
	    if (e.currentTarget.scrollTop === 0) {
	      e.currentTarget.scrollTop = 1;
	    } else if (e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.offsetHeight) {
	      e.currentTarget.scrollTop -= 1;
	    }
	  });
	  // Stops preventDefault from being called on document if it sees a scrollable div
	  $('body').on('touchmove', selScrollable, function(e) {
	    e.stopPropagation();
	  });
	  $('body').on('touchmove', selScrollable, function(e) {
	    // Only block default if internal div contents are large enough to scroll
	    // Warning: scrollHeight support is not universal. (http://stackoverflow.com/a/15033226/40352)
	    if($(this)[0].scrollHeight > $(this).height()) {
	        e.stopPropagation();
	    }

	});
	}

}(window));