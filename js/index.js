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
			if ($("#lstImg").find("img").length < 4){
				navigator.camera.getPicture(function(imageData) {
					var img = $("<img />");
					img.attr("src", imageData);
					//subirFotoPerfil(imageData);
					$("#lstImg").append(img);
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
	}
};

app.initialize();

$(document).ready(function(){
	//app.onDeviceReady();
});


function actualizarListaTiendas(){
	db.transaction(function(tx) {
		tx.executeSql("select * from tienda", [], function(tx, results){
			$("#selTienda").empty();
			alertify.log("Actualizando la lista de tiendas, por favor espere");
			$("#getTiendas").show();
			
			var cont = 1;
			var rows = results.rows;
			$.each(rows, function(i, el){
				$("#selTienda").append('<option value="' + el.clave + '">' + el.nombre + '</option>');
					
				cont++;
			});
			
			$("#getTiendas").hide();
			alertify.success("Lista actualizada");
		}, errorDB);
	});
}