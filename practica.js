var map = "";
$(document).ready(function() {
	$("div#search button").click(addr_search);//BUSQUEDA

	var clickMap = "";
	var dat = "";

   	function dibujar(){
		map = L.map("map").setView([40,0], 2);
	    L.tileLayer(' http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
	}
	
	//LECTURA DE DOCUMENTOS JSON
	var citys =Array();
	var Latitudes = Array();
	var Longitudes = Array();
 
	$.ajax({url:"practica.json",
			dataType:'json',
			async:false,
			success:function(data) {
				dat = data;
				Ciudades(dat);
				//Monumentos();
				//Paises();
			}
	});

	//Coordenadas del lugar donde se situan las fotos y distancia entre los dos lugares
	//Variables Latitud y longitud
	var Lat = Latitudes[0];
	var Long =Longitudes[0];
    var success = L.latLng(Lat,Long);
    var dist = 0;

    //Numero de lugar en el juego
    var index;
	var tag = "Atletico de Madrid";

	//Variable para la dificulad
	var max_fotos = 10;
	var time = 5000;
	var Interval =""; 
	var facil = $("#facil");	
	var medio = $("#medio");
	var dificil = $("#dificil");
	function dificultad(){

	}
	facil.on('click', function() {
        time = 5000;
		Stop();
		map.remove();
		dibujar();
		markerInit();
		fotosflikr(tag);
	});
	medio.on('click', function() {
        time = 3000;
		max_fotos = 15;
		Stop();
		map.remove();
		dibujar();
		markerInit();
		fotosflikr("pazo");
	});
	dificil.on('click', function() {
        time = 500;
		max_fotos = 20;
		Stop();
		map.remove();
		dibujar();
		markerInit();
		fotosflikr(tag);
	});
    //Variable de puntuacion del juego
    var puntuacion = 0;
    var fotosvistas = 0;
    var vpunt = $("#badge");
    vpunt.html(puntuacion)

    //Llama a el feed de flickr para una tag dada devolviendo un JSON
    function fotosflikr(tags){
       
        $.getJSON("https://api.flickr.com/services/feeds/photos_public.gne?&tags="+tags+"&tagmode=any&format=json&jsoncallback=?",
            function(data){
                data = data.items.splice(0,max_fotos)
               	i= 0;
				$("#img").attr("src",data[i].media.m);
				i++;//incremento 
               	Interval = setInterval(function(){
                    $("#img").attr("src",data[i++ % max_fotos].media.m)
               },time);
        });
    }
	//funcion para parar el interval
	function Stop() {
    	clearInterval(Interval);
	} 
	//funcion inicio del juego
	function Inicio(){
		fotosflikr(tag);
		dibujar();
		markerInit();
	}
	Inicio();

	//funcion para el marcador propio
	function markerInit(){
		successP= L.marker([Lat,Long],{opacity:0});
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
        dist = success.distanceTo(clickMap.getLatLng())/1000
        calculapuntuacion();
		successP.setOpacity(1);//muestro el marcador buscado
		var latlngs = Array();//Linea entre marcadores
		latlngs.push(clickMap.getLatLng());

		
		latlngs.push(successP.getLatLng());
		var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
    })
	//Numero de fotos vistas
    $("#carousel").on("slid.bs.carousel",function(){
        fotosvistas++;
    })

    function calculapuntuacion(){
		fotos = 1;
		if (fotosvistas > 2){
			fotosvistas = fotos;		
		}
		puntuacion += Math.floor(1000000/(dist*fotos));
        vpunt.html(puntuacion)
    }

	
	function Ciudades(dat){
		for (var i = 0; i < dat.ciudades.length; i++) {		
			citys.push(dat.ciudades[i].nombre);
			Latitudes.push(dat.ciudades[i].latitud);
			Longitudes.push(dat.ciudades[i].longitud); 
		}
	}
	
	/*function Monumentos(dat){
		for (var i = 0; i < dat.monumentos.length; i++) {		
			citys.push(dat.ciudades[i].nombre);
			Latitudes.push(dat.ciudades[i].latitud);
			Longitudes.push(dat.ciudades[i].longitud); 
		}
	}
	
	function Paises(dat){
		for (var i = 0; i < dat.paises.length; i++) {		
			citys.push(dat.paises[i].nombre);
			Latitudes.push(dat.paises[i].latitud);
			Longitudes.push(dat.paises[i].longitud); 
		}
	}*/
	
});
//ESTO ES EL FLICKR
addr_search = function () {
    var inp = document.getElementById("addr");
	//BUSCADOR
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




