var gulp 	= require('gulp');
var concat 	= require('gulp-concat');
var sass 	= require('gulp-sass');
var rename  = require('gulp-rename');


gulp.task('js:compile', function() {
	return gulp.src([
		'node_modules/fuse.js/src/fuse.min.js',
		'node_modules/angular/angular.min.js',
		'node_modules/angular-local-storage/dist/angular-local-storage.min.js',
		'node_modules/underscore/underscore.js',
		'src/js/lib/sm2.js',
		'src/js/main.js',
		'src/js/components/**/*.js'
		])
		.pipe(concat('app.js'))
		.pipe(gulp.dest('dist/assets/js/'));
});

gulp.task('sass', function () {
 return gulp.src('src/sass/**/*.scss')
   .pipe(sass({outputStyle: 'compressed'}))
	.pipe(rename(function(path){
		path.basename += '.min';
	}))
   .pipe(gulp.dest('dist/assets/css'));
});


gulp.task('watch', function(){
	gulp.watch('src/sass/**/*.scss', ['sass']);
	gulp.watch('src/js/**/*.js', ['js:compile']);
})