/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var db = null;
var app = {
	// Application Constructor
	initialize: function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady: function() {
		//Esto es para web
		
		try{
			db = openDatabase({name: "tracking.db"});
			console.log("Conexión desde phonegap OK");
			crearBD(db);
		}catch(err){
			db = window.openDatabase("tracking.db", "1.0", "Just a Dummy DB", 200000);
			crearBD(db);
			console.log("Se inicio la conexión a la base para web");
		}
	    
		//app.receivedEvent('deviceready');
		/*if (navigator.connection.type != Connection.NONE)
			alert("Si hay internet");
		else
			alert("No hay internet");
		*/	
		$("[action=acercaDe]").click(function(){
			$("#menuPrincipal, #menuPrincipal2").removeClass("in");
			
			$("#acercaDe").modal();
		});
		
		$("#acercaDe").on('show.bs.modal', function(){
			reposition($("#acercaDe"));
		});
        
		$("[vista=addProducto]").hide();
        
		$("#btnAddProducto").click(function(){
			$("[vista=addProducto]").show();
			$("[vista=home]").hide();
			
			$("#getTiendas").hide();
			$("#lstImg").find("img").remove();
		});
        
		$("#backToHome").click(function(){
			$("[vista=addProducto]").hide();
			$("[vista=home]").show();
		});
        
		$("[action=getTiendas]").click(function(){
			getTiendas({
				before: function(){
					alertify.log("Obteniendo la lista de tiendas del servidor");
					$("#menuPrincipal, #menuPrincipal2").removeClass("in");
				},
				after: function(resp){
					alertify.success("Se obtuvieron " + resp.length + " registros de tienda");
					
					var obj = new TTienda;
					obj.truncate({
						before: function(){
							$("#getTiendas").show();	
						},
						after: function(){
							$.each(resp, function(i, el){
								obj.add(el.id, el.name, {});
							});
							$("#getTiendas").hide();
							actualizarListaTiendas();
						}
					});
				}
			});
		});
		
		$("[action=getCode]").click(function(){
			cordova.plugins.barcodeScanner.scan(function(result){
				$("#txtCodigo").val(result.text);
			},function(error){
				alertify.error("Ocurrió un error al leer el código");
			});
		});
		
		$("[action=getImagen]").click(function(){
			if ($("#txtCodigo").val() == '')
				justify.error("Primero escanea el código");
			else if ($("#lstImg").find("img").length < 4){
				navigator.camera.getPicture(function(imageData) {
					var img = $("<img />");
					img.attr("src", imageData);
					//subirFotoPerfil(imageData);
					$("#lstImg").append(img);
					escribirArchivo($("#txtCodigo").val() + "/img" + $("#lstImg").find("img").length + ".txt", imageData);
				}, function(message){
					alertify.error("Ocurrio un error al subir la imagen");
				}, { 
					quality: 100,
					destinationType: Camera.DestinationType.FILE_URI,
					targetWidth: 250,
					targetHeight: 250,
					correctOrientation: true,
					allowEdit: false
				});
			}else
				alertify.error("Solo permiten 4 imágenes por código");
		});
		
		actualizarListaTiendas();
		
		$("[action=setTelefono]").click(function(){
			setTelefono();
		});
		
		$("#btnSave").click(function(){
			var tel = window.localStorage.getItem("telefono");
			if (tel == ''){
				alertify.error("Es necesario indicar tu número de teléfono");
				setTelefono();
			}
			if($("#txtCodigo").val() == ''){
				alertify.error("Escanea el código");
			}else if($("#lstImg").find("img").length < 1){
				alertify.error("Se necesita mínimo una imagen");
			}else if($("#txtTienda").attr("identificador") == ''){
				alertify.error("Selecciona una tienda");
			}else{
				navigator.geolocation.getCurrentPosition(function(position){
					alert('Latitude: '          + position.coords.latitude          + '\n' +
						'Longitude: '         + position.coords.longitude         + '\n' +
						'Altitude: '          + position.coords.altitude          + '\n' +
						'Accuracy: '          + position.coords.accuracy          + '\n' +
						'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
						'Heading: '           + position.coords.heading           + '\n' +
						'Speed: '             + position.coords.speed             + '\n' +
						'Timestamp: '         + position.timestamp                + '\n');
				}, function(error){
					alertify.error("No se pudo conectar");
				});
			}
		});
	}
};

app.initialize();

$(document).ready(function(){
	//app.onDeviceReady();
});

function setTelefono(){
	alertify.prompt("Escribe tu número telefónico", function (e, str) { 
		if (e){
			if (!isNaN(str) && str.length >= 10){
				window.localStorage.clear();
				window.localStorage.setItem("telefono", str);
				
				alertify.success("Teléfono almacenado");
			}else
				alertify.error(str + " No es un número telefónico válido");
		}
	});
}

function actualizarListaTiendas(){
	db.transaction(function(tx) {
		tx.executeSql("select * from tienda", [], function(tx, results){
			$("#getTiendas").show();
			
			var cont = 1;
			var rows = results.rows;
			var tiendas = new Array();
			$.each(rows, function(i, el){
				var data = new Array();
				data.value = el.clave;
				data.label = el.nombre
				tiendas.push(data);
			});
			$("#txtTienda").autocomplete({
				source: tiendas,
				focus: function(event, ui){
					$("#txtTienda").attr("identificador", "");
					
					$("#txtTienda").val(ui.item.label);
					$("#txtTienda").attr("identificador", ui.item.value);
					
					return false;
				},
				select: function(event, ui){
					console.log(ui.item);
					$("#txtTienda").val(ui.item.label);
					$("#txtTienda").attr("identificador", ui.item.value);
					
					return false;
				}
			});
			
			$("#getTiendas").hide();
		}, errorDB);
	});
}