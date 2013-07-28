/*globals describe, it, chai, FixedSizeCache*/
/*jshint expr: true*/

var expect = chai.expect;

(function () {
    "use strict";

    describe("FixedSizeCache", function () {
        var BASELINE_CACHE_SIZE, _TEST_CACHE;

        _TEST_CACHE = new FixedSizeCache();
        BASELINE_CACHE_SIZE = _TEST_CACHE.getCacheMaximumCapacityInBytes() - _TEST_CACHE.getRemainingBytes();

        describe("FixedSizeCache", function () {
            it("should allow to define the max cache size in bytes", function () {
                var cache;

                cache = new FixedSizeCache({
                    settings : {
                        maxCacheSizeBytes : 1024
                    }
                });

                expect(cache.getCacheMaximumCapacityInBytes()).to.equal(1024);
            });

            it("should allow to define the max cache size in chars", function () {
                var cache;

                cache = new FixedSizeCache({
                    settings : {
                        maxCacheSize : 512
                    }
                });

                expect(cache.getCacheMaximumCapacityInBytes()).to.equal(1024);
            });

            it("should return an instance of FixedSizeCache", function () {
                expect(new FixedSizeCache()).to.be.an.instanceOf(FixedSizeCache);
            });
        });

        describe("set", function () {
            it("should allow to store objects", function () {
                expect(function () {
                    var cache;

                    cache = new FixedSizeCache();

                    cache.set("bob", {name: "bob"});
                }).not.to.throw(Error);
            });

            it("should return a new cache instance", function () {
                var cache;

                cache = new FixedSizeCache();

                expect(cache.set("bob", {name: "bob"})).to.be.instanceOf(FixedSizeCache);
                expect(cache.set("bob", {name: "bob"})).not.to.equal(cache);
            });

            it("should drop old keys if the cache is full", function () {
                var cache;

                cache = new FixedSizeCache({
                    settings : {
                        maxCacheSize : BASELINE_CACHE_SIZE - 50
                    }
                });

                cache = cache.set("a", [1]);

                expect(cache.get("a")).to.deep.equal([1]);

                //This should make "a" be dropped
                cache = cache.set("b", [1]);

                expect(cache.has("a")).to.be.false;
            });

            it("should drop the oldest keys when more space is necessary", function () {
                var cache;

                cache = new FixedSizeCache({
                    settings: {
                        maxCacheSize : BASELINE_CACHE_SIZE - 45
                    }
                });

                cache = cache.set("a", [1]);

                expect(cache.get("a")).to.deep.equal([1]);

                cache = cache.set("b", [1]);

                //Still has "a"
                expect(cache.has("a")).to.be.true;

                //This should make "a" be dropped, but not b
                cache = cache.set("c", [1]);

                expect(cache.has("a")).to.be.false;
                expect(cache.has("b")).to.be.true;
                expect(cache.has("c")).to.be.true;
            });

            it("should do nothing if the object is too large for the cache", function () {
                var cache;

                cache = new FixedSizeCache({
                    settings: {
                        maxCacheSize : BASELINE_CACHE_SIZE - 50
                    }
                });

                cache = cache.set("a", [1]);

                expect(cache.get("a")).to.deep.equal([1]);

                //As b is too large this should do nothing
                cache = cache.set("b", [1, 2, 3, 4, 5, 6]);

                expect(cache.has("a")).to.be.true;
                expect(cache.get("a")).to.deep.equal([1]);
            });

            it("should replace the existing value if a repeated key is used", function () {
                var cache;

                cache = new FixedSizeCache();

                cache = cache.set("a", [1]);

                expect(cache.get("a")).to.deep.equal([1]);

                cache = cache.set("a", [2]);

                expect(cache.get("a")).to.deep.equal([2]);
            });

            it("should update the freshness of a key if it is replaced", function () {
                var cache;

                cache = new FixedSizeCache({
                    settings: {
                        maxCacheSize : BASELINE_CACHE_SIZE - 45
                    }
                });

                cache = cache.set("a", [1]);

                expect(cache.get("a")).to.deep.equal([1]);

                cache = cache.set("b", [1]);

                //Given that we reset "a" here, "b" should be dropped
                cache = cache.set("a", [1]);

                //This should make "b" be dropped, but not a
                cache = cache.set("c", [1]);

                expect(cache.has("a")).to.be.true;
                expect(cache.has("b")).to.be.false;
                expect(cache.has("c")).to.be.true;
            });
        });

        describe("get", function () {
            it("should allow to get objects", function () {
                var cache;

                cache = new FixedSizeCache();

                cache = cache.set("bob", {name: "bob"});
                expect(cache.get("bob")).to.deep.equal({name: "bob"});
            });

            it("should return deep copies of the stored contents", function () {
                var cache, bob;

                cache = new FixedSizeCache();
                bob = {
                    name: {
                        first: "bob",
                        last: "catz"
                    }
                };

                cache = cache.set("bob", bob);
                expect(cache.get("bob")).to.deep.equal({
                    name: {
                        first: "bob",
                        last: "catz"
                    }
                });
                expect(cache.get("bob")).not.to.equal(bob);

                bob.name.first = "Jonh";

                expect(cache.get("bob")).to.deep.equal({
                    name: {
                        first: "bob",
                        last: "catz"
                    }
                });
            });
        });

        describe("has", function () {
            it("should return true if the cache has a given key", function () {
                var cache;

                cache = new FixedSizeCache();

                cache = cache.set("bob", {name: "bob"});
                expect(cache.has("bob")).to.be.true;
            });
        });

        describe("remove", function () {
            it("should remove a key from the cache", function () {
                var cache;

                cache = new FixedSizeCache();

                cache = cache.set("bob", {name: "bob"});
                expect(cache.has("bob")).to.be.true;

                cache = cache.remove("bob");

                expect(cache.has("bob")).to.be.false;
            });
        });

        describe("getRemainingFraction", function () {
            it("should returning the size of the fraction of the cache that is free", function () {
                var cache;

                cache = new FixedSizeCache({
                    settings: {
                        maxCacheSizeBytes : 1024
                    }
                });

                //Even an empty cache takes to space
                expect(cache.getRemainingFraction()).to.equal(1 - (906 / 1024));
            });
        });

        describe("getRemainingBytes", function () {
            it("should return the number of free bytes remaining in the cache", function () {
                var cache;

                cache = new FixedSizeCache({
                    settings: {
                        maxCacheSizeBytes : 1024
                    }
                });

                //Even an empty cache takes to space
                expect(cache.getRemainingBytes()).to.equal(906);
            });
        });

        describe("getCacheMaximumCapacityInBytes", function () {
            it("should return the maximum cache capacity in bytes", function () {
                var cache;

                cache = new FixedSizeCache({
                    settings: {
                        maxCacheSize : 512
                    }
                });

                expect(cache.getCacheMaximumCapacityInBytes()).to.equal(1024);
            });
        });
    });

    describe("utils", function () {
        describe("map", function () {
            var map, double;

            map = FixedSizeCache._utils.map;
            double = function (x) {
                return x * 2;
            };

            it("should map over an array", function () {
                expect(map([1, 2], double)).to.deep.equal([2, 4]);
            });

            it("should map over an object", function () {
                expect(map({a: 1, b: 2}, double)).to.deep.equal({a: 2, b: 4});
            });

            it("should return a new object", function () {
                var array;

                array = [1, 2];

                expect(map(array, double)).not.to.equal(array);
            });
        });
    });
}());
