(function(window){

  'use strict';

  var host_all = window.location.host;

  var socket = io.connect(host_all);

  var 
    $ppt_list = $('#ppt_list'),
    $selector_wrap = $('.selector-wrap'),
    $selector_list = $('#selector_list'),
    $drapBtn =$('#drap_btn');

  var ppt_list = $ppt_list[0];

  var backitem = null;

  var ppt_model = {
  }

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
  }($('.back-broad'), {
  	"movePre" : function() {
  	  if(ppt_model.page < ppt_model.length-1){
  	    socket.emit('change-page', ( ppt_model.page + 1 ));
  	  }
  	},
  	"moveNext" : function() {
  	  if(ppt_model.page > 0){
  	    socket.emit('change-page', ( ppt_model.page - 1 ));
  	  }
  	}
  }));

  socket.on('connect', function () {
    socket.emit('join',"controller");
  });

  socket.on('connected', function (ppt_model_server) {
    if(ppt_model.length != undefined){
    	return;
    }
    if(ppt_model_server.length != 0){
      ppt_model = ppt_model_server;
      bindSelector();
    }else {
      setTimeout(function(){
        socket.emit('join',"controller");
      }, 5000);
    }
  });

  socket.on('move-to',function (page) {
    moveTo(page);
  });

  /*
  * Dom event
  */

  $drapBtn.clicked = false;
  $drapBtn.on('touchstart',function(e){
    e.preventDefault();

    if(!this.clicked){
      $selector_wrap.addClass('show');

      this.clicked = !this.clicked;
    }else {
      $selector_wrap.removeClass('show');

      this.clicked = !this.clicked;
    }
  });

  stopWindowDrag();


  function moveTo (page) {

    backitem && backitem.removeClass('left-page-out');
    backitem && backitem.removeClass('right-page-out');
    backitem = $('.box'+(ppt_model.page+1));
    var nowitem = $('.box'+(page+1));

    console.log(backitem);
    console.log(nowitem);

    backitem.removeClass('left-page-in');
    backitem.removeClass('right-page-in');

    if(page>ppt_model.page){
      console.log('bigger');
      backitem.addClass('left-page-out');
      nowitem.addClass('left-page-in');
    }else if(page < ppt_model.page){
      console.log('smaller');
      backitem.addClass('right-page-out');
      nowitem.addClass('right-page-in');
    }else {
      nowitem.addClass('left-page-in');
    }

    ppt_model.page = page;
    console.log(page);

    var back_class = getTypeClass(ppt_list, 'ppt-item');

    $ppt_list.removeClass(back_class);
    $ppt_list.addClass('ppt-item'+(page+1));
  }

  function bindSelector(){
    var select_item = $('.select-item');

    for(var i=1,j=0; i< ppt_model.length+1; i++){
      var back_class = getTypeClass(select_item[j] , 'box');
      var number = sliceRest(back_class, 'box');

      if(i!=number){
        var new_select_item = document.createElement('div');
        new_select_item.className = 'select-item box' + i ;
        new_select_item.innerHTML = '<div class="select-item-inner">'+
  					'<h1 class="hint-words">' + i + '</h1>' +
  				'</div>';

        $(new_select_item).on('click', (function(i){
        	return function(e){
            socket.emit('change-page', (i-1));
          }
    	  }(i)));

        if(number != -1){
          $(new_select_item).insertAfter($('.select-item.box'+(i-1)));
        }else{
          $selector_list.append(new_select_item);
        }
        
      }else{
        $(select_item[j]).on('click', (function(i){
        	return function(e){
            socket.emit('change-page', (i-1));
          }
    	  }(i)));

        j++;
      }
    }

  }

  function getTypeClass (item, str) {
    if(!item || !str){
      return false;
    }

    var back_class = "";

    var p_index = item.className.indexOf(str),
      pl_index =item.className.indexOf(' ',p_index);

    if(p_index != -1 && pl_index === -1){
      back_class = item.className.slice(p_index);
    }else{
      back_class = item.className.slice(p_index,pl_index);
    }

    return back_class;
  }

  function sliceRest (s_str, slice_str) {
    if(!s_str || !slice_str){
      return -1;
    }
    return s_str.slice(slice_str.length);
  }

  /* my change of default prototype */
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
    $('body').on('touchmove', selScrollable, function(e) {
      // Only block default if internal div contents are large enough to scroll
      // Warning: scrollHeight support is not universal. (http://stackoverflow.com/a/15033226/40352)
      if($(this)[0].scrollHeight > $(this).height()) {
          e.stopPropagation();
      }

    });
  }


}(window));
