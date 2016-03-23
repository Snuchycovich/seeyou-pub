var homeMapApp = angular.module('homeMapApp',[]).controller('mapController', function($scope, $http) {

	$scope.initMap = function(){
		map = L.map('map').setView([49.1659277, -0.2948727], 11);
	    mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>'
	    L.tileLayer(
	        '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	        attribution: 'Map data &copy; ' + mapLink,
	        maxZoom: 18,
	    }).addTo(map);

	    /*$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
	    $http.post('selectFile.php').then(function succes(response){
	    	for(i in response.data){
	    		$scope.filesByDate.push(response.data[i]);
	    	}
	    }, function error(response){
	    	console.log('Error pendant le chargement des fichiers...');
	    });

	    
		$http.get('imagesVoitutres.json').then(function iGotIt(response){
			$scope.dataImages = response.data;
		});*/
	}

});