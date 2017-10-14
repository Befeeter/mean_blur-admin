'use strict';

var Promise = require('bluebird');

module.exports = increment;

var sort = [
	[ '_id', 1 ],
];

var modify = {
	$inc: { count: 1 },
};

var options = {
	upsert: true,

	// mongodb > v2.x
	sort: sort,
	returnOriginal: false,

	// mongodb < v2.x
	new: true,
};

function increment( collection, name, cb ) {
	return Promise
		.join(collection, name)
		.spread(function( collection, name ){
			var search = {
				_id: name,
			};

			return Promise
				.fromNode(function( cb ){
					// mongodb > v2.x
					if (collection.findOneAndUpdate)
						collection.findOneAndUpdate(search, modify, options, cb);
					else
						collection.findAndModify(search, sort, modify, options, cb);
				})
				.then(function( r ){
					// mongodb > v2.x has r.value
					return r.value ? r.value : r[0];
				})
				.get('count');
		})
		.nodeify(cb);
}
