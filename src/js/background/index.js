// アイコン画像一覧
import '../../img/icon-300.png';
import iconApp256 from '../../img/icon-256.png';
import '../../img/icon-128.png';
import '../../img/icon-38.png';
import '../../img/icon-19.png';
import '../../img/icon-16.png';

import iconOpen from '../../img/ic_open_in_new_black_48dp_2x.png';
import iconDelete from '../../img/ic_delete_black_48dp_2x.png';

import {
  TWEET_API_URL,
  TWITTER_LOGIN_URL,
  SEND_MESSAGE_ORDER_COLLECT_TIWP,
  SEND_MESSAGE_ORDER_TWEET_STATUS,
  ALARM_ORDER_COLLECT_TIWP,
  LOCAL_STORAGE_KEY_PRIVATE_CONFIG_AUTHENTICITY_TOKEN,
  LOCAL_STORAGE_KEY_PRIVATE_CONFIG_USER_ID,
  LOCAL_STORAGE_KEY_PRIVATE_CONFIG_SCREEN_NAME,
  CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC,
  CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC_DEFAULT_VALUE,
  CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC_DISABLE_VALUE
} from '../common/const';
import { LocalStorage } from '../common/localstorage';
import { TwitterWeb } from '../common/tw';
import { guid } from '../common/utility';

/**
 * Badgeを描画する.
 * @param {Boolean} isLogin ログイン済みかどうか.
 */
function renderBadge(isLogin) {
  chrome.management.getSelf((result) => {
    let badge = '';
    let color = [65, 131, 196, 255];
    let title = result.name;
    if (!isLogin) {
      badge = 'X';
      color = [166, 41, 41, 255];
    }
    chrome.browserAction.setBadgeText({ text: badge });
    chrome.browserAction.setBadgeBackgroundColor({ color: color });
    chrome.browserAction.setTitle({ title: title });
  });
}

function initPrivateConfig() {
  // localStorageのauthenticity_tokenをnullへ
  LocalStorage.set(LOCAL_STORAGE_KEY_PRIVATE_CONFIG_AUTHENTICITY_TOKEN, null);

  // localStorageのアカウント情報を初期化
  LocalStorage.set(LOCAL_STORAGE_KEY_PRIVATE_CONFIG_USER_ID, null);
  LocalStorage.set(LOCAL_STORAGE_KEY_PRIVATE_CONFIG_SCREEN_NAME, null);
}

/**
 * Tweet Intent WebのHTMLを取得しlocalStorageへauthenticity_token,ui_metricsを保存する
 */
function collectTweetIntentWebPage() {
  TwitterWeb.getTwitterWebHTML()
    .then((element) => {
      let isLogin = TwitterWeb.isLogin(element);
      renderBadge(isLogin);
      if (isLogin) {
        // HTMLからauthenticity_tokenを取得・保存
        let authenticityToken = TwitterWeb.getAuthenticityToken(element);
        LocalStorage.set(LOCAL_STORAGE_KEY_PRIVATE_CONFIG_AUTHENTICITY_TOKEN, authenticityToken);

        // HTMLからアカウント情報を取得・保存
        let accountInfo = TwitterWeb.getAccountInfo(element);
        LocalStorage.set(LOCAL_STORAGE_KEY_PRIVATE_CONFIG_USER_ID, accountInfo.userID);
        LocalStorage.set(LOCAL_STORAGE_KEY_PRIVATE_CONFIG_SCREEN_NAME, accountInfo.screenName);
      } else {
        initPrivateConfig();
      }
    })
    .catch((err) => {
      initPrivateConfig();
    });
}
collectTweetIntentWebPage();

/**
 * ついーとする
 * @param {String} tweet ついーとメッセージ
 */
