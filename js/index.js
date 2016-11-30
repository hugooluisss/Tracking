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
			//db = openDatabase({name: "tracking.db"});
			db = window.sqlitePlugin.openDatabase({name: 'tracking.db', location: 1, androidDatabaseImplementation: 2});
			console.log("Conexión desde phonegap OK");
			crearBD(db);
		}catch(err){
			alert("No se pudo crear la base de datos con sqlite");
			db = window.openDatabase("tracking.db", "1.0", "Just a Dummy DB", 200000);
			crearBD(db);
			console.log("Se inicio la conexión a la base para web");
		}
		
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
			
			$("#btnSave").prop("disabled", false);
		});
        
		$("#backToHome").click(function(){
			$("[vista=addProducto]").hide();
			$("[vista=home]").show();
			getShowCodigosPendientes();
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
							var cont = 0;
							$.each(resp, function(i, el){
								obj.add(el.id, el.name, {});
								cont++;
							});
							
							console.log("Total de tiendas: " + cont);
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
		
		getShowCodigosPendientes();
		
		$("[action=getImagen]").click(function(){
			if ($("#txtCodigo").val() == '')
				alertify.error("Primero escanea el código");
			else if ($("#lstImg").find("img").length < 4){
				navigator.camera.getPicture(function(imageURI){
					var img = $("<img />");
									
					$("#lstImg").append(img);
					img.attr("src", "data:image/jpeg;base64," + imageURI);
					img.attr("src2", imageURI);
				}, function(message){
					alertify.error("Ocurrio un error al subir la imagen");
				}, { 
					quality: 100,
					//destinationType: Camera.DestinationType.FILE_URI,
					destinationType: Camera.DestinationType.DATA_URL,
					encodingType: Camera.EncodingType.JPEG,
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
			if (tel == '' || tel == null || tel == undefined){
				alertify.error("Es necesario indicar tu número de teléfono");
				setTelefono();
			}else{
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
						fotos[i + 1] = $(this).attr("src2");
					});
					
					navigator.geolocation.getCurrentPosition(function(position){
						db.transaction(function(tx){
							tx.executeSql("delete from codigo where codigo = ?", [$("#txtCodigo").val()], function(tx, res){
								var tel = window.localStorage.getItem("telefono");
								console.log(tel);
								$("#btnSave").prop("disabled", true);
								tx.executeSql("INSERT INTO codigo (codigo, celular, obs, lat, lng, flag, tienda, foto1, foto2, foto3, foto4) VALUES (?,?,?,?,?,?,?,?,?,?,?)", [
										$("#txtCodigo").val(), 
										tel, 
										$("#txtObservaciones").val(), 
										position.coords.latitude,
										position.coords.longitude, 
										$("#chkBaja").is(":checked")?"Baja":"Alta",
										$("#txtTienda").attr("identificador"),
										fotos[1],
										fotos[2],
										fotos[3],
										fotos[4]
									], function(tx, res) {
										console.log("Código guardado");
										alertify.success("Código almacenado");
										
										$("#btnSave").prop("disabled", false);
									}, errorDB);
									
									$("#lstImg").find("img").remove();
									$("form").find("input").val("");
									$("#txtTienda").attr("identificador", "");
							}, errorDB);
						});
					}, function(error){
						alertify.error("No se obtener tu ubicación");
					});
				}
			}
		});
		
		$("[action=enviarAll]").click(function(){
		
			if (navigator.connection.type == Connection.NONE)
				alertify.error("Se necesita conexión a internet para enviar los datos... el envío fue detenido");
			else{
				var btn = $(this);
				btn.addClass("fa-spin");
				db.transaction(function(tx) {
					tx.executeSql("select * from codigo", [], function(tx, results){
						var total = 0;
						var band = 0;
						tx.executeSql("delete from codigo", []);
						if (results.rows.length > 0){
							alertify.log("Enviando datos");
							
							$.each(results.rows, function(i, el){
								band++;
								//$.post("http://www.neoprojects.com.pe/neotracking-web/public/api/tracking", {
								/*
								$.post("http://www.lg.neoprojects.com.pe/api/tracking", {
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
									if (band == 0){
										alertify.success("Se enviaron " + total + " códigos");
										btn.removeClass("fa-spin");
										
										getShowCodigosPendientes();
									}
								}, "json");
								*/
								
								var formData = new FormData();
								formData.append("photo1", el.foto1);
								formData.append("photo2", el.foto2);
								formData.append("photo3", el.foto3);
								formData.append("photo4", el.foto4);
								formData.append("num", el.celular);
								formData.append("obs", el.obs);
								formData.append("lat", el.lat);
								formData.append("lng", el.lng);
								formData.append("flag", el.flag);
								formData.append("codigo", el.codigo);
								formData.append("tienda", el.tienda);
								formData.append("guid", "1");
								
								$.ajax({
									url: 'http://www.lg.neoprojects.com.pe/api/tracking',
									data: formData,
									contentType: false,
									processData: false,
									type: 'POST',
									success: function(data){
										total++;
										console.log(data.code);
										band--;
										if (band == 0){
											alertify.success("Se enviaron " + total + " códigos");
											btn.removeClass("fa-spin");
											
											getShowCodigosPendientes();
										}
									}
								});
							});
						}else{
							alertify.log("No hay códigos para enviar");
							btn.removeClass("fa-spin");
						}
					}, errorDB);
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
			if (!isNaN(str) && str.length >= 9){
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

function getCodigosPendientes(fn){
	if (fn.before != undefined) fn.before();
	db.transaction(function(tx) {
		tx.executeSql("select * from codigo", [], function(tx, results){
			if (fn.after != undefined) fn.after(results.rows);
		}, errorDB);
	});
}

function getShowCodigosPendientes(){
	getCodigosPendientes({
		before: function(){
			$("#dvHistorial").html('<i class="fa fa-refresh fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span>');
		},
		after: function(rows){
			$("#dvHistorial").html("");
			console.log("Registros código recuperados: " + rows.length);
			$.each(rows, function(i, el){
				$("#dvHistorial").append($('<a href="#" class="list-group-item"><h4 class="list-group-item-heading">' + el.codigo + '</h4><p class="list-group-item-text">' + el.obs + '</p></a>'));
			});
		}
	});
	
}