$( document ).ready(function() {
 	var params = $.deparam(window.location.search);
 	if(params.room_name !== undefined){
 		$('input[name="room"]').val(`${params.room_name}`);
 	}
})
