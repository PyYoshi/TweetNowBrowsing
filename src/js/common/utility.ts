function s4(): string {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

/**
 * GUIDを生成する
 * http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * @return {String}
 */
export function guid(): string {
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

export function isNumber(value: any): boolean {
  return Number.isFinite(value);
}
