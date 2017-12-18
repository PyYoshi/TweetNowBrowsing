export class LocalStorage {
    /**
     * localStorageから値を取得
     * @param {String} key localStorageのkey
     * @param {Number|String|Boolean|object|array} 初期値
     * @return {Number|String|Boolean|object|array|null}
     */
    static get(key, defaultValue = null) {
        let value = window.localStorage[key];
        if (typeof value === 'undefined') {
            return defaultValue;
        } else {
            return JSON.parse(value);
        }
    }

    /**
     * localStorageへ値をセット
     * @param {String} key localStorageのkey
     * @param {Number|String|Boolean|object|array}
     */
    static set(key, value) {
        window.localStorage[key] = JSON.stringify(value);
    }
}
