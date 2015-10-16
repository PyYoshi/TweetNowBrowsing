'use strict';

// Twitter関連
const TWITTER_WEB_URL = 'https://twitter.com/';
const TWITTER_LOGIN_URL = 'https://twitter.com/login';
const TWEET_WEB_INTENT_URL = 'https://twitter.com/intent/tweet'; // query) url, text
const TWEET_WEB_INTENT_COMPLETE_PAGE_URL = 'https://twitter.com/intent/tweet/complete'; // query) latest_status_id
const TWEET_API_URL = 'https://twitter.com/intent/tweet'; // require form data) authenticity_token, status

// sendMessage関連
const SEND_MESSAGE_ORDER_COLLECT_TIWP = 'MSG_COLLECT_TWEET_INTENT_WEB_PAGE';
const SEND_MESSAGE_ORDER_TWEET_STATUS = 'MSG_TWEET_STATUS';

// alarm関連
const ALARM_ORDER_COLLECT_TIWP = 'ALARM_COLLECT_TWEET_INTENT_WEB_PAGE';

// localStorage key関連
const LOCAL_STORAGE_KEY_POST_HEADER_TEXT = 'postHeader';
const LOCAL_STORAGE_KEY_POST_HEADER_TEXT_DEFAULT_VALUE = 'NowBrowsing';
const LOCAL_STORAGE_KEY_POST_HEADER_TEXT_SPLITTER = 'postHeaderSplitter';
const LOCAL_STORAGE_KEY_POST_HEADER_TEXT_SPLITTER_DEFAULT_VALUE = ': ';
const LOCAL_STORAGE_KEY_POST_URL_SPLITTER = 'statusUrlSplitter';
const LOCAL_STORAGE_KEY_POST_URL_SPLITTER_DEFAULT_VALUE = ' - ';

// exports
export default TWITTER_WEB_URL;
export default TWITTER_LOGIN_URL;
export default TWEET_WEB_INTENT_URL;
export default TWEET_WEB_INTENT_COMPLETE_PAGE_URL;
export default TWEET_API_URL;
export default SEND_MESSAGE_ORDER_COLLECT_TIWP;
export default ALARM_ORDER_COLLECT_TIWP;
export default LOCAL_STORAGE_KEY_POST_HEADER_TEXT;
export default LOCAL_STORAGE_KEY_POST_HEADER_TEXT_DEFAULT_VALUE;
export default LOCAL_STORAGE_KEY_POST_HEADER_TEXT_SPLITTER;
export default LOCAL_STORAGE_KEY_POST_HEADER_TEXT_SPLITTER_DEFAULT_VALUE;
export default LOCAL_STORAGE_KEY_POST_URL_SPLITTER;
export default LOCAL_STORAGE_KEY_POST_URL_SPLITTER_DEFAULT_VALUE;
