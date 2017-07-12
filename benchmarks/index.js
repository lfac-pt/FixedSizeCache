const Benchmark = require('benchmark');
const FixedSizeCache = require("../index");
const suite = new Benchmark.Suite;

function buildObject(size) {
    const largeObject = {};

    for (let i = 0; i < size; i++) {
        largeObject["key" + i] = Math.random();
    }

    return largeObject;
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
suite
.add('add 5 large equal items V2', function() {
    let cache = new FixedSizeCache();

    for (let i = 0; i < 5; i++) {
        cache.set("bob" + i, largeObject);
    }
})
.add('add 5 large different items V2', function() {
    let cache = new FixedSizeCache();

    for (let i = 0; i < 5; i++) {
        cache.set("bob" + i, twentyLargeObjects[i]);
    }
})
.add('add 20 small different items V2', function() {
    let cache = new FixedSizeCache();

    for (let i = 0; i < 200; i++) {
        cache.set("bob" + i, twoTousandSmallObjects[i]);
    }
})

.on('cycle', function(event) {
  console.log(String(event.target));
})
.run({ 'async': true });
