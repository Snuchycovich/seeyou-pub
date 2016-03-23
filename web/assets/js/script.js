/*============================================
================ INIT MAP ====================
============================================*/

var map = null;


var initMap = function(){
    //Layer map
    map = L.map('map').setView([49.1659277, -0.2948727], 11);
    mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    L.tileLayer(
        '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; ' + mapLink,
        maxZoom: 18,
    }).addTo(map);



  /*============ LEAFLET DRAW ================*/

  // Initialise the FeatureGroup to store editable layers
  var drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  // Initialise the draw control and pass it the FeatureGroup of editable layers
  var drawControl = new L.Control.Draw({
      draw: {
        polyline: false,
        marker:false
      },
      edit: {
          featureGroup: drawnItems,
          edit: false
      }
  });
  //drawControl.removeFrom(map);
  /*$('.leaflet-draw').is(':visible') ? drawControl.removeFrom(map) :*/ drawControl.addTo(map);


  // create draw
  map.on('draw:created', function (e) {
      var type = e.layerType,
          layer = e.layer;

      if (type === 'rectangle') {
          //var area = L.GeometryUtil.geodesicArea(layer.getLatLngs());
          var rectangle = layer.getLatLngs();
          alert(rectangle);
          alert(layer.getBounds().toBBoxString());
          //$.each(rectangle, )
      }
      if (type === 'circle') {
          alert(layer.getBounds().toBBoxString());
      }
      if (type === 'polygon') {
          alert(layer.getBounds().toBBoxString());
      }
      // Do whatever else you need to. (save to db, add to map etc)
      drawnItems.addLayer(layer);
  });

  /*============= FILE CHOICE ================*/

  var file = "";
  var select = '<div class="form-group">'
                + '<label for="file">Sélectionnez un fichier:</label>'     ;
  $.post('selectFile.php', function(data){
    select += '<select class="form-control" id="file">'
              + '<option value="">Sélectionnez un fichier</option>';
      for(k in data){
        select += '<option value="'+data[k]+'">'+data[k]+'</option>';
      }
      select += "</select>"
      $(".menu").append(select);
  }, 'JSON');
} /*Fin initMap()*/


/*============================================
=============== GET DATA ==================
============================================*/


var fileName = "";
var names = [];
var name = "";

$(".menu").on("change", "#file", function(){
    
    fileName = $("#file option:selected").attr("value");
    
    console.log(fileName);
    
    $('#menuYoupubers').remove();

    $.post('toJsonArray.php', {file: fileName}, function(data){


        generateMenu(data);
 
        
       
    
        

        /*=======*/
        // action button nettoyer
        
        $(".menu").on('click', '#nettoyer', function(){
          $('.checkbox').children('label').children('input').removeClass("checked");
          $('input[type="checkbox"]').prop('checked', false);
          clearMap();
        });
        
        // action button afficher tout
        $(".menu").on('click', '#afficher', function(){
          $('.checkbox').children('label').children('input').addClass("checked");
          $('input[type="checkbox"]').prop('checked', true);
          $('.yprs .checkbox').each(function(index, element){
                names.push($(element).text());
              });
              for (i in names){
                console.log(names[i])
                getGeoJson(data, names[i]);
              }
              
        });
        
        /*========= FUNCTIONS ==========*/

        // Waypoints function
        var addRoutes = function() {
          var routingControl = L.Routing.control({
              waypoints: [
                  L.latLng(49.2153508,  -0.5894552),
                  L.latLng(49.2761408,  -0.7016768)
              ],
              routeWhileDragging: false,
          }).addTo(map);
          routingControl.hide();
        }
        
        // Delete layer from map
        var hideLayer = function(id) {
            var lg = mapLayerGroups[id];
            //console.log(lg._layers);
            for (i in lg._layers){
                //console.log(lg._layers[i]._leaflet_id)
                map.removeLayer(lg._layers[i]);
            }
        }

  }, 'JSON');
});

/*===== Routing Points=====*/

$(".menu").on('change', '.checkbox', function() {
    console.log('change');
      //tableau pour les cordonnées 
      var wayPoints = [];
      // nom du checkox
      name = $(this).text();
    
    // initialisation des routes
    var routingControl = L.Routing.control({
        waypoints: [
            ],
        routeWhileDragging: false,
        draggableWaypoints: false,
        createMarker: function() { return null; },
        geocodersClassName: name
        }).addTo(map);
        routingControl.hide();
        
            $(this).children('label').children('input').toggleClass("checked");
            if($(this).children('label').children('input').hasClass("checked")){
                console.log('checked');
                console.log(fileName);
                getJsonByName(fileName, name);
                
            } else {
                clearMap()
            }

});
/*============================================
=============== FUNCTIONS ====================
============================================*/

//Generate Menu Youpubers
var generateMenu = function(data){
    var html = "";
    html = '<div class="youpubers-menu">'
    +'<div class="yprs">';
    $.each(data, function(index, value){
      html += '<div class="checkbox"><label><input type="checkbox" value="'+data[index].name+'">'+data[index].name+'</label></div>';
    });
    html += '</div>'
    +'<div class="control-yprs"><a type="button" class="btn btn-default" id="afficher">Tout afficher</a> '
    +'<a type="button" class="btn btn-default" id="nettoyer" javascript:onload="nettoyer()">Tout nettoyer</a></div>'
    +'</div>';
    
    clearMap();
    $('.youpubers-menu').remove();
    $(".menu").append(html);
}

var getJsonByName = function(FileName, name){
    $.post('toJsonName.php', {file: fileName, name: name}, function(dataByName){
        $(dataByName[0].details).each(function(i){
            var latLng = L.latLng(dataByName[0].details[i].latitud, dataByName[0].details[i].longitud);
            wayPoints.push(latLng);
        });

        routingControl.setWaypoints(wayPoints);
        console.log(routingControl.getPlan());
        console.log(L.Routing.line);
    },JSON);
}


// clear traces
var clearMap = function() {
    for(i in map._layers) {
        if(map._layers[i]._path != undefined) {
            try {
                map.removeLayer(map._layers[i]);
            }
            catch(e) {
                console.log("problem with " + e + map._layers[i]);
            }
        }
    }
}

var getGeoJson = function(data, name){
            var geoJson = {"type": "LineString"};
            var currentName = "";
            console.log(data);
            $.each(data, function(index, value) {
                if (data[index].name == name) {
                    currentName = data[index].name;
                    geoJson.properties = {"name": currentName}
                    geoJson.coordinates = [];
                    $(data[index].details).each(function(i){
                      geoJson.coordinates.push([data[index].details[i].longitud, data[index].details[i].latitud])       
                    });
                }
                
            });
            console.log(geoJsonLayer);
            console.log(geoJson);

            geoJsonLayer.addData(geoJson);
            console.log(mapLayerGroups)
        }
