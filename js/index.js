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
				alertify.error("Primero escanea el código");
			else if ($("#lstImg").find("img").length < 4){
				navigator.camera.getPicture(function(imageURI){
					var img = $("<img />");
									
					$("#lstImg").append(img);
					img.attr("src", "data:image/jpeg;base64," + imageURI);
					
					/*
					window.resolveLocalFileSystemURI(imageURI, function(fileEntry){
						window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) { 
							fileSys.root.getDirectory($("#txtCodigo").val(), {create: true, exclusive: false}, function(dir) { 
								//nomimage=imageURI.substr(imageURI.lastIndexOf('/')+1);
								nomimage = "img_" + $("#lstImg").find("img").length + ".jpg";
								fileEntry.copyTo(dir, nomimage, function(entry){
									console.log(entry.fullPath);
									
									var img = $("<img />");
									
									$("#lstImg").append(img);
									img.attr("src", entry.nativeURL);
									
								}, errorSys); 
							}, errorSys); 
						}, errorSys); 
					}, errorSys);
					*/
				}, function(message){
					alertify.error("Ocurrio un error al subir la imagen");
				}, { 
					quality: 100,
					//destinationType: Camera.DestinationType.FILE_URI,
					destinationType: Camera.DestinationType.DATA_URL,
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
				var fotos = new Array();
				fotos[1] = "";
				fotos[2] = "";
				fotos[3] = "";
				fotos[4] = "";
				
				$("#lstImg").find("img").each(function(i){
					fotos[i + 1] = $(this).attr("src");
				});
				
				navigator.geolocation.getCurrentPosition(function(position){
					db.transaction(function(tx){
						tx.executeSql("delete from codigo where codigo = ?", [$("#txtCodigo").val()], function(tx, res){
							tx.executeSql("INSERT INTO codigo (codigo, celular, obs, lat, lng, flag, tienda, foto1, foto2, foto3, foto4) VALUES (?,?,?,?,?,?,?,?,?,?,?)", [
									$("#txtCodigo").val(), 
									tel, 
									$("#txtObservaciones").val(), 
									position.coords.altitude,
									position.coords.longitude, 
									"Alta",
									$("#txtTienda").attr("identificador"),
									fotos[1],
									fotos[2],
									fotos[3],
									fotos[4]
								], function(tx, res) {
									console.log("Código guardado");
									alertify.success("Código almacenado");
								}, errorDB);
						}, errorDB);
					});
				}, function(error){
					alertify.error("No se obtener tu ubicación");
				});
			}
		});
		
		$("[action=enviarAll]").click(function(){
			db.transaction(function(tx) {
				tx.executeSql("select * from codigo", [], function(tx, results){
					var total = 0;
					var band = 0;
					$.each(results.rows, function(i, el){
						band++;
						$.post("http://www.neoprojects.com.pe/neotracking-web/public/api/tracking", {
							"photo1": el.foto1,
							"photo2": el.foto2,
							"photo3": el.foto3,
							"photo4": el.foto4,
							"num": el.celular,
							"obs": el.obs,
							"lat": el.lat,
							"lng": el.lng,
							"flag": el.flag,
							"codigo": el.codigo,
							"tienda": el.tienda,
							"guid": "1",
						}, function(resp){
							if (resp.code == el.codigo){
								total++;
							}
							
							band--;
							if (band == 0)
								alertify.log("Se enviaron " + total + " códigos");
						}, "json");
					});
				}, errorDB);
			});
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