'use strict';

// Twitter関連
export const TWEET_MAX_LENGTH = 140;
export const TWITTER_WEB_URL = 'https://twitter.com/';
export const TWITTER_LOGIN_URL = 'https://twitter.com/login';
export const TWEET_WEB_INTENT_URL = 'https://twitter.com/intent/tweet'; // query) url, text
export const TWEET_WEB_INTENT_COMPLETE_PAGE_URL = 'https://twitter.com/intent/tweet/complete'; // query) latest_status_id
export const TWEET_API_URL = 'https://twitter.com/i/tweet/create'; // require form data) authenticity_token, status

// sendMessage関連
export const SEND_MESSAGE_ORDER_COLLECT_TIWP = 'MSG_COLLECT_TWEET_INTENT_WEB_PAGE';
export const SEND_MESSAGE_ORDER_TWEET_STATUS = 'MSG_TWEET_STATUS';

// alarm関連
export const ALARM_ORDER_COLLECT_TIWP = 'ALARM_COLLECT_TWEET_INTENT_WEB_PAGE';

// chrome.storage key関連
export const CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE = 'postStatusTemplate';
export const CHROME_STORAGE_KEY_POST_STATUS_TEMPLATE_DEFAULT_VALUE = 'NowBrowsing: ${title}: ${url}';

// localStorage key関連
export const LOCAL_STORAGE_KEY_PRIVATE_CONFIG_AUTHENTICITY_TOKEN = 'authenticity_token';
export const LOCAL_STORAGE_KEY_PRIVATE_CONFIG_USER_ID = 'user_id';
export const LOCAL_STORAGE_KEY_PRIVATE_CONFIG_SCREEN_NAME = 'screen_name';
