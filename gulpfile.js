"use strict"

const { src, dest } = require("gulp")
const gulp = require("gulp")
const autoprefixer = require("gulp-autoprefixer")
const cssbeautify = require("gulp-cssbeautify")
const removeComments = require("gulp-strip-css-comments")
const sass = require("gulp-sass")(require('sass'))
const uglify = require("gulp-uglify")
const rigger = require('gulp-rigger')
const panini = require('panini')
const imagemin = require('gulp-imagemin')
const del = require("del")
const { stream } = require("browser-sync")
const browserSync = require('browser-sync').create();

// Paths
const srcPath = "src/";
const distPath = "dist/";


//Прописываем все пути
const path = {
    build: {
        html: distPath,
        css: distPath + "assets/css/",
        images: distPath + "assets/images/",
        js: distPath + "assets/js/",
        php: distPath + "assets/php/",
        components: distPath + "assets/components/`",
        fonts: distPath + "assets/fonts/"
    },
    src: {
        html: srcPath + "*.html",
        css: srcPath + "assets/scss/*.scss",
        images: srcPath + "assets/images/**/*.{jpg,jpeg,png,svg,webp,gif,ico,webmanifest,xml,json}",
        js: srcPath + "assets/js/*.js",
        php: srcPath + "assets/php/*.php",
        components: srcPath + "assets/components/*.php",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg,otf}"
    },
    watch: {
        html: srcPath + "**/*.html",
        css: srcPath + "assets/scss/**/*.scss",
        images: srcPath + "assets/images/**/*.{jpg,jpeg,png,svg,webp,gif,ico,webmanifest,xml,json}",
        js: srcPath + "assets/js/**/*.js",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg,otf}"
    },
    clean: "./" + distPath
}

// Таск для HTML
function html() {
    panini.refresh()
    return src(path.src.html, { base: srcPath })
        .pipe(panini({
            root: srcPath,
            layouts: srcPath + "tpl/layouts",
            partials: srcPath + "tpl/partials",
        }))
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({ stream: true }))
}

// Таск для CSS
function css() {
    return src(path.src.css, { base: srcPath + "assets/scss/" })
        .pipe(browserSync.reload({ stream: true }))
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(removeComments())
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({ stream: true }))
}


// Таск для JS
function js() {
    return src(path.src.js, { base: srcPath + "assets/js/" })
        .pipe(rigger())
        .pipe(uglify())
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({ stream: true }))
}

// Таск для сжатия и переноса картинок
function images() {
    return src(path.src.images, { base: srcPath + "assets/images/" })
        .pipe(imagemin(
            [
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({ quality: 75, progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [
                        { removeViewBox: true },
                        { cleanupIDs: false }
                    ]
                })
            ]
        ))
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({ stream: true }))
}

function libs() {

}
// Таск для очистки
function clean() {
    return del(path.clean)
}

// BrowserSync
function server() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        }
    })
}


// Таск для шрифтов
function fonts() {
    return src(path.src.fonts, { base: srcPath + "assets/fonts/" })
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({ stream: true }))
}

// Таск для просматривания
function watchFile() {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.fonts], fonts)
    gulp.watch([path.watch.images], images)
}





// Построение dist
const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts))
const watch = gulp.parallel(build, watchFile, server)



// exports
exports.fonts = fonts
exports.images = images
exports.html = html
exports.css = css
exports.js = js
exports.clean = clean
exports.build = build
exports.watch = watch
// Дефолтный таск
exports.default = watch


