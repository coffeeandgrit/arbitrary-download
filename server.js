var express = require('express'),
  path = require('path'),
  serve = require('serve-static'),
  util = require('util'),
  mime = require('mime'),
  async = require('async')
Promise = require('bluebird');

module.exports = exports = function(app, server, standalone) {

  return Promise.cast()
    .then(function() {
      var router = express.Router();
      router.get('/download/:size', function(req, res) {

        var conversion = {};
        conversion.b = {
          factor: 1,
          chunksize: 1
        };
        conversion.k = {
          factor: 1000,
          chunksize: conversion.b.factor
        };
        conversion.kb = {
          factor: 1000,
          chunksize: conversion.b.factor * Math.pow(10, 2)
        };
        conversion.mb = {
          factor: 1000 * 1000,
          chunksize: conversion.kb.factor * Math.pow(10, 2)
        };
        conversion.gb = {
          factor: 1000 * 1000 * 1000,
          chunksize: conversion.mb.factor * Math.pow(10, 2)
        };
        conversion.kib = {
          factor: 1024,
          chunksize: conversion.b.factor * Math.pow(2, 7)
        };
        conversion.mib = {
          factor: 1024 * 1024,
          chunksize: conversion.kib.factor * Math.pow(2, 7)
        };
        conversion.gib = {
          factor: 1024 * 1024 * 1024,
          chunksize: conversion.mib.factor * Math.pow(2, 7)
        };

        var parts = /^(\d+)([a-z]{2,3})\.(\w+)$/.exec(req.params.size);
        var s = conversion[parts[2].toLowerCase()];
        var size = parseInt(parts[1], 10) * s.factor;

        var mimetype = mime.lookup(req.params.size);

        res.setHeader('Content-disposition', 'attachment; filename=' + req.params.size);
        res.setHeader('Content-length', size);
        res.setHeader('Content-type', mimetype);

        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        var tasks = []
        for (var i = 0; i < size / s.chunksize; i++) {
          tasks.push(function(cb) {
            var str = [];
            for (var j = 0; j < s.chunksize; j++) {
              str.push(possible.charAt(Math.floor(Math.random() * possible.length)));
            }
            res.write(str.join(''));
            cb();
          });
        }

        if (size % s.chunksize > 0) {
          tasks.push(function(cb) {
            var str = [];
            for (var j = 0; j < size % s.chunksize; j++) {
              str.push(possible.charAt(Math.floor(Math.random() * possible.length)));
            }
            res.write(str.join(''));
            cb();
          });
        }

        async.series(tasks, function() {
          res.end();
        });
      });

      router.use(serve(path.resolve(__dirname, 'downloads')));

      return router;
    });
};

if (require.main === module) {
  require('cng-standalone')(require('./package.json'), module.exports, 7500);
}
