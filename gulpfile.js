"use strict";
const gulp = require('gulp');

/* ==============================
    Sketch UI Generator
============================== */
const preview = require('sketch-preview')({
    input: './sketch/iOS/sprinter_iOS.sketch',
}, gulp)

gulp.task('export', preview)
