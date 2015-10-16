'use strict';

import Utility from 'common/utility';
import SEND_MESSAGE_ORDER_SAY_HELLO from 'common/const';

chrome.runtime.onInstalled.addListener((details) => {
  console.log(details);
});

function sayHello() {
  console.log('Hello! ' + Utility.nowUTCString());
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if ('order' in request) {
    switch (request.order) {
      case SEND_MESSAGE_ORDER_SAY_HELLO:
        sayHello();
        break;
      default:
        break;
    }
  }
});
