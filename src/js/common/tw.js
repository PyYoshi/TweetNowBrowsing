'use strict';

import request from 'superagent';
import twttr from 'twitter-text/twitter-text.js';

import {TWEET_WEB_INTENT_URL, TWEET_API_URL} from 'common/const';
import {InvalidTweetError, TweetFailedError} from 'common/errors';

/**
 * Twitterに関わる処理を行うクラス
 */
class TwitterWeb {

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
     * Twitter Web IntentのHTMLエレメントを取得する
     * @return {Promise<Element, Error>}
     */
    static getTweetWebIntentHTML() {
        return new Promise((resolve, reject) => {
            request.get(TWEET_WEB_INTENT_URL).end(
                (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        let body = document.createElement('div');
                        body.innerHTML = res.text;
                        resolve(body);
                    }
                }
            );
        });
    }

    /**
     * ログインチェック
     * @param {Element} twitterHtml TwitterのWebページエレメント.
     * @return {boolean}
     */
    static isLogin(twitterHtml) {
        let xpathSessionElementLength = document.evaluate('//*[@id="session"]', twitterHtml, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        if (xpathSessionElementLength === 1) {
            return true;
        }
        return false;
    }

    /**
     * 指定Elementからauthenticity_tokenを取得
     * @param {Element} twitterHtml TwitterのWebページエレメント.
     * @return {string|null}
     */
    static getAuthenticityToken(twitterHtml) {
        let xpathResult = document.evaluate('.//input[@name="authenticity_token"]', twitterHtml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        let authenticityTokenElement = xpathResult.snapshotItem(0);
        if (authenticityTokenElement !== null) {
            return authenticityTokenElement.value;
        }
        return null;
    }

    /**
     * 指定Elementからui_metricsを取得
     * @param {Element} twitterHtml TwitterのWebページエレメント.
     * @return {string|null}
     */
    static getUiMetrics(twitterHtml) {
        let xpathResult = document.evaluate('.//input[@name="ui_metrics"]', twitterHtml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        let uiMetricsElement = xpathResult.snapshotItem(0);
        if (uiMetricsElement !== null) {
            return uiMetricsElement.value;
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
            'remain': 140,
            'isValid': false,
        };

        // 文字数をカウント
        let tweetLength = twttr.txt.getTweetLength(tweet);
        if (tweetLength === 0) {
            return ret;
        }

        // 残り文字数をカウント
        let remain = 140 - tweetLength;
        if (remain >= 0 && remain <= 140) {
            ret.isValid = true;
        }
        ret.remain = remain;

        return ret;
    }

    /**
     * 指定文章をついーとする.
     * @param {string} tweet ついーとする文章.
     * @param {string} authenticityToken authenticity_token.
     * @param {string} uiMetrics ついーとする文章.
     * @return {Promise<,>} ES6-Promiseオブジェクトを返す.
     */
    static sendTweet(tweet, authenticityToken, uiMetrics) {
        return new Promise(function (resolve, reject) {
            let checked = TwitterWeb.checkTweet(tweet);
            let intentURL = TwitterWeb.buildTweetIntentURL(tweet);
            if (checked.isValid) {
                request.post(TWEET_API_URL)
                    .send({
                        'authenticity_token': authenticityToken,
                        'ui_metrics': uiMetrics,
                        'status': tweet
                    })
                    .end(
                        (err, res) => {
                            if (err) {
                                reject(new TweetFailedError(tweet, err.status, intentURL));
                            } else {
                                // 送信成功!
                                resolve(res);
                            }
                        }
                    );
            } else {
                // 文字数が規則に満たないのでエラーを返す
                reject(new InvalidTweetError(tweet, checked.remain, intentURL));
            }
        });
    }
}

export default TwitterWeb;
