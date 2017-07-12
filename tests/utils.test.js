const utils = require("../utils");

describe("utils", function () {
    describe("map", function () {
        var map, double;

        map = utils.map;
        double = function (x) {
            return x * 2;
        };

        it("should map over an array", function () {
            expect(map([1, 2], double)).toEqual([2, 4]);
        });

        it("should map over an object", function () {
            expect(map({a: 1, b: 2}, double)).toEqual({a: 2, b: 4});
        });

        it("should return a new object", function () {
            var array;

            array = [1, 2];

            expect(map(array, double)).not.toBe(array);
        });
    });
});