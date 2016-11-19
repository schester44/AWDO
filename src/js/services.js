(function(){
	var app = angular.module('tewns');
	
	app.factory('songService', ['$http', '$q', function($http, $q){
		return {
			getSong: function(id) {
				var d = $q.defer();
				$http.get('http://tewns.com/api/v1/song?id=' + id).success(function(data) {
					d.resolve(data);
				});

				return d.promise;
			},
			getRandom: function() {
				var d = $q.defer();
				$http.get('http://tewns.com/api/v1/random').success(function(data) {
					d.resolve(data);
				});

				return d.promise;
			}
		}
	}]);
})();