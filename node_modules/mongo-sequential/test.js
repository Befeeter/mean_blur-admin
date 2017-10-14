'use strict';

var tap = require('tap');
var Promise = require('bluebird');
var mongodb = require('mongodb');
var increment = require('./');

var connect = Promise.promisify(mongodb.connect);

var db = connect('mongodb://localhost/test');
var collection = db.call('collection', 'counters');

var incrementer = increment.bind(null, collection, 'test-' + (new Date()).getTime());

tap.on('end', function(){
	db.call('close');
});

tap.test(function( t ){
	t.plan(3);

	var first = incrementer()
		.tap(function( c ){
			t.equal(c, 1, 'the first result is zero');
		});

	var second = first
		.then(function(){
			return incrementer();
		})
		.tap(function( c ){
			t.equal(c, 2, 'the second result is two');
		});

	second
		.then(function(){
			return Promise.all([
				incrementer(),
				incrementer(),
				incrementer(),
				incrementer(),
				incrementer(),
				incrementer(),
			]);
		})
		.tap(function( sequence ){
			t.deepEqual(sequence.sort(), [ 3, 4, 5, 6, 7, 8 ], 'numbers are given sequentially');
		});
});
