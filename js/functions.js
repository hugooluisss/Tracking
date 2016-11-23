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
function crearBD(){
	db.transaction(function(tx){
		//tx.executeSql('drop table if exists tienda');
		
		tx.executeSql('CREATE TABLE IF NOT EXISTS tienda (clave integer primary key, nombre text)', [], function(){
			console.log("tabla tienda creada");
		}, errorDB);
		
		tx.executeSql('CREATE TABLE IF NOT EXISTS codigo (codigo integer primary key, celular text, obs text, lat float, lng float, flag text, tienda integer, foto1 text, foto2 text, foto3 text, foto4 text)', [], function(){
			console.log("tabla codigos creada");
		}, errorDB);
	});
}


/*
*
* Error en la base de datos
*
*/

function errorDB(tx, res){
	console.log("Error: " + res.message);
}

/*
*
* Error control
*
*/

function errorSys(err){
	console.log("Error: " + err.code);
}

function readAsText(file) {
	var reader = new FileReader();
	reader.onloadend = function(evt) {
		console.log("Read as text");
		console.log(evt.target.result);
		alert("content : "+evt.target.result);
	};
	reader.readAsText(file);
}