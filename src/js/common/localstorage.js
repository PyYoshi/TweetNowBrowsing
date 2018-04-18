export default class LocalStorage {
  /**
   * localStorageから値を取得
   * @param {String} key localStorageのkey
   * @param {Number|String|Boolean|object|array} 初期値
   * @return {Number|String|Boolean|object|array|null}
   */
  static get(key, defaultValue = null) {
    const value = window.localStorage.getItem(key);
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
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * localstorageから指定keyのアイテムを削除
   * @param {String} key localStorageのkey
   */
  static delete(key) {
    window.localStorage.removeItem(key);
  }
}
