(function(){
	var underscore = angular.module('underscore', []);
	underscore.factory('_', ['$window', function($window) {
	  return $window._; // assumes underscore has already been loaded on the page
	}]);

	var app = angular.module('tewns', ['LocalStorageModule', 'underscore']);

	app.controller('PlayerCtrl', ['$scope', 'songService', 'localStorageService', '_', function ($scope, songService, localStorageService, _) {
		$scope.playing 		= {};
		$scope.songHistory 	= [];
		$scope.showOverlay 	= false;
		$scope.isPlaying 	= false;
		$scope.audioLoaded 	= false;
		var audio = {};

		soundManager.setup({
		  onready: function() {}
		});

		initHistory();

		function initHistory() {
			var history = JSON.parse(localStorageService.get('history'));
			console.log(history);
			$scope.songHistory = history.reverse();
		}

		function playSong(){
		    if (audio.nowPlaying){
		        audio.nowPlaying.destruct();
		    }
	    	songService.getRandom().then(function(song) {
				if ($scope.songHistory.indexOf(song) == -1) {
				    soundManager.onready(function() {
				        audio.nowPlaying = soundManager.createSound({
				            id: song.song_id,
				            url: song.source,
				            autoLoad: true,
				            autoPlay: true,
				            volume: 100,
				            onfinish: function(){
				            	playSong();
				            }
				        })
				    });
					var history = JSON.parse(localStorageService.get('history'));
					history = (history) ? history : [];
					history.push(song);
					localStorageService.set('history', JSON.stringify(history));
					
					$scope.playing = song;
					$scope.songHistory.unshift($scope.playing);
					$scope.isPlaying = true;
					$scope.audioLoaded = true;
				}
			});
		}

		$scope.removeFromHistory = function(song) {
			var history = JSON.parse(localStorageService.get('history'));
			var newHistory = _.without(history, _.findWhere(history, {
			  song_id: song.song_id
			}));

			localStorageService.set('history', JSON.stringify(newHistory));
			$scope.songHistory = newHistory;
		}

		$scope.playFromHistory = function(song) {
			if (audio.nowPlaying){
	        	audio.nowPlaying.destruct();
		    }

		    soundManager.onready(function() {
		        audio.nowPlaying = soundManager.createSound({
		            id: song.song_id,
		            url: song.source,
		            autoLoad: true,
		            autoPlay: true,
		            volume: 100,
		            onfinish: function(){
		            	// play next song in history array.. if no song left, playSong();
		            }
		        })
		    });

			$scope.playing = song;
			$scope.isPlaying = true;
			$scope.audioLoaded = true;
		}

		$scope.togglePlay = function() {
			$scope.isPlaying = !$scope.isPlaying;

			if (!$scope.audioLoaded) {
				playSong();
			} else {
				soundManager.togglePause($scope.playing.song_id);
			}
		}

		$scope.nextSong = function(){
			playSong();
		}

		$scope.toggleOverlay = function() {
			$scope.showOverlay = !$scope.showOverlay;
		}

	}]);
})();