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
    	try{
	    	db = SQLitePlugin.openDatabase("tracking.db", "1.0", "Just a Dummy DB", -1);
	    	//db = window.openDatabase("tracking.db", "1.0", "Just a Dummy DB", 200000);
	    	alert("conexion ok SQLitePlugin");
	    	crearBD(db);
	    }catch(err){
		    alert("No se pudo conectar a la base de datos: " + err.message);
	    }
	    
	    try{
	    	db = sqlitePlugin.openDatabase("tracking.db", "1.0", "Just a Dummy DB", -1);
	    	alert("conexion ok sqlitePlugin");
	    	crearBD(db);
	    }catch(err){
		    alert("No se pudo conectar a la base de datos: " + err.message);
	    }
	    
	    try{
	    	db = openDatabase("tracking.db", "1.0", "Just a Dummy DB", -1);
	    	alert("conexion ok Solo");
	    	crearBD(db);
	    }catch(err){
		    alert("No se pudo conectar a la base de datos: " + err.message);
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
        });
        
        $("#backToHome").click(function(){
        	$("[vista=addProducto]").hide();
        	$("[vista=home]").show();
        });
        
        $("[action=getTiendas]").click(function(){
        	getTiendas({
        		after: function(resp){
        			var obj = new TTienda;
	        		$.each(resp, function(i, el){
	        			obj.add(el.id, el.name, {});
	        		});
	        		
	        		alert(resp.length + " tiendas");
        		}
        	});
        });
    }
};

app.initialize();
/*
$(document).ready(function(){
	app.onDeviceReady();
});*/