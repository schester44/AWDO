/// ADD FUNCTION TO FLAG SONGS IF THEY'RE NOT WORKING / DEAD -- SOUNDCLOUD
// BUGS:: 
// rate limit click... possible to play multiple songs at once if you click next fast enogugh
// adding song to history isnt working on production
//  songs take on the album art of the last saved history song 
// needs some sort of state management  ( a variable for songs in the history and a variable for the songs being displayed)

(function(){
	var underscore = angular.module('underscore', []);
	underscore.factory('_', ['$window', function($window) {
	  return $window._; // assumes underscore has already been loaded on the page
	}]);

	var app = angular.module('tewns', ['LocalStorageModule', 'underscore']);

	app.controller('PlayerCtrl', ['$scope', 'songService', 'localStorageService', '_', 

		function ($scope, songService, localStorageService, _) {
		$scope.playing 		= {};
		$scope.songHistory 	= [];
		$scope.showOverlay 	= false;
		$scope.isPlaying 	= false;
		$scope.audioLoaded 	= false;
		var audio = {};

		$scope.searchBox = '';

		var searchOptions = {
		  threshold: 0.6,
		  location: 0,
		  distance: 100,
		  maxPatternLength: 32,
		  keys: [
		    "song_artist",
		    "song_title",
		    "song_producer",
		    "featuring"
		]
		};
		
		var fuse = new Fuse($scope.songHistory, searchOptions);
		// overwrite the existing fuse with a new copy of the songHistory
		$scope.$watch('songHistory', function(newVal, oldVal) {
			fuse = new Fuse($scope.songHistory, searchOptions);
		});

		//live search
	    $scope.$watch('searchBox', function(newVal, oldVal){
	    	if ($scope.searchBox.trim().length > 2) {
				var result = fuse.search($scope.searchBox);

				if (result.length > 0) {
					$scope.songHistory = result;
				}
	    	} else {
	    		initHistory();
	    	}
	    });

	    //init soundManager
		soundManager.setup({
		  onready: function() {}
		});

		//insert history from LocalStorage
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
		//main song playing function
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

		$scope.addRemoveSong = function(song, index) {
			if (song.fromHistory) {
				removeFromHistory(song, index);
			} else {
				addToHistory(song, index);
			}
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