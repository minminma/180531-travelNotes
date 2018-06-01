'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var webserver = require('gulp-webserver');
var gulpif = require('gulp-if');
var sprity = require('sprity');
var runSequence = require('run-sequence');
var zip = require('gulp-zip');
var upload = require('gulp-file-post');
// var upload = require('gulp-request');
var stripCssComments = require('gulp-strip-css-comments');
var del = require('del');
// var map = require('map-stream');
var postcss      = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var base64 = require('gulp-base64');
var gcmq = require('gulp-group-css-media-queries');
var cssnano = require('gulp-cssnano');
var htmlmin = require('gulp-htmlmin');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var spritesmith =require('gulp.spritesmith');

var config = {
    userName: 'minminma',
    projectName: '180531-travelnotes',
    sass: [
      './scss/style.scss',
    ],
    autoprefixer: {
      browsers: ['last 4 versions', 'Android >= 4.0', 'Chrome >= 37'],
      cascade: true, //是否美化属性值 默认：true 
      remove:true //是否去掉不必要的前缀 默认：true 
    },
    base64: {
      // extensions: [/\.__inline\.png$/i, /\.__inline\.svg$/i, /\.__inline\.jpe?g$/i, /\.__inline\.ttf$/i],
      extensions:  ['svg', 'png', /\.jpg#datauri$/i],
      exclude:    [/\.qq\.com\//, '--live.jpg'],
      maxImageSize: 10*1024, // bytes 
      debug: true
    },
    cssnano: {
      discardUnused: false,
      reduceIdents: false,
      mergeIdents: false,
      zindex: false,
      // core: false,//是否压缩
      autoprefixer: false
    },
    htmlmin: {
      removeComments: false,//清除HTML注释
      collapseWhitespace: false,//压缩HTML
      collapseBooleanAttributes: false,//省略布尔属性的值 <input checked="true"/> ==> <input />
      removeEmptyAttributes: false,//删除所有空格作属性值 <input id="" /> ==> <input />
      removeScriptTypeAttributes: false,//删除<script>的type="text/javascript"
      removeStyleLinkTypeAttributes: false,//删除<style>和<link>的type="text/css"
      minifyJS: false,//压缩页面JS
      minifyCSS: false//压缩页面CSS
    }
}

// 拷贝资源
gulp.task('html', function () {
    gulp.src('./**.html')
      .pipe(htmlmin(config.htmlmin))
      .pipe(gulp.dest('publish/'));
});
// 拷贝资源
// gulp.task('css', ['sass'], function() { 
gulp.task('css', function() { 
    return gulp.src('./css/*.css')
      .pipe(base64(config.base64))
      // .pipe(gcmq())
      .pipe(cssnano(config.cssnano))
      .pipe(gulp.dest('./publish/css'));
});

// 拷贝资源
gulp.task('cp_font', function() {
  return gulp.src('font/**')
    .pipe(gulp.dest('publish/font'));
});
// 拷贝资源
gulp.task('cp_img', function() {  
  return gulp.src(['img/**'])
    .pipe(gulp.dest('publish/img'));
});
// 拷贝资源
gulp.task('cp_js', function() {  
  return gulp.src('js/**')
    .pipe(gulp.dest('publish/js'));
});

// 清除dist所有资源
gulp.task('clean', function(cb) {  
  return del('publish/*',cb);
});

gulp.task('compress', function(cb) {
  return gulp.src('./publish/**')
    .pipe(zip('publish.zip'))
    .pipe(gulp.dest('./publish'));
});

gulp.task('upload_zip', ['compress'], function() {
  return gulp.src('./publish/publish.zip')
    .pipe(upload({
        url: "http://wapstatic.sparta.html5.qq.com/upload",
        data: {
            type: 'zip',
            to: "/data/wapstatic/"+config.userName+"/"+config.projectName
        },
        callback: function() {
            // del.sync(['./publish/publish.zip']);
            console.info( "upload: http://wapstatic.sparta.html5.qq.com/"+config.userName+"/"+config.projectName)
        },
        timeout: 30000
    }));
});

gulp.task('upload', ['upload_zip'], function() {
    del.sync(['./publish/publish.zip']);
});

// 定义构建任务队列
gulp.task('build', function (cb) {
    runSequence('clean', ['html', 'cp_font', 'cp_img', 'cp_js'],['old'],['css'],['upload'],cb);
});


gulp.task('sprite', function () {
  var spriteData = gulp.src('./slice/*.png').pipe(spritesmith({
    imgName: 'btn-sp.png',
    cssName: 'btn-sp.css',
    // retinaSrcFilter: ['./img/sprites/*@2x.png'],
    // retinaImgName: 'sprite@2x.png'
    cssTemplate: 'slice/tpl.hbs',
    padding: 10,
    algorithm: 'top-down',
  }));
  spriteData.img.pipe(gulp.dest('./img/'));
  spriteData.css
    .pipe(rename(function (path) {
      path.extname = ".scss"
    }))
    .pipe(gulp.dest('./sass/'));
});

gulp.task('sass', function() {
  return gulp.src(config.sass)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    // 去掉css注释  
    // .pipe(stripCssComments())
    .pipe(postcss([
      require('postcss-gradientfixer'),
      require('postcss-flexbugs-fixes'),
      autoprefixer(config.autoprefixer),
    ]))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./css'));
});

gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(webserver({
      livereload: {
        enable: true, // need this set to true to enable livereload 
        filter: function(fileName) {
          if (fileName.match(/.[html|css]$/)) {
            return true;
          } else {
            return false;
          }
        }
      },
      directoryListing: true,
        port: 9000
    }));
});

// generate sprite.png and _sprite.scss 
gulp.task('sprites', function() {
  return sprity.src({
      src: './slice/gametab/*.{png,jpg}',
      out: './img',
      name: 'sp-gametab',
      style: 'sp-gametab-icon.scss',
      cssPath: '../img',
      margin: 0,
      template: './sass/sprites-tpl.hbs',
      'dimension': [{
          ratio: 2,
          dpi: 192
        }],
        prefix: 'icon'
        // ... other optional options 
        // for example if you want to generate scss instead of css 
        // processor: 'sass' // make sure you have installed sprity-sass
    })
    .pipe(gulpif('*.png', gulp.dest('./img/'), gulp.dest('./sass/')));
    // .pipe(
    //   gulp.dest('./img/'),
    //   gulp.dest('./css/')
    // )
});

gulp.task('watch', function() {
  gulp.watch('./scss/*', ['sass']);
});

// 字蛛
var fontSpider = require( 'gulp-font-spider' );
gulp.task('fontspider', function() {
	return gulp.src('./html/store-app-special.html')
		.pipe(fontSpider());
});

// old文件颜色替换
// FFE9DA -> dcecff 
// F2863B -> 4c9afa
gulp.task('old', function() {
  var oldClore = ['FFE9DA','F2863B'];
  var clore = ['dcecff','4c9afa'];
  gulp.src([
    './css/main-softgame.css',
    './css/main-softgame-detail.css',
    ])
    .pipe(replace(oldClore[0], clore[0]))
    .pipe(replace(oldClore[1], clore[1]))
    .pipe(rename(function (path) {
      path.basename += "-old";
    }))
    .pipe(gulp.dest("./css"));
})


gulp.task('default', [
  'sass',
  'webserver',
  'watch'
]);