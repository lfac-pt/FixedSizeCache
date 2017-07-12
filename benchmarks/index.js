const Benchmark = require('benchmark');
const FixedSizeCache = require("../index");
const suite = new Benchmark.Suite;

function buildObject(size) {
	const largeObject = {};

	for (let i = 0; i < size; i++) {
		largeObject["key" + i] = Math.random();
	}
}

// Test objects
const largeObject = buildObject(10000);
const twentyLargeObjects = [];
for (let i = 0; i < 20; i++) {
	twentyLargeObjects[i] = buildObject(10000);
}
const twoTousandSmallObjects = [];
for (let i = 0; i < 2000; i++) {
	twoTousandSmallObjects[i] = buildObject(10);
}

// Actual tests
let cache = new FixedSizeCache();
suite
.add('add 20 large equal items', function() {
	for (let i = 0; i < 20; i++) {
		cache = cache.set("bob" + i, largeObject);
	}
})
.add('add 20 large different items', function() {
	for (let i = 0; i < 20; i++) {
		cache = cache.set("bob" + i, twentyLargeObjects[i]);
	}
})
.add('add 2000 small different items', function() {
	for (let i = 0; i < 2000; i++) {
		cache = cache.set("bob" + i, twoTousandSmallObjects[i]);
	}
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.run({ 'async': true });
