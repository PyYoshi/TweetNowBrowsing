import template from 'lodash.template';

/**
 * 拡張可能なエラークラス
 */
class ExtendableError extends Error {
  tweet: string;
  remain: number;
  url: string;

  /**
   * @param {String} message error message
   */
  constructor(message: string, url: string | null = null) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, ExtendableError);

    if (url !== null) {
      this.url = url;
    }
  }

  /**
   * Webページを開く
   * @param {function(tab: chrome.tabs.Tab)} callback https://developer.chrome.com/extensions/tabs#method-create
   */
  openWebPage(callback: (tab: chrome.tabs.Tab) => void | null = null): void {
    const createOption = {
      url: this.url,
      active: true,
    };
    if (callback === null) {
      chrome.tabs.create(createOption);
    } else {
      chrome.tabs.create(createOption, (tab) => {
        callback(tab);
      });
    }
  }
}

/**
 * 不正なついーとの時に返すエラー
 */
export class InvalidTweetError extends ExtendableError {
  /**
   * @param {String} tweet ついーと
   * @param {Number} remain ついーとできる残り文字数
   * @param {String} intentURL Tweet Intent Web URL
   */
  constructor(tweet: string, remain: number, intentURL: string) {
    const compiled = template(chrome.i18n.getMessage('invalidTweetErrorMessage'));
    const compiledMessage = compiled({ tweet, remain });
    super(compiledMessage, intentURL);

    this.tweet = tweet;
    this.remain = remain;
    this.url = intentURL;
  }
}

/**
 * ついーと送信が失敗した時に返すエラー
 */
export class TweetFailedError extends ExtendableError {
  /**
   * @param {String} tweet ついーと
   * @param {Number} status ついーとできる残り文字数
   * @param {String} intentURL Tweet Intent Web URL
   */
  constructor(tweet: string, remain: number, intentURL: string) {
    const compiled = template(chrome.i18n.getMessage('tweetFailedErrorMessage'));
    const compiledMessage = compiled({ tweet });
    super(compiledMessage, intentURL);

    this.tweet = tweet;
    this.remain = remain;
    this.url = intentURL;
  }
}
