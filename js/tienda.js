TTienda = function(){
	var self = this;
	
	this.add = function(id,	nombre, fn){
		if (fn.before !== undefined) fn.before();
		
		db.transaction(function(tx) {
			tx.executeSql("INSERT INTO tienda (id, nombre) VALUES (?,?)", [id, nombre], function(tx, res) {
				if (fn.after !== undefined) fn.after();
			}, errorDB);
		});
 
	};
	
	this.truncate = function(fn){
		if (fn.before !== undefined) fn.before();
		
		db.transaction(function(tx) {
			tx.execSQL("delete from tienda", [], function(tx, res) {
				if (fn.after !== undefined) fn.after();
			}, errorDB);
		});
	}
};

function getTiendas(fn){
	if (fn.before != undefined)
		fn.before();
		
	$.get("http://www.neoprojects.com.pe/neotracking-web/public/api/tienda", function(resp){
		if (fn.after != undefined)
			fn.after(resp);
	}, "json");
}