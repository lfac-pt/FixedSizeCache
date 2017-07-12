const utils = require("./utils");
const map = utils.map;
const Immutable = utils.Immutable;
const isEmpty = utils.isEmpty;
const not = utils.not;
const isObject = utils.isObject;
const isArray = utils.isArray;
const isNumber = utils.isNumber;

/**
 * The FixedSizeCache is an immutable, isolated, size limited cache for JavaScript plain objects.
 * Performance wise this implementation has very cheap get/has, relatively cheap remove and expensive writes.
 *
 * TODO:
 * ? Check the consistency of keyFifo on initialization
 * ? Performance optimization: use closures instead of bind
 * ? Make a standalone file with Immutable
 * ? Migrate to grunt/browserify
 *
 * @type {Immutable}
 */
const FixedSizeCache = Immutable({
    /**
     * Initializes the state
     *
     * @param {Object} [_state] The state of the cache
     */
    initialize : function (_state) {
        if (not(isObject(_state))) {
            _state = {};
        }
        if (not(isObject(_state.storage))) {
            _state.storage = {};
        }
        if (not(isArray(_state.keyFifo))) {
            _state.keyFifo = [];
        }
        if (not(isObject(_state.settings))) {
            _state.settings = map(FixedSizeCache.defaultSettings);
        }

        //Convert from bytes to chars if necessary and delete unnecessary maxCacheSizeBytes
        if (isNumber(_state.settings.maxCacheSizeBytes)) {
            _state.settings.maxCacheSize = _state.settings.maxCacheSizeBytes / 2;
            delete _state.settings.maxCacheSizeBytes;
        }

        return _state;
    },
    /**
     * Stores a value in the entry with name key.
     * @param {Object} _state PRIVATE - The current state of the cache
     * @param {String} key
     * @param {*} value
     * @returns {FixedSizeCache}
     */
    set : function (_state, key, value) {
        var keyIndexInFifo, keyFifo, settings, originalStateString;

        originalStateString = JSON.stringify(_state);
        keyFifo = _state.keyFifo;
        settings = _state.settings;

        _state.storage[key] = value;

        keyIndexInFifo = keyFifo.indexOf(key);
        if (keyIndexInFifo !== -1) {
            //If the key was already in the cache, remove it from the fifo and add it again to freshen it up
            keyFifo.splice(keyIndexInFifo, 1);
        }
        keyFifo.push(key);

        while (JSON.stringify(_state).length > settings.maxCacheSize && not(isEmpty(_state.storage))) {
            delete _state.storage[keyFifo.shift()];
        }

        if (isEmpty(_state.storage)) {
            //If the object to add was too large rollback to the previous state
            _state = JSON.parse(originalStateString);
        }

        return new FixedSizeCache(_state);
    },
    /**
     * Gets the value associated with key, if it exists, otherwise returns undefined.
     * @param {Object} _state PRIVATE - The current state of the cache
     * @param {String} key
     * @returns {*}
     */
    get : function (_state, key) {
        return _state.storage[key];
    },
    /**
     * Returns a copy of the entire cache.
     * @param {Object} _state PRIVATE - The current state of the cache
     * @returns {Object}
     */
    all : function (_state) {
        return _state.storage;
    },
    /**
     * Returns true if for the key there is an associated value.
     * @param {Object} _state PRIVATE - The current state of the cache
     * @param {String} key
     * @returns {boolean}
     */
    has : function (_state, key) {
        return _state.storage.hasOwnProperty(key);
    },
    /**
     * Removes the value associated with the and the key itself.
     * @param {Object} _state PRIVATE - The current state of the cache
     * @param {String} key
     * @returns {FixedSizeCache}
     */
    remove : function (_state, key) {
        var keyFifo;

        keyFifo = _state.keyFifo;

        delete _state.storage[key];
        keyFifo.splice(keyFifo.indexOf(key), 1);

        return new FixedSizeCache(_state);
    },
    /**
     * Returns the current capacity of the cache
     * @param {Object} _state PRIVATE - The current state of the cache
     * @returns {number} The capacity in an interval on the range [0, 1]
     */
    getRemainingFraction : function (_state) {
        var settings;

        settings = _state.settings;

        return JSON.stringify(_state).length / settings.maxCacheSize;
    },
    /**
     * Returns the remaining free space in the cache in bytes
     * @param {Object} _state PRIVATE - The current state of the cache
     * @returns {number}
     */
    getRemainingBytes : function (_state) {
        var settings;

        settings = _state.settings;

        return (settings.maxCacheSize - JSON.stringify(_state).length) * 2;
    },
    /**
     * Returns the cache maximum capacity in bytes
     * @param {Object} _state PRIVATE - The current state of the cache
     * @returns {number}
     */
    getCacheMaximumCapacityInBytes : function (_state) {
        var settings;

        settings = _state.settings;

        return settings.maxCacheSize * 2;
    }
}, {
    defaultSettings : {
        /**
         * Each JavaScript String char corresponds to 2 bytes, to have a 5MB cache we need 5242880 / 2 chars.
         */
        maxCacheSize : 2621440
    }
});

module.exports = FixedSizeCache;