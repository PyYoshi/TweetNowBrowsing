'use strict';

import 'test/mocha_setup';
import 'test/bridge';

import chai, {assert, expect} from 'chai';

window.assert = assert;
window.expect = expect;

describe('Test Hello', () => {
  it('say hello', () => {
    console.log('hello!');
  });
});

mocha.run();
