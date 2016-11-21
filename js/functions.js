/*
*
* Centra verticalmente una ventana modal
*
*/
function reposition(modal) {
	dialog = modal.find('.modal-dialog');
	modal.css('display', 'block');
	
	// Dividing by two centers the modal exactly, but dividing by three 
	// or four works better for larger screens.
	dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
}

/*
*
* Crea la base de datos
*
*/
function crearBD(db){
	db.transaction(function(tx){
		tx.executeSql('CREATE TABLE IF NOT EXISTS tienda (id integer primary key, name text, json text)');
	});
}


/*
*
* Error en la base de datos
*
*/

function errorDB(tx, res){
	console.log("Error en tiendas: " + e.message);
}