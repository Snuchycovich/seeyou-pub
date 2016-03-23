var mapApp = angular.module('mapsApp',[]);

mapApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
  });

mapApp.run(function($rootScope, $http){
	
	$rootScope.youPubersWithProf = [];
	
	$rootScope.getProfToArray = function(){
		$http.get("../../jsonData/profiles.json").then(function success(response){
			for(i in response.data){
				$rootScope.youPubersWithProf.push(response.data[i].name);
			}

		}, function error(respoonse){
			console.log('Erreur de chargement du fichier profiles.json');
		});
	}
	

	$rootScope.hasProfile = function(name){
		//console.log(name);
		for(i in $rootScope.youPubersWithProf){
			var youPuber = $rootScope.youPubersWithProf[i];
			//console.log(youPuber +'//'+name);
			if(name == youPuber){
				return true;
			}
		}
	}

	
});
/*========= SERVICES =============*/

mapApp.factory('MarkerService', function(){
	var factory = {};

	factory.addToLayer = function(marker, markerLayer) {
		markerLayer.addLayer(marker);
		return markerLayer;
	}
	return factory;
});

mapApp.factory('ImageService', function(){
	var factory = {};
	factory.getImage = function(name, imagesArray){

		var photoIcon = null;

		function findYoupuber(youpuberName) { 
			return youpuberName.youpuber === name;
		}

		var youPuberObj = imagesArray.find(findYoupuber);
		if(youPuberObj === undefined){
			youPuberObj = {};
			youPuberObj.youpuber = name
			youPuberObj.url = "images/X1726_2008_Ford_Focus_tcm951-124701_w230.png";
		}

		if(name == youPuberObj.youpuber){
			 photoIcon = L.icon({
				iconUrl: '../../'+youPuberObj.url,
				iconSize:     [30, 30], // size of the icon
	            popupAnchor:  [30, 30]
	        });
		}
		return photoIcon;
	}
	return factory;
});

mapApp.service('RouteService', function(ImageService){
	this.createRoutingLayer = function(name, zoom, imageArray, markerLayer){
		
		var routeObj = {};
		var markerArray = [];

		routeObj.youPuber = L.Routing.control({
		    waypoints: [
		        ],
		    routeWhileDragging: false,
		    draggableWaypoints: false,
		    autoRoute: true,
		    fitSelectedRoutes: zoom,
		    createMarker: function(i, wp, n) {
				if (i == (n-1)) {
					markerArray[name] = L.marker(wp.latLng, {icon: ImageService.getImage(name, imageArray)});
					markerLayer.addLayer(markerArray[name]);
					//MarkerService.addToLayer(markerArray[name], markerLayer)
					//$scope.markerGroup.addLayer(markerArray[name]);
					/*marker.on('click', function(e){
						lightbox('<div id="close-icone"/><img src="../../'+ypObj.url+'" alt="'+ypObj.youpuber+'" width="400" class="imgLB responsive-image"/>');
					});*/
					
				}
			}
		});
		
		return routeObj;
	}
});


/*=======================*/

