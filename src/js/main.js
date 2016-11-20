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
			var songs = [];
			_.each(history, function(song, key) {
				song.fromHistory = true;
				songs.push(song);
			});

			$scope.songHistory = songs.reverse();
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
					
					$scope.playing = song;
					$scope.songHistory.unshift($scope.playing);
					$scope.isPlaying = true;
					$scope.audioLoaded = true;
				}
			});
		}

		$scope.addRemoveSong = function(song, index) {
			if (song.fromHistory) {
				removeFromHistory(song, index);
			} else {
				addToHistory(song, index);
			}
		}

		addToHistory = function(song, index)  {
			var history = JSON.parse(localStorageService.get('history'));
			history.push(song);
			localStorageService.set('history', JSON.stringify(history));

			$scope.songHistory[index].fromHistory = true;
		}

		removeFromHistory = function(song, index) {
			var history = JSON.parse(localStorageService.get('history'));
			var newHistory = _.without(history, _.findWhere(history, {
			  song_id: song.song_id
			}));

			localStorageService.set('history', JSON.stringify(newHistory));

			$scope.songHistory.splice(index, 1);
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