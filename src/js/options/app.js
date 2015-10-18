'use strict';

import {
    CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE,
    CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE_DEFAULT_VALUE,
    OPTIONS_EXAMPLE_PAGE_TITLE,
    OPTIONS_EXAMPLE_PAGE_URL
} from 'common/const';
import _ from 'lodash';
import $ from 'jquery';

function previewTemplate() {
    let templateTxt = $('#template-txt').val();
    let compiled = _.template(templateTxt);
    let previewTxt = compiled({'title': OPTIONS_EXAMPLE_PAGE_TITLE, 'url': OPTIONS_EXAMPLE_PAGE_URL});

    let previewTxtElement = $('#preview-txt');
    previewTxtElement.removeClass('mui--is-empty');
    previewTxtElement.addClass('mui--is-dirty');
    previewTxtElement.addClass('mui--is-not-empty');
    previewTxtElement.val(previewTxt).change();
}

function loadTemplate() {
    chrome.storage.sync.get(CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE, (object) => {
        let templateTxtElement = $('#template-txt');
        templateTxtElement.focus();
        templateTxtElement.removeClass('mui--is-empty');
        templateTxtElement.addClass('mui--is-dirty');
        templateTxtElement.addClass('mui--is-not-empty');
        if (CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE in object) {
            templateTxtElement.val(object[CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE]).change();
        } else {
            templateTxtElement.val(CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE_DEFAULT_VALUE).change();
        }
        previewTemplate();
    });
}

/**
 * テンプレート文字列が正しいものかチェック
 * @param {String}
 * @return {Boolean}
 */
function validateTemplate(templateTxt) {
    if (typeof templateTxt === 'string' && templateTxt.length > 0) {
        try {
            let c = _.template(templateTxt);
            c({'title': OPTIONS_EXAMPLE_PAGE_TITLE, 'url': OPTIONS_EXAMPLE_PAGE_URL});
            return true;
        } catch (err) {
            return false;
        }
    }
    return false;
}

function saveTemplate() {
    let templateTxt = $('#template-txt').val();

    let obj = {};
    obj[CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE] = templateTxt;
    chrome.storage.sync.set(obj, () => {});
}

function resetTemplate() {
    let templateTxtElement = $('#template-txt');
    templateTxtElement.focus();
    templateTxtElement.removeClass('mui--is-empty');
    templateTxtElement.addClass('mui--is-dirty');
    templateTxtElement.addClass('mui--is-not-empty');
    templateTxtElement.val(CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE_DEFAULT_VALUE).change();
    previewTemplate();
}

$(document).ready(() => {
    loadTemplate();

    // リセットボタンのクリック
    $('#reset-btn').click(() => {
        resetTemplate();
    });

    // プレビューボタンのクリック
    $('#preview-btn').click(() => {
        previewTemplate();
    });

    // 保存ボタンのクリック
    $('#save-btn').click(() => {
        saveTemplate();
    });

    $('#template-txt').bind('keyup change paste', () => {
        if (validateTemplate($('#template-txt').val())) {
            previewTemplate();
            $('#save-btn').prop('disabled', false);
        } else {
            $('#save-btn').prop('disabled', true);
        }
    });
});
