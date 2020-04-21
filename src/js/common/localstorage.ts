export default class LocalStorage {
  /**
   * localStorageから値を取得
   * @param {String} key localStorageのkey
   * @param {Number|String|Boolean|object|array} 初期値
   * @return {Number|String|Boolean|object|array|null}
   */
  static get<T>(key: string, defaultValue: T = null): T {
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
  static set<T>(key: string, value: T): void {
    window.localStorage[key] = JSON.stringify(value);
  }
}
