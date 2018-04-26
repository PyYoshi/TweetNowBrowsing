import throttle from 'lodash.throttle';
import $ from 'jquery';

import {
  SEND_MESSAGE_ORDER_TWEET_STATUS,
  TWITTER_LOGIN_URL,
  CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE,
  CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE_DEFAULT_VALUE,
  LOCAL_STORAGE_KEY_PRIVATE_CONFIG_AUTHENTICITY_TOKEN
} from '../common/const';
import { LocalStorage } from '../common/localstorage';
import { TwitterWeb } from '../common/tw';

import '../../css/roboto.css';
import '../../css/material-icons.css';
import '../../css/base.css';
import '../../css/popup.css';

function validateStatus() {
  const twStatus = $('#tw-status').val();
  const checkedTweet = TwitterWeb.checkTweet(twStatus);
  $('#tw-status-counter')
    .val(checkedTweet.remain)
    .change();
  if (checkedTweet.isValid) {
    $('#tw-status-btn').prop('disabled', false);
  } else {
    $('#tw-status-btn').prop('disabled', true);
  }
}

$(document).ready(() => {
  const authenticityToken = LocalStorage.get(LOCAL_STORAGE_KEY_PRIVATE_CONFIG_AUTHENTICITY_TOKEN);
  if (authenticityToken === null || !(typeof authenticityToken === 'string' && authenticityToken.length > 0)) {
    // ログインしていない
    chrome.tabs.create({
      url: TWITTER_LOGIN_URL,
      active: true
    });
    window.close();
  } else {
    // オプションを開く
    $('#open-option').click(() => {
      const url = chrome.extension.getURL('/options.html');
      chrome.tabs.create({
        url,
        active: true
      });
    });

    // カウンターの色を残り文字数によって変える
    $('#tw-status-counter').bind('keyup change paste', () => {
      const remain = Number($('#tw-status-counter').val());
      if (remain < 0) {
        $('#tw-status-counter').removeClass('warn');
        $('#tw-status-counter').addClass('superwarn');
      } else if (remain < 20 && remain >= 0) {
        $('#tw-status-counter').removeClass('superwarn');
        $('#tw-status-counter').addClass('warn');
      } else {
        $('#tw-status-counter').removeClass('warn');
        $('#tw-status-counter').removeClass('superwarn');
      }
    });

    // エレメントにあるステータスの更新を検出して残り文字数のカウント・送信ボタンの有効/無効を管理する.
    $('#tw-status').bind('keyup change paste', throttle(validateStatus, 50));

    // 現在アクティブなタブのURLとページタイトルをツイートのステータスとしてエレメントに代入する.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs instanceof Array && tabs.length > 0) {
        const { url } = tabs[0];
        let { title } = tabs[0];
        if (title === null || !(typeof title === 'string' && title.length > 0)) {
          title = url;
        }

        chrome.storage.sync.get(CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE, (object) => {
          let statusTemplate;
          if (CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE in object) {
            statusTemplate = object[CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE];
          } else {
            statusTemplate = CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE_DEFAULT_VALUE;
          }

          // ツイートを生成
          const status = TwitterWeb.normalizeTweet(title, url, statusTemplate);

          // textareaへ入れる
          const twStatusTextarea = $('#tw-status');
          twStatusTextarea.focus();
          twStatusTextarea.removeClass('mui--is-empty');
          twStatusTextarea.addClass('mui--is-dirty');
          twStatusTextarea.addClass('mui--is-not-empty');
          twStatusTextarea.val(status).change();
        });
      }
    });

    // 送信ボタンがクリックされたらツイートのステータスをbackgroundスクリプトに送信する.
    $('#tw-status-btn').click(() => {
      const twStatusTextarea = $('#tw-status');
      const status = twStatusTextarea.val();
      chrome.runtime.sendMessage({ order: SEND_MESSAGE_ORDER_TWEET_STATUS, status });
      window.close();
    });

    // ctrl, windowsキーまたはoptionキーとEnterキーで投稿できるように
    $('body').keydown((event) => {
      if ((event.metaKey || event.ctrlKey) && (event.keyCode === 13 || event.keyCode === 10)) {
        $('#tw-status-btn').trigger('click');
      }
    });
  }
});
