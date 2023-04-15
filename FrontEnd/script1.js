(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
'use strict';

var objectAssign = require('object-assign');

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:
// NB: The URL to the CommonJS spec is kept just for tradition.
//     node-assert has evolved a lot since then, both in API and behavior.

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

// Expose a strict only variant of assert
function strict(value, message) {
  if (!value) fail(value, true, message, '==', strict);
}
assert.strict = objectAssign(strict, assert, {
  equal: assert.strictEqual,
  deepEqual: assert.deepStrictEqual,
  notEqual: assert.notStrictEqual,
  notDeepEqual: assert.notDeepStrictEqual
});
assert.strict.strict = assert.strict;

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"object-assign":29,"util/":4}],2:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":3,"_process":41,"inherits":2}],5:[function(require,module,exports){
(function (global){(function (){
'use strict';

var possibleNames = [
	'BigInt64Array',
	'BigUint64Array',
	'Float32Array',
	'Float64Array',
	'Int16Array',
	'Int32Array',
	'Int8Array',
	'Uint16Array',
	'Uint32Array',
	'Uint8Array',
	'Uint8ClampedArray'
];

var g = typeof globalThis === 'undefined' ? global : globalThis;

module.exports = function availableTypedArrays() {
	var out = [];
	for (var i = 0; i < possibleNames.length; i++) {
		if (typeof g[possibleNames[i]] === 'function') {
			out[out.length] = possibleNames[i];
		}
	}
	return out;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],7:[function(require,module,exports){

},{}],8:[function(require,module,exports){
(function (process,Buffer){(function (){
'use strict';
/* eslint camelcase: "off" */

var assert = require('assert');

var Zstream = require('pako/lib/zlib/zstream');
var zlib_deflate = require('pako/lib/zlib/deflate.js');
var zlib_inflate = require('pako/lib/zlib/inflate.js');
var constants = require('pako/lib/zlib/constants');

for (var key in constants) {
  exports[key] = constants[key];
}

// zlib modes
exports.NONE = 0;
exports.DEFLATE = 1;
exports.INFLATE = 2;
exports.GZIP = 3;
exports.GUNZIP = 4;
exports.DEFLATERAW = 5;
exports.INFLATERAW = 6;
exports.UNZIP = 7;

var GZIP_HEADER_ID1 = 0x1f;
var GZIP_HEADER_ID2 = 0x8b;

/**
 * Emulate Node's zlib C++ layer for use by the JS layer in index.js
 */
function Zlib(mode) {
  if (typeof mode !== 'number' || mode < exports.DEFLATE || mode > exports.UNZIP) {
    throw new TypeError('Bad argument');
  }

  this.dictionary = null;
  this.err = 0;
  this.flush = 0;
  this.init_done = false;
  this.level = 0;
  this.memLevel = 0;
  this.mode = mode;
  this.strategy = 0;
  this.windowBits = 0;
  this.write_in_progress = false;
  this.pending_close = false;
  this.gzip_id_bytes_read = 0;
}

Zlib.prototype.close = function () {
  if (this.write_in_progress) {
    this.pending_close = true;
    return;
  }

  this.pending_close = false;

  assert(this.init_done, 'close before init');
  assert(this.mode <= exports.UNZIP);

  if (this.mode === exports.DEFLATE || this.mode === exports.GZIP || this.mode === exports.DEFLATERAW) {
    zlib_deflate.deflateEnd(this.strm);
  } else if (this.mode === exports.INFLATE || this.mode === exports.GUNZIP || this.mode === exports.INFLATERAW || this.mode === exports.UNZIP) {
    zlib_inflate.inflateEnd(this.strm);
  }

  this.mode = exports.NONE;

  this.dictionary = null;
};

Zlib.prototype.write = function (flush, input, in_off, in_len, out, out_off, out_len) {
  return this._write(true, flush, input, in_off, in_len, out, out_off, out_len);
};

Zlib.prototype.writeSync = function (flush, input, in_off, in_len, out, out_off, out_len) {
  return this._write(false, flush, input, in_off, in_len, out, out_off, out_len);
};

Zlib.prototype._write = function (async, flush, input, in_off, in_len, out, out_off, out_len) {
  assert.equal(arguments.length, 8);

  assert(this.init_done, 'write before init');
  assert(this.mode !== exports.NONE, 'already finalized');
  assert.equal(false, this.write_in_progress, 'write already in progress');
  assert.equal(false, this.pending_close, 'close is pending');

  this.write_in_progress = true;

  assert.equal(false, flush === undefined, 'must provide flush value');

  this.write_in_progress = true;

  if (flush !== exports.Z_NO_FLUSH && flush !== exports.Z_PARTIAL_FLUSH && flush !== exports.Z_SYNC_FLUSH && flush !== exports.Z_FULL_FLUSH && flush !== exports.Z_FINISH && flush !== exports.Z_BLOCK) {
    throw new Error('Invalid flush value');
  }

  if (input == null) {
    input = Buffer.alloc(0);
    in_len = 0;
    in_off = 0;
  }

  this.strm.avail_in = in_len;
  this.strm.input = input;
  this.strm.next_in = in_off;
  this.strm.avail_out = out_len;
  this.strm.output = out;
  this.strm.next_out = out_off;
  this.flush = flush;

  if (!async) {
    // sync version
    this._process();

    if (this._checkError()) {
      return this._afterSync();
    }
    return;
  }

  // async version
  var self = this;
  process.nextTick(function () {
    self._process();
    self._after();
  });

  return this;
};

Zlib.prototype._afterSync = function () {
  var avail_out = this.strm.avail_out;
  var avail_in = this.strm.avail_in;

  this.write_in_progress = false;

  return [avail_in, avail_out];
};

Zlib.prototype._process = function () {
  var next_expected_header_byte = null;

  // If the avail_out is left at 0, then it means that it ran out
  // of room.  If there was avail_out left over, then it means
  // that all of the input was consumed.
  switch (this.mode) {
    case exports.DEFLATE:
    case exports.GZIP:
    case exports.DEFLATERAW:
      this.err = zlib_deflate.deflate(this.strm, this.flush);
      break;
    case exports.UNZIP:
      if (this.strm.avail_in > 0) {
        next_expected_header_byte = this.strm.next_in;
      }

      switch (this.gzip_id_bytes_read) {
        case 0:
          if (next_expected_header_byte === null) {
            break;
          }

          if (this.strm.input[next_expected_header_byte] === GZIP_HEADER_ID1) {
            this.gzip_id_bytes_read = 1;
            next_expected_header_byte++;

            if (this.strm.avail_in === 1) {
              // The only available byte was already read.
              break;
            }
          } else {
            this.mode = exports.INFLATE;
            break;
          }

        // fallthrough
        case 1:
          if (next_expected_header_byte === null) {
            break;
          }

          if (this.strm.input[next_expected_header_byte] === GZIP_HEADER_ID2) {
            this.gzip_id_bytes_read = 2;
            this.mode = exports.GUNZIP;
          } else {
            // There is no actual difference between INFLATE and INFLATERAW
            // (after initialization).
            this.mode = exports.INFLATE;
          }

          break;
        default:
          throw new Error('invalid number of gzip magic number bytes read');
      }

    // fallthrough
    case exports.INFLATE:
    case exports.GUNZIP:
    case exports.INFLATERAW:
      this.err = zlib_inflate.inflate(this.strm, this.flush

      // If data was encoded with dictionary
      );if (this.err === exports.Z_NEED_DICT && this.dictionary) {
        // Load it
        this.err = zlib_inflate.inflateSetDictionary(this.strm, this.dictionary);
        if (this.err === exports.Z_OK) {
          // And try to decode again
          this.err = zlib_inflate.inflate(this.strm, this.flush);
        } else if (this.err === exports.Z_DATA_ERROR) {
          // Both inflateSetDictionary() and inflate() return Z_DATA_ERROR.
          // Make it possible for After() to tell a bad dictionary from bad
          // input.
          this.err = exports.Z_NEED_DICT;
        }
      }
      while (this.strm.avail_in > 0 && this.mode === exports.GUNZIP && this.err === exports.Z_STREAM_END && this.strm.next_in[0] !== 0x00) {
        // Bytes remain in input buffer. Perhaps this is another compressed
        // member in the same archive, or just trailing garbage.
        // Trailing zero bytes are okay, though, since they are frequently
        // used for padding.

        this.reset();
        this.err = zlib_inflate.inflate(this.strm, this.flush);
      }
      break;
    default:
      throw new Error('Unknown mode ' + this.mode);
  }
};

Zlib.prototype._checkError = function () {
  // Acceptable error states depend on the type of zlib stream.
  switch (this.err) {
    case exports.Z_OK:
    case exports.Z_BUF_ERROR:
      if (this.strm.avail_out !== 0 && this.flush === exports.Z_FINISH) {
        this._error('unexpected end of file');
        return false;
      }
      break;
    case exports.Z_STREAM_END:
      // normal statuses, not fatal
      break;
    case exports.Z_NEED_DICT:
      if (this.dictionary == null) {
        this._error('Missing dictionary');
      } else {
        this._error('Bad dictionary');
      }
      return false;
    default:
      // something else.
      this._error('Zlib error');
      return false;
  }

  return true;
};

Zlib.prototype._after = function () {
  if (!this._checkError()) {
    return;
  }

  var avail_out = this.strm.avail_out;
  var avail_in = this.strm.avail_in;

  this.write_in_progress = false;

  // call the write() cb
  this.callback(avail_in, avail_out);

  if (this.pending_close) {
    this.close();
  }
};

Zlib.prototype._error = function (message) {
  if (this.strm.msg) {
    message = this.strm.msg;
  }
  this.onerror(message, this.err

  // no hope of rescue.
  );this.write_in_progress = false;
  if (this.pending_close) {
    this.close();
  }
};

Zlib.prototype.init = function (windowBits, level, memLevel, strategy, dictionary) {
  assert(arguments.length === 4 || arguments.length === 5, 'init(windowBits, level, memLevel, strategy, [dictionary])');

  assert(windowBits >= 8 && windowBits <= 15, 'invalid windowBits');
  assert(level >= -1 && level <= 9, 'invalid compression level');

  assert(memLevel >= 1 && memLevel <= 9, 'invalid memlevel');

  assert(strategy === exports.Z_FILTERED || strategy === exports.Z_HUFFMAN_ONLY || strategy === exports.Z_RLE || strategy === exports.Z_FIXED || strategy === exports.Z_DEFAULT_STRATEGY, 'invalid strategy');

  this._init(level, windowBits, memLevel, strategy, dictionary);
  this._setDictionary();
};

Zlib.prototype.params = function () {
  throw new Error('deflateParams Not supported');
};

Zlib.prototype.reset = function () {
  this._reset();
  this._setDictionary();
};

Zlib.prototype._init = function (level, windowBits, memLevel, strategy, dictionary) {
  this.level = level;
  this.windowBits = windowBits;
  this.memLevel = memLevel;
  this.strategy = strategy;

  this.flush = exports.Z_NO_FLUSH;

  this.err = exports.Z_OK;

  if (this.mode === exports.GZIP || this.mode === exports.GUNZIP) {
    this.windowBits += 16;
  }

  if (this.mode === exports.UNZIP) {
    this.windowBits += 32;
  }

  if (this.mode === exports.DEFLATERAW || this.mode === exports.INFLATERAW) {
    this.windowBits = -1 * this.windowBits;
  }

  this.strm = new Zstream();

  switch (this.mode) {
    case exports.DEFLATE:
    case exports.GZIP:
    case exports.DEFLATERAW:
      this.err = zlib_deflate.deflateInit2(this.strm, this.level, exports.Z_DEFLATED, this.windowBits, this.memLevel, this.strategy);
      break;
    case exports.INFLATE:
    case exports.GUNZIP:
    case exports.INFLATERAW:
    case exports.UNZIP:
      this.err = zlib_inflate.inflateInit2(this.strm, this.windowBits);
      break;
    default:
      throw new Error('Unknown mode ' + this.mode);
  }

  if (this.err !== exports.Z_OK) {
    this._error('Init error');
  }

  this.dictionary = dictionary;

  this.write_in_progress = false;
  this.init_done = true;
};

Zlib.prototype._setDictionary = function () {
  if (this.dictionary == null) {
    return;
  }

  this.err = exports.Z_OK;

  switch (this.mode) {
    case exports.DEFLATE:
    case exports.DEFLATERAW:
      this.err = zlib_deflate.deflateSetDictionary(this.strm, this.dictionary);
      break;
    default:
      break;
  }

  if (this.err !== exports.Z_OK) {
    this._error('Failed to set dictionary');
  }
};

Zlib.prototype._reset = function () {
  this.err = exports.Z_OK;

  switch (this.mode) {
    case exports.DEFLATE:
    case exports.DEFLATERAW:
    case exports.GZIP:
      this.err = zlib_deflate.deflateReset(this.strm);
      break;
    case exports.INFLATE:
    case exports.INFLATERAW:
    case exports.GUNZIP:
      this.err = zlib_inflate.inflateReset(this.strm);
      break;
    default:
      break;
  }

  if (this.err !== exports.Z_OK) {
    this._error('Failed to reset stream');
  }
};

exports.Zlib = Zlib;
}).call(this)}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":41,"assert":1,"buffer":10,"pako/lib/zlib/constants":32,"pako/lib/zlib/deflate.js":34,"pako/lib/zlib/inflate.js":36,"pako/lib/zlib/zstream":40}],9:[function(require,module,exports){
(function (process){(function (){
'use strict';

var Buffer = require('buffer').Buffer;
var Transform = require('stream').Transform;
var binding = require('./binding');
var util = require('util');
var assert = require('assert').ok;
var kMaxLength = require('buffer').kMaxLength;
var kRangeErrorMessage = 'Cannot create final Buffer. It would be larger ' + 'than 0x' + kMaxLength.toString(16) + ' bytes';

// zlib doesn't provide these, so kludge them in following the same
// const naming scheme zlib uses.
binding.Z_MIN_WINDOWBITS = 8;
binding.Z_MAX_WINDOWBITS = 15;
binding.Z_DEFAULT_WINDOWBITS = 15;

// fewer than 64 bytes per chunk is stupid.
// technically it could work with as few as 8, but even 64 bytes
// is absurdly low.  Usually a MB or more is best.
binding.Z_MIN_CHUNK = 64;
binding.Z_MAX_CHUNK = Infinity;
binding.Z_DEFAULT_CHUNK = 16 * 1024;

binding.Z_MIN_MEMLEVEL = 1;
binding.Z_MAX_MEMLEVEL = 9;
binding.Z_DEFAULT_MEMLEVEL = 8;

binding.Z_MIN_LEVEL = -1;
binding.Z_MAX_LEVEL = 9;
binding.Z_DEFAULT_LEVEL = binding.Z_DEFAULT_COMPRESSION;

// expose all the zlib constants
var bkeys = Object.keys(binding);
for (var bk = 0; bk < bkeys.length; bk++) {
  var bkey = bkeys[bk];
  if (bkey.match(/^Z/)) {
    Object.defineProperty(exports, bkey, {
      enumerable: true, value: binding[bkey], writable: false
    });
  }
}

// translation table for return codes.
var codes = {
  Z_OK: binding.Z_OK,
  Z_STREAM_END: binding.Z_STREAM_END,
  Z_NEED_DICT: binding.Z_NEED_DICT,
  Z_ERRNO: binding.Z_ERRNO,
  Z_STREAM_ERROR: binding.Z_STREAM_ERROR,
  Z_DATA_ERROR: binding.Z_DATA_ERROR,
  Z_MEM_ERROR: binding.Z_MEM_ERROR,
  Z_BUF_ERROR: binding.Z_BUF_ERROR,
  Z_VERSION_ERROR: binding.Z_VERSION_ERROR
};

var ckeys = Object.keys(codes);
for (var ck = 0; ck < ckeys.length; ck++) {
  var ckey = ckeys[ck];
  codes[codes[ckey]] = ckey;
}

Object.defineProperty(exports, 'codes', {
  enumerable: true, value: Object.freeze(codes), writable: false
});

exports.Deflate = Deflate;
exports.Inflate = Inflate;
exports.Gzip = Gzip;
exports.Gunzip = Gunzip;
exports.DeflateRaw = DeflateRaw;
exports.InflateRaw = InflateRaw;
exports.Unzip = Unzip;

exports.createDeflate = function (o) {
  return new Deflate(o);
};

exports.createInflate = function (o) {
  return new Inflate(o);
};

exports.createDeflateRaw = function (o) {
  return new DeflateRaw(o);
};

exports.createInflateRaw = function (o) {
  return new InflateRaw(o);
};

exports.createGzip = function (o) {
  return new Gzip(o);
};

exports.createGunzip = function (o) {
  return new Gunzip(o);
};

exports.createUnzip = function (o) {
  return new Unzip(o);
};

// Convenience methods.
// compress/decompress a string or buffer in one step.
exports.deflate = function (buffer, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  return zlibBuffer(new Deflate(opts), buffer, callback);
};

exports.deflateSync = function (buffer, opts) {
  return zlibBufferSync(new Deflate(opts), buffer);
};

exports.gzip = function (buffer, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  return zlibBuffer(new Gzip(opts), buffer, callback);
};

exports.gzipSync = function (buffer, opts) {
  return zlibBufferSync(new Gzip(opts), buffer);
};

exports.deflateRaw = function (buffer, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  return zlibBuffer(new DeflateRaw(opts), buffer, callback);
};

exports.deflateRawSync = function (buffer, opts) {
  return zlibBufferSync(new DeflateRaw(opts), buffer);
};

exports.unzip = function (buffer, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  return zlibBuffer(new Unzip(opts), buffer, callback);
};

exports.unzipSync = function (buffer, opts) {
  return zlibBufferSync(new Unzip(opts), buffer);
};

exports.inflate = function (buffer, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  return zlibBuffer(new Inflate(opts), buffer, callback);
};

exports.inflateSync = function (buffer, opts) {
  return zlibBufferSync(new Inflate(opts), buffer);
};

exports.gunzip = function (buffer, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  return zlibBuffer(new Gunzip(opts), buffer, callback);
};

exports.gunzipSync = function (buffer, opts) {
  return zlibBufferSync(new Gunzip(opts), buffer);
};

exports.inflateRaw = function (buffer, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  return zlibBuffer(new InflateRaw(opts), buffer, callback);
};

exports.inflateRawSync = function (buffer, opts) {
  return zlibBufferSync(new InflateRaw(opts), buffer);
};

function zlibBuffer(engine, buffer, callback) {
  var buffers = [];
  var nread = 0;

  engine.on('error', onError);
  engine.on('end', onEnd);

  engine.end(buffer);
  flow();

  function flow() {
    var chunk;
    while (null !== (chunk = engine.read())) {
      buffers.push(chunk);
      nread += chunk.length;
    }
    engine.once('readable', flow);
  }

  function onError(err) {
    engine.removeListener('end', onEnd);
    engine.removeListener('readable', flow);
    callback(err);
  }

  function onEnd() {
    var buf;
    var err = null;

    if (nread >= kMaxLength) {
      err = new RangeError(kRangeErrorMessage);
    } else {
      buf = Buffer.concat(buffers, nread);
    }

    buffers = [];
    engine.close();
    callback(err, buf);
  }
}

function zlibBufferSync(engine, buffer) {
  if (typeof buffer === 'string') buffer = Buffer.from(buffer);

  if (!Buffer.isBuffer(buffer)) throw new TypeError('Not a string or buffer');

  var flushFlag = engine._finishFlushFlag;

  return engine._processChunk(buffer, flushFlag);
}

// generic zlib
// minimal 2-byte header
function Deflate(opts) {
  if (!(this instanceof Deflate)) return new Deflate(opts);
  Zlib.call(this, opts, binding.DEFLATE);
}

function Inflate(opts) {
  if (!(this instanceof Inflate)) return new Inflate(opts);
  Zlib.call(this, opts, binding.INFLATE);
}

// gzip - bigger header, same deflate compression
function Gzip(opts) {
  if (!(this instanceof Gzip)) return new Gzip(opts);
  Zlib.call(this, opts, binding.GZIP);
}

function Gunzip(opts) {
  if (!(this instanceof Gunzip)) return new Gunzip(opts);
  Zlib.call(this, opts, binding.GUNZIP);
}

// raw - no header
function DeflateRaw(opts) {
  if (!(this instanceof DeflateRaw)) return new DeflateRaw(opts);
  Zlib.call(this, opts, binding.DEFLATERAW);
}

function InflateRaw(opts) {
  if (!(this instanceof InflateRaw)) return new InflateRaw(opts);
  Zlib.call(this, opts, binding.INFLATERAW);
}

// auto-detect header.
function Unzip(opts) {
  if (!(this instanceof Unzip)) return new Unzip(opts);
  Zlib.call(this, opts, binding.UNZIP);
}

function isValidFlushFlag(flag) {
  return flag === binding.Z_NO_FLUSH || flag === binding.Z_PARTIAL_FLUSH || flag === binding.Z_SYNC_FLUSH || flag === binding.Z_FULL_FLUSH || flag === binding.Z_FINISH || flag === binding.Z_BLOCK;
}

// the Zlib class they all inherit from
// This thing manages the queue of requests, and returns
// true or false if there is anything in the queue when
// you call the .write() method.

function Zlib(opts, mode) {
  var _this = this;

  this._opts = opts = opts || {};
  this._chunkSize = opts.chunkSize || exports.Z_DEFAULT_CHUNK;

  Transform.call(this, opts);

  if (opts.flush && !isValidFlushFlag(opts.flush)) {
    throw new Error('Invalid flush flag: ' + opts.flush);
  }
  if (opts.finishFlush && !isValidFlushFlag(opts.finishFlush)) {
    throw new Error('Invalid flush flag: ' + opts.finishFlush);
  }

  this._flushFlag = opts.flush || binding.Z_NO_FLUSH;
  this._finishFlushFlag = typeof opts.finishFlush !== 'undefined' ? opts.finishFlush : binding.Z_FINISH;

  if (opts.chunkSize) {
    if (opts.chunkSize < exports.Z_MIN_CHUNK || opts.chunkSize > exports.Z_MAX_CHUNK) {
      throw new Error('Invalid chunk size: ' + opts.chunkSize);
    }
  }

  if (opts.windowBits) {
    if (opts.windowBits < exports.Z_MIN_WINDOWBITS || opts.windowBits > exports.Z_MAX_WINDOWBITS) {
      throw new Error('Invalid windowBits: ' + opts.windowBits);
    }
  }

  if (opts.level) {
    if (opts.level < exports.Z_MIN_LEVEL || opts.level > exports.Z_MAX_LEVEL) {
      throw new Error('Invalid compression level: ' + opts.level);
    }
  }

  if (opts.memLevel) {
    if (opts.memLevel < exports.Z_MIN_MEMLEVEL || opts.memLevel > exports.Z_MAX_MEMLEVEL) {
      throw new Error('Invalid memLevel: ' + opts.memLevel);
    }
  }

  if (opts.strategy) {
    if (opts.strategy != exports.Z_FILTERED && opts.strategy != exports.Z_HUFFMAN_ONLY && opts.strategy != exports.Z_RLE && opts.strategy != exports.Z_FIXED && opts.strategy != exports.Z_DEFAULT_STRATEGY) {
      throw new Error('Invalid strategy: ' + opts.strategy);
    }
  }

  if (opts.dictionary) {
    if (!Buffer.isBuffer(opts.dictionary)) {
      throw new Error('Invalid dictionary: it should be a Buffer instance');
    }
  }

  this._handle = new binding.Zlib(mode);

  var self = this;
  this._hadError = false;
  this._handle.onerror = function (message, errno) {
    // there is no way to cleanly recover.
    // continuing only obscures problems.
    _close(self);
    self._hadError = true;

    var error = new Error(message);
    error.errno = errno;
    error.code = exports.codes[errno];
    self.emit('error', error);
  };

  var level = exports.Z_DEFAULT_COMPRESSION;
  if (typeof opts.level === 'number') level = opts.level;

  var strategy = exports.Z_DEFAULT_STRATEGY;
  if (typeof opts.strategy === 'number') strategy = opts.strategy;

  this._handle.init(opts.windowBits || exports.Z_DEFAULT_WINDOWBITS, level, opts.memLevel || exports.Z_DEFAULT_MEMLEVEL, strategy, opts.dictionary);

  this._buffer = Buffer.allocUnsafe(this._chunkSize);
  this._offset = 0;
  this._level = level;
  this._strategy = strategy;

  this.once('end', this.close);

  Object.defineProperty(this, '_closed', {
    get: function () {
      return !_this._handle;
    },
    configurable: true,
    enumerable: true
  });
}

util.inherits(Zlib, Transform);

Zlib.prototype.params = function (level, strategy, callback) {
  if (level < exports.Z_MIN_LEVEL || level > exports.Z_MAX_LEVEL) {
    throw new RangeError('Invalid compression level: ' + level);
  }
  if (strategy != exports.Z_FILTERED && strategy != exports.Z_HUFFMAN_ONLY && strategy != exports.Z_RLE && strategy != exports.Z_FIXED && strategy != exports.Z_DEFAULT_STRATEGY) {
    throw new TypeError('Invalid strategy: ' + strategy);
  }

  if (this._level !== level || this._strategy !== strategy) {
    var self = this;
    this.flush(binding.Z_SYNC_FLUSH, function () {
      assert(self._handle, 'zlib binding closed');
      self._handle.params(level, strategy);
      if (!self._hadError) {
        self._level = level;
        self._strategy = strategy;
        if (callback) callback();
      }
    });
  } else {
    process.nextTick(callback);
  }
};

Zlib.prototype.reset = function () {
  assert(this._handle, 'zlib binding closed');
  return this._handle.reset();
};

// This is the _flush function called by the transform class,
// internally, when the last chunk has been written.
Zlib.prototype._flush = function (callback) {
  this._transform(Buffer.alloc(0), '', callback);
};

Zlib.prototype.flush = function (kind, callback) {
  var _this2 = this;

  var ws = this._writableState;

  if (typeof kind === 'function' || kind === undefined && !callback) {
    callback = kind;
    kind = binding.Z_FULL_FLUSH;
  }

  if (ws.ended) {
    if (callback) process.nextTick(callback);
  } else if (ws.ending) {
    if (callback) this.once('end', callback);
  } else if (ws.needDrain) {
    if (callback) {
      this.once('drain', function () {
        return _this2.flush(kind, callback);
      });
    }
  } else {
    this._flushFlag = kind;
    this.write(Buffer.alloc(0), '', callback);
  }
};

Zlib.prototype.close = function (callback) {
  _close(this, callback);
  process.nextTick(emitCloseNT, this);
};

function _close(engine, callback) {
  if (callback) process.nextTick(callback);

  // Caller may invoke .close after a zlib error (which will null _handle).
  if (!engine._handle) return;

  engine._handle.close();
  engine._handle = null;
}

function emitCloseNT(self) {
  self.emit('close');
}

Zlib.prototype._transform = function (chunk, encoding, cb) {
  var flushFlag;
  var ws = this._writableState;
  var ending = ws.ending || ws.ended;
  var last = ending && (!chunk || ws.length === chunk.length);

  if (chunk !== null && !Buffer.isBuffer(chunk)) return cb(new Error('invalid input'));

  if (!this._handle) return cb(new Error('zlib binding closed'));

  // If it's the last chunk, or a final flush, we use the Z_FINISH flush flag
  // (or whatever flag was provided using opts.finishFlush).
  // If it's explicitly flushing at some other time, then we use
  // Z_FULL_FLUSH. Otherwise, use Z_NO_FLUSH for maximum compression
  // goodness.
  if (last) flushFlag = this._finishFlushFlag;else {
    flushFlag = this._flushFlag;
    // once we've flushed the last of the queue, stop flushing and
    // go back to the normal behavior.
    if (chunk.length >= ws.length) {
      this._flushFlag = this._opts.flush || binding.Z_NO_FLUSH;
    }
  }

  this._processChunk(chunk, flushFlag, cb);
};

Zlib.prototype._processChunk = function (chunk, flushFlag, cb) {
  var availInBefore = chunk && chunk.length;
  var availOutBefore = this._chunkSize - this._offset;
  var inOff = 0;

  var self = this;

  var async = typeof cb === 'function';

  if (!async) {
    var buffers = [];
    var nread = 0;

    var error;
    this.on('error', function (er) {
      error = er;
    });

    assert(this._handle, 'zlib binding closed');
    do {
      var res = this._handle.writeSync(flushFlag, chunk, // in
      inOff, // in_off
      availInBefore, // in_len
      this._buffer, // out
      this._offset, //out_off
      availOutBefore); // out_len
    } while (!this._hadError && callback(res[0], res[1]));

    if (this._hadError) {
      throw error;
    }

    if (nread >= kMaxLength) {
      _close(this);
      throw new RangeError(kRangeErrorMessage);
    }

    var buf = Buffer.concat(buffers, nread);
    _close(this);

    return buf;
  }

  assert(this._handle, 'zlib binding closed');
  var req = this._handle.write(flushFlag, chunk, // in
  inOff, // in_off
  availInBefore, // in_len
  this._buffer, // out
  this._offset, //out_off
  availOutBefore); // out_len

  req.buffer = chunk;
  req.callback = callback;

  function callback(availInAfter, availOutAfter) {
    // When the callback is used in an async write, the callback's
    // context is the `req` object that was created. The req object
    // is === this._handle, and that's why it's important to null
    // out the values after they are done being used. `this._handle`
    // can stay in memory longer than the callback and buffer are needed.
    if (this) {
      this.buffer = null;
      this.callback = null;
    }

    if (self._hadError) return;

    var have = availOutBefore - availOutAfter;
    assert(have >= 0, 'have should not go down');

    if (have > 0) {
      var out = self._buffer.slice(self._offset, self._offset + have);
      self._offset += have;
      // serve some output to the consumer.
      if (async) {
        self.push(out);
      } else {
        buffers.push(out);
        nread += out.length;
      }
    }

    // exhausted the output buffer, or used all the input create a new one.
    if (availOutAfter === 0 || self._offset >= self._chunkSize) {
      availOutBefore = self._chunkSize;
      self._offset = 0;
      self._buffer = Buffer.allocUnsafe(self._chunkSize);
    }

    if (availOutAfter === 0) {
      // Not actually done.  Need to reprocess.
      // Also, update the availInBefore to the availInAfter value,
      // so that if we have to hit it a third (fourth, etc.) time,
      // it'll have the correct byte counts.
      inOff += availInBefore - availInAfter;
      availInBefore = availInAfter;

      if (!async) return true;

      var newReq = self._handle.write(flushFlag, chunk, inOff, availInBefore, self._buffer, self._offset, self._chunkSize);
      newReq.callback = callback; // this same function
      newReq.buffer = chunk;
      return;
    }

    if (!async) return false;

    // finished with the chunk.
    cb();
  }
};

util.inherits(Deflate, Zlib);
util.inherits(Inflate, Zlib);
util.inherits(Gzip, Zlib);
util.inherits(Gunzip, Zlib);
util.inherits(DeflateRaw, Zlib);
util.inherits(InflateRaw, Zlib);
util.inherits(Unzip, Zlib);
}).call(this)}).call(this,require('_process'))
},{"./binding":8,"_process":41,"assert":1,"buffer":10,"stream":43,"util":62}],10:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":6,"buffer":10,"ieee754":23}],11:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var callBind = require('./');

var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));

module.exports = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBind(intrinsic);
	}
	return intrinsic;
};

},{"./":12,"get-intrinsic":17}],12:[function(require,module,exports){
'use strict';

var bind = require('function-bind');
var GetIntrinsic = require('get-intrinsic');

var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);
var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var $max = GetIntrinsic('%Math.max%');

if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = null;
	}
}

module.exports = function callBind(originalFunction) {
	var func = $reflectApply(bind, $call, arguments);
	if ($gOPD && $defineProperty) {
		var desc = $gOPD(func, 'length');
		if (desc.configurable) {
			// original length, plus the receiver, minus any additional arguments (after the receiver)
			$defineProperty(
				func,
				'length',
				{ value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) }
			);
		}
	}
	return func;
};

var applyBind = function applyBind() {
	return $reflectApply(bind, $apply, arguments);
};

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}

},{"function-bind":16,"get-intrinsic":17}],13:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

},{}],14:[function(require,module,exports){
'use strict';

var isCallable = require('is-callable');

var toStr = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

var forEachArray = function forEachArray(array, iterator, receiver) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            if (receiver == null) {
                iterator(array[i], i, array);
            } else {
                iterator.call(receiver, array[i], i, array);
            }
        }
    }
};

var forEachString = function forEachString(string, iterator, receiver) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        if (receiver == null) {
            iterator(string.charAt(i), i, string);
        } else {
            iterator.call(receiver, string.charAt(i), i, string);
        }
    }
};

var forEachObject = function forEachObject(object, iterator, receiver) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            if (receiver == null) {
                iterator(object[k], k, object);
            } else {
                iterator.call(receiver, object[k], k, object);
            }
        }
    }
};

var forEach = function forEach(list, iterator, thisArg) {
    if (!isCallable(iterator)) {
        throw new TypeError('iterator must be a function');
    }

    var receiver;
    if (arguments.length >= 3) {
        receiver = thisArg;
    }

    if (toStr.call(list) === '[object Array]') {
        forEachArray(list, iterator, receiver);
    } else if (typeof list === 'string') {
        forEachString(list, iterator, receiver);
    } else {
        forEachObject(list, iterator, receiver);
    }
};

module.exports = forEach;

},{"is-callable":26}],15:[function(require,module,exports){
'use strict';

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],16:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":15}],17:[function(require,module,exports){
'use strict';

var undefined;

var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = require('has-symbols')();

var getProto = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined : BigInt64Array,
	'%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined : BigUint64Array,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};

try {
	null.error; // eslint-disable-line no-unused-expressions
} catch (e) {
	// https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
	var errorProto = getProto(getProto(e));
	INTRINSICS['%Error.prototype%'] = errorProto;
}

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = require('function-bind');
var hasOwn = require('has');
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);
var $exec = bind.call(Function.call, RegExp.prototype.exec);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	if ($exec(/^%?[^%]*%?$/, name) === null) {
		throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
	}
	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};

},{"function-bind":16,"has":22,"has-symbols":19}],18:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);

if ($gOPD) {
	try {
		$gOPD([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD = null;
	}
}

module.exports = $gOPD;

},{"get-intrinsic":17}],19:[function(require,module,exports){
'use strict';

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = require('./shams');

module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};

},{"./shams":20}],20:[function(require,module,exports){
'use strict';

/* eslint complexity: [2, 18], max-statements: [2, 33] */
module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

},{}],21:[function(require,module,exports){
'use strict';

var hasSymbols = require('has-symbols/shams');

module.exports = function hasToStringTagShams() {
	return hasSymbols() && !!Symbol.toStringTag;
};

},{"has-symbols/shams":20}],22:[function(require,module,exports){
'use strict';

var bind = require('function-bind');

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);

},{"function-bind":16}],23:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],24:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],25:[function(require,module,exports){
'use strict';

var hasToStringTag = require('has-tostringtag/shams')();
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');

var isStandardArguments = function isArguments(value) {
	if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false;
	}
	return $toString(value) === '[object Arguments]';
};

var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		$toString(value) !== '[object Array]' &&
		$toString(value.callee) === '[object Function]';
};

var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;

},{"call-bind/callBound":11,"has-tostringtag/shams":21}],26:[function(require,module,exports){
'use strict';

var fnToStr = Function.prototype.toString;
var reflectApply = typeof Reflect === 'object' && Reflect !== null && Reflect.apply;
var badArrayLike;
var isCallableMarker;
if (typeof reflectApply === 'function' && typeof Object.defineProperty === 'function') {
	try {
		badArrayLike = Object.defineProperty({}, 'length', {
			get: function () {
				throw isCallableMarker;
			}
		});
		isCallableMarker = {};
		// eslint-disable-next-line no-throw-literal
		reflectApply(function () { throw 42; }, null, badArrayLike);
	} catch (_) {
		if (_ !== isCallableMarker) {
			reflectApply = null;
		}
	}
} else {
	reflectApply = null;
}

var constructorRegex = /^\s*class\b/;
var isES6ClassFn = function isES6ClassFunction(value) {
	try {
		var fnStr = fnToStr.call(value);
		return constructorRegex.test(fnStr);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionToStr(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var objectClass = '[object Object]';
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var ddaClass = '[object HTMLAllCollection]'; // IE 11
var ddaClass2 = '[object HTML document.all class]';
var ddaClass3 = '[object HTMLCollection]'; // IE 9-10
var hasToStringTag = typeof Symbol === 'function' && !!Symbol.toStringTag; // better: use `has-tostringtag`

var isIE68 = !(0 in [,]); // eslint-disable-line no-sparse-arrays, comma-spacing

var isDDA = function isDocumentDotAll() { return false; };
if (typeof document === 'object') {
	// Firefox 3 canonicalizes DDA to undefined when it's not accessed directly
	var all = document.all;
	if (toStr.call(all) === toStr.call(document.all)) {
		isDDA = function isDocumentDotAll(value) {
			/* globals document: false */
			// in IE 6-8, typeof document.all is "object" and it's truthy
			if ((isIE68 || !value) && (typeof value === 'undefined' || typeof value === 'object')) {
				try {
					var str = toStr.call(value);
					return (
						str === ddaClass
						|| str === ddaClass2
						|| str === ddaClass3 // opera 12.16
						|| str === objectClass // IE 6-8
					) && value('') == null; // eslint-disable-line eqeqeq
				} catch (e) { /**/ }
			}
			return false;
		};
	}
}

module.exports = reflectApply
	? function isCallable(value) {
		if (isDDA(value)) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		try {
			reflectApply(value, null, badArrayLike);
		} catch (e) {
			if (e !== isCallableMarker) { return false; }
		}
		return !isES6ClassFn(value) && tryFunctionObject(value);
	}
	: function isCallable(value) {
		if (isDDA(value)) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		if (hasToStringTag) { return tryFunctionObject(value); }
		if (isES6ClassFn(value)) { return false; }
		var strClass = toStr.call(value);
		if (strClass !== fnClass && strClass !== genClass && !(/^\[object HTML/).test(strClass)) { return false; }
		return tryFunctionObject(value);
	};

},{}],27:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var fnToStr = Function.prototype.toString;
var isFnRegex = /^\s*(?:function)?\*/;
var hasToStringTag = require('has-tostringtag/shams')();
var getProto = Object.getPrototypeOf;
var getGeneratorFunc = function () { // eslint-disable-line consistent-return
	if (!hasToStringTag) {
		return false;
	}
	try {
		return Function('return function*() {}')();
	} catch (e) {
	}
};
var GeneratorFunction;

module.exports = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}
	if (isFnRegex.test(fnToStr.call(fn))) {
		return true;
	}
	if (!hasToStringTag) {
		var str = toStr.call(fn);
		return str === '[object GeneratorFunction]';
	}
	if (!getProto) {
		return false;
	}
	if (typeof GeneratorFunction === 'undefined') {
		var generatorFunc = getGeneratorFunc();
		GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false;
	}
	return getProto(fn) === GeneratorFunction;
};

},{"has-tostringtag/shams":21}],28:[function(require,module,exports){
(function (global){(function (){
'use strict';

var forEach = require('for-each');
var availableTypedArrays = require('available-typed-arrays');
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');
var hasToStringTag = require('has-tostringtag/shams')();
var gOPD = require('gopd');

var g = typeof globalThis === 'undefined' ? global : globalThis;
var typedArrays = availableTypedArrays();

var $indexOf = callBound('Array.prototype.indexOf', true) || function indexOf(array, value) {
	for (var i = 0; i < array.length; i += 1) {
		if (array[i] === value) {
			return i;
		}
	}
	return -1;
};
var $slice = callBound('String.prototype.slice');
var toStrTags = {};
var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');
if (hasToStringTag && gOPD && getPrototypeOf) {
	forEach(typedArrays, function (typedArray) {
		var arr = new g[typedArray]();
		if (Symbol.toStringTag in arr) {
			var proto = getPrototypeOf(arr);
			var descriptor = gOPD(proto, Symbol.toStringTag);
			if (!descriptor) {
				var superProto = getPrototypeOf(proto);
				descriptor = gOPD(superProto, Symbol.toStringTag);
			}
			toStrTags[typedArray] = descriptor.get;
		}
	});
}

var tryTypedArrays = function tryAllTypedArrays(value) {
	var anyTrue = false;
	forEach(toStrTags, function (getter, typedArray) {
		if (!anyTrue) {
			try {
				anyTrue = getter.call(value) === typedArray;
			} catch (e) { /**/ }
		}
	});
	return anyTrue;
};

module.exports = function isTypedArray(value) {
	if (!value || typeof value !== 'object') { return false; }
	if (!hasToStringTag || !(Symbol.toStringTag in value)) {
		var tag = $slice($toString(value), 8, -1);
		return $indexOf(typedArrays, tag) > -1;
	}
	if (!gOPD) { return false; }
	return tryTypedArrays(value);
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"available-typed-arrays":5,"call-bind/callBound":11,"for-each":14,"gopd":18,"has-tostringtag/shams":21}],29:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],30:[function(require,module,exports){
'use strict';


var TYPED_OK =  (typeof Uint8Array !== 'undefined') &&
                (typeof Uint16Array !== 'undefined') &&
                (typeof Int32Array !== 'undefined');

function _has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

exports.assign = function (obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);
  while (sources.length) {
    var source = sources.shift();
    if (!source) { continue; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be non-object');
    }

    for (var p in source) {
      if (_has(source, p)) {
        obj[p] = source[p];
      }
    }
  }

  return obj;
};


// reduce buffer size, avoiding mem copy
exports.shrinkBuf = function (buf, size) {
  if (buf.length === size) { return buf; }
  if (buf.subarray) { return buf.subarray(0, size); }
  buf.length = size;
  return buf;
};


var fnTyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    if (src.subarray && dest.subarray) {
      dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
      return;
    }
    // Fallback to ordinary array
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function (chunks) {
    var i, l, len, pos, chunk, result;

    // calculate data length
    len = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      len += chunks[i].length;
    }

    // join chunks
    result = new Uint8Array(len);
    pos = 0;
    for (i = 0, l = chunks.length; i < l; i++) {
      chunk = chunks[i];
      result.set(chunk, pos);
      pos += chunk.length;
    }

    return result;
  }
};

var fnUntyped = {
  arraySet: function (dest, src, src_offs, len, dest_offs) {
    for (var i = 0; i < len; i++) {
      dest[dest_offs + i] = src[src_offs + i];
    }
  },
  // Join array of chunks to single array.
  flattenChunks: function (chunks) {
    return [].concat.apply([], chunks);
  }
};


// Enable/Disable typed arrays use, for testing
//
exports.setTyped = function (on) {
  if (on) {
    exports.Buf8  = Uint8Array;
    exports.Buf16 = Uint16Array;
    exports.Buf32 = Int32Array;
    exports.assign(exports, fnTyped);
  } else {
    exports.Buf8  = Array;
    exports.Buf16 = Array;
    exports.Buf32 = Array;
    exports.assign(exports, fnUntyped);
  }
};

exports.setTyped(TYPED_OK);

},{}],31:[function(require,module,exports){
'use strict';

// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It isn't worth it to make additional optimizations as in original.
// Small size is preferable.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function adler32(adler, buf, len, pos) {
  var s1 = (adler & 0xffff) |0,
      s2 = ((adler >>> 16) & 0xffff) |0,
      n = 0;

  while (len !== 0) {
    // Set limit ~ twice less than 5552, to keep
    // s2 in 31-bits, because we force signed ints.
    // in other case %= will fail.
    n = len > 2000 ? 2000 : len;
    len -= n;

    do {
      s1 = (s1 + buf[pos++]) |0;
      s2 = (s2 + s1) |0;
    } while (--n);

    s1 %= 65521;
    s2 %= 65521;
  }

  return (s1 | (s2 << 16)) |0;
}


module.exports = adler32;

},{}],32:[function(require,module,exports){
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

module.exports = {

  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH:         0,
  Z_PARTIAL_FLUSH:    1,
  Z_SYNC_FLUSH:       2,
  Z_FULL_FLUSH:       3,
  Z_FINISH:           4,
  Z_BLOCK:            5,
  Z_TREES:            6,

  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK:               0,
  Z_STREAM_END:       1,
  Z_NEED_DICT:        2,
  Z_ERRNO:           -1,
  Z_STREAM_ERROR:    -2,
  Z_DATA_ERROR:      -3,
  //Z_MEM_ERROR:     -4,
  Z_BUF_ERROR:       -5,
  //Z_VERSION_ERROR: -6,

  /* compression levels */
  Z_NO_COMPRESSION:         0,
  Z_BEST_SPEED:             1,
  Z_BEST_COMPRESSION:       9,
  Z_DEFAULT_COMPRESSION:   -1,


  Z_FILTERED:               1,
  Z_HUFFMAN_ONLY:           2,
  Z_RLE:                    3,
  Z_FIXED:                  4,
  Z_DEFAULT_STRATEGY:       0,

  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY:                 0,
  Z_TEXT:                   1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN:                2,

  /* The deflate compression method */
  Z_DEFLATED:               8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};

},{}],33:[function(require,module,exports){
'use strict';

// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// Use ordinary array, since untyped makes no boost here
function makeTable() {
  var c, table = [];

  for (var n = 0; n < 256; n++) {
    c = n;
    for (var k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[n] = c;
  }

  return table;
}

// Create table on load. Just 255 signed longs. Not a problem.
var crcTable = makeTable();


function crc32(crc, buf, len, pos) {
  var t = crcTable,
      end = pos + len;

  crc ^= -1;

  for (var i = pos; i < end; i++) {
    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
  }

  return (crc ^ (-1)); // >>> 0;
}


module.exports = crc32;

},{}],34:[function(require,module,exports){
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils   = require('../utils/common');
var trees   = require('./trees');
var adler32 = require('./adler32');
var crc32   = require('./crc32');
var msg     = require('./messages');

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
var Z_NO_FLUSH      = 0;
var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
//var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
//var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
//var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;


/* compression levels */
//var Z_NO_COMPRESSION      = 0;
//var Z_BEST_SPEED          = 1;
//var Z_BEST_COMPRESSION    = 9;
var Z_DEFAULT_COMPRESSION = -1;


var Z_FILTERED            = 1;
var Z_HUFFMAN_ONLY        = 2;
var Z_RLE                 = 3;
var Z_FIXED               = 4;
var Z_DEFAULT_STRATEGY    = 0;

/* Possible values of the data_type field (though see inflate()) */
//var Z_BINARY              = 0;
//var Z_TEXT                = 1;
//var Z_ASCII               = 1; // = Z_TEXT
var Z_UNKNOWN             = 2;


/* The deflate compression method */
var Z_DEFLATED  = 8;

/*============================================================================*/


var MAX_MEM_LEVEL = 9;
/* Maximum value for memLevel in deflateInit2 */
var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_MEM_LEVEL = 8;


var LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */
var LITERALS      = 256;
/* number of literal bytes 0..255 */
var L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */
var D_CODES       = 30;
/* number of distance codes */
var BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */
var HEAP_SIZE     = 2 * L_CODES + 1;
/* maximum heap size */
var MAX_BITS  = 15;
/* All codes must not exceed MAX_BITS bits */

var MIN_MATCH = 3;
var MAX_MATCH = 258;
var MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

var PRESET_DICT = 0x20;

var INIT_STATE = 42;
var EXTRA_STATE = 69;
var NAME_STATE = 73;
var COMMENT_STATE = 91;
var HCRC_STATE = 103;
var BUSY_STATE = 113;
var FINISH_STATE = 666;

var BS_NEED_MORE      = 1; /* block not completed, need more input or more output */
var BS_BLOCK_DONE     = 2; /* block flush performed */
var BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
var BS_FINISH_DONE    = 4; /* finish done, accept no more input or output */

var OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

function err(strm, errorCode) {
  strm.msg = msg[errorCode];
  return errorCode;
}

function rank(f) {
  return ((f) << 1) - ((f) > 4 ? 9 : 0);
}

function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }


/* =========================================================================
 * Flush as much pending output as possible. All deflate() output goes
 * through this function so some applications may wish to modify it
 * to avoid allocating a large strm->output buffer and copying into it.
 * (See also read_buf()).
 */
function flush_pending(strm) {
  var s = strm.state;

  //_tr_flush_bits(s);
  var len = s.pending;
  if (len > strm.avail_out) {
    len = strm.avail_out;
  }
  if (len === 0) { return; }

  utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
  strm.next_out += len;
  s.pending_out += len;
  strm.total_out += len;
  strm.avail_out -= len;
  s.pending -= len;
  if (s.pending === 0) {
    s.pending_out = 0;
  }
}


function flush_block_only(s, last) {
  trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
  s.block_start = s.strstart;
  flush_pending(s.strm);
}


function put_byte(s, b) {
  s.pending_buf[s.pending++] = b;
}


/* =========================================================================
 * Put a short in the pending buffer. The 16-bit value is put in MSB order.
 * IN assertion: the stream state is correct and there is enough room in
 * pending_buf.
 */
function putShortMSB(s, b) {
//  put_byte(s, (Byte)(b >> 8));
//  put_byte(s, (Byte)(b & 0xff));
  s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
  s.pending_buf[s.pending++] = b & 0xff;
}


/* ===========================================================================
 * Read a new buffer from the current input stream, update the adler32
 * and total number of bytes read.  All deflate() input goes through
 * this function so some applications may wish to modify it to avoid
 * allocating a large strm->input buffer and copying from it.
 * (See also flush_pending()).
 */
function read_buf(strm, buf, start, size) {
  var len = strm.avail_in;

  if (len > size) { len = size; }
  if (len === 0) { return 0; }

  strm.avail_in -= len;

  // zmemcpy(buf, strm->next_in, len);
  utils.arraySet(buf, strm.input, strm.next_in, len, start);
  if (strm.state.wrap === 1) {
    strm.adler = adler32(strm.adler, buf, len, start);
  }

  else if (strm.state.wrap === 2) {
    strm.adler = crc32(strm.adler, buf, len, start);
  }

  strm.next_in += len;
  strm.total_in += len;

  return len;
}


/* ===========================================================================
 * Set match_start to the longest match starting at the given string and
 * return its length. Matches shorter or equal to prev_length are discarded,
 * in which case the result is equal to prev_length and match_start is
 * garbage.
 * IN assertions: cur_match is the head of the hash chain for the current
 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
 * OUT assertion: the match length is not greater than s->lookahead.
 */
function longest_match(s, cur_match) {
  var chain_length = s.max_chain_length;      /* max hash chain length */
  var scan = s.strstart; /* current string */
  var match;                       /* matched string */
  var len;                           /* length of current match */
  var best_len = s.prev_length;              /* best match length so far */
  var nice_match = s.nice_match;             /* stop if match long enough */
  var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

  var _win = s.window; // shortcut

  var wmask = s.w_mask;
  var prev  = s.prev;

  /* Stop when cur_match becomes <= limit. To simplify the code,
   * we prevent matches with the string of window index 0.
   */

  var strend = s.strstart + MAX_MATCH;
  var scan_end1  = _win[scan + best_len - 1];
  var scan_end   = _win[scan + best_len];

  /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
   * It is easy to get rid of this optimization if necessary.
   */
  // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

  /* Do not waste too much time if we already have a good match: */
  if (s.prev_length >= s.good_match) {
    chain_length >>= 2;
  }
  /* Do not look for matches beyond the end of the input. This is necessary
   * to make deflate deterministic.
   */
  if (nice_match > s.lookahead) { nice_match = s.lookahead; }

  // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

  do {
    // Assert(cur_match < s->strstart, "no future");
    match = cur_match;

    /* Skip to next match if the match length cannot increase
     * or if the match length is less than 2.  Note that the checks below
     * for insufficient lookahead only occur occasionally for performance
     * reasons.  Therefore uninitialized memory will be accessed, and
     * conditional jumps will be made that depend on those values.
     * However the length of the match is limited to the lookahead, so
     * the output of deflate is not affected by the uninitialized values.
     */

    if (_win[match + best_len]     !== scan_end  ||
        _win[match + best_len - 1] !== scan_end1 ||
        _win[match]                !== _win[scan] ||
        _win[++match]              !== _win[scan + 1]) {
      continue;
    }

    /* The check at best_len-1 can be removed because it will be made
     * again later. (This heuristic is not always a win.)
     * It is not necessary to compare scan[2] and match[2] since they
     * are always equal when the other bytes match, given that
     * the hash keys are equal and that HASH_BITS >= 8.
     */
    scan += 2;
    match++;
    // Assert(*scan == *match, "match[2]?");

    /* We check for insufficient lookahead only every 8th comparison;
     * the 256th check will be made at strstart+258.
     */
    do {
      /*jshint noempty:false*/
    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
             scan < strend);

    // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

    len = MAX_MATCH - (strend - scan);
    scan = strend - MAX_MATCH;

    if (len > best_len) {
      s.match_start = cur_match;
      best_len = len;
      if (len >= nice_match) {
        break;
      }
      scan_end1  = _win[scan + best_len - 1];
      scan_end   = _win[scan + best_len];
    }
  } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

  if (best_len <= s.lookahead) {
    return best_len;
  }
  return s.lookahead;
}


/* ===========================================================================
 * Fill the window when the lookahead becomes insufficient.
 * Updates strstart and lookahead.
 *
 * IN assertion: lookahead < MIN_LOOKAHEAD
 * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
 *    At least one byte has been read, or avail_in == 0; reads are
 *    performed for at least two bytes (required for the zip translate_eol
 *    option -- not supported here).
 */
function fill_window(s) {
  var _w_size = s.w_size;
  var p, n, m, more, str;

  //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

  do {
    more = s.window_size - s.lookahead - s.strstart;

    // JS ints have 32 bit, block below not needed
    /* Deal with !@#$% 64K limit: */
    //if (sizeof(int) <= 2) {
    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
    //        more = wsize;
    //
    //  } else if (more == (unsigned)(-1)) {
    //        /* Very unlikely, but possible on 16 bit machine if
    //         * strstart == 0 && lookahead == 1 (input done a byte at time)
    //         */
    //        more--;
    //    }
    //}


    /* If the window is almost full and there is insufficient lookahead,
     * move the upper half to the lower one to make room in the upper half.
     */
    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

      utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
      s.match_start -= _w_size;
      s.strstart -= _w_size;
      /* we now have strstart >= MAX_DIST */
      s.block_start -= _w_size;

      /* Slide the hash table (could be avoided with 32 bit values
       at the expense of memory usage). We slide even when level == 0
       to keep the hash table consistent if we switch back to level > 0
       later. (Using level 0 permanently is not an optimal usage of
       zlib, so we don't care about this pathological case.)
       */

      n = s.hash_size;
      p = n;
      do {
        m = s.head[--p];
        s.head[p] = (m >= _w_size ? m - _w_size : 0);
      } while (--n);

      n = _w_size;
      p = n;
      do {
        m = s.prev[--p];
        s.prev[p] = (m >= _w_size ? m - _w_size : 0);
        /* If n is not on any hash chain, prev[n] is garbage but
         * its value will never be used.
         */
      } while (--n);

      more += _w_size;
    }
    if (s.strm.avail_in === 0) {
      break;
    }

    /* If there was no sliding:
     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
     *    more == window_size - lookahead - strstart
     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
     * => more >= window_size - 2*WSIZE + 2
     * In the BIG_MEM or MMAP case (not yet supported),
     *   window_size == input_size + MIN_LOOKAHEAD  &&
     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
     * Otherwise, window_size == 2*WSIZE so more >= 2.
     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
     */
    //Assert(more >= 2, "more < 2");
    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
    s.lookahead += n;

    /* Initialize the hash value now that we have some input: */
    if (s.lookahead + s.insert >= MIN_MATCH) {
      str = s.strstart - s.insert;
      s.ins_h = s.window[str];

      /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
//#if MIN_MATCH != 3
//        Call update_hash() MIN_MATCH-3 more times
//#endif
      while (s.insert) {
        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

        s.prev[str & s.w_mask] = s.head[s.ins_h];
        s.head[s.ins_h] = str;
        str++;
        s.insert--;
        if (s.lookahead + s.insert < MIN_MATCH) {
          break;
        }
      }
    }
    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
     * but this is not important since only literal bytes will be emitted.
     */

  } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

  /* If the WIN_INIT bytes after the end of the current data have never been
   * written, then zero those bytes in order to avoid memory check reports of
   * the use of uninitialized (or uninitialised as Julian writes) bytes by
   * the longest match routines.  Update the high water mark for the next
   * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
   * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
   */
//  if (s.high_water < s.window_size) {
//    var curr = s.strstart + s.lookahead;
//    var init = 0;
//
//    if (s.high_water < curr) {
//      /* Previous high water mark below current data -- zero WIN_INIT
//       * bytes or up to end of window, whichever is less.
//       */
//      init = s.window_size - curr;
//      if (init > WIN_INIT)
//        init = WIN_INIT;
//      zmemzero(s->window + curr, (unsigned)init);
//      s->high_water = curr + init;
//    }
//    else if (s->high_water < (ulg)curr + WIN_INIT) {
//      /* High water mark at or above current data, but below current data
//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
//       * to end of window, whichever is less.
//       */
//      init = (ulg)curr + WIN_INIT - s->high_water;
//      if (init > s->window_size - s->high_water)
//        init = s->window_size - s->high_water;
//      zmemzero(s->window + s->high_water, (unsigned)init);
//      s->high_water += init;
//    }
//  }
//
//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
//    "not enough room for search");
}

/* ===========================================================================
 * Copy without compression as much as possible from the input stream, return
 * the current block state.
 * This function does not insert new strings in the dictionary since
 * uncompressible data is probably not useful. This function is used
 * only for the level=0 compression option.
 * NOTE: this function should be optimized to avoid extra copying from
 * window to pending_buf.
 */
function deflate_stored(s, flush) {
  /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
   * to pending_buf_size, and each stored block has a 5 byte header:
   */
  var max_block_size = 0xffff;

  if (max_block_size > s.pending_buf_size - 5) {
    max_block_size = s.pending_buf_size - 5;
  }

  /* Copy as much as possible from input to output: */
  for (;;) {
    /* Fill the window as much as possible: */
    if (s.lookahead <= 1) {

      //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
      //  s->block_start >= (long)s->w_size, "slide too late");
//      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
//        s.block_start >= s.w_size)) {
//        throw  new Error("slide too late");
//      }

      fill_window(s);
      if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }

      if (s.lookahead === 0) {
        break;
      }
      /* flush the current block */
    }
    //Assert(s->block_start >= 0L, "block gone");
//    if (s.block_start < 0) throw new Error("block gone");

    s.strstart += s.lookahead;
    s.lookahead = 0;

    /* Emit a stored block if pending_buf will be full: */
    var max_start = s.block_start + max_block_size;

    if (s.strstart === 0 || s.strstart >= max_start) {
      /* strstart == 0 is possible when wraparound on 16-bit machine */
      s.lookahead = s.strstart - max_start;
      s.strstart = max_start;
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/


    }
    /* Flush if we may have to slide, otherwise block_start may become
     * negative and the data will be gone:
     */
    if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }

  s.insert = 0;

  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }

  if (s.strstart > s.block_start) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_NEED_MORE;
}

/* ===========================================================================
 * Compress as much as possible from the input stream, return the current
 * block state.
 * This function does not perform lazy evaluation of matches and inserts
 * new strings in the dictionary only for unmatched strings or for short
 * matches. It is used only for the fast compression options.
 */
function deflate_fast(s, flush) {
  var hash_head;        /* head of the hash chain */
  var bflush;           /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) {
        break; /* flush the current block */
      }
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     * At this point we have always match_length < MIN_MATCH
     */
    if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */
    }
    if (s.match_length >= MIN_MATCH) {
      // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

      /*** _tr_tally_dist(s, s.strstart - s.match_start,
                     s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;

      /* Insert new strings in the hash table only if the match length
       * is not too large. This saves time but degrades compression.
       */
      if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
        s.match_length--; /* string at strstart already in table */
        do {
          s.strstart++;
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
          /* strstart never exceeds WSIZE-MAX_MATCH, so there are
           * always MIN_MATCH bytes ahead.
           */
        } while (--s.match_length !== 0);
        s.strstart++;
      } else
      {
        s.strstart += s.match_length;
        s.match_length = 0;
        s.ins_h = s.window[s.strstart];
        /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;

//#if MIN_MATCH != 3
//                Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif
        /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
         * matter since it will be recomputed at next deflate call.
         */
      }
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s.window[s.strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * Same as above, but achieves better compression. We use a lazy
 * evaluation for matches: a match is finally adopted only if there is
 * no better match at the next window position.
 */
function deflate_slow(s, flush) {
  var hash_head;          /* head of hash chain */
  var bflush;              /* set if current block must be flushed */

  var max_insert;

  /* Process the input block. */
  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the next match, plus MIN_MATCH bytes to insert the
     * string following the next match.
     */
    if (s.lookahead < MIN_LOOKAHEAD) {
      fill_window(s);
      if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* Insert the string window[strstart .. strstart+2] in the
     * dictionary, and set hash_head to the head of the hash chain:
     */
    hash_head = 0/*NIL*/;
    if (s.lookahead >= MIN_MATCH) {
      /*** INSERT_STRING(s, s.strstart, hash_head); ***/
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
      hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
      s.head[s.ins_h] = s.strstart;
      /***/
    }

    /* Find the longest match, discarding those <= prev_length.
     */
    s.prev_length = s.match_length;
    s.prev_match = s.match_start;
    s.match_length = MIN_MATCH - 1;

    if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
        s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
      /* To simplify the code, we prevent matches with the string
       * of window index 0 (in particular we have to avoid a match
       * of the string with itself at the start of the input file).
       */
      s.match_length = longest_match(s, hash_head);
      /* longest_match() sets match_start */

      if (s.match_length <= 5 &&
         (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

        /* If prev_match is also MIN_MATCH, match_start is garbage
         * but we will ignore the current match anyway.
         */
        s.match_length = MIN_MATCH - 1;
      }
    }
    /* If there was a match at the previous step and the current
     * match is not better, output the previous match:
     */
    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
      max_insert = s.strstart + s.lookahead - MIN_MATCH;
      /* Do not insert strings in hash table beyond this. */

      //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

      /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                     s.prev_length - MIN_MATCH, bflush);***/
      bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
      /* Insert in hash table all strings up to the end of the match.
       * strstart-1 and strstart are already inserted. If there is not
       * enough lookahead, the last two strings are not inserted in
       * the hash table.
       */
      s.lookahead -= s.prev_length - 1;
      s.prev_length -= 2;
      do {
        if (++s.strstart <= max_insert) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }
      } while (--s.prev_length !== 0);
      s.match_available = 0;
      s.match_length = MIN_MATCH - 1;
      s.strstart++;

      if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }

    } else if (s.match_available) {
      /* If there was no match at the previous position, output a
       * single literal. If there was a match but the current match
       * is longer, truncate the previous match to a single literal.
       */
      //Tracevv((stderr,"%c", s->window[s->strstart-1]));
      /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

      if (bflush) {
        /*** FLUSH_BLOCK_ONLY(s, 0) ***/
        flush_block_only(s, false);
        /***/
      }
      s.strstart++;
      s.lookahead--;
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
    } else {
      /* There is no previous match to compare with, wait for
       * the next step to decide.
       */
      s.match_available = 1;
      s.strstart++;
      s.lookahead--;
    }
  }
  //Assert (flush != Z_NO_FLUSH, "no flush?");
  if (s.match_available) {
    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

    s.match_available = 0;
  }
  s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }

  return BS_BLOCK_DONE;
}


/* ===========================================================================
 * For Z_RLE, simply look for runs of bytes, generate matches only of distance
 * one.  Do not maintain a hash table.  (It will be regenerated if this run of
 * deflate switches away from Z_RLE.)
 */
function deflate_rle(s, flush) {
  var bflush;            /* set if current block must be flushed */
  var prev;              /* byte at distance one to match */
  var scan, strend;      /* scan goes up to strend for length of run */

  var _win = s.window;

  for (;;) {
    /* Make sure that we always have enough lookahead, except
     * at the end of the input file. We need MAX_MATCH bytes
     * for the longest run, plus one for the unrolled loop.
     */
    if (s.lookahead <= MAX_MATCH) {
      fill_window(s);
      if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
        return BS_NEED_MORE;
      }
      if (s.lookahead === 0) { break; } /* flush the current block */
    }

    /* See how many times the previous byte repeats */
    s.match_length = 0;
    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
      scan = s.strstart - 1;
      prev = _win[scan];
      if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
        strend = s.strstart + MAX_MATCH;
        do {
          /*jshint noempty:false*/
        } while (prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 prev === _win[++scan] && prev === _win[++scan] &&
                 scan < strend);
        s.match_length = MAX_MATCH - (strend - scan);
        if (s.match_length > s.lookahead) {
          s.match_length = s.lookahead;
        }
      }
      //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
    }

    /* Emit match if have run of MIN_MATCH or longer, else emit literal */
    if (s.match_length >= MIN_MATCH) {
      //check_match(s, s.strstart, s.strstart - 1, s.match_length);

      /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
      bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);

      s.lookahead -= s.match_length;
      s.strstart += s.match_length;
      s.match_length = 0;
    } else {
      /* No match, output a literal byte */
      //Tracevv((stderr,"%c", s->window[s->strstart]));
      /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
      bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

      s.lookahead--;
      s.strstart++;
    }
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* ===========================================================================
 * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
 * (It will be regenerated if this run of deflate switches away from Huffman.)
 */
function deflate_huff(s, flush) {
  var bflush;             /* set if current block must be flushed */

  for (;;) {
    /* Make sure that we have a literal to write. */
    if (s.lookahead === 0) {
      fill_window(s);
      if (s.lookahead === 0) {
        if (flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
        break;      /* flush the current block */
      }
    }

    /* Output a literal byte */
    s.match_length = 0;
    //Tracevv((stderr,"%c", s->window[s->strstart]));
    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
    bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
    s.lookahead--;
    s.strstart++;
    if (bflush) {
      /*** FLUSH_BLOCK(s, 0); ***/
      flush_block_only(s, false);
      if (s.strm.avail_out === 0) {
        return BS_NEED_MORE;
      }
      /***/
    }
  }
  s.insert = 0;
  if (flush === Z_FINISH) {
    /*** FLUSH_BLOCK(s, 1); ***/
    flush_block_only(s, true);
    if (s.strm.avail_out === 0) {
      return BS_FINISH_STARTED;
    }
    /***/
    return BS_FINISH_DONE;
  }
  if (s.last_lit) {
    /*** FLUSH_BLOCK(s, 0); ***/
    flush_block_only(s, false);
    if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
    /***/
  }
  return BS_BLOCK_DONE;
}

/* Values for max_lazy_match, good_match and max_chain_length, depending on
 * the desired pack level (0..9). The values given below have been tuned to
 * exclude worst case performance for pathological files. Better values may be
 * found for specific files.
 */
function Config(good_length, max_lazy, nice_length, max_chain, func) {
  this.good_length = good_length;
  this.max_lazy = max_lazy;
  this.nice_length = nice_length;
  this.max_chain = max_chain;
  this.func = func;
}

var configuration_table;

configuration_table = [
  /*      good lazy nice chain */
  new Config(0, 0, 0, 0, deflate_stored),          /* 0 store only */
  new Config(4, 4, 8, 4, deflate_fast),            /* 1 max speed, no lazy matches */
  new Config(4, 5, 16, 8, deflate_fast),           /* 2 */
  new Config(4, 6, 32, 32, deflate_fast),          /* 3 */

  new Config(4, 4, 16, 16, deflate_slow),          /* 4 lazy matches */
  new Config(8, 16, 32, 32, deflate_slow),         /* 5 */
  new Config(8, 16, 128, 128, deflate_slow),       /* 6 */
  new Config(8, 32, 128, 256, deflate_slow),       /* 7 */
  new Config(32, 128, 258, 1024, deflate_slow),    /* 8 */
  new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
];


/* ===========================================================================
 * Initialize the "longest match" routines for a new zlib stream
 */
function lm_init(s) {
  s.window_size = 2 * s.w_size;

  /*** CLEAR_HASH(s); ***/
  zero(s.head); // Fill with NIL (= 0);

  /* Set the default configuration parameters:
   */
  s.max_lazy_match = configuration_table[s.level].max_lazy;
  s.good_match = configuration_table[s.level].good_length;
  s.nice_match = configuration_table[s.level].nice_length;
  s.max_chain_length = configuration_table[s.level].max_chain;

  s.strstart = 0;
  s.block_start = 0;
  s.lookahead = 0;
  s.insert = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  s.ins_h = 0;
}


function DeflateState() {
  this.strm = null;            /* pointer back to this zlib stream */
  this.status = 0;            /* as the name implies */
  this.pending_buf = null;      /* output still pending */
  this.pending_buf_size = 0;  /* size of pending_buf */
  this.pending_out = 0;       /* next pending byte to output to the stream */
  this.pending = 0;           /* nb of bytes in the pending buffer */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.gzhead = null;         /* gzip header information to write */
  this.gzindex = 0;           /* where in extra, name, or comment */
  this.method = Z_DEFLATED; /* can only be DEFLATED */
  this.last_flush = -1;   /* value of flush param for previous deflate call */

  this.w_size = 0;  /* LZ77 window size (32K by default) */
  this.w_bits = 0;  /* log2(w_size)  (8..16) */
  this.w_mask = 0;  /* w_size - 1 */

  this.window = null;
  /* Sliding window. Input bytes are read into the second half of the window,
   * and move to the first half later to keep a dictionary of at least wSize
   * bytes. With this organization, matches are limited to a distance of
   * wSize-MAX_MATCH bytes, but this ensures that IO is always
   * performed with a length multiple of the block size.
   */

  this.window_size = 0;
  /* Actual size of window: 2*wSize, except when the user input buffer
   * is directly used as sliding window.
   */

  this.prev = null;
  /* Link to older string with same hash index. To limit the size of this
   * array to 64K, this link is maintained only for the last 32K strings.
   * An index in this array is thus a window index modulo 32K.
   */

  this.head = null;   /* Heads of the hash chains or NIL. */

  this.ins_h = 0;       /* hash index of string to be inserted */
  this.hash_size = 0;   /* number of elements in hash table */
  this.hash_bits = 0;   /* log2(hash_size) */
  this.hash_mask = 0;   /* hash_size-1 */

  this.hash_shift = 0;
  /* Number of bits by which ins_h must be shifted at each input
   * step. It must be such that after MIN_MATCH steps, the oldest
   * byte no longer takes part in the hash key, that is:
   *   hash_shift * MIN_MATCH >= hash_bits
   */

  this.block_start = 0;
  /* Window position at the beginning of the current output block. Gets
   * negative when the window is moved backwards.
   */

  this.match_length = 0;      /* length of best match */
  this.prev_match = 0;        /* previous match */
  this.match_available = 0;   /* set if previous match exists */
  this.strstart = 0;          /* start of string to insert */
  this.match_start = 0;       /* start of matching string */
  this.lookahead = 0;         /* number of valid bytes ahead in window */

  this.prev_length = 0;
  /* Length of the best match at previous step. Matches not greater than this
   * are discarded. This is used in the lazy match evaluation.
   */

  this.max_chain_length = 0;
  /* To speed up deflation, hash chains are never searched beyond this
   * length.  A higher limit improves compression ratio but degrades the
   * speed.
   */

  this.max_lazy_match = 0;
  /* Attempt to find a better match only when the current match is strictly
   * smaller than this value. This mechanism is used only for compression
   * levels >= 4.
   */
  // That's alias to max_lazy_match, don't use directly
  //this.max_insert_length = 0;
  /* Insert new strings in the hash table only if the match length is not
   * greater than this length. This saves time but degrades compression.
   * max_insert_length is used only for compression levels <= 3.
   */

  this.level = 0;     /* compression level (1..9) */
  this.strategy = 0;  /* favor or force Huffman coding*/

  this.good_match = 0;
  /* Use a faster search when the previous match is longer than this */

  this.nice_match = 0; /* Stop searching when current match exceeds this */

              /* used by trees.c: */

  /* Didn't use ct_data typedef below to suppress compiler warning */

  // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
  // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
  // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

  // Use flat array of DOUBLE size, with interleaved fata,
  // because JS does not support effective
  this.dyn_ltree  = new utils.Buf16(HEAP_SIZE * 2);
  this.dyn_dtree  = new utils.Buf16((2 * D_CODES + 1) * 2);
  this.bl_tree    = new utils.Buf16((2 * BL_CODES + 1) * 2);
  zero(this.dyn_ltree);
  zero(this.dyn_dtree);
  zero(this.bl_tree);

  this.l_desc   = null;         /* desc. for literal tree */
  this.d_desc   = null;         /* desc. for distance tree */
  this.bl_desc  = null;         /* desc. for bit length tree */

  //ush bl_count[MAX_BITS+1];
  this.bl_count = new utils.Buf16(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
  this.heap = new utils.Buf16(2 * L_CODES + 1);  /* heap used to build the Huffman trees */
  zero(this.heap);

  this.heap_len = 0;               /* number of elements in the heap */
  this.heap_max = 0;               /* element of largest frequency */
  /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
   * The same heap array is used to build all trees.
   */

  this.depth = new utils.Buf16(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
  zero(this.depth);
  /* Depth of each subtree used as tie breaker for trees of equal frequency
   */

  this.l_buf = 0;          /* buffer index for literals or lengths */

  this.lit_bufsize = 0;
  /* Size of match buffer for literals/lengths.  There are 4 reasons for
   * limiting lit_bufsize to 64K:
   *   - frequencies can be kept in 16 bit counters
   *   - if compression is not successful for the first block, all input
   *     data is still in the window so we can still emit a stored block even
   *     when input comes from standard input.  (This can also be done for
   *     all blocks if lit_bufsize is not greater than 32K.)
   *   - if compression is not successful for a file smaller than 64K, we can
   *     even emit a stored file instead of a stored block (saving 5 bytes).
   *     This is applicable only for zip (not gzip or zlib).
   *   - creating new Huffman trees less frequently may not provide fast
   *     adaptation to changes in the input data statistics. (Take for
   *     example a binary file with poorly compressible code followed by
   *     a highly compressible string table.) Smaller buffer sizes give
   *     fast adaptation but have of course the overhead of transmitting
   *     trees more frequently.
   *   - I can't count above 4
   */

  this.last_lit = 0;      /* running index in l_buf */

  this.d_buf = 0;
  /* Buffer index for distances. To simplify the code, d_buf and l_buf have
   * the same number of elements. To use different lengths, an extra flag
   * array would be necessary.
   */

  this.opt_len = 0;       /* bit length of current block with optimal trees */
  this.static_len = 0;    /* bit length of current block with static trees */
  this.matches = 0;       /* number of string matches in current block */
  this.insert = 0;        /* bytes at end of window left to insert */


  this.bi_buf = 0;
  /* Output buffer. bits are inserted starting at the bottom (least
   * significant bits).
   */
  this.bi_valid = 0;
  /* Number of valid bits in bi_buf.  All bits above the last valid bit
   * are always zero.
   */

  // Used for window memory init. We safely ignore it for JS. That makes
  // sense only for pointers and memory check tools.
  //this.high_water = 0;
  /* High water mark offset in window for initialized bytes -- bytes above
   * this are set to zero in order to avoid memory check warnings when
   * longest match routines access bytes past the input.  This is then
   * updated to the new high water mark.
   */
}


function deflateResetKeep(strm) {
  var s;

  if (!strm || !strm.state) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.total_in = strm.total_out = 0;
  strm.data_type = Z_UNKNOWN;

  s = strm.state;
  s.pending = 0;
  s.pending_out = 0;

  if (s.wrap < 0) {
    s.wrap = -s.wrap;
    /* was made negative by deflate(..., Z_FINISH); */
  }
  s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
  strm.adler = (s.wrap === 2) ?
    0  // crc32(0, Z_NULL, 0)
  :
    1; // adler32(0, Z_NULL, 0)
  s.last_flush = Z_NO_FLUSH;
  trees._tr_init(s);
  return Z_OK;
}


function deflateReset(strm) {
  var ret = deflateResetKeep(strm);
  if (ret === Z_OK) {
    lm_init(strm.state);
  }
  return ret;
}


function deflateSetHeader(strm, head) {
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  if (strm.state.wrap !== 2) { return Z_STREAM_ERROR; }
  strm.state.gzhead = head;
  return Z_OK;
}


function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
  if (!strm) { // === Z_NULL
    return Z_STREAM_ERROR;
  }
  var wrap = 1;

  if (level === Z_DEFAULT_COMPRESSION) {
    level = 6;
  }

  if (windowBits < 0) { /* suppress zlib wrapper */
    wrap = 0;
    windowBits = -windowBits;
  }

  else if (windowBits > 15) {
    wrap = 2;           /* write gzip wrapper instead */
    windowBits -= 16;
  }


  if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||
    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
    strategy < 0 || strategy > Z_FIXED) {
    return err(strm, Z_STREAM_ERROR);
  }


  if (windowBits === 8) {
    windowBits = 9;
  }
  /* until 256-byte window bug fixed */

  var s = new DeflateState();

  strm.state = s;
  s.strm = strm;

  s.wrap = wrap;
  s.gzhead = null;
  s.w_bits = windowBits;
  s.w_size = 1 << s.w_bits;
  s.w_mask = s.w_size - 1;

  s.hash_bits = memLevel + 7;
  s.hash_size = 1 << s.hash_bits;
  s.hash_mask = s.hash_size - 1;
  s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

  s.window = new utils.Buf8(s.w_size * 2);
  s.head = new utils.Buf16(s.hash_size);
  s.prev = new utils.Buf16(s.w_size);

  // Don't need mem init magic for JS.
  //s.high_water = 0;  /* nothing written to s->window yet */

  s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

  s.pending_buf_size = s.lit_bufsize * 4;

  //overlay = (ushf *) ZALLOC(strm, s->lit_bufsize, sizeof(ush)+2);
  //s->pending_buf = (uchf *) overlay;
  s.pending_buf = new utils.Buf8(s.pending_buf_size);

  // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
  //s->d_buf = overlay + s->lit_bufsize/sizeof(ush);
  s.d_buf = 1 * s.lit_bufsize;

  //s->l_buf = s->pending_buf + (1+sizeof(ush))*s->lit_bufsize;
  s.l_buf = (1 + 2) * s.lit_bufsize;

  s.level = level;
  s.strategy = strategy;
  s.method = method;

  return deflateReset(strm);
}

function deflateInit(strm, level) {
  return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
}


function deflate(strm, flush) {
  var old_flush, s;
  var beg, val; // for gzip header write only

  if (!strm || !strm.state ||
    flush > Z_BLOCK || flush < 0) {
    return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
  }

  s = strm.state;

  if (!strm.output ||
      (!strm.input && strm.avail_in !== 0) ||
      (s.status === FINISH_STATE && flush !== Z_FINISH)) {
    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
  }

  s.strm = strm; /* just in case */
  old_flush = s.last_flush;
  s.last_flush = flush;

  /* Write the header */
  if (s.status === INIT_STATE) {

    if (s.wrap === 2) { // GZIP header
      strm.adler = 0;  //crc32(0L, Z_NULL, 0);
      put_byte(s, 31);
      put_byte(s, 139);
      put_byte(s, 8);
      if (!s.gzhead) { // s->gzhead == Z_NULL
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, 0);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, OS_CODE);
        s.status = BUSY_STATE;
      }
      else {
        put_byte(s, (s.gzhead.text ? 1 : 0) +
                    (s.gzhead.hcrc ? 2 : 0) +
                    (!s.gzhead.extra ? 0 : 4) +
                    (!s.gzhead.name ? 0 : 8) +
                    (!s.gzhead.comment ? 0 : 16)
        );
        put_byte(s, s.gzhead.time & 0xff);
        put_byte(s, (s.gzhead.time >> 8) & 0xff);
        put_byte(s, (s.gzhead.time >> 16) & 0xff);
        put_byte(s, (s.gzhead.time >> 24) & 0xff);
        put_byte(s, s.level === 9 ? 2 :
                    (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                     4 : 0));
        put_byte(s, s.gzhead.os & 0xff);
        if (s.gzhead.extra && s.gzhead.extra.length) {
          put_byte(s, s.gzhead.extra.length & 0xff);
          put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
        }
        if (s.gzhead.hcrc) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
        }
        s.gzindex = 0;
        s.status = EXTRA_STATE;
      }
    }
    else // DEFLATE header
    {
      var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
      var level_flags = -1;

      if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
        level_flags = 0;
      } else if (s.level < 6) {
        level_flags = 1;
      } else if (s.level === 6) {
        level_flags = 2;
      } else {
        level_flags = 3;
      }
      header |= (level_flags << 6);
      if (s.strstart !== 0) { header |= PRESET_DICT; }
      header += 31 - (header % 31);

      s.status = BUSY_STATE;
      putShortMSB(s, header);

      /* Save the adler32 of the preset dictionary: */
      if (s.strstart !== 0) {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 0xffff);
      }
      strm.adler = 1; // adler32(0L, Z_NULL, 0);
    }
  }

//#ifdef GZIP
  if (s.status === EXTRA_STATE) {
    if (s.gzhead.extra/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */

      while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            break;
          }
        }
        put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
        s.gzindex++;
      }
      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (s.gzindex === s.gzhead.extra.length) {
        s.gzindex = 0;
        s.status = NAME_STATE;
      }
    }
    else {
      s.status = NAME_STATE;
    }
  }
  if (s.status === NAME_STATE) {
    if (s.gzhead.name/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.name.length) {
          val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.gzindex = 0;
        s.status = COMMENT_STATE;
      }
    }
    else {
      s.status = COMMENT_STATE;
    }
  }
  if (s.status === COMMENT_STATE) {
    if (s.gzhead.comment/* != Z_NULL*/) {
      beg = s.pending;  /* start of bytes to update crc */
      //int val;

      do {
        if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          flush_pending(strm);
          beg = s.pending;
          if (s.pending === s.pending_buf_size) {
            val = 1;
            break;
          }
        }
        // JS specific: little magic to add zero terminator to end of string
        if (s.gzindex < s.gzhead.comment.length) {
          val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
        } else {
          val = 0;
        }
        put_byte(s, val);
      } while (val !== 0);

      if (s.gzhead.hcrc && s.pending > beg) {
        strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
      if (val === 0) {
        s.status = HCRC_STATE;
      }
    }
    else {
      s.status = HCRC_STATE;
    }
  }
  if (s.status === HCRC_STATE) {
    if (s.gzhead.hcrc) {
      if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
      }
      if (s.pending + 2 <= s.pending_buf_size) {
        put_byte(s, strm.adler & 0xff);
        put_byte(s, (strm.adler >> 8) & 0xff);
        strm.adler = 0; //crc32(0L, Z_NULL, 0);
        s.status = BUSY_STATE;
      }
    }
    else {
      s.status = BUSY_STATE;
    }
  }
//#endif

  /* Flush as much pending output as possible */
  if (s.pending !== 0) {
    flush_pending(strm);
    if (strm.avail_out === 0) {
      /* Since avail_out is 0, deflate will be called again with
       * more output space, but possibly with both pending and
       * avail_in equal to zero. There won't be anything to do,
       * but this is not an error situation so make sure we
       * return OK instead of BUF_ERROR at next call of deflate:
       */
      s.last_flush = -1;
      return Z_OK;
    }

    /* Make sure there is something to do and avoid duplicate consecutive
     * flushes. For repeated and useless calls with Z_FINISH, we keep
     * returning Z_STREAM_END instead of Z_BUF_ERROR.
     */
  } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
    flush !== Z_FINISH) {
    return err(strm, Z_BUF_ERROR);
  }

  /* User must not provide more input after the first FINISH: */
  if (s.status === FINISH_STATE && strm.avail_in !== 0) {
    return err(strm, Z_BUF_ERROR);
  }

  /* Start a new block or continue the current one.
   */
  if (strm.avail_in !== 0 || s.lookahead !== 0 ||
    (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
    var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
      (s.strategy === Z_RLE ? deflate_rle(s, flush) :
        configuration_table[s.level].func(s, flush));

    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
      s.status = FINISH_STATE;
    }
    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
      if (strm.avail_out === 0) {
        s.last_flush = -1;
        /* avoid BUF_ERROR next call, see above */
      }
      return Z_OK;
      /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
       * of deflate should use the same flush parameter to make sure
       * that the flush is complete. So we don't have to output an
       * empty block here, this will be done at next call. This also
       * ensures that for a very small output buffer, we emit at most
       * one empty block.
       */
    }
    if (bstate === BS_BLOCK_DONE) {
      if (flush === Z_PARTIAL_FLUSH) {
        trees._tr_align(s);
      }
      else if (flush !== Z_BLOCK) { /* FULL_FLUSH or SYNC_FLUSH */

        trees._tr_stored_block(s, 0, 0, false);
        /* For a full flush, this empty block will be recognized
         * as a special marker by inflate_sync().
         */
        if (flush === Z_FULL_FLUSH) {
          /*** CLEAR_HASH(s); ***/             /* forget history */
          zero(s.head); // Fill with NIL (= 0);

          if (s.lookahead === 0) {
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
        }
      }
      flush_pending(strm);
      if (strm.avail_out === 0) {
        s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
        return Z_OK;
      }
    }
  }
  //Assert(strm->avail_out > 0, "bug2");
  //if (strm.avail_out <= 0) { throw new Error("bug2");}

  if (flush !== Z_FINISH) { return Z_OK; }
  if (s.wrap <= 0) { return Z_STREAM_END; }

  /* Write the trailer */
  if (s.wrap === 2) {
    put_byte(s, strm.adler & 0xff);
    put_byte(s, (strm.adler >> 8) & 0xff);
    put_byte(s, (strm.adler >> 16) & 0xff);
    put_byte(s, (strm.adler >> 24) & 0xff);
    put_byte(s, strm.total_in & 0xff);
    put_byte(s, (strm.total_in >> 8) & 0xff);
    put_byte(s, (strm.total_in >> 16) & 0xff);
    put_byte(s, (strm.total_in >> 24) & 0xff);
  }
  else
  {
    putShortMSB(s, strm.adler >>> 16);
    putShortMSB(s, strm.adler & 0xffff);
  }

  flush_pending(strm);
  /* If avail_out is zero, the application will call deflate again
   * to flush the rest.
   */
  if (s.wrap > 0) { s.wrap = -s.wrap; }
  /* write the trailer only once! */
  return s.pending !== 0 ? Z_OK : Z_STREAM_END;
}

function deflateEnd(strm) {
  var status;

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR;
  }

  status = strm.state.status;
  if (status !== INIT_STATE &&
    status !== EXTRA_STATE &&
    status !== NAME_STATE &&
    status !== COMMENT_STATE &&
    status !== HCRC_STATE &&
    status !== BUSY_STATE &&
    status !== FINISH_STATE
  ) {
    return err(strm, Z_STREAM_ERROR);
  }

  strm.state = null;

  return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
}


/* =========================================================================
 * Initializes the compression dictionary from the given byte
 * sequence without producing any compressed output.
 */
function deflateSetDictionary(strm, dictionary) {
  var dictLength = dictionary.length;

  var s;
  var str, n;
  var wrap;
  var avail;
  var next;
  var input;
  var tmpDict;

  if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
    return Z_STREAM_ERROR;
  }

  s = strm.state;
  wrap = s.wrap;

  if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
    return Z_STREAM_ERROR;
  }

  /* when using zlib wrappers, compute Adler-32 for provided dictionary */
  if (wrap === 1) {
    /* adler32(strm->adler, dictionary, dictLength); */
    strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
  }

  s.wrap = 0;   /* avoid computing Adler-32 in read_buf */

  /* if dictionary would fill window, just replace the history */
  if (dictLength >= s.w_size) {
    if (wrap === 0) {            /* already empty otherwise */
      /*** CLEAR_HASH(s); ***/
      zero(s.head); // Fill with NIL (= 0);
      s.strstart = 0;
      s.block_start = 0;
      s.insert = 0;
    }
    /* use the tail */
    // dictionary = dictionary.slice(dictLength - s.w_size);
    tmpDict = new utils.Buf8(s.w_size);
    utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
    dictionary = tmpDict;
    dictLength = s.w_size;
  }
  /* insert dictionary into window and hash */
  avail = strm.avail_in;
  next = strm.next_in;
  input = strm.input;
  strm.avail_in = dictLength;
  strm.next_in = 0;
  strm.input = dictionary;
  fill_window(s);
  while (s.lookahead >= MIN_MATCH) {
    str = s.strstart;
    n = s.lookahead - (MIN_MATCH - 1);
    do {
      /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
      s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

      s.prev[str & s.w_mask] = s.head[s.ins_h];

      s.head[s.ins_h] = str;
      str++;
    } while (--n);
    s.strstart = str;
    s.lookahead = MIN_MATCH - 1;
    fill_window(s);
  }
  s.strstart += s.lookahead;
  s.block_start = s.strstart;
  s.insert = s.lookahead;
  s.lookahead = 0;
  s.match_length = s.prev_length = MIN_MATCH - 1;
  s.match_available = 0;
  strm.next_in = next;
  strm.input = input;
  strm.avail_in = avail;
  s.wrap = wrap;
  return Z_OK;
}


exports.deflateInit = deflateInit;
exports.deflateInit2 = deflateInit2;
exports.deflateReset = deflateReset;
exports.deflateResetKeep = deflateResetKeep;
exports.deflateSetHeader = deflateSetHeader;
exports.deflate = deflate;
exports.deflateEnd = deflateEnd;
exports.deflateSetDictionary = deflateSetDictionary;
exports.deflateInfo = 'pako deflate (from Nodeca project)';

/* Not implemented
exports.deflateBound = deflateBound;
exports.deflateCopy = deflateCopy;
exports.deflateParams = deflateParams;
exports.deflatePending = deflatePending;
exports.deflatePrime = deflatePrime;
exports.deflateTune = deflateTune;
*/

},{"../utils/common":30,"./adler32":31,"./crc32":33,"./messages":38,"./trees":39}],35:[function(require,module,exports){
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

// See state defs from inflate.js
var BAD = 30;       /* got a data error -- remain here until reset */
var TYPE = 12;      /* i: waiting for type bits, including last-flag bit */

/*
   Decode literal, length, and distance codes and write out the resulting
   literal and match bytes until either not enough input or output is
   available, an end-of-block is encountered, or a data error is encountered.
   When large enough input and output buffers are supplied to inflate(), for
   example, a 16K input buffer and a 64K output buffer, more than 95% of the
   inflate execution time is spent in this routine.

   Entry assumptions:

        state.mode === LEN
        strm.avail_in >= 6
        strm.avail_out >= 258
        start >= strm.avail_out
        state.bits < 8

   On return, state.mode is one of:

        LEN -- ran out of enough output space or enough available input
        TYPE -- reached end of block code, inflate() to interpret next block
        BAD -- error in block data

   Notes:

    - The maximum input bits used by a length/distance pair is 15 bits for the
      length code, 5 bits for the length extra, 15 bits for the distance code,
      and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
      Therefore if strm.avail_in >= 6, then there is enough input to avoid
      checking for available input while decoding.

    - The maximum bytes that a single length/distance pair can output is 258
      bytes, which is the maximum length that can be coded.  inflate_fast()
      requires strm.avail_out >= 258 for each loop to avoid checking for
      output space.
 */
module.exports = function inflate_fast(strm, start) {
  var state;
  var _in;                    /* local strm.input */
  var last;                   /* have enough input while in < last */
  var _out;                   /* local strm.output */
  var beg;                    /* inflate()'s initial strm.output */
  var end;                    /* while out < end, enough space available */
//#ifdef INFLATE_STRICT
  var dmax;                   /* maximum distance from zlib header */
//#endif
  var wsize;                  /* window size or zero if not using window */
  var whave;                  /* valid bytes in the window */
  var wnext;                  /* window write index */
  // Use `s_window` instead `window`, avoid conflict with instrumentation tools
  var s_window;               /* allocated sliding window, if wsize != 0 */
  var hold;                   /* local strm.hold */
  var bits;                   /* local strm.bits */
  var lcode;                  /* local strm.lencode */
  var dcode;                  /* local strm.distcode */
  var lmask;                  /* mask for first level of length codes */
  var dmask;                  /* mask for first level of distance codes */
  var here;                   /* retrieved table entry */
  var op;                     /* code bits, operation, extra bits, or */
                              /*  window position, window bytes to copy */
  var len;                    /* match length, unused bytes */
  var dist;                   /* match distance */
  var from;                   /* where to copy match from */
  var from_source;


  var input, output; // JS specific, because we have no pointers

  /* copy state to local variables */
  state = strm.state;
  //here = state.here;
  _in = strm.next_in;
  input = strm.input;
  last = _in + (strm.avail_in - 5);
  _out = strm.next_out;
  output = strm.output;
  beg = _out - (start - strm.avail_out);
  end = _out + (strm.avail_out - 257);
//#ifdef INFLATE_STRICT
  dmax = state.dmax;
//#endif
  wsize = state.wsize;
  whave = state.whave;
  wnext = state.wnext;
  s_window = state.window;
  hold = state.hold;
  bits = state.bits;
  lcode = state.lencode;
  dcode = state.distcode;
  lmask = (1 << state.lenbits) - 1;
  dmask = (1 << state.distbits) - 1;


  /* decode literals and length/distances until end-of-block or not enough
     input data or output space */

  top:
  do {
    if (bits < 15) {
      hold += input[_in++] << bits;
      bits += 8;
      hold += input[_in++] << bits;
      bits += 8;
    }

    here = lcode[hold & lmask];

    dolen:
    for (;;) { // Goto emulation
      op = here >>> 24/*here.bits*/;
      hold >>>= op;
      bits -= op;
      op = (here >>> 16) & 0xff/*here.op*/;
      if (op === 0) {                          /* literal */
        //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
        //        "inflate:         literal '%c'\n" :
        //        "inflate:         literal 0x%02x\n", here.val));
        output[_out++] = here & 0xffff/*here.val*/;
      }
      else if (op & 16) {                     /* length base */
        len = here & 0xffff/*here.val*/;
        op &= 15;                           /* number of extra bits */
        if (op) {
          if (bits < op) {
            hold += input[_in++] << bits;
            bits += 8;
          }
          len += hold & ((1 << op) - 1);
          hold >>>= op;
          bits -= op;
        }
        //Tracevv((stderr, "inflate:         length %u\n", len));
        if (bits < 15) {
          hold += input[_in++] << bits;
          bits += 8;
          hold += input[_in++] << bits;
          bits += 8;
        }
        here = dcode[hold & dmask];

        dodist:
        for (;;) { // goto emulation
          op = here >>> 24/*here.bits*/;
          hold >>>= op;
          bits -= op;
          op = (here >>> 16) & 0xff/*here.op*/;

          if (op & 16) {                      /* distance base */
            dist = here & 0xffff/*here.val*/;
            op &= 15;                       /* number of extra bits */
            if (bits < op) {
              hold += input[_in++] << bits;
              bits += 8;
              if (bits < op) {
                hold += input[_in++] << bits;
                bits += 8;
              }
            }
            dist += hold & ((1 << op) - 1);
//#ifdef INFLATE_STRICT
            if (dist > dmax) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break top;
            }
//#endif
            hold >>>= op;
            bits -= op;
            //Tracevv((stderr, "inflate:         distance %u\n", dist));
            op = _out - beg;                /* max distance in output */
            if (dist > op) {                /* see if copy from window */
              op = dist - op;               /* distance back in window */
              if (op > whave) {
                if (state.sane) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD;
                  break top;
                }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
              }
              from = 0; // window index
              from_source = s_window;
              if (wnext === 0) {           /* very common case */
                from += wsize - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              else if (wnext < op) {      /* wrap around window */
                from += wsize + wnext - op;
                op -= wnext;
                if (op < len) {         /* some from end of window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = 0;
                  if (wnext < len) {  /* some from start of window */
                    op = wnext;
                    len -= op;
                    do {
                      output[_out++] = s_window[from++];
                    } while (--op);
                    from = _out - dist;      /* rest from output */
                    from_source = output;
                  }
                }
              }
              else {                      /* contiguous in window */
                from += wnext - op;
                if (op < len) {         /* some from window */
                  len -= op;
                  do {
                    output[_out++] = s_window[from++];
                  } while (--op);
                  from = _out - dist;  /* rest from output */
                  from_source = output;
                }
              }
              while (len > 2) {
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                output[_out++] = from_source[from++];
                len -= 3;
              }
              if (len) {
                output[_out++] = from_source[from++];
                if (len > 1) {
                  output[_out++] = from_source[from++];
                }
              }
            }
            else {
              from = _out - dist;          /* copy direct from output */
              do {                        /* minimum length is three */
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                output[_out++] = output[from++];
                len -= 3;
              } while (len > 2);
              if (len) {
                output[_out++] = output[from++];
                if (len > 1) {
                  output[_out++] = output[from++];
                }
              }
            }
          }
          else if ((op & 64) === 0) {          /* 2nd level distance code */
            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
            continue dodist;
          }
          else {
            strm.msg = 'invalid distance code';
            state.mode = BAD;
            break top;
          }

          break; // need to emulate goto via "continue"
        }
      }
      else if ((op & 64) === 0) {              /* 2nd level length code */
        here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
        continue dolen;
      }
      else if (op & 32) {                     /* end-of-block */
        //Tracevv((stderr, "inflate:         end of block\n"));
        state.mode = TYPE;
        break top;
      }
      else {
        strm.msg = 'invalid literal/length code';
        state.mode = BAD;
        break top;
      }

      break; // need to emulate goto via "continue"
    }
  } while (_in < last && _out < end);

  /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
  len = bits >> 3;
  _in -= len;
  bits -= len << 3;
  hold &= (1 << bits) - 1;

  /* update state and return */
  strm.next_in = _in;
  strm.next_out = _out;
  strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
  strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
  state.hold = hold;
  state.bits = bits;
  return;
};

},{}],36:[function(require,module,exports){
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils         = require('../utils/common');
var adler32       = require('./adler32');
var crc32         = require('./crc32');
var inflate_fast  = require('./inffast');
var inflate_table = require('./inftrees');

var CODES = 0;
var LENS = 1;
var DISTS = 2;

/* Public constants ==========================================================*/
/* ===========================================================================*/


/* Allowed flush values; see deflate() and inflate() below for details */
//var Z_NO_FLUSH      = 0;
//var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
//var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
var Z_TREES         = 6;


/* Return codes for the compression/decompression functions. Negative values
 * are errors, positive values are used for special but normal events.
 */
var Z_OK            = 0;
var Z_STREAM_END    = 1;
var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
//var Z_VERSION_ERROR = -6;

/* The deflate compression method */
var Z_DEFLATED  = 8;


/* STATES ====================================================================*/
/* ===========================================================================*/


var    HEAD = 1;       /* i: waiting for magic header */
var    FLAGS = 2;      /* i: waiting for method and flags (gzip) */
var    TIME = 3;       /* i: waiting for modification time (gzip) */
var    OS = 4;         /* i: waiting for extra flags and operating system (gzip) */
var    EXLEN = 5;      /* i: waiting for extra length (gzip) */
var    EXTRA = 6;      /* i: waiting for extra bytes (gzip) */
var    NAME = 7;       /* i: waiting for end of file name (gzip) */
var    COMMENT = 8;    /* i: waiting for end of comment (gzip) */
var    HCRC = 9;       /* i: waiting for header crc (gzip) */
var    DICTID = 10;    /* i: waiting for dictionary check value */
var    DICT = 11;      /* waiting for inflateSetDictionary() call */
var        TYPE = 12;      /* i: waiting for type bits, including last-flag bit */
var        TYPEDO = 13;    /* i: same, but skip check to exit inflate on new block */
var        STORED = 14;    /* i: waiting for stored size (length and complement) */
var        COPY_ = 15;     /* i/o: same as COPY below, but only first time in */
var        COPY = 16;      /* i/o: waiting for input or output to copy stored block */
var        TABLE = 17;     /* i: waiting for dynamic block table lengths */
var        LENLENS = 18;   /* i: waiting for code length code lengths */
var        CODELENS = 19;  /* i: waiting for length/lit and distance code lengths */
var            LEN_ = 20;      /* i: same as LEN below, but only first time in */
var            LEN = 21;       /* i: waiting for length/lit/eob code */
var            LENEXT = 22;    /* i: waiting for length extra bits */
var            DIST = 23;      /* i: waiting for distance code */
var            DISTEXT = 24;   /* i: waiting for distance extra bits */
var            MATCH = 25;     /* o: waiting for output space to copy string */
var            LIT = 26;       /* o: waiting for output space to write literal */
var    CHECK = 27;     /* i: waiting for 32-bit check value */
var    LENGTH = 28;    /* i: waiting for 32-bit length (gzip) */
var    DONE = 29;      /* finished check, done -- remain here until reset */
var    BAD = 30;       /* got a data error -- remain here until reset */
var    MEM = 31;       /* got an inflate() memory error -- remain here until reset */
var    SYNC = 32;      /* looking for synchronization bytes to restart inflate() */

/* ===========================================================================*/



var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

var MAX_WBITS = 15;
/* 32K LZ77 window */
var DEF_WBITS = MAX_WBITS;


function zswap32(q) {
  return  (((q >>> 24) & 0xff) +
          ((q >>> 8) & 0xff00) +
          ((q & 0xff00) << 8) +
          ((q & 0xff) << 24));
}


function InflateState() {
  this.mode = 0;             /* current inflate mode */
  this.last = false;          /* true if processing last block */
  this.wrap = 0;              /* bit 0 true for zlib, bit 1 true for gzip */
  this.havedict = false;      /* true if dictionary provided */
  this.flags = 0;             /* gzip header method and flags (0 if zlib) */
  this.dmax = 0;              /* zlib header max distance (INFLATE_STRICT) */
  this.check = 0;             /* protected copy of check value */
  this.total = 0;             /* protected copy of output count */
  // TODO: may be {}
  this.head = null;           /* where to save gzip header information */

  /* sliding window */
  this.wbits = 0;             /* log base 2 of requested window size */
  this.wsize = 0;             /* window size or zero if not using window */
  this.whave = 0;             /* valid bytes in the window */
  this.wnext = 0;             /* window write index */
  this.window = null;         /* allocated sliding window, if needed */

  /* bit accumulator */
  this.hold = 0;              /* input bit accumulator */
  this.bits = 0;              /* number of bits in "in" */

  /* for string and stored block copying */
  this.length = 0;            /* literal or length of data to copy */
  this.offset = 0;            /* distance back to copy string from */

  /* for table and code decoding */
  this.extra = 0;             /* extra bits needed */

  /* fixed and dynamic code tables */
  this.lencode = null;          /* starting table for length/literal codes */
  this.distcode = null;         /* starting table for distance codes */
  this.lenbits = 0;           /* index bits for lencode */
  this.distbits = 0;          /* index bits for distcode */

  /* dynamic table building */
  this.ncode = 0;             /* number of code length code lengths */
  this.nlen = 0;              /* number of length code lengths */
  this.ndist = 0;             /* number of distance code lengths */
  this.have = 0;              /* number of code lengths in lens[] */
  this.next = null;              /* next available space in codes[] */

  this.lens = new utils.Buf16(320); /* temporary storage for code lengths */
  this.work = new utils.Buf16(288); /* work area for code table building */

  /*
   because we don't have pointers in js, we use lencode and distcode directly
   as buffers so we don't need codes
  */
  //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
  this.lendyn = null;              /* dynamic table for length/literal codes (JS specific) */
  this.distdyn = null;             /* dynamic table for distance codes (JS specific) */
  this.sane = 0;                   /* if false, allow invalid distance too far */
  this.back = 0;                   /* bits back of last unprocessed length/lit */
  this.was = 0;                    /* initial length of match */
}

function inflateResetKeep(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  strm.total_in = strm.total_out = state.total = 0;
  strm.msg = ''; /*Z_NULL*/
  if (state.wrap) {       /* to support ill-conceived Java test suite */
    strm.adler = state.wrap & 1;
  }
  state.mode = HEAD;
  state.last = 0;
  state.havedict = 0;
  state.dmax = 32768;
  state.head = null/*Z_NULL*/;
  state.hold = 0;
  state.bits = 0;
  //state.lencode = state.distcode = state.next = state.codes;
  state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
  state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);

  state.sane = 1;
  state.back = -1;
  //Tracev((stderr, "inflate: reset\n"));
  return Z_OK;
}

function inflateReset(strm) {
  var state;

  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  state.wsize = 0;
  state.whave = 0;
  state.wnext = 0;
  return inflateResetKeep(strm);

}

function inflateReset2(strm, windowBits) {
  var wrap;
  var state;

  /* get the state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;

  /* extract wrap request from windowBits parameter */
  if (windowBits < 0) {
    wrap = 0;
    windowBits = -windowBits;
  }
  else {
    wrap = (windowBits >> 4) + 1;
    if (windowBits < 48) {
      windowBits &= 15;
    }
  }

  /* set number of window bits, free window if different */
  if (windowBits && (windowBits < 8 || windowBits > 15)) {
    return Z_STREAM_ERROR;
  }
  if (state.window !== null && state.wbits !== windowBits) {
    state.window = null;
  }

  /* update state and reset the rest of it */
  state.wrap = wrap;
  state.wbits = windowBits;
  return inflateReset(strm);
}

function inflateInit2(strm, windowBits) {
  var ret;
  var state;

  if (!strm) { return Z_STREAM_ERROR; }
  //strm.msg = Z_NULL;                 /* in case we return an error */

  state = new InflateState();

  //if (state === Z_NULL) return Z_MEM_ERROR;
  //Tracev((stderr, "inflate: allocated\n"));
  strm.state = state;
  state.window = null/*Z_NULL*/;
  ret = inflateReset2(strm, windowBits);
  if (ret !== Z_OK) {
    strm.state = null/*Z_NULL*/;
  }
  return ret;
}

function inflateInit(strm) {
  return inflateInit2(strm, DEF_WBITS);
}


/*
 Return state with length and distance decoding tables and index sizes set to
 fixed code decoding.  Normally this returns fixed tables from inffixed.h.
 If BUILDFIXED is defined, then instead this routine builds the tables the
 first time it's called, and returns those tables the first time and
 thereafter.  This reduces the size of the code by about 2K bytes, in
 exchange for a little execution time.  However, BUILDFIXED should not be
 used for threaded applications, since the rewriting of the tables and virgin
 may not be thread-safe.
 */
var virgin = true;

var lenfix, distfix; // We have no pointers in JS, so keep tables separate

function fixedtables(state) {
  /* build fixed huffman tables if first call (may not be thread safe) */
  if (virgin) {
    var sym;

    lenfix = new utils.Buf32(512);
    distfix = new utils.Buf32(32);

    /* literal/length table */
    sym = 0;
    while (sym < 144) { state.lens[sym++] = 8; }
    while (sym < 256) { state.lens[sym++] = 9; }
    while (sym < 280) { state.lens[sym++] = 7; }
    while (sym < 288) { state.lens[sym++] = 8; }

    inflate_table(LENS,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });

    /* distance table */
    sym = 0;
    while (sym < 32) { state.lens[sym++] = 5; }

    inflate_table(DISTS, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });

    /* do this just once */
    virgin = false;
  }

  state.lencode = lenfix;
  state.lenbits = 9;
  state.distcode = distfix;
  state.distbits = 5;
}


/*
 Update the window with the last wsize (normally 32K) bytes written before
 returning.  If window does not exist yet, create it.  This is only called
 when a window is already in use, or when output has been written during this
 inflate call, but the end of the deflate stream has not been reached yet.
 It is also called to create a window for dictionary data when a dictionary
 is loaded.

 Providing output buffers larger than 32K to inflate() should provide a speed
 advantage, since only the last 32K of output is copied to the sliding window
 upon return from inflate(), and since all distances after the first 32K of
 output will fall in the output data, making match copies simpler and faster.
 The advantage may be dependent on the size of the processor's data caches.
 */
function updatewindow(strm, src, end, copy) {
  var dist;
  var state = strm.state;

  /* if it hasn't been done already, allocate space for the window */
  if (state.window === null) {
    state.wsize = 1 << state.wbits;
    state.wnext = 0;
    state.whave = 0;

    state.window = new utils.Buf8(state.wsize);
  }

  /* copy state->wsize or less output bytes into the circular window */
  if (copy >= state.wsize) {
    utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
    state.wnext = 0;
    state.whave = state.wsize;
  }
  else {
    dist = state.wsize - state.wnext;
    if (dist > copy) {
      dist = copy;
    }
    //zmemcpy(state->window + state->wnext, end - copy, dist);
    utils.arraySet(state.window, src, end - copy, dist, state.wnext);
    copy -= dist;
    if (copy) {
      //zmemcpy(state->window, end - copy, copy);
      utils.arraySet(state.window, src, end - copy, copy, 0);
      state.wnext = copy;
      state.whave = state.wsize;
    }
    else {
      state.wnext += dist;
      if (state.wnext === state.wsize) { state.wnext = 0; }
      if (state.whave < state.wsize) { state.whave += dist; }
    }
  }
  return 0;
}

function inflate(strm, flush) {
  var state;
  var input, output;          // input/output buffers
  var next;                   /* next input INDEX */
  var put;                    /* next output INDEX */
  var have, left;             /* available input and output */
  var hold;                   /* bit buffer */
  var bits;                   /* bits in bit buffer */
  var _in, _out;              /* save starting available input and output */
  var copy;                   /* number of stored or match bytes to copy */
  var from;                   /* where to copy match bytes from */
  var from_source;
  var here = 0;               /* current decoding table entry */
  var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
  //var last;                   /* parent table entry */
  var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
  var len;                    /* length to copy for repeats, bits to drop */
  var ret;                    /* return code */
  var hbuf = new utils.Buf8(4);    /* buffer for gzip header crc calculation */
  var opts;

  var n; // temporary var for NEED_BITS

  var order = /* permutation of code lengths */
    [ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ];


  if (!strm || !strm.state || !strm.output ||
      (!strm.input && strm.avail_in !== 0)) {
    return Z_STREAM_ERROR;
  }

  state = strm.state;
  if (state.mode === TYPE) { state.mode = TYPEDO; }    /* skip check */


  //--- LOAD() ---
  put = strm.next_out;
  output = strm.output;
  left = strm.avail_out;
  next = strm.next_in;
  input = strm.input;
  have = strm.avail_in;
  hold = state.hold;
  bits = state.bits;
  //---

  _in = have;
  _out = left;
  ret = Z_OK;

  inf_leave: // goto emulation
  for (;;) {
    switch (state.mode) {
      case HEAD:
        if (state.wrap === 0) {
          state.mode = TYPEDO;
          break;
        }
        //=== NEEDBITS(16);
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
          state.check = 0/*crc32(0L, Z_NULL, 0)*/;
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//

          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          state.mode = FLAGS;
          break;
        }
        state.flags = 0;           /* expect zlib header */
        if (state.head) {
          state.head.done = false;
        }
        if (!(state.wrap & 1) ||   /* check if zlib header allowed */
          (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
          strm.msg = 'incorrect header check';
          state.mode = BAD;
          break;
        }
        if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
        len = (hold & 0x0f)/*BITS(4)*/ + 8;
        if (state.wbits === 0) {
          state.wbits = len;
        }
        else if (len > state.wbits) {
          strm.msg = 'invalid window size';
          state.mode = BAD;
          break;
        }
        state.dmax = 1 << len;
        //Tracev((stderr, "inflate:   zlib header ok\n"));
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = hold & 0x200 ? DICTID : TYPE;
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        break;
      case FLAGS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.flags = hold;
        if ((state.flags & 0xff) !== Z_DEFLATED) {
          strm.msg = 'unknown compression method';
          state.mode = BAD;
          break;
        }
        if (state.flags & 0xe000) {
          strm.msg = 'unknown header flags set';
          state.mode = BAD;
          break;
        }
        if (state.head) {
          state.head.text = ((hold >> 8) & 1);
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = TIME;
        /* falls through */
      case TIME:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.time = hold;
        }
        if (state.flags & 0x0200) {
          //=== CRC4(state.check, hold)
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          hbuf[2] = (hold >>> 16) & 0xff;
          hbuf[3] = (hold >>> 24) & 0xff;
          state.check = crc32(state.check, hbuf, 4, 0);
          //===
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = OS;
        /* falls through */
      case OS:
        //=== NEEDBITS(16); */
        while (bits < 16) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if (state.head) {
          state.head.xflags = (hold & 0xff);
          state.head.os = (hold >> 8);
        }
        if (state.flags & 0x0200) {
          //=== CRC2(state.check, hold);
          hbuf[0] = hold & 0xff;
          hbuf[1] = (hold >>> 8) & 0xff;
          state.check = crc32(state.check, hbuf, 2, 0);
          //===//
        }
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = EXLEN;
        /* falls through */
      case EXLEN:
        if (state.flags & 0x0400) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length = hold;
          if (state.head) {
            state.head.extra_len = hold;
          }
          if (state.flags & 0x0200) {
            //=== CRC2(state.check, hold);
            hbuf[0] = hold & 0xff;
            hbuf[1] = (hold >>> 8) & 0xff;
            state.check = crc32(state.check, hbuf, 2, 0);
            //===//
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        else if (state.head) {
          state.head.extra = null/*Z_NULL*/;
        }
        state.mode = EXTRA;
        /* falls through */
      case EXTRA:
        if (state.flags & 0x0400) {
          copy = state.length;
          if (copy > have) { copy = have; }
          if (copy) {
            if (state.head) {
              len = state.head.extra_len - state.length;
              if (!state.head.extra) {
                // Use untyped array for more convenient processing later
                state.head.extra = new Array(state.head.extra_len);
              }
              utils.arraySet(
                state.head.extra,
                input,
                next,
                // extra field is limited to 65536 bytes
                // - no need for additional size check
                copy,
                /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                len
              );
              //zmemcpy(state.head.extra + len, next,
              //        len + copy > state.head.extra_max ?
              //        state.head.extra_max - len : copy);
            }
            if (state.flags & 0x0200) {
              state.check = crc32(state.check, input, copy, next);
            }
            have -= copy;
            next += copy;
            state.length -= copy;
          }
          if (state.length) { break inf_leave; }
        }
        state.length = 0;
        state.mode = NAME;
        /* falls through */
      case NAME:
        if (state.flags & 0x0800) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            // TODO: 2 or 1 bytes?
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.name_max*/)) {
              state.head.name += String.fromCharCode(len);
            }
          } while (len && copy < have);

          if (state.flags & 0x0200) {
            state.check = crc32(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.name = null;
        }
        state.length = 0;
        state.mode = COMMENT;
        /* falls through */
      case COMMENT:
        if (state.flags & 0x1000) {
          if (have === 0) { break inf_leave; }
          copy = 0;
          do {
            len = input[next + copy++];
            /* use constant limit because in js we should not preallocate memory */
            if (state.head && len &&
                (state.length < 65536 /*state.head.comm_max*/)) {
              state.head.comment += String.fromCharCode(len);
            }
          } while (len && copy < have);
          if (state.flags & 0x0200) {
            state.check = crc32(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          if (len) { break inf_leave; }
        }
        else if (state.head) {
          state.head.comment = null;
        }
        state.mode = HCRC;
        /* falls through */
      case HCRC:
        if (state.flags & 0x0200) {
          //=== NEEDBITS(16); */
          while (bits < 16) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.check & 0xffff)) {
            strm.msg = 'header crc mismatch';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
        }
        if (state.head) {
          state.head.hcrc = ((state.flags >> 9) & 1);
          state.head.done = true;
        }
        strm.adler = state.check = 0;
        state.mode = TYPE;
        break;
      case DICTID:
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        strm.adler = state.check = zswap32(hold);
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = DICT;
        /* falls through */
      case DICT:
        if (state.havedict === 0) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          return Z_NEED_DICT;
        }
        strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
        state.mode = TYPE;
        /* falls through */
      case TYPE:
        if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case TYPEDO:
        if (state.last) {
          //--- BYTEBITS() ---//
          hold >>>= bits & 7;
          bits -= bits & 7;
          //---//
          state.mode = CHECK;
          break;
        }
        //=== NEEDBITS(3); */
        while (bits < 3) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.last = (hold & 0x01)/*BITS(1)*/;
        //--- DROPBITS(1) ---//
        hold >>>= 1;
        bits -= 1;
        //---//

        switch ((hold & 0x03)/*BITS(2)*/) {
          case 0:                             /* stored block */
            //Tracev((stderr, "inflate:     stored block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = STORED;
            break;
          case 1:                             /* fixed block */
            fixedtables(state);
            //Tracev((stderr, "inflate:     fixed codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = LEN_;             /* decode codes */
            if (flush === Z_TREES) {
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
              break inf_leave;
            }
            break;
          case 2:                             /* dynamic block */
            //Tracev((stderr, "inflate:     dynamic codes block%s\n",
            //        state.last ? " (last)" : ""));
            state.mode = TABLE;
            break;
          case 3:
            strm.msg = 'invalid block type';
            state.mode = BAD;
        }
        //--- DROPBITS(2) ---//
        hold >>>= 2;
        bits -= 2;
        //---//
        break;
      case STORED:
        //--- BYTEBITS() ---// /* go to byte boundary */
        hold >>>= bits & 7;
        bits -= bits & 7;
        //---//
        //=== NEEDBITS(32); */
        while (bits < 32) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
          strm.msg = 'invalid stored block lengths';
          state.mode = BAD;
          break;
        }
        state.length = hold & 0xffff;
        //Tracev((stderr, "inflate:       stored length %u\n",
        //        state.length));
        //=== INITBITS();
        hold = 0;
        bits = 0;
        //===//
        state.mode = COPY_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case COPY_:
        state.mode = COPY;
        /* falls through */
      case COPY:
        copy = state.length;
        if (copy) {
          if (copy > have) { copy = have; }
          if (copy > left) { copy = left; }
          if (copy === 0) { break inf_leave; }
          //--- zmemcpy(put, next, copy); ---
          utils.arraySet(output, input, next, copy, put);
          //---//
          have -= copy;
          next += copy;
          left -= copy;
          put += copy;
          state.length -= copy;
          break;
        }
        //Tracev((stderr, "inflate:       stored end\n"));
        state.mode = TYPE;
        break;
      case TABLE:
        //=== NEEDBITS(14); */
        while (bits < 14) {
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
        }
        //===//
        state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
        //--- DROPBITS(5) ---//
        hold >>>= 5;
        bits -= 5;
        //---//
        state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
        //--- DROPBITS(4) ---//
        hold >>>= 4;
        bits -= 4;
        //---//
//#ifndef PKZIP_BUG_WORKAROUND
        if (state.nlen > 286 || state.ndist > 30) {
          strm.msg = 'too many length or distance symbols';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracev((stderr, "inflate:       table sizes ok\n"));
        state.have = 0;
        state.mode = LENLENS;
        /* falls through */
      case LENLENS:
        while (state.have < state.ncode) {
          //=== NEEDBITS(3);
          while (bits < 3) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
          //--- DROPBITS(3) ---//
          hold >>>= 3;
          bits -= 3;
          //---//
        }
        while (state.have < 19) {
          state.lens[order[state.have++]] = 0;
        }
        // We have separate tables & no pointers. 2 commented lines below not needed.
        //state.next = state.codes;
        //state.lencode = state.next;
        // Switch to use dynamic table
        state.lencode = state.lendyn;
        state.lenbits = 7;

        opts = { bits: state.lenbits };
        ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
        state.lenbits = opts.bits;

        if (ret) {
          strm.msg = 'invalid code lengths set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, "inflate:       code lengths ok\n"));
        state.have = 0;
        state.mode = CODELENS;
        /* falls through */
      case CODELENS:
        while (state.have < state.nlen + state.ndist) {
          for (;;) {
            here = state.lencode[hold & ((1 << state.lenbits) - 1)];/*BITS(state.lenbits)*/
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          if (here_val < 16) {
            //--- DROPBITS(here.bits) ---//
            hold >>>= here_bits;
            bits -= here_bits;
            //---//
            state.lens[state.have++] = here_val;
          }
          else {
            if (here_val === 16) {
              //=== NEEDBITS(here.bits + 2);
              n = here_bits + 2;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              if (state.have === 0) {
                strm.msg = 'invalid bit length repeat';
                state.mode = BAD;
                break;
              }
              len = state.lens[state.have - 1];
              copy = 3 + (hold & 0x03);//BITS(2);
              //--- DROPBITS(2) ---//
              hold >>>= 2;
              bits -= 2;
              //---//
            }
            else if (here_val === 17) {
              //=== NEEDBITS(here.bits + 3);
              n = here_bits + 3;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 3 + (hold & 0x07);//BITS(3);
              //--- DROPBITS(3) ---//
              hold >>>= 3;
              bits -= 3;
              //---//
            }
            else {
              //=== NEEDBITS(here.bits + 7);
              n = here_bits + 7;
              while (bits < n) {
                if (have === 0) { break inf_leave; }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              //===//
              //--- DROPBITS(here.bits) ---//
              hold >>>= here_bits;
              bits -= here_bits;
              //---//
              len = 0;
              copy = 11 + (hold & 0x7f);//BITS(7);
              //--- DROPBITS(7) ---//
              hold >>>= 7;
              bits -= 7;
              //---//
            }
            if (state.have + copy > state.nlen + state.ndist) {
              strm.msg = 'invalid bit length repeat';
              state.mode = BAD;
              break;
            }
            while (copy--) {
              state.lens[state.have++] = len;
            }
          }
        }

        /* handle error breaks in while */
        if (state.mode === BAD) { break; }

        /* check for end-of-block code (better have one) */
        if (state.lens[256] === 0) {
          strm.msg = 'invalid code -- missing end-of-block';
          state.mode = BAD;
          break;
        }

        /* build code tables -- note: do not change the lenbits or distbits
           values here (9 and 6) without reading the comments in inftrees.h
           concerning the ENOUGH constants, which depend on those values */
        state.lenbits = 9;

        opts = { bits: state.lenbits };
        ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.lenbits = opts.bits;
        // state.lencode = state.next;

        if (ret) {
          strm.msg = 'invalid literal/lengths set';
          state.mode = BAD;
          break;
        }

        state.distbits = 6;
        //state.distcode.copy(state.codes);
        // Switch to use dynamic table
        state.distcode = state.distdyn;
        opts = { bits: state.distbits };
        ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
        // We have separate tables & no pointers. 2 commented lines below not needed.
        // state.next_index = opts.table_index;
        state.distbits = opts.bits;
        // state.distcode = state.next;

        if (ret) {
          strm.msg = 'invalid distances set';
          state.mode = BAD;
          break;
        }
        //Tracev((stderr, 'inflate:       codes ok\n'));
        state.mode = LEN_;
        if (flush === Z_TREES) { break inf_leave; }
        /* falls through */
      case LEN_:
        state.mode = LEN;
        /* falls through */
      case LEN:
        if (have >= 6 && left >= 258) {
          //--- RESTORE() ---
          strm.next_out = put;
          strm.avail_out = left;
          strm.next_in = next;
          strm.avail_in = have;
          state.hold = hold;
          state.bits = bits;
          //---
          inflate_fast(strm, _out);
          //--- LOAD() ---
          put = strm.next_out;
          output = strm.output;
          left = strm.avail_out;
          next = strm.next_in;
          input = strm.input;
          have = strm.avail_in;
          hold = state.hold;
          bits = state.bits;
          //---

          if (state.mode === TYPE) {
            state.back = -1;
          }
          break;
        }
        state.back = 0;
        for (;;) {
          here = state.lencode[hold & ((1 << state.lenbits) - 1)];  /*BITS(state.lenbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if (here_bits <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if (here_op && (here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.lencode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        state.length = here_val;
        if (here_op === 0) {
          //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
          //        "inflate:         literal '%c'\n" :
          //        "inflate:         literal 0x%02x\n", here.val));
          state.mode = LIT;
          break;
        }
        if (here_op & 32) {
          //Tracevv((stderr, "inflate:         end of block\n"));
          state.back = -1;
          state.mode = TYPE;
          break;
        }
        if (here_op & 64) {
          strm.msg = 'invalid literal/length code';
          state.mode = BAD;
          break;
        }
        state.extra = here_op & 15;
        state.mode = LENEXT;
        /* falls through */
      case LENEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
        //Tracevv((stderr, "inflate:         length %u\n", state.length));
        state.was = state.length;
        state.mode = DIST;
        /* falls through */
      case DIST:
        for (;;) {
          here = state.distcode[hold & ((1 << state.distbits) - 1)];/*BITS(state.distbits)*/
          here_bits = here >>> 24;
          here_op = (here >>> 16) & 0xff;
          here_val = here & 0xffff;

          if ((here_bits) <= bits) { break; }
          //--- PULLBYTE() ---//
          if (have === 0) { break inf_leave; }
          have--;
          hold += input[next++] << bits;
          bits += 8;
          //---//
        }
        if ((here_op & 0xf0) === 0) {
          last_bits = here_bits;
          last_op = here_op;
          last_val = here_val;
          for (;;) {
            here = state.distcode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
            here_bits = here >>> 24;
            here_op = (here >>> 16) & 0xff;
            here_val = here & 0xffff;

            if ((last_bits + here_bits) <= bits) { break; }
            //--- PULLBYTE() ---//
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
            //---//
          }
          //--- DROPBITS(last.bits) ---//
          hold >>>= last_bits;
          bits -= last_bits;
          //---//
          state.back += last_bits;
        }
        //--- DROPBITS(here.bits) ---//
        hold >>>= here_bits;
        bits -= here_bits;
        //---//
        state.back += here_bits;
        if (here_op & 64) {
          strm.msg = 'invalid distance code';
          state.mode = BAD;
          break;
        }
        state.offset = here_val;
        state.extra = (here_op) & 15;
        state.mode = DISTEXT;
        /* falls through */
      case DISTEXT:
        if (state.extra) {
          //=== NEEDBITS(state.extra);
          n = state.extra;
          while (bits < n) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
          //--- DROPBITS(state.extra) ---//
          hold >>>= state.extra;
          bits -= state.extra;
          //---//
          state.back += state.extra;
        }
//#ifdef INFLATE_STRICT
        if (state.offset > state.dmax) {
          strm.msg = 'invalid distance too far back';
          state.mode = BAD;
          break;
        }
//#endif
        //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
        state.mode = MATCH;
        /* falls through */
      case MATCH:
        if (left === 0) { break inf_leave; }
        copy = _out - left;
        if (state.offset > copy) {         /* copy from window */
          copy = state.offset - copy;
          if (copy > state.whave) {
            if (state.sane) {
              strm.msg = 'invalid distance too far back';
              state.mode = BAD;
              break;
            }
// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
          }
          if (copy > state.wnext) {
            copy -= state.wnext;
            from = state.wsize - copy;
          }
          else {
            from = state.wnext - copy;
          }
          if (copy > state.length) { copy = state.length; }
          from_source = state.window;
        }
        else {                              /* copy from output */
          from_source = output;
          from = put - state.offset;
          copy = state.length;
        }
        if (copy > left) { copy = left; }
        left -= copy;
        state.length -= copy;
        do {
          output[put++] = from_source[from++];
        } while (--copy);
        if (state.length === 0) { state.mode = LEN; }
        break;
      case LIT:
        if (left === 0) { break inf_leave; }
        output[put++] = state.length;
        left--;
        state.mode = LEN;
        break;
      case CHECK:
        if (state.wrap) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            // Use '|' instead of '+' to make sure that result is signed
            hold |= input[next++] << bits;
            bits += 8;
          }
          //===//
          _out -= left;
          strm.total_out += _out;
          state.total += _out;
          if (_out) {
            strm.adler = state.check =
                /*UPDATE(state.check, put - _out, _out);*/
                (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));

          }
          _out = left;
          // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
          if ((state.flags ? hold : zswap32(hold)) !== state.check) {
            strm.msg = 'incorrect data check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   check matches trailer\n"));
        }
        state.mode = LENGTH;
        /* falls through */
      case LENGTH:
        if (state.wrap && state.flags) {
          //=== NEEDBITS(32);
          while (bits < 32) {
            if (have === 0) { break inf_leave; }
            have--;
            hold += input[next++] << bits;
            bits += 8;
          }
          //===//
          if (hold !== (state.total & 0xffffffff)) {
            strm.msg = 'incorrect length check';
            state.mode = BAD;
            break;
          }
          //=== INITBITS();
          hold = 0;
          bits = 0;
          //===//
          //Tracev((stderr, "inflate:   length matches trailer\n"));
        }
        state.mode = DONE;
        /* falls through */
      case DONE:
        ret = Z_STREAM_END;
        break inf_leave;
      case BAD:
        ret = Z_DATA_ERROR;
        break inf_leave;
      case MEM:
        return Z_MEM_ERROR;
      case SYNC:
        /* falls through */
      default:
        return Z_STREAM_ERROR;
    }
  }

  // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

  /*
     Return from inflate(), updating the total counts and the check value.
     If there was no progress during the inflate() call, return a buffer
     error.  Call updatewindow() to create and/or update the window state.
     Note: a memory error from inflate() is non-recoverable.
   */

  //--- RESTORE() ---
  strm.next_out = put;
  strm.avail_out = left;
  strm.next_in = next;
  strm.avail_in = have;
  state.hold = hold;
  state.bits = bits;
  //---

  if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
                      (state.mode < CHECK || flush !== Z_FINISH))) {
    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
      state.mode = MEM;
      return Z_MEM_ERROR;
    }
  }
  _in -= strm.avail_in;
  _out -= strm.avail_out;
  strm.total_in += _in;
  strm.total_out += _out;
  state.total += _out;
  if (state.wrap && _out) {
    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
      (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
  }
  strm.data_type = state.bits + (state.last ? 64 : 0) +
                    (state.mode === TYPE ? 128 : 0) +
                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
  if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {
    ret = Z_BUF_ERROR;
  }
  return ret;
}

function inflateEnd(strm) {

  if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/) {
    return Z_STREAM_ERROR;
  }

  var state = strm.state;
  if (state.window) {
    state.window = null;
  }
  strm.state = null;
  return Z_OK;
}

function inflateGetHeader(strm, head) {
  var state;

  /* check state */
  if (!strm || !strm.state) { return Z_STREAM_ERROR; }
  state = strm.state;
  if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR; }

  /* save header structure */
  state.head = head;
  head.done = false;
  return Z_OK;
}

function inflateSetDictionary(strm, dictionary) {
  var dictLength = dictionary.length;

  var state;
  var dictid;
  var ret;

  /* check state */
  if (!strm /* == Z_NULL */ || !strm.state /* == Z_NULL */) { return Z_STREAM_ERROR; }
  state = strm.state;

  if (state.wrap !== 0 && state.mode !== DICT) {
    return Z_STREAM_ERROR;
  }

  /* check for correct dictionary identifier */
  if (state.mode === DICT) {
    dictid = 1; /* adler32(0, null, 0)*/
    /* dictid = adler32(dictid, dictionary, dictLength); */
    dictid = adler32(dictid, dictionary, dictLength, 0);
    if (dictid !== state.check) {
      return Z_DATA_ERROR;
    }
  }
  /* copy dictionary to window using updatewindow(), which will amend the
   existing dictionary if appropriate */
  ret = updatewindow(strm, dictionary, dictLength, dictLength);
  if (ret) {
    state.mode = MEM;
    return Z_MEM_ERROR;
  }
  state.havedict = 1;
  // Tracev((stderr, "inflate:   dictionary set\n"));
  return Z_OK;
}

exports.inflateReset = inflateReset;
exports.inflateReset2 = inflateReset2;
exports.inflateResetKeep = inflateResetKeep;
exports.inflateInit = inflateInit;
exports.inflateInit2 = inflateInit2;
exports.inflate = inflate;
exports.inflateEnd = inflateEnd;
exports.inflateGetHeader = inflateGetHeader;
exports.inflateSetDictionary = inflateSetDictionary;
exports.inflateInfo = 'pako inflate (from Nodeca project)';

/* Not implemented
exports.inflateCopy = inflateCopy;
exports.inflateGetDictionary = inflateGetDictionary;
exports.inflateMark = inflateMark;
exports.inflatePrime = inflatePrime;
exports.inflateSync = inflateSync;
exports.inflateSyncPoint = inflateSyncPoint;
exports.inflateUndermine = inflateUndermine;
*/

},{"../utils/common":30,"./adler32":31,"./crc32":33,"./inffast":35,"./inftrees":37}],37:[function(require,module,exports){
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

var utils = require('../utils/common');

var MAXBITS = 15;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
//var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

var CODES = 0;
var LENS = 1;
var DISTS = 2;

var lbase = [ /* Length codes 257..285 base */
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
  35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
];

var lext = [ /* Length codes 257..285 extra */
  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
  19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
];

var dbase = [ /* Distance codes 0..29 base */
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
  8193, 12289, 16385, 24577, 0, 0
];

var dext = [ /* Distance codes 0..29 extra */
  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
  23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
  28, 28, 29, 29, 64, 64
];

module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts)
{
  var bits = opts.bits;
      //here = opts.here; /* table entry for duplication */

  var len = 0;               /* a code's length in bits */
  var sym = 0;               /* index of code symbols */
  var min = 0, max = 0;          /* minimum and maximum code lengths */
  var root = 0;              /* number of index bits for root table */
  var curr = 0;              /* number of index bits for current table */
  var drop = 0;              /* code bits to drop for sub-table */
  var left = 0;                   /* number of prefix codes available */
  var used = 0;              /* code entries in table used */
  var huff = 0;              /* Huffman code */
  var incr;              /* for incrementing code, index */
  var fill;              /* index for replicating entries */
  var low;               /* low bits for current root entry */
  var mask;              /* mask for low root bits */
  var next;             /* next available space in table */
  var base = null;     /* base value table to use */
  var base_index = 0;
//  var shoextra;    /* extra bits table to use */
  var end;                    /* use base and extra for symbol > end */
  var count = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
  var offs = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
  var extra = null;
  var extra_index = 0;

  var here_bits, here_op, here_val;

  /*
   Process a set of code lengths to create a canonical Huffman code.  The
   code lengths are lens[0..codes-1].  Each length corresponds to the
   symbols 0..codes-1.  The Huffman code is generated by first sorting the
   symbols by length from short to long, and retaining the symbol order
   for codes with equal lengths.  Then the code starts with all zero bits
   for the first code of the shortest length, and the codes are integer
   increments for the same length, and zeros are appended as the length
   increases.  For the deflate format, these bits are stored backwards
   from their more natural integer increment ordering, and so when the
   decoding tables are built in the large loop below, the integer codes
   are incremented backwards.

   This routine assumes, but does not check, that all of the entries in
   lens[] are in the range 0..MAXBITS.  The caller must assure this.
   1..MAXBITS is interpreted as that code length.  zero means that that
   symbol does not occur in this code.

   The codes are sorted by computing a count of codes for each length,
   creating from that a table of starting indices for each length in the
   sorted table, and then entering the symbols in order in the sorted
   table.  The sorted table is work[], with that space being provided by
   the caller.

   The length counts are used for other purposes as well, i.e. finding
   the minimum and maximum length codes, determining if there are any
   codes at all, checking for a valid set of lengths, and looking ahead
   at length counts to determine sub-table sizes when building the
   decoding tables.
   */

  /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
  for (len = 0; len <= MAXBITS; len++) {
    count[len] = 0;
  }
  for (sym = 0; sym < codes; sym++) {
    count[lens[lens_index + sym]]++;
  }

  /* bound code lengths, force root to be within code lengths */
  root = bits;
  for (max = MAXBITS; max >= 1; max--) {
    if (count[max] !== 0) { break; }
  }
  if (root > max) {
    root = max;
  }
  if (max === 0) {                     /* no symbols to code at all */
    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;


    //table.op[opts.table_index] = 64;
    //table.bits[opts.table_index] = 1;
    //table.val[opts.table_index++] = 0;
    table[table_index++] = (1 << 24) | (64 << 16) | 0;

    opts.bits = 1;
    return 0;     /* no symbols, but wait for decoding to report error */
  }
  for (min = 1; min < max; min++) {
    if (count[min] !== 0) { break; }
  }
  if (root < min) {
    root = min;
  }

  /* check for an over-subscribed or incomplete set of lengths */
  left = 1;
  for (len = 1; len <= MAXBITS; len++) {
    left <<= 1;
    left -= count[len];
    if (left < 0) {
      return -1;
    }        /* over-subscribed */
  }
  if (left > 0 && (type === CODES || max !== 1)) {
    return -1;                      /* incomplete set */
  }

  /* generate offsets into symbol table for each length for sorting */
  offs[1] = 0;
  for (len = 1; len < MAXBITS; len++) {
    offs[len + 1] = offs[len] + count[len];
  }

  /* sort symbols by length, by symbol order within each length */
  for (sym = 0; sym < codes; sym++) {
    if (lens[lens_index + sym] !== 0) {
      work[offs[lens[lens_index + sym]]++] = sym;
    }
  }

  /*
   Create and fill in decoding tables.  In this loop, the table being
   filled is at next and has curr index bits.  The code being used is huff
   with length len.  That code is converted to an index by dropping drop
   bits off of the bottom.  For codes where len is less than drop + curr,
   those top drop + curr - len bits are incremented through all values to
   fill the table with replicated entries.

   root is the number of index bits for the root table.  When len exceeds
   root, sub-tables are created pointed to by the root entry with an index
   of the low root bits of huff.  This is saved in low to check for when a
   new sub-table should be started.  drop is zero when the root table is
   being filled, and drop is root when sub-tables are being filled.

   When a new sub-table is needed, it is necessary to look ahead in the
   code lengths to determine what size sub-table is needed.  The length
   counts are used for this, and so count[] is decremented as codes are
   entered in the tables.

   used keeps track of how many table entries have been allocated from the
   provided *table space.  It is checked for LENS and DIST tables against
   the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
   the initial root table size constants.  See the comments in inftrees.h
   for more information.

   sym increments through all symbols, and the loop terminates when
   all codes of length max, i.e. all codes, have been processed.  This
   routine permits incomplete codes, so another loop after this one fills
   in the rest of the decoding tables with invalid code markers.
   */

  /* set up for code type */
  // poor man optimization - use if-else instead of switch,
  // to avoid deopts in old v8
  if (type === CODES) {
    base = extra = work;    /* dummy value--not used */
    end = 19;

  } else if (type === LENS) {
    base = lbase;
    base_index -= 257;
    extra = lext;
    extra_index -= 257;
    end = 256;

  } else {                    /* DISTS */
    base = dbase;
    extra = dext;
    end = -1;
  }

  /* initialize opts for loop */
  huff = 0;                   /* starting code */
  sym = 0;                    /* starting code symbol */
  len = min;                  /* starting code length */
  next = table_index;              /* current table to fill in */
  curr = root;                /* current table index bits */
  drop = 0;                   /* current bits to drop from code for index */
  low = -1;                   /* trigger new sub-table when len > root */
  used = 1 << root;          /* use root table entries */
  mask = used - 1;            /* mask for comparing low */

  /* check available table space */
  if ((type === LENS && used > ENOUGH_LENS) ||
    (type === DISTS && used > ENOUGH_DISTS)) {
    return 1;
  }

  /* process all codes and make table entries */
  for (;;) {
    /* create table entry */
    here_bits = len - drop;
    if (work[sym] < end) {
      here_op = 0;
      here_val = work[sym];
    }
    else if (work[sym] > end) {
      here_op = extra[extra_index + work[sym]];
      here_val = base[base_index + work[sym]];
    }
    else {
      here_op = 32 + 64;         /* end of block */
      here_val = 0;
    }

    /* replicate for those indices with low len bits equal to huff */
    incr = 1 << (len - drop);
    fill = 1 << curr;
    min = fill;                 /* save offset to next table */
    do {
      fill -= incr;
      table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
    } while (fill !== 0);

    /* backwards increment the len-bit code huff */
    incr = 1 << (len - 1);
    while (huff & incr) {
      incr >>= 1;
    }
    if (incr !== 0) {
      huff &= incr - 1;
      huff += incr;
    } else {
      huff = 0;
    }

    /* go to next symbol, update count, len */
    sym++;
    if (--count[len] === 0) {
      if (len === max) { break; }
      len = lens[lens_index + work[sym]];
    }

    /* create new sub-table if needed */
    if (len > root && (huff & mask) !== low) {
      /* if first time, transition to sub-tables */
      if (drop === 0) {
        drop = root;
      }

      /* increment past last table */
      next += min;            /* here min is 1 << curr */

      /* determine length of next table */
      curr = len - drop;
      left = 1 << curr;
      while (curr + drop < max) {
        left -= count[curr + drop];
        if (left <= 0) { break; }
        curr++;
        left <<= 1;
      }

      /* check for enough space */
      used += 1 << curr;
      if ((type === LENS && used > ENOUGH_LENS) ||
        (type === DISTS && used > ENOUGH_DISTS)) {
        return 1;
      }

      /* point entry in root table to sub-table */
      low = huff & mask;
      /*table.op[low] = curr;
      table.bits[low] = root;
      table.val[low] = next - opts.table_index;*/
      table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
    }
  }

  /* fill in remaining table entry if code is incomplete (guaranteed to have
   at most one remaining entry, since if the code is incomplete, the
   maximum code length that was allowed to get this far is one bit) */
  if (huff !== 0) {
    //table.op[next + huff] = 64;            /* invalid code marker */
    //table.bits[next + huff] = len - drop;
    //table.val[next + huff] = 0;
    table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
  }

  /* set return parameters */
  //opts.table_index += used;
  opts.bits = root;
  return 0;
};

},{"../utils/common":30}],38:[function(require,module,exports){
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

module.exports = {
  2:      'need dictionary',     /* Z_NEED_DICT       2  */
  1:      'stream end',          /* Z_STREAM_END      1  */
  0:      '',                    /* Z_OK              0  */
  '-1':   'file error',          /* Z_ERRNO         (-1) */
  '-2':   'stream error',        /* Z_STREAM_ERROR  (-2) */
  '-3':   'data error',          /* Z_DATA_ERROR    (-3) */
  '-4':   'insufficient memory', /* Z_MEM_ERROR     (-4) */
  '-5':   'buffer error',        /* Z_BUF_ERROR     (-5) */
  '-6':   'incompatible version' /* Z_VERSION_ERROR (-6) */
};

},{}],39:[function(require,module,exports){
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

/* eslint-disable space-unary-ops */

var utils = require('../utils/common');

/* Public constants ==========================================================*/
/* ===========================================================================*/


//var Z_FILTERED          = 1;
//var Z_HUFFMAN_ONLY      = 2;
//var Z_RLE               = 3;
var Z_FIXED               = 4;
//var Z_DEFAULT_STRATEGY  = 0;

/* Possible values of the data_type field (though see inflate()) */
var Z_BINARY              = 0;
var Z_TEXT                = 1;
//var Z_ASCII             = 1; // = Z_TEXT
var Z_UNKNOWN             = 2;

/*============================================================================*/


function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }

// From zutil.h

var STORED_BLOCK = 0;
var STATIC_TREES = 1;
var DYN_TREES    = 2;
/* The three kinds of block type */

var MIN_MATCH    = 3;
var MAX_MATCH    = 258;
/* The minimum and maximum match lengths */

// From deflate.h
/* ===========================================================================
 * Internal compression state.
 */

var LENGTH_CODES  = 29;
/* number of length codes, not counting the special END_BLOCK code */

var LITERALS      = 256;
/* number of literal bytes 0..255 */

var L_CODES       = LITERALS + 1 + LENGTH_CODES;
/* number of Literal or Length codes, including the END_BLOCK code */

var D_CODES       = 30;
/* number of distance codes */

var BL_CODES      = 19;
/* number of codes used to transfer the bit lengths */

var HEAP_SIZE     = 2 * L_CODES + 1;
/* maximum heap size */

var MAX_BITS      = 15;
/* All codes must not exceed MAX_BITS bits */

var Buf_size      = 16;
/* size of bit buffer in bi_buf */


/* ===========================================================================
 * Constants
 */

var MAX_BL_BITS = 7;
/* Bit length codes must not exceed MAX_BL_BITS bits */

var END_BLOCK   = 256;
/* end of block literal code */

var REP_3_6     = 16;
/* repeat previous bit length 3-6 times (2 bits of repeat count) */

var REPZ_3_10   = 17;
/* repeat a zero length 3-10 times  (3 bits of repeat count) */

var REPZ_11_138 = 18;
/* repeat a zero length 11-138 times  (7 bits of repeat count) */

/* eslint-disable comma-spacing,array-bracket-spacing */
var extra_lbits =   /* extra bits for each length code */
  [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];

var extra_dbits =   /* extra bits for each distance code */
  [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];

var extra_blbits =  /* extra bits for each bit length code */
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7];

var bl_order =
  [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
/* eslint-enable comma-spacing,array-bracket-spacing */

/* The lengths of the bit length codes are sent in order of decreasing
 * probability, to avoid transmitting the lengths for unused bit length codes.
 */

/* ===========================================================================
 * Local data. These are initialized only once.
 */

// We pre-fill arrays with 0 to avoid uninitialized gaps

var DIST_CODE_LEN = 512; /* see definition of array dist_code below */

// !!!! Use flat array instead of structure, Freq = i*2, Len = i*2+1
var static_ltree  = new Array((L_CODES + 2) * 2);
zero(static_ltree);
/* The static literal tree. Since the bit lengths are imposed, there is no
 * need for the L_CODES extra codes used during heap construction. However
 * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
 * below).
 */

var static_dtree  = new Array(D_CODES * 2);
zero(static_dtree);
/* The static distance tree. (Actually a trivial tree since all codes use
 * 5 bits.)
 */

var _dist_code    = new Array(DIST_CODE_LEN);
zero(_dist_code);
/* Distance codes. The first 256 values correspond to the distances
 * 3 .. 258, the last 256 values correspond to the top 8 bits of
 * the 15 bit distances.
 */

var _length_code  = new Array(MAX_MATCH - MIN_MATCH + 1);
zero(_length_code);
/* length code for each normalized match length (0 == MIN_MATCH) */

var base_length   = new Array(LENGTH_CODES);
zero(base_length);
/* First normalized length for each code (0 = MIN_MATCH) */

var base_dist     = new Array(D_CODES);
zero(base_dist);
/* First normalized distance for each code (0 = distance of 1) */


function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

  this.static_tree  = static_tree;  /* static tree or NULL */
  this.extra_bits   = extra_bits;   /* extra bits for each code or NULL */
  this.extra_base   = extra_base;   /* base index for extra_bits */
  this.elems        = elems;        /* max number of elements in the tree */
  this.max_length   = max_length;   /* max bit length for the codes */

  // show if `static_tree` has data or dummy - needed for monomorphic objects
  this.has_stree    = static_tree && static_tree.length;
}


var static_l_desc;
var static_d_desc;
var static_bl_desc;


function TreeDesc(dyn_tree, stat_desc) {
  this.dyn_tree = dyn_tree;     /* the dynamic tree */
  this.max_code = 0;            /* largest code with non zero frequency */
  this.stat_desc = stat_desc;   /* the corresponding static tree */
}



function d_code(dist) {
  return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
}


/* ===========================================================================
 * Output a short LSB first on the stream.
 * IN assertion: there is enough room in pendingBuf.
 */
function put_short(s, w) {
//    put_byte(s, (uch)((w) & 0xff));
//    put_byte(s, (uch)((ush)(w) >> 8));
  s.pending_buf[s.pending++] = (w) & 0xff;
  s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
}


/* ===========================================================================
 * Send a value on a given number of bits.
 * IN assertion: length <= 16 and value fits in length bits.
 */
function send_bits(s, value, length) {
  if (s.bi_valid > (Buf_size - length)) {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    put_short(s, s.bi_buf);
    s.bi_buf = value >> (Buf_size - s.bi_valid);
    s.bi_valid += length - Buf_size;
  } else {
    s.bi_buf |= (value << s.bi_valid) & 0xffff;
    s.bi_valid += length;
  }
}


function send_code(s, c, tree) {
  send_bits(s, tree[c * 2]/*.Code*/, tree[c * 2 + 1]/*.Len*/);
}


/* ===========================================================================
 * Reverse the first len bits of a code, using straightforward code (a faster
 * method would use a table)
 * IN assertion: 1 <= len <= 15
 */
function bi_reverse(code, len) {
  var res = 0;
  do {
    res |= code & 1;
    code >>>= 1;
    res <<= 1;
  } while (--len > 0);
  return res >>> 1;
}


/* ===========================================================================
 * Flush the bit buffer, keeping at most 7 bits in it.
 */
function bi_flush(s) {
  if (s.bi_valid === 16) {
    put_short(s, s.bi_buf);
    s.bi_buf = 0;
    s.bi_valid = 0;

  } else if (s.bi_valid >= 8) {
    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
    s.bi_buf >>= 8;
    s.bi_valid -= 8;
  }
}


/* ===========================================================================
 * Compute the optimal bit lengths for a tree and update the total bit length
 * for the current block.
 * IN assertion: the fields freq and dad are set, heap[heap_max] and
 *    above are the tree nodes sorted by increasing frequency.
 * OUT assertions: the field len is set to the optimal bit length, the
 *     array bl_count contains the frequencies for each bit length.
 *     The length opt_len is updated; static_len is also updated if stree is
 *     not null.
 */
function gen_bitlen(s, desc)
//    deflate_state *s;
//    tree_desc *desc;    /* the tree descriptor */
{
  var tree            = desc.dyn_tree;
  var max_code        = desc.max_code;
  var stree           = desc.stat_desc.static_tree;
  var has_stree       = desc.stat_desc.has_stree;
  var extra           = desc.stat_desc.extra_bits;
  var base            = desc.stat_desc.extra_base;
  var max_length      = desc.stat_desc.max_length;
  var h;              /* heap index */
  var n, m;           /* iterate over the tree elements */
  var bits;           /* bit length */
  var xbits;          /* extra bits */
  var f;              /* frequency */
  var overflow = 0;   /* number of elements with bit length too large */

  for (bits = 0; bits <= MAX_BITS; bits++) {
    s.bl_count[bits] = 0;
  }

  /* In a first pass, compute the optimal bit lengths (which may
   * overflow in the case of the bit length tree).
   */
  tree[s.heap[s.heap_max] * 2 + 1]/*.Len*/ = 0; /* root of the heap */

  for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
    n = s.heap[h];
    bits = tree[tree[n * 2 + 1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
    if (bits > max_length) {
      bits = max_length;
      overflow++;
    }
    tree[n * 2 + 1]/*.Len*/ = bits;
    /* We overwrite tree[n].Dad which is no longer needed */

    if (n > max_code) { continue; } /* not a leaf node */

    s.bl_count[bits]++;
    xbits = 0;
    if (n >= base) {
      xbits = extra[n - base];
    }
    f = tree[n * 2]/*.Freq*/;
    s.opt_len += f * (bits + xbits);
    if (has_stree) {
      s.static_len += f * (stree[n * 2 + 1]/*.Len*/ + xbits);
    }
  }
  if (overflow === 0) { return; }

  // Trace((stderr,"\nbit length overflow\n"));
  /* This happens for example on obj2 and pic of the Calgary corpus */

  /* Find the first bit length which could increase: */
  do {
    bits = max_length - 1;
    while (s.bl_count[bits] === 0) { bits--; }
    s.bl_count[bits]--;      /* move one leaf down the tree */
    s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
    s.bl_count[max_length]--;
    /* The brother of the overflow item also moves one step up,
     * but this does not affect bl_count[max_length]
     */
    overflow -= 2;
  } while (overflow > 0);

  /* Now recompute all bit lengths, scanning in increasing frequency.
   * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
   * lengths instead of fixing only the wrong ones. This idea is taken
   * from 'ar' written by Haruhiko Okumura.)
   */
  for (bits = max_length; bits !== 0; bits--) {
    n = s.bl_count[bits];
    while (n !== 0) {
      m = s.heap[--h];
      if (m > max_code) { continue; }
      if (tree[m * 2 + 1]/*.Len*/ !== bits) {
        // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
        s.opt_len += (bits - tree[m * 2 + 1]/*.Len*/) * tree[m * 2]/*.Freq*/;
        tree[m * 2 + 1]/*.Len*/ = bits;
      }
      n--;
    }
  }
}


/* ===========================================================================
 * Generate the codes for a given tree and bit counts (which need not be
 * optimal).
 * IN assertion: the array bl_count contains the bit length statistics for
 * the given tree and the field len is set for all tree elements.
 * OUT assertion: the field code is set for all tree elements of non
 *     zero code length.
 */
function gen_codes(tree, max_code, bl_count)
//    ct_data *tree;             /* the tree to decorate */
//    int max_code;              /* largest code with non zero frequency */
//    ushf *bl_count;            /* number of codes at each bit length */
{
  var next_code = new Array(MAX_BITS + 1); /* next code value for each bit length */
  var code = 0;              /* running code value */
  var bits;                  /* bit index */
  var n;                     /* code index */

  /* The distribution counts are first used to generate the code values
   * without bit reversal.
   */
  for (bits = 1; bits <= MAX_BITS; bits++) {
    next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
  }
  /* Check that the bit counts in bl_count are consistent. The last code
   * must be all ones.
   */
  //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
  //        "inconsistent bit counts");
  //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

  for (n = 0;  n <= max_code; n++) {
    var len = tree[n * 2 + 1]/*.Len*/;
    if (len === 0) { continue; }
    /* Now reverse the bits */
    tree[n * 2]/*.Code*/ = bi_reverse(next_code[len]++, len);

    //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
  }
}


/* ===========================================================================
 * Initialize the various 'constant' tables.
 */
function tr_static_init() {
  var n;        /* iterates over tree elements */
  var bits;     /* bit counter */
  var length;   /* length value */
  var code;     /* code value */
  var dist;     /* distance index */
  var bl_count = new Array(MAX_BITS + 1);
  /* number of codes at each bit length for an optimal tree */

  // do check in _tr_init()
  //if (static_init_done) return;

  /* For some embedded targets, global variables are not initialized: */
/*#ifdef NO_INIT_GLOBAL_POINTERS
  static_l_desc.static_tree = static_ltree;
  static_l_desc.extra_bits = extra_lbits;
  static_d_desc.static_tree = static_dtree;
  static_d_desc.extra_bits = extra_dbits;
  static_bl_desc.extra_bits = extra_blbits;
#endif*/

  /* Initialize the mapping length (0..255) -> length code (0..28) */
  length = 0;
  for (code = 0; code < LENGTH_CODES - 1; code++) {
    base_length[code] = length;
    for (n = 0; n < (1 << extra_lbits[code]); n++) {
      _length_code[length++] = code;
    }
  }
  //Assert (length == 256, "tr_static_init: length != 256");
  /* Note that the length 255 (match length 258) can be represented
   * in two different ways: code 284 + 5 bits or code 285, so we
   * overwrite length_code[255] to use the best encoding:
   */
  _length_code[length - 1] = code;

  /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
  dist = 0;
  for (code = 0; code < 16; code++) {
    base_dist[code] = dist;
    for (n = 0; n < (1 << extra_dbits[code]); n++) {
      _dist_code[dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: dist != 256");
  dist >>= 7; /* from now on, all distances are divided by 128 */
  for (; code < D_CODES; code++) {
    base_dist[code] = dist << 7;
    for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
      _dist_code[256 + dist++] = code;
    }
  }
  //Assert (dist == 256, "tr_static_init: 256+dist != 512");

  /* Construct the codes of the static literal tree */
  for (bits = 0; bits <= MAX_BITS; bits++) {
    bl_count[bits] = 0;
  }

  n = 0;
  while (n <= 143) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  while (n <= 255) {
    static_ltree[n * 2 + 1]/*.Len*/ = 9;
    n++;
    bl_count[9]++;
  }
  while (n <= 279) {
    static_ltree[n * 2 + 1]/*.Len*/ = 7;
    n++;
    bl_count[7]++;
  }
  while (n <= 287) {
    static_ltree[n * 2 + 1]/*.Len*/ = 8;
    n++;
    bl_count[8]++;
  }
  /* Codes 286 and 287 do not exist, but we must include them in the
   * tree construction to get a canonical Huffman tree (longest code
   * all ones)
   */
  gen_codes(static_ltree, L_CODES + 1, bl_count);

  /* The static distance tree is trivial: */
  for (n = 0; n < D_CODES; n++) {
    static_dtree[n * 2 + 1]/*.Len*/ = 5;
    static_dtree[n * 2]/*.Code*/ = bi_reverse(n, 5);
  }

  // Now data ready and we can init static trees
  static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
  static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES, MAX_BITS);
  static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES, MAX_BL_BITS);

  //static_init_done = true;
}


/* ===========================================================================
 * Initialize a new block.
 */
function init_block(s) {
  var n; /* iterates over tree elements */

  /* Initialize the trees. */
  for (n = 0; n < L_CODES;  n++) { s.dyn_ltree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < D_CODES;  n++) { s.dyn_dtree[n * 2]/*.Freq*/ = 0; }
  for (n = 0; n < BL_CODES; n++) { s.bl_tree[n * 2]/*.Freq*/ = 0; }

  s.dyn_ltree[END_BLOCK * 2]/*.Freq*/ = 1;
  s.opt_len = s.static_len = 0;
  s.last_lit = s.matches = 0;
}


/* ===========================================================================
 * Flush the bit buffer and align the output on a byte boundary
 */
function bi_windup(s)
{
  if (s.bi_valid > 8) {
    put_short(s, s.bi_buf);
  } else if (s.bi_valid > 0) {
    //put_byte(s, (Byte)s->bi_buf);
    s.pending_buf[s.pending++] = s.bi_buf;
  }
  s.bi_buf = 0;
  s.bi_valid = 0;
}

/* ===========================================================================
 * Copy a stored block, storing first the length and its
 * one's complement if requested.
 */
function copy_block(s, buf, len, header)
//DeflateState *s;
//charf    *buf;    /* the input data */
//unsigned len;     /* its length */
//int      header;  /* true if block header must be written */
{
  bi_windup(s);        /* align on byte boundary */

  if (header) {
    put_short(s, len);
    put_short(s, ~len);
  }
//  while (len--) {
//    put_byte(s, *buf++);
//  }
  utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
  s.pending += len;
}

/* ===========================================================================
 * Compares to subtrees, using the tree depth as tie breaker when
 * the subtrees have equal frequency. This minimizes the worst case length.
 */
function smaller(tree, n, m, depth) {
  var _n2 = n * 2;
  var _m2 = m * 2;
  return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
         (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
}

/* ===========================================================================
 * Restore the heap property by moving down the tree starting at node k,
 * exchanging a node with the smallest of its two sons if necessary, stopping
 * when the heap property is re-established (each father smaller than its
 * two sons).
 */
function pqdownheap(s, tree, k)
//    deflate_state *s;
//    ct_data *tree;  /* the tree to restore */
//    int k;               /* node to move down */
{
  var v = s.heap[k];
  var j = k << 1;  /* left son of k */
  while (j <= s.heap_len) {
    /* Set j to the smallest of the two sons: */
    if (j < s.heap_len &&
      smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
      j++;
    }
    /* Exit if v is smaller than both sons */
    if (smaller(tree, v, s.heap[j], s.depth)) { break; }

    /* Exchange v with the smallest son */
    s.heap[k] = s.heap[j];
    k = j;

    /* And continue down the tree, setting j to the left son of k */
    j <<= 1;
  }
  s.heap[k] = v;
}


// inlined manually
// var SMALLEST = 1;

/* ===========================================================================
 * Send the block data compressed using the given Huffman trees
 */
function compress_block(s, ltree, dtree)
//    deflate_state *s;
//    const ct_data *ltree; /* literal tree */
//    const ct_data *dtree; /* distance tree */
{
  var dist;           /* distance of matched string */
  var lc;             /* match length or unmatched char (if dist == 0) */
  var lx = 0;         /* running index in l_buf */
  var code;           /* the code to send */
  var extra;          /* number of extra bits to send */

  if (s.last_lit !== 0) {
    do {
      dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
      lc = s.pending_buf[s.l_buf + lx];
      lx++;

      if (dist === 0) {
        send_code(s, lc, ltree); /* send a literal byte */
        //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
      } else {
        /* Here, lc is the match length - MIN_MATCH */
        code = _length_code[lc];
        send_code(s, code + LITERALS + 1, ltree); /* send the length code */
        extra = extra_lbits[code];
        if (extra !== 0) {
          lc -= base_length[code];
          send_bits(s, lc, extra);       /* send the extra length bits */
        }
        dist--; /* dist is now the match distance - 1 */
        code = d_code(dist);
        //Assert (code < D_CODES, "bad d_code");

        send_code(s, code, dtree);       /* send the distance code */
        extra = extra_dbits[code];
        if (extra !== 0) {
          dist -= base_dist[code];
          send_bits(s, dist, extra);   /* send the extra distance bits */
        }
      } /* literal or match pair ? */

      /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
      //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
      //       "pendingBuf overflow");

    } while (lx < s.last_lit);
  }

  send_code(s, END_BLOCK, ltree);
}


/* ===========================================================================
 * Construct one Huffman tree and assigns the code bit strings and lengths.
 * Update the total bit length for the current block.
 * IN assertion: the field freq is set for all tree elements.
 * OUT assertions: the fields len and code are set to the optimal bit length
 *     and corresponding code. The length opt_len is updated; static_len is
 *     also updated if stree is not null. The field max_code is set.
 */
function build_tree(s, desc)
//    deflate_state *s;
//    tree_desc *desc; /* the tree descriptor */
{
  var tree     = desc.dyn_tree;
  var stree    = desc.stat_desc.static_tree;
  var has_stree = desc.stat_desc.has_stree;
  var elems    = desc.stat_desc.elems;
  var n, m;          /* iterate over heap elements */
  var max_code = -1; /* largest code with non zero frequency */
  var node;          /* new node being created */

  /* Construct the initial heap, with least frequent element in
   * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
   * heap[0] is not used.
   */
  s.heap_len = 0;
  s.heap_max = HEAP_SIZE;

  for (n = 0; n < elems; n++) {
    if (tree[n * 2]/*.Freq*/ !== 0) {
      s.heap[++s.heap_len] = max_code = n;
      s.depth[n] = 0;

    } else {
      tree[n * 2 + 1]/*.Len*/ = 0;
    }
  }

  /* The pkzip format requires that at least one distance code exists,
   * and that at least one bit should be sent even if there is only one
   * possible code. So to avoid special checks later on we force at least
   * two codes of non zero frequency.
   */
  while (s.heap_len < 2) {
    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
    tree[node * 2]/*.Freq*/ = 1;
    s.depth[node] = 0;
    s.opt_len--;

    if (has_stree) {
      s.static_len -= stree[node * 2 + 1]/*.Len*/;
    }
    /* node is 0 or 1 so it does not have extra bits */
  }
  desc.max_code = max_code;

  /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
   * establish sub-heaps of increasing lengths:
   */
  for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) { pqdownheap(s, tree, n); }

  /* Construct the Huffman tree by repeatedly combining the least two
   * frequent nodes.
   */
  node = elems;              /* next internal node of the tree */
  do {
    //pqremove(s, tree, n);  /* n = node of least frequency */
    /*** pqremove ***/
    n = s.heap[1/*SMALLEST*/];
    s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
    pqdownheap(s, tree, 1/*SMALLEST*/);
    /***/

    m = s.heap[1/*SMALLEST*/]; /* m = node of next least frequency */

    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
    s.heap[--s.heap_max] = m;

    /* Create a new node father of n and m */
    tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
    tree[n * 2 + 1]/*.Dad*/ = tree[m * 2 + 1]/*.Dad*/ = node;

    /* and insert the new node in the heap */
    s.heap[1/*SMALLEST*/] = node++;
    pqdownheap(s, tree, 1/*SMALLEST*/);

  } while (s.heap_len >= 2);

  s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

  /* At this point, the fields freq and dad are set. We can now
   * generate the bit lengths.
   */
  gen_bitlen(s, desc);

  /* The field len is now set, we can generate the bit codes */
  gen_codes(tree, max_code, s.bl_count);
}


/* ===========================================================================
 * Scan a literal or distance tree to determine the frequencies of the codes
 * in the bit length tree.
 */
function scan_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree;   /* the tree to be scanned */
//    int max_code;    /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }
  tree[(max_code + 1) * 2 + 1]/*.Len*/ = 0xffff; /* guard */

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      s.bl_tree[curlen * 2]/*.Freq*/ += count;

    } else if (curlen !== 0) {

      if (curlen !== prevlen) { s.bl_tree[curlen * 2]/*.Freq*/++; }
      s.bl_tree[REP_3_6 * 2]/*.Freq*/++;

    } else if (count <= 10) {
      s.bl_tree[REPZ_3_10 * 2]/*.Freq*/++;

    } else {
      s.bl_tree[REPZ_11_138 * 2]/*.Freq*/++;
    }

    count = 0;
    prevlen = curlen;

    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Send a literal or distance tree in compressed form, using the codes in
 * bl_tree.
 */
function send_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree; /* the tree to be scanned */
//    int max_code;       /* and its largest code of non zero frequency */
{
  var n;                     /* iterates over all tree elements */
  var prevlen = -1;          /* last emitted length */
  var curlen;                /* length of current code */

  var nextlen = tree[0 * 2 + 1]/*.Len*/; /* length of next code */

  var count = 0;             /* repeat count of the current code */
  var max_count = 7;         /* max repeat count */
  var min_count = 4;         /* min repeat count */

  /* tree[max_code+1].Len = -1; */  /* guard already set */
  if (nextlen === 0) {
    max_count = 138;
    min_count = 3;
  }

  for (n = 0; n <= max_code; n++) {
    curlen = nextlen;
    nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

    if (++count < max_count && curlen === nextlen) {
      continue;

    } else if (count < min_count) {
      do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);

    } else if (curlen !== 0) {
      if (curlen !== prevlen) {
        send_code(s, curlen, s.bl_tree);
        count--;
      }
      //Assert(count >= 3 && count <= 6, " 3_6?");
      send_code(s, REP_3_6, s.bl_tree);
      send_bits(s, count - 3, 2);

    } else if (count <= 10) {
      send_code(s, REPZ_3_10, s.bl_tree);
      send_bits(s, count - 3, 3);

    } else {
      send_code(s, REPZ_11_138, s.bl_tree);
      send_bits(s, count - 11, 7);
    }

    count = 0;
    prevlen = curlen;
    if (nextlen === 0) {
      max_count = 138;
      min_count = 3;

    } else if (curlen === nextlen) {
      max_count = 6;
      min_count = 3;

    } else {
      max_count = 7;
      min_count = 4;
    }
  }
}


/* ===========================================================================
 * Construct the Huffman tree for the bit lengths and return the index in
 * bl_order of the last bit length code to send.
 */
function build_bl_tree(s) {
  var max_blindex;  /* index of last bit length code of non zero freq */

  /* Determine the bit length frequencies for literal and distance trees */
  scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
  scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

  /* Build the bit length tree: */
  build_tree(s, s.bl_desc);
  /* opt_len now includes the length of the tree representations, except
   * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
   */

  /* Determine the number of bit length codes to send. The pkzip format
   * requires that at least 4 bit length codes be sent. (appnote.txt says
   * 3 but the actual value used is 4.)
   */
  for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
    if (s.bl_tree[bl_order[max_blindex] * 2 + 1]/*.Len*/ !== 0) {
      break;
    }
  }
  /* Update opt_len to include the bit length tree and counts */
  s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
  //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
  //        s->opt_len, s->static_len));

  return max_blindex;
}


/* ===========================================================================
 * Send the header for a block using dynamic Huffman trees: the counts, the
 * lengths of the bit length codes, the literal tree and the distance tree.
 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
 */
function send_all_trees(s, lcodes, dcodes, blcodes)
//    deflate_state *s;
//    int lcodes, dcodes, blcodes; /* number of codes for each tree */
{
  var rank;                    /* index in bl_order */

  //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
  //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
  //        "too many codes");
  //Tracev((stderr, "\nbl counts: "));
  send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
  send_bits(s, dcodes - 1,   5);
  send_bits(s, blcodes - 4,  4); /* not -3 as stated in appnote.txt */
  for (rank = 0; rank < blcodes; rank++) {
    //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1]/*.Len*/, 3);
  }
  //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
  //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

  send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
  //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
}


/* ===========================================================================
 * Check if the data type is TEXT or BINARY, using the following algorithm:
 * - TEXT if the two conditions below are satisfied:
 *    a) There are no non-portable control characters belonging to the
 *       "black list" (0..6, 14..25, 28..31).
 *    b) There is at least one printable character belonging to the
 *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
 * - BINARY otherwise.
 * - The following partially-portable control characters form a
 *   "gray list" that is ignored in this detection algorithm:
 *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
 * IN assertion: the fields Freq of dyn_ltree are set.
 */
function detect_data_type(s) {
  /* black_mask is the bit mask of black-listed bytes
   * set bits 0..6, 14..25, and 28..31
   * 0xf3ffc07f = binary 11110011111111111100000001111111
   */
  var black_mask = 0xf3ffc07f;
  var n;

  /* Check for non-textual ("black-listed") bytes. */
  for (n = 0; n <= 31; n++, black_mask >>>= 1) {
    if ((black_mask & 1) && (s.dyn_ltree[n * 2]/*.Freq*/ !== 0)) {
      return Z_BINARY;
    }
  }

  /* Check for textual ("white-listed") bytes. */
  if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
      s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
    return Z_TEXT;
  }
  for (n = 32; n < LITERALS; n++) {
    if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
      return Z_TEXT;
    }
  }

  /* There are no "black-listed" or "white-listed" bytes:
   * this stream either is empty or has tolerated ("gray-listed") bytes only.
   */
  return Z_BINARY;
}


var static_init_done = false;

/* ===========================================================================
 * Initialize the tree data structures for a new zlib stream.
 */
function _tr_init(s)
{

  if (!static_init_done) {
    tr_static_init();
    static_init_done = true;
  }

  s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
  s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
  s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

  s.bi_buf = 0;
  s.bi_valid = 0;

  /* Initialize the first block of the first file: */
  init_block(s);
}


/* ===========================================================================
 * Send a stored block
 */
function _tr_stored_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);    /* send block type */
  copy_block(s, buf, stored_len, true); /* with header */
}


/* ===========================================================================
 * Send one empty static block to give enough lookahead for inflate.
 * This takes 10 bits, of which 7 may remain in the bit buffer.
 */
function _tr_align(s) {
  send_bits(s, STATIC_TREES << 1, 3);
  send_code(s, END_BLOCK, static_ltree);
  bi_flush(s);
}


/* ===========================================================================
 * Determine the best encoding for the current block: dynamic trees, static
 * trees or store, and output the encoded block to the zip file.
 */
function _tr_flush_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block, or NULL if too old */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
{
  var opt_lenb, static_lenb;  /* opt_len and static_len in bytes */
  var max_blindex = 0;        /* index of last bit length code of non zero freq */

  /* Build the Huffman trees unless a stored block is forced */
  if (s.level > 0) {

    /* Check if the file is binary or text */
    if (s.strm.data_type === Z_UNKNOWN) {
      s.strm.data_type = detect_data_type(s);
    }

    /* Construct the literal and distance trees */
    build_tree(s, s.l_desc);
    // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));

    build_tree(s, s.d_desc);
    // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
    //        s->static_len));
    /* At this point, opt_len and static_len are the total bit lengths of
     * the compressed block data, excluding the tree representations.
     */

    /* Build the bit length tree for the above two trees, and get the index
     * in bl_order of the last bit length code to send.
     */
    max_blindex = build_bl_tree(s);

    /* Determine the best encoding. Compute the block lengths in bytes. */
    opt_lenb = (s.opt_len + 3 + 7) >>> 3;
    static_lenb = (s.static_len + 3 + 7) >>> 3;

    // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
    //        s->last_lit));

    if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }

  } else {
    // Assert(buf != (char*)0, "lost buf");
    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
  }

  if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
    /* 4: two words for the lengths */

    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
     * Otherwise we can't have processed more than WSIZE input bytes since
     * the last block flush, because compression would have been
     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
     * transform a block into a stored block.
     */
    _tr_stored_block(s, buf, stored_len, last);

  } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {

    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
    compress_block(s, static_ltree, static_dtree);

  } else {
    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
    compress_block(s, s.dyn_ltree, s.dyn_dtree);
  }
  // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
  /* The above check is made mod 2^32, for files larger than 512 MB
   * and uLong implemented on 32 bits.
   */
  init_block(s);

  if (last) {
    bi_windup(s);
  }
  // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
  //       s->compressed_len-7*last));
}

/* ===========================================================================
 * Save the match info and tally the frequency counts. Return true if
 * the current block must be flushed.
 */
function _tr_tally(s, dist, lc)
//    deflate_state *s;
//    unsigned dist;  /* distance of matched string */
//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
{
  //var out_length, in_length, dcode;

  s.pending_buf[s.d_buf + s.last_lit * 2]     = (dist >>> 8) & 0xff;
  s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

  s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
  s.last_lit++;

  if (dist === 0) {
    /* lc is the unmatched char */
    s.dyn_ltree[lc * 2]/*.Freq*/++;
  } else {
    s.matches++;
    /* Here, lc is the match length - MIN_MATCH */
    dist--;             /* dist = match distance - 1 */
    //Assert((ush)dist < (ush)MAX_DIST(s) &&
    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
    //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

    s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]/*.Freq*/++;
    s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
  }

// (!) This block is disabled in zlib defaults,
// don't enable it for binary compatibility

//#ifdef TRUNCATE_BLOCK
//  /* Try to guess if it is profitable to stop the current block here */
//  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
//    /* Compute an upper bound for the compressed length */
//    out_length = s.last_lit*8;
//    in_length = s.strstart - s.block_start;
//
//    for (dcode = 0; dcode < D_CODES; dcode++) {
//      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
//    }
//    out_length >>>= 3;
//    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
//    //       s->last_lit, in_length, out_length,
//    //       100L - out_length*100L/in_length));
//    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
//      return true;
//    }
//  }
//#endif

  return (s.last_lit === s.lit_bufsize - 1);
  /* We avoid equality with lit_bufsize because of wraparound at 64K
   * on 16 bit machines and because stored blocks are restricted to
   * 64K-1 bytes.
   */
}

exports._tr_init  = _tr_init;
exports._tr_stored_block = _tr_stored_block;
exports._tr_flush_block  = _tr_flush_block;
exports._tr_tally = _tr_tally;
exports._tr_align = _tr_align;

},{"../utils/common":30}],40:[function(require,module,exports){
'use strict';

// (C) 1995-2013 Jean-loup Gailly and Mark Adler
// (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
//
// This software is provided 'as-is', without any express or implied
// warranty. In no event will the authors be held liable for any damages
// arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter it and redistribute it
// freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not
//   claim that you wrote the original software. If you use this software
//   in a product, an acknowledgment in the product documentation would be
//   appreciated but is not required.
// 2. Altered source versions must be plainly marked as such, and must not be
//   misrepresented as being the original software.
// 3. This notice may not be removed or altered from any source distribution.

function ZStream() {
  /* next input byte */
  this.input = null; // JS specific, because we have no pointers
  this.next_in = 0;
  /* number of bytes available at input */
  this.avail_in = 0;
  /* total number of input bytes read so far */
  this.total_in = 0;
  /* next output byte should be put there */
  this.output = null; // JS specific, because we have no pointers
  this.next_out = 0;
  /* remaining free space at output */
  this.avail_out = 0;
  /* total number of bytes output so far */
  this.total_out = 0;
  /* last error message, NULL if no error */
  this.msg = ''/*Z_NULL*/;
  /* not visible by applications */
  this.state = null;
  /* best guess about the data type: binary or text */
  this.data_type = 2/*Z_UNKNOWN*/;
  /* adler32 value of the uncompressed data */
  this.adler = 0;
}

module.exports = ZStream;

},{}],41:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],42:[function(require,module,exports){
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype)

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":10}],43:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/lib/_stream_readable.js');
Stream.Writable = require('readable-stream/lib/_stream_writable.js');
Stream.Duplex = require('readable-stream/lib/_stream_duplex.js');
Stream.Transform = require('readable-stream/lib/_stream_transform.js');
Stream.PassThrough = require('readable-stream/lib/_stream_passthrough.js');
Stream.finished = require('readable-stream/lib/internal/streams/end-of-stream.js')
Stream.pipeline = require('readable-stream/lib/internal/streams/pipeline.js')

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":13,"inherits":24,"readable-stream/lib/_stream_duplex.js":45,"readable-stream/lib/_stream_passthrough.js":46,"readable-stream/lib/_stream_readable.js":47,"readable-stream/lib/_stream_transform.js":48,"readable-stream/lib/_stream_writable.js":49,"readable-stream/lib/internal/streams/end-of-stream.js":53,"readable-stream/lib/internal/streams/pipeline.js":55}],44:[function(require,module,exports){
'use strict';

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var codes = {};

function createErrorType(code, message, Base) {
  if (!Base) {
    Base = Error;
  }

  function getMessage(arg1, arg2, arg3) {
    if (typeof message === 'string') {
      return message;
    } else {
      return message(arg1, arg2, arg3);
    }
  }

  var NodeError =
  /*#__PURE__*/
  function (_Base) {
    _inheritsLoose(NodeError, _Base);

    function NodeError(arg1, arg2, arg3) {
      return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
    }

    return NodeError;
  }(Base);

  NodeError.prototype.name = Base.name;
  NodeError.prototype.code = code;
  codes[code] = NodeError;
} // https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js


function oneOf(expected, thing) {
  if (Array.isArray(expected)) {
    var len = expected.length;
    expected = expected.map(function (i) {
      return String(i);
    });

    if (len > 2) {
      return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(', '), ", or ") + expected[len - 1];
    } else if (len === 2) {
      return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
    } else {
      return "of ".concat(thing, " ").concat(expected[0]);
    }
  } else {
    return "of ".concat(thing, " ").concat(String(expected));
  }
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith


function startsWith(str, search, pos) {
  return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith


function endsWith(str, search, this_len) {
  if (this_len === undefined || this_len > str.length) {
    this_len = str.length;
  }

  return str.substring(this_len - search.length, this_len) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes


function includes(str, search, start) {
  if (typeof start !== 'number') {
    start = 0;
  }

  if (start + search.length > str.length) {
    return false;
  } else {
    return str.indexOf(search, start) !== -1;
  }
}

createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
  return 'The value "' + value + '" is invalid for option "' + name + '"';
}, TypeError);
createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
  // determiner: 'must be' or 'must not be'
  var determiner;

  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }

  var msg;

  if (endsWith(name, ' argument')) {
    // For cases like 'first argument'
    msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  } else {
    var type = includes(name, '.') ? 'property' : 'argument';
    msg = "The \"".concat(name, "\" ").concat(type, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  }

  msg += ". Received type ".concat(typeof actual);
  return msg;
}, TypeError);
createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
  return 'The ' + name + ' method is not implemented';
});
createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
createErrorType('ERR_STREAM_DESTROYED', function (name) {
  return 'Cannot call ' + name + ' after a stream was destroyed';
});
createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
  return 'Unknown encoding: ' + arg;
}, TypeError);
createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');
module.exports.codes = codes;

},{}],45:[function(require,module,exports){
(function (process){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
};
/*</replacement>*/

module.exports = Duplex;
var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');
require('inherits')(Duplex, Readable);
{
  // Allow the keys array to be GC'ed.
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}
function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);
  Readable.call(this, options);
  Writable.call(this, options);
  this.allowHalfOpen = true;
  if (options) {
    if (options.readable === false) this.readable = false;
    if (options.writable === false) this.writable = false;
    if (options.allowHalfOpen === false) {
      this.allowHalfOpen = false;
      this.once('end', onend);
    }
  }
}
Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});
Object.defineProperty(Duplex.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
Object.defineProperty(Duplex.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});

// the no-half-open enforcer
function onend() {
  // If the writable side ended, then we're ok.
  if (this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  process.nextTick(onEndNT, this);
}
function onEndNT(self) {
  self.end();
}
Object.defineProperty(Duplex.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});
}).call(this)}).call(this,require('_process'))
},{"./_stream_readable":47,"./_stream_writable":49,"_process":41,"inherits":24}],46:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;
var Transform = require('./_stream_transform');
require('inherits')(PassThrough, Transform);
function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);
  Transform.call(this, options);
}
PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":48,"inherits":24}],47:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

module.exports = Readable;

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;
var EElistenerCount = function EElistenerCount(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

var Buffer = require('buffer').Buffer;
var OurUint8Array = (typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*<replacement>*/
var debugUtil = require('util');
var debug;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function debug() {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/buffer_list');
var destroyImpl = require('./internal/streams/destroy');
var _require = require('./internal/streams/state'),
  getHighWaterMark = _require.getHighWaterMark;
var _require$codes = require('../errors').codes,
  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
  ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF,
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;

// Lazy loaded to improve the startup performance.
var StringDecoder;
var createReadableStreamAsyncIterator;
var from;
require('inherits')(Readable, Stream);
var errorOrDestroy = destroyImpl.errorOrDestroy;
var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];
function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}
function ReadableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  this.highWaterMark = getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;
  this.paused = true;

  // Should close be emitted on destroy. Defaults to true.
  this.emitClose = options.emitClose !== false;

  // Should .destroy() be called after 'end' (and potentially 'finish')
  this.autoDestroy = !!options.autoDestroy;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;
  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}
function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');
  if (!(this instanceof Readable)) return new Readable(options);

  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the ReadableState constructor, at least with V8 6.5
  var isDuplex = this instanceof Duplex;
  this._readableState = new ReadableState(options, this, isDuplex);

  // legacy
  this.readable = true;
  if (options) {
    if (typeof options.read === 'function') this._read = options.read;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }
  Stream.call(this);
}
Object.defineProperty(Readable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});
Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;
  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }
  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};
function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  debug('readableAddChunk', chunk);
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      errorOrDestroy(stream, er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }
      if (addToFront) {
        if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
      } else if (state.destroyed) {
        return false;
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
      maybeReadMore(stream, state);
    }
  }

  // We can push more data if we are below the highWaterMark.
  // Also, if we have no data yet, we can stand some more bytes.
  // This is to work around cases where hwm=0, such as the repl.
  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
}
function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    state.awaitDrain = 0;
    stream.emit('data', chunk);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}
function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
  }
  return er;
}
Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  var decoder = new StringDecoder(enc);
  this._readableState.decoder = decoder;
  // If setEncoding(null), decoder.encoding equals utf8
  this._readableState.encoding = this._readableState.decoder.encoding;

  // Iterate over current buffer to convert already stored Buffers:
  var p = this._readableState.buffer.head;
  var content = '';
  while (p !== null) {
    content += decoder.write(p.data);
    p = p.next;
  }
  this._readableState.buffer.clear();
  if (content !== '') this._readableState.buffer.push(content);
  this._readableState.length = content.length;
  return this;
};

// Don't raise the hwm > 1GB
var MAX_HWM = 0x40000000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;
  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }
  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }
  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;
  if (ret === null) {
    state.needReadable = state.length <= state.highWaterMark;
    n = 0;
  } else {
    state.length -= n;
    state.awaitDrain = 0;
  }
  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }
  if (ret !== null) this.emit('data', ret);
  return ret;
};
function onEofChunk(stream, state) {
  debug('onEofChunk');
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;
  if (state.sync) {
    // if we are sync, wait until next tick to emit the data.
    // Otherwise we risk emitting data in the flow()
    // the readable code triggers during a read() call
    emitReadable(stream);
  } else {
    // emit 'readable' now to make sure it gets picked up.
    state.needReadable = false;
    if (!state.emittedReadable) {
      state.emittedReadable = true;
      emitReadable_(stream);
    }
  }
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  debug('emitReadable', state.needReadable, state.emittedReadable);
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    process.nextTick(emitReadable_, stream);
  }
}
function emitReadable_(stream) {
  var state = stream._readableState;
  debug('emitReadable_', state.destroyed, state.length, state.ended);
  if (!state.destroyed && (state.length || state.ended)) {
    stream.emit('readable');
    state.emittedReadable = false;
  }

  // The stream needs another readable event if
  // 1. It is not flowing, as the flow mechanism will take
  //    care of it.
  // 2. It is not ended.
  // 3. It is below the highWaterMark, so we can schedule
  //    another readable later.
  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(maybeReadMore_, stream, state);
  }
}
function maybeReadMore_(stream, state) {
  // Attempt to read more data if we should.
  //
  // The conditions for reading more data are (one of):
  // - Not enough data buffered (state.length < state.highWaterMark). The loop
  //   is responsible for filling the buffer with enough data if such data
  //   is available. If highWaterMark is 0 and we are not in the flowing mode
  //   we should _not_ attempt to buffer any extra data. We'll get more data
  //   when the stream consumer calls read() instead.
  // - No data in the buffer, and the stream is in flowing mode. In this mode
  //   the loop below is responsible for ensuring read() is called. Failing to
  //   call read here would abort the flow and there's no other mechanism for
  //   continuing the flow if the stream consumer has just subscribed to the
  //   'data' event.
  //
  // In addition to the above conditions to keep reading data, the following
  // conditions prevent the data from being read:
  // - The stream has ended (state.ended).
  // - There is already a pending 'read' operation (state.reading). This is a
  //   case where the the stream has called the implementation defined _read()
  //   method, but they are processing the call asynchronously and have _not_
  //   called push() with new data. In this case we skip performing more
  //   read()s. The execution ends in this method again after the _read() ends
  //   up calling push() with more data.
  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
    var len = state.length;
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED('_read()'));
};
Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;
  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }
  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);
  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);
    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    debug('dest.write', ret);
    if (ret === false) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', state.awaitDrain);
        state.awaitDrain++;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) errorOrDestroy(dest, er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);
  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }
  return dest;
};
function pipeOnDrain(src) {
  return function pipeOnDrainFunctionResult() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}
Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = {
    hasUnpiped: false
  };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;
    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    for (var i = 0; i < len; i++) dests[i].emit('unpipe', this, {
      hasUnpiped: false
    });
    return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;
  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];
  dest.emit('unpipe', this, unpipeInfo);
  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);
  var state = this._readableState;
  if (ev === 'data') {
    // update readableListening so that resume() may be a no-op
    // a few lines down. This is needed to support once('readable').
    state.readableListening = this.listenerCount('readable') > 0;

    // Try start flowing on next tick if stream isn't explicitly paused
    if (state.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.flowing = false;
      state.emittedReadable = false;
      debug('on readable', state.length, state.reading);
      if (state.length) {
        emitReadable(this);
      } else if (!state.reading) {
        process.nextTick(nReadingNextTick, this);
      }
    }
  }
  return res;
};
Readable.prototype.addListener = Readable.prototype.on;
Readable.prototype.removeListener = function (ev, fn) {
  var res = Stream.prototype.removeListener.call(this, ev, fn);
  if (ev === 'readable') {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }
  return res;
};
Readable.prototype.removeAllListeners = function (ev) {
  var res = Stream.prototype.removeAllListeners.apply(this, arguments);
  if (ev === 'readable' || ev === undefined) {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }
  return res;
};
function updateReadableListening(self) {
  var state = self._readableState;
  state.readableListening = self.listenerCount('readable') > 0;
  if (state.resumeScheduled && !state.paused) {
    // flowing needs to be set to true now, otherwise
    // the upcoming resume will not flow.
    state.flowing = true;

    // crude way to check if we should resume
  } else if (self.listenerCount('data') > 0) {
    self.resume();
  }
}
function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    // we flow only if there is no one listening
    // for readable, but we still have to call
    // resume()
    state.flowing = !state.readableListening;
    resume(this, state);
  }
  state.paused = false;
  return this;
};
function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(resume_, stream, state);
  }
}
function resume_(stream, state) {
  debug('resume', state.reading);
  if (!state.reading) {
    stream.read(0);
  }
  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}
Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (this._readableState.flowing !== false) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  this._readableState.paused = true;
  return this;
};
function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null);
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;
  var state = this._readableState;
  var paused = false;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }
    _this.push(null);
  });
  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;
    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function methodWrap(method) {
        return function methodWrapReturnFunction() {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };
  return this;
};
if (typeof Symbol === 'function') {
  Readable.prototype[Symbol.asyncIterator] = function () {
    if (createReadableStreamAsyncIterator === undefined) {
      createReadableStreamAsyncIterator = require('./internal/streams/async_iterator');
    }
    return createReadableStreamAsyncIterator(this);
  };
}
Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.highWaterMark;
  }
});
Object.defineProperty(Readable.prototype, 'readableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState && this._readableState.buffer;
  }
});
Object.defineProperty(Readable.prototype, 'readableFlowing', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.flowing;
  },
  set: function set(state) {
    if (this._readableState) {
      this._readableState.flowing = state;
    }
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;
Object.defineProperty(Readable.prototype, 'readableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.length;
  }
});

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;
  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = state.buffer.consume(n, state.decoder);
  }
  return ret;
}
function endReadable(stream) {
  var state = stream._readableState;
  debug('endReadable', state.endEmitted);
  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(endReadableNT, state, stream);
  }
}
function endReadableNT(state, stream) {
  debug('endReadableNT', state.endEmitted, state.length);

  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
    if (state.autoDestroy) {
      // In case of duplex streams we need a way to detect
      // if the writable side is ready for autoDestroy as well
      var wState = stream._writableState;
      if (!wState || wState.autoDestroy && wState.finished) {
        stream.destroy();
      }
    }
  }
}
if (typeof Symbol === 'function') {
  Readable.from = function (iterable, opts) {
    if (from === undefined) {
      from = require('./internal/streams/from');
    }
    return from(Readable, iterable, opts);
  };
}
function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":44,"./_stream_duplex":45,"./internal/streams/async_iterator":50,"./internal/streams/buffer_list":51,"./internal/streams/destroy":52,"./internal/streams/from":54,"./internal/streams/state":56,"./internal/streams/stream":57,"_process":41,"buffer":10,"events":13,"inherits":24,"string_decoder/":58,"util":7}],48:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;
var _require$codes = require('../errors').codes,
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
  ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
  ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
var Duplex = require('./_stream_duplex');
require('inherits')(Transform, Duplex);
function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;
  var cb = ts.writecb;
  if (cb === null) {
    return this.emit('error', new ERR_MULTIPLE_CALLBACK());
  }
  ts.writechunk = null;
  ts.writecb = null;
  if (data != null)
    // single equals check for both `null` and `undefined`
    this.push(data);
  cb(er);
  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}
function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);
  Duplex.call(this, options);
  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;
  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}
function prefinish() {
  var _this = this;
  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}
Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_transform()'));
};
Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;
  if (ts.writechunk !== null && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};
Transform.prototype._destroy = function (err, cb) {
  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
  });
};
function done(stream, er, data) {
  if (er) return stream.emit('error', er);
  if (data != null)
    // single equals check for both `null` and `undefined`
    stream.push(data);

  // TODO(BridgeAR): Write a test for these two error cases
  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
  return stream.push(null);
}
},{"../errors":44,"./_stream_duplex":45,"inherits":24}],49:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;
  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

var Buffer = require('buffer').Buffer;
var OurUint8Array = (typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
var destroyImpl = require('./internal/streams/destroy');
var _require = require('./internal/streams/state'),
  getHighWaterMark = _require.getHighWaterMark;
var _require$codes = require('../errors').codes,
  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
  ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
  ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
  ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
  ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
  ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
var errorOrDestroy = destroyImpl.errorOrDestroy;
require('inherits')(Writable, Stream);
function nop() {}
function WritableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream,
  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.
  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  this.highWaterMark = getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;
  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // Should close be emitted on destroy. Defaults to true.
  this.emitClose = options.emitClose !== false;

  // Should .destroy() be called after 'finish' (and potentially 'end')
  this.autoDestroy = !!options.autoDestroy;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}
WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};
(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function writableStateBufferGetter() {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function value(object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;
      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function realHasInstance(object) {
    return object instanceof this;
  };
}
function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.

  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the WritableState constructor, at least with V8 6.5
  var isDuplex = this instanceof Duplex;
  if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
  this._writableState = new WritableState(options, this, isDuplex);

  // legacy.
  this.writable = true;
  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.final === 'function') this._final = options.final;
  }
  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
};
function writeAfterEnd(stream, cb) {
  var er = new ERR_STREAM_WRITE_AFTER_END();
  // TODO: defer error events consistently everywhere, not just the cb
  errorOrDestroy(stream, er);
  process.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var er;
  if (chunk === null) {
    er = new ERR_STREAM_NULL_VALUES();
  } else if (typeof chunk !== 'string' && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
  }
  if (er) {
    errorOrDestroy(stream, er);
    process.nextTick(cb, er);
    return false;
  }
  return true;
}
Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);
  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }
  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }
  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
  if (typeof cb !== 'function') cb = nop;
  if (state.ending) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }
  return ret;
};
Writable.prototype.cork = function () {
  this._writableState.corked++;
};
Writable.prototype.uncork = function () {
  var state = this._writableState;
  if (state.corked) {
    state.corked--;
    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};
Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};
Object.defineProperty(Writable.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}
Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;
  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;
  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }
  return ret;
}
function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}
function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    process.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    process.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}
function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}
function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
  onwriteStateUpdate(state);
  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state) || stream.destroyed;
    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }
    if (sync) {
      process.nextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}
function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;
  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;
    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;
    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }
    if (entry === null) state.lastBufferedRequest = null;
  }
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}
Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
};
Writable.prototype._writev = null;
Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;
  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }
  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending) endWritable(this, state, cb);
  return this;
};
Object.defineProperty(Writable.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});
function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      errorOrDestroy(stream, err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function' && !state.destroyed) {
      state.pendingcb++;
      state.finalCalled = true;
      process.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}
function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
      if (state.autoDestroy) {
        // In case of duplex streams we need a way to detect
        // if the readable side is ready for autoDestroy as well
        var rState = stream._readableState;
        if (!rState || rState.autoDestroy && rState.endEmitted) {
          stream.destroy();
        }
      }
    }
  }
  return need;
}
function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}
function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }

  // reuse the free corkReq.
  state.corkedRequestsFree.next = corkReq;
}
Object.defineProperty(Writable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});
Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  cb(err);
};
}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":44,"./_stream_duplex":45,"./internal/streams/destroy":52,"./internal/streams/state":56,"./internal/streams/stream":57,"_process":41,"buffer":10,"inherits":24,"util-deprecate":59}],50:[function(require,module,exports){
(function (process){(function (){
'use strict';

var _Object$setPrototypeO;
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var finished = require('./end-of-stream');
var kLastResolve = Symbol('lastResolve');
var kLastReject = Symbol('lastReject');
var kError = Symbol('error');
var kEnded = Symbol('ended');
var kLastPromise = Symbol('lastPromise');
var kHandlePromise = Symbol('handlePromise');
var kStream = Symbol('stream');
function createIterResult(value, done) {
  return {
    value: value,
    done: done
  };
}
function readAndResolve(iter) {
  var resolve = iter[kLastResolve];
  if (resolve !== null) {
    var data = iter[kStream].read();
    // we defer if data is null
    // we can be expecting either 'end' or
    // 'error'
    if (data !== null) {
      iter[kLastPromise] = null;
      iter[kLastResolve] = null;
      iter[kLastReject] = null;
      resolve(createIterResult(data, false));
    }
  }
}
function onReadable(iter) {
  // we wait for the next tick, because it might
  // emit an error with process.nextTick
  process.nextTick(readAndResolve, iter);
}
function wrapForNext(lastPromise, iter) {
  return function (resolve, reject) {
    lastPromise.then(function () {
      if (iter[kEnded]) {
        resolve(createIterResult(undefined, true));
        return;
      }
      iter[kHandlePromise](resolve, reject);
    }, reject);
  };
}
var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
  get stream() {
    return this[kStream];
  },
  next: function next() {
    var _this = this;
    // if we have detected an error in the meanwhile
    // reject straight away
    var error = this[kError];
    if (error !== null) {
      return Promise.reject(error);
    }
    if (this[kEnded]) {
      return Promise.resolve(createIterResult(undefined, true));
    }
    if (this[kStream].destroyed) {
      // We need to defer via nextTick because if .destroy(err) is
      // called, the error will be emitted via nextTick, and
      // we cannot guarantee that there is no error lingering around
      // waiting to be emitted.
      return new Promise(function (resolve, reject) {
        process.nextTick(function () {
          if (_this[kError]) {
            reject(_this[kError]);
          } else {
            resolve(createIterResult(undefined, true));
          }
        });
      });
    }

    // if we have multiple next() calls
    // we will wait for the previous Promise to finish
    // this logic is optimized to support for await loops,
    // where next() is only called once at a time
    var lastPromise = this[kLastPromise];
    var promise;
    if (lastPromise) {
      promise = new Promise(wrapForNext(lastPromise, this));
    } else {
      // fast path needed to support multiple this.push()
      // without triggering the next() queue
      var data = this[kStream].read();
      if (data !== null) {
        return Promise.resolve(createIterResult(data, false));
      }
      promise = new Promise(this[kHandlePromise]);
    }
    this[kLastPromise] = promise;
    return promise;
  }
}, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function () {
  return this;
}), _defineProperty(_Object$setPrototypeO, "return", function _return() {
  var _this2 = this;
  // destroy(err, cb) is a private API
  // we can guarantee we have that here, because we control the
  // Readable class this is attached to
  return new Promise(function (resolve, reject) {
    _this2[kStream].destroy(null, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(createIterResult(undefined, true));
    });
  });
}), _Object$setPrototypeO), AsyncIteratorPrototype);
var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
  var _Object$create;
  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
    value: stream,
    writable: true
  }), _defineProperty(_Object$create, kLastResolve, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kLastReject, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kError, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kEnded, {
    value: stream._readableState.endEmitted,
    writable: true
  }), _defineProperty(_Object$create, kHandlePromise, {
    value: function value(resolve, reject) {
      var data = iterator[kStream].read();
      if (data) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(data, false));
      } else {
        iterator[kLastResolve] = resolve;
        iterator[kLastReject] = reject;
      }
    },
    writable: true
  }), _Object$create));
  iterator[kLastPromise] = null;
  finished(stream, function (err) {
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      var reject = iterator[kLastReject];
      // reject if we are waiting for data in the Promise
      // returned by next() and store the error
      if (reject !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        reject(err);
      }
      iterator[kError] = err;
      return;
    }
    var resolve = iterator[kLastResolve];
    if (resolve !== null) {
      iterator[kLastPromise] = null;
      iterator[kLastResolve] = null;
      iterator[kLastReject] = null;
      resolve(createIterResult(undefined, true));
    }
    iterator[kEnded] = true;
  });
  stream.on('readable', onReadable.bind(null, iterator));
  return iterator;
};
module.exports = createReadableStreamAsyncIterator;
}).call(this)}).call(this,require('_process'))
},{"./end-of-stream":53,"_process":41}],51:[function(require,module,exports){
'use strict';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var _require = require('buffer'),
  Buffer = _require.Buffer;
var _require2 = require('util'),
  inspect = _require2.inspect;
var custom = inspect && inspect.custom || 'inspect';
function copyBuffer(src, target, offset) {
  Buffer.prototype.copy.call(src, target, offset);
}
module.exports = /*#__PURE__*/function () {
  function BufferList() {
    _classCallCheck(this, BufferList);
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  _createClass(BufferList, [{
    key: "push",
    value: function push(v) {
      var entry = {
        data: v,
        next: null
      };
      if (this.length > 0) this.tail.next = entry;else this.head = entry;
      this.tail = entry;
      ++this.length;
    }
  }, {
    key: "unshift",
    value: function unshift(v) {
      var entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0) this.tail = entry;
      this.head = entry;
      ++this.length;
    }
  }, {
    key: "shift",
    value: function shift() {
      if (this.length === 0) return;
      var ret = this.head.data;
      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
      --this.length;
      return ret;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
  }, {
    key: "join",
    value: function join(s) {
      if (this.length === 0) return '';
      var p = this.head;
      var ret = '' + p.data;
      while (p = p.next) ret += s + p.data;
      return ret;
    }
  }, {
    key: "concat",
    value: function concat(n) {
      if (this.length === 0) return Buffer.alloc(0);
      var ret = Buffer.allocUnsafe(n >>> 0);
      var p = this.head;
      var i = 0;
      while (p) {
        copyBuffer(p.data, ret, i);
        i += p.data.length;
        p = p.next;
      }
      return ret;
    }

    // Consumes a specified amount of bytes or characters from the buffered data.
  }, {
    key: "consume",
    value: function consume(n, hasStrings) {
      var ret;
      if (n < this.head.data.length) {
        // `slice` is the same for buffers and strings.
        ret = this.head.data.slice(0, n);
        this.head.data = this.head.data.slice(n);
      } else if (n === this.head.data.length) {
        // First chunk is a perfect match.
        ret = this.shift();
      } else {
        // Result spans more than one buffer.
        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
      }
      return ret;
    }
  }, {
    key: "first",
    value: function first() {
      return this.head.data;
    }

    // Consumes a specified amount of characters from the buffered data.
  }, {
    key: "_getString",
    value: function _getString(n) {
      var p = this.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;
      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length) ret += str;else ret += str.slice(0, n);
        n -= nb;
        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = str.slice(nb);
          }
          break;
        }
        ++c;
      }
      this.length -= c;
      return ret;
    }

    // Consumes a specified amount of bytes from the buffered data.
  }, {
    key: "_getBuffer",
    value: function _getBuffer(n) {
      var ret = Buffer.allocUnsafe(n);
      var p = this.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;
      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;
        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = buf.slice(nb);
          }
          break;
        }
        ++c;
      }
      this.length -= c;
      return ret;
    }

    // Make sure the linked list only shows the minimal necessary information.
  }, {
    key: custom,
    value: function value(_, options) {
      return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      }));
    }
  }]);
  return BufferList;
}();
},{"buffer":10,"util":7}],52:[function(require,module,exports){
(function (process){(function (){
'use strict';

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;
  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;
  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err) {
      if (!this._writableState) {
        process.nextTick(emitErrorNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        process.nextTick(emitErrorNT, this, err);
      }
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }
  this._destroy(err || null, function (err) {
    if (!cb && err) {
      if (!_this._writableState) {
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else if (!_this._writableState.errorEmitted) {
        _this._writableState.errorEmitted = true;
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    } else if (cb) {
      process.nextTick(emitCloseNT, _this);
      cb(err);
    } else {
      process.nextTick(emitCloseNT, _this);
    }
  });
  return this;
}
function emitErrorAndCloseNT(self, err) {
  emitErrorNT(self, err);
  emitCloseNT(self);
}
function emitCloseNT(self) {
  if (self._writableState && !self._writableState.emitClose) return;
  if (self._readableState && !self._readableState.emitClose) return;
  self.emit('close');
}
function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }
  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finalCalled = false;
    this._writableState.prefinished = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}
function emitErrorNT(self, err) {
  self.emit('error', err);
}
function errorOrDestroy(stream, err) {
  // We have tests that rely on errors being emitted
  // in the same tick, so changing this is semver major.
  // For now when you opt-in to autoDestroy we allow
  // the error to be emitted nextTick. In a future
  // semver major update we should change the default to this.

  var rState = stream._readableState;
  var wState = stream._writableState;
  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
}
module.exports = {
  destroy: destroy,
  undestroy: undestroy,
  errorOrDestroy: errorOrDestroy
};
}).call(this)}).call(this,require('_process'))
},{"_process":41}],53:[function(require,module,exports){
// Ported from https://github.com/mafintosh/end-of-stream with
// permission from the author, Mathias Buus (@mafintosh).

'use strict';

var ERR_STREAM_PREMATURE_CLOSE = require('../../../errors').codes.ERR_STREAM_PREMATURE_CLOSE;
function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    callback.apply(this, args);
  };
}
function noop() {}
function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}
function eos(stream, opts, callback) {
  if (typeof opts === 'function') return eos(stream, null, opts);
  if (!opts) opts = {};
  callback = once(callback || noop);
  var readable = opts.readable || opts.readable !== false && stream.readable;
  var writable = opts.writable || opts.writable !== false && stream.writable;
  var onlegacyfinish = function onlegacyfinish() {
    if (!stream.writable) onfinish();
  };
  var writableEnded = stream._writableState && stream._writableState.finished;
  var onfinish = function onfinish() {
    writable = false;
    writableEnded = true;
    if (!readable) callback.call(stream);
  };
  var readableEnded = stream._readableState && stream._readableState.endEmitted;
  var onend = function onend() {
    readable = false;
    readableEnded = true;
    if (!writable) callback.call(stream);
  };
  var onerror = function onerror(err) {
    callback.call(stream, err);
  };
  var onclose = function onclose() {
    var err;
    if (readable && !readableEnded) {
      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
    if (writable && !writableEnded) {
      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
  };
  var onrequest = function onrequest() {
    stream.req.on('finish', onfinish);
  };
  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    stream.on('abort', onclose);
    if (stream.req) onrequest();else stream.on('request', onrequest);
  } else if (writable && !stream._writableState) {
    // legacy streams
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }
  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (opts.error !== false) stream.on('error', onerror);
  stream.on('close', onclose);
  return function () {
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
}
module.exports = eos;
},{"../../../errors":44}],54:[function(require,module,exports){
module.exports = function () {
  throw new Error('Readable.from is not available in the browser')
};

},{}],55:[function(require,module,exports){
// Ported from https://github.com/mafintosh/pump with
// permission from the author, Mathias Buus (@mafintosh).

'use strict';

var eos;
function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    callback.apply(void 0, arguments);
  };
}
var _require$codes = require('../../../errors').codes,
  ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
  ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
function noop(err) {
  // Rethrow the error if it exists to avoid swallowing it
  if (err) throw err;
}
function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}
function destroyer(stream, reading, writing, callback) {
  callback = once(callback);
  var closed = false;
  stream.on('close', function () {
    closed = true;
  });
  if (eos === undefined) eos = require('./end-of-stream');
  eos(stream, {
    readable: reading,
    writable: writing
  }, function (err) {
    if (err) return callback(err);
    closed = true;
    callback();
  });
  var destroyed = false;
  return function (err) {
    if (closed) return;
    if (destroyed) return;
    destroyed = true;

    // request.destroy just do .end - .abort is what we want
    if (isRequest(stream)) return stream.abort();
    if (typeof stream.destroy === 'function') return stream.destroy();
    callback(err || new ERR_STREAM_DESTROYED('pipe'));
  };
}
function call(fn) {
  fn();
}
function pipe(from, to) {
  return from.pipe(to);
}
function popCallback(streams) {
  if (!streams.length) return noop;
  if (typeof streams[streams.length - 1] !== 'function') return noop;
  return streams.pop();
}
function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }
  var callback = popCallback(streams);
  if (Array.isArray(streams[0])) streams = streams[0];
  if (streams.length < 2) {
    throw new ERR_MISSING_ARGS('streams');
  }
  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return;
      destroys.forEach(call);
      callback(error);
    });
  });
  return streams.reduce(pipe);
}
module.exports = pipeline;
},{"../../../errors":44,"./end-of-stream":53}],56:[function(require,module,exports){
'use strict';

var ERR_INVALID_OPT_VALUE = require('../../../errors').codes.ERR_INVALID_OPT_VALUE;
function highWaterMarkFrom(options, isDuplex, duplexKey) {
  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
}
function getHighWaterMark(state, options, duplexKey, isDuplex) {
  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
  if (hwm != null) {
    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
      var name = isDuplex ? duplexKey : 'highWaterMark';
      throw new ERR_INVALID_OPT_VALUE(name, hwm);
    }
    return Math.floor(hwm);
  }

  // Default value
  return state.objectMode ? 16 : 16 * 1024;
}
module.exports = {
  getHighWaterMark: getHighWaterMark
};
},{"../../../errors":44}],57:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":13}],58:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":42}],59:[function(require,module,exports){
(function (global){(function (){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],60:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],61:[function(require,module,exports){
// Currently in sync with Node.js lib/internal/util/types.js
// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9

'use strict';

var isArgumentsObject = require('is-arguments');
var isGeneratorFunction = require('is-generator-function');
var whichTypedArray = require('which-typed-array');
var isTypedArray = require('is-typed-array');

function uncurryThis(f) {
  return f.call.bind(f);
}

var BigIntSupported = typeof BigInt !== 'undefined';
var SymbolSupported = typeof Symbol !== 'undefined';

var ObjectToString = uncurryThis(Object.prototype.toString);

var numberValue = uncurryThis(Number.prototype.valueOf);
var stringValue = uncurryThis(String.prototype.valueOf);
var booleanValue = uncurryThis(Boolean.prototype.valueOf);

if (BigIntSupported) {
  var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
}

if (SymbolSupported) {
  var symbolValue = uncurryThis(Symbol.prototype.valueOf);
}

function checkBoxedPrimitive(value, prototypeValueOf) {
  if (typeof value !== 'object') {
    return false;
  }
  try {
    prototypeValueOf(value);
    return true;
  } catch(e) {
    return false;
  }
}

exports.isArgumentsObject = isArgumentsObject;
exports.isGeneratorFunction = isGeneratorFunction;
exports.isTypedArray = isTypedArray;

// Taken from here and modified for better browser support
// https://github.com/sindresorhus/p-is-promise/blob/cda35a513bda03f977ad5cde3a079d237e82d7ef/index.js
function isPromise(input) {
	return (
		(
			typeof Promise !== 'undefined' &&
			input instanceof Promise
		) ||
		(
			input !== null &&
			typeof input === 'object' &&
			typeof input.then === 'function' &&
			typeof input.catch === 'function'
		)
	);
}
exports.isPromise = isPromise;

function isArrayBufferView(value) {
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
    return ArrayBuffer.isView(value);
  }

  return (
    isTypedArray(value) ||
    isDataView(value)
  );
}
exports.isArrayBufferView = isArrayBufferView;


function isUint8Array(value) {
  return whichTypedArray(value) === 'Uint8Array';
}
exports.isUint8Array = isUint8Array;

function isUint8ClampedArray(value) {
  return whichTypedArray(value) === 'Uint8ClampedArray';
}
exports.isUint8ClampedArray = isUint8ClampedArray;

function isUint16Array(value) {
  return whichTypedArray(value) === 'Uint16Array';
}
exports.isUint16Array = isUint16Array;

function isUint32Array(value) {
  return whichTypedArray(value) === 'Uint32Array';
}
exports.isUint32Array = isUint32Array;

function isInt8Array(value) {
  return whichTypedArray(value) === 'Int8Array';
}
exports.isInt8Array = isInt8Array;

function isInt16Array(value) {
  return whichTypedArray(value) === 'Int16Array';
}
exports.isInt16Array = isInt16Array;

function isInt32Array(value) {
  return whichTypedArray(value) === 'Int32Array';
}
exports.isInt32Array = isInt32Array;

function isFloat32Array(value) {
  return whichTypedArray(value) === 'Float32Array';
}
exports.isFloat32Array = isFloat32Array;

function isFloat64Array(value) {
  return whichTypedArray(value) === 'Float64Array';
}
exports.isFloat64Array = isFloat64Array;

function isBigInt64Array(value) {
  return whichTypedArray(value) === 'BigInt64Array';
}
exports.isBigInt64Array = isBigInt64Array;

function isBigUint64Array(value) {
  return whichTypedArray(value) === 'BigUint64Array';
}
exports.isBigUint64Array = isBigUint64Array;

function isMapToString(value) {
  return ObjectToString(value) === '[object Map]';
}
isMapToString.working = (
  typeof Map !== 'undefined' &&
  isMapToString(new Map())
);

function isMap(value) {
  if (typeof Map === 'undefined') {
    return false;
  }

  return isMapToString.working
    ? isMapToString(value)
    : value instanceof Map;
}
exports.isMap = isMap;

function isSetToString(value) {
  return ObjectToString(value) === '[object Set]';
}
isSetToString.working = (
  typeof Set !== 'undefined' &&
  isSetToString(new Set())
);
function isSet(value) {
  if (typeof Set === 'undefined') {
    return false;
  }

  return isSetToString.working
    ? isSetToString(value)
    : value instanceof Set;
}
exports.isSet = isSet;

function isWeakMapToString(value) {
  return ObjectToString(value) === '[object WeakMap]';
}
isWeakMapToString.working = (
  typeof WeakMap !== 'undefined' &&
  isWeakMapToString(new WeakMap())
);
function isWeakMap(value) {
  if (typeof WeakMap === 'undefined') {
    return false;
  }

  return isWeakMapToString.working
    ? isWeakMapToString(value)
    : value instanceof WeakMap;
}
exports.isWeakMap = isWeakMap;

function isWeakSetToString(value) {
  return ObjectToString(value) === '[object WeakSet]';
}
isWeakSetToString.working = (
  typeof WeakSet !== 'undefined' &&
  isWeakSetToString(new WeakSet())
);
function isWeakSet(value) {
  return isWeakSetToString(value);
}
exports.isWeakSet = isWeakSet;

function isArrayBufferToString(value) {
  return ObjectToString(value) === '[object ArrayBuffer]';
}
isArrayBufferToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  isArrayBufferToString(new ArrayBuffer())
);
function isArrayBuffer(value) {
  if (typeof ArrayBuffer === 'undefined') {
    return false;
  }

  return isArrayBufferToString.working
    ? isArrayBufferToString(value)
    : value instanceof ArrayBuffer;
}
exports.isArrayBuffer = isArrayBuffer;

function isDataViewToString(value) {
  return ObjectToString(value) === '[object DataView]';
}
isDataViewToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  typeof DataView !== 'undefined' &&
  isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1))
);
function isDataView(value) {
  if (typeof DataView === 'undefined') {
    return false;
  }

  return isDataViewToString.working
    ? isDataViewToString(value)
    : value instanceof DataView;
}
exports.isDataView = isDataView;

// Store a copy of SharedArrayBuffer in case it's deleted elsewhere
var SharedArrayBufferCopy = typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : undefined;
function isSharedArrayBufferToString(value) {
  return ObjectToString(value) === '[object SharedArrayBuffer]';
}
function isSharedArrayBuffer(value) {
  if (typeof SharedArrayBufferCopy === 'undefined') {
    return false;
  }

  if (typeof isSharedArrayBufferToString.working === 'undefined') {
    isSharedArrayBufferToString.working = isSharedArrayBufferToString(new SharedArrayBufferCopy());
  }

  return isSharedArrayBufferToString.working
    ? isSharedArrayBufferToString(value)
    : value instanceof SharedArrayBufferCopy;
}
exports.isSharedArrayBuffer = isSharedArrayBuffer;

function isAsyncFunction(value) {
  return ObjectToString(value) === '[object AsyncFunction]';
}
exports.isAsyncFunction = isAsyncFunction;

function isMapIterator(value) {
  return ObjectToString(value) === '[object Map Iterator]';
}
exports.isMapIterator = isMapIterator;

function isSetIterator(value) {
  return ObjectToString(value) === '[object Set Iterator]';
}
exports.isSetIterator = isSetIterator;

function isGeneratorObject(value) {
  return ObjectToString(value) === '[object Generator]';
}
exports.isGeneratorObject = isGeneratorObject;

function isWebAssemblyCompiledModule(value) {
  return ObjectToString(value) === '[object WebAssembly.Module]';
}
exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;

function isNumberObject(value) {
  return checkBoxedPrimitive(value, numberValue);
}
exports.isNumberObject = isNumberObject;

function isStringObject(value) {
  return checkBoxedPrimitive(value, stringValue);
}
exports.isStringObject = isStringObject;

function isBooleanObject(value) {
  return checkBoxedPrimitive(value, booleanValue);
}
exports.isBooleanObject = isBooleanObject;

function isBigIntObject(value) {
  return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
}
exports.isBigIntObject = isBigIntObject;

function isSymbolObject(value) {
  return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
}
exports.isSymbolObject = isSymbolObject;

function isBoxedPrimitive(value) {
  return (
    isNumberObject(value) ||
    isStringObject(value) ||
    isBooleanObject(value) ||
    isBigIntObject(value) ||
    isSymbolObject(value)
  );
}
exports.isBoxedPrimitive = isBoxedPrimitive;

function isAnyArrayBuffer(value) {
  return typeof Uint8Array !== 'undefined' && (
    isArrayBuffer(value) ||
    isSharedArrayBuffer(value)
  );
}
exports.isAnyArrayBuffer = isAnyArrayBuffer;

['isProxy', 'isExternal', 'isModuleNamespaceObject'].forEach(function(method) {
  Object.defineProperty(exports, method, {
    enumerable: false,
    value: function() {
      throw new Error(method + ' is not supported in userland');
    }
  });
});

},{"is-arguments":25,"is-generator-function":27,"is-typed-array":28,"which-typed-array":63}],62:[function(require,module,exports){
(function (process){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors ||
  function getOwnPropertyDescriptors(obj) {
    var keys = Object.keys(obj);
    var descriptors = {};
    for (var i = 0; i < keys.length; i++) {
      descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
    }
    return descriptors;
  };

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  if (typeof process !== 'undefined' && process.noDeprecation === true) {
    return fn;
  }

  // Allow for deprecating things in the process of starting up.
  if (typeof process === 'undefined') {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnvRegex = /^$/;

if (process.env.NODE_DEBUG) {
  var debugEnv = process.env.NODE_DEBUG;
  debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/,/g, '$|^')
    .toUpperCase();
  debugEnvRegex = new RegExp('^' + debugEnv + '$', 'i');
}
exports.debuglog = function(set) {
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (debugEnvRegex.test(set)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').slice(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.slice(1, -1);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
exports.types = require('./support/types');

function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;
exports.types.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;
exports.types.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;
exports.types.isNativeError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined;

exports.promisify = function promisify(original) {
  if (typeof original !== 'function')
    throw new TypeError('The "original" argument must be of type Function');

  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
    var fn = original[kCustomPromisifiedSymbol];
    if (typeof fn !== 'function') {
      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
    }
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }

  function fn() {
    var promiseResolve, promiseReject;
    var promise = new Promise(function (resolve, reject) {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    args.push(function (err, value) {
      if (err) {
        promiseReject(err);
      } else {
        promiseResolve(value);
      }
    });

    try {
      original.apply(this, args);
    } catch (err) {
      promiseReject(err);
    }

    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

  if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
    value: fn, enumerable: false, writable: false, configurable: true
  });
  return Object.defineProperties(
    fn,
    getOwnPropertyDescriptors(original)
  );
}

exports.promisify.custom = kCustomPromisifiedSymbol

function callbackifyOnRejected(reason, cb) {
  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
  // Because `null` is a special error value in callbacks which means "no error
  // occurred", we error-wrap so the callback consumer can distinguish between
  // "the promise rejected with null" or "the promise fulfilled with undefined".
  if (!reason) {
    var newReason = new Error('Promise was rejected with a falsy value');
    newReason.reason = reason;
    reason = newReason;
  }
  return cb(reason);
}

function callbackify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  // We DO NOT return the promise as it gives the user a false sense that
  // the promise is actually somehow related to the callback's execution
  // and that the callback throwing will reject the promise.
  function callbackified() {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    var maybeCb = args.pop();
    if (typeof maybeCb !== 'function') {
      throw new TypeError('The last argument must be of type Function');
    }
    var self = this;
    var cb = function() {
      return maybeCb.apply(self, arguments);
    };
    // In true node style we process the callback on `nextTick` with all the
    // implications (stack, `uncaughtException`, `async_hooks`)
    original.apply(this, args)
      .then(function(ret) { process.nextTick(cb.bind(null, null, ret)) },
            function(rej) { process.nextTick(callbackifyOnRejected.bind(null, rej, cb)) });
  }

  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
  Object.defineProperties(callbackified,
                          getOwnPropertyDescriptors(original));
  return callbackified;
}
exports.callbackify = callbackify;

}).call(this)}).call(this,require('_process'))
},{"./support/isBuffer":60,"./support/types":61,"_process":41,"inherits":24}],63:[function(require,module,exports){
(function (global){(function (){
'use strict';

var forEach = require('for-each');
var availableTypedArrays = require('available-typed-arrays');
var callBound = require('call-bind/callBound');
var gOPD = require('gopd');

var $toString = callBound('Object.prototype.toString');
var hasToStringTag = require('has-tostringtag/shams')();

var g = typeof globalThis === 'undefined' ? global : globalThis;
var typedArrays = availableTypedArrays();

var $slice = callBound('String.prototype.slice');
var toStrTags = {};
var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');
if (hasToStringTag && gOPD && getPrototypeOf) {
	forEach(typedArrays, function (typedArray) {
		if (typeof g[typedArray] === 'function') {
			var arr = new g[typedArray]();
			if (Symbol.toStringTag in arr) {
				var proto = getPrototypeOf(arr);
				var descriptor = gOPD(proto, Symbol.toStringTag);
				if (!descriptor) {
					var superProto = getPrototypeOf(proto);
					descriptor = gOPD(superProto, Symbol.toStringTag);
				}
				toStrTags[typedArray] = descriptor.get;
			}
		}
	});
}

var tryTypedArrays = function tryAllTypedArrays(value) {
	var foundName = false;
	forEach(toStrTags, function (getter, typedArray) {
		if (!foundName) {
			try {
				var name = getter.call(value);
				if (name === typedArray) {
					foundName = name;
				}
			} catch (e) {}
		}
	});
	return foundName;
};

var isTypedArray = require('is-typed-array');

module.exports = function whichTypedArray(value) {
	if (!isTypedArray(value)) { return false; }
	if (!hasToStringTag || !(Symbol.toStringTag in value)) { return $slice($toString(value), 8, -1); }
	return tryTypedArrays(value);
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"available-typed-arrays":5,"call-bind/callBound":11,"for-each":14,"gopd":18,"has-tostringtag/shams":21,"is-typed-array":28}],64:[function(require,module,exports){
(function (Buffer){(function (){
const zlib = require('zlib');

function compressString(string){
    //const compressedString = zlib.gzipSync(string).toString('base64');
    //console.log("Before deflate hi");
    const compressedString = zlib.deflateSync(string).toString('base64');
    //console.log("After deflate hi");
    //console.log(`Uncompressed string: ${uncompressedString}`);
    console.log(`Compressed string: ${compressedString}`);
    return compressedString;
}

function decompressString(string){
    //console.log("Compressed string: "+string);
    const uncompressedString = zlib.inflateSync(Buffer.from(string, 'base64'));
    //const uncompressedString = zlib.gunzipSync(Buffer.from(string, 'base64')).toString();
    console.log(`Uncompressed string: ${uncompressedString}`);
    return uncompressedString;
    //console.log(`Uncompressed string: ${uncompressedString}`);
}

module.exports = { compressString, decompressString };

}).call(this)}).call(this,require("buffer").Buffer)
},{"buffer":10,"zlib":9}],65:[function(require,module,exports){
// import CryptoJS from 'crypto-js';


//const CryptoJS = require('crypto-js');
//https://www.npmjs.com/package/crypto-js




const crypt = (function () {
    // Encrypts and decrypts data using CryptoJS in password mode.


    return {
        encryptMessage: function (messageToencrypt = '', secretkey = '', keyMatrix) {
            var encryptedMessage = HillCipherE(messageToencrypt, keyMatrix);
            ciphertext = "";
            console.log("After hill cipher encryption");
            console.log(encryptedMessage);
            encryptedMessage = CryptoJS.AES.encrypt(encryptedMessage, secretkey);
            //var encryptedMessage = CryptoJS.AES.encrypt(messageToencrypt, secretkey);
            return encryptedMessage.toString();
        },
        decryptMessage: function (encryptedMessage = '', secretkey = '', invMatrix) {
            try {
                var decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, secretkey);
                var decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
                //console.log("After AES decryption: "+decryptedMessage);
                decryptedMessage = HillCipherD(decryptedMessage,invMatrix);
                //console.log("Final message(Data url received)");
                //console.log(decryptedMessage);
               
                FinalText = "";
                return decryptedMessage;
            } catch (err) {
                console.log("Malformed UTF-8 Data.")
                return '';
            }
        }
    };
})();
module.exports = {crypt};
// Javascript code to implement Hill Cipher


// Following function generates the
// key matrix for the key string
// function getKeyMatrix(key,keyMatrix)
// {
//     let k = 0;
//     for (let i = 0; i < 3; i++)
//     {
//         for (let j = 0; j < 3; j++)
//         {
//             keyMatrix[i][j] = (key[k]).charCodeAt(0);
//             k++;
//         }
//     }
// }


// Following function encrypts the message
function encrypt(cipherMatrix,keyMatrix,messageVector)
{
    let x, i, j;
    for(i = 0; i < 3; i++)
    {
        for(j = 0; j < 1; j++)
        {
            cipherMatrix[i][j] = 0;


            for(x = 0; x < 3; x++)
            {
            cipherMatrix[i][j] += keyMatrix[i][x] * messageVector[x][j];
            }


        }
    }
}


function decrypt(cipherMatrix,invMatrix,resultVector)
{
    let x, i, j;
    for (i = 0; i < 3; i++)
    {
        for (j = 0; j < 1; j++)
        {
            resultVector[i][j] = 0;


            for (x = 0; x < 3; x++)
            {
                resultVector[i][j] += (invMatrix[i][x] * cipherMatrix[x][j]);
            }
            resultVector[i][j]=Math.abs(Math.round(resultVector[i][j]));
            //console.log("Result from decrypt function: "+resultVector[i][j]);
        }
    }
}


var ciphertext = "";
var FinalText = "";
// var invmatrix = Array(3);
//     for(let i=0;i<3;i++)
//         invmatrix[i] = Array(3).fill(0);


// Function to implement Hill Cipher
function CipherGeneration(message, keyMatrix)
{


    //****************************
    //optimize this *keymatrix is being calculated everytime though the key is same*
    //****************************


    let messageVector = new Array(3);
    for(let i=0;i<3;i++)
    {
        messageVector[i]=new Array(1);
        messageVector[i][0]=0;
    }
   


    // Generate vector for the message
    //console.log("Message Vector: ");
    for (let i = 0; i < 3; i++)
    {
        if(message[i]==undefined)
        messageVector[i][0] = ('\0').charCodeAt(0);
        else
        messageVector[i][0] = (message[i]).charCodeAt(0);
        //console.log(messageVector[i][0])
    }


    let cipherMatrix = new Array(3);
    for(let i=0;i<3;i++)
    {
    cipherMatrix[i]=new Array(1);
    cipherMatrix[i][0]=0;
    }


    // Following function generates
    // the encrypted vector
    encrypt(cipherMatrix, keyMatrix, messageVector);
    //console.log("Cipher Matrix: ");
    for(var i=0; i<3; i++)
    {
        for(var j=0;j<1;j++)
        {
            //console.log(cipherMatrix[i][j]);
            //ciphertext+=cipherMatrix[i][j].toString().padStart(11,'0');
            ciphertext+=cipherMatrix[i][j].toString()+"+";
        }
    }


}


function DecryptedText(cipherMatrix, invMatrix)
{


    let resultVector = new Array(3);
    for(let i=0;i<3;i++)
    {
        resultVector[i]=new Array(1);
        resultVector[i][0]=0;
    }


    //console.log("Inverse matrix:");
    // for(let i=0; i<3; i++)
    // {
    //     for(let j=0;j<3;j++)
    //     {
    //         //console.log(invMatrix[i][j]);
    //     }
    // }


    decrypt(cipherMatrix, invMatrix, resultVector);
    // console.log("Result Matrix: ");
    // for(var i=0; i<3; i++)
    // {
    //     for(var j=0;j<1;j++)
    //     {
    //         console.log(resultVector[i][j]);
    //     }
    // }


    let FinalBlockText = "";
    for(let i=0; i<3; i++)
    {
        for(let j=0; j<1; j++)
        {
            if(resultVector[i][j]==0)
                break;
            FinalBlockText+=String.fromCharCode(resultVector[i][j]);
        }
    }
    FinalText+=FinalBlockText;
    //console.log("Final text from DecryptedText: "+FinalText);
}


var blocks;
//var keyMatrix;
function HillCipherE(message, keyMatrix)
{


    const msglen = message.length;
    blocks = msglen/3;
    blocks=Math.ceil(blocks);
    //console.log("Blocks: "+blocks);
    //let FinalText = "";
    // keyMatrix = new Array(3);
    // for(let i=0;i<3;i++)
    // {
    //     keyMatrix[i]=new Array(3);
    //     for(let j=0;j<3;j++)
    //         keyMatrix[i][j]=0;
    // }
    // var invertible = false;
    // var start=0;
    // while((!invertible)&&((start+9)<=(key.length)))
    // {
    //     var counter = 0;
    //     var hckey = key.slice(start,start+9);
    //     console.log("Key selected: "+hckey);
    //     getKeyMatrix(hckey, keyMatrix);
    //     invertible = checkInvertibility(keyMatrix,counter);
    //     start++;
    // }
    // if(!invertible)
    // {
    //     hckey="GYBNQKURP";
    //     getKeyMatrix(hckey, keyMatrix);
    // }
    // inverse(keyMatrix); //calculate the inverse


    for(let i=0;i<blocks;i++)
    {
        var msgblock = message.slice(i*3,i*3+3);
        //console.log("Message block "+msgblock);
        CipherGeneration(msgblock, keyMatrix);
    }
    //console.log("Cipher: "+ciphertext);
    return ciphertext.slice(0,ciphertext.length-1);
}
function HillCipherD(cipher, invMatrix)
{
    // var invertible = false;
    // var start=0;
    // while((!invertible)&&((start+9)<=(key.length)))
    // {
    //     var counter = 0;
    //     var hckey = key.slice(start,start+9);
    //     console.log("Key selected: "+hckey);
    //     getKeyMatrix(hckey, keyMatrix);
    //     invertible = checkInvertibility(keyMatrix,counter);
    //     start++;
    // }
    // if(!invertible)
    // {
    //     hckey="GYBNQKURP";
    //     getKeyMatrix(hckey, keyMatrix);
    // }
    // inverse(keyMatrix);


    let ind=0;
    let cipherMatrix = new Array(3);
    for(let i=0;i<3;i++)
    {
        cipherMatrix[i]=new Array(1);
        cipherMatrix[i][0]=0;
    }
    let count = 0;
    //console.log("Cipher Matrix: ");


    const cipherArray = cipher.split("+");
    for(let i=0;i<cipherArray.length;i++)
    {
        let s = Number(cipherArray[i]);
        if(count<3)
        {
            cipherMatrix[count][0]=s;
            //console.log(cipherMatrix[count][0]);
            if(count==2)
            {
                DecryptedText(cipherMatrix, invMatrix);
                //console.log("Cipher Matrix: ");
                count=-1;
            }
        }
        count++;
    }




    // while(ind+11<=cipher.length)
    // {
    //     let s = cipher.slice(ind,ind+11);
    //     s = Number(s);
    //     if(count<3)
    //     {
    //         cipherMatrix[count][0]=s;
    //         //console.log(cipherMatrix[count][0]);
    //         if(count==2)
    //         {
    //             DecryptedText(cipherMatrix, invMatrix);
    //             //console.log("Cipher Matrix: ");
    //             count=-1;
    //         }
    //     }
    //     count++;
    //     ind+=11;


    // }
    // for(let i=0;i<blocks;i++)
    // {
    //     var cblock = cipher.slice(i*3,i*3+3);
    //     //console.log(msgblock);
    //     DecryptedText(cblock);
    // }
   
    //console.log("Final text: "+FinalText);
    return FinalText;
}

},{}],66:[function(require,module,exports){
(function (Buffer){(function (){
// const { text } = require("express");
// const moment=require('moment');
var socket = io();

const { compressString, decompressString } = require('./comp.js');
//import {crypt} from '../utils/encryption.js';
const {crypt} = require('./encryption.js');
//const { compressString, decompressString } = require('./comp.js');
//import {b64toBlob} from './blob.js';
window.compressString = compressString;
window.decompressString = decompressString;
window.encryptMessage = crypt.encryptMessage;
window.decryptMessage = crypt.decryptMessage;

// import { scorePassword, getWordNum, randomUsername } from '../utils/password.js';
// source: https://www.eff.org/deeplinks/2016/07/new-wordlists-random-passphrases
// license; UNLICENSED

const eff = {
    11111: "abacus",
    11112: "abdomen",
    11113: "abdominal",
    11114: "abide",
    11115: "abiding",
    11116: "ability",
    11121: "ablaze",
    11122: "able",
    11123: "abnormal",
    11124: "abrasion",
    11125: "abrasive",
    11126: "abreast",
    11131: "abridge",
    11132: "abroad",
    11133: "abruptly",
    11134: "absence",
    11135: "absentee",
    11136: "absently",
    11141: "absinthe",
    11142: "absolute",
    11143: "absolve",
    11144: "abstain",
    11145: "abstract",
    11146: "absurd",
    11151: "accent",
    11152: "acclaim",
    11153: "acclimate",
    11154: "accompany",
    11155: "account",
    11156: "accuracy",
    11161: "accurate",
    11162: "accustom",
    11163: "acetone",
    11164: "achiness",
    11165: "aching",
    11166: "acid",
    11211: "acorn",
    11212: "acquaint",
    11213: "acquire",
    11214: "acre",
    11215: "acrobat",
    11216: "acronym",
    11221: "acting",
    11222: "action",
    11223: "activate",
    11224: "activator",
    11225: "active",
    11226: "activism",
    11231: "activist",
    11232: "activity",
    11233: "actress",
    11234: "acts",
    11235: "acutely",
    11236: "acuteness",
    11241: "aeration",
    11242: "aerobics",
    11243: "aerosol",
    11244: "aerospace",
    11245: "afar",
    11246: "affair",
    11251: "affected",
    11252: "affecting",
    11253: "affection",
    11254: "affidavit",
    11255: "affiliate",
    11256: "affirm",
    11261: "affix",
    11262: "afflicted",
    11263: "affluent",
    11264: "afford",
    11265: "affront",
    11266: "aflame",
    11311: "afloat",
    11312: "aflutter",
    11313: "afoot",
    11314: "afraid",
    11315: "afterglow",
    11316: "afterlife",
    11321: "aftermath",
    11322: "aftermost",
    11323: "afternoon",
    11324: "aged",
    11325: "ageless",
    11326: "agency",
    11331: "agenda",
    11332: "agent",
    11333: "aggregate",
    11334: "aghast",
    11335: "agile",
    11336: "agility",
    11341: "aging",
    11342: "agnostic",
    11343: "agonize",
    11344: "agonizing",
    11345: "agony",
    11346: "agreeable",
    11351: "agreeably",
    11352: "agreed",
    11353: "agreeing",
    11354: "agreement",
    11355: "aground",
    11356: "ahead",
    11361: "ahoy",
    11362: "aide",
    11363: "aids",
    11364: "aim",
    11365: "ajar",
    11366: "alabaster",
    11411: "alarm",
    11412: "albatross",
    11413: "album",
    11414: "alfalfa",
    11415: "algebra",
    11416: "algorithm",
    11421: "alias",
    11422: "alibi",
    11423: "alienable",
    11424: "alienate",
    11425: "aliens",
    11426: "alike",
    11431: "alive",
    11432: "alkaline",
    11433: "alkalize",
    11434: "almanac",
    11435: "almighty",
    11436: "almost",
    11441: "aloe",
    11442: "aloft",
    11443: "aloha",
    11444: "alone",
    11445: "alongside",
    11446: "aloof",
    11451: "alphabet",
    11452: "alright",
    11453: "although",
    11454: "altitude",
    11455: "alto",
    11456: "aluminum",
    11461: "alumni",
    11462: "always",
    11463: "amaretto",
    11464: "amaze",
    11465: "amazingly",
    11466: "amber",
    11511: "ambiance",
    11512: "ambiguity",
    11513: "ambiguous",
    11514: "ambition",
    11515: "ambitious",
    11516: "ambulance",
    11521: "ambush",
    11522: "amendable",
    11523: "amendment",
    11524: "amends",
    11525: "amenity",
    11526: "amiable",
    11531: "amicably",
    11532: "amid",
    11533: "amigo",
    11534: "amino",
    11535: "amiss",
    11536: "ammonia",
    11541: "ammonium",
    11542: "amnesty",
    11543: "amniotic",
    11544: "among",
    11545: "amount",
    11546: "amperage",
    11551: "ample",
    11552: "amplifier",
    11553: "amplify",
    11554: "amply",
    11555: "amuck",
    11556: "amulet",
    11561: "amusable",
    11562: "amused",
    11563: "amusement",
    11564: "amuser",
    11565: "amusing",
    11566: "anaconda",
    11611: "anaerobic",
    11612: "anagram",
    11613: "anatomist",
    11614: "anatomy",
    11615: "anchor",
    11616: "anchovy",
    11621: "ancient",
    11622: "android",
    11623: "anemia",
    11624: "anemic",
    11625: "aneurism",
    11626: "anew",
    11631: "angelfish",
    11632: "angelic",
    11633: "anger",
    11634: "angled",
    11635: "angler",
    11636: "angles",
    11641: "angling",
    11642: "angrily",
    11643: "angriness",
    11644: "anguished",
    11645: "angular",
    11646: "animal",
    11651: "animate",
    11652: "animating",
    11653: "animation",
    11654: "animator",
    11655: "anime",
    11656: "animosity",
    11661: "ankle",
    11662: "annex",
    11663: "annotate",
    11664: "announcer",
    11665: "annoying",
    11666: "annually",
    12111: "annuity",
    12112: "anointer",
    12113: "another",
    12114: "answering",
    12115: "antacid",
    12116: "antarctic",
    12121: "anteater",
    12122: "antelope",
    12123: "antennae",
    12124: "anthem",
    12125: "anthill",
    12126: "anthology",
    12131: "antibody",
    12132: "antics",
    12133: "antidote",
    12134: "antihero",
    12135: "antiquely",
    12136: "antiques",
    12141: "antiquity",
    12142: "antirust",
    12143: "antitoxic",
    12144: "antitrust",
    12145: "antiviral",
    12146: "antivirus",
    12151: "antler",
    12152: "antonym",
    12153: "antsy",
    12154: "anvil",
    12155: "anybody",
    12156: "anyhow",
    12161: "anymore",
    12162: "anyone",
    12163: "anyplace",
    12164: "anything",
    12165: "anytime",
    12166: "anyway",
    12211: "anywhere",
    12212: "aorta",
    12213: "apache",
    12214: "apostle",
    12215: "appealing",
    12216: "appear",
    12221: "appease",
    12222: "appeasing",
    12223: "appendage",
    12224: "appendix",
    12225: "appetite",
    12226: "appetizer",
    12231: "applaud",
    12232: "applause",
    12233: "apple",
    12234: "appliance",
    12235: "applicant",
    12236: "applied",
    12241: "apply",
    12242: "appointee",
    12243: "appraisal",
    12244: "appraiser",
    12245: "apprehend",
    12246: "approach",
    12251: "approval",
    12252: "approve",
    12253: "apricot",
    12254: "april",
    12255: "apron",
    12256: "aptitude",
    12261: "aptly",
    12262: "aqua",
    12263: "aqueduct",
    12264: "arbitrary",
    12265: "arbitrate",
    12266: "ardently",
    12311: "area",
    12312: "arena",
    12313: "arguable",
    12314: "arguably",
    12315: "argue",
    12316: "arise",
    12321: "armadillo",
    12322: "armband",
    12323: "armchair",
    12324: "armed",
    12325: "armful",
    12326: "armhole",
    12331: "arming",
    12332: "armless",
    12333: "armoire",
    12334: "armored",
    12335: "armory",
    12336: "armrest",
    12341: "army",
    12342: "aroma",
    12343: "arose",
    12344: "around",
    12345: "arousal",
    12346: "arrange",
    12351: "array",
    12352: "arrest",
    12353: "arrival",
    12354: "arrive",
    12355: "arrogance",
    12356: "arrogant",
    12361: "arson",
    12362: "art",
    12363: "ascend",
    12364: "ascension",
    12365: "ascent",
    12366: "ascertain",
    12411: "ashamed",
    12412: "ashen",
    12413: "ashes",
    12414: "ashy",
    12415: "aside",
    12416: "askew",
    12421: "asleep",
    12422: "asparagus",
    12423: "aspect",
    12424: "aspirate",
    12425: "aspire",
    12426: "aspirin",
    12431: "astonish",
    12432: "astound",
    12433: "astride",
    12434: "astrology",
    12435: "astronaut",
    12436: "astronomy",
    12441: "astute",
    12442: "atlantic",
    12443: "atlas",
    12444: "atom",
    12445: "atonable",
    12446: "atop",
    12451: "atrium",
    12452: "atrocious",
    12453: "atrophy",
    12454: "attach",
    12455: "attain",
    12456: "attempt",
    12461: "attendant",
    12462: "attendee",
    12463: "attention",
    12464: "attentive",
    12465: "attest",
    12466: "attic",
    12511: "attire",
    12512: "attitude",
    12513: "attractor",
    12514: "attribute",
    12515: "atypical",
    12516: "auction",
    12521: "audacious",
    12522: "audacity",
    12523: "audible",
    12524: "audibly",
    12525: "audience",
    12526: "audio",
    12531: "audition",
    12532: "augmented",
    12533: "august",
    12534: "authentic",
    12535: "author",
    12536: "autism",
    12541: "autistic",
    12542: "autograph",
    12543: "automaker",
    12544: "automated",
    12545: "automatic",
    12546: "autopilot",
    12551: "available",
    12552: "avalanche",
    12553: "avatar",
    12554: "avenge",
    12555: "avenging",
    12556: "avenue",
    12561: "average",
    12562: "aversion",
    12563: "avert",
    12564: "aviation",
    12565: "aviator",
    12566: "avid",
    12611: "avoid",
    12612: "await",
    12613: "awaken",
    12614: "award",
    12615: "aware",
    12616: "awhile",
    12621: "awkward",
    12622: "awning",
    12623: "awoke",
    12624: "awry",
    12625: "axis",
    12626: "babble",
    12631: "babbling",
    12632: "babied",
    12633: "baboon",
    12634: "backache",
    12635: "backboard",
    12636: "backboned",
    12641: "backdrop",
    12642: "backed",
    12643: "backer",
    12644: "backfield",
    12645: "backfire",
    12646: "backhand",
    12651: "backing",
    12652: "backlands",
    12653: "backlash",
    12654: "backless",
    12655: "backlight",
    12656: "backlit",
    12661: "backlog",
    12662: "backpack",
    12663: "backpedal",
    12664: "backrest",
    12665: "backroom",
    12666: "backshift",
    13111: "backside",
    13112: "backslid",
    13113: "backspace",
    13114: "backspin",
    13115: "backstab",
    13116: "backstage",
    13121: "backtalk",
    13122: "backtrack",
    13123: "backup",
    13124: "backward",
    13125: "backwash",
    13126: "backwater",
    13131: "backyard",
    13132: "bacon",
    13133: "bacteria",
    13134: "bacterium",
    13135: "badass",
    13136: "badge",
    13141: "badland",
    13142: "badly",
    13143: "badness",
    13144: "baffle",
    13145: "baffling",
    13146: "bagel",
    13151: "bagful",
    13152: "baggage",
    13153: "bagged",
    13154: "baggie",
    13155: "bagginess",
    13156: "bagging",
    13161: "baggy",
    13162: "bagpipe",
    13163: "baguette",
    13164: "baked",
    13165: "bakery",
    13166: "bakeshop",
    13211: "baking",
    13212: "balance",
    13213: "balancing",
    13214: "balcony",
    13215: "balmy",
    13216: "balsamic",
    13221: "bamboo",
    13222: "banana",
    13223: "banish",
    13224: "banister",
    13225: "banjo",
    13226: "bankable",
    13231: "bankbook",
    13232: "banked",
    13233: "banker",
    13234: "banking",
    13235: "banknote",
    13236: "bankroll",
    13241: "banner",
    13242: "bannister",
    13243: "banshee",
    13244: "banter",
    13245: "barbecue",
    13246: "barbed",
    13251: "barbell",
    13252: "barber",
    13253: "barcode",
    13254: "barge",
    13255: "bargraph",
    13256: "barista",
    13261: "baritone",
    13262: "barley",
    13263: "barmaid",
    13264: "barman",
    13265: "barn",
    13266: "barometer",
    13311: "barrack",
    13312: "barracuda",
    13313: "barrel",
    13314: "barrette",
    13315: "barricade",
    13316: "barrier",
    13321: "barstool",
    13322: "bartender",
    13323: "barterer",
    13324: "bash",
    13325: "basically",
    13326: "basics",
    13331: "basil",
    13332: "basin",
    13333: "basis",
    13334: "basket",
    13335: "batboy",
    13336: "batch",
    13341: "bath",
    13342: "baton",
    13343: "bats",
    13344: "battalion",
    13345: "battered",
    13346: "battering",
    13351: "battery",
    13352: "batting",
    13353: "battle",
    13354: "bauble",
    13355: "bazooka",
    13356: "blabber",
    13361: "bladder",
    13362: "blade",
    13363: "blah",
    13364: "blame",
    13365: "blaming",
    13366: "blanching",
    13411: "blandness",
    13412: "blank",
    13413: "blaspheme",
    13414: "blasphemy",
    13415: "blast",
    13416: "blatancy",
    13421: "blatantly",
    13422: "blazer",
    13423: "blazing",
    13424: "bleach",
    13425: "bleak",
    13426: "bleep",
    13431: "blemish",
    13432: "blend",
    13433: "bless",
    13434: "blighted",
    13435: "blimp",
    13436: "bling",
    13441: "blinked",
    13442: "blinker",
    13443: "blinking",
    13444: "blinks",
    13445: "blip",
    13446: "blissful",
    13451: "blitz",
    13452: "blizzard",
    13453: "bloated",
    13454: "bloating",
    13455: "blob",
    13456: "blog",
    13461: "bloomers",
    13462: "blooming",
    13463: "blooper",
    13464: "blot",
    13465: "blouse",
    13466: "blubber",
    13511: "bluff",
    13512: "bluish",
    13513: "blunderer",
    13514: "blunt",
    13515: "blurb",
    13516: "blurred",
    13521: "blurry",
    13522: "blurt",
    13523: "blush",
    13524: "blustery",
    13525: "boaster",
    13526: "boastful",
    13531: "boasting",
    13532: "boat",
    13533: "bobbed",
    13534: "bobbing",
    13535: "bobble",
    13536: "bobcat",
    13541: "bobsled",
    13542: "bobtail",
    13543: "bodacious",
    13544: "body",
    13545: "bogged",
    13546: "boggle",
    13551: "bogus",
    13552: "boil",
    13553: "bok",
    13554: "bolster",
    13555: "bolt",
    13556: "bonanza",
    13561: "bonded",
    13562: "bonding",
    13563: "bondless",
    13564: "boned",
    13565: "bonehead",
    13566: "boneless",
    13611: "bonelike",
    13612: "boney",
    13613: "bonfire",
    13614: "bonnet",
    13615: "bonsai",
    13616: "bonus",
    13621: "bony",
    13622: "boogeyman",
    13623: "boogieman",
    13624: "book",
    13625: "boondocks",
    13626: "booted",
    13631: "booth",
    13632: "bootie",
    13633: "booting",
    13634: "bootlace",
    13635: "bootleg",
    13636: "boots",
    13641: "boozy",
    13642: "borax",
    13643: "boring",
    13644: "borough",
    13645: "borrower",
    13646: "borrowing",
    13651: "boss",
    13652: "botanical",
    13653: "botanist",
    13654: "botany",
    13655: "botch",
    13656: "both",
    13661: "bottle",
    13662: "bottling",
    13663: "bottom",
    13664: "bounce",
    13665: "bouncing",
    13666: "bouncy",
    14111: "bounding",
    14112: "boundless",
    14113: "bountiful",
    14114: "bovine",
    14115: "boxcar",
    14116: "boxer",
    14121: "boxing",
    14122: "boxlike",
    14123: "boxy",
    14124: "breach",
    14125: "breath",
    14126: "breeches",
    14131: "breeching",
    14132: "breeder",
    14133: "breeding",
    14134: "breeze",
    14135: "breezy",
    14136: "brethren",
    14141: "brewery",
    14142: "brewing",
    14143: "briar",
    14144: "bribe",
    14145: "brick",
    14146: "bride",
    14151: "bridged",
    14152: "brigade",
    14153: "bright",
    14154: "brilliant",
    14155: "brim",
    14156: "bring",
    14161: "brink",
    14162: "brisket",
    14163: "briskly",
    14164: "briskness",
    14165: "bristle",
    14166: "brittle",
    14211: "broadband",
    14212: "broadcast",
    14213: "broaden",
    14214: "broadly",
    14215: "broadness",
    14216: "broadside",
    14221: "broadways",
    14222: "broiler",
    14223: "broiling",
    14224: "broken",
    14225: "broker",
    14226: "bronchial",
    14231: "bronco",
    14232: "bronze",
    14233: "bronzing",
    14234: "brook",
    14235: "broom",
    14236: "brought",
    14241: "browbeat",
    14242: "brownnose",
    14243: "browse",
    14244: "browsing",
    14245: "bruising",
    14246: "brunch",
    14251: "brunette",
    14252: "brunt",
    14253: "brush",
    14254: "brussels",
    14255: "brute",
    14256: "brutishly",
    14261: "bubble",
    14262: "bubbling",
    14263: "bubbly",
    14264: "buccaneer",
    14265: "bucked",
    14266: "bucket",
    14311: "buckle",
    14312: "buckshot",
    14313: "buckskin",
    14314: "bucktooth",
    14315: "buckwheat",
    14316: "buddhism",
    14321: "buddhist",
    14322: "budding",
    14323: "buddy",
    14324: "budget",
    14325: "buffalo",
    14326: "buffed",
    14331: "buffer",
    14332: "buffing",
    14333: "buffoon",
    14334: "buggy",
    14335: "bulb",
    14336: "bulge",
    14341: "bulginess",
    14342: "bulgur",
    14343: "bulk",
    14344: "bulldog",
    14345: "bulldozer",
    14346: "bullfight",
    14351: "bullfrog",
    14352: "bullhorn",
    14353: "bullion",
    14354: "bullish",
    14355: "bullpen",
    14356: "bullring",
    14361: "bullseye",
    14362: "bullwhip",
    14363: "bully",
    14364: "bunch",
    14365: "bundle",
    14366: "bungee",
    14411: "bunion",
    14412: "bunkbed",
    14413: "bunkhouse",
    14414: "bunkmate",
    14415: "bunny",
    14416: "bunt",
    14421: "busboy",
    14422: "bush",
    14423: "busily",
    14424: "busload",
    14425: "bust",
    14426: "busybody",
    14431: "buzz",
    14432: "cabana",
    14433: "cabbage",
    14434: "cabbie",
    14435: "cabdriver",
    14436: "cable",
    14441: "caboose",
    14442: "cache",
    14443: "cackle",
    14444: "cacti",
    14445: "cactus",
    14446: "caddie",
    14451: "caddy",
    14452: "cadet",
    14453: "cadillac",
    14454: "cadmium",
    14455: "cage",
    14456: "cahoots",
    14461: "cake",
    14462: "calamari",
    14463: "calamity",
    14464: "calcium",
    14465: "calculate",
    14466: "calculus",
    14511: "caliber",
    14512: "calibrate",
    14513: "calm",
    14514: "caloric",
    14515: "calorie",
    14516: "calzone",
    14521: "camcorder",
    14522: "cameo",
    14523: "camera",
    14524: "camisole",
    14525: "camper",
    14526: "campfire",
    14531: "camping",
    14532: "campsite",
    14533: "campus",
    14534: "canal",
    14535: "canary",
    14536: "cancel",
    14541: "candied",
    14542: "candle",
    14543: "candy",
    14544: "cane",
    14545: "canine",
    14546: "canister",
    14551: "cannabis",
    14552: "canned",
    14553: "canning",
    14554: "cannon",
    14555: "cannot",
    14556: "canola",
    14561: "canon",
    14562: "canopener",
    14563: "canopy",
    14564: "canteen",
    14565: "canyon",
    14566: "capable",
    14611: "capably",
    14612: "capacity",
    14613: "cape",
    14614: "capillary",
    14615: "capital",
    14616: "capitol",
    14621: "capped",
    14622: "capricorn",
    14623: "capsize",
    14624: "capsule",
    14625: "caption",
    14626: "captivate",
    14631: "captive",
    14632: "captivity",
    14633: "capture",
    14634: "caramel",
    14635: "carat",
    14636: "caravan",
    14641: "carbon",
    14642: "cardboard",
    14643: "carded",
    14644: "cardiac",
    14645: "cardigan",
    14646: "cardinal",
    14651: "cardstock",
    14652: "carefully",
    14653: "caregiver",
    14654: "careless",
    14655: "caress",
    14656: "caretaker",
    14661: "cargo",
    14662: "caring",
    14663: "carless",
    14664: "carload",
    14665: "carmaker",
    14666: "carnage",
    15111: "carnation",
    15112: "carnival",
    15113: "carnivore",
    15114: "carol",
    15115: "carpenter",
    15116: "carpentry",
    15121: "carpool",
    15122: "carport",
    15123: "carried",
    15124: "carrot",
    15125: "carrousel",
    15126: "carry",
    15131: "cartel",
    15132: "cartload",
    15133: "carton",
    15134: "cartoon",
    15135: "cartridge",
    15136: "cartwheel",
    15141: "carve",
    15142: "carving",
    15143: "carwash",
    15144: "cascade",
    15145: "case",
    15146: "cash",
    15151: "casing",
    15152: "casino",
    15153: "casket",
    15154: "cassette",
    15155: "casually",
    15156: "casualty",
    15161: "catacomb",
    15162: "catalog",
    15163: "catalyst",
    15164: "catalyze",
    15165: "catapult",
    15166: "cataract",
    15211: "catatonic",
    15212: "catcall",
    15213: "catchable",
    15214: "catcher",
    15215: "catching",
    15216: "catchy",
    15221: "caterer",
    15222: "catering",
    15223: "catfight",
    15224: "catfish",
    15225: "cathedral",
    15226: "cathouse",
    15231: "catlike",
    15232: "catnap",
    15233: "catnip",
    15234: "catsup",
    15235: "cattail",
    15236: "cattishly",
    15241: "cattle",
    15242: "catty",
    15243: "catwalk",
    15244: "caucasian",
    15245: "caucus",
    15246: "causal",
    15251: "causation",
    15252: "cause",
    15253: "causing",
    15254: "cauterize",
    15255: "caution",
    15256: "cautious",
    15261: "cavalier",
    15262: "cavalry",
    15263: "caviar",
    15264: "cavity",
    15265: "cedar",
    15266: "celery",
    15311: "celestial",
    15312: "celibacy",
    15313: "celibate",
    15314: "celtic",
    15315: "cement",
    15316: "census",
    15321: "ceramics",
    15322: "ceremony",
    15323: "certainly",
    15324: "certainty",
    15325: "certified",
    15326: "certify",
    15331: "cesarean",
    15332: "cesspool",
    15333: "chafe",
    15334: "chaffing",
    15335: "chain",
    15336: "chair",
    15341: "chalice",
    15342: "challenge",
    15343: "chamber",
    15344: "chamomile",
    15345: "champion",
    15346: "chance",
    15351: "change",
    15352: "channel",
    15353: "chant",
    15354: "chaos",
    15355: "chaperone",
    15356: "chaplain",
    15361: "chapped",
    15362: "chaps",
    15363: "chapter",
    15364: "character",
    15365: "charbroil",
    15366: "charcoal",
    15411: "charger",
    15412: "charging",
    15413: "chariot",
    15414: "charity",
    15415: "charm",
    15416: "charred",
    15421: "charter",
    15422: "charting",
    15423: "chase",
    15424: "chasing",
    15425: "chaste",
    15426: "chastise",
    15431: "chastity",
    15432: "chatroom",
    15433: "chatter",
    15434: "chatting",
    15435: "chatty",
    15436: "cheating",
    15441: "cheddar",
    15442: "cheek",
    15443: "cheer",
    15444: "cheese",
    15445: "cheesy",
    15446: "chef",
    15451: "chemicals",
    15452: "chemist",
    15453: "chemo",
    15454: "cherisher",
    15455: "cherub",
    15456: "chess",
    15461: "chest",
    15462: "chevron",
    15463: "chevy",
    15464: "chewable",
    15465: "chewer",
    15466: "chewing",
    15511: "chewy",
    15512: "chief",
    15513: "chihuahua",
    15514: "childcare",
    15515: "childhood",
    15516: "childish",
    15521: "childless",
    15522: "childlike",
    15523: "chili",
    15524: "chill",
    15525: "chimp",
    15526: "chip",
    15531: "chirping",
    15532: "chirpy",
    15533: "chitchat",
    15534: "chivalry",
    15535: "chive",
    15536: "chloride",
    15541: "chlorine",
    15542: "choice",
    15543: "chokehold",
    15544: "choking",
    15545: "chomp",
    15546: "chooser",
    15551: "choosing",
    15552: "choosy",
    15553: "chop",
    15554: "chosen",
    15555: "chowder",
    15556: "chowtime",
    15561: "chrome",
    15562: "chubby",
    15563: "chuck",
    15564: "chug",
    15565: "chummy",
    15566: "chump",
    15611: "chunk",
    15612: "churn",
    15613: "chute",
    15614: "cider",
    15615: "cilantro",
    15616: "cinch",
    15621: "cinema",
    15622: "cinnamon",
    15623: "circle",
    15624: "circling",
    15625: "circular",
    15626: "circulate",
    15631: "circus",
    15632: "citable",
    15633: "citadel",
    15634: "citation",
    15635: "citizen",
    15636: "citric",
    15641: "citrus",
    15642: "city",
    15643: "civic",
    15644: "civil",
    15645: "clad",
    15646: "claim",
    15651: "clambake",
    15652: "clammy",
    15653: "clamor",
    15654: "clamp",
    15655: "clamshell",
    15656: "clang",
    15661: "clanking",
    15662: "clapped",
    15663: "clapper",
    15664: "clapping",
    15665: "clarify",
    15666: "clarinet",
    16111: "clarity",
    16112: "clash",
    16113: "clasp",
    16114: "class",
    16115: "clatter",
    16116: "clause",
    16121: "clavicle",
    16122: "claw",
    16123: "clay",
    16124: "clean",
    16125: "clear",
    16126: "cleat",
    16131: "cleaver",
    16132: "cleft",
    16133: "clench",
    16134: "clergyman",
    16135: "clerical",
    16136: "clerk",
    16141: "clever",
    16142: "clicker",
    16143: "client",
    16144: "climate",
    16145: "climatic",
    16146: "cling",
    16151: "clinic",
    16152: "clinking",
    16153: "clip",
    16154: "clique",
    16155: "cloak",
    16156: "clobber",
    16161: "clock",
    16162: "clone",
    16163: "cloning",
    16164: "closable",
    16165: "closure",
    16166: "clothes",
    16211: "clothing",
    16212: "cloud",
    16213: "clover",
    16214: "clubbed",
    16215: "clubbing",
    16216: "clubhouse",
    16221: "clump",
    16222: "clumsily",
    16223: "clumsy",
    16224: "clunky",
    16225: "clustered",
    16226: "clutch",
    16231: "clutter",
    16232: "coach",
    16233: "coagulant",
    16234: "coastal",
    16235: "coaster",
    16236: "coasting",
    16241: "coastland",
    16242: "coastline",
    16243: "coat",
    16244: "coauthor",
    16245: "cobalt",
    16246: "cobbler",
    16251: "cobweb",
    16252: "cocoa",
    16253: "coconut",
    16254: "cod",
    16255: "coeditor",
    16256: "coerce",
    16261: "coexist",
    16262: "coffee",
    16263: "cofounder",
    16264: "cognition",
    16265: "cognitive",
    16266: "cogwheel",
    16311: "coherence",
    16312: "coherent",
    16313: "cohesive",
    16314: "coil",
    16315: "coke",
    16316: "cola",
    16321: "cold",
    16322: "coleslaw",
    16323: "coliseum",
    16324: "collage",
    16325: "collapse",
    16326: "collar",
    16331: "collected",
    16332: "collector",
    16333: "collide",
    16334: "collie",
    16335: "collision",
    16336: "colonial",
    16341: "colonist",
    16342: "colonize",
    16343: "colony",
    16344: "colossal",
    16345: "colt",
    16346: "coma",
    16351: "come",
    16352: "comfort",
    16353: "comfy",
    16354: "comic",
    16355: "coming",
    16356: "comma",
    16361: "commence",
    16362: "commend",
    16363: "comment",
    16364: "commerce",
    16365: "commode",
    16366: "commodity",
    16411: "commodore",
    16412: "common",
    16413: "commotion",
    16414: "commute",
    16415: "commuting",
    16416: "compacted",
    16421: "compacter",
    16422: "compactly",
    16423: "compactor",
    16424: "companion",
    16425: "company",
    16426: "compare",
    16431: "compel",
    16432: "compile",
    16433: "comply",
    16434: "component",
    16435: "composed",
    16436: "composer",
    16441: "composite",
    16442: "compost",
    16443: "composure",
    16444: "compound",
    16445: "compress",
    16446: "comprised",
    16451: "computer",
    16452: "computing",
    16453: "comrade",
    16454: "concave",
    16455: "conceal",
    16456: "conceded",
    16461: "concept",
    16462: "concerned",
    16463: "concert",
    16464: "conch",
    16465: "concierge",
    16466: "concise",
    16511: "conclude",
    16512: "concrete",
    16513: "concur",
    16514: "condense",
    16515: "condiment",
    16516: "condition",
    16521: "condone",
    16522: "conducive",
    16523: "conductor",
    16524: "conduit",
    16525: "cone",
    16526: "confess",
    16531: "confetti",
    16532: "confidant",
    16533: "confident",
    16534: "confider",
    16535: "confiding",
    16536: "configure",
    16541: "confined",
    16542: "confining",
    16543: "confirm",
    16544: "conflict",
    16545: "conform",
    16546: "confound",
    16551: "confront",
    16552: "confused",
    16553: "confusing",
    16554: "confusion",
    16555: "congenial",
    16556: "congested",
    16561: "congrats",
    16562: "congress",
    16563: "conical",
    16564: "conjoined",
    16565: "conjure",
    16566: "conjuror",
    16611: "connected",
    16612: "connector",
    16613: "consensus",
    16614: "consent",
    16615: "console",
    16616: "consoling",
    16621: "consonant",
    16622: "constable",
    16623: "constant",
    16624: "constrain",
    16625: "constrict",
    16626: "construct",
    16631: "consult",
    16632: "consumer",
    16633: "consuming",
    16634: "contact",
    16635: "container",
    16636: "contempt",
    16641: "contend",
    16642: "contented",
    16643: "contently",
    16644: "contents",
    16645: "contest",
    16646: "context",
    16651: "contort",
    16652: "contour",
    16653: "contrite",
    16654: "control",
    16655: "contusion",
    16656: "convene",
    16661: "convent",
    16662: "copartner",
    16663: "cope",
    16664: "copied",
    16665: "copier",
    16666: "copilot",
    21111: "coping",
    21112: "copious",
    21113: "copper",
    21114: "copy",
    21115: "coral",
    21116: "cork",
    21121: "cornball",
    21122: "cornbread",
    21123: "corncob",
    21124: "cornea",
    21125: "corned",
    21126: "corner",
    21131: "cornfield",
    21132: "cornflake",
    21133: "cornhusk",
    21134: "cornmeal",
    21135: "cornstalk",
    21136: "corny",
    21141: "coronary",
    21142: "coroner",
    21143: "corporal",
    21144: "corporate",
    21145: "corral",
    21146: "correct",
    21151: "corridor",
    21152: "corrode",
    21153: "corroding",
    21154: "corrosive",
    21155: "corsage",
    21156: "corset",
    21161: "cortex",
    21162: "cosigner",
    21163: "cosmetics",
    21164: "cosmic",
    21165: "cosmos",
    21166: "cosponsor",
    21211: "cost",
    21212: "cottage",
    21213: "cotton",
    21214: "couch",
    21215: "cough",
    21216: "could",
    21221: "countable",
    21222: "countdown",
    21223: "counting",
    21224: "countless",
    21225: "country",
    21226: "county",
    21231: "courier",
    21232: "covenant",
    21233: "cover",
    21234: "coveted",
    21235: "coveting",
    21236: "coyness",
    21241: "cozily",
    21242: "coziness",
    21243: "cozy",
    21244: "crabbing",
    21245: "crabgrass",
    21246: "crablike",
    21251: "crabmeat",
    21252: "cradle",
    21253: "cradling",
    21254: "crafter",
    21255: "craftily",
    21256: "craftsman",
    21261: "craftwork",
    21262: "crafty",
    21263: "cramp",
    21264: "cranberry",
    21265: "crane",
    21266: "cranial",
    21311: "cranium",
    21312: "crank",
    21313: "crate",
    21314: "crave",
    21315: "craving",
    21316: "crawfish",
    21321: "crawlers",
    21322: "crawling",
    21323: "crayfish",
    21324: "crayon",
    21325: "crazed",
    21326: "crazily",
    21331: "craziness",
    21332: "crazy",
    21333: "creamed",
    21334: "creamer",
    21335: "creamlike",
    21336: "crease",
    21341: "creasing",
    21342: "creatable",
    21343: "create",
    21344: "creation",
    21345: "creative",
    21346: "creature",
    21351: "credible",
    21352: "credibly",
    21353: "credit",
    21354: "creed",
    21355: "creme",
    21356: "creole",
    21361: "crepe",
    21362: "crept",
    21363: "crescent",
    21364: "crested",
    21365: "cresting",
    21366: "crestless",
    21411: "crevice",
    21412: "crewless",
    21413: "crewman",
    21414: "crewmate",
    21415: "crib",
    21416: "cricket",
    21421: "cried",
    21422: "crier",
    21423: "crimp",
    21424: "crimson",
    21425: "cringe",
    21426: "cringing",
    21431: "crinkle",
    21432: "crinkly",
    21433: "crisped",
    21434: "crisping",
    21435: "crisply",
    21436: "crispness",
    21441: "crispy",
    21442: "criteria",
    21443: "critter",
    21444: "croak",
    21445: "crock",
    21446: "crook",
    21451: "croon",
    21452: "crop",
    21453: "cross",
    21454: "crouch",
    21455: "crouton",
    21456: "crowbar",
    21461: "crowd",
    21462: "crown",
    21463: "crucial",
    21464: "crudely",
    21465: "crudeness",
    21466: "cruelly",
    21511: "cruelness",
    21512: "cruelty",
    21513: "crumb",
    21514: "crummiest",
    21515: "crummy",
    21516: "crumpet",
    21521: "crumpled",
    21522: "cruncher",
    21523: "crunching",
    21524: "crunchy",
    21525: "crusader",
    21526: "crushable",
    21531: "crushed",
    21532: "crusher",
    21533: "crushing",
    21534: "crust",
    21535: "crux",
    21536: "crying",
    21541: "cryptic",
    21542: "crystal",
    21543: "cubbyhole",
    21544: "cube",
    21545: "cubical",
    21546: "cubicle",
    21551: "cucumber",
    21552: "cuddle",
    21553: "cuddly",
    21554: "cufflink",
    21555: "culinary",
    21556: "culminate",
    21561: "culpable",
    21562: "culprit",
    21563: "cultivate",
    21564: "cultural",
    21565: "culture",
    21566: "cupbearer",
    21611: "cupcake",
    21612: "cupid",
    21613: "cupped",
    21614: "cupping",
    21615: "curable",
    21616: "curator",
    21621: "curdle",
    21622: "cure",
    21623: "curfew",
    21624: "curing",
    21625: "curled",
    21626: "curler",
    21631: "curliness",
    21632: "curling",
    21633: "curly",
    21634: "curry",
    21635: "curse",
    21636: "cursive",
    21641: "cursor",
    21642: "curtain",
    21643: "curtly",
    21644: "curtsy",
    21645: "curvature",
    21646: "curve",
    21651: "curvy",
    21652: "cushy",
    21653: "cusp",
    21654: "cussed",
    21655: "custard",
    21656: "custodian",
    21661: "custody",
    21662: "customary",
    21663: "customer",
    21664: "customize",
    21665: "customs",
    21666: "cut",
    22111: "cycle",
    22112: "cyclic",
    22113: "cycling",
    22114: "cyclist",
    22115: "cylinder",
    22116: "cymbal",
    22121: "cytoplasm",
    22122: "cytoplast",
    22123: "dab",
    22124: "dad",
    22125: "daffodil",
    22126: "dagger",
    22131: "daily",
    22132: "daintily",
    22133: "dainty",
    22134: "dairy",
    22135: "daisy",
    22136: "dallying",
    22141: "dance",
    22142: "dancing",
    22143: "dandelion",
    22144: "dander",
    22145: "dandruff",
    22146: "dandy",
    22151: "danger",
    22152: "dangle",
    22153: "dangling",
    22154: "daredevil",
    22155: "dares",
    22156: "daringly",
    22161: "darkened",
    22162: "darkening",
    22163: "darkish",
    22164: "darkness",
    22165: "darkroom",
    22166: "darling",
    22211: "darn",
    22212: "dart",
    22213: "darwinism",
    22214: "dash",
    22215: "dastardly",
    22216: "data",
    22221: "datebook",
    22222: "dating",
    22223: "daughter",
    22224: "daunting",
    22225: "dawdler",
    22226: "dawn",
    22231: "daybed",
    22232: "daybreak",
    22233: "daycare",
    22234: "daydream",
    22235: "daylight",
    22236: "daylong",
    22241: "dayroom",
    22242: "daytime",
    22243: "dazzler",
    22244: "dazzling",
    22245: "deacon",
    22246: "deafening",
    22251: "deafness",
    22252: "dealer",
    22253: "dealing",
    22254: "dealmaker",
    22255: "dealt",
    22256: "dean",
    22261: "debatable",
    22262: "debate",
    22263: "debating",
    22264: "debit",
    22265: "debrief",
    22266: "debtless",
    22311: "debtor",
    22312: "debug",
    22313: "debunk",
    22314: "decade",
    22315: "decaf",
    22316: "decal",
    22321: "decathlon",
    22322: "decay",
    22323: "deceased",
    22324: "deceit",
    22325: "deceiver",
    22326: "deceiving",
    22331: "december",
    22332: "decency",
    22333: "decent",
    22334: "deception",
    22335: "deceptive",
    22336: "decibel",
    22341: "decidable",
    22342: "decimal",
    22343: "decimeter",
    22344: "decipher",
    22345: "deck",
    22346: "declared",
    22351: "decline",
    22352: "decode",
    22353: "decompose",
    22354: "decorated",
    22355: "decorator",
    22356: "decoy",
    22361: "decrease",
    22362: "decree",
    22363: "dedicate",
    22364: "dedicator",
    22365: "deduce",
    22366: "deduct",
    22411: "deed",
    22412: "deem",
    22413: "deepen",
    22414: "deeply",
    22415: "deepness",
    22416: "deface",
    22421: "defacing",
    22422: "defame",
    22423: "default",
    22424: "defeat",
    22425: "defection",
    22426: "defective",
    22431: "defendant",
    22432: "defender",
    22433: "defense",
    22434: "defensive",
    22435: "deferral",
    22436: "deferred",
    22441: "defiance",
    22442: "defiant",
    22443: "defile",
    22444: "defiling",
    22445: "define",
    22446: "definite",
    22451: "deflate",
    22452: "deflation",
    22453: "deflator",
    22454: "deflected",
    22455: "deflector",
    22456: "defog",
    22461: "deforest",
    22462: "defraud",
    22463: "defrost",
    22464: "deftly",
    22465: "defuse",
    22466: "defy",
    22511: "degraded",
    22512: "degrading",
    22513: "degrease",
    22514: "degree",
    22515: "dehydrate",
    22516: "deity",
    22521: "dejected",
    22522: "delay",
    22523: "delegate",
    22524: "delegator",
    22525: "delete",
    22526: "deletion",
    22531: "delicacy",
    22532: "delicate",
    22533: "delicious",
    22534: "delighted",
    22535: "delirious",
    22536: "delirium",
    22541: "deliverer",
    22542: "delivery",
    22543: "delouse",
    22544: "delta",
    22545: "deluge",
    22546: "delusion",
    22551: "deluxe",
    22552: "demanding",
    22553: "demeaning",
    22554: "demeanor",
    22555: "demise",
    22556: "democracy",
    22561: "democrat",
    22562: "demote",
    22563: "demotion",
    22564: "demystify",
    22565: "denatured",
    22566: "deniable",
    22611: "denial",
    22612: "denim",
    22613: "denote",
    22614: "dense",
    22615: "density",
    22616: "dental",
    22621: "dentist",
    22622: "denture",
    22623: "deny",
    22624: "deodorant",
    22625: "deodorize",
    22626: "departed",
    22631: "departure",
    22632: "depict",
    22633: "deplete",
    22634: "depletion",
    22635: "deplored",
    22636: "deploy",
    22641: "deport",
    22642: "depose",
    22643: "depraved",
    22644: "depravity",
    22645: "deprecate",
    22646: "depress",
    22651: "deprive",
    22652: "depth",
    22653: "deputize",
    22654: "deputy",
    22655: "derail",
    22656: "deranged",
    22661: "derby",
    22662: "derived",
    22663: "desecrate",
    22664: "deserve",
    22665: "deserving",
    22666: "designate",
    23111: "designed",
    23112: "designer",
    23113: "designing",
    23114: "deskbound",
    23115: "desktop",
    23116: "deskwork",
    23121: "desolate",
    23122: "despair",
    23123: "despise",
    23124: "despite",
    23125: "destiny",
    23126: "destitute",
    23131: "destruct",
    23132: "detached",
    23133: "detail",
    23134: "detection",
    23135: "detective",
    23136: "detector",
    23141: "detention",
    23142: "detergent",
    23143: "detest",
    23144: "detonate",
    23145: "detonator",
    23146: "detoxify",
    23151: "detract",
    23152: "deuce",
    23153: "devalue",
    23154: "deviancy",
    23155: "deviant",
    23156: "deviate",
    23161: "deviation",
    23162: "deviator",
    23163: "device",
    23164: "devious",
    23165: "devotedly",
    23166: "devotee",
    23211: "devotion",
    23212: "devourer",
    23213: "devouring",
    23214: "devoutly",
    23215: "dexterity",
    23216: "dexterous",
    23221: "diabetes",
    23222: "diabetic",
    23223: "diabolic",
    23224: "diagnoses",
    23225: "diagnosis",
    23226: "diagram",
    23231: "dial",
    23232: "diameter",
    23233: "diaper",
    23234: "diaphragm",
    23235: "diary",
    23236: "dice",
    23241: "dicing",
    23242: "dictate",
    23243: "dictation",
    23244: "dictator",
    23245: "difficult",
    23246: "diffused",
    23251: "diffuser",
    23252: "diffusion",
    23253: "diffusive",
    23254: "dig",
    23255: "dilation",
    23256: "diligence",
    23261: "diligent",
    23262: "dill",
    23263: "dilute",
    23264: "dime",
    23265: "diminish",
    23266: "dimly",
    23311: "dimmed",
    23312: "dimmer",
    23313: "dimness",
    23314: "dimple",
    23315: "diner",
    23316: "dingbat",
    23321: "dinghy",
    23322: "dinginess",
    23323: "dingo",
    23324: "dingy",
    23325: "dining",
    23326: "dinner",
    23331: "diocese",
    23332: "dioxide",
    23333: "diploma",
    23334: "dipped",
    23335: "dipper",
    23336: "dipping",
    23341: "directed",
    23342: "direction",
    23343: "directive",
    23344: "directly",
    23345: "directory",
    23346: "direness",
    23351: "dirtiness",
    23352: "disabled",
    23353: "disagree",
    23354: "disallow",
    23355: "disarm",
    23356: "disarray",
    23361: "disaster",
    23362: "disband",
    23363: "disbelief",
    23364: "disburse",
    23365: "discard",
    23366: "discern",
    23411: "discharge",
    23412: "disclose",
    23413: "discolor",
    23414: "discount",
    23415: "discourse",
    23416: "discover",
    23421: "discuss",
    23422: "disdain",
    23423: "disengage",
    23424: "disfigure",
    23425: "disgrace",
    23426: "dish",
    23431: "disinfect",
    23432: "disjoin",
    23433: "disk",
    23434: "dislike",
    23435: "disliking",
    23436: "dislocate",
    23441: "dislodge",
    23442: "disloyal",
    23443: "dismantle",
    23444: "dismay",
    23445: "dismiss",
    23446: "dismount",
    23451: "disobey",
    23452: "disorder",
    23453: "disown",
    23454: "disparate",
    23455: "disparity",
    23456: "dispatch",
    23461: "dispense",
    23462: "dispersal",
    23463: "dispersed",
    23464: "disperser",
    23465: "displace",
    23466: "display",
    23511: "displease",
    23512: "disposal",
    23513: "dispose",
    23514: "disprove",
    23515: "dispute",
    23516: "disregard",
    23521: "disrupt",
    23522: "dissuade",
    23523: "distance",
    23524: "distant",
    23525: "distaste",
    23526: "distill",
    23531: "distinct",
    23532: "distort",
    23533: "distract",
    23534: "distress",
    23535: "district",
    23536: "distrust",
    23541: "ditch",
    23542: "ditto",
    23543: "ditzy",
    23544: "dividable",
    23545: "divided",
    23546: "dividend",
    23551: "dividers",
    23552: "dividing",
    23553: "divinely",
    23554: "diving",
    23555: "divinity",
    23556: "divisible",
    23561: "divisibly",
    23562: "division",
    23563: "divisive",
    23564: "divorcee",
    23565: "dizziness",
    23566: "dizzy",
    23611: "doable",
    23612: "docile",
    23613: "dock",
    23614: "doctrine",
    23615: "document",
    23616: "dodge",
    23621: "dodgy",
    23622: "doily",
    23623: "doing",
    23624: "dole",
    23625: "dollar",
    23626: "dollhouse",
    23631: "dollop",
    23632: "dolly",
    23633: "dolphin",
    23634: "domain",
    23635: "domelike",
    23636: "domestic",
    23641: "dominion",
    23642: "dominoes",
    23643: "donated",
    23644: "donation",
    23645: "donator",
    23646: "donor",
    23651: "donut",
    23652: "doodle",
    23653: "doorbell",
    23654: "doorframe",
    23655: "doorknob",
    23656: "doorman",
    23661: "doormat",
    23662: "doornail",
    23663: "doorpost",
    23664: "doorstep",
    23665: "doorstop",
    23666: "doorway",
    24111: "doozy",
    24112: "dork",
    24113: "dormitory",
    24114: "dorsal",
    24115: "dosage",
    24116: "dose",
    24121: "dotted",
    24122: "doubling",
    24123: "douche",
    24124: "dove",
    24125: "down",
    24126: "dowry",
    24131: "doze",
    24132: "drab",
    24133: "dragging",
    24134: "dragonfly",
    24135: "dragonish",
    24136: "dragster",
    24141: "drainable",
    24142: "drainage",
    24143: "drained",
    24144: "drainer",
    24145: "drainpipe",
    24146: "dramatic",
    24151: "dramatize",
    24152: "drank",
    24153: "drapery",
    24154: "drastic",
    24155: "draw",
    24156: "dreaded",
    24161: "dreadful",
    24162: "dreadlock",
    24163: "dreamboat",
    24164: "dreamily",
    24165: "dreamland",
    24166: "dreamless",
    24211: "dreamlike",
    24212: "dreamt",
    24213: "dreamy",
    24214: "drearily",
    24215: "dreary",
    24216: "drench",
    24221: "dress",
    24222: "drew",
    24223: "dribble",
    24224: "dried",
    24225: "drier",
    24226: "drift",
    24231: "driller",
    24232: "drilling",
    24233: "drinkable",
    24234: "drinking",
    24235: "dripping",
    24236: "drippy",
    24241: "drivable",
    24242: "driven",
    24243: "driver",
    24244: "driveway",
    24245: "driving",
    24246: "drizzle",
    24251: "drizzly",
    24252: "drone",
    24253: "drool",
    24254: "droop",
    24255: "drop-down",
    24256: "dropbox",
    24261: "dropkick",
    24262: "droplet",
    24263: "dropout",
    24264: "dropper",
    24265: "drove",
    24266: "drown",
    24311: "drowsily",
    24312: "drudge",
    24313: "drum",
    24314: "dry",
    24315: "dubbed",
    24316: "dubiously",
    24321: "duchess",
    24322: "duckbill",
    24323: "ducking",
    24324: "duckling",
    24325: "ducktail",
    24326: "ducky",
    24331: "duct",
    24332: "dude",
    24333: "duffel",
    24334: "dugout",
    24335: "duh",
    24336: "duke",
    24341: "duller",
    24342: "dullness",
    24343: "duly",
    24344: "dumping",
    24345: "dumpling",
    24346: "dumpster",
    24351: "duo",
    24352: "dupe",
    24353: "duplex",
    24354: "duplicate",
    24355: "duplicity",
    24356: "durable",
    24361: "durably",
    24362: "duration",
    24363: "duress",
    24364: "during",
    24365: "dusk",
    24366: "dust",
    24411: "dutiful",
    24412: "duty",
    24413: "duvet",
    24414: "dwarf",
    24415: "dweeb",
    24416: "dwelled",
    24421: "dweller",
    24422: "dwelling",
    24423: "dwindle",
    24424: "dwindling",
    24425: "dynamic",
    24426: "dynamite",
    24431: "dynasty",
    24432: "dyslexia",
    24433: "dyslexic",
    24434: "each",
    24435: "eagle",
    24436: "earache",
    24441: "eardrum",
    24442: "earflap",
    24443: "earful",
    24444: "earlobe",
    24445: "early",
    24446: "earmark",
    24451: "earmuff",
    24452: "earphone",
    24453: "earpiece",
    24454: "earplugs",
    24455: "earring",
    24456: "earshot",
    24461: "earthen",
    24462: "earthlike",
    24463: "earthling",
    24464: "earthly",
    24465: "earthworm",
    24466: "earthy",
    24511: "earwig",
    24512: "easeful",
    24513: "easel",
    24514: "easiest",
    24515: "easily",
    24516: "easiness",
    24521: "easing",
    24522: "eastbound",
    24523: "eastcoast",
    24524: "easter",
    24525: "eastward",
    24526: "eatable",
    24531: "eaten",
    24532: "eatery",
    24533: "eating",
    24534: "eats",
    24535: "ebay",
    24536: "ebony",
    24541: "ebook",
    24542: "ecard",
    24543: "eccentric",
    24544: "echo",
    24545: "eclair",
    24546: "eclipse",
    24551: "ecologist",
    24552: "ecology",
    24553: "economic",
    24554: "economist",
    24555: "economy",
    24556: "ecosphere",
    24561: "ecosystem",
    24562: "edge",
    24563: "edginess",
    24564: "edging",
    24565: "edgy",
    24566: "edition",
    24611: "editor",
    24612: "educated",
    24613: "education",
    24614: "educator",
    24615: "eel",
    24616: "effective",
    24621: "effects",
    24622: "efficient",
    24623: "effort",
    24624: "eggbeater",
    24625: "egging",
    24626: "eggnog",
    24631: "eggplant",
    24632: "eggshell",
    24633: "egomaniac",
    24634: "egotism",
    24635: "egotistic",
    24636: "either",
    24641: "eject",
    24642: "elaborate",
    24643: "elastic",
    24644: "elated",
    24645: "elbow",
    24646: "eldercare",
    24651: "elderly",
    24652: "eldest",
    24653: "electable",
    24654: "election",
    24655: "elective",
    24656: "elephant",
    24661: "elevate",
    24662: "elevating",
    24663: "elevation",
    24664: "elevator",
    24665: "eleven",
    24666: "elf",
    25111: "eligible",
    25112: "eligibly",
    25113: "eliminate",
    25114: "elite",
    25115: "elitism",
    25116: "elixir",
    25121: "elk",
    25122: "ellipse",
    25123: "elliptic",
    25124: "elm",
    25125: "elongated",
    25126: "elope",
    25131: "eloquence",
    25132: "eloquent",
    25133: "elsewhere",
    25134: "elude",
    25135: "elusive",
    25136: "elves",
    25141: "email",
    25142: "embargo",
    25143: "embark",
    25144: "embassy",
    25145: "embattled",
    25146: "embellish",
    25151: "ember",
    25152: "embezzle",
    25153: "emblaze",
    25154: "emblem",
    25155: "embody",
    25156: "embolism",
    25161: "emboss",
    25162: "embroider",
    25163: "emcee",
    25164: "emerald",
    25165: "emergency",
    25166: "emission",
    25211: "emit",
    25212: "emote",
    25213: "emoticon",
    25214: "emotion",
    25215: "empathic",
    25216: "empathy",
    25221: "emperor",
    25222: "emphases",
    25223: "emphasis",
    25224: "emphasize",
    25225: "emphatic",
    25226: "empirical",
    25231: "employed",
    25232: "employee",
    25233: "employer",
    25234: "emporium",
    25235: "empower",
    25236: "emptier",
    25241: "emptiness",
    25242: "empty",
    25243: "emu",
    25244: "enable",
    25245: "enactment",
    25246: "enamel",
    25251: "enchanted",
    25252: "enchilada",
    25253: "encircle",
    25254: "enclose",
    25255: "enclosure",
    25256: "encode",
    25261: "encore",
    25262: "encounter",
    25263: "encourage",
    25264: "encroach",
    25265: "encrust",
    25266: "encrypt",
    25311: "endanger",
    25312: "endeared",
    25313: "endearing",
    25314: "ended",
    25315: "ending",
    25316: "endless",
    25321: "endnote",
    25322: "endocrine",
    25323: "endorphin",
    25324: "endorse",
    25325: "endowment",
    25326: "endpoint",
    25331: "endurable",
    25332: "endurance",
    25333: "enduring",
    25334: "energetic",
    25335: "energize",
    25336: "energy",
    25341: "enforced",
    25342: "enforcer",
    25343: "engaged",
    25344: "engaging",
    25345: "engine",
    25346: "engorge",
    25351: "engraved",
    25352: "engraver",
    25353: "engraving",
    25354: "engross",
    25355: "engulf",
    25356: "enhance",
    25361: "enigmatic",
    25362: "enjoyable",
    25363: "enjoyably",
    25364: "enjoyer",
    25365: "enjoying",
    25366: "enjoyment",
    25411: "enlarged",
    25412: "enlarging",
    25413: "enlighten",
    25414: "enlisted",
    25415: "enquirer",
    25416: "enrage",
    25421: "enrich",
    25422: "enroll",
    25423: "enslave",
    25424: "ensnare",
    25425: "ensure",
    25426: "entail",
    25431: "entangled",
    25432: "entering",
    25433: "entertain",
    25434: "enticing",
    25435: "entire",
    25436: "entitle",
    25441: "entity",
    25442: "entomb",
    25443: "entourage",
    25444: "entrap",
    25445: "entree",
    25446: "entrench",
    25451: "entrust",
    25452: "entryway",
    25453: "entwine",
    25454: "enunciate",
    25455: "envelope",
    25456: "enviable",
    25461: "enviably",
    25462: "envious",
    25463: "envision",
    25464: "envoy",
    25465: "envy",
    25466: "enzyme",
    25511: "epic",
    25512: "epidemic",
    25513: "epidermal",
    25514: "epidermis",
    25515: "epidural",
    25516: "epilepsy",
    25521: "epileptic",
    25522: "epilogue",
    25523: "epiphany",
    25524: "episode",
    25525: "equal",
    25526: "equate",
    25531: "equation",
    25532: "equator",
    25533: "equinox",
    25534: "equipment",
    25535: "equity",
    25536: "equivocal",
    25541: "eradicate",
    25542: "erasable",
    25543: "erased",
    25544: "eraser",
    25545: "erasure",
    25546: "ergonomic",
    25551: "errand",
    25552: "errant",
    25553: "erratic",
    25554: "error",
    25555: "erupt",
    25556: "escalate",
    25561: "escalator",
    25562: "escapable",
    25563: "escapade",
    25564: "escapist",
    25565: "escargot",
    25566: "eskimo",
    25611: "esophagus",
    25612: "espionage",
    25613: "espresso",
    25614: "esquire",
    25615: "essay",
    25616: "essence",
    25621: "essential",
    25622: "establish",
    25623: "estate",
    25624: "esteemed",
    25625: "estimate",
    25626: "estimator",
    25631: "estranged",
    25632: "estrogen",
    25633: "etching",
    25634: "eternal",
    25635: "eternity",
    25636: "ethanol",
    25641: "ether",
    25642: "ethically",
    25643: "ethics",
    25644: "euphemism",
    25645: "evacuate",
    25646: "evacuee",
    25651: "evade",
    25652: "evaluate",
    25653: "evaluator",
    25654: "evaporate",
    25655: "evasion",
    25656: "evasive",
    25661: "even",
    25662: "everglade",
    25663: "evergreen",
    25664: "everybody",
    25665: "everyday",
    25666: "everyone",
    26111: "evict",
    26112: "evidence",
    26113: "evident",
    26114: "evil",
    26115: "evoke",
    26116: "evolution",
    26121: "evolve",
    26122: "exact",
    26123: "exalted",
    26124: "example",
    26125: "excavate",
    26126: "excavator",
    26131: "exceeding",
    26132: "exception",
    26133: "excess",
    26134: "exchange",
    26135: "excitable",
    26136: "exciting",
    26141: "exclaim",
    26142: "exclude",
    26143: "excluding",
    26144: "exclusion",
    26145: "exclusive",
    26146: "excretion",
    26151: "excretory",
    26152: "excursion",
    26153: "excusable",
    26154: "excusably",
    26155: "excuse",
    26156: "exemplary",
    26161: "exemplify",
    26162: "exemption",
    26163: "exerciser",
    26164: "exert",
    26165: "exes",
    26166: "exfoliate",
    26211: "exhale",
    26212: "exhaust",
    26213: "exhume",
    26214: "exile",
    26215: "existing",
    26216: "exit",
    26221: "exodus",
    26222: "exonerate",
    26223: "exorcism",
    26224: "exorcist",
    26225: "expand",
    26226: "expanse",
    26231: "expansion",
    26232: "expansive",
    26233: "expectant",
    26234: "expedited",
    26235: "expediter",
    26236: "expel",
    26241: "expend",
    26242: "expenses",
    26243: "expensive",
    26244: "expert",
    26245: "expire",
    26246: "expiring",
    26251: "explain",
    26252: "expletive",
    26253: "explicit",
    26254: "explode",
    26255: "exploit",
    26256: "explore",
    26261: "exploring",
    26262: "exponent",
    26263: "exporter",
    26264: "exposable",
    26265: "expose",
    26266: "exposure",
    26311: "express",
    26312: "expulsion",
    26313: "exquisite",
    26314: "extended",
    26315: "extending",
    26316: "extent",
    26321: "extenuate",
    26322: "exterior",
    26323: "external",
    26324: "extinct",
    26325: "extortion",
    26326: "extradite",
    26331: "extras",
    26332: "extrovert",
    26333: "extrude",
    26334: "extruding",
    26335: "exuberant",
    26336: "fable",
    26341: "fabric",
    26342: "fabulous",
    26343: "facebook",
    26344: "facecloth",
    26345: "facedown",
    26346: "faceless",
    26351: "facelift",
    26352: "faceplate",
    26353: "faceted",
    26354: "facial",
    26355: "facility",
    26356: "facing",
    26361: "facsimile",
    26362: "faction",
    26363: "factoid",
    26364: "factor",
    26365: "factsheet",
    26366: "factual",
    26411: "faculty",
    26412: "fade",
    26413: "fading",
    26414: "failing",
    26415: "falcon",
    26416: "fall",
    26421: "false",
    26422: "falsify",
    26423: "fame",
    26424: "familiar",
    26425: "family",
    26426: "famine",
    26431: "famished",
    26432: "fanatic",
    26433: "fancied",
    26434: "fanciness",
    26435: "fancy",
    26436: "fanfare",
    26441: "fang",
    26442: "fanning",
    26443: "fantasize",
    26444: "fantastic",
    26445: "fantasy",
    26446: "fascism",
    26451: "fastball",
    26452: "faster",
    26453: "fasting",
    26454: "fastness",
    26455: "faucet",
    26456: "favorable",
    26461: "favorably",
    26462: "favored",
    26463: "favoring",
    26464: "favorite",
    26465: "fax",
    26466: "feast",
    26511: "federal",
    26512: "fedora",
    26513: "feeble",
    26514: "feed",
    26515: "feel",
    26516: "feisty",
    26521: "feline",
    26522: "felt-tip",
    26523: "feminine",
    26524: "feminism",
    26525: "feminist",
    26526: "feminize",
    26531: "femur",
    26532: "fence",
    26533: "fencing",
    26534: "fender",
    26535: "ferment",
    26536: "fernlike",
    26541: "ferocious",
    26542: "ferocity",
    26543: "ferret",
    26544: "ferris",
    26545: "ferry",
    26546: "fervor",
    26551: "fester",
    26552: "festival",
    26553: "festive",
    26554: "festivity",
    26555: "fetal",
    26556: "fetch",
    26561: "fever",
    26562: "fiber",
    26563: "fiction",
    26564: "fiddle",
    26565: "fiddling",
    26566: "fidelity",
    26611: "fidgeting",
    26612: "fidgety",
    26613: "fifteen",
    26614: "fifth",
    26615: "fiftieth",
    26616: "fifty",
    26621: "figment",
    26622: "figure",
    26623: "figurine",
    26624: "filing",
    26625: "filled",
    26626: "filler",
    26631: "filling",
    26632: "film",
    26633: "filter",
    26634: "filth",
    26635: "filtrate",
    26636: "finale",
    26641: "finalist",
    26642: "finalize",
    26643: "finally",
    26644: "finance",
    26645: "financial",
    26646: "finch",
    26651: "fineness",
    26652: "finer",
    26653: "finicky",
    26654: "finished",
    26655: "finisher",
    26656: "finishing",
    26661: "finite",
    26662: "finless",
    26663: "finlike",
    26664: "fiscally",
    26665: "fit",
    26666: "five",
    31111: "flaccid",
    31112: "flagman",
    31113: "flagpole",
    31114: "flagship",
    31115: "flagstick",
    31116: "flagstone",
    31121: "flail",
    31122: "flakily",
    31123: "flaky",
    31124: "flame",
    31125: "flammable",
    31126: "flanked",
    31131: "flanking",
    31132: "flannels",
    31133: "flap",
    31134: "flaring",
    31135: "flashback",
    31136: "flashbulb",
    31141: "flashcard",
    31142: "flashily",
    31143: "flashing",
    31144: "flashy",
    31145: "flask",
    31146: "flatbed",
    31151: "flatfoot",
    31152: "flatly",
    31153: "flatness",
    31154: "flatten",
    31155: "flattered",
    31156: "flatterer",
    31161: "flattery",
    31162: "flattop",
    31163: "flatware",
    31164: "flatworm",
    31165: "flavored",
    31166: "flavorful",
    31211: "flavoring",
    31212: "flaxseed",
    31213: "fled",
    31214: "fleshed",
    31215: "fleshy",
    31216: "flick",
    31221: "flier",
    31222: "flight",
    31223: "flinch",
    31224: "fling",
    31225: "flint",
    31226: "flip",
    31231: "flirt",
    31232: "float",
    31233: "flock",
    31234: "flogging",
    31235: "flop",
    31236: "floral",
    31241: "florist",
    31242: "floss",
    31243: "flounder",
    31244: "flyable",
    31245: "flyaway",
    31246: "flyer",
    31251: "flying",
    31252: "flyover",
    31253: "flypaper",
    31254: "foam",
    31255: "foe",
    31256: "fog",
    31261: "foil",
    31262: "folic",
    31263: "folk",
    31264: "follicle",
    31265: "follow",
    31266: "fondling",
    31311: "fondly",
    31312: "fondness",
    31313: "fondue",
    31314: "font",
    31315: "food",
    31316: "fool",
    31321: "footage",
    31322: "football",
    31323: "footbath",
    31324: "footboard",
    31325: "footer",
    31326: "footgear",
    31331: "foothill",
    31332: "foothold",
    31333: "footing",
    31334: "footless",
    31335: "footman",
    31336: "footnote",
    31341: "footpad",
    31342: "footpath",
    31343: "footprint",
    31344: "footrest",
    31345: "footsie",
    31346: "footsore",
    31351: "footwear",
    31352: "footwork",
    31353: "fossil",
    31354: "foster",
    31355: "founder",
    31356: "founding",
    31361: "fountain",
    31362: "fox",
    31363: "foyer",
    31364: "fraction",
    31365: "fracture",
    31366: "fragile",
    31411: "fragility",
    31412: "fragment",
    31413: "fragrance",
    31414: "fragrant",
    31415: "frail",
    31416: "frame",
    31421: "framing",
    31422: "frantic",
    31423: "fraternal",
    31424: "frayed",
    31425: "fraying",
    31426: "frays",
    31431: "freckled",
    31432: "freckles",
    31433: "freebase",
    31434: "freebee",
    31435: "freebie",
    31436: "freedom",
    31441: "freefall",
    31442: "freehand",
    31443: "freeing",
    31444: "freeload",
    31445: "freely",
    31446: "freemason",
    31451: "freeness",
    31452: "freestyle",
    31453: "freeware",
    31454: "freeway",
    31455: "freewill",
    31456: "freezable",
    31461: "freezing",
    31462: "freight",
    31463: "french",
    31464: "frenzied",
    31465: "frenzy",
    31466: "frequency",
    31511: "frequent",
    31512: "fresh",
    31513: "fretful",
    31514: "fretted",
    31515: "friction",
    31516: "friday",
    31521: "fridge",
    31522: "fried",
    31523: "friend",
    31524: "frighten",
    31525: "frightful",
    31526: "frigidity",
    31531: "frigidly",
    31532: "frill",
    31533: "fringe",
    31534: "frisbee",
    31535: "frisk",
    31536: "fritter",
    31541: "frivolous",
    31542: "frolic",
    31543: "from",
    31544: "front",
    31545: "frostbite",
    31546: "frosted",
    31551: "frostily",
    31552: "frosting",
    31553: "frostlike",
    31554: "frosty",
    31555: "froth",
    31556: "frown",
    31561: "frozen",
    31562: "fructose",
    31563: "frugality",
    31564: "frugally",
    31565: "fruit",
    31566: "frustrate",
    31611: "frying",
    31612: "gab",
    31613: "gaffe",
    31614: "gag",
    31615: "gainfully",
    31616: "gaining",
    31621: "gains",
    31622: "gala",
    31623: "gallantly",
    31624: "galleria",
    31625: "gallery",
    31626: "galley",
    31631: "gallon",
    31632: "gallows",
    31633: "gallstone",
    31634: "galore",
    31635: "galvanize",
    31636: "gambling",
    31641: "game",
    31642: "gaming",
    31643: "gamma",
    31644: "gander",
    31645: "gangly",
    31646: "gangrene",
    31651: "gangway",
    31652: "gap",
    31653: "garage",
    31654: "garbage",
    31655: "garden",
    31656: "gargle",
    31661: "garland",
    31662: "garlic",
    31663: "garment",
    31664: "garnet",
    31665: "garnish",
    31666: "garter",
    32111: "gas",
    32112: "gatherer",
    32113: "gathering",
    32114: "gating",
    32115: "gauging",
    32116: "gauntlet",
    32121: "gauze",
    32122: "gave",
    32123: "gawk",
    32124: "gazing",
    32125: "gear",
    32126: "gecko",
    32131: "geek",
    32132: "geiger",
    32133: "gem",
    32134: "gender",
    32135: "generic",
    32136: "generous",
    32141: "genetics",
    32142: "genre",
    32143: "gentile",
    32144: "gentleman",
    32145: "gently",
    32146: "gents",
    32151: "geography",
    32152: "geologic",
    32153: "geologist",
    32154: "geology",
    32155: "geometric",
    32156: "geometry",
    32161: "geranium",
    32162: "gerbil",
    32163: "geriatric",
    32164: "germicide",
    32165: "germinate",
    32166: "germless",
    32211: "germproof",
    32212: "gestate",
    32213: "gestation",
    32214: "gesture",
    32215: "getaway",
    32216: "getting",
    32221: "getup",
    32222: "giant",
    32223: "gibberish",
    32224: "giblet",
    32225: "giddily",
    32226: "giddiness",
    32231: "giddy",
    32232: "gift",
    32233: "gigabyte",
    32234: "gigahertz",
    32235: "gigantic",
    32236: "giggle",
    32241: "giggling",
    32242: "giggly",
    32243: "gigolo",
    32244: "gilled",
    32245: "gills",
    32246: "gimmick",
    32251: "girdle",
    32252: "giveaway",
    32253: "given",
    32254: "giver",
    32255: "giving",
    32256: "gizmo",
    32261: "gizzard",
    32262: "glacial",
    32263: "glacier",
    32264: "glade",
    32265: "gladiator",
    32266: "gladly",
    32311: "glamorous",
    32312: "glamour",
    32313: "glance",
    32314: "glancing",
    32315: "glandular",
    32316: "glare",
    32321: "glaring",
    32322: "glass",
    32323: "glaucoma",
    32324: "glazing",
    32325: "gleaming",
    32326: "gleeful",
    32331: "glider",
    32332: "gliding",
    32333: "glimmer",
    32334: "glimpse",
    32335: "glisten",
    32336: "glitch",
    32341: "glitter",
    32342: "glitzy",
    32343: "gloater",
    32344: "gloating",
    32345: "gloomily",
    32346: "gloomy",
    32351: "glorified",
    32352: "glorifier",
    32353: "glorify",
    32354: "glorious",
    32355: "glory",
    32356: "gloss",
    32361: "glove",
    32362: "glowing",
    32363: "glowworm",
    32364: "glucose",
    32365: "glue",
    32366: "gluten",
    32411: "glutinous",
    32412: "glutton",
    32413: "gnarly",
    32414: "gnat",
    32415: "goal",
    32416: "goatskin",
    32421: "goes",
    32422: "goggles",
    32423: "going",
    32424: "goldfish",
    32425: "goldmine",
    32426: "goldsmith",
    32431: "golf",
    32432: "goliath",
    32433: "gonad",
    32434: "gondola",
    32435: "gone",
    32436: "gong",
    32441: "good",
    32442: "gooey",
    32443: "goofball",
    32444: "goofiness",
    32445: "goofy",
    32446: "google",
    32451: "goon",
    32452: "gopher",
    32453: "gore",
    32454: "gorged",
    32455: "gorgeous",
    32456: "gory",
    32461: "gosling",
    32462: "gossip",
    32463: "gothic",
    32464: "gotten",
    32465: "gout",
    32466: "gown",
    32511: "grab",
    32512: "graceful",
    32513: "graceless",
    32514: "gracious",
    32515: "gradation",
    32516: "graded",
    32521: "grader",
    32522: "gradient",
    32523: "grading",
    32524: "gradually",
    32525: "graduate",
    32526: "graffiti",
    32531: "grafted",
    32532: "grafting",
    32533: "grain",
    32534: "granddad",
    32535: "grandkid",
    32536: "grandly",
    32541: "grandma",
    32542: "grandpa",
    32543: "grandson",
    32544: "granite",
    32545: "granny",
    32546: "granola",
    32551: "grant",
    32552: "granular",
    32553: "grape",
    32554: "graph",
    32555: "grapple",
    32556: "grappling",
    32561: "grasp",
    32562: "grass",
    32563: "gratified",
    32564: "gratify",
    32565: "grating",
    32566: "gratitude",
    32611: "gratuity",
    32612: "gravel",
    32613: "graveness",
    32614: "graves",
    32615: "graveyard",
    32616: "gravitate",
    32621: "gravity",
    32622: "gravy",
    32623: "gray",
    32624: "grazing",
    32625: "greasily",
    32626: "greedily",
    32631: "greedless",
    32632: "greedy",
    32633: "green",
    32634: "greeter",
    32635: "greeting",
    32636: "grew",
    32641: "greyhound",
    32642: "grid",
    32643: "grief",
    32644: "grievance",
    32645: "grieving",
    32646: "grievous",
    32651: "grill",
    32652: "grimace",
    32653: "grimacing",
    32654: "grime",
    32655: "griminess",
    32656: "grimy",
    32661: "grinch",
    32662: "grinning",
    32663: "grip",
    32664: "gristle",
    32665: "grit",
    32666: "groggily",
    33111: "groggy",
    33112: "groin",
    33113: "groom",
    33114: "groove",
    33115: "grooving",
    33116: "groovy",
    33121: "grope",
    33122: "ground",
    33123: "grouped",
    33124: "grout",
    33125: "grove",
    33126: "grower",
    33131: "growing",
    33132: "growl",
    33133: "grub",
    33134: "grudge",
    33135: "grudging",
    33136: "grueling",
    33141: "gruffly",
    33142: "grumble",
    33143: "grumbling",
    33144: "grumbly",
    33145: "grumpily",
    33146: "grunge",
    33151: "grunt",
    33152: "guacamole",
    33153: "guidable",
    33154: "guidance",
    33155: "guide",
    33156: "guiding",
    33161: "guileless",
    33162: "guise",
    33163: "gulf",
    33164: "gullible",
    33165: "gully",
    33166: "gulp",
    33211: "gumball",
    33212: "gumdrop",
    33213: "gumminess",
    33214: "gumming",
    33215: "gummy",
    33216: "gurgle",
    33221: "gurgling",
    33222: "guru",
    33223: "gush",
    33224: "gusto",
    33225: "gusty",
    33226: "gutless",
    33231: "guts",
    33232: "gutter",
    33233: "guy",
    33234: "guzzler",
    33235: "gyration",
    33236: "habitable",
    33241: "habitant",
    33242: "habitat",
    33243: "habitual",
    33244: "hacked",
    33245: "hacker",
    33246: "hacking",
    33251: "hacksaw",
    33252: "had",
    33253: "haggler",
    33254: "haiku",
    33255: "half",
    33256: "halogen",
    33261: "halt",
    33262: "halved",
    33263: "halves",
    33264: "hamburger",
    33265: "hamlet",
    33266: "hammock",
    33311: "hamper",
    33312: "hamster",
    33313: "hamstring",
    33314: "handbag",
    33315: "handball",
    33316: "handbook",
    33321: "handbrake",
    33322: "handcart",
    33323: "handclap",
    33324: "handclasp",
    33325: "handcraft",
    33326: "handcuff",
    33331: "handed",
    33332: "handful",
    33333: "handgrip",
    33334: "handgun",
    33335: "handheld",
    33336: "handiness",
    33341: "handiwork",
    33342: "handlebar",
    33343: "handled",
    33344: "handler",
    33345: "handling",
    33346: "handmade",
    33351: "handoff",
    33352: "handpick",
    33353: "handprint",
    33354: "handrail",
    33355: "handsaw",
    33356: "handset",
    33361: "handsfree",
    33362: "handshake",
    33363: "handstand",
    33364: "handwash",
    33365: "handwork",
    33366: "handwoven",
    33411: "handwrite",
    33412: "handyman",
    33413: "hangnail",
    33414: "hangout",
    33415: "hangover",
    33416: "hangup",
    33421: "hankering",
    33422: "hankie",
    33423: "hanky",
    33424: "haphazard",
    33425: "happening",
    33426: "happier",
    33431: "happiest",
    33432: "happily",
    33433: "happiness",
    33434: "happy",
    33435: "harbor",
    33436: "hardcopy",
    33441: "hardcore",
    33442: "hardcover",
    33443: "harddisk",
    33444: "hardened",
    33445: "hardener",
    33446: "hardening",
    33451: "hardhat",
    33452: "hardhead",
    33453: "hardiness",
    33454: "hardly",
    33455: "hardness",
    33456: "hardship",
    33461: "hardware",
    33462: "hardwired",
    33463: "hardwood",
    33464: "hardy",
    33465: "harmful",
    33466: "harmless",
    33511: "harmonica",
    33512: "harmonics",
    33513: "harmonize",
    33514: "harmony",
    33515: "harness",
    33516: "harpist",
    33521: "harsh",
    33522: "harvest",
    33523: "hash",
    33524: "hassle",
    33525: "haste",
    33526: "hastily",
    33531: "hastiness",
    33532: "hasty",
    33533: "hatbox",
    33534: "hatchback",
    33535: "hatchery",
    33536: "hatchet",
    33541: "hatching",
    33542: "hatchling",
    33543: "hate",
    33544: "hatless",
    33545: "hatred",
    33546: "haunt",
    33551: "haven",
    33552: "hazard",
    33553: "hazelnut",
    33554: "hazily",
    33555: "haziness",
    33556: "hazing",
    33561: "hazy",
    33562: "headache",
    33563: "headband",
    33564: "headboard",
    33565: "headcount",
    33566: "headdress",
    33611: "headed",
    33612: "header",
    33613: "headfirst",
    33614: "headgear",
    33615: "heading",
    33616: "headlamp",
    33621: "headless",
    33622: "headlock",
    33623: "headphone",
    33624: "headpiece",
    33625: "headrest",
    33626: "headroom",
    33631: "headscarf",
    33632: "headset",
    33633: "headsman",
    33634: "headstand",
    33635: "headstone",
    33636: "headway",
    33641: "headwear",
    33642: "heap",
    33643: "heat",
    33644: "heave",
    33645: "heavily",
    33646: "heaviness",
    33651: "heaving",
    33652: "hedge",
    33653: "hedging",
    33654: "heftiness",
    33655: "hefty",
    33656: "helium",
    33661: "helmet",
    33662: "helper",
    33663: "helpful",
    33664: "helping",
    33665: "helpless",
    33666: "helpline",
    34111: "hemlock",
    34112: "hemstitch",
    34113: "hence",
    34114: "henchman",
    34115: "henna",
    34116: "herald",
    34121: "herbal",
    34122: "herbicide",
    34123: "herbs",
    34124: "heritage",
    34125: "hermit",
    34126: "heroics",
    34131: "heroism",
    34132: "herring",
    34133: "herself",
    34134: "hertz",
    34135: "hesitancy",
    34136: "hesitant",
    34141: "hesitate",
    34142: "hexagon",
    34143: "hexagram",
    34144: "hubcap",
    34145: "huddle",
    34146: "huddling",
    34151: "huff",
    34152: "hug",
    34153: "hula",
    34154: "hulk",
    34155: "hull",
    34156: "human",
    34161: "humble",
    34162: "humbling",
    34163: "humbly",
    34164: "humid",
    34165: "humiliate",
    34166: "humility",
    34211: "humming",
    34212: "hummus",
    34213: "humongous",
    34214: "humorist",
    34215: "humorless",
    34216: "humorous",
    34221: "humpback",
    34222: "humped",
    34223: "humvee",
    34224: "hunchback",
    34225: "hundredth",
    34226: "hunger",
    34231: "hungrily",
    34232: "hungry",
    34233: "hunk",
    34234: "hunter",
    34235: "hunting",
    34236: "huntress",
    34241: "huntsman",
    34242: "hurdle",
    34243: "hurled",
    34244: "hurler",
    34245: "hurling",
    34246: "hurray",
    34251: "hurricane",
    34252: "hurried",
    34253: "hurry",
    34254: "hurt",
    34255: "husband",
    34256: "hush",
    34261: "husked",
    34262: "huskiness",
    34263: "hut",
    34264: "hybrid",
    34265: "hydrant",
    34266: "hydrated",
    34311: "hydration",
    34312: "hydrogen",
    34313: "hydroxide",
    34314: "hyperlink",
    34315: "hypertext",
    34316: "hyphen",
    34321: "hypnoses",
    34322: "hypnosis",
    34323: "hypnotic",
    34324: "hypnotism",
    34325: "hypnotist",
    34326: "hypnotize",
    34331: "hypocrisy",
    34332: "hypocrite",
    34333: "ibuprofen",
    34334: "ice",
    34335: "iciness",
    34336: "icing",
    34341: "icky",
    34342: "icon",
    34343: "icy",
    34344: "idealism",
    34345: "idealist",
    34346: "idealize",
    34351: "ideally",
    34352: "idealness",
    34353: "identical",
    34354: "identify",
    34355: "identity",
    34356: "ideology",
    34361: "idiocy",
    34362: "idiom",
    34363: "idly",
    34364: "igloo",
    34365: "ignition",
    34366: "ignore",
    34411: "iguana",
    34412: "illicitly",
    34413: "illusion",
    34414: "illusive",
    34415: "image",
    34416: "imaginary",
    34421: "imagines",
    34422: "imaging",
    34423: "imbecile",
    34424: "imitate",
    34425: "imitation",
    34426: "immature",
    34431: "immerse",
    34432: "immersion",
    34433: "imminent",
    34434: "immobile",
    34435: "immodest",
    34436: "immorally",
    34441: "immortal",
    34442: "immovable",
    34443: "immovably",
    34444: "immunity",
    34445: "immunize",
    34446: "impaired",
    34451: "impale",
    34452: "impart",
    34453: "impatient",
    34454: "impeach",
    34455: "impeding",
    34456: "impending",
    34461: "imperfect",
    34462: "imperial",
    34463: "impish",
    34464: "implant",
    34465: "implement",
    34466: "implicate",
    34511: "implicit",
    34512: "implode",
    34513: "implosion",
    34514: "implosive",
    34515: "imply",
    34516: "impolite",
    34521: "important",
    34522: "importer",
    34523: "impose",
    34524: "imposing",
    34525: "impotence",
    34526: "impotency",
    34531: "impotent",
    34532: "impound",
    34533: "imprecise",
    34534: "imprint",
    34535: "imprison",
    34536: "impromptu",
    34541: "improper",
    34542: "improve",
    34543: "improving",
    34544: "improvise",
    34545: "imprudent",
    34546: "impulse",
    34551: "impulsive",
    34552: "impure",
    34553: "impurity",
    34554: "iodine",
    34555: "iodize",
    34556: "ion",
    34561: "ipad",
    34562: "iphone",
    34563: "ipod",
    34564: "irate",
    34565: "irk",
    34566: "iron",
    34611: "irregular",
    34612: "irrigate",
    34613: "irritable",
    34614: "irritably",
    34615: "irritant",
    34616: "irritate",
    34621: "islamic",
    34622: "islamist",
    34623: "isolated",
    34624: "isolating",
    34625: "isolation",
    34626: "isotope",
    34631: "issue",
    34632: "issuing",
    34633: "italicize",
    34634: "italics",
    34635: "item",
    34636: "itinerary",
    34641: "itunes",
    34642: "ivory",
    34643: "ivy",
    34644: "jab",
    34645: "jackal",
    34646: "jacket",
    34651: "jackknife",
    34652: "jackpot",
    34653: "jailbird",
    34654: "jailbreak",
    34655: "jailer",
    34656: "jailhouse",
    34661: "jalapeno",
    34662: "jam",
    34663: "janitor",
    34664: "january",
    34665: "jargon",
    34666: "jarring",
    35111: "jasmine",
    35112: "jaundice",
    35113: "jaunt",
    35114: "java",
    35115: "jawed",
    35116: "jawless",
    35121: "jawline",
    35122: "jaws",
    35123: "jaybird",
    35124: "jaywalker",
    35125: "jazz",
    35126: "jeep",
    35131: "jeeringly",
    35132: "jellied",
    35133: "jelly",
    35134: "jersey",
    35135: "jester",
    35136: "jet",
    35141: "jiffy",
    35142: "jigsaw",
    35143: "jimmy",
    35144: "jingle",
    35145: "jingling",
    35146: "jinx",
    35151: "jitters",
    35152: "jittery",
    35153: "job",
    35154: "jockey",
    35155: "jockstrap",
    35156: "jogger",
    35161: "jogging",
    35162: "john",
    35163: "joining",
    35164: "jokester",
    35165: "jokingly",
    35166: "jolliness",
    35211: "jolly",
    35212: "jolt",
    35213: "jot",
    35214: "jovial",
    35215: "joyfully",
    35216: "joylessly",
    35221: "joyous",
    35222: "joyride",
    35223: "joystick",
    35224: "jubilance",
    35225: "jubilant",
    35226: "judge",
    35231: "judgingly",
    35232: "judicial",
    35233: "judiciary",
    35234: "judo",
    35235: "juggle",
    35236: "juggling",
    35241: "jugular",
    35242: "juice",
    35243: "juiciness",
    35244: "juicy",
    35245: "jujitsu",
    35246: "jukebox",
    35251: "july",
    35252: "jumble",
    35253: "jumbo",
    35254: "jump",
    35255: "junction",
    35256: "juncture",
    35261: "june",
    35262: "junior",
    35263: "juniper",
    35264: "junkie",
    35265: "junkman",
    35266: "junkyard",
    35311: "jurist",
    35312: "juror",
    35313: "jury",
    35314: "justice",
    35315: "justifier",
    35316: "justify",
    35321: "justly",
    35322: "justness",
    35323: "juvenile",
    35324: "kabob",
    35325: "kangaroo",
    35326: "karaoke",
    35331: "karate",
    35332: "karma",
    35333: "kebab",
    35334: "keenly",
    35335: "keenness",
    35336: "keep",
    35341: "keg",
    35342: "kelp",
    35343: "kennel",
    35344: "kept",
    35345: "kerchief",
    35346: "kerosene",
    35351: "kettle",
    35352: "kick",
    35353: "kiln",
    35354: "kilobyte",
    35355: "kilogram",
    35356: "kilometer",
    35361: "kilowatt",
    35362: "kilt",
    35363: "kimono",
    35364: "kindle",
    35365: "kindling",
    35366: "kindly",
    35411: "kindness",
    35412: "kindred",
    35413: "kinetic",
    35414: "kinfolk",
    35415: "king",
    35416: "kinship",
    35421: "kinsman",
    35422: "kinswoman",
    35423: "kissable",
    35424: "kisser",
    35425: "kissing",
    35426: "kitchen",
    35431: "kite",
    35432: "kitten",
    35433: "kitty",
    35434: "kiwi",
    35435: "kleenex",
    35436: "knapsack",
    35441: "knee",
    35442: "knelt",
    35443: "knickers",
    35444: "knoll",
    35445: "koala",
    35446: "kooky",
    35451: "kosher",
    35452: "krypton",
    35453: "kudos",
    35454: "kung",
    35455: "labored",
    35456: "laborer",
    35461: "laboring",
    35462: "laborious",
    35463: "labrador",
    35464: "ladder",
    35465: "ladies",
    35466: "ladle",
    35511: "ladybug",
    35512: "ladylike",
    35513: "lagged",
    35514: "lagging",
    35515: "lagoon",
    35516: "lair",
    35521: "lake",
    35522: "lance",
    35523: "landed",
    35524: "landfall",
    35525: "landfill",
    35526: "landing",
    35531: "landlady",
    35532: "landless",
    35533: "landline",
    35534: "landlord",
    35535: "landmark",
    35536: "landmass",
    35541: "landmine",
    35542: "landowner",
    35543: "landscape",
    35544: "landside",
    35545: "landslide",
    35546: "language",
    35551: "lankiness",
    35552: "lanky",
    35553: "lantern",
    35554: "lapdog",
    35555: "lapel",
    35556: "lapped",
    35561: "lapping",
    35562: "laptop",
    35563: "lard",
    35564: "large",
    35565: "lark",
    35566: "lash",
    35611: "lasso",
    35612: "last",
    35613: "latch",
    35614: "late",
    35615: "lather",
    35616: "latitude",
    35621: "latrine",
    35622: "latter",
    35623: "latticed",
    35624: "launch",
    35625: "launder",
    35626: "laundry",
    35631: "laurel",
    35632: "lavender",
    35633: "lavish",
    35634: "laxative",
    35635: "lazily",
    35636: "laziness",
    35641: "lazy",
    35642: "lecturer",
    35643: "left",
    35644: "legacy",
    35645: "legal",
    35646: "legend",
    35651: "legged",
    35652: "leggings",
    35653: "legible",
    35654: "legibly",
    35655: "legislate",
    35656: "lego",
    35661: "legroom",
    35662: "legume",
    35663: "legwarmer",
    35664: "legwork",
    35665: "lemon",
    35666: "lend",
    36111: "length",
    36112: "lens",
    36113: "lent",
    36114: "leotard",
    36115: "lesser",
    36116: "letdown",
    36121: "lethargic",
    36122: "lethargy",
    36123: "letter",
    36124: "lettuce",
    36125: "level",
    36126: "leverage",
    36131: "levers",
    36132: "levitate",
    36133: "levitator",
    36134: "liability",
    36135: "liable",
    36136: "liberty",
    36141: "librarian",
    36142: "library",
    36143: "licking",
    36144: "licorice",
    36145: "lid",
    36146: "life",
    36151: "lifter",
    36152: "lifting",
    36153: "liftoff",
    36154: "ligament",
    36155: "likely",
    36156: "likeness",
    36161: "likewise",
    36162: "liking",
    36163: "lilac",
    36164: "lilly",
    36165: "lily",
    36166: "limb",
    36211: "limeade",
    36212: "limelight",
    36213: "limes",
    36214: "limit",
    36215: "limping",
    36216: "limpness",
    36221: "line",
    36222: "lingo",
    36223: "linguini",
    36224: "linguist",
    36225: "lining",
    36226: "linked",
    36231: "linoleum",
    36232: "linseed",
    36233: "lint",
    36234: "lion",
    36235: "lip",
    36236: "liquefy",
    36241: "liqueur",
    36242: "liquid",
    36243: "lisp",
    36244: "list",
    36245: "litigate",
    36246: "litigator",
    36251: "litmus",
    36252: "litter",
    36253: "little",
    36254: "livable",
    36255: "lived",
    36256: "lively",
    36261: "liver",
    36262: "livestock",
    36263: "lividly",
    36264: "living",
    36265: "lizard",
    36266: "lubricant",
    36311: "lubricate",
    36312: "lucid",
    36313: "luckily",
    36314: "luckiness",
    36315: "luckless",
    36316: "lucrative",
    36321: "ludicrous",
    36322: "lugged",
    36323: "lukewarm",
    36324: "lullaby",
    36325: "lumber",
    36326: "luminance",
    36331: "luminous",
    36332: "lumpiness",
    36333: "lumping",
    36334: "lumpish",
    36335: "lunacy",
    36336: "lunar",
    36341: "lunchbox",
    36342: "luncheon",
    36343: "lunchroom",
    36344: "lunchtime",
    36345: "lung",
    36346: "lurch",
    36351: "lure",
    36352: "luridness",
    36353: "lurk",
    36354: "lushly",
    36355: "lushness",
    36356: "luster",
    36361: "lustfully",
    36362: "lustily",
    36363: "lustiness",
    36364: "lustrous",
    36365: "lusty",
    36366: "luxurious",
    36411: "luxury",
    36412: "lying",
    36413: "lyrically",
    36414: "lyricism",
    36415: "lyricist",
    36416: "lyrics",
    36421: "macarena",
    36422: "macaroni",
    36423: "macaw",
    36424: "mace",
    36425: "machine",
    36426: "machinist",
    36431: "magazine",
    36432: "magenta",
    36433: "maggot",
    36434: "magical",
    36435: "magician",
    36436: "magma",
    36441: "magnesium",
    36442: "magnetic",
    36443: "magnetism",
    36444: "magnetize",
    36445: "magnifier",
    36446: "magnify",
    36451: "magnitude",
    36452: "magnolia",
    36453: "mahogany",
    36454: "maimed",
    36455: "majestic",
    36456: "majesty",
    36461: "majorette",
    36462: "majority",
    36463: "makeover",
    36464: "maker",
    36465: "makeshift",
    36466: "making",
    36511: "malformed",
    36512: "malt",
    36513: "mama",
    36514: "mammal",
    36515: "mammary",
    36516: "mammogram",
    36521: "manager",
    36522: "managing",
    36523: "manatee",
    36524: "mandarin",
    36525: "mandate",
    36526: "mandatory",
    36531: "mandolin",
    36532: "manger",
    36533: "mangle",
    36534: "mango",
    36535: "mangy",
    36536: "manhandle",
    36541: "manhole",
    36542: "manhood",
    36543: "manhunt",
    36544: "manicotti",
    36545: "manicure",
    36546: "manifesto",
    36551: "manila",
    36552: "mankind",
    36553: "manlike",
    36554: "manliness",
    36555: "manly",
    36556: "manmade",
    36561: "manned",
    36562: "mannish",
    36563: "manor",
    36564: "manpower",
    36565: "mantis",
    36566: "mantra",
    36611: "manual",
    36612: "many",
    36613: "map",
    36614: "marathon",
    36615: "marauding",
    36616: "marbled",
    36621: "marbles",
    36622: "marbling",
    36623: "march",
    36624: "mardi",
    36625: "margarine",
    36626: "margarita",
    36631: "margin",
    36632: "marigold",
    36633: "marina",
    36634: "marine",
    36635: "marital",
    36636: "maritime",
    36641: "marlin",
    36642: "marmalade",
    36643: "maroon",
    36644: "married",
    36645: "marrow",
    36646: "marry",
    36651: "marshland",
    36652: "marshy",
    36653: "marsupial",
    36654: "marvelous",
    36655: "marxism",
    36656: "mascot",
    36661: "masculine",
    36662: "mashed",
    36663: "mashing",
    36664: "massager",
    36665: "masses",
    36666: "massive",
    41111: "mastiff",
    41112: "matador",
    41113: "matchbook",
    41114: "matchbox",
    41115: "matcher",
    41116: "matching",
    41121: "matchless",
    41122: "material",
    41123: "maternal",
    41124: "maternity",
    41125: "math",
    41126: "mating",
    41131: "matriarch",
    41132: "matrimony",
    41133: "matrix",
    41134: "matron",
    41135: "matted",
    41136: "matter",
    41141: "maturely",
    41142: "maturing",
    41143: "maturity",
    41144: "mauve",
    41145: "maverick",
    41146: "maximize",
    41151: "maximum",
    41152: "maybe",
    41153: "mayday",
    41154: "mayflower",
    41155: "moaner",
    41156: "moaning",
    41161: "mobile",
    41162: "mobility",
    41163: "mobilize",
    41164: "mobster",
    41165: "mocha",
    41166: "mocker",
    41211: "mockup",
    41212: "modified",
    41213: "modify",
    41214: "modular",
    41215: "modulator",
    41216: "module",
    41221: "moisten",
    41222: "moistness",
    41223: "moisture",
    41224: "molar",
    41225: "molasses",
    41226: "mold",
    41231: "molecular",
    41232: "molecule",
    41233: "molehill",
    41234: "mollusk",
    41235: "mom",
    41236: "monastery",
    41241: "monday",
    41242: "monetary",
    41243: "monetize",
    41244: "moneybags",
    41245: "moneyless",
    41246: "moneywise",
    41251: "mongoose",
    41252: "mongrel",
    41253: "monitor",
    41254: "monkhood",
    41255: "monogamy",
    41256: "monogram",
    41261: "monologue",
    41262: "monopoly",
    41263: "monorail",
    41264: "monotone",
    41265: "monotype",
    41266: "monoxide",
    41311: "monsieur",
    41312: "monsoon",
    41313: "monstrous",
    41314: "monthly",
    41315: "monument",
    41316: "moocher",
    41321: "moodiness",
    41322: "moody",
    41323: "mooing",
    41324: "moonbeam",
    41325: "mooned",
    41326: "moonlight",
    41331: "moonlike",
    41332: "moonlit",
    41333: "moonrise",
    41334: "moonscape",
    41335: "moonshine",
    41336: "moonstone",
    41341: "moonwalk",
    41342: "mop",
    41343: "morale",
    41344: "morality",
    41345: "morally",
    41346: "morbidity",
    41351: "morbidly",
    41352: "morphine",
    41353: "morphing",
    41354: "morse",
    41355: "mortality",
    41356: "mortally",
    41361: "mortician",
    41362: "mortified",
    41363: "mortify",
    41364: "mortuary",
    41365: "mosaic",
    41366: "mossy",
    41411: "most",
    41412: "mothball",
    41413: "mothproof",
    41414: "motion",
    41415: "motivate",
    41416: "motivator",
    41421: "motive",
    41422: "motocross",
    41423: "motor",
    41424: "motto",
    41425: "mountable",
    41426: "mountain",
    41431: "mounted",
    41432: "mounting",
    41433: "mourner",
    41434: "mournful",
    41435: "mouse",
    41436: "mousiness",
    41441: "moustache",
    41442: "mousy",
    41443: "mouth",
    41444: "movable",
    41445: "move",
    41446: "movie",
    41451: "moving",
    41452: "mower",
    41453: "mowing",
    41454: "much",
    41455: "muck",
    41456: "mud",
    41461: "mug",
    41462: "mulberry",
    41463: "mulch",
    41464: "mule",
    41465: "mulled",
    41466: "mullets",
    41511: "multiple",
    41512: "multiply",
    41513: "multitask",
    41514: "multitude",
    41515: "mumble",
    41516: "mumbling",
    41521: "mumbo",
    41522: "mummified",
    41523: "mummify",
    41524: "mummy",
    41525: "mumps",
    41526: "munchkin",
    41531: "mundane",
    41532: "municipal",
    41533: "muppet",
    41534: "mural",
    41535: "murkiness",
    41536: "murky",
    41541: "murmuring",
    41542: "muscular",
    41543: "museum",
    41544: "mushily",
    41545: "mushiness",
    41546: "mushroom",
    41551: "mushy",
    41552: "music",
    41553: "musket",
    41554: "muskiness",
    41555: "musky",
    41556: "mustang",
    41561: "mustard",
    41562: "muster",
    41563: "mustiness",
    41564: "musty",
    41565: "mutable",
    41566: "mutate",
    41611: "mutation",
    41612: "mute",
    41613: "mutilated",
    41614: "mutilator",
    41615: "mutiny",
    41616: "mutt",
    41621: "mutual",
    41622: "muzzle",
    41623: "myself",
    41624: "myspace",
    41625: "mystified",
    41626: "mystify",
    41631: "myth",
    41632: "nacho",
    41633: "nag",
    41634: "nail",
    41635: "name",
    41636: "naming",
    41641: "nanny",
    41642: "nanometer",
    41643: "nape",
    41644: "napkin",
    41645: "napped",
    41646: "napping",
    41651: "nappy",
    41652: "narrow",
    41653: "nastily",
    41654: "nastiness",
    41655: "national",
    41656: "native",
    41661: "nativity",
    41662: "natural",
    41663: "nature",
    41664: "naturist",
    41665: "nautical",
    41666: "navigate",
    42111: "navigator",
    42112: "navy",
    42113: "nearby",
    42114: "nearest",
    42115: "nearly",
    42116: "nearness",
    42121: "neatly",
    42122: "neatness",
    42123: "nebula",
    42124: "nebulizer",
    42125: "nectar",
    42126: "negate",
    42131: "negation",
    42132: "negative",
    42133: "neglector",
    42134: "negligee",
    42135: "negligent",
    42136: "negotiate",
    42141: "nemeses",
    42142: "nemesis",
    42143: "neon",
    42144: "nephew",
    42145: "nerd",
    42146: "nervous",
    42151: "nervy",
    42152: "nest",
    42153: "net",
    42154: "neurology",
    42155: "neuron",
    42156: "neurosis",
    42161: "neurotic",
    42162: "neuter",
    42163: "neutron",
    42164: "never",
    42165: "next",
    42166: "nibble",
    42211: "nickname",
    42212: "nicotine",
    42213: "niece",
    42214: "nifty",
    42215: "nimble",
    42216: "nimbly",
    42221: "nineteen",
    42222: "ninetieth",
    42223: "ninja",
    42224: "nintendo",
    42225: "ninth",
    42226: "nuclear",
    42231: "nuclei",
    42232: "nucleus",
    42233: "nugget",
    42234: "nullify",
    42235: "number",
    42236: "numbing",
    42241: "numbly",
    42242: "numbness",
    42243: "numeral",
    42244: "numerate",
    42245: "numerator",
    42246: "numeric",
    42251: "numerous",
    42252: "nuptials",
    42253: "nursery",
    42254: "nursing",
    42255: "nurture",
    42256: "nutcase",
    42261: "nutlike",
    42262: "nutmeg",
    42263: "nutrient",
    42264: "nutshell",
    42265: "nuttiness",
    42266: "nutty",
    42311: "nuzzle",
    42312: "nylon",
    42313: "oaf",
    42314: "oak",
    42315: "oasis",
    42316: "oat",
    42321: "obedience",
    42322: "obedient",
    42323: "obituary",
    42324: "object",
    42325: "obligate",
    42326: "obliged",
    42331: "oblivion",
    42332: "oblivious",
    42333: "oblong",
    42334: "obnoxious",
    42335: "oboe",
    42336: "obscure",
    42341: "obscurity",
    42342: "observant",
    42343: "observer",
    42344: "observing",
    42345: "obsessed",
    42346: "obsession",
    42351: "obsessive",
    42352: "obsolete",
    42353: "obstacle",
    42354: "obstinate",
    42355: "obstruct",
    42356: "obtain",
    42361: "obtrusive",
    42362: "obtuse",
    42363: "obvious",
    42364: "occultist",
    42365: "occupancy",
    42366: "occupant",
    42411: "occupier",
    42412: "occupy",
    42413: "ocean",
    42414: "ocelot",
    42415: "octagon",
    42416: "octane",
    42421: "october",
    42422: "octopus",
    42423: "ogle",
    42424: "oil",
    42425: "oink",
    42426: "ointment",
    42431: "okay",
    42432: "old",
    42433: "olive",
    42434: "olympics",
    42435: "omega",
    42436: "omen",
    42441: "ominous",
    42442: "omission",
    42443: "omit",
    42444: "omnivore",
    42445: "onboard",
    42446: "oncoming",
    42451: "ongoing",
    42452: "onion",
    42453: "online",
    42454: "onlooker",
    42455: "only",
    42456: "onscreen",
    42461: "onset",
    42462: "onshore",
    42463: "onslaught",
    42464: "onstage",
    42465: "onto",
    42466: "onward",
    42511: "onyx",
    42512: "oops",
    42513: "ooze",
    42514: "oozy",
    42515: "opacity",
    42516: "opal",
    42521: "open",
    42522: "operable",
    42523: "operate",
    42524: "operating",
    42525: "operation",
    42526: "operative",
    42531: "operator",
    42532: "opium",
    42533: "opossum",
    42534: "opponent",
    42535: "oppose",
    42536: "opposing",
    42541: "opposite",
    42542: "oppressed",
    42543: "oppressor",
    42544: "opt",
    42545: "opulently",
    42546: "osmosis",
    42551: "other",
    42552: "otter",
    42553: "ouch",
    42554: "ought",
    42555: "ounce",
    42556: "outage",
    42561: "outback",
    42562: "outbid",
    42563: "outboard",
    42564: "outbound",
    42565: "outbreak",
    42566: "outburst",
    42611: "outcast",
    42612: "outclass",
    42613: "outcome",
    42614: "outdated",
    42615: "outdoors",
    42616: "outer",
    42621: "outfield",
    42622: "outfit",
    42623: "outflank",
    42624: "outgoing",
    42625: "outgrow",
    42626: "outhouse",
    42631: "outing",
    42632: "outlast",
    42633: "outlet",
    42634: "outline",
    42635: "outlook",
    42636: "outlying",
    42641: "outmatch",
    42642: "outmost",
    42643: "outnumber",
    42644: "outplayed",
    42645: "outpost",
    42646: "outpour",
    42651: "output",
    42652: "outrage",
    42653: "outrank",
    42654: "outreach",
    42655: "outright",
    42656: "outscore",
    42661: "outsell",
    42662: "outshine",
    42663: "outshoot",
    42664: "outsider",
    42665: "outskirts",
    42666: "outsmart",
    43111: "outsource",
    43112: "outspoken",
    43113: "outtakes",
    43114: "outthink",
    43115: "outward",
    43116: "outweigh",
    43121: "outwit",
    43122: "oval",
    43123: "ovary",
    43124: "oven",
    43125: "overact",
    43126: "overall",
    43131: "overarch",
    43132: "overbid",
    43133: "overbill",
    43134: "overbite",
    43135: "overblown",
    43136: "overboard",
    43141: "overbook",
    43142: "overbuilt",
    43143: "overcast",
    43144: "overcoat",
    43145: "overcome",
    43146: "overcook",
    43151: "overcrowd",
    43152: "overdraft",
    43153: "overdrawn",
    43154: "overdress",
    43155: "overdrive",
    43156: "overdue",
    43161: "overeager",
    43162: "overeater",
    43163: "overexert",
    43164: "overfed",
    43165: "overfeed",
    43166: "overfill",
    43211: "overflow",
    43212: "overfull",
    43213: "overgrown",
    43214: "overhand",
    43215: "overhang",
    43216: "overhaul",
    43221: "overhead",
    43222: "overhear",
    43223: "overheat",
    43224: "overhung",
    43225: "overjoyed",
    43226: "overkill",
    43231: "overlabor",
    43232: "overlaid",
    43233: "overlap",
    43234: "overlay",
    43235: "overload",
    43236: "overlook",
    43241: "overlord",
    43242: "overlying",
    43243: "overnight",
    43244: "overpass",
    43245: "overpay",
    43246: "overplant",
    43251: "overplay",
    43252: "overpower",
    43253: "overprice",
    43254: "overrate",
    43255: "overreach",
    43256: "overreact",
    43261: "override",
    43262: "overripe",
    43263: "overrule",
    43264: "overrun",
    43265: "overshoot",
    43266: "overshot",
    43311: "oversight",
    43312: "oversized",
    43313: "oversleep",
    43314: "oversold",
    43315: "overspend",
    43316: "overstate",
    43321: "overstay",
    43322: "overstep",
    43323: "overstock",
    43324: "overstuff",
    43325: "oversweet",
    43326: "overtake",
    43331: "overthrow",
    43332: "overtime",
    43333: "overtly",
    43334: "overtone",
    43335: "overture",
    43336: "overturn",
    43341: "overuse",
    43342: "overvalue",
    43343: "overview",
    43344: "overwrite",
    43345: "owl",
    43346: "oxford",
    43351: "oxidant",
    43352: "oxidation",
    43353: "oxidize",
    43354: "oxidizing",
    43355: "oxygen",
    43356: "oxymoron",
    43361: "oyster",
    43362: "ozone",
    43363: "paced",
    43364: "pacemaker",
    43365: "pacific",
    43366: "pacifier",
    43411: "pacifism",
    43412: "pacifist",
    43413: "pacify",
    43414: "padded",
    43415: "padding",
    43416: "paddle",
    43421: "paddling",
    43422: "padlock",
    43423: "pagan",
    43424: "pager",
    43425: "paging",
    43426: "pajamas",
    43431: "palace",
    43432: "palatable",
    43433: "palm",
    43434: "palpable",
    43435: "palpitate",
    43436: "paltry",
    43441: "pampered",
    43442: "pamperer",
    43443: "pampers",
    43444: "pamphlet",
    43445: "panama",
    43446: "pancake",
    43451: "pancreas",
    43452: "panda",
    43453: "pandemic",
    43454: "pang",
    43455: "panhandle",
    43456: "panic",
    43461: "panning",
    43462: "panorama",
    43463: "panoramic",
    43464: "panther",
    43465: "pantomime",
    43466: "pantry",
    43511: "pants",
    43512: "pantyhose",
    43513: "paparazzi",
    43514: "papaya",
    43515: "paper",
    43516: "paprika",
    43521: "papyrus",
    43522: "parabola",
    43523: "parachute",
    43524: "parade",
    43525: "paradox",
    43526: "paragraph",
    43531: "parakeet",
    43532: "paralegal",
    43533: "paralyses",
    43534: "paralysis",
    43535: "paralyze",
    43536: "paramedic",
    43541: "parameter",
    43542: "paramount",
    43543: "parasail",
    43544: "parasite",
    43545: "parasitic",
    43546: "parcel",
    43551: "parched",
    43552: "parchment",
    43553: "pardon",
    43554: "parish",
    43555: "parka",
    43556: "parking",
    43561: "parkway",
    43562: "parlor",
    43563: "parmesan",
    43564: "parole",
    43565: "parrot",
    43566: "parsley",
    43611: "parsnip",
    43612: "partake",
    43613: "parted",
    43614: "parting",
    43615: "partition",
    43616: "partly",
    43621: "partner",
    43622: "partridge",
    43623: "party",
    43624: "passable",
    43625: "passably",
    43626: "passage",
    43631: "passcode",
    43632: "passenger",
    43633: "passerby",
    43634: "passing",
    43635: "passion",
    43636: "passive",
    43641: "passivism",
    43642: "passover",
    43643: "passport",
    43644: "password",
    43645: "pasta",
    43646: "pasted",
    43651: "pastel",
    43652: "pastime",
    43653: "pastor",
    43654: "pastrami",
    43655: "pasture",
    43656: "pasty",
    43661: "patchwork",
    43662: "patchy",
    43663: "paternal",
    43664: "paternity",
    43665: "path",
    43666: "patience",
    44111: "patient",
    44112: "patio",
    44113: "patriarch",
    44114: "patriot",
    44115: "patrol",
    44116: "patronage",
    44121: "patronize",
    44122: "pauper",
    44123: "pavement",
    44124: "paver",
    44125: "pavestone",
    44126: "pavilion",
    44131: "paving",
    44132: "pawing",
    44133: "payable",
    44134: "payback",
    44135: "paycheck",
    44136: "payday",
    44141: "payee",
    44142: "payer",
    44143: "paying",
    44144: "payment",
    44145: "payphone",
    44146: "payroll",
    44151: "pebble",
    44152: "pebbly",
    44153: "pecan",
    44154: "pectin",
    44155: "peculiar",
    44156: "peddling",
    44161: "pediatric",
    44162: "pedicure",
    44163: "pedigree",
    44164: "pedometer",
    44165: "pegboard",
    44166: "pelican",
    44211: "pellet",
    44212: "pelt",
    44213: "pelvis",
    44214: "penalize",
    44215: "penalty",
    44216: "pencil",
    44221: "pendant",
    44222: "pending",
    44223: "penholder",
    44224: "penknife",
    44225: "pennant",
    44226: "penniless",
    44231: "penny",
    44232: "penpal",
    44233: "pension",
    44234: "pentagon",
    44235: "pentagram",
    44236: "pep",
    44241: "perceive",
    44242: "percent",
    44243: "perch",
    44244: "percolate",
    44245: "perennial",
    44246: "perfected",
    44251: "perfectly",
    44252: "perfume",
    44253: "periscope",
    44254: "perish",
    44255: "perjurer",
    44256: "perjury",
    44261: "perkiness",
    44262: "perky",
    44263: "perm",
    44264: "peroxide",
    44265: "perpetual",
    44266: "perplexed",
    44311: "persecute",
    44312: "persevere",
    44313: "persuaded",
    44314: "persuader",
    44315: "pesky",
    44316: "peso",
    44321: "pessimism",
    44322: "pessimist",
    44323: "pester",
    44324: "pesticide",
    44325: "petal",
    44326: "petite",
    44331: "petition",
    44332: "petri",
    44333: "petroleum",
    44334: "petted",
    44335: "petticoat",
    44336: "pettiness",
    44341: "petty",
    44342: "petunia",
    44343: "phantom",
    44344: "phobia",
    44345: "phoenix",
    44346: "phonebook",
    44351: "phoney",
    44352: "phonics",
    44353: "phoniness",
    44354: "phony",
    44355: "phosphate",
    44356: "photo",
    44361: "phrase",
    44362: "phrasing",
    44363: "placard",
    44364: "placate",
    44365: "placidly",
    44366: "plank",
    44411: "planner",
    44412: "plant",
    44413: "plasma",
    44414: "plaster",
    44415: "plastic",
    44416: "plated",
    44421: "platform",
    44422: "plating",
    44423: "platinum",
    44424: "platonic",
    44425: "platter",
    44426: "platypus",
    44431: "plausible",
    44432: "plausibly",
    44433: "playable",
    44434: "playback",
    44435: "player",
    44436: "playful",
    44441: "playgroup",
    44442: "playhouse",
    44443: "playing",
    44444: "playlist",
    44445: "playmaker",
    44446: "playmate",
    44451: "playoff",
    44452: "playpen",
    44453: "playroom",
    44454: "playset",
    44455: "plaything",
    44456: "playtime",
    44461: "plaza",
    44462: "pleading",
    44463: "pleat",
    44464: "pledge",
    44465: "plentiful",
    44466: "plenty",
    44511: "plethora",
    44512: "plexiglas",
    44513: "pliable",
    44514: "plod",
    44515: "plop",
    44516: "plot",
    44521: "plow",
    44522: "ploy",
    44523: "pluck",
    44524: "plug",
    44525: "plunder",
    44526: "plunging",
    44531: "plural",
    44532: "plus",
    44533: "plutonium",
    44534: "plywood",
    44535: "poach",
    44536: "pod",
    44541: "poem",
    44542: "poet",
    44543: "pogo",
    44544: "pointed",
    44545: "pointer",
    44546: "pointing",
    44551: "pointless",
    44552: "pointy",
    44553: "poise",
    44554: "poison",
    44555: "poker",
    44556: "poking",
    44561: "polar",
    44562: "police",
    44563: "policy",
    44564: "polio",
    44565: "polish",
    44566: "politely",
    44611: "polka",
    44612: "polo",
    44613: "polyester",
    44614: "polygon",
    44615: "polygraph",
    44616: "polymer",
    44621: "poncho",
    44622: "pond",
    44623: "pony",
    44624: "popcorn",
    44625: "pope",
    44626: "poplar",
    44631: "popper",
    44632: "poppy",
    44633: "popsicle",
    44634: "populace",
    44635: "popular",
    44636: "populate",
    44641: "porcupine",
    44642: "pork",
    44643: "porous",
    44644: "porridge",
    44645: "portable",
    44646: "portal",
    44651: "portfolio",
    44652: "porthole",
    44653: "portion",
    44654: "portly",
    44655: "portside",
    44656: "poser",
    44661: "posh",
    44662: "posing",
    44663: "possible",
    44664: "possibly",
    44665: "possum",
    44666: "postage",
    45111: "postal",
    45112: "postbox",
    45113: "postcard",
    45114: "posted",
    45115: "poster",
    45116: "posting",
    45121: "postnasal",
    45122: "posture",
    45123: "postwar",
    45124: "pouch",
    45125: "pounce",
    45126: "pouncing",
    45131: "pound",
    45132: "pouring",
    45133: "pout",
    45134: "powdered",
    45135: "powdering",
    45136: "powdery",
    45141: "power",
    45142: "powwow",
    45143: "pox",
    45144: "praising",
    45145: "prance",
    45146: "prancing",
    45151: "pranker",
    45152: "prankish",
    45153: "prankster",
    45154: "prayer",
    45155: "praying",
    45156: "preacher",
    45161: "preaching",
    45162: "preachy",
    45163: "preamble",
    45164: "precinct",
    45165: "precise",
    45166: "precision",
    45211: "precook",
    45212: "precut",
    45213: "predator",
    45214: "predefine",
    45215: "predict",
    45216: "preface",
    45221: "prefix",
    45222: "preflight",
    45223: "preformed",
    45224: "pregame",
    45225: "pregnancy",
    45226: "pregnant",
    45231: "preheated",
    45232: "prelaunch",
    45233: "prelaw",
    45234: "prelude",
    45235: "premiere",
    45236: "premises",
    45241: "premium",
    45242: "prenatal",
    45243: "preoccupy",
    45244: "preorder",
    45245: "prepaid",
    45246: "prepay",
    45251: "preplan",
    45252: "preppy",
    45253: "preschool",
    45254: "prescribe",
    45255: "preseason",
    45256: "preset",
    45261: "preshow",
    45262: "president",
    45263: "presoak",
    45264: "press",
    45265: "presume",
    45266: "presuming",
    45311: "preteen",
    45312: "pretended",
    45313: "pretender",
    45314: "pretense",
    45315: "pretext",
    45316: "pretty",
    45321: "pretzel",
    45322: "prevail",
    45323: "prevalent",
    45324: "prevent",
    45325: "preview",
    45326: "previous",
    45331: "prewar",
    45332: "prewashed",
    45333: "prideful",
    45334: "pried",
    45335: "primal",
    45336: "primarily",
    45341: "primary",
    45342: "primate",
    45343: "primer",
    45344: "primp",
    45345: "princess",
    45346: "print",
    45351: "prior",
    45352: "prism",
    45353: "prison",
    45354: "prissy",
    45355: "pristine",
    45356: "privacy",
    45361: "private",
    45362: "privatize",
    45363: "prize",
    45364: "proactive",
    45365: "probable",
    45366: "probably",
    45411: "probation",
    45412: "probe",
    45413: "probing",
    45414: "probiotic",
    45415: "problem",
    45416: "procedure",
    45421: "process",
    45422: "proclaim",
    45423: "procreate",
    45424: "procurer",
    45425: "prodigal",
    45426: "prodigy",
    45431: "produce",
    45432: "product",
    45433: "profane",
    45434: "profanity",
    45435: "professed",
    45436: "professor",
    45441: "profile",
    45442: "profound",
    45443: "profusely",
    45444: "progeny",
    45445: "prognosis",
    45446: "program",
    45451: "progress",
    45452: "projector",
    45453: "prologue",
    45454: "prolonged",
    45455: "promenade",
    45456: "prominent",
    45461: "promoter",
    45462: "promotion",
    45463: "prompter",
    45464: "promptly",
    45465: "prone",
    45466: "prong",
    45511: "pronounce",
    45512: "pronto",
    45513: "proofing",
    45514: "proofread",
    45515: "proofs",
    45516: "propeller",
    45521: "properly",
    45522: "property",
    45523: "proponent",
    45524: "proposal",
    45525: "propose",
    45526: "props",
    45531: "prorate",
    45532: "protector",
    45533: "protegee",
    45534: "proton",
    45535: "prototype",
    45536: "protozoan",
    45541: "protract",
    45542: "protrude",
    45543: "proud",
    45544: "provable",
    45545: "proved",
    45546: "proven",
    45551: "provided",
    45552: "provider",
    45553: "providing",
    45554: "province",
    45555: "proving",
    45556: "provoke",
    45561: "provoking",
    45562: "provolone",
    45563: "prowess",
    45564: "prowler",
    45565: "prowling",
    45566: "proximity",
    45611: "proxy",
    45612: "prozac",
    45613: "prude",
    45614: "prudishly",
    45615: "prune",
    45616: "pruning",
    45621: "pry",
    45622: "psychic",
    45623: "public",
    45624: "publisher",
    45625: "pucker",
    45626: "pueblo",
    45631: "pug",
    45632: "pull",
    45633: "pulmonary",
    45634: "pulp",
    45635: "pulsate",
    45636: "pulse",
    45641: "pulverize",
    45642: "puma",
    45643: "pumice",
    45644: "pummel",
    45645: "punch",
    45646: "punctual",
    45651: "punctuate",
    45652: "punctured",
    45653: "pungent",
    45654: "punisher",
    45655: "punk",
    45656: "pupil",
    45661: "puppet",
    45662: "puppy",
    45663: "purchase",
    45664: "pureblood",
    45665: "purebred",
    45666: "purely",
    46111: "pureness",
    46112: "purgatory",
    46113: "purge",
    46114: "purging",
    46115: "purifier",
    46116: "purify",
    46121: "purist",
    46122: "puritan",
    46123: "purity",
    46124: "purple",
    46125: "purplish",
    46126: "purposely",
    46131: "purr",
    46132: "purse",
    46133: "pursuable",
    46134: "pursuant",
    46135: "pursuit",
    46136: "purveyor",
    46141: "pushcart",
    46142: "pushchair",
    46143: "pusher",
    46144: "pushiness",
    46145: "pushing",
    46146: "pushover",
    46151: "pushpin",
    46152: "pushup",
    46153: "pushy",
    46154: "putdown",
    46155: "putt",
    46156: "puzzle",
    46161: "puzzling",
    46162: "pyramid",
    46163: "pyromania",
    46164: "python",
    46165: "quack",
    46166: "quadrant",
    46211: "quail",
    46212: "quaintly",
    46213: "quake",
    46214: "quaking",
    46215: "qualified",
    46216: "qualifier",
    46221: "qualify",
    46222: "quality",
    46223: "qualm",
    46224: "quantum",
    46225: "quarrel",
    46226: "quarry",
    46231: "quartered",
    46232: "quarterly",
    46233: "quarters",
    46234: "quartet",
    46235: "quench",
    46236: "query",
    46241: "quicken",
    46242: "quickly",
    46243: "quickness",
    46244: "quicksand",
    46245: "quickstep",
    46246: "quiet",
    46251: "quill",
    46252: "quilt",
    46253: "quintet",
    46254: "quintuple",
    46255: "quirk",
    46256: "quit",
    46261: "quiver",
    46262: "quizzical",
    46263: "quotable",
    46264: "quotation",
    46265: "quote",
    46266: "rabid",
    46311: "race",
    46312: "racing",
    46313: "racism",
    46314: "rack",
    46315: "racoon",
    46316: "radar",
    46321: "radial",
    46322: "radiance",
    46323: "radiantly",
    46324: "radiated",
    46325: "radiation",
    46326: "radiator",
    46331: "radio",
    46332: "radish",
    46333: "raffle",
    46334: "raft",
    46335: "rage",
    46336: "ragged",
    46341: "raging",
    46342: "ragweed",
    46343: "raider",
    46344: "railcar",
    46345: "railing",
    46346: "railroad",
    46351: "railway",
    46352: "raisin",
    46353: "rake",
    46354: "raking",
    46355: "rally",
    46356: "ramble",
    46361: "rambling",
    46362: "ramp",
    46363: "ramrod",
    46364: "ranch",
    46365: "rancidity",
    46366: "random",
    46411: "ranged",
    46412: "ranger",
    46413: "ranging",
    46414: "ranked",
    46415: "ranking",
    46416: "ransack",
    46421: "ranting",
    46422: "rants",
    46423: "rare",
    46424: "rarity",
    46425: "rascal",
    46426: "rash",
    46431: "rasping",
    46432: "ravage",
    46433: "raven",
    46434: "ravine",
    46435: "raving",
    46436: "ravioli",
    46441: "ravishing",
    46442: "reabsorb",
    46443: "reach",
    46444: "reacquire",
    46445: "reaction",
    46446: "reactive",
    46451: "reactor",
    46452: "reaffirm",
    46453: "ream",
    46454: "reanalyze",
    46455: "reappear",
    46456: "reapply",
    46461: "reappoint",
    46462: "reapprove",
    46463: "rearrange",
    46464: "rearview",
    46465: "reason",
    46466: "reassign",
    46511: "reassure",
    46512: "reattach",
    46513: "reawake",
    46514: "rebalance",
    46515: "rebate",
    46516: "rebel",
    46521: "rebirth",
    46522: "reboot",
    46523: "reborn",
    46524: "rebound",
    46525: "rebuff",
    46526: "rebuild",
    46531: "rebuilt",
    46532: "reburial",
    46533: "rebuttal",
    46534: "recall",
    46535: "recant",
    46536: "recapture",
    46541: "recast",
    46542: "recede",
    46543: "recent",
    46544: "recess",
    46545: "recharger",
    46546: "recipient",
    46551: "recital",
    46552: "recite",
    46553: "reckless",
    46554: "reclaim",
    46555: "recliner",
    46556: "reclining",
    46561: "recluse",
    46562: "reclusive",
    46563: "recognize",
    46564: "recoil",
    46565: "recollect",
    46566: "recolor",
    46611: "reconcile",
    46612: "reconfirm",
    46613: "reconvene",
    46614: "recopy",
    46615: "record",
    46616: "recount",
    46621: "recoup",
    46622: "recovery",
    46623: "recreate",
    46624: "rectal",
    46625: "rectangle",
    46626: "rectified",
    46631: "rectify",
    46632: "recycled",
    46633: "recycler",
    46634: "recycling",
    46635: "reemerge",
    46636: "reenact",
    46641: "reenter",
    46642: "reentry",
    46643: "reexamine",
    46644: "referable",
    46645: "referee",
    46646: "reference",
    46651: "refill",
    46652: "refinance",
    46653: "refined",
    46654: "refinery",
    46655: "refining",
    46656: "refinish",
    46661: "reflected",
    46662: "reflector",
    46663: "reflex",
    46664: "reflux",
    46665: "refocus",
    46666: "refold",
    51111: "reforest",
    51112: "reformat",
    51113: "reformed",
    51114: "reformer",
    51115: "reformist",
    51116: "refract",
    51121: "refrain",
    51122: "refreeze",
    51123: "refresh",
    51124: "refried",
    51125: "refueling",
    51126: "refund",
    51131: "refurbish",
    51132: "refurnish",
    51133: "refusal",
    51134: "refuse",
    51135: "refusing",
    51136: "refutable",
    51141: "refute",
    51142: "regain",
    51143: "regalia",
    51144: "regally",
    51145: "reggae",
    51146: "regime",
    51151: "region",
    51152: "register",
    51153: "registrar",
    51154: "registry",
    51155: "regress",
    51156: "regretful",
    51161: "regroup",
    51162: "regular",
    51163: "regulate",
    51164: "regulator",
    51165: "rehab",
    51166: "reheat",
    51211: "rehire",
    51212: "rehydrate",
    51213: "reimburse",
    51214: "reissue",
    51215: "reiterate",
    51216: "rejoice",
    51221: "rejoicing",
    51222: "rejoin",
    51223: "rekindle",
    51224: "relapse",
    51225: "relapsing",
    51226: "relatable",
    51231: "related",
    51232: "relation",
    51233: "relative",
    51234: "relax",
    51235: "relay",
    51236: "relearn",
    51241: "release",
    51242: "relenting",
    51243: "reliable",
    51244: "reliably",
    51245: "reliance",
    51246: "reliant",
    51251: "relic",
    51252: "relieve",
    51253: "relieving",
    51254: "relight",
    51255: "relish",
    51256: "relive",
    51261: "reload",
    51262: "relocate",
    51263: "relock",
    51264: "reluctant",
    51265: "rely",
    51266: "remake",
    51311: "remark",
    51312: "remarry",
    51313: "rematch",
    51314: "remedial",
    51315: "remedy",
    51316: "remember",
    51321: "reminder",
    51322: "remindful",
    51323: "remission",
    51324: "remix",
    51325: "remnant",
    51326: "remodeler",
    51331: "remold",
    51332: "remorse",
    51333: "remote",
    51334: "removable",
    51335: "removal",
    51336: "removed",
    51341: "remover",
    51342: "removing",
    51343: "rename",
    51344: "renderer",
    51345: "rendering",
    51346: "rendition",
    51351: "renegade",
    51352: "renewable",
    51353: "renewably",
    51354: "renewal",
    51355: "renewed",
    51356: "renounce",
    51361: "renovate",
    51362: "renovator",
    51363: "rentable",
    51364: "rental",
    51365: "rented",
    51366: "renter",
    51411: "reoccupy",
    51412: "reoccur",
    51413: "reopen",
    51414: "reorder",
    51415: "repackage",
    51416: "repacking",
    51421: "repaint",
    51422: "repair",
    51423: "repave",
    51424: "repaying",
    51425: "repayment",
    51426: "repeal",
    51431: "repeated",
    51432: "repeater",
    51433: "repent",
    51434: "rephrase",
    51435: "replace",
    51436: "replay",
    51441: "replica",
    51442: "reply",
    51443: "reporter",
    51444: "repose",
    51445: "repossess",
    51446: "repost",
    51451: "repressed",
    51452: "reprimand",
    51453: "reprint",
    51454: "reprise",
    51455: "reproach",
    51456: "reprocess",
    51461: "reproduce",
    51462: "reprogram",
    51463: "reps",
    51464: "reptile",
    51465: "reptilian",
    51466: "repugnant",
    51511: "repulsion",
    51512: "repulsive",
    51513: "repurpose",
    51514: "reputable",
    51515: "reputably",
    51516: "request",
    51521: "require",
    51522: "requisite",
    51523: "reroute",
    51524: "rerun",
    51525: "resale",
    51526: "resample",
    51531: "rescuer",
    51532: "reseal",
    51533: "research",
    51534: "reselect",
    51535: "reseller",
    51536: "resemble",
    51541: "resend",
    51542: "resent",
    51543: "reset",
    51544: "reshape",
    51545: "reshoot",
    51546: "reshuffle",
    51551: "residence",
    51552: "residency",
    51553: "resident",
    51554: "residual",
    51555: "residue",
    51556: "resigned",
    51561: "resilient",
    51562: "resistant",
    51563: "resisting",
    51564: "resize",
    51565: "resolute",
    51566: "resolved",
    51611: "resonant",
    51612: "resonate",
    51613: "resort",
    51614: "resource",
    51615: "respect",
    51616: "resubmit",
    51621: "result",
    51622: "resume",
    51623: "resupply",
    51624: "resurface",
    51625: "resurrect",
    51626: "retail",
    51631: "retainer",
    51632: "retaining",
    51633: "retake",
    51634: "retaliate",
    51635: "retention",
    51636: "rethink",
    51641: "retinal",
    51642: "retired",
    51643: "retiree",
    51644: "retiring",
    51645: "retold",
    51646: "retool",
    51651: "retorted",
    51652: "retouch",
    51653: "retrace",
    51654: "retract",
    51655: "retrain",
    51656: "retread",
    51661: "retreat",
    51662: "retrial",
    51663: "retrieval",
    51664: "retriever",
    51665: "retry",
    51666: "return",
    52111: "retying",
    52112: "retype",
    52113: "reunion",
    52114: "reunite",
    52115: "reusable",
    52116: "reuse",
    52121: "reveal",
    52122: "reveler",
    52123: "revenge",
    52124: "revenue",
    52125: "reverb",
    52126: "revered",
    52131: "reverence",
    52132: "reverend",
    52133: "reversal",
    52134: "reverse",
    52135: "reversing",
    52136: "reversion",
    52141: "revert",
    52142: "revisable",
    52143: "revise",
    52144: "revision",
    52145: "revisit",
    52146: "revivable",
    52151: "revival",
    52152: "reviver",
    52153: "reviving",
    52154: "revocable",
    52155: "revoke",
    52156: "revolt",
    52161: "revolver",
    52162: "revolving",
    52163: "reward",
    52164: "rewash",
    52165: "rewind",
    52166: "rewire",
    52211: "reword",
    52212: "rework",
    52213: "rewrap",
    52214: "rewrite",
    52215: "rhyme",
    52216: "ribbon",
    52221: "ribcage",
    52222: "rice",
    52223: "riches",
    52224: "richly",
    52225: "richness",
    52226: "rickety",
    52231: "ricotta",
    52232: "riddance",
    52233: "ridden",
    52234: "ride",
    52235: "riding",
    52236: "rifling",
    52241: "rift",
    52242: "rigging",
    52243: "rigid",
    52244: "rigor",
    52245: "rimless",
    52246: "rimmed",
    52251: "rind",
    52252: "rink",
    52253: "rinse",
    52254: "rinsing",
    52255: "riot",
    52256: "ripcord",
    52261: "ripeness",
    52262: "ripening",
    52263: "ripping",
    52264: "ripple",
    52265: "rippling",
    52266: "riptide",
    52311: "rise",
    52312: "rising",
    52313: "risk",
    52314: "risotto",
    52315: "ritalin",
    52316: "ritzy",
    52321: "rival",
    52322: "riverbank",
    52323: "riverbed",
    52324: "riverboat",
    52325: "riverside",
    52326: "riveter",
    52331: "riveting",
    52332: "roamer",
    52333: "roaming",
    52334: "roast",
    52335: "robbing",
    52336: "robe",
    52341: "robin",
    52342: "robotics",
    52343: "robust",
    52344: "rockband",
    52345: "rocker",
    52346: "rocket",
    52351: "rockfish",
    52352: "rockiness",
    52353: "rocking",
    52354: "rocklike",
    52355: "rockslide",
    52356: "rockstar",
    52361: "rocky",
    52362: "rogue",
    52363: "roman",
    52364: "romp",
    52365: "rope",
    52366: "roping",
    52411: "roster",
    52412: "rosy",
    52413: "rotten",
    52414: "rotting",
    52415: "rotunda",
    52416: "roulette",
    52421: "rounding",
    52422: "roundish",
    52423: "roundness",
    52424: "roundup",
    52425: "roundworm",
    52426: "routine",
    52431: "routing",
    52432: "rover",
    52433: "roving",
    52434: "royal",
    52435: "rubbed",
    52436: "rubber",
    52441: "rubbing",
    52442: "rubble",
    52443: "rubdown",
    52444: "ruby",
    52445: "ruckus",
    52446: "rudder",
    52451: "rug",
    52452: "ruined",
    52453: "rule",
    52454: "rumble",
    52455: "rumbling",
    52456: "rummage",
    52461: "rumor",
    52462: "runaround",
    52463: "rundown",
    52464: "runner",
    52465: "running",
    52466: "runny",
    52511: "runt",
    52512: "runway",
    52513: "rupture",
    52514: "rural",
    52515: "ruse",
    52516: "rush",
    52521: "rust",
    52522: "rut",
    52523: "sabbath",
    52524: "sabotage",
    52525: "sacrament",
    52526: "sacred",
    52531: "sacrifice",
    52532: "sadden",
    52533: "saddlebag",
    52534: "saddled",
    52535: "saddling",
    52536: "sadly",
    52541: "sadness",
    52542: "safari",
    52543: "safeguard",
    52544: "safehouse",
    52545: "safely",
    52546: "safeness",
    52551: "saffron",
    52552: "saga",
    52553: "sage",
    52554: "sagging",
    52555: "saggy",
    52556: "said",
    52561: "saint",
    52562: "sake",
    52563: "salad",
    52564: "salami",
    52565: "salaried",
    52566: "salary",
    52611: "saline",
    52612: "salon",
    52613: "saloon",
    52614: "salsa",
    52615: "salt",
    52616: "salutary",
    52621: "salute",
    52622: "salvage",
    52623: "salvaging",
    52624: "salvation",
    52625: "same",
    52626: "sample",
    52631: "sampling",
    52632: "sanction",
    52633: "sanctity",
    52634: "sanctuary",
    52635: "sandal",
    52636: "sandbag",
    52641: "sandbank",
    52642: "sandbar",
    52643: "sandblast",
    52644: "sandbox",
    52645: "sanded",
    52646: "sandfish",
    52651: "sanding",
    52652: "sandlot",
    52653: "sandpaper",
    52654: "sandpit",
    52655: "sandstone",
    52656: "sandstorm",
    52661: "sandworm",
    52662: "sandy",
    52663: "sanitary",
    52664: "sanitizer",
    52665: "sank",
    52666: "santa",
    53111: "sapling",
    53112: "sappiness",
    53113: "sappy",
    53114: "sarcasm",
    53115: "sarcastic",
    53116: "sardine",
    53121: "sash",
    53122: "sasquatch",
    53123: "sassy",
    53124: "satchel",
    53125: "satiable",
    53126: "satin",
    53131: "satirical",
    53132: "satisfied",
    53133: "satisfy",
    53134: "saturate",
    53135: "saturday",
    53136: "sauciness",
    53141: "saucy",
    53142: "sauna",
    53143: "savage",
    53144: "savanna",
    53145: "saved",
    53146: "savings",
    53151: "savior",
    53152: "savor",
    53153: "saxophone",
    53154: "say",
    53155: "scabbed",
    53156: "scabby",
    53161: "scalded",
    53162: "scalding",
    53163: "scale",
    53164: "scaling",
    53165: "scallion",
    53166: "scallop",
    53211: "scalping",
    53212: "scam",
    53213: "scandal",
    53214: "scanner",
    53215: "scanning",
    53216: "scant",
    53221: "scapegoat",
    53222: "scarce",
    53223: "scarcity",
    53224: "scarecrow",
    53225: "scared",
    53226: "scarf",
    53231: "scarily",
    53232: "scariness",
    53233: "scarring",
    53234: "scary",
    53235: "scavenger",
    53236: "scenic",
    53241: "schedule",
    53242: "schematic",
    53243: "scheme",
    53244: "scheming",
    53245: "schilling",
    53246: "schnapps",
    53251: "scholar",
    53252: "science",
    53253: "scientist",
    53254: "scion",
    53255: "scoff",
    53256: "scolding",
    53261: "scone",
    53262: "scoop",
    53263: "scooter",
    53264: "scope",
    53265: "scorch",
    53266: "scorebook",
    53311: "scorecard",
    53312: "scored",
    53313: "scoreless",
    53314: "scorer",
    53315: "scoring",
    53316: "scorn",
    53321: "scorpion",
    53322: "scotch",
    53323: "scoundrel",
    53324: "scoured",
    53325: "scouring",
    53326: "scouting",
    53331: "scouts",
    53332: "scowling",
    53333: "scrabble",
    53334: "scraggly",
    53335: "scrambled",
    53336: "scrambler",
    53341: "scrap",
    53342: "scratch",
    53343: "scrawny",
    53344: "screen",
    53345: "scribble",
    53346: "scribe",
    53351: "scribing",
    53352: "scrimmage",
    53353: "script",
    53354: "scroll",
    53355: "scrooge",
    53356: "scrounger",
    53361: "scrubbed",
    53362: "scrubber",
    53363: "scruffy",
    53364: "scrunch",
    53365: "scrutiny",
    53366: "scuba",
    53411: "scuff",
    53412: "sculptor",
    53413: "sculpture",
    53414: "scurvy",
    53415: "scuttle",
    53416: "secluded",
    53421: "secluding",
    53422: "seclusion",
    53423: "second",
    53424: "secrecy",
    53425: "secret",
    53426: "sectional",
    53431: "sector",
    53432: "secular",
    53433: "securely",
    53434: "security",
    53435: "sedan",
    53436: "sedate",
    53441: "sedation",
    53442: "sedative",
    53443: "sediment",
    53444: "seduce",
    53445: "seducing",
    53446: "segment",
    53451: "seismic",
    53452: "seizing",
    53453: "seldom",
    53454: "selected",
    53455: "selection",
    53456: "selective",
    53461: "selector",
    53462: "self",
    53463: "seltzer",
    53464: "semantic",
    53465: "semester",
    53466: "semicolon",
    53511: "semifinal",
    53512: "seminar",
    53513: "semisoft",
    53514: "semisweet",
    53515: "senate",
    53516: "senator",
    53521: "send",
    53522: "senior",
    53523: "senorita",
    53524: "sensation",
    53525: "sensitive",
    53526: "sensitize",
    53531: "sensually",
    53532: "sensuous",
    53533: "sepia",
    53534: "september",
    53535: "septic",
    53536: "septum",
    53541: "sequel",
    53542: "sequence",
    53543: "sequester",
    53544: "series",
    53545: "sermon",
    53546: "serotonin",
    53551: "serpent",
    53552: "serrated",
    53553: "serve",
    53554: "service",
    53555: "serving",
    53556: "sesame",
    53561: "sessions",
    53562: "setback",
    53563: "setting",
    53564: "settle",
    53565: "settling",
    53566: "setup",
    53611: "sevenfold",
    53612: "seventeen",
    53613: "seventh",
    53614: "seventy",
    53615: "severity",
    53616: "shabby",
    53621: "shack",
    53622: "shaded",
    53623: "shadily",
    53624: "shadiness",
    53625: "shading",
    53626: "shadow",
    53631: "shady",
    53632: "shaft",
    53633: "shakable",
    53634: "shakily",
    53635: "shakiness",
    53636: "shaking",
    53641: "shaky",
    53642: "shale",
    53643: "shallot",
    53644: "shallow",
    53645: "shame",
    53646: "shampoo",
    53651: "shamrock",
    53652: "shank",
    53653: "shanty",
    53654: "shape",
    53655: "shaping",
    53656: "share",
    53661: "sharpener",
    53662: "sharper",
    53663: "sharpie",
    53664: "sharply",
    53665: "sharpness",
    53666: "shawl",
    54111: "sheath",
    54112: "shed",
    54113: "sheep",
    54114: "sheet",
    54115: "shelf",
    54116: "shell",
    54121: "shelter",
    54122: "shelve",
    54123: "shelving",
    54124: "sherry",
    54125: "shield",
    54126: "shifter",
    54131: "shifting",
    54132: "shiftless",
    54133: "shifty",
    54134: "shimmer",
    54135: "shimmy",
    54136: "shindig",
    54141: "shine",
    54142: "shingle",
    54143: "shininess",
    54144: "shining",
    54145: "shiny",
    54146: "ship",
    54151: "shirt",
    54152: "shivering",
    54153: "shock",
    54154: "shone",
    54155: "shoplift",
    54156: "shopper",
    54161: "shopping",
    54162: "shoptalk",
    54163: "shore",
    54164: "shortage",
    54165: "shortcake",
    54166: "shortcut",
    54211: "shorten",
    54212: "shorter",
    54213: "shorthand",
    54214: "shortlist",
    54215: "shortly",
    54216: "shortness",
    54221: "shorts",
    54222: "shortwave",
    54223: "shorty",
    54224: "shout",
    54225: "shove",
    54226: "showbiz",
    54231: "showcase",
    54232: "showdown",
    54233: "shower",
    54234: "showgirl",
    54235: "showing",
    54236: "showman",
    54241: "shown",
    54242: "showoff",
    54243: "showpiece",
    54244: "showplace",
    54245: "showroom",
    54246: "showy",
    54251: "shrank",
    54252: "shrapnel",
    54253: "shredder",
    54254: "shredding",
    54255: "shrewdly",
    54256: "shriek",
    54261: "shrill",
    54262: "shrimp",
    54263: "shrine",
    54264: "shrink",
    54265: "shrivel",
    54266: "shrouded",
    54311: "shrubbery",
    54312: "shrubs",
    54313: "shrug",
    54314: "shrunk",
    54315: "shucking",
    54316: "shudder",
    54321: "shuffle",
    54322: "shuffling",
    54323: "shun",
    54324: "shush",
    54325: "shut",
    54326: "shy",
    54331: "siamese",
    54332: "siberian",
    54333: "sibling",
    54334: "siding",
    54335: "sierra",
    54336: "siesta",
    54341: "sift",
    54342: "sighing",
    54343: "silenced",
    54344: "silencer",
    54345: "silent",
    54346: "silica",
    54351: "silicon",
    54352: "silk",
    54353: "silliness",
    54354: "silly",
    54355: "silo",
    54356: "silt",
    54361: "silver",
    54362: "similarly",
    54363: "simile",
    54364: "simmering",
    54365: "simple",
    54366: "simplify",
    54411: "simply",
    54412: "sincere",
    54413: "sincerity",
    54414: "singer",
    54415: "singing",
    54416: "single",
    54421: "singular",
    54422: "sinister",
    54423: "sinless",
    54424: "sinner",
    54425: "sinuous",
    54426: "sip",
    54431: "siren",
    54432: "sister",
    54433: "sitcom",
    54434: "sitter",
    54435: "sitting",
    54436: "situated",
    54441: "situation",
    54442: "sixfold",
    54443: "sixteen",
    54444: "sixth",
    54445: "sixties",
    54446: "sixtieth",
    54451: "sixtyfold",
    54452: "sizable",
    54453: "sizably",
    54454: "size",
    54455: "sizing",
    54456: "sizzle",
    54461: "sizzling",
    54462: "skater",
    54463: "skating",
    54464: "skedaddle",
    54465: "skeletal",
    54466: "skeleton",
    54511: "skeptic",
    54512: "sketch",
    54513: "skewed",
    54514: "skewer",
    54515: "skid",
    54516: "skied",
    54521: "skier",
    54522: "skies",
    54523: "skiing",
    54524: "skilled",
    54525: "skillet",
    54526: "skillful",
    54531: "skimmed",
    54532: "skimmer",
    54533: "skimming",
    54534: "skimpily",
    54535: "skincare",
    54536: "skinhead",
    54541: "skinless",
    54542: "skinning",
    54543: "skinny",
    54544: "skintight",
    54545: "skipper",
    54546: "skipping",
    54551: "skirmish",
    54552: "skirt",
    54553: "skittle",
    54554: "skydiver",
    54555: "skylight",
    54556: "skyline",
    54561: "skype",
    54562: "skyrocket",
    54563: "skyward",
    54564: "slab",
    54565: "slacked",
    54566: "slacker",
    54611: "slacking",
    54612: "slackness",
    54613: "slacks",
    54614: "slain",
    54615: "slam",
    54616: "slander",
    54621: "slang",
    54622: "slapping",
    54623: "slapstick",
    54624: "slashed",
    54625: "slashing",
    54626: "slate",
    54631: "slather",
    54632: "slaw",
    54633: "sled",
    54634: "sleek",
    54635: "sleep",
    54636: "sleet",
    54641: "sleeve",
    54642: "slept",
    54643: "sliceable",
    54644: "sliced",
    54645: "slicer",
    54646: "slicing",
    54651: "slick",
    54652: "slider",
    54653: "slideshow",
    54654: "sliding",
    54655: "slighted",
    54656: "slighting",
    54661: "slightly",
    54662: "slimness",
    54663: "slimy",
    54664: "slinging",
    54665: "slingshot",
    54666: "slinky",
    55111: "slip",
    55112: "slit",
    55113: "sliver",
    55114: "slobbery",
    55115: "slogan",
    55116: "sloped",
    55121: "sloping",
    55122: "sloppily",
    55123: "sloppy",
    55124: "slot",
    55125: "slouching",
    55126: "slouchy",
    55131: "sludge",
    55132: "slug",
    55133: "slum",
    55134: "slurp",
    55135: "slush",
    55136: "sly",
    55141: "small",
    55142: "smartly",
    55143: "smartness",
    55144: "smasher",
    55145: "smashing",
    55146: "smashup",
    55151: "smell",
    55152: "smelting",
    55153: "smile",
    55154: "smilingly",
    55155: "smirk",
    55156: "smite",
    55161: "smith",
    55162: "smitten",
    55163: "smock",
    55164: "smog",
    55165: "smoked",
    55166: "smokeless",
    55211: "smokiness",
    55212: "smoking",
    55213: "smoky",
    55214: "smolder",
    55215: "smooth",
    55216: "smother",
    55221: "smudge",
    55222: "smudgy",
    55223: "smuggler",
    55224: "smuggling",
    55225: "smugly",
    55226: "smugness",
    55231: "snack",
    55232: "snagged",
    55233: "snaking",
    55234: "snap",
    55235: "snare",
    55236: "snarl",
    55241: "snazzy",
    55242: "sneak",
    55243: "sneer",
    55244: "sneeze",
    55245: "sneezing",
    55246: "snide",
    55251: "sniff",
    55252: "snippet",
    55253: "snipping",
    55254: "snitch",
    55255: "snooper",
    55256: "snooze",
    55261: "snore",
    55262: "snoring",
    55263: "snorkel",
    55264: "snort",
    55265: "snout",
    55266: "snowbird",
    55311: "snowboard",
    55312: "snowbound",
    55313: "snowcap",
    55314: "snowdrift",
    55315: "snowdrop",
    55316: "snowfall",
    55321: "snowfield",
    55322: "snowflake",
    55323: "snowiness",
    55324: "snowless",
    55325: "snowman",
    55326: "snowplow",
    55331: "snowshoe",
    55332: "snowstorm",
    55333: "snowsuit",
    55334: "snowy",
    55335: "snub",
    55336: "snuff",
    55341: "snuggle",
    55342: "snugly",
    55343: "snugness",
    55344: "speak",
    55345: "spearfish",
    55346: "spearhead",
    55351: "spearman",
    55352: "spearmint",
    55353: "species",
    55354: "specimen",
    55355: "specked",
    55356: "speckled",
    55361: "specks",
    55362: "spectacle",
    55363: "spectator",
    55364: "spectrum",
    55365: "speculate",
    55366: "speech",
    55411: "speed",
    55412: "spellbind",
    55413: "speller",
    55414: "spelling",
    55415: "spendable",
    55416: "spender",
    55421: "spending",
    55422: "spent",
    55423: "spew",
    55424: "sphere",
    55425: "spherical",
    55426: "sphinx",
    55431: "spider",
    55432: "spied",
    55433: "spiffy",
    55434: "spill",
    55435: "spilt",
    55436: "spinach",
    55441: "spinal",
    55442: "spindle",
    55443: "spinner",
    55444: "spinning",
    55445: "spinout",
    55446: "spinster",
    55451: "spiny",
    55452: "spiral",
    55453: "spirited",
    55454: "spiritism",
    55455: "spirits",
    55456: "spiritual",
    55461: "splashed",
    55462: "splashing",
    55463: "splashy",
    55464: "splatter",
    55465: "spleen",
    55466: "splendid",
    55511: "splendor",
    55512: "splice",
    55513: "splicing",
    55514: "splinter",
    55515: "splotchy",
    55516: "splurge",
    55521: "spoilage",
    55522: "spoiled",
    55523: "spoiler",
    55524: "spoiling",
    55525: "spoils",
    55526: "spoken",
    55531: "spokesman",
    55532: "sponge",
    55533: "spongy",
    55534: "sponsor",
    55535: "spoof",
    55536: "spookily",
    55541: "spooky",
    55542: "spool",
    55543: "spoon",
    55544: "spore",
    55545: "sporting",
    55546: "sports",
    55551: "sporty",
    55552: "spotless",
    55553: "spotlight",
    55554: "spotted",
    55555: "spotter",
    55556: "spotting",
    55561: "spotty",
    55562: "spousal",
    55563: "spouse",
    55564: "spout",
    55565: "sprain",
    55566: "sprang",
    55611: "sprawl",
    55612: "spray",
    55613: "spree",
    55614: "sprig",
    55615: "spring",
    55616: "sprinkled",
    55621: "sprinkler",
    55622: "sprint",
    55623: "sprite",
    55624: "sprout",
    55625: "spruce",
    55626: "sprung",
    55631: "spry",
    55632: "spud",
    55633: "spur",
    55634: "sputter",
    55635: "spyglass",
    55636: "squabble",
    55641: "squad",
    55642: "squall",
    55643: "squander",
    55644: "squash",
    55645: "squatted",
    55646: "squatter",
    55651: "squatting",
    55652: "squeak",
    55653: "squealer",
    55654: "squealing",
    55655: "squeamish",
    55656: "squeegee",
    55661: "squeeze",
    55662: "squeezing",
    55663: "squid",
    55664: "squiggle",
    55665: "squiggly",
    55666: "squint",
    56111: "squire",
    56112: "squirt",
    56113: "squishier",
    56114: "squishy",
    56115: "stability",
    56116: "stabilize",
    56121: "stable",
    56122: "stack",
    56123: "stadium",
    56124: "staff",
    56125: "stage",
    56126: "staging",
    56131: "stagnant",
    56132: "stagnate",
    56133: "stainable",
    56134: "stained",
    56135: "staining",
    56136: "stainless",
    56141: "stalemate",
    56142: "staleness",
    56143: "stalling",
    56144: "stallion",
    56145: "stamina",
    56146: "stammer",
    56151: "stamp",
    56152: "stand",
    56153: "stank",
    56154: "staple",
    56155: "stapling",
    56156: "starboard",
    56161: "starch",
    56162: "stardom",
    56163: "stardust",
    56164: "starfish",
    56165: "stargazer",
    56166: "staring",
    56211: "stark",
    56212: "starless",
    56213: "starlet",
    56214: "starlight",
    56215: "starlit",
    56216: "starring",
    56221: "starry",
    56222: "starship",
    56223: "starter",
    56224: "starting",
    56225: "startle",
    56226: "startling",
    56231: "startup",
    56232: "starved",
    56233: "starving",
    56234: "stash",
    56235: "state",
    56236: "static",
    56241: "statistic",
    56242: "statue",
    56243: "stature",
    56244: "status",
    56245: "statute",
    56246: "statutory",
    56251: "staunch",
    56252: "stays",
    56253: "steadfast",
    56254: "steadier",
    56255: "steadily",
    56256: "steadying",
    56261: "steam",
    56262: "steed",
    56263: "steep",
    56264: "steerable",
    56265: "steering",
    56266: "steersman",
    56311: "stegosaur",
    56312: "stellar",
    56313: "stem",
    56314: "stench",
    56315: "stencil",
    56316: "step",
    56321: "stereo",
    56322: "sterile",
    56323: "sterility",
    56324: "sterilize",
    56325: "sterling",
    56326: "sternness",
    56331: "sternum",
    56332: "stew",
    56333: "stick",
    56334: "stiffen",
    56335: "stiffly",
    56336: "stiffness",
    56341: "stifle",
    56342: "stifling",
    56343: "stillness",
    56344: "stilt",
    56345: "stimulant",
    56346: "stimulate",
    56351: "stimuli",
    56352: "stimulus",
    56353: "stinger",
    56354: "stingily",
    56355: "stinging",
    56356: "stingray",
    56361: "stingy",
    56362: "stinking",
    56363: "stinky",
    56364: "stipend",
    56365: "stipulate",
    56366: "stir",
    56411: "stitch",
    56412: "stock",
    56413: "stoic",
    56414: "stoke",
    56415: "stole",
    56416: "stomp",
    56421: "stonewall",
    56422: "stoneware",
    56423: "stonework",
    56424: "stoning",
    56425: "stony",
    56426: "stood",
    56431: "stooge",
    56432: "stool",
    56433: "stoop",
    56434: "stoplight",
    56435: "stoppable",
    56436: "stoppage",
    56441: "stopped",
    56442: "stopper",
    56443: "stopping",
    56444: "stopwatch",
    56445: "storable",
    56446: "storage",
    56451: "storeroom",
    56452: "storewide",
    56453: "storm",
    56454: "stout",
    56455: "stove",
    56456: "stowaway",
    56461: "stowing",
    56462: "straddle",
    56463: "straggler",
    56464: "strained",
    56465: "strainer",
    56466: "straining",
    56511: "strangely",
    56512: "stranger",
    56513: "strangle",
    56514: "strategic",
    56515: "strategy",
    56516: "stratus",
    56521: "straw",
    56522: "stray",
    56523: "streak",
    56524: "stream",
    56525: "street",
    56526: "strength",
    56531: "strenuous",
    56532: "strep",
    56533: "stress",
    56534: "stretch",
    56535: "strewn",
    56536: "stricken",
    56541: "strict",
    56542: "stride",
    56543: "strife",
    56544: "strike",
    56545: "striking",
    56546: "strive",
    56551: "striving",
    56552: "strobe",
    56553: "strode",
    56554: "stroller",
    56555: "strongbox",
    56556: "strongly",
    56561: "strongman",
    56562: "struck",
    56563: "structure",
    56564: "strudel",
    56565: "struggle",
    56566: "strum",
    56611: "strung",
    56612: "strut",
    56613: "stubbed",
    56614: "stubble",
    56615: "stubbly",
    56616: "stubborn",
    56621: "stucco",
    56622: "stuck",
    56623: "student",
    56624: "studied",
    56625: "studio",
    56626: "study",
    56631: "stuffed",
    56632: "stuffing",
    56633: "stuffy",
    56634: "stumble",
    56635: "stumbling",
    56636: "stump",
    56641: "stung",
    56642: "stunned",
    56643: "stunner",
    56644: "stunning",
    56645: "stunt",
    56646: "stupor",
    56651: "sturdily",
    56652: "sturdy",
    56653: "styling",
    56654: "stylishly",
    56655: "stylist",
    56656: "stylized",
    56661: "stylus",
    56662: "suave",
    56663: "subarctic",
    56664: "subatomic",
    56665: "subdivide",
    56666: "subdued",
    61111: "subduing",
    61112: "subfloor",
    61113: "subgroup",
    61114: "subheader",
    61115: "subject",
    61116: "sublease",
    61121: "sublet",
    61122: "sublevel",
    61123: "sublime",
    61124: "submarine",
    61125: "submerge",
    61126: "submersed",
    61131: "submitter",
    61132: "subpanel",
    61133: "subpar",
    61134: "subplot",
    61135: "subprime",
    61136: "subscribe",
    61141: "subscript",
    61142: "subsector",
    61143: "subside",
    61144: "subsiding",
    61145: "subsidize",
    61146: "subsidy",
    61151: "subsoil",
    61152: "subsonic",
    61153: "substance",
    61154: "subsystem",
    61155: "subtext",
    61156: "subtitle",
    61161: "subtly",
    61162: "subtotal",
    61163: "subtract",
    61164: "subtype",
    61165: "suburb",
    61166: "subway",
    61211: "subwoofer",
    61212: "subzero",
    61213: "succulent",
    61214: "such",
    61215: "suction",
    61216: "sudden",
    61221: "sudoku",
    61222: "suds",
    61223: "sufferer",
    61224: "suffering",
    61225: "suffice",
    61226: "suffix",
    61231: "suffocate",
    61232: "suffrage",
    61233: "sugar",
    61234: "suggest",
    61235: "suing",
    61236: "suitable",
    61241: "suitably",
    61242: "suitcase",
    61243: "suitor",
    61244: "sulfate",
    61245: "sulfide",
    61246: "sulfite",
    61251: "sulfur",
    61252: "sulk",
    61253: "sullen",
    61254: "sulphate",
    61255: "sulphuric",
    61256: "sultry",
    61261: "superbowl",
    61262: "superglue",
    61263: "superhero",
    61264: "superior",
    61265: "superjet",
    61266: "superman",
    61311: "supermom",
    61312: "supernova",
    61313: "supervise",
    61314: "supper",
    61315: "supplier",
    61316: "supply",
    61321: "support",
    61322: "supremacy",
    61323: "supreme",
    61324: "surcharge",
    61325: "surely",
    61326: "sureness",
    61331: "surface",
    61332: "surfacing",
    61333: "surfboard",
    61334: "surfer",
    61335: "surgery",
    61336: "surgical",
    61341: "surging",
    61342: "surname",
    61343: "surpass",
    61344: "surplus",
    61345: "surprise",
    61346: "surreal",
    61351: "surrender",
    61352: "surrogate",
    61353: "surround",
    61354: "survey",
    61355: "survival",
    61356: "survive",
    61361: "surviving",
    61362: "survivor",
    61363: "sushi",
    61364: "suspect",
    61365: "suspend",
    61366: "suspense",
    61411: "sustained",
    61412: "sustainer",
    61413: "swab",
    61414: "swaddling",
    61415: "swagger",
    61416: "swampland",
    61421: "swan",
    61422: "swapping",
    61423: "swarm",
    61424: "sway",
    61425: "swear",
    61426: "sweat",
    61431: "sweep",
    61432: "swell",
    61433: "swept",
    61434: "swerve",
    61435: "swifter",
    61436: "swiftly",
    61441: "swiftness",
    61442: "swimmable",
    61443: "swimmer",
    61444: "swimming",
    61445: "swimsuit",
    61446: "swimwear",
    61451: "swinger",
    61452: "swinging",
    61453: "swipe",
    61454: "swirl",
    61455: "switch",
    61456: "swivel",
    61461: "swizzle",
    61462: "swooned",
    61463: "swoop",
    61464: "swoosh",
    61465: "swore",
    61466: "sworn",
    61511: "swung",
    61512: "sycamore",
    61513: "sympathy",
    61514: "symphonic",
    61515: "symphony",
    61516: "symptom",
    61521: "synapse",
    61522: "syndrome",
    61523: "synergy",
    61524: "synopses",
    61525: "synopsis",
    61526: "synthesis",
    61531: "synthetic",
    61532: "syrup",
    61533: "system",
    61534: "t-shirt",
    61535: "tabasco",
    61536: "tabby",
    61541: "tableful",
    61542: "tables",
    61543: "tablet",
    61544: "tableware",
    61545: "tabloid",
    61546: "tackiness",
    61551: "tacking",
    61552: "tackle",
    61553: "tackling",
    61554: "tacky",
    61555: "taco",
    61556: "tactful",
    61561: "tactical",
    61562: "tactics",
    61563: "tactile",
    61564: "tactless",
    61565: "tadpole",
    61566: "taekwondo",
    61611: "tag",
    61612: "tainted",
    61613: "take",
    61614: "taking",
    61615: "talcum",
    61616: "talisman",
    61621: "tall",
    61622: "talon",
    61623: "tamale",
    61624: "tameness",
    61625: "tamer",
    61626: "tamper",
    61631: "tank",
    61632: "tanned",
    61633: "tannery",
    61634: "tanning",
    61635: "tantrum",
    61636: "tapeless",
    61641: "tapered",
    61642: "tapering",
    61643: "tapestry",
    61644: "tapioca",
    61645: "tapping",
    61646: "taps",
    61651: "tarantula",
    61652: "target",
    61653: "tarmac",
    61654: "tarnish",
    61655: "tarot",
    61656: "tartar",
    61661: "tartly",
    61662: "tartness",
    61663: "task",
    61664: "tassel",
    61665: "taste",
    61666: "tastiness",
    62111: "tasting",
    62112: "tasty",
    62113: "tattered",
    62114: "tattle",
    62115: "tattling",
    62116: "tattoo",
    62121: "taunt",
    62122: "tavern",
    62123: "thank",
    62124: "that",
    62125: "thaw",
    62126: "theater",
    62131: "theatrics",
    62132: "thee",
    62133: "theft",
    62134: "theme",
    62135: "theology",
    62136: "theorize",
    62141: "thermal",
    62142: "thermos",
    62143: "thesaurus",
    62144: "these",
    62145: "thesis",
    62146: "thespian",
    62151: "thicken",
    62152: "thicket",
    62153: "thickness",
    62154: "thieving",
    62155: "thievish",
    62156: "thigh",
    62161: "thimble",
    62162: "thing",
    62163: "think",
    62164: "thinly",
    62165: "thinner",
    62166: "thinness",
    62211: "thinning",
    62212: "thirstily",
    62213: "thirsting",
    62214: "thirsty",
    62215: "thirteen",
    62216: "thirty",
    62221: "thong",
    62222: "thorn",
    62223: "those",
    62224: "thousand",
    62225: "thrash",
    62226: "thread",
    62231: "threaten",
    62232: "threefold",
    62233: "thrift",
    62234: "thrill",
    62235: "thrive",
    62236: "thriving",
    62241: "throat",
    62242: "throbbing",
    62243: "throng",
    62244: "throttle",
    62245: "throwaway",
    62246: "throwback",
    62251: "thrower",
    62252: "throwing",
    62253: "thud",
    62254: "thumb",
    62255: "thumping",
    62256: "thursday",
    62261: "thus",
    62262: "thwarting",
    62263: "thyself",
    62264: "tiara",
    62265: "tibia",
    62266: "tidal",
    62311: "tidbit",
    62312: "tidiness",
    62313: "tidings",
    62314: "tidy",
    62315: "tiger",
    62316: "tighten",
    62321: "tightly",
    62322: "tightness",
    62323: "tightrope",
    62324: "tightwad",
    62325: "tigress",
    62326: "tile",
    62331: "tiling",
    62332: "till",
    62333: "tilt",
    62334: "timid",
    62335: "timing",
    62336: "timothy",
    62341: "tinderbox",
    62342: "tinfoil",
    62343: "tingle",
    62344: "tingling",
    62345: "tingly",
    62346: "tinker",
    62351: "tinkling",
    62352: "tinsel",
    62353: "tinsmith",
    62354: "tint",
    62355: "tinwork",
    62356: "tiny",
    62361: "tipoff",
    62362: "tipped",
    62363: "tipper",
    62364: "tipping",
    62365: "tiptoeing",
    62366: "tiptop",
    62411: "tiring",
    62412: "tissue",
    62413: "trace",
    62414: "tracing",
    62415: "track",
    62416: "traction",
    62421: "tractor",
    62422: "trade",
    62423: "trading",
    62424: "tradition",
    62425: "traffic",
    62426: "tragedy",
    62431: "trailing",
    62432: "trailside",
    62433: "train",
    62434: "traitor",
    62435: "trance",
    62436: "tranquil",
    62441: "transfer",
    62442: "transform",
    62443: "translate",
    62444: "transpire",
    62445: "transport",
    62446: "transpose",
    62451: "trapdoor",
    62452: "trapeze",
    62453: "trapezoid",
    62454: "trapped",
    62455: "trapper",
    62456: "trapping",
    62461: "traps",
    62462: "trash",
    62463: "travel",
    62464: "traverse",
    62465: "travesty",
    62466: "tray",
    62511: "treachery",
    62512: "treading",
    62513: "treadmill",
    62514: "treason",
    62515: "treat",
    62516: "treble",
    62521: "tree",
    62522: "trekker",
    62523: "tremble",
    62524: "trembling",
    62525: "tremor",
    62526: "trench",
    62531: "trend",
    62532: "trespass",
    62533: "triage",
    62534: "trial",
    62535: "triangle",
    62536: "tribesman",
    62541: "tribunal",
    62542: "tribune",
    62543: "tributary",
    62544: "tribute",
    62545: "triceps",
    62546: "trickery",
    62551: "trickily",
    62552: "tricking",
    62553: "trickle",
    62554: "trickster",
    62555: "tricky",
    62556: "tricolor",
    62561: "tricycle",
    62562: "trident",
    62563: "tried",
    62564: "trifle",
    62565: "trifocals",
    62566: "trillion",
    62611: "trilogy",
    62612: "trimester",
    62613: "trimmer",
    62614: "trimming",
    62615: "trimness",
    62616: "trinity",
    62621: "trio",
    62622: "tripod",
    62623: "tripping",
    62624: "triumph",
    62625: "trivial",
    62626: "trodden",
    62631: "trolling",
    62632: "trombone",
    62633: "trophy",
    62634: "tropical",
    62635: "tropics",
    62636: "trouble",
    62641: "troubling",
    62642: "trough",
    62643: "trousers",
    62644: "trout",
    62645: "trowel",
    62646: "truce",
    62651: "truck",
    62652: "truffle",
    62653: "trump",
    62654: "trunks",
    62655: "trustable",
    62656: "trustee",
    62661: "trustful",
    62662: "trusting",
    62663: "trustless",
    62664: "truth",
    62665: "try",
    62666: "tubby",
    63111: "tubeless",
    63112: "tubular",
    63113: "tucking",
    63114: "tuesday",
    63115: "tug",
    63116: "tuition",
    63121: "tulip",
    63122: "tumble",
    63123: "tumbling",
    63124: "tummy",
    63125: "turban",
    63126: "turbine",
    63131: "turbofan",
    63132: "turbojet",
    63133: "turbulent",
    63134: "turf",
    63135: "turkey",
    63136: "turmoil",
    63141: "turret",
    63142: "turtle",
    63143: "tusk",
    63144: "tutor",
    63145: "tutu",
    63146: "tux",
    63151: "tweak",
    63152: "tweed",
    63153: "tweet",
    63154: "tweezers",
    63155: "twelve",
    63156: "twentieth",
    63161: "twenty",
    63162: "twerp",
    63163: "twice",
    63164: "twiddle",
    63165: "twiddling",
    63166: "twig",
    63211: "twilight",
    63212: "twine",
    63213: "twins",
    63214: "twirl",
    63215: "twistable",
    63216: "twisted",
    63221: "twister",
    63222: "twisting",
    63223: "twisty",
    63224: "twitch",
    63225: "twitter",
    63226: "tycoon",
    63231: "tying",
    63232: "tyke",
    63233: "udder",
    63234: "ultimate",
    63235: "ultimatum",
    63236: "ultra",
    63241: "umbilical",
    63242: "umbrella",
    63243: "umpire",
    63244: "unabashed",
    63245: "unable",
    63246: "unadorned",
    63251: "unadvised",
    63252: "unafraid",
    63253: "unaired",
    63254: "unaligned",
    63255: "unaltered",
    63256: "unarmored",
    63261: "unashamed",
    63262: "unaudited",
    63263: "unawake",
    63264: "unaware",
    63265: "unbaked",
    63266: "unbalance",
    63311: "unbeaten",
    63312: "unbend",
    63313: "unbent",
    63314: "unbiased",
    63315: "unbitten",
    63316: "unblended",
    63321: "unblessed",
    63322: "unblock",
    63323: "unbolted",
    63324: "unbounded",
    63325: "unboxed",
    63326: "unbraided",
    63331: "unbridle",
    63332: "unbroken",
    63333: "unbuckled",
    63334: "unbundle",
    63335: "unburned",
    63336: "unbutton",
    63341: "uncanny",
    63342: "uncapped",
    63343: "uncaring",
    63344: "uncertain",
    63345: "unchain",
    63346: "unchanged",
    63351: "uncharted",
    63352: "uncheck",
    63353: "uncivil",
    63354: "unclad",
    63355: "unclaimed",
    63356: "unclamped",
    63361: "unclasp",
    63362: "uncle",
    63363: "unclip",
    63364: "uncloak",
    63365: "unclog",
    63366: "unclothed",
    63411: "uncoated",
    63412: "uncoiled",
    63413: "uncolored",
    63414: "uncombed",
    63415: "uncommon",
    63416: "uncooked",
    63421: "uncork",
    63422: "uncorrupt",
    63423: "uncounted",
    63424: "uncouple",
    63425: "uncouth",
    63426: "uncover",
    63431: "uncross",
    63432: "uncrown",
    63433: "uncrushed",
    63434: "uncured",
    63435: "uncurious",
    63436: "uncurled",
    63441: "uncut",
    63442: "undamaged",
    63443: "undated",
    63444: "undaunted",
    63445: "undead",
    63446: "undecided",
    63451: "undefined",
    63452: "underage",
    63453: "underarm",
    63454: "undercoat",
    63455: "undercook",
    63456: "undercut",
    63461: "underdog",
    63462: "underdone",
    63463: "underfed",
    63464: "underfeed",
    63465: "underfoot",
    63466: "undergo",
    63511: "undergrad",
    63512: "underhand",
    63513: "underline",
    63514: "underling",
    63515: "undermine",
    63516: "undermost",
    63521: "underpaid",
    63522: "underpass",
    63523: "underpay",
    63524: "underrate",
    63525: "undertake",
    63526: "undertone",
    63531: "undertook",
    63532: "undertow",
    63533: "underuse",
    63534: "underwear",
    63535: "underwent",
    63536: "underwire",
    63541: "undesired",
    63542: "undiluted",
    63543: "undivided",
    63544: "undocked",
    63545: "undoing",
    63546: "undone",
    63551: "undrafted",
    63552: "undress",
    63553: "undrilled",
    63554: "undusted",
    63555: "undying",
    63556: "unearned",
    63561: "unearth",
    63562: "unease",
    63563: "uneasily",
    63564: "uneasy",
    63565: "uneatable",
    63566: "uneaten",
    63611: "unedited",
    63612: "unelected",
    63613: "unending",
    63614: "unengaged",
    63615: "unenvied",
    63616: "unequal",
    63621: "unethical",
    63622: "uneven",
    63623: "unexpired",
    63624: "unexposed",
    63625: "unfailing",
    63626: "unfair",
    63631: "unfasten",
    63632: "unfazed",
    63633: "unfeeling",
    63634: "unfiled",
    63635: "unfilled",
    63636: "unfitted",
    63641: "unfitting",
    63642: "unfixable",
    63643: "unfixed",
    63644: "unflawed",
    63645: "unfocused",
    63646: "unfold",
    63651: "unfounded",
    63652: "unframed",
    63653: "unfreeze",
    63654: "unfrosted",
    63655: "unfrozen",
    63656: "unfunded",
    63661: "unglazed",
    63662: "ungloved",
    63663: "unglue",
    63664: "ungodly",
    63665: "ungraded",
    63666: "ungreased",
    64111: "unguarded",
    64112: "unguided",
    64113: "unhappily",
    64114: "unhappy",
    64115: "unharmed",
    64116: "unhealthy",
    64121: "unheard",
    64122: "unhearing",
    64123: "unheated",
    64124: "unhelpful",
    64125: "unhidden",
    64126: "unhinge",
    64131: "unhitched",
    64132: "unholy",
    64133: "unhook",
    64134: "unicorn",
    64135: "unicycle",
    64136: "unified",
    64141: "unifier",
    64142: "uniformed",
    64143: "uniformly",
    64144: "unify",
    64145: "unimpeded",
    64146: "uninjured",
    64151: "uninstall",
    64152: "uninsured",
    64153: "uninvited",
    64154: "union",
    64155: "uniquely",
    64156: "unisexual",
    64161: "unison",
    64162: "unissued",
    64163: "unit",
    64164: "universal",
    64165: "universe",
    64166: "unjustly",
    64211: "unkempt",
    64212: "unkind",
    64213: "unknotted",
    64214: "unknowing",
    64215: "unknown",
    64216: "unlaced",
    64221: "unlatch",
    64222: "unlawful",
    64223: "unleaded",
    64224: "unlearned",
    64225: "unleash",
    64226: "unless",
    64231: "unleveled",
    64232: "unlighted",
    64233: "unlikable",
    64234: "unlimited",
    64235: "unlined",
    64236: "unlinked",
    64241: "unlisted",
    64242: "unlit",
    64243: "unlivable",
    64244: "unloaded",
    64245: "unloader",
    64246: "unlocked",
    64251: "unlocking",
    64252: "unlovable",
    64253: "unloved",
    64254: "unlovely",
    64255: "unloving",
    64256: "unluckily",
    64261: "unlucky",
    64262: "unmade",
    64263: "unmanaged",
    64264: "unmanned",
    64265: "unmapped",
    64266: "unmarked",
    64311: "unmasked",
    64312: "unmasking",
    64313: "unmatched",
    64314: "unmindful",
    64315: "unmixable",
    64316: "unmixed",
    64321: "unmolded",
    64322: "unmoral",
    64323: "unmovable",
    64324: "unmoved",
    64325: "unmoving",
    64326: "unnamable",
    64331: "unnamed",
    64332: "unnatural",
    64333: "unneeded",
    64334: "unnerve",
    64335: "unnerving",
    64336: "unnoticed",
    64341: "unopened",
    64342: "unopposed",
    64343: "unpack",
    64344: "unpadded",
    64345: "unpaid",
    64346: "unpainted",
    64351: "unpaired",
    64352: "unpaved",
    64353: "unpeeled",
    64354: "unpicked",
    64355: "unpiloted",
    64356: "unpinned",
    64361: "unplanned",
    64362: "unplanted",
    64363: "unpleased",
    64364: "unpledged",
    64365: "unplowed",
    64366: "unplug",
    64411: "unpopular",
    64412: "unproven",
    64413: "unquote",
    64414: "unranked",
    64415: "unrated",
    64416: "unraveled",
    64421: "unreached",
    64422: "unread",
    64423: "unreal",
    64424: "unreeling",
    64425: "unrefined",
    64426: "unrelated",
    64431: "unrented",
    64432: "unrest",
    64433: "unretired",
    64434: "unrevised",
    64435: "unrigged",
    64436: "unripe",
    64441: "unrivaled",
    64442: "unroasted",
    64443: "unrobed",
    64444: "unroll",
    64445: "unruffled",
    64446: "unruly",
    64451: "unrushed",
    64452: "unsaddle",
    64453: "unsafe",
    64454: "unsaid",
    64455: "unsalted",
    64456: "unsaved",
    64461: "unsavory",
    64462: "unscathed",
    64463: "unscented",
    64464: "unscrew",
    64465: "unsealed",
    64466: "unseated",
    64511: "unsecured",
    64512: "unseeing",
    64513: "unseemly",
    64514: "unseen",
    64515: "unselect",
    64516: "unselfish",
    64521: "unsent",
    64522: "unsettled",
    64523: "unshackle",
    64524: "unshaken",
    64525: "unshaved",
    64526: "unshaven",
    64531: "unsheathe",
    64532: "unshipped",
    64533: "unsightly",
    64534: "unsigned",
    64535: "unskilled",
    64536: "unsliced",
    64541: "unsmooth",
    64542: "unsnap",
    64543: "unsocial",
    64544: "unsoiled",
    64545: "unsold",
    64546: "unsolved",
    64551: "unsorted",
    64552: "unspoiled",
    64553: "unspoken",
    64554: "unstable",
    64555: "unstaffed",
    64556: "unstamped",
    64561: "unsteady",
    64562: "unsterile",
    64563: "unstirred",
    64564: "unstitch",
    64565: "unstopped",
    64566: "unstuck",
    64611: "unstuffed",
    64612: "unstylish",
    64613: "unsubtle",
    64614: "unsubtly",
    64615: "unsuited",
    64616: "unsure",
    64621: "unsworn",
    64622: "untagged",
    64623: "untainted",
    64624: "untaken",
    64625: "untamed",
    64626: "untangled",
    64631: "untapped",
    64632: "untaxed",
    64633: "unthawed",
    64634: "unthread",
    64635: "untidy",
    64636: "untie",
    64641: "until",
    64642: "untimed",
    64643: "untimely",
    64644: "untitled",
    64645: "untoasted",
    64646: "untold",
    64651: "untouched",
    64652: "untracked",
    64653: "untrained",
    64654: "untreated",
    64655: "untried",
    64656: "untrimmed",
    64661: "untrue",
    64662: "untruth",
    64663: "unturned",
    64664: "untwist",
    64665: "untying",
    64666: "unusable",
    65111: "unused",
    65112: "unusual",
    65113: "unvalued",
    65114: "unvaried",
    65115: "unvarying",
    65116: "unveiled",
    65121: "unveiling",
    65122: "unvented",
    65123: "unviable",
    65124: "unvisited",
    65125: "unvocal",
    65126: "unwanted",
    65131: "unwarlike",
    65132: "unwary",
    65133: "unwashed",
    65134: "unwatched",
    65135: "unweave",
    65136: "unwed",
    65141: "unwelcome",
    65142: "unwell",
    65143: "unwieldy",
    65144: "unwilling",
    65145: "unwind",
    65146: "unwired",
    65151: "unwitting",
    65152: "unwomanly",
    65153: "unworldly",
    65154: "unworn",
    65155: "unworried",
    65156: "unworthy",
    65161: "unwound",
    65162: "unwoven",
    65163: "unwrapped",
    65164: "unwritten",
    65165: "unzip",
    65166: "upbeat",
    65211: "upchuck",
    65212: "upcoming",
    65213: "upcountry",
    65214: "update",
    65215: "upfront",
    65216: "upgrade",
    65221: "upheaval",
    65222: "upheld",
    65223: "uphill",
    65224: "uphold",
    65225: "uplifted",
    65226: "uplifting",
    65231: "upload",
    65232: "upon",
    65233: "upper",
    65234: "upright",
    65235: "uprising",
    65236: "upriver",
    65241: "uproar",
    65242: "uproot",
    65243: "upscale",
    65244: "upside",
    65245: "upstage",
    65246: "upstairs",
    65251: "upstart",
    65252: "upstate",
    65253: "upstream",
    65254: "upstroke",
    65255: "upswing",
    65256: "uptake",
    65261: "uptight",
    65262: "uptown",
    65263: "upturned",
    65264: "upward",
    65265: "upwind",
    65266: "uranium",
    65311: "urban",
    65312: "urchin",
    65313: "urethane",
    65314: "urgency",
    65315: "urgent",
    65316: "urging",
    65321: "urologist",
    65322: "urology",
    65323: "usable",
    65324: "usage",
    65325: "useable",
    65326: "used",
    65331: "uselessly",
    65332: "user",
    65333: "usher",
    65334: "usual",
    65335: "utensil",
    65336: "utility",
    65341: "utilize",
    65342: "utmost",
    65343: "utopia",
    65344: "utter",
    65345: "vacancy",
    65346: "vacant",
    65351: "vacate",
    65352: "vacation",
    65353: "vagabond",
    65354: "vagrancy",
    65355: "vagrantly",
    65356: "vaguely",
    65361: "vagueness",
    65362: "valiant",
    65363: "valid",
    65364: "valium",
    65365: "valley",
    65366: "valuables",
    65411: "value",
    65412: "vanilla",
    65413: "vanish",
    65414: "vanity",
    65415: "vanquish",
    65416: "vantage",
    65421: "vaporizer",
    65422: "variable",
    65423: "variably",
    65424: "varied",
    65425: "variety",
    65426: "various",
    65431: "varmint",
    65432: "varnish",
    65433: "varsity",
    65434: "varying",
    65435: "vascular",
    65436: "vaseline",
    65441: "vastly",
    65442: "vastness",
    65443: "veal",
    65444: "vegan",
    65445: "veggie",
    65446: "vehicular",
    65451: "velcro",
    65452: "velocity",
    65453: "velvet",
    65454: "vendetta",
    65455: "vending",
    65456: "vendor",
    65461: "veneering",
    65462: "vengeful",
    65463: "venomous",
    65464: "ventricle",
    65465: "venture",
    65466: "venue",
    65511: "venus",
    65512: "verbalize",
    65513: "verbally",
    65514: "verbose",
    65515: "verdict",
    65516: "verify",
    65521: "verse",
    65522: "version",
    65523: "versus",
    65524: "vertebrae",
    65525: "vertical",
    65526: "vertigo",
    65531: "very",
    65532: "vessel",
    65533: "vest",
    65534: "veteran",
    65535: "veto",
    65536: "vexingly",
    65541: "viability",
    65542: "viable",
    65543: "vibes",
    65544: "vice",
    65545: "vicinity",
    65546: "victory",
    65551: "video",
    65552: "viewable",
    65553: "viewer",
    65554: "viewing",
    65555: "viewless",
    65556: "viewpoint",
    65561: "vigorous",
    65562: "village",
    65563: "villain",
    65564: "vindicate",
    65565: "vineyard",
    65566: "vintage",
    65611: "violate",
    65612: "violation",
    65613: "violator",
    65614: "violet",
    65615: "violin",
    65616: "viper",
    65621: "viral",
    65622: "virtual",
    65623: "virtuous",
    65624: "virus",
    65625: "visa",
    65626: "viscosity",
    65631: "viscous",
    65632: "viselike",
    65633: "visible",
    65634: "visibly",
    65635: "vision",
    65636: "visiting",
    65641: "visitor",
    65642: "visor",
    65643: "vista",
    65644: "vitality",
    65645: "vitalize",
    65646: "vitally",
    65651: "vitamins",
    65652: "vivacious",
    65653: "vividly",
    65654: "vividness",
    65655: "vixen",
    65656: "vocalist",
    65661: "vocalize",
    65662: "vocally",
    65663: "vocation",
    65664: "voice",
    65665: "voicing",
    65666: "void",
    66111: "volatile",
    66112: "volley",
    66113: "voltage",
    66114: "volumes",
    66115: "voter",
    66116: "voting",
    66121: "voucher",
    66122: "vowed",
    66123: "vowel",
    66124: "voyage",
    66125: "wackiness",
    66126: "wad",
    66131: "wafer",
    66132: "waffle",
    66133: "waged",
    66134: "wager",
    66135: "wages",
    66136: "waggle",
    66141: "wagon",
    66142: "wake",
    66143: "waking",
    66144: "walk",
    66145: "walmart",
    66146: "walnut",
    66151: "walrus",
    66152: "waltz",
    66153: "wand",
    66154: "wannabe",
    66155: "wanted",
    66156: "wanting",
    66161: "wasabi",
    66162: "washable",
    66163: "washbasin",
    66164: "washboard",
    66165: "washbowl",
    66166: "washcloth",
    66211: "washday",
    66212: "washed",
    66213: "washer",
    66214: "washhouse",
    66215: "washing",
    66216: "washout",
    66221: "washroom",
    66222: "washstand",
    66223: "washtub",
    66224: "wasp",
    66225: "wasting",
    66226: "watch",
    66231: "water",
    66232: "waviness",
    66233: "waving",
    66234: "wavy",
    66235: "whacking",
    66236: "whacky",
    66241: "wham",
    66242: "wharf",
    66243: "wheat",
    66244: "whenever",
    66245: "whiff",
    66246: "whimsical",
    66251: "whinny",
    66252: "whiny",
    66253: "whisking",
    66254: "whoever",
    66255: "whole",
    66256: "whomever",
    66261: "whoopee",
    66262: "whooping",
    66263: "whoops",
    66264: "why",
    66265: "wick",
    66266: "widely",
    66311: "widen",
    66312: "widget",
    66313: "widow",
    66314: "width",
    66315: "wieldable",
    66316: "wielder",
    66321: "wife",
    66322: "wifi",
    66323: "wikipedia",
    66324: "wildcard",
    66325: "wildcat",
    66326: "wilder",
    66331: "wildfire",
    66332: "wildfowl",
    66333: "wildland",
    66334: "wildlife",
    66335: "wildly",
    66336: "wildness",
    66341: "willed",
    66342: "willfully",
    66343: "willing",
    66344: "willow",
    66345: "willpower",
    66346: "wilt",
    66351: "wimp",
    66352: "wince",
    66353: "wincing",
    66354: "wind",
    66355: "wing",
    66356: "winking",
    66361: "winner",
    66362: "winnings",
    66363: "winter",
    66364: "wipe",
    66365: "wired",
    66366: "wireless",
    66411: "wiring",
    66412: "wiry",
    66413: "wisdom",
    66414: "wise",
    66415: "wish",
    66416: "wisplike",
    66421: "wispy",
    66422: "wistful",
    66423: "wizard",
    66424: "wobble",
    66425: "wobbling",
    66426: "wobbly",
    66431: "wok",
    66432: "wolf",
    66433: "wolverine",
    66434: "womanhood",
    66435: "womankind",
    66436: "womanless",
    66441: "womanlike",
    66442: "womanly",
    66443: "womb",
    66444: "woof",
    66445: "wooing",
    66446: "wool",
    66451: "woozy",
    66452: "word",
    66453: "work",
    66454: "worried",
    66455: "worrier",
    66456: "worrisome",
    66461: "worry",
    66462: "worsening",
    66463: "worshiper",
    66464: "worst",
    66465: "wound",
    66466: "woven",
    66511: "wow",
    66512: "wrangle",
    66513: "wrath",
    66514: "wreath",
    66515: "wreckage",
    66516: "wrecker",
    66521: "wrecking",
    66522: "wrench",
    66523: "wriggle",
    66524: "wriggly",
    66525: "wrinkle",
    66526: "wrinkly",
    66531: "wrist",
    66532: "writing",
    66533: "written",
    66534: "wrongdoer",
    66535: "wronged",
    66536: "wrongful",
    66541: "wrongly",
    66542: "wrongness",
    66543: "wrought",
    66544: "xbox",
    66545: "xerox",
    66546: "yahoo",
    66551: "yam",
    66552: "yanking",
    66553: "yapping",
    66554: "yard",
    66555: "yarn",
    66556: "yeah",
    66561: "yearbook",
    66562: "yearling",
    66563: "yearly",
    66564: "yearning",
    66565: "yeast",
    66566: "yelling",
    66611: "yelp",
    66612: "yen",
    66613: "yesterday",
    66614: "yiddish",
    66615: "yield",
    66616: "yin",
    66621: "yippee",
    66622: "yo-yo",
    66623: "yodel",
    66624: "yoga",
    66625: "yogurt",
    66626: "yonder",
    66631: "yoyo",
    66632: "yummy",
    66633: "zap",
    66634: "zealous",
    66635: "zebra",
    66636: "zen",
    66641: "zeppelin",
    66642: "zero",
    66643: "zestfully",
    66644: "zesty",
    66645: "zigzagged",
    66646: "zipfile",
    66651: "zipping",
    66652: "zippy",
    66653: "zips",
    66654: "zit",
    66655: "zodiac",
    66656: "zombie",
    66661: "zone",
    66662: "zoning",
    66663: "zookeeper",
    66664: "zoologist",
    66665: "zoology",
    66666: "zoom"
};

//checking the strength of password
function scorePassword(pass) {
    var score = 0;
    if (! pass) // returns 0 if pass empty
        return score;


    // award every unique letter until 5 repetitions
    var letters = Object();
    for (var i = 0; i < pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }


    // bonus points for mixing it up
    var variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass)
    }


    var variationCount = 0;
    for (var check in variations) {
        variationCount += (variations[check] === true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;


    return parseInt(score);
}


function secureRandom(count) {
    // generate a cryptographically secure integer
   
    var cryptoObj = window.crypto || window.msCrypto
    var rand = new Uint32Array(1)
    var skip = 0x7fffffff - 0x7fffffff % count
    var result


    if (((count - 1) & count) === 0) {
        cryptoObj.getRandomValues(rand)
        return rand[0] & (count - 1)
    }


    do {
        cryptoObj.getRandomValues(rand)
        result = rand[0] & 0x7fffffff
    } while (result >= skip)


    return result % count
}


function getWordNum(length) { // get the random words from the dice ware dict
    var wordslist = []
    for (var i = 0; i < length; i++) {
        var newnum = []
        for (var j = 0; j < 5; j += 1) { // roll a 6 sided die
            newnum.push(secureRandom(6) + 1)
        }
        var theword = eff[newnum.join('')]
        wordslist.push(theword.charAt(0).toUpperCase() + theword.slice(1))
    }
    wordslist.splice(secureRandom(length + 1), 0, '_');
    return wordslist.join('')
}


function randomUsername(length) { // get the random words from the dice ware dict
    var wordslist = []
    for (var i = 0; i < length; i++) {
        var newnum = []
        for (var j = 0; j < 5; j += 1) { // roll a 6 sided die
            newnum.push(secureRandom(6) + 1)
        }
        var theword = eff[newnum.join('')]
        wordslist.push(theword.charAt(0).toUpperCase() + theword.slice(1))
    }
    return wordslist.join('')
}


function randomUID(length) {
    var UIDlist = [];
    for (var i = 0; i < length; i++) {
        UIDlist.push(secureRandom(9));
    }
    return UIDlist.join('')
}




// import  {renderMessage}  from '../utils/message';


//Message from server
// socket.on('message',message => {
//     console.log(message);
//     outputMessage(message)


//     //Scroll down


// })


// function outputMessage(message){
//     const div=document.createElement('div');
//     div.classList.add('my-message', 'message');
//     div.innerHTML= `<div><div class="name">${message.usrname} <span class="msgtime">${message.time}</span></div><div class="text">   ${message.text} </div></div>`;
//     document.querySelector('.messages').appendChild(div);
// }  




// // Javascript implementation of chat application




// //Checking input vars
// var frmres=document.getElementById("usrinp");






var usn,rk,rusn="",rrk="",msgdiv;
window.onload = function(){
    // socket.on('message',message => {
    //     console.log(message);
    //     outputMessage(message)
   
    //     //Scroll down
    msgdiv=document.querySelector('.chatscroll');
    msgdiv.scrollTop=msgdiv.scrollHeight-msgdiv.clientHeight;
    // })
    var username=document.getElementById("username");
    var roomkey=document.getElementById("roomkey");
    // frmres.onclick=function(){
    //     usn=username.value;
    //     rk=roomkey.value;
    // }
    // var username=document.getElementById("username");
    // var roomkey=document.getElementById("roomkey");
    var joinchatroombtn=document.getElementById("joinroom");
    var joinchat = document.getElementById("joinchatscreen");
    var uinp = document.getElementById("usrinp");
    var randomunbut = document.getElementById("generateUNbut");
    var randomrkbut = document.getElementById("generateRKbut");
    randomunbut.addEventListener("mouseup", function()
    {
        rusn = randomUsername(2);
        console.log(rusn);
        //console.log(typeof rrk);
        username.value=rusn;
        username.focus();
    });
    randomunbut.addEventListener("keyup", function(e)
    {
        //alert("Clicked");
        if(e.key==='Enter')
        {
            rusn = randomUsername(2);
            console.log(rusn);
            //console.log(typeof rrk);
            username.value=rusn;
            username.focus(); //remove selection from button
            e.stopPropagation(); //to not trigger Enter on form
        }
    });
    randomrkbut.addEventListener("mouseup", function()
    {
        rrk = getWordNum(6);
        console.log(rrk);
        //console.log(typeof rrk);
        roomkey.value=rrk;
        roomkey.focus();
    });
    randomrkbut.addEventListener("keyup", function(e)
    {
        //alert("Clicked");
        if(e.key==='Enter')
        {
            rrk = getWordNum(6);
            console.log(rrk);
            //console.log(typeof rrk);
            roomkey.value=rrk;
            roomkey.focus(); //remove selection from button
            e.stopPropagation(); //to not trigger Enter on form
        }
    });
    // var frmres=document.getElementById("usrinp");
    uinp.addEventListener("keyup", function(e){
        if (e.key === 'Enter') {
            //console.log("Enter key event");
            joinchatroombtn.click();
        }
    });
    joinchatroombtn.addEventListener("click", function(){
        usn = username.value.trim();
        rk = roomkey.value.trim();
        // if(rrk!="")
        // {
        //     rk=rrk;
        // }
        // else{
        //     rk = roomkey.value.trim();
        // }
        // console.log(rk);
        // console.log(typeof rk);
        // console.log(typeof usn);
        if (usn.length==0){
            alert("Please enter a valid username")
            return;
        }
        if (rk.length==0){
            alert("Please enter a valid room key")
            return;
        }
        // Join Room
        // socket.emit('joinRoom', {usn, rk});
        var exitBtnRoom=document.getElementById("extbutn");
        //var sendmsgbtn=document.getElementById("send-msg");
        var emojibtn=document.getElementById("button-emoji");
        var inpmsg=document.getElementById("msg-input");
        var attachfiles=document.getElementById("attach-file");
        var chatscreen = document.getElementById("chatscrn");
        var roomkeydisplay = document.getElementById("display-rk");
        var msgf=document.getElementById("msgform");
       
        joinchat.classList.remove("active");
        chatscreen.classList.add("active");
        var cred={usnm: usn, rmk: rk};
        socket.emit('joinRoom', cred);
        // console.log(usn, rk);
        roomkeydisplay.innerHTML = "Room Key: "+"<span class='blurry-text' id='roomk'>"+rk+"</span>"+" <button class='copbutton' id='cpbtn'><i class='fas fa-copy'></i></button>";
        var blurtext = document.getElementById("roomk");
        blurtext.addEventListener("mouseover", function(){
            blurtext.classList.remove("blurry-text");
        })
        blurtext.addEventListener("mouseout", function(){
            blurtext.classList.add("blurry-text");
       
        })
        // Adding the copy to clipboard functionality
        var copybtn=document.getElementById("cpbtn");
        copybtn.onclick=function(){
            // roomkey.select();
            // roomkey.setSelectionRange(0,99999);
            navigator.clipboard.writeText(rk);
            alert("Copied!");
        }
        var keyMatrix;
        keyMatrix = new Array(3);
        for(let i=0;i<3;i++)
        {
            keyMatrix[i]=new Array(3);
            for(let j=0;j<3;j++)
                keyMatrix[i][j]=0;
        }
        function getKeyMatrix(key,keyMatrix)
        {
            let k = 0;
            for (let i = 0; i < 3; i++)
            {
                for (let j = 0; j < 3; j++)
                {
                    keyMatrix[i][j] = (key[k]).charCodeAt(0);
                    k++;
                }
            }
        }


        var invmatrix = Array(3);
        for(let i=0;i<3;i++)
            invmatrix[i] = Array(3).fill(0);
        var invertible = false;
        var start=0;
        while((!invertible)&&((start+9)<=(rk.length)))
        {
            var counter = 0;
            var hckey = rk.slice(start,start+9);
            console.log("Key selected for hill cipher: "+hckey);
            getKeyMatrix(hckey, keyMatrix);
            invertible = checkInvertibility(keyMatrix,counter);
            start++;
        }
        if(!invertible)
        {
            hckey="GYBNQKURP";
            getKeyMatrix(hckey, keyMatrix);
        }
        if(invertible)
        {
            inverse(keyMatrix);
        }
        var det;
        var inv=false;
        function checkInvertibility(matrix,counter)
        {


            //calculating determinant of matrix
            var d1 = matrix[1][1]*matrix[2][2]-matrix[1][2]*matrix[2][1];
            var d2 = matrix[1][0]*matrix[2][2]-matrix[1][2]*matrix[2][0];
            var d3 = matrix[1][0]*matrix[2][1]-matrix[1][1]*matrix[2][0];
            var a = matrix[0][0];
            var b = matrix[0][1];
            var c = matrix[0][2];
            det = a*d1 - b*d2 + c*d3;


            if(det!=0)
            {
                keyMatrix = matrix;
                return true;
            }else{
                if(counter<1)
                {
                    matrix[2][2]+=1;
                    //keyMatrix[2][2]+=1;
                    counter+=1;
                    inv = checkInvertibility(matrix,counter);
                    return inv;
                }
                else
                    return false;
            }


        }


        function inverse(matrix)
        {
            function transpose(A , B) {
                var i, j;
                for (i = 0; i < 3; i++)
                    for (j = 0; j < 3; j++)
                        B[i][j] = A[j][i];
            }


            var tmatrix = Array(3);


            for(let i=0;i<3;i++)
                tmatrix[i] = Array(3).fill(0);


            transpose(matrix, tmatrix);


            var det9 = tmatrix[0][0]*tmatrix[1][1]-tmatrix[0][1]*tmatrix[1][0];
            var det7 = tmatrix[0][1]*tmatrix[1][2]-tmatrix[0][2]*tmatrix[1][1];
            var det8 = tmatrix[0][0]*tmatrix[1][2]-tmatrix[0][2]*tmatrix[1][0];
            var det3 = tmatrix[1][0]*tmatrix[2][1]-tmatrix[1][1]*tmatrix[2][0];
            var det1 = tmatrix[1][1]*tmatrix[2][2]-tmatrix[1][2]*tmatrix[2][1];
            var det2 = tmatrix[1][0]*tmatrix[2][2]-tmatrix[1][2]*tmatrix[2][0];
            var det6 = tmatrix[0][0]*tmatrix[2][1]-tmatrix[0][1]*tmatrix[2][0];
            var det4 = tmatrix[0][1]*tmatrix[2][2]-tmatrix[0][2]*tmatrix[2][1];
            var det5 = tmatrix[0][0]*tmatrix[2][2]-tmatrix[0][2]*tmatrix[2][0];


            var adj = Array(3); //adjoint matrix
            for(let i=0;i<3;i++)
                adj[i] = Array(3).fill(0);


            adj[0][0]=det1;
            adj[0][1]=-det2;
            adj[0][2]=det3;
            adj[1][0]=-det4;
            adj[1][1]=det5;
            adj[1][2]=-det6;
            adj[2][0]=det7;
            adj[2][1]=-det8;
            adj[2][2]=det9;


            for(let i=0; i<3; i++)
            {
                for(let j=0;j<3;j++)
                {
                    invmatrix[i][j]=adj[i][j]/Math.abs(det);
                }
            }
            console.log("Inverse matrix:");
            for(let i=0; i<3; i++)
            {
                for(let j=0;j<3;j++)
                {
                    console.log(invmatrix[i][j]);
                }
            }
        }


        var file;
        var fileSelected = false;
        attachfiles.addEventListener("change",(e)=>{
            file=e.target.files[0];
            // if(!file){
            //     return;
            // }
            inpmsg.value="Attached: "+file.name;
            inpmsg.readOnly = true;
            fileSelected=true;
            // let reader=new FileReader();
            // reader.onload=function(e){
            //     let buffer = new Uint8Array(reader.result);
            //     let el =document.createElement("div");
            //     el.classList.add("progressdiv");
            //     el.innerHTML=  `
            //     <div class="progress">0%</div>
            //     <div class="filename>${file.name}</div>
            //     `;
            //     // shareFile({
            //     //     filename:file.name,
            //     //     total_buffer_size:buffer.length,
            //     //     buffer_size:1024
            //     // },buffer,el.querySelector(".progress"));
            // }
            // reader.readAsArrayBuffer(file);
        });
   
        //Reading message from the user and displaying it
        msgf.addEventListener('submit', function(e){
            e.preventDefault();
            var getval=new Date;
            //formatting time as hh:mm
            var hrs=getval.getHours();
            if(hrs<10)
                hrs="0"+hrs;
            var mins=getval.getMinutes();
            if(mins<10)
                mins="0"+mins;
            var time=hrs + ":" + mins;


            if(fileSelected)
            {
                let reader=new FileReader();
                reader.onload=function(e){
                    //let buffer = new Uint8Array(reader.result);
                    let buffer = Buffer.from(new Uint8Array(reader.result));
                    // //buffer=reader.result.replace(/^data:.+;base64,/, '');
                    //console.log("Type of buffer: "+typeof buffer);
                    //console.log(buffer);
                    buffer = compressString(buffer);
                    // console.log(buffer.length);
                    //let buffer=reader.result.replace(/^data:.+;base64,/, '');
                    //console.log(buffer);
                    //console.log(buffer.length);
                    console.log("File type: "+file.type);
                    buffer = crypt.encryptMessage(buffer, rk, keyMatrix);
                    console.log("Encrypted file content: "+buffer);
                    //var encodedData = retrieveB64FromBlob(reader.result);
                    // console.log("Encoded data: ");
                    //console.log(encodedData);
                    // let el =document.createElement("div");
                    // el.classList.add("progressdiv");
                    inpmsg.value = "0% sent :- "+file.name;
                    // el.innerHTML= `
                    // <div class="progress">0%</div>
                    // <div class="filename">${file.name}</div>
                    // `;


                    //shareFile(type,metadata,buffer,progressnode)
                    // var msg=file.name;
                    // renderMessage("my",{
                    //     username: usn,
                    //     text: msg,
                    //     time: time
                    // });


                    shareFile({
                        usender:usn,
                        time:time,
                        filename:file.name,
                        filetype:file.type,
                        total_buffer_size:buffer.length,
                        buffer_size:102400
                    },buffer);
                    //},buffer,inpmsg.querySelector(".progress"));
                }
                reader.readAsArrayBuffer(file);
                //reader.readAsDataURL(file);
                inpmsg.readOnly = false;
                fileSelected=false;
                msgf.reset();
            }
            else{
                var msg=inpmsg.value;
                msg = msg.trim();
                if(msg!=""){
                    //Emit a message to a server
                   
                    var encryptedmsg = crypt.encryptMessage(msg, rk, keyMatrix);
                    console.log("Encrypted message: "+encryptedmsg);
                    renderMessage("my",{
                        username: usn,
                        text: msg,
                        time: time
                    });


                    // shareFile({
                    //     filename:file.name,
                    //     total_buffer_size:buffer.length,
                    //     buffer_size:1024
                    // },buffer,el.querySelector(".progress"));


                    socket.emit('chat',{
                        username: usn,
                        text: encryptedmsg,
                        time: time
                    });
                    msgf.reset();
                    // e.target.elements.
                }
            }


        });
        function renderMessage(type,message){
            if (type=="my"){
                const div=document.createElement('div');
                div.classList.add('my-message', 'message');
                div.innerHTML= `<div><div class="name">${message.username} <span class="msgtime">${message.time}</span></div><div class="text">   ${message.text} </div></div>`;
                document.querySelector('.messages').appendChild(div);
            } else if (type=="other"){
                const div=document.createElement('div');
                div.classList.add('other-message', 'message');
                div.innerHTML= `<div><div class="name">${message.username} <span class="msgtime">${message.time}</span></div><div class="text">   ${message.text} </div></div>`;
                document.querySelector('.messages').appendChild(div);


            } else if(type=="update"){
                const div=document.createElement('div');
                div.classList.add('update');
                div.innerText=message;
                // div.innerHTML= `<div><div class="name">${message.usrname} <span class="msgtime">${message.time}</span></div><div class="text">   ${message.text} </div></div>`;
                document.querySelector('.messages').appendChild(div);
            }
        }


        socket.on('update',function(update){
            renderMessage("update",update)
        });


        socket.on("chat",function(message){
            message.text = crypt.decryptMessage(message.text, rk, invmatrix);
            renderMessage("other",message);
        });


        // socket.on("fs-show",function(message){
        //     renderMessage("other",message);
        //     console.log("From fs-show");
        //     fileShare={};
        // });




        // async function url2Blob(url){
        //     return await (await fetch(url)).blob()
        // }


        var fileShare={};
        socket.on("fs-meta",function(metadata){
            fileShare.metadata=metadata.meta;
            fileShare.transmitted=0;
            fileShare.sender=metadata.senderid;
            fileShare.buffer="";
            socket.emit("fs-start",
            {
                sender:metadata.senderid
            })
        });


        socket.on("fs-share-r",async function(buffer){
            //fileShare.buffer.push(buffer);
            fileShare.buffer+=buffer;
            fileShare.transmitted += buffer.length;
            console.log(fileShare.transmitted);
            if(fileShare.transmitted==fileShare.metadata.total_buffer_size){
                console.log("Receiver received the complete file");
                var getval=new Date;
                var hrs=getval.getHours();
                if(hrs<10)
                    hrs="0"+hrs;
                var mins=getval.getMinutes();
                if(mins<10)
                    mins="0"+mins;
                var time=hrs + ":" + mins;
                // socket.emit("fs-rcomplete",
                // {
                //     sender:fileShare.sender,
                //     metadata:fileShare.metadata
                // }
                renderMessage("other",
                {
                    username: fileShare.metadata.usender,
                    text: fileShare.metadata.filename,
                    time: time
                });
                fileShare.buffer=crypt.decryptMessage(fileShare.buffer, rk, invmatrix);
                fileShare.buffer=decompressString(fileShare.buffer);
                let blob = new Blob([fileShare.buffer],{type:fileShare.metadata.filetype});
                //fileShare.buffer = "data:"+fileShare.metadata.filetype+";base64,"+fileShare.buffer;
                //let blob = await url2Blob(fileShare.buffer);
                //const blob = b64toBlob(atob(fileShare.buffer), fileShare.metadata.filetype);
                //saveFile(new Blob(fileShare.buffer), fileShare.metadata.filename);
                saveFile(blob, fileShare.metadata.filename);
                fileShare={}
            }else{
                socket.emit("fs-start", {
                    sender:fileShare.sender
                })
            }
        });




        exitBtnRoom.addEventListener('click',function(){
            socket.emit('exituser',usn);
            window.location.href=window.location.href;
        });


        function saveFile(blob, filename) {
            if (window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(blob, filename);
            } else {
              const a = document.createElement('a');
              document.body.appendChild(a);
              const url = window.URL.createObjectURL(blob);
              a.href = url;
              a.download = filename;
              a.click();
              setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              }, 0)
            }
          }


        //function shareFile(metadata,buffer,progress_node){
        function shareFile(metadata,buffer){


            socket.emit("file-meta",{
                metadata:metadata
            });
            socket.on("fs-share-s",function(receiver){
                let chunk=buffer.slice(0,metadata.buffer_size);
                buffer=buffer.slice(metadata.buffer_size,buffer.length);
                //progress_node.innerText=Math.trunc((metadata.total_buffer_size-buffer.length)/(metadata.total_buffer_size)*100+"%");
                inpmsg.value=Math.trunc((metadata.total_buffer_size-buffer.length)/(metadata.total_buffer_size)*100)+"% sent :- "+metadata.filename;
                if(chunk.length!=0){
                    //displaying message when last buffer sent
                    if(chunk.length<metadata.buffer_size)
                    {
                        inpmsg.value="100% sent :- "+metadata.filename;
                        let msg = metadata.filename;
                        inpmsg.value="";
                        renderMessage("my",{
                            username: usn,
                            text: msg,
                            time: metadata.time
                        });
                    }
                    socket.emit("file-raw",{
                        receiver:receiver.receiverid,
                        buffer:chunk
                    });
                }
            });
        }
    });
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"./comp.js":64,"./encryption.js":65,"buffer":10}]},{},[66]);
