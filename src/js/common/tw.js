import request from 'superagent';
import twttr from 'twitter-text';
import template from 'lodash.template';

import { TWEET_MAX_LENGTH, TWEET_WEB_INTENT_URL, TWEET_API_URL, TWITTER_WEB_URL } from './const';
import { InvalidTweetError, TweetFailedError } from './errors';

/**
 * Twitterに関わる処理を行うクラス
 */
export class TwitterWeb {
  /**
   * Tweet Web Intentページ用URLを生成
   * https://dev.twitter.com/web/tweet-button/web-intent
   * @param {string} tweet ついーと
   * @return {string} URL
   */
  static buildTweetIntentURL(tweet) {
    let encodedTweet = encodeURIComponent(tweet);
    return TWEET_WEB_INTENT_URL + '?text=' + encodedTweet;
  }

  /**
   * ステータスURLを生成
   * @param {String} スクリーンネーム e.g) taylorswift13
   * @param {String} Tweet ID
   * @return {String} URL
   */
  static buildTweetStatusURL(screenName, tweetID) {
    let statusURLCompiled = template('https://twitter.com/<%= screenName %>/status/<%= tweetID %>');
    return statusURLCompiled({ screenName: screenName, tweetID: tweetID });
  }

  /**
   * Twitter Web IntentのHTMLエレメントを取得する
   * @return {Promise<Element, Error>}
   */
  static getTweetWebIntentHTML() {
    return new Promise((resolve, reject) => {
      request.get(TWEET_WEB_INTENT_URL).end((err, res) => {
        if (err) {
          reject(err);
        } else {
          let body = document.createElement('div');
          body.innerHTML = res.text;
          resolve(body);
        }
      });
    });
  }

  /**
   * Twitter Web ページのHTMLエレメントを取得する
   * @return {Promise<Element, Error>}
   */
  static getTwitterWebHTML() {
    return new Promise((resolve, reject) => {
      request.get(TWITTER_WEB_URL).end((err, res) => {
        if (err) {
          reject(err);
        } else {
          let body = document.createElement('div');
          body.innerHTML = res.text;
          resolve(body);
        }
      });
    });
  }

  /**
   * ログインチェック
   * @param {Element} twitterHtml TwitterのWebページエレメント.
   * @return {boolean}
   */
  static isLogin(twitterHtml) {
    let xpathResult = document.evaluate(
      '//*[@id="signout-button"]',
      twitterHtml,
      null,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    if (xpathResult.snapshotLength === 1) {
      return true;
    }
    return false;
  }

  /**
   * 指定Elementからアカウント情報を取得
   * @param {Element} twitterHtml TwitterのWebページエレメント.
   * @return {string|null}
   */
  static getAccountInfo(twitterHtml) {
    let accountInfo = {
      userID: null,
      screenName: null
    };
    let xpathResult = document.evaluate(
      '//input[@id="current-user-id"]',
      twitterHtml,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    let userIDElement = xpathResult.snapshotItem(0);
    if (userIDElement !== null) {
      let userID = userIDElement.value;
      let xpathResult2 = document.evaluate(
        '//div[@data-user-id="' + userID + '"][@data-screen-name]',
        twitterHtml,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      let screenNameElement = xpathResult2.snapshotItem(0);
      if (screenNameElement !== null) {
        accountInfo.userID = userID;
        accountInfo.screenName = screenNameElement.dataset.screenName;
      }
    }
    return accountInfo;
  }

  /**
   * 指定Elementからauthenticity_tokenを取得
   * @param {Element} twitterHtml TwitterのWebページエレメント.
   * @return {string|null}
   */
  static getAuthenticityToken(twitterHtml) {
    let xpathResult = document.evaluate(
      './/input[@name="authenticity_token"]',
      twitterHtml,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    let authenticityTokenElement = xpathResult.snapshotItem(0);
    if (authenticityTokenElement !== null) {
      return authenticityTokenElement.value;
    }
    return null;
  }

  /**
   * ついーとが140文字以内に収まっているかチェックを行う.
   * @param {string} tweet ついーとする文章.
   * @return {Object} チェック結果
   * @property {number} remain 残り文字数. 140字を超える場合は負の値を返す.
   * @property {boolean} isValid 1字以上140字以内に収まっている場合はtrue, それ以外はfalse.
   */
  static checkTweet(tweet) {
    let ret = {
      remain: TWEET_MAX_LENGTH,
      isValid: false
    };

    // 文字数をカウント
    let tweetLength = twttr.getTweetLength(tweet);
    if (tweetLength === 0) {
      return ret;
    }

    // 残り文字数をカウント
    let remain = TWEET_MAX_LENGTH - tweetLength;
    if (remain >= 0 && remain <= TWEET_MAX_LENGTH) {
      ret.isValid = true;
    }
    ret.remain = remain;

    return ret;
  }

  /**
   * 指定文章をついーとする.
   * @param {string} tweet ついーとする文章.
   * @param {string} authenticityToken authenticity_token.
   * @return {Promise<,>} ES6-Promiseオブジェクトを返す.
   */
  static sendTweet(tweet, authenticityToken) {
    return new Promise(function(resolve, reject) {
      let checked = TwitterWeb.checkTweet(tweet);
      let intentURL = TwitterWeb.buildTweetIntentURL(tweet);
      if (checked.isValid) {
        request
          .post(TWEET_API_URL)
          .type('form')
          .send({
            authenticity_token: authenticityToken,
            status: tweet
          })
          .end((err, res) => {
            if (err) {
              reject(new TweetFailedError(tweet, err.status, intentURL));
            } else {
              // 送信成功!
              resolve(res);
            }
          });
      } else {
        // 文字数が規則に満たないのでエラーを返す
        reject(new InvalidTweetError(tweet, checked.remain, intentURL));
      }
    });
  }
}