mapApp.controller('campaignController', function($scope, $http, $rootScope, RouteService) {
	
	// Nom du ficher selectionné
	$scope.file = "";
	//Tableau de fichiers
	$scope.filesByDate = [];
	//Liste de voitures par campagne
	$scope.ypByCampagne = []; 
	// Nombre de voitures dans une campagne
	$scope.nbYP = null;
	// nombre de véhicules selectionnes
	$scope.nbSelectedYP = 0;
	//Condition pour afficher l'icone du chargement
	$scope.onloadData = false;/*je n'utilise plus*/
	//Condition pour afficher l'icone du chargement dans la map
	$scope.onloadTrace = false;

	/*=======================*/
	$scope.youpubers = [];
	//Tableau de traces
	$scope.traceArray = [];
	//Layer Groupe pour le traces
	$scope.traces = null;/*L.layerGroupe($scope.traceArray);*/
	//
	$scope.dataImages = "";
	//
	$scope.markerArray = [];
	$scope.markerGroup = new L.LayerGroup();

	//$scope.youPuberRoute = null;

	$scope.initMapLayer = function(){
		
		initMap('map', 49.1659277, -0.2948727, 11);
		
	    //Chargement des fichier par date
		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
	    
	    $http.post('../../selectFile.php').then(function success(response){
	    	for(i in response.data){
	    		$scope.filesByDate.push(response.data[i]);
	    	}
	    }, function error(response){
	    	console.log('Error pendant le chargement des fichiers...');
	    });

	    $http.get('../../imagesToJson.php').then(function success(response){
			$scope.dataImages = response.data;
		});

		$rootScope.getProfToArray();
	}
	

    //Method getData to build the youpubers menu  
	$scope.getData = function(obj){

		$scope.onloadData = true;
		$scope.onloadTrace = true;
		cleanMap();
		$scope.markerGroup.clearLayers();
		console.log($scope.markerGroup);
		

		$scope.file = obj.target.attributes.data.value;
		
		var data = {file: $scope.file, inter: 100000};

		//Initialiser le menu, vider le tableau de youpubers
		if($scope.ypByCampagne.length > 0){
			$scope.ypByCampagne = [];
		}	
		
		$http.post('../../toJsonArray.php', data).then(function succes(response){

			//On rempli le tableau ypByCampagne pour afficher le menu
			for(i in response.data){
				$scope.ypByCampagne.push(response.data[i].name);
			}

			//On reutilise le tableau ypByCampagne pour créer des "variables dynamiques" dans un autre tableau
			// et séparer le trace de chaque youpuber 
			
			/*===========================================================*/
			for(i in $scope.ypByCampagne){
				var youpuber = $scope.ypByCampagne[i];
				console.log($rootScope.hasProfile($scope.ypByCampagne[i]));			
				var youPuberObj = RouteService.createRoutingLayer(youpuber, false, $scope.dataImages, $scope.markerGroup);
				
				console.log(youPuberObj);
				//On appelle la methode pour créer le layer Routing
				$scope.youpubers[youpuber] = youPuberObj.youPuber;
				//$scope.markerArray[youpuber] = youPuberObj.markerLayer;
				
				//$scope.markerGroup.addLayer($scope.markerArray[youpuber])
				

				//$scope.createRoutingLayer(youpuber, false);
				$scope.getAllTraces($scope.file, youpuber);
				$scope.traceArray.push($scope.youpubers[youpuber]);
			}
			/*===========================================================*/
			
			//On rentre le tracé dans le layer groupe et on l'affiche
			$scope.traces = L.layerGroup($scope.traceArray).addTo(map);
			$scope.markerGroup.addTo(map);
			
			// Affichage du nombre de véhicules dans la campagne
			$scope.nbYP = $scope.ypByCampagne.length;
			$scope.nbSelectedYP = $scope.ypByCampagne.length;
			
			//On Check toutes les checkboxes
			$('.youpuber input[type="checkbox"]').prop('checked', true);

			// On a fini le chargement (icone chargement)
			$scope.onloadData = false;
			//console.log($scope.youpubers['pika']);
		}, function error(response){
			console.log('Error pendant le chargement des donnes par fichier...');
		});
	}

	/*=====================================
	=== Get the trace for each youpuber ===
	=====================================*/
	$scope.getIndividualTrace = function(obj){
		
		//On récupere l'identifiant du youpuber 
		var name = obj.target.attributes.value.value;

		if(obj.target.getAttribute("checked") == "checked"){
			
			/*=== Si le checkbox est coché ===*/
			
			//On decoche le checkbox
			obj.target.setAttribute("checked", false);	
			// On decremente le nombre de youpubers affichés
			$scope.nbSelectedYP--;
			//console.log($scope.youpubers[name]);
			console.log($scope.markerGroup);

			// Supprimer le layer du youpuber coché			
			$scope.traces.removeLayer($scope.youpubers[name]);
			//$scope.markerGroup.removeLayer($scope.markerArray[name]);
		
		} else {
			/*=== Si le checkbox est decochée ===*/

			//On increment le nombre de véhicules affiches 
			$scope.nbSelectedYP++;

			//On cheque le checkbox correspondant
			obj.target.setAttribute("checked", "checked");
			
			//$scope.markerGroup.removeLayer($scope.markerArray[name]);
			
			var youPuberObj = RouteService.createRoutingLayer(name, false, $scope.dataImages, $scope.markerGroup);
			$scope.youpubers[name] = youPuberObj.youPuber;
			//$scope.createRoutingLayer(name, true);
			
			/*===========================================================*/
	
			var wayPoints = [];
			
			var data = {file: $scope.file, name: name, inter: 100000}
			
			$http.post('../../toJsonName.php', data).then(function succes(response){
				
		        for(i in response.data.details){
	        		var latLng = L.latLng(response.data.details[i].latitud, response.data.details[i].longitud);
	        		wayPoints.push(latLng);
		        }
		        //
		        $scope.youpubers[name].setWaypoints(wayPoints);
	   			//
	   			$scope.traces.addLayer($scope.youpubers[name]);
	   			//
	   			$scope.onloadTrace = false;
			}, function error(response){
				console.log('Error pendant le chargement des donnes par fichier...');
			});
		}
	}
	
	/*=====================================
	=== Obtenir les données pour crée les =
	=== traces pour tous les youpubers ====
	=====================================*/
	$scope.getAllTraces = function(file, name){
		// Waypoint array
		var wayPoints = [];
		// Tableau de données pour envoyer en post
		var data = {file: file, name: name, inter: 100000}

		$http.post('../../toJsonName.php', data).then(function succes(response){
				        
	        for(i in response.data.details){
	        		var latLng = L.latLng(response.data.details[i].latitud, response.data.details[i].longitud);
	        		wayPoints.push(latLng);
	        }
	        $scope.youpubers[name].setWaypoints(wayPoints);
	        //$scope.youPuberRoute.setWaypoints(wayPoints);

	    });
	    $scope.onloadTrace = false;
	}
	/*=====================================
	==== Check all checkboxes and show  ===
	============ all traces ===============
	=====================================*/
	$scope.showAll = function() {
		
		$scope.cleanAll();
		$scope.markerGroup.clearLayers();
		$scope.nbSelectedYP = $scope.ypByCampagne.length;
        $('.youpuber input[type="checkbox"]').prop('checked', true)
        
        /*===========================================================*/
        for(i in $scope.ypByCampagne){
        	document.querySelector('#c-'+ $scope.ypByCampagne[i]).setAttribute("checked", "checked");
			
			var youpuber = $scope.ypByCampagne[i];
			
			//On appelle la methode pour créer le layer Routing
			var youPuberObj = RouteService.createRoutingLayer(youpuber, false, $scope.dataImages, $scope.markerGroup);
			$scope.youpubers[youpuber] = youPuberObj.youPuber;
			//$scope.createRoutingLayer(youpuber, false);
			
			$scope.getAllTraces($scope.file, youpuber);
			$scope.traces.addLayer($scope.youpubers[youpuber]);
		}

	}

	
	

	
	// Clean traces form one campagne
	$scope.cleanAll = function(){
		$scope.nbSelectedYP = 0;
		$('.youpuber input[type="checkbox"]').prop('checked', false)
		$scope.markerGroup.clearLayers();
		for(i in $scope.ypByCampagne){
			document.querySelector('#c-'+ $scope.ypByCampagne[i]).setAttribute("checked", "");
			$scope.traces.removeLayer($scope.youpubers[$scope.ypByCampagne[i]]);

		}
	}

	//Enregistrer un profile GPS à partir de route dans une cmpagne
	$scope.saveProfile = function(name) {
		//console.log(name);
		var data = {file: $scope.file, name: name, inter: 100000}; 
		$http.post('../../toJsonName.php', data).then(function success(response){
			var route = JSON.stringify(response.data);
			var data1 = {youpuber: name, route: route};
			//console.log(data)
			$http.post('../../updateProfil.php', data1).then(function success(response){
				//console.log(response.data);
				console.log('Opération réussie: fichier enregistré !');
				alert('Opération réussie: fichier enregistré !');
				$rootScope.youPubersWithProf.push(name);
			}, function error(response){
				console.log('Erreur : Fichier JSON pas enregistré');
				alert('Erreur : Fichier JSON pas enregistré');
			});
		}, function error(response){

		});
	}

	// Clean all traces from the map
	$scope.cleanMap = function(){
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

	//To know if array is not empty 
	$scope.isNotEmpty = function(tab){
		if(tab.length > 0){
			return true;
		} else {
			return false;
		}
	}

	

});

mapApp.controller('homeController', function($scope, $http) {
	
	$scope.initMapLayer = function() {
		initMap('mapHome', 49.1659277, -0.2948727);
	}
});
/*====================================================================
						PROFILES CONTROLLER
====================================================================*/

mapApp.controller('profilesCtrl', function($scope, $http, $rootScope) {
	
	//Initialisation des variables
	$scope.youPuberChoice = "";
	$scope.youPubersInDb = [];
	
	$scope.youpubers = [];
	$scope.taces = new L.layerGroup();

	$scope.nbYouPubersIns = 0;
	$scope.showInfo = false;
	$scope.youPubersData = "";
	
	$scope.markerGroup = new L.LayerGroup();
	
	$scope.adresse = "";
	$scope.parking = "";

	//Initialisation de la carte 
	$scope.initMapLayer = function() {
		initMap('map', 48.856614, 2.352222, 7);

		$rootScope.getProfToArray();
	}

	//Chargement et affichage de la liste de YouPubers
	$http.get("../../getYpFromDb.php").then(function success(response){
		$scope.youPubersData =  response.data
		for(i in $scope.youPubersData){
			var login = decodeHtml($scope.youPubersData[i].youpuber)
			$scope.youPubersInDb.push(login);
			
			//Vérifier s'il y a un profil communiqué
			$scope.adresse = decodeHtml($scope.youPubersData[i].adresse)+" "+$scope.youPubersData[i].cp
    	+" "+decodeHtml($scope.youPubersData[i].ville);
    		$scope.parking = decodeHtml($scope.youPubersData[i].parking);

    		console.log($scope.hasComProfile(login, $scope.adresse, $scope.parking));
    		$scope.hasComProfile(login, $scope.adresse, $scope.parking)

			//Vérifier s'il y a un profil reel enregistré pour le YouPuber
			$rootScope.hasProfile(login);
		}
		$scope.nbYouPubersIns = $scope.youPubersInDb.length;
	}, function error(response){

	});

	/*================a compléter========================*/
	$scope.hasComProfile = function(name, adresse, parking){
		return true;
		/*if((name != undefined && name != "") && ($scope.adresse != undefined && $scope.adresse != "")&& ($scope.parking != undefined && $scope.parking != "")){
			return true;
		} else {
			return false;
		}*/
	}
	/*================================================*/



	// nombre de YouPuber inscrits
	$scope.youPubersInDb.length;

	
	//Afficher le menu de chaque YouPuber au click de son nom dans la liste
	$scope.showInfoMenu = function(obj){
		var name = obj.target.attributes.data.value;
    	$scope.showInfo = true;
    	$scope.youPuberLogin = name;
    	cleanMap();
    	$scope.markerGroup.clearLayers();
    }

    // Afficher le profile communique par le YouPuber
    $scope.showCommProfile = function(name) {
    	var geocoder = L.Control.Geocoder.nominatim();
    	var query = decodeHtml($scope.youPubersData[name].adresse)+" "+$scope.youPubersData[name].cp
    	+" "+decodeHtml($scope.youPubersData[name].ville);
    	var queryParking = decodeHtml($scope.youPubersData[name].parking);
    	console.log(query);
    	console.log(queryParking);
    	
    	var lat1 = "";
    	var lng1 = "";
    	var lat2 = "";
    	var lng2 = "";
		
		$http.get("https://maps.googleapis.com/maps/api/geocode/json?address="+query+"&key=AIzaSyByExyXSJLQxhArJjaiPGrQ5s3N2K26CHA")
		.then(function success(response){
			var results = response.data.results;
			if(results[0] != undefined) {

				//console.log(results[0].geometry.location.lat)
				lat1 = results[0].geometry.location.lat;
				lng1 = results[0].geometry.location.lng;
				console.log(lat1+"//"+lng1);
			
				$http.get("https://maps.googleapis.com/maps/api/geocode/json?address="+queryParking+"&key=AIzaSyByExyXSJLQxhArJjaiPGrQ5s3N2K26CHA")
				.then(function success(response){
					var results = response.data.results;
					if(results[0] != undefined){
						//console.log(results[0].geometry.location.lat)
						lat2 = results[0].geometry.location.lat;
						lng2 = results[0].geometry.location.lng;
						console.log(lat2+"//"+lng2);

						var control = L.Routing.control({
						    lineOptions: {
					            styles: [
					            {color: '#ff6b66', opacity: 0.6, weight: 5}
					            ]
					        },
						    waypoints: [
						        L.latLng(lat1, lng1),
						        L.latLng(lat2, lng2)
						    ],
						    routeWhileDragging: true,
						    fitSelectedRoutes: true,
						    geocoder: geocoder,
						    createMarker: function(i, wp, n){
						    	var marker = L.marker(wp.latLng);
						    	marker.bindPopup("<b>"+$scope.youPubersData[name].youpuber+"</b><br/>Adresse : "+query+"<br>Parking : "+queryParking).openPopup();
						    	$scope.markerGroup.addLayer(marker);

						    }
						}).addTo(map);
						control.hide();
						$scope.markerGroup.addTo(map);
					} else {
						alert("L'adresse du parking n'a pas été trouvé :"+queryParking);
						console.log("L'adresse du parking n'a pas été trouvé :"+queryParking);
					}
					
				
				}, function error(response){
					console.log(response.data);
					alert("L'adresse du parking n'a pas été trouvé :"+queryParking);
					console.log("L'adresse du parking n'a pas été trouvé :"+queryParking);
				});
			} else {
				alert("Cette adresse n'a pas été trouvé :"+decodeHtml($scope.youPubersData[name].adresse)+" "+$scope.youPubersData[name].cp
    	+" "+decodeHtml($scope.youPubersData[name].ville));
				console.log("Cette adresse n'a pas été trouvé :"+decodeHtml($scope.youPubersData[name].adresse)+" "+$scope.youPubersData[name].cp
    	+" "+decodeHtml($scope.youPubersData[name].ville))

			}
		}, function error(response){
			console.log(response.data);
			alert("Cette adresse n'a pas été trouvé :"+decodeHtml($scope.youPubersData[name].adresse)+" "+$scope.youPubersData[name].cp
    	+" "+decodeHtml($scope.youPubersData[name].ville));
		});

    }

    $scope.showRealProfile = function(name){
    	console.log(name);
    	var wayPoints = [];
    	
    	$http.get("../../jsonData/profiles.json").then(function success(response){
    		var data = response.data;
    		for(i in data){
    			if(data[i].name == name) {
    				$scope.createRoutingLayer(name, true);
    				for(x in data[i].details){
		        		var latLng = L.latLng(data[i].details[x].latitud, data[i].details[x].longitud);
		        		wayPoints.push(latLng);
			        }

    			}
    		}
    		$scope.youpubers[name].setWaypoints(wayPoints);
    		$scope.taces.addLayer($scope.youpubers[name]);

    		$scope.markerGroup.addTo(map);
    		$scope.taces.addTo(map);

    	});
    }

    $scope.createRoutingLayer = function(name, zoom){
		
			var photoIcon = L.icon({
				iconUrl: '../../images/minilogo_seeyoupub.png',
				iconSize:     [40, 40], // size of the icon
	            popupAnchor:  [40, 40]
	        });

			$scope.youpubers.push(name);
			$scope.youpubers[name] = L.Routing.control({
				lineOptions: {
		            styles: [
		            {color: '#084a66', opacity: 0.6, weight: 5}
		            ]
		        },
			    waypoints: [
			        ],
			    routeWhileDragging: false,
			    draggableWaypoints: false,
			    autoRoute: true,
			    fitSelectedRoutes: zoom,
			    createMarker: function(i, wp, n){
			    	if(i == n-1){
			    		var marker = L.marker(wp.latLng, {icon: photoIcon});
			    		$scope.markerGroup.addLayer(marker);
			    	}
			    }
			});
	}
    
    /*To Factory*/
    $scope.clearMap = function(){
    	cleanMap();
    	$scope.markerGroup.clearLayers();
    }

    //Decoder HTML entities depuis la base de données 
    function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
	}

});

