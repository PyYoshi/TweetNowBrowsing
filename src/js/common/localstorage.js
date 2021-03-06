export default class LocalStorage {
  /**
   * localStorageから値を取得
   * @param {String} key localStorageのkey
   * @param {Number|String|Boolean|object|array} 初期値
   * @return {Number|String|Boolean|object|array|null}
   */
  static get(key, defaultValue = null) {
    const value = window.localStorage[key];
    if (typeof value === 'undefined') {
      return defaultValue;
    }
    return JSON.parse(value);
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
