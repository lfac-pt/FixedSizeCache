const LRU = require('lru-cache');

class FixedSizeCache {
	constructor(options) {
		if (options && options.settings && options.settings.maxCacheSizeBytes < Infinity) {
			this._maxCacheSizeBytes = options.settings.maxCacheSizeBytes;
		} else {
			this._maxCacheSizeBytes = 2621440;
		}

		this._lru = new LRU({
			max: this._maxCacheSizeBytes,
			length: function (json) {
				return json.length * 2; //Each char occupies two bytes.
			}
		});

		this._state = new Map();
	}

	/**
     * Stores a value in the entry with name key.
     * @param {String} key
     * @param {*} value
     * @returns {FixedSizeCache}
     */
	set(key, value) {
		this._lru.set(key, JSON.stringify(value));

		return this;
	}

    /**
     * Gets the value associated with key, if it exists, otherwise returns undefined.
     * @param {String} key
     * @returns {*}
     */
	get(key) {
		const value = this._lru.get(key);

		if (value !== undefined) {
			return JSON.parse(value);
		}

		return undefined;
	}

    /**
     * Returns true if for the key there is an associated value.
     * @param {String} key
     * @returns {boolean}
     */
	has(key) {
		return this._lru.has(key);
	}

    /**
     * Removes the value associated with the and the key itself.
     * @param {String} key
     * @returns {FixedSizeCache}
     */
	remove(key) {
		this._lru.del(key);

		return this;
	}

    /**
     * Returns the remaining free space in the cache in bytes
     * @returns {number}
     */
	getCacheMaximumCapacityInBytes() {
		return this._maxCacheSizeBytes;
	}

    /**
     * Returns the cache maximum capacity in bytes
     * @returns {number}
     */
	getRemainingBytes() {
		return this._maxCacheSizeBytes - this._lru.length;
	}
}

module.exports = FixedSizeCache;