/*====================================================================
						SEARCH PROFILE CONTROLLER
====================================================================*/

mapApp.controller('searchProfileCtrl', function($scope, $http) {
	
	$scope.departements = [];
	$scope.campagnes = ["Darty", "Autre"];
	$scope.youPuberFound = [];
	$scope.youPuberSelection = [];
	$scope.nbFound = $scope.youPuberFound.length;
	$scope.nbSelected = $scope.youPuberSelection.length;
	//$scope.ville = "Paris";
	$scope.youpubers = [];
	$scope.taces = new L.layerGroup();
	$scope.markerGroup = new L.layerGroup();

	$scope.colors = ["#ffcc00", "#009900", "#ff00ff", "#660066", "#ff0000", "#cc3300", "#669900", "#003300", "#0000ff", "#0066cc"];

	$scope.initMapLayer = function() {
		
		initMap('map', 49.1659277, -0.2948727, 9);

		L.Control.geocoder({
			position:"topleft",
			placeholder: "Recherchez une ville"
		}).addTo(map);

		$scope.initDraw();
	}

	$scope.randomColor = function(colorArray){
		var index = Math.floor((Math.random() * colorArray.length) + 1);
		return colorArray[index]; 
	}

	/*=== Draw Service ===*/

	$scope.initDraw = function(){ 
		// Initialise the FeatureGroup to store editable layers
		var drawnItems = new L.FeatureGroup();
		  map.addLayer(drawnItems);

		// Initialise the draw control and pass it the FeatureGroup of editable layers
		drawControl = new L.Control.Draw({
		  	draw: {
			    polyline: false,
			    polygon: false,
			    circle: false,
			    marker:false
		  	},
		  	edit: {
			      featureGroup: drawnItems,
			      edit: false
		  }
		});
		drawControl.addTo(map)

		map.on('draw:created', function (e) {

		  	var type = e.layerType,
		      	layer = e.layer;

		  	if (type === 'rectangle') {
				//var area = L.GeometryUtil.geodesicArea(layer.getLatLngs());
				var rectangle = layer.getLatLngs();
				var bounds = layer.getBounds().toBBoxString();
				var res = bounds.split(",");
				console.log(res);
				var lng1 = res[0];
				var lat1 = res[1];
				var lng2 = res[2];
				var lat2 = res[3];
				//console.log(lat1+ " "+ lng2);
				$http.get("../../jsonData/profiles.json").then(function success(response){
					
					var wayPoints = [];
					var data = response.data;
					var name = "";
					for(i in data){
						name = data[i].name;
						for(x in data[i].details){
							var latitud = data[i].details[x].latitud;
							var longitud = data[i].details[x].longitud;
							if((latitud > lat1 && latitud < lat2)/* && (longitud > lng1 && longitud < lng2)*/){
								console.log(name);
								$scope.createRoutingLayer(name, false);
								var latLng = L.latLng(data[i].details[x].latitud, data[i].details[x].longitud);
		        				wayPoints.push(latLng); 
								
								$scope.youpubers[name].setWaypoints(wayPoints);
								$scope.taces.addLayer($scope.youpubers[name]);

								name = data[i].name;
								$scope.youPuberFound.push(name);
							}
							return;

						}
		    			
						
					}
					
					

					/*$scope.youpubers[name].setWaypoints(wayPoints);
		    		$scope.taces.addLayer($scope.youpubers[name]);*/

		    		$scope.markerGroup.addTo(map);
		    		$scope.taces.addTo(map);

				}, function error(response){

				});			
		  	}
			drawnItems.addLayer(layer);
		});
	}


	$scope.createRoutingLayer = function(name, zoom){
			console.log(name);
			var photoIcon = L.icon({
				iconUrl: '../../images/minilogo_seeyoupub.png',
				iconSize:     [40, 40], // size of the icon
	            popupAnchor:  [40, 40]
	        });

			$scope.youpubers.push(name);
			$scope.youpubers[name] = L.Routing.control({
				lineOptions: {
		            styles: [
		            {color: $scope.randomColor($scope.colors), opacity: 0.6, weight: 5}
		            ]
		        },
			    waypoints: [
			        ],
			    routeWhileDragging: false,
			    draggableWaypoints: false,
			    autoRoute: true,
			    fitSelectedRoutes: zoom,
			    createMarker: function(i, wp, n){
			    	if(i == n-1){
			    		var marker = L.marker(wp.latLng, {icon: photoIcon});
			    		marker.bindPopup("<p>"+name+"</p>");
			    		$scope.markerGroup.addLayer(marker);
			    	}
			    }
			});
	}






	
	$scope.addFound = function(index){
		$scope.youPuberSelection.push($scope.youPuberFound[index]);
		$scope.youPuberFound.splice(index, 1);
		$scope.nbFound--;
		$scope.nbSelected++;
	}
	
	$scope.addAll = function(){
		for(i in $scope.youPuberFound){
			$scope.youPuberSelection.push($scope.youPuberFound[i]);
			$scope.nbSelected++;
		}
		$scope.youPuberFound = [];
	}
	
	$scope.removeSelected = function(index){
		$scope.youPuberFound.push($scope.youPuberSelection[index]);
		$scope.youPuberSelection.splice(index, 1);
		$scope.nbSelected--;
		$scope.nbFound++;
	}
	
	$scope.clearFound = function(){
		$scope.youPuberFound = [];
		$scope.nbFound = 0;
	} 
	
	$scope.clearSelected = function(){
		for(i in $scope.youPuberSelection){
			$scope.youPuberFound.push($scope.youPuberSelection[i]);
		}
		$scope.youPuberSelection = [];
		$scope.nbSelected = 0;
	}
	
	$scope.save = function(){
		console.log('save');/*à compléter*/
	}

});


