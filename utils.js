const utils = {
    map : function (iterable, iterator) {
        var resultIterable, keys, i, key;

        if (Object(iterable) !== iterable) {
            return {};
        }

        if (iterator instanceof Function === false) {
            iterator = utils.identity;
        }

        resultIterable = new iterable.constructor();
        keys = Object.keys(iterable);

        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            resultIterable[key] = iterator(iterable[key], key, iterable);
        }

        return resultIterable;
    },
    identity : function (value) {
        return value;
    },
    immutableBindArgument : function (_state) {
        var _stateString;

        //TODO: think about replacing this with a "real" deep copy
        _stateString = JSON.stringify(_state);

        return function (func) {
            return func.bind(undefined, JSON.parse(_stateString));
        };
    },
    makeImmutableAndMixIn : function (methods, _initialState, instance) {
        var boundMethods;

        boundMethods = utils.map(methods, utils.immutableBindArgument(_initialState));
        utils.map(boundMethods, utils.setIn(instance));
    },
    setIn : function (object) {
        return function (value, key) {
            object[key] = value;
        };
    },
    isEmpty : function (object) {
        return Object.keys(object).length === 0;
    },
    not : function (value) {
        return !value;
    },
    isObject : function (value) {
        return Object(value) === value;
    },
    isArray : function (value) {
        return value instanceof Array;
    },
    isNumber : function (number) {
        return typeof number === "number";
    },
    Immutable : function (methods, classProperties) {
        var constructor;

        constructor = function (_state) {
            utils.makeImmutableAndMixIn(methods, methods.initialize.call(undefined, _state), this);
        };

        utils.map(classProperties, utils.setIn(constructor));

        return constructor;
    }
};

module.exports = utils;