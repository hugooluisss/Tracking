function getTiendas(fn){
	if (fn.before != undefined)
		fn.before();
		
	$.get("http://www.neoprojects.com.pe/neotracking-web/public/api/tienda", function(resp){
		if (fn.after != undefined)
			fn.after(resp);
	}, "json");
}