/*====================================================================
						GENERIC FUNCTIONS
====================================================================*/

// Initialisation de la Carte
var initMap = function(element, lat, lng, zoom) {
	map = L.map(element).setView([lat, lng], zoom);
	    mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>'
	    L.tileLayer(
	        '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	        attribution: 'Map data &copy; ' + mapLink,
	        maxZoom: 18,
	    }).addTo(map);
}

// Clean all traces from the map
	var cleanMap = function(){
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

/*===== DRAW AREAS=====*/
	
var initDraw = function(){ 
	// Initialise the FeatureGroup to store editable layers
	var drawnItems = new L.FeatureGroup();
	  map.addLayer(drawnItems);

	// Initialise the draw control and pass it the FeatureGroup of editable layers
	drawControl = new L.Control.Draw({
	  	draw: {
		    polyline: false,
		    polygon: false,
		    circle: false,
		    marker:false
	  	},
	  	edit: {
		      featureGroup: drawnItems,
		      edit: false
	  }
	});
	drawControl.addTo(map)

	// create draw
	map.on('draw:created', function (e) {

	  	var type = e.layerType,
	      	layer = e.layer;

	  	if (type === 'rectangle') {
			//var area = L.GeometryUtil.geodesicArea(layer.getLatLngs());
			var rectangle = layer.getLatLngs();
			//alert(rectangle);
			var bounds = layer.getBounds().toBBoxString();
			//console.log(bounds)
			var res = bounds.split(",");
			//console.log(res);
			var lng1 = res[0];
			var lat1 = res[1];
			var lng2 = res[2];
			var lat2 = res[3];
			//console.log(lat1+ " "+ lng2);
			$.getJSON( "../../jsonData/profiles.json", function( data ) {
				$.each( data, function( key, val ) {
					//console.log(key+":"+val.name);
					$.each(val.details, function(index, valeur){
						//console.log(valeur.latitud +" > "+ lat1 +" && "+ valeur.latitud +" < "+ lat2 +" && "+ valeur.longitud +" > "+ lng1 +" && "+ valeur.longitud +" < "+ lng2);
						if (valeur.latitud > lat1 && valeur.latitud < lat2) {
							console.log(val);
							return false;
						}						
					});
				});
			});
	  	}
		drawnItems.addLayer(layer);
	});
}
/*var x = document.getElementById("demo");
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
function showPosition(position) {
    x.innerHTML = "Latitude: " + position.coords.latitude +
    "<br>Longitude: " + position.coords.longitude;
}*/