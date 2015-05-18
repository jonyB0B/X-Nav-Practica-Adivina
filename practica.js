var map = "";
var nestados = 0;
var index = 0;
var nhistory = 0;
var datos = null;
$("#siguiente").hide();
$("#aceptar").hide();
$("#NEWGAME").hide();
$("#img").hide();
$("#map").hide();
$(document).ready(function() {
	
	$("div#search button").click(addr_search);//BUSQUEDA

	var clickMap = "";
	var dat = "";

   	function dibujar(){
		map = L.map("map").setView([40,0], 2);
	    L.tileLayer(' http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
	}

	//LECTURA DE DOCUMENTOS JSON
	
	var juego = {nombres : Array(), coord : Array()}
	var lastgame;
	var game ="";
 
	$(".game").click(function(){
		if (nhistory >1){
			$("#img").hide();
			$("#map").hide();
		}
		$("#startGame").hide();
		$("#facil").hide();
		$("#NEWGAME").show();
		Stop();
		index = 0;//reinicio el index por si cambio de juego jugando a otro
		lastgame = game
		game = $(this).html();
		$("#gameTipe").html(game);
		juego.nombres = [];
		juego.coord = [];
		$.ajax({url:"http://jonyB0B.github.io/X-Nav-Practica-Adivina/juegos/"+game+".json",
			dataType:'json',
			async:false,
			success:function(data) {
				data.features.forEach(function(el,i){
					juego.nombres[i] = el.properties.Name;
					juego.coord[i] = el.geometry.coordinates;
			});
			}
		});
		
	})

	//FUNCION RANDOM PARA EL JSON asigno las variables leidas coordenadas y nombres
	function RdnNext(){
		it=Math.floor(Math.random()*7)
		console.log(it);
		Lat = juego.coord[it][0];
		Long =juego.coord[it][1];
		tag = juego.nombres[it];
		success = L.latLng(Lat,Long)
	}
	//Coordenadas del lugar donde se situan las fotos y distancia entre los dos lugares
	//Variables Latitud y longitud
	var Lat = 0;
	var Long =0;
    var success = 0;
    var dist = $("#badgedist");
	var tag = 0;

	
	//funcion inicio del juego
	function Inicio(){
		RdnNext();
		ocultarSiguiente();
		fotosflikr(tag);
		dibujar();
		markerInit();
		puntuacion = 0;
		dist = 0;
		vpunt.html(puntuacion)
		vdist.html(dist)
	}
	//INICIO DEL JUEGO OCULTO Botones y cargo al dar click
	 $("#NEWGAME").click(function(){
		$("#NEWGAME").hide();
		$("#img").show();
		$("#map").show();
		if(nhistory==0){
			//history.pushState(null,null,location.href+game);
			Inicio();
			nhistory++;
			console.log("nhist: "+nhistory);
		}else{
			Stop();
			map.remove();
			Inicio();
			console.log(juego.nombres[2])
			historyAdd();
			console.log("nhist2: "+nhistory)
		}
	})

	//DIFICULTADES
	var max_fotos = 10;
	var time = 5000;
	var Interval =""; 
	var facil = $("#facil");	
	var medio = $("#medio");
	var dificil = $("#dificil");
	function dificultad(){

	}
	facil.on('click', function() {
		ocultarSiguiente();
		$("#facil").hide();
		$("#medio").show();
		$("#dificil").show();
        time = 5000;
		Stop();
		map.remove();
		Inicio();
	});
	medio.on('click', function() {
		ocultarSiguiente();
		$("#medio").hide();
		$("#facil").show();
		$("#dificil").show();
        time = 3000;
		max_fotos = 15;
		Stop();
		map.remove();
		Inicio();
	});
	dificil.on('click', function() {
		ocultarSiguiente();
		$("#favil").show();
		$("#medio").show();
        $("#dificil").hide();
        time = 500;
		max_fotos = 20;
		Stop();
		map.remove();
		Inicio();
	});
    //Variables de puntuacion  y distancia del juego
    var puntuacion = 0;
    var fotosvistas = 0;
	var vpunt = $("#badge");
	var dist = 0;
	var vdist = $("#vdist");
	
    //Llama a el feed de flickr para una tag dada devolviendo un JSON
    function fotosflikr(tags){
       
        $.getJSON("https://api.flickr.com/services/feeds/photos_public.gne?&tags="+tags+"&tagmode=any&format=json&jsoncallback=?",
            function(data){
                data = data.items.splice(0,max_fotos)
				$("#img").attr("src",data[index].media.m);
				index++;//incremento 
               	Interval = setInterval(function(){
                    $("#img").attr("src",data[index++ % max_fotos].media.m)
					fotosvistas++;
               },time);
        });
    }
	//funcion para parar el interval
	function Stop() {
    	clearInterval(Interval);
	} 

	//funcion para el marcador propio
	function markerInit(){
		
		successP= L.marker([Lat,Long],{opacity:0});//inicializo a 0,0
		successP.addTo(map);
		clickMap = L.marker([0,0],{opacity:0});
		clickMap.addTo(map);
		 //Coloca un marker en la posicion donde pulsemos
    	map.on('click', function(pos) {
		    clickMap.setLatLng(pos.latlng); 
		   	clickMap.setOpacity(1);
   		 });
	}

    //Calcula la distancia en km desde el marker a la poicion correcta
    $("#aceptar").click(function(){
        dist = success.distanceTo(clickMap.getLatLng())/1000 //paso a kilometros
		console.log(dist);
		dist = Math.floor(dist);
   	
		if(clickMap.getLatLng().lat !=0){
			calculapuntuacion();
			successP.setOpacity(1);//muestro el marcador buscado
			var latlngs = Array();//Linea entre marcadores
			latlngs.push(clickMap.getLatLng());
			latlngs.push(successP.getLatLng());
			var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
			$("#solucion").html("Solucion: " + tag);//muestro la solucion
			$("#img").hide();
			$("#solucion").show();
		}
    })

	//CALculo DE PUNTUACION

    function calculapuntuacion(){
		fotos = 1;
		if (fotosvistas > 2){
			fotosvistas = fotos;		
		}
		puntuacion += Math.floor(100000/(dist*fotos));
        vpunt.html(puntuacion)
		vdist.html(dist+" Km")
		mostrarSiguiente();
    }


	//MOSTRAR Y OCULTAR BOTONES
	function mostrarSiguiente(){
		$("#siguiente").show();
		$("#aceptar").hide();
	}
	function ocultarSiguiente(){
		$("#siguiente").hide();
		$("#aceptar").show();
	}
	
	//FUNCION SIGUIENTE 
	$("#siguiente").click(function(){
		Stop();
		map.remove();
		$('#solucion').hide();
		$("#img").show();
		historyAdd();
		fotosvistas = 0;
		index = 0;
		Inicio();
	})

	function historyAdd(){
		datos={fecha: new Date(),
			nombre: tag,
			punt:puntuacion,
			game: game,
			juego:juego,
			it:it,
			index: index,
			success: success
		}
		
		history.pushState(datos,"estado",location.href+game);
		html= '<a id=his'+nhistory+' href="#" class="list-group-item his">'+" Juego: "+datos.game+' Score: '+datos.punt+'</br> Hora: '+datos.fecha.getHours()+"h:"+datos.fecha.getMinutes()+"m:"+datos.fecha.getSeconds() +"s"+'</a>'
		$("#historial").append(html);
		nhistory++;
	}

	function historyGo(){
		if(datos!=null){
			game = datos.game;//Monumentos
			juego = datos.juego;
			success = datos.success;
			console.log("evento cambio : "+datos.nombre);
			Stop();
			map.remove();
			Inicio();
		}
	}
	//Salta el evento cuando pulso en el historial 
	window.onpopstate = function(event) {
	
		historyGo(event.state);
	};


	/*history.pushState(dat,"estado",location.href+game);
		html= '<a id=his'+nhistory+' class="list-group-item his">'+"Juego: "+datos.juego+' Score: '+datos.punt+'</br> Hora: '+datos.fecha.getHours()+"h:"+datos.fecha.getMinutes()+"m:"+datos.fecha.getSeconds() +"s"+'</a>'
		$("#historial").append(html);
		nhistory++;
	}*/

	
	
});
//ESTO ES EL BUCADOR DE OPCION EXTRA
addr_search = function () {
    var inp = document.getElementById("addr");
    $.getJSON('http://nominatim.openstreetmap.org/search?format=json&limit=5&q=' + inp.value, function(data) {

		var items = [];

        $.each(data, function(key, val) {
            items.push(
                "<li><a href='#' onclick='chooseAddr(" +
                val.lat + ", " + val.lon + ");return false;'>" + val.display_name +
            '</a></li>'
            );
        });
        
        $('#results').empty();
        if (items.length != 0) {
            $('<p>', { html: "Resutados:" }).appendTo('#results');
            $('<ul/>', {
            'class': 'my-new-list',
            html: items.join('')
            }).appendTo('#results');
        } else {
            $('<p>', { html: "No results found" }).appendTo('#results');
        }
        
        $('<p>', { html: "<button id='close' type='button'>Cerrar búsqueda</button>" }).appendTo('#results');
        $("#close").click(function (){$("#results").empty();});
    });
	//Me envía a la direccion en el mapa 
	chooseAddr = function (latitud, lng, type) {
    var location = new L.LatLng(latitud, lng);
    map.panTo(location);
		//Hacemos zoom en la posicion
		if (type == 'city' || type == 'administrative') {
		    map.setZoom(11);
		} else {
		    map.setZoom(13);
    	}
	}

}

