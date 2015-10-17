'use strict';

import {SEND_MESSAGE_ORDER_COLLECT_TIWP} from 'common/const';

// Tweet Intent WebページのHTML解析処理を走らせる
chrome.runtime.sendMessage({'order': SEND_MESSAGE_ORDER_COLLECT_TIWP});
