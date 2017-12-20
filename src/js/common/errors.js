import template from 'lodash.template';

/**
 * 拡張可能なエラークラス
 */
class ExtendableError extends Error {
  /**
   * @param {String} message error message
   */
  constructor(message, url = null) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor.name);

    if (url !== null) {
      this.url = url;
    }
  }

  /**
   * Webページを開く
   * @param {function(tab: chrome.tabs.Tab)} callback https://developer.chrome.com/extensions/tabs#method-create
   */
  openWebPage(callback = null) {
    const createOption = {
      url: this.url,
      active: true
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
  constructor(tweet, remain, intentURL) {
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
  constructor(tweet, status, intentURL) {
    const compiled = template(chrome.i18n.getMessage('tweetFailedErrorMessage'));
    const compiledMessage = compiled({ tweet });
    super(compiledMessage, intentURL);

    this.tweet = tweet;
    this.status = status;
    this.url = intentURL;
  }
}
