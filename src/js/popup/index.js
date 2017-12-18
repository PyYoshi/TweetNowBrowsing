import '../../css/roboto.css';
import '../../css/material-icons.css';
import '../../css/base.css';
import '../../css/popup.css';

import {
  SEND_MESSAGE_ORDER_TWEET_STATUS,
  TWITTER_LOGIN_URL,
  TWEET_MAX_LENGTH,
  CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE,
  CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE_DEFAULT_VALUE,
  LOCAL_STORAGE_KEY_PRIVATE_CONFIG_AUTHENTICITY_TOKEN
} from '../common/const';
import { LocalStorage } from '../common/localstorage';
import { TwitterWeb } from '../common/tw';
import twttr from 'twitter-text';
import template from 'lodash.template';
import $ from 'jquery';

$(document).ready(() => {
  let authenticityToken = LocalStorage.get(LOCAL_STORAGE_KEY_PRIVATE_CONFIG_AUTHENTICITY_TOKEN);
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
      let url = chrome.extension.getURL('/options.html');
      chrome.tabs.create({
        url: url,
        active: true
      });
    });

    // カウンターの色を残り文字数によって変える
    $('#tw-status-counter').bind('keyup change paste', () => {
      let remain = Number($('#tw-status-counter').val());
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
    $('#tw-status').bind('keyup change paste', () => {
      let twStatus = $('#tw-status').val();
      let checkedTweet = TwitterWeb.checkTweet(twStatus);
      $('#tw-status-counter')
        .val(checkedTweet.remain)
        .change();
      if (checkedTweet.isValid) {
        $('#tw-status-btn').prop('disabled', false);
      } else {
        $('#tw-status-btn').prop('disabled', true);
      }
    });

    // 現在アクティブなタブのURLとページタイトルをツイートのステータスとしてエレメントに代入する.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs instanceof Array && tabs.length > 0) {
        let url = tabs[0].url;
        let title = tabs[0].title;
        if (title === null || !(typeof title === 'string' && title.length > 0)) {
          title = url;
        }

        chrome.storage.sync.get(CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE, (object) => {
          let statusTemplateCompiled = template(CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE_DEFAULT_VALUE);
          if (CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE in object) {
            statusTemplateCompiled = template(object[CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE]);
          }

          let status = statusTemplateCompiled({ title: title, url: url });
          let statusLength = twttr.getTweetLength(status);

          if (statusLength > TWEET_MAX_LENGTH) {
            let c = TWEET_MAX_LENGTH - statusLength - 1;
            title = title.slice(0, c) + '…';
            status = statusTemplateCompiled({ title: title, url: url });
          }

          // textareaへ入れる
          let twStatusTextarea = $('#tw-status');
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
      let twStatusTextarea = $('#tw-status');
      let status = twStatusTextarea.val();
      chrome.runtime.sendMessage({ order: SEND_MESSAGE_ORDER_TWEET_STATUS, status: status });
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
