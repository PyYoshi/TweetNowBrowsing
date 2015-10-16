'use strict';

import SEND_MESSAGE_ORDER_SAY_HELLO from 'common/const';

chrome.runtime.sendMessage({'order': SEND_MESSAGE_ORDER_SAY_HELLO});
