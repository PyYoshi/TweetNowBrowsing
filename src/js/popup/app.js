'use strict';

import Utility from 'common/utility';
import SEND_MESSAGE_ORDER_SAY_HELLO from 'common/const';

function sayHello() {
  chrome.runtime.sendMessage({'order': SEND_MESSAGE_ORDER_SAY_HELLO});
}

sayHello();
