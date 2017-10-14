# Mongo Sequential

Create primary keys or another sequential number with a mongodb hosted
counter.

Uses the `findOneAndUpdate` from `mongodb` to guarantee unique keys.

Use *Promises* or *callbacks*. If you pass a callback it will be called with
standard node convention of `cb(err, result)`. Promises are implemented using
[bluebird](https://github.com/petkaantonov/bluebird).

Exports: `increment(collection, name[, cb(err, count)]) -> (Promise -> Integer)`

## Install

```shell
npm install mongo-sequential
```

## Usage

```js
var mongodb = require('mongodb');
var increment = require('mongo-sequential');

mongodb.connect('mongodb://localhost/test', function( err, db ){
	var collection = db.collection('counters');
	var name = 'users';

	increment(collection, name)
		.then(console.log.bind(console));	// 1

	// use bind to pre-configure
	var incrementer = increment.bind(null, collection, name);

	incrementer()
		.then(console.log.bind(console));	// 2
});
```

## Test

Requires a running mongodb on localhost

```shell
npm test
```
