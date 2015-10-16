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

// exports
export default TWITTER_WEB_URL;
export default TWITTER_LOGIN_URL;
export default TWEET_WEB_INTENT_URL;
export default TWEET_WEB_INTENT_COMPLETE_PAGE_URL;
export default TWEET_API_URL;
export default SEND_MESSAGE_ORDER_COLLECT_TIWP;
export default ALARM_ORDER_COLLECT_TIWP;