function sendTweet(tweet, notificationDisplayTimeMSec = 3000) {
  let notificationID = new Date().getTime() + '-' + guid();
  let authenticityToken = LocalStorage.get(LOCAL_STORAGE_KEY_PRIVATE_CONFIG_AUTHENTICITY_TOKEN);
  if (typeof authenticityToken !== 'string') {
    // 通知: ログインしていない / ログインURLを開く
    chrome.notifications.create(
      notificationID,
      {
        type: 'basic',
        iconUrl: iconApp256,
        title: chrome.i18n.getMessage('error'),
        message: chrome.i18n.getMessage('requiredSignIn'),
        priority: 2, // -2 to 2
        buttons: [
          {
            title: chrome.i18n.getMessage('openTweetWebIntentButton'),
            iconUrl: iconOpen
          },
          {
            title: chrome.i18n.getMessage('cancelButton'),
            iconUrl: iconDelete
          }
        ]
      },
      (_notificationId) => {}
    );
    chrome.notifications.onButtonClicked.addListener((_notificationId, buttonIndex) => {
      if (_notificationId === notificationID) {
        if (buttonIndex === 0) {
          chrome.tabs.create({
            url: TwitterWeb.buildTweetIntentURL(tweet),
            active: true
          });
        } else if (buttonIndex === 1) {
          chrome.notifications.clear(notificationID);
        }
      }
    });
  } else {
    if (notificationDisplayTimeMSec > CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC_DISABLE_VALUE) {
      chrome.notifications.create(
        notificationID,
        {
          type: 'basic',
          iconUrl: iconApp256,
          title: chrome.i18n.getMessage('nowPosting'),
          message: tweet
        },
        (_notificationId) => {}
      );
      TwitterWeb.sendTweet(tweet, authenticityToken)
        .then((res) => {
          // 通知: 投稿成功
          chrome.notifications.update(
            notificationID,
            {
              type: 'basic',
              iconUrl: iconApp256,
              title: chrome.i18n.getMessage('hasBeenPosted'),
              message: tweet
            },
            (wasUpdated) => {}
          );
          setTimeout(() => {
            chrome.notifications.clear(notificationID);
          }, notificationDisplayTimeMSec);
          chrome.notifications.onClicked.addListener((_notificationID) => {
            if (_notificationID === notificationID && 'tweet_id' in res.body) {
              let url = 'https://twitter.com/intent/favorite?tweet_id=' + res.body.tweet_id;
              let screenName = LocalStorage.get(LOCAL_STORAGE_KEY_PRIVATE_CONFIG_SCREEN_NAME);
              if (typeof screenName === 'string' && screenName.length > 0) {
                url = TwitterWeb.buildTweetStatusURL(screenName, res.body.tweet_id);
              }
              chrome.tabs.create({
                url: url,
                active: true
              });
            }
          });
        })
        .catch((err) => {
          // 通知: 投稿失敗
          chrome.notifications.update(
            notificationID,
            {
              type: 'basic',
              iconUrl: iconApp256,
              title: chrome.i18n.getMessage('error'),
              message: err.message,
              priority: 2 // -2 to 2
            },
            (wasUpdated) => {}
          );

          // 通知をクリックしてTweet Web Intentページを開く
          chrome.notifications.onClicked.addListener((_notificationID) => {
            if (_notificationID === notificationID) {
              err.openWebPage();
              chrome.notifications.clear(_notificationID);
            }
          });
        });
    }
  }
}

// 拡張のインストール・バージョンアップ時に呼ばれる
// https://developer.chrome.com/extensions/runtime#event-onInstalled
// chrome.runtime.onInstalled.addListener((details) => {
//     console.log(details);
// });

// ブラウザ起動時に呼ばれる
// https://developer.chrome.com/extensions/runtime#event-onStartup
chrome.runtime.onStartup.addListener(() => {
  collectTweetIntentWebPage();
});

// collectTweetIntentWebPageを定期的に取得
chrome.alarms.create(ALARM_ORDER_COLLECT_TIWP, { delayInMinutes: 1, periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_ORDER_COLLECT_TIWP) {
    collectTweetIntentWebPage();
  }
});

// メッセージオブジェクトを処理
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if ('order' in request) {
    switch (request.order) {
      case SEND_MESSAGE_ORDER_COLLECT_TIWP:
        collectTweetIntentWebPage();
        break;
      case SEND_MESSAGE_ORDER_TWEET_STATUS:
        if ('status' in request) {
          chrome.storage.sync.get([CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC], (object) => {
            let sec = CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC_DEFAULT_VALUE;
            if (CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC in object) {
              sec = object[CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC];
            }
            sendTweet(request.status, sec * 1000);
          });
        }
        break;
      default:
        break;
    }
  }
});

// HTTPリクエストを改変する
// NOTICE: declarativeWebRequestがstableチャンネルでも使えるようになったらEventPageへ切り替える(persistence=false
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    details.requestHeaders.push({
      name: 'Referer',
      value: 'https://twitter.com/intent/tweet'
    });
    for (let i = 0; i < details.requestHeaders.length; ++i) {
      if (details.requestHeaders[i].name === 'Origin') {
        // OriginヘッダーがついてるとTwitterに投稿できなかったので外すように
        details.requestHeaders.splice(i, 1);
        break;
      }
    }
    return { requestHeaders: details.requestHeaders };
  },
  { urls: [TWEET_API_URL] },
  ['blocking', 'requestHeaders']
);
