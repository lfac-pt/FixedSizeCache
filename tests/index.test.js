const FixedSizeCache = require("../index");

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

            expect(cache.getCacheMaximumCapacityInBytes()).toBe(1024);
        });

        it("should allow to define the max cache size in chars", function () {
            var cache;

            cache = new FixedSizeCache({
                settings : {
                    maxCacheSize : 512
                }
            });

            expect(cache.getCacheMaximumCapacityInBytes()).toBe(1024);
        });

        it("should return an instance of FixedSizeCache", function () {
            expect(new FixedSizeCache()).toBeInstanceOf(FixedSizeCache);
        });
    });

    describe("set", function () {
        it("should allow to store objects", function () {
            expect(function () {
                var cache;

                cache = new FixedSizeCache();

                cache.set("bob", {name: "bob"});
            }).not.toThrowError(Error);
        });

        it("should return a new cache instance", function () {
            var cache;

            cache = new FixedSizeCache();

            expect(cache.set("bob", {name: "bob"})).toBeInstanceOf(FixedSizeCache);
            expect(cache.set("bob", {name: "bob"})).not.toBe(cache);
        });

        it("should drop old keys if the cache is full", function () {
            var cache;

            cache = new FixedSizeCache({
                settings : {
                    maxCacheSize : BASELINE_CACHE_SIZE - 50
                }
            });

            cache = cache.set("a", [1]);

            expect(cache.get("a")).toEqual([1]);

            //This should make "a" be dropped
            cache = cache.set("b", [1]);

            expect(cache.has("a")).toBe(false);
        });

        it("should drop the oldest keys when more space is necessary", function () {
            var cache;

            cache = new FixedSizeCache({
                settings: {
                    maxCacheSize : BASELINE_CACHE_SIZE - 45
                }
            });

            cache = cache.set("a", [1]);

            expect(cache.get("a")).toEqual([1]);

            cache = cache.set("b", [1]);

            //Still has "a"
            expect(cache.has("a")).toBe(true);

            //This should make "a" be dropped, but not b
            cache = cache.set("c", [1]);

            expect(cache.has("a")).toBe(false);
            expect(cache.has("b")).toBe(true);
            expect(cache.has("c")).toBe(true);
        });

        it("should do nothing if the object is too large for the cache", function () {
            var cache;

            cache = new FixedSizeCache({
                settings: {
                    maxCacheSize : BASELINE_CACHE_SIZE - 50
                }
            });

            cache = cache.set("a", [1]);

            expect(cache.get("a")).toEqual([1]);

            //As b is too large this should do nothing
            cache = cache.set("b", [1, 2, 3, 4, 5, 6]);

            expect(cache.has("a")).toBe(true);
            expect(cache.get("a")).toEqual([1]);
        });

        it("should replace the existing value if a repeated key is used", function () {
            var cache;

            cache = new FixedSizeCache();

            cache = cache.set("a", [1]);

            expect(cache.get("a")).toEqual([1]);

            cache = cache.set("a", [2]);

            expect(cache.get("a")).toEqual([2]);
        });

        it("should update the freshness of a key if it is replaced", function () {
            var cache;

            cache = new FixedSizeCache({
                settings: {
                    maxCacheSize : BASELINE_CACHE_SIZE - 45
                }
            });

            cache = cache.set("a", [1]);

            expect(cache.get("a")).toEqual([1]);

            cache = cache.set("b", [1]);

            //Given that we reset "a" here, "b" should be dropped
            cache = cache.set("a", [1]);

            //This should make "b" be dropped, but not a
            cache = cache.set("c", [1]);

            expect(cache.has("a")).toBe(true);
            expect(cache.has("b")).toBe(false);
            expect(cache.has("c")).toBe(true);
        });

        it("should set a large object", function () {
            var cache;

            function buildObject(size) {
                const largeObject = {};

                for (let i = 0; i < size; i++) {
                    largeObject["key" + i] = Math.random();
                }

                return largeObject;
            }

            cache = new FixedSizeCache({});

            cache = cache.set("kakaka", buildObject(10000));

            expect(cache.has("kakaka")).toBe(true);
        })
    });

    describe("get", function () {
        it("should allow to get objects", function () {
            var cache;

            cache = new FixedSizeCache();

            cache = cache.set("bob", {name: "bob"});
            expect(cache.get("bob")).toEqual({name: "bob"});
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
            expect(cache.get("bob")).toEqual({
                name: {
                    first: "bob",
                    last: "catz"
                }
            });
            expect(cache.get("bob")).not.toBe(bob);

            bob.name.first = "Jonh";

            expect(cache.get("bob")).toEqual({
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
            expect(cache.has("bob")).toBe(true);
        });
    });

    describe("remove", function () {
        it("should remove a key from the cache", function () {
            var cache;

            cache = new FixedSizeCache();

            cache = cache.set("bob", {name: "bob"});
            expect(cache.has("bob")).toBe(true);

            cache = cache.remove("bob");

            expect(cache.has("bob")).toBe(false);
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
            expect(cache.getRemainingFraction()).toBe(1 - (906 / 1024));
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
            expect(cache.getRemainingBytes()).toBe(906);
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

            expect(cache.getCacheMaximumCapacityInBytes()).toBe(1024);
        });
    });
});
