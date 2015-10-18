'use strict';

import {
    SEND_MESSAGE_ORDER_TWEET_STATUS,
    TWEET_MAX_LENGTH,
    LOCAL_STORAGE_KEY_POST_STATUS_TEMPLATE,
    LOCAL_STORAGE_KEY_POST_STATUS_TEMPLATE_DEFAULT_VALUE
} from 'common/const';
import LocalStorage from 'common/localstorage';
import TwitterWeb from 'common/tw';
import twttr from 'twitter-text';
import _ from 'lodash';
import $ from 'jquery';

/**
 * 投稿するための文章を作成
 * @param {String} ページタイトル
 * @param {String} ページURL
 * @return {String} ついーと
 */
function createStatus(title, url) {
    let statusTemplateCompiled = _.template(LocalStorage.get(LOCAL_STORAGE_KEY_POST_STATUS_TEMPLATE, LOCAL_STORAGE_KEY_POST_STATUS_TEMPLATE_DEFAULT_VALUE));

    let status = statusTemplateCompiled({'title': title, 'url': url});
    let statusLength = twttr.getTweetLength(status);

    if (statusLength > TWEET_MAX_LENGTH) {
        let c = TWEET_MAX_LENGTH - statusLength - 1;
        title = title.slice(0, c) + '…';
        status = statusTemplateCompiled({'title': title, 'url': url});
    }
    return status;
}

$(document).ready(() => {
    // オプションを開く
    $('#open-option').click(() => {
        let url = chrome.extension.getURL('/options.html');
        chrome.tabs.create({
            'url': url,
            'active': true
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
        $('#tw-status-counter').val(checkedTweet.remain).change();
        if (checkedTweet.isValid) {
            $('#tw-status-btn').prop('disabled', false);
        } else {
            $('#tw-status-btn').prop('disabled', true);
        }
    });

    // 現在アクティブなタブのURLとページタイトルをツイートのステータスとしてエレメントに代入する.
    chrome.tabs.query({active: true}, (tabs) => {
        if (tabs instanceof Array && tabs.length > 0) {
            let url = tabs[0].url;
            let title = tabs[0].title;
            if (title === null || !(typeof title === 'string' && title.length > 0)) {
                title = url;
            }
            let status = createStatus(title, url);

            // textareaへ入れる
            let twStatusTextarea = $('#tw-status');
            twStatusTextarea.focus();
            twStatusTextarea.removeClass('mui--is-empty');
            twStatusTextarea.addClass('mui--is-dirty');
            twStatusTextarea.addClass('mui--is-not-empty');
            twStatusTextarea.val(status).change();
        }
    });

    // 送信ボタンがクリックされたらツイートのステータスをbackgroundスクリプトに送信する.
    $('#tw-status-btn').click(() => {
        let twStatusTextarea = $('#tw-status');
        let status = twStatusTextarea.val();
        chrome.runtime.sendMessage({'order': SEND_MESSAGE_ORDER_TWEET_STATUS, 'status': status});
        window.close();
    });
});
