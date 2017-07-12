const LRU = require('lru-cache');

class FixedSizeCache2 {
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

	set(key, value) {
		this._lru.set(key, JSON.stringify(value));

		return this;
	}

	get(key) {
		const value = this._lru.get(key);

		if (value !== undefined) {
			return JSON.parse(value);
		}

		return undefined;
	}

	has(key) {
		return this._lru.has(key);
	}

	remove(key) {
		this._lru.del(key);

		return this;
	}

	getCacheMaximumCapacityInBytes() {
		return this._maxCacheSizeBytes;
	}

	getRemainingBytes() {
		return this._maxCacheSizeBytes - this._lru.length;
	}
}

module.exports = FixedSizeCache2;