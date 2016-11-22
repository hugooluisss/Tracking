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

/*
*
* Escribir archivo
*
*/
function escribirArchivo(nombre, contenido){
	window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0,
		function (fileSystem) {
			fileSystem.root.getFile(nombre, {create: true}, 
				function (fileEntry) {
					fileEntry.createWriter(function (writer) {
					writer.write(contenido);
				}
			);
		},
		errorSys);
	}, errorSys);
}