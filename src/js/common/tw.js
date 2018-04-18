import twttr from 'twitter-text';
import template from 'lodash.template';

import {
  TWEET_WEB_INTENT_URL,
  TWEET_API_URL,
  TWITTER_MOBILE_WEB_COMPOSE_URL,
  TWITTER_MOBILE_WEB_ACCOUNT_URL
} from './const';
import { InvalidTweetError, TweetFailedError } from './errors';

/**
 * Twitterに関わる処理を行うクラス
 */
export default class TwitterWeb {
  /**
   * Tweet Web Intentページ用URLを生成
   * https://dev.twitter.com/web/tweet-button/web-intent
   * @param {string} tweet ついーと
   * @return {string} URL
   */
  static buildTweetIntentURL(tweet) {
    const encodedTweet = encodeURIComponent(tweet);
    return `${TWEET_WEB_INTENT_URL}?text=${encodedTweet}`;
  }

  /**
   * ステータスURLを生成
   * @param {String} スクリーンネーム e.g) taylorswift13
   * @param {String} Tweet ID
   * @return {String} URL
   */
  static buildTweetStatusURL(screenName, tweetID) {
    const statusURLCompiled = template('https://twitter.com/<%= screenName %>/status/<%= tweetID %>');
    return statusURLCompiled({ screenName, tweetID });
  }

  /**
   * ログインチェック
   * @return {boolean}
   */
  static async isLogin() {
    const resp = await fetch('https://mobile.twitter.com/compose/tweet', {
      redirect: 'follow',
      credentials: 'include'
    });
    return !resp.redirected;
  }

  static async getUserInfo() {
    const userInfo = {
      screenName: null,
      authenticityToken: null
    };

    {
      const resp = await fetch(TWITTER_MOBILE_WEB_COMPOSE_URL, { credentials: 'include' });
      if (resp.ok) {
        const body = document.createElement('div');
        const result = await resp.text();
        body.innerHTML = result;

        const authenticityTokenXPathResult = document.evaluate(
          './/input[@name="authenticity_token"]',
          body,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );

        const authenticityTokenElement = authenticityTokenXPathResult.snapshotItem(0);
        if (authenticityTokenElement !== null) {
          userInfo.authenticityToken = authenticityTokenElement.value;
        }
      }
    }

    {
      const resp = await fetch(TWITTER_MOBILE_WEB_ACCOUNT_URL, { credentials: 'include' });
      if (resp.ok) {
        const body = document.createElement('div');
        const result = await resp.text();
        body.innerHTML = result;

        const screenNameXPathResult = document.evaluate(
          '//*[@class="username"]/span[@class="screen-name"]',
          body,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );

        const screenNameElement = screenNameXPathResult.snapshotItem(0);
        if (screenNameElement !== null) {
          userInfo.screenName = screenNameElement.innerText;
        }
      }
    }

    return userInfo;
  }

  /**
   * ついーとが140文字以内に収まっているかチェックを行う.
   * @param {string} tweet ついーとする文章.
   * @return {Object} チェック結果
   * @property {number} remain 残り文字数. 140字を超える場合は負の値を返す.
   * @property {boolean} isValid 1字以上140字以内に収まっている場合はtrue, それ以外はfalse.
   */
  static checkTweet(tweet) {
    const ret = {
      remain: twttr.configs.defaults.maxWeightedTweetLength,
      isValid: false
    };

    // ついーと文字をパース
    const parsedResult = twttr.parseTweet(tweet);

    // バリデーション
    const tweetLength = parsedResult.weightedLength;
    if (tweetLength === 0) {
      return ret;
    }
    ret.remain = twttr.configs.defaults.maxWeightedTweetLength - parsedResult.weightedLength;
    ret.isValid = parsedResult.valid;

    return ret;
  }

  /**
   * ついーと文字数がオーバーしたら削って収まるようにする
   * TODO: ぴったし収まるようにしたい
   * @param {string} title
   * @param {string} url
   * @return {string} 加工済みついーと
   */
  static normalizeTweet(title, url, templateStr) {
    const templateFunc = template(templateStr);
    let status = templateFunc({ title, url });
    const parsedResult = twttr.parseTweet(status);
    if (!parsedResult.valid) {
      const statusWithoutTitle = templateFunc({ title: '', url });
      const parsedResultWithoutTitle = twttr.parseTweet(statusWithoutTitle);

      let titleArr = Array.from(title);
      titleArr = titleArr.slice(0, parsedResult.validRangeEnd - parsedResultWithoutTitle.displayRangeEnd - 2);
      titleArr.push('…');
      status = templateFunc({ title: titleArr.join(''), url });
    }
    return status;
  }

  /**
   * 指定文章をついーとする.
   * @param {string} tweet ついーとする文章.
   * @param {string} authenticityToken authenticity_token.
   * @return {Promise<,>} ES6-Promiseオブジェクトを返す.
   */
  static sendTweet(tweet, authenticityToken) {
    return new Promise((resolve, reject) => {
      const checked = TwitterWeb.checkTweet(tweet);
      const intentURL = TwitterWeb.buildTweetIntentURL(tweet);
      if (checked.isValid) {
        const payload = {
          authenticity_token: authenticityToken,
          status: tweet
        };
        const body = Object.keys(payload)
          .map((key) => `${key}=${encodeURIComponent(payload[key])}`)
          .join('&');
        fetch(TWEET_API_URL, {
          method: 'POST',
          body,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
          },
          credentials: 'include'
        })
          .then(async (response) => {
            if (response.ok) {
              const text = await response.text();
              resolve(text);
            } else {
              reject(new TweetFailedError(tweet, null, intentURL));
            }
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        // 文字数が規則に満たないのでエラーを返す
        reject(new InvalidTweetError(tweet, checked.remain, intentURL));
      }
    });
  }
}
