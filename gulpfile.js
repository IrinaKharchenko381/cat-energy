import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import rename from 'gulp-rename';
import csso from 'postcss-csso';
import imagemin, {gifsicle, mozjpeg, optipng, svgo} from 'gulp-imagemin';
import webp from 'gulp-webp';
import svgstore from 'gulp-svgstore';
import {deleteAsync} from 'del';
import sync from 'browser-sync';
import sourcemap from 'gulp-sourcemaps';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(sync.stream());
}

//html

export const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
}

// Scripts

export const scripts = () => {
  return gulp.src("source/js/app.js")
    .pipe(terser())
    .pipe(rename("app.min.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
}

// Images

export const optimizeImages = () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
  .pipe(imagemin([
    gifsicle({interlaced: true}),
	  mozjpeg({quality: 75, progressive: true}),
	  optipng({optimizationLevel: 5}),
    svgo({
		  plugins: [
			  {
			  	name: 'removeViewBox',
			  	active: true
		  	},
		  	{
		  		name: 'cleanupIDs',
		  		active: false
		  	}
		  ]
	  })
  ]))
  .pipe(gulp.dest("build/img"))
}

export const copyImages = () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(gulp.dest("build/img"))
}

// WebP

export const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"))
}


// Sprite

export const sprite = () => {
  return gulp.src("source/img/icons/*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
}

// Copy

 export const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff2,woff}",
    "source/*.ico",
    "source/img/**/*.svg",
    "source/*.webmanifest",
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"))
  done();
}

// Clean

export const clean = () => {
  return deleteAsync("build");
};

// Server

export const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

export const reload = (done) => {
  sync.reload();
  done();
}

// Watcher

export const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles, reload));
  gulp.watch("source/js/app.js", gulp.series(scripts));
  gulp.watch("source/*.html", gulp.series(html, reload));
}


// Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    sprite,
    createWebp
  ),
);


// Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  )
);
