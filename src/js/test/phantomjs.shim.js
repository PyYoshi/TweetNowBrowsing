// https://github.com/MeoMix/StreamusChromeExtension/blob/ff1af1fb18992b978ee64a556b197babdab0ade3/src/js/test/phantomjs.shim.js

if (!window.console) {
  window.console = function() { };
}

if (!window.MutationObserver) {
  window.MutationObserver = function() {
    return {
      observe: function() {

      },
      disconnect: function() {

      },
      takeRecords: function() {

      }
    };
  };
}

if (!Function.prototype.bind) {
  Function.prototype.bind = function(root) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var args = Array.prototype.slice.call(arguments, 1);
    var functionToBind = this;
    var FunctionNoOp = function() { };
    var FunctionBound = function() {
      return functionToBind.apply(this instanceof FunctionNoOp ? this : root, args.concat(Array.prototype.slice.call(arguments)));
    };

    FunctionNoOp.prototype = this.prototype;
    FunctionBound.prototype = new FunctionNoOp();

    return FunctionBound;
  };
}

if (!window.requestAnimationFrame) {
  var lastTime = 0;

  window.requestAnimationFrame = function(callback) {
    var currentTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currentTime - lastTime));
    var id = window.setTimeout(function() {
      callback(currentTime + timeToCall);
    }, timeToCall);
    lastTime = currentTime + timeToCall;

    return id;
  };
}

if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = function(id) {
    window.clearTimeout(id);
  };
}

if (!window.Error.prototype.stack) {
  window.Error.prototype.stack = '_phantomJS stack';
}

if (!document.registerElement) {
  document.registerElement = function() {
    };
}

if (!Object.observe) {
  Object.observe = function() {
    };
  Object.unobserve = function() {
    };
}
