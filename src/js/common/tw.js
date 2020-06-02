import twttr from 'twitter-text';
import template from 'lodash.template';

import {
  TWEET_WEB_INTENT_URL,
  TWEET_API_URL,
  TWITTER_WEB_URL,
  TWITTER_WEB_CSRF_TOKEN_HEADER_NAME,
  TWITTER_WEB_AUTHORIZATION_HEADER_NAME,
  TWITTER_WEB_AUTHORIZATION_HEADER_VALUE
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
   * Twitter Web ページのHTMLエレメントを取得する
   * @return {Promise<Element, Error>}
   */
  static getTwitterWebHTML() {
    return new Promise((resolve, reject) => {
      fetch(TWITTER_WEB_URL, {
        credentials: 'include',
        redirect: 'follow'
      })
        .then(async (response) => {
          if (response.ok) {
            const body = document.createElement('div');
            const result = await response.text();
            body.innerHTML = result;
            resolve(body);
          } else {
            reject(new Error('Network response was not ok.'));
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * ログインチェック
   * @param {Element} twitterHtml TwitterのWebページエレメント.
   * @return {boolean}
   */
  static isLogin(twitterHtml) {
    const xpathResult = document.evaluate(
      '//*[@id="session"]',
      twitterHtml,
      null,
      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    return xpathResult.snapshotLength === 1;
  }

  /**
   * 指定Elementからアカウント情報を取得
   * @param {Element} twitterHtml TwitterのWebページエレメント.
   * @return {string|null}
   */
  static getAccountInfo(twitterHtml) {
    const accountInfo = {
      userID: null,
      screenName: null
    };
    const xpathResult = document.evaluate(
      '//input[@id="current-user-id"]',
      twitterHtml,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );

    if (xpathResult.snapshotLength > 0) {
      for (let idx1 = 0; idx1 < xpathResult.snapshotLength; idx1++) {
        const userIDElement = xpathResult.snapshotItem(idx1);
        if (userIDElement !== null) {
          const userID = userIDElement.value;
          if (userID !== null) {
            accountInfo.userID = userID;
          }

          const xpathResult2 = document.evaluate(
            `//a[@data-nav="view_profile"]`,
            twitterHtml,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
          );
          if (xpathResult2.snapshotLength > 0) {
            for (let idx2 = 0; idx2 < xpathResult.snapshotLength; idx2++) {
              const screenNameElement = xpathResult2.snapshotItem(idx2);
              if (screenNameElement != null && 'href' in screenNameElement && screenNameElement.href != null) {
                const href = screenNameElement.getAttribute('href');
                if (href != null) {
                  for (const username of href.split('/')) {
                    if (username != null && username.length > 0) {
                      accountInfo.screenName = username;
                      break;
                    }
                  }
                }
              }
            }
          }
        }
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
    const xpathResult = document.evaluate(
      './/input[@name="authenticity_token"]',
      twitterHtml,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );

    if (xpathResult.snapshotLength > 0) {
      for (let idx = 0; idx < xpathResult.snapshotLength; idx++) {
        const authenticityTokenElement = xpathResult.snapshotItem(idx);
        if (
          authenticityTokenElement !== null &&
          'value' in authenticityTokenElement &&
          authenticityTokenElement.value.length > 0
        ) {
          return authenticityTokenElement.value;
        }
      }
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
  static sendTweet(tweet, csrfToken) {
    return new Promise((resolve, reject) => {
      const checked = TwitterWeb.checkTweet(tweet);
      const intentURL = TwitterWeb.buildTweetIntentURL(tweet);
      if (checked.isValid) {
        const payload = {
          status: tweet
        };
        const body = Object.keys(payload)
          .map((key) => `${key}=${encodeURIComponent(payload[key])}`)
          .join('&');

        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        };
        headers[TWITTER_WEB_CSRF_TOKEN_HEADER_NAME] = csrfToken;
        headers[TWITTER_WEB_AUTHORIZATION_HEADER_NAME] = TWITTER_WEB_AUTHORIZATION_HEADER_VALUE;

        fetch(TWEET_API_URL, {
          method: 'POST',
          body,
          headers,
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
