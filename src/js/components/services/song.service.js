(function(){
angular.module('tewns').factory('songService', ['$http', '$q', 
	function($http, $q){
		return {
			getSong: function(id) {
				var d = $q.defer();
				$http.get('http://api.dev/v1/songs?id=' + id, { 
					headers: {
    					'X-DOPE': 'cgcgc4cswo4kc48gsswos40s0w0w44k8ogwggsow'
    				}
				}).success(function(data) {
					d.resolve(data);
				});

				return d.promise;
			},
			getRandom: function() {
				var d = $q.defer();
				$http.get('http://api.dev/v1/random', {
					headers: {
						'X-DOPE': 'cgcgc4cswo4kc48gsswos40s0w0w44k8ogwggsow'
					}
				}).success(function(data) {
					console.log(data);
					d.resolve(data);
				});

				return d.promise;
			}
		}
	}]);
})();