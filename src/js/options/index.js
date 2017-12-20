import template from 'lodash.template';
import isNumber from 'lodash.isnumber';
import isString from 'lodash.isstring';
import $ from 'jquery';

import {
  CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE,
  CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE_DEFAULT_VALUE,
  OPTIONS_EXAMPLE_PAGE_TITLE,
  OPTIONS_EXAMPLE_PAGE_URL,
  CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC,
  CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC_DEFAULT_VALUE
} from '../common/const';

import '../../css/roboto.css';
import '../../css/material-icons.css';
import '../../css/base.css';
import '../../css/options.css';

function previewTemplate() {
  const templateTxt = $('#template-txt').val();
  const compiled = template(templateTxt);
  const previewTxt = compiled({ title: OPTIONS_EXAMPLE_PAGE_TITLE, url: OPTIONS_EXAMPLE_PAGE_URL });

  const previewTxtElement = $('#preview-txt');
  previewTxtElement.removeClass('mui--is-empty');
  previewTxtElement.addClass('mui--is-dirty');
  previewTxtElement.addClass('mui--is-not-empty');
  previewTxtElement.val(previewTxt).change();
}

function loadConfig() {
  chrome.storage.sync.get(
    [CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE, CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC],
    (object) => {
      const templateTxtElement = $('#template-txt');
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

      const notificationDisplayTimeElement = $('#notification-display-time');
      if (CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC in object) {
        notificationDisplayTimeElement.val(object[CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC]).change();
      } else {
        notificationDisplayTimeElement.val(CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC_DEFAULT_VALUE).change();
      }
    }
  );
}

/**
 * テンプレート文字列が正しいものかチェック
 * @param {String}
 * @return {Boolean}
 */
function validateTemplate(templateTxt) {
  if (typeof templateTxt === 'string' && templateTxt.length > 0) {
    try {
      const c = template(templateTxt);
      c({ title: OPTIONS_EXAMPLE_PAGE_TITLE, url: OPTIONS_EXAMPLE_PAGE_URL });
      return true;
    } catch (err) {
      return false;
    }
  }
  return false;
}

function saveTemplate() {
  const templateTxt = $('#template-txt').val();

  const obj = {};
  obj[CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE] = templateTxt;
  chrome.storage.sync.set(obj, () => {});
}

function resetTemplate() {
  const templateTxtElement = $('#template-txt');
  templateTxtElement.focus();
  templateTxtElement.removeClass('mui--is-empty');
  templateTxtElement.addClass('mui--is-dirty');
  templateTxtElement.addClass('mui--is-not-empty');
  templateTxtElement.val(CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE_DEFAULT_VALUE).change();
  previewTemplate();
}

function saveNotificationDisplayTime() {
  let notificationDisplayTime = $('#notification-display-time').val();
  if (!isNumber(notificationDisplayTime)) {
    if (isString(notificationDisplayTime)) {
      notificationDisplayTime = parseInt(notificationDisplayTime, 10);
    } else {
      notificationDisplayTime = CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC_DEFAULT_VALUE;
    }
  }
  const obj = {};
  obj[CHROME_STORAGE_KEY_NOTIFICATION_DISPLAY_TIME_SEC] = notificationDisplayTime;
  chrome.storage.sync.set(obj, () => {});
}

$(document).ready(() => {
  loadConfig();

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

  $('#notification-display-time').change(() => {
    saveNotificationDisplayTime();
  });
});
