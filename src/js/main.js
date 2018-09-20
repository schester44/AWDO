(function(){
	var underscore = angular.module('underscore', []);
	underscore.factory('_', ['$window', function($window) {
	  return $window._; // assumes underscore has already been loaded on the page
	}]);

	var app = angular.module('tewns', ['LocalStorageModule', 'underscore']);

	app.controller('PlayerCtrl', ['$scope', 'songService', 'localStorageService', '_', 
		function ($scope, songService, localStorageService, _) {
			var audio = {};			
			var state = {
				songHistory: [],
				currentList: [],
				history: (JSON.parse(localStorageService.get('history'))) ? JSON.parse(localStorageService.get('history')) : []
			}

			$scope.currentSong 		= {};
			$scope.listSongs 		= state.currentList;
			$scope.listSongsLength   = state.currentList.length;
			$scope.showOverlay 		= false;
			$scope.isPlaying 		= false;
			$scope.audioLoaded 		= false;
			$scope.searchBox 		= '';
			$scope.songHistory  	= state.songHistory;

			//fuzzy search
			var searchOptions = {
		  		threshold: 0.6,
		  		location: 0,
		  		distance: 100,
		  		maxPatternLength: 32,
		  		keys: [
		    		"song_artist",
		    		"song_title"
				]
			};
		

			var fuse = new Fuse($scope.songHistory, searchOptions);
		$scope.$watch('songHistory', function(current, old) {
			fuse = new Fuse($scope.songHistory, searchOptions);
		})

	    $scope.$watch('searchBox', function(newVal, oldVal){
	    	if ($scope.searchBox.trim().length > 2) {
				var result = fuse.search(newVal);
				if (result.length > 0) {
					$scope.listSongs = result;
				}
	    	} else {
	    		$scope.listSongs 		= state.currentList;
	    		$scope.listSongsLength 	= state.currentList.length;
	    	}
	    });

	    //init soundManager
		soundManager.setup({
		  onready: function() {}
		});

		//insert history from LocalStorage
		initHistory();

		function initHistory() {
			var songs = [];

			_.each(state.history, function(song, key) {
				song.fromHistory = true;
				songs.unshift(song);
			});

			state.songHistory 	= songs;
			state.currentList   = songs;
			$scope.songHistory = state.songHistory;
		}

		//main song playing function
		function playSong(song){
		    if (audio.nowPlaying){
		        audio.nowPlaying.destruct();
		    }

		    if (typeof song !== "undefined") {
		    	//play song from history
		    } else {
		    	songService.getRandom().then(function(song) {
		    		var song = song.data[0];
					if ($scope.songHistory.indexOf(song) == -1) {
					    soundManager.onready(function() {
					        audio.nowPlaying = soundManager.createSound({
					            id: song.id,
					            url: song.source,
					            autoLoad: true,
					            autoPlay: true,
					            volume: 100,
					            onfinish: function(){
					            	playSong();
					            }
					        })
					    });
						
						$scope.currentSong 	= song;
						$scope.listSongs.unshift($scope.currentSong);
						$scope.listSongsLength = $scope.listSongs.length;
						$scope.isPlaying 	= true;
						$scope.audioLoaded 	= true;
					}
				});
		    }
		}

		addToHistory = function(song, index)  {			
			$scope.listSongs[index].fromHistory = true;
			state.history.push(song);

			localStorageService.set('history', JSON.stringify(state.history));
		}

		removeFromHistory = function(song, index) {
			var newHistory = _.without(state.history, _.findWhere(state.history, {
			  song_id: song.song_id
			}));

			state.history = newHistory;
			$scope.listSongs[index].fromHistory = false;

			localStorageService.set('history', JSON.stringify(newHistory));
		}

		$scope.addRemoveSong = function(song, index) {
			if (song.fromHistory) {
				removeFromHistory(song, index);
			} else {
				addToHistory(song, index);
			}
		}
		
		$scope.togglePlay = function() {
			$scope.isPlaying = !$scope.isPlaying;

			if (!$scope.audioLoaded) {
				playSong();
			} else {
				soundManager.togglePause($scope.currentSong.song_id);
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
