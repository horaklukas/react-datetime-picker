!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.DateTimePicker=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function () {
  function Calendar (date) {
    // a custom 'today' date can be injected
    this.now = date || new Date();
  }

  Calendar.prototype.monthCalendar = function(date, options, action) {
    if (options) {
      options.view = 'month';
    } else {
      options = { view: 'month' };
    }
    return this.createCalendar(date, options, action);
  };

  Calendar.prototype.weeksCalendar = function(date, options, action) {
    if (options) {
      options.view = 'weeks';
    } else {
      options = { view: 'weeks' };
    }
    return this.createCalendar(date, options, action);
  };

  Calendar.prototype.createCalendar = function (dateObj, options, action) {
    var date = dateObj || this.now;
    options.view = options.view || 'month';
    var cYear = date.getFullYear();
    var cMonth = date.getMonth();
    var cDate = date.getDate();
    var cWeekStart = (options.weekStart === 0) ? 0 : options.weekStart || 1; // week starts on monday by default, sunday: 0
    // TODO: switch
    var cWeeks, firstDayOfView, firstDayOffset;
    // --- monthCalendar ---
    if (options.view === 'month') {
      var firstDayOfMonth = new Date(cYear, cMonth, 1).getDay(); // weekday of first month
      var lastDateOfMonth = new Date(cYear, cMonth+1, 0).getDate(); // number of days in current month
      firstDayOffset = cWeekStart > firstDayOfMonth ? cWeekStart-7 : cWeekStart; // set offset for first day of view
      firstDayOfView =  new Date(cYear, cMonth, firstDayOffset-firstDayOfMonth+1); //  first day in first row
      // calculate rows of view
      // TODO: simplify!
      if(firstDayOfView.getDate() === 1) {
        // Month starts at row 1 in column 1
        cWeeks = Math.ceil(lastDateOfMonth / 7);
      } else {
        var lastDateOfLastMonth = new Date(cYear, cMonth, 0).getDate();
        var additionalDays = lastDateOfLastMonth - firstDayOfView.getDate() + 1;
        cWeeks = Math.ceil((lastDateOfMonth + additionalDays) / 7);
      }
    // --- weeksCalendar ---
    } else if (options.view === 'weeks') {
      cWeeks = options.weeks || 4; // show 4 weeks by default
      firstDayOfView = new Date(cYear, cMonth, cDate);
      firstDayOffset = cWeekStart > firstDayOfView.getDay() ? cWeekStart-7 : cWeekStart;
      firstDayOfView.setDate(cDate - firstDayOfView.getDay() + parseInt(firstDayOffset, 10));
    }

    var currentDate = firstDayOfView;
    var cal = [];

    // create calendar model
    for (var week = 0; week < cWeeks; week++) {
      cal[week] = [];
      for (var day = 0; day < 7; day++) {
        // determine exposed parameters
        var today = (this.now.getFullYear() === currentDate.getFullYear() &&
                    this.now.getMonth() === currentDate.getMonth() &&
                    this.now.getDate() === currentDate.getDate());

        // implementation of already past days
        var pastDay = (currentDate.valueOf() < this.now.valueOf() && !today);

        var thisMonth = (cMonth === currentDate.getMonth());

        // TODO: thisWeek?

        var contents = {
          date: currentDate,
          isInCurrentMonth: thisMonth,
          isToday: today,
          isPastDate: pastDay
        };

        // if action is defined results of the action function are pushed into the calendar array
        if ('function' === typeof action) {
          contents.entries = action(currentDate, thisMonth, today, pastDay) || [];
        }
        
        cal[week].push(contents);
        
        // increment day
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()+1);
      }
    }

    function populate(fn) {
      for (var i = cal.length - 1; i >= 0; i--) {
        for (var j = cal[i].length - 1; j >= 0; j--) {
          cal[i][j].entries = fn(cal[i][j].date, cal[i][j].isInCurrentMonth, cal[i][j].isToday, cal[i][j].isPastDate);
        }
      }
    }

    return {
      calendar: cal,
      populate: populate
    };

  };

  // for node.js
  if (typeof(module) !== 'undefined') {
    module.exports = Calendar;
  } else {
    window.Calendar = Calendar;
  }
})();
},{}],2:[function(_dereq_,module,exports){

var synth = _dereq_('synthetic-dom-events');

var on = function(element, name, fn, capture) {
    return element.addEventListener(name, fn, capture || false);
};

var off = function(element, name, fn, capture) {
    return element.removeEventListener(name, fn, capture || false);
};

var once = function (element, name, fn, capture) {
    function tmp (ev) {
        off(element, name, tmp, capture);
        fn(ev);
    }
    on(element, name, tmp, capture);
};

var emit = function(element, name, opt) {
    var ev = synth(name, opt);
    element.dispatchEvent(ev);
};

if (!document.addEventListener) {
    on = function(element, name, fn) {
        return element.attachEvent('on' + name, fn);
    };
}

if (!document.removeEventListener) {
    off = function(element, name, fn) {
        return element.detachEvent('on' + name, fn);
    };
}

if (!document.dispatchEvent) {
    emit = function(element, name, opt) {
        var ev = synth(name, opt);
        return element.fireEvent('on' + ev.type, ev);
    };
}

module.exports = {
    on: on,
    off: off,
    once: once,
    emit: emit
};

},{"synthetic-dom-events":3}],3:[function(_dereq_,module,exports){

// for compression
var win = window;
var doc = document || {};
var root = doc.documentElement || {};

// detect if we need to use firefox KeyEvents vs KeyboardEvents
var use_key_event = true;
try {
    doc.createEvent('KeyEvents');
}
catch (err) {
    use_key_event = false;
}

// Workaround for https://bugs.webkit.org/show_bug.cgi?id=16735
function check_kb(ev, opts) {
    if (ev.ctrlKey != (opts.ctrlKey || false) ||
        ev.altKey != (opts.altKey || false) ||
        ev.shiftKey != (opts.shiftKey || false) ||
        ev.metaKey != (opts.metaKey || false) ||
        ev.keyCode != (opts.keyCode || 0) ||
        ev.charCode != (opts.charCode || 0)) {

        ev = document.createEvent('Event');
        ev.initEvent(opts.type, opts.bubbles, opts.cancelable);
        ev.ctrlKey  = opts.ctrlKey || false;
        ev.altKey   = opts.altKey || false;
        ev.shiftKey = opts.shiftKey || false;
        ev.metaKey  = opts.metaKey || false;
        ev.keyCode  = opts.keyCode || 0;
        ev.charCode = opts.charCode || 0;
    }

    return ev;
}

// modern browsers, do a proper dispatchEvent()
var modern = function(type, opts) {
    opts = opts || {};

    // which init fn do we use
    var family = typeOf(type);
    var init_fam = family;
    if (family === 'KeyboardEvent' && use_key_event) {
        family = 'KeyEvents';
        init_fam = 'KeyEvent';
    }

    var ev = doc.createEvent(family);
    var init_fn = 'init' + init_fam;
    var init = typeof ev[init_fn] === 'function' ? init_fn : 'initEvent';

    var sig = initSignatures[init];
    var args = [];
    var used = {};

    opts.type = type;
    for (var i = 0; i < sig.length; ++i) {
        var key = sig[i];
        var val = opts[key];
        // if no user specified value, then use event default
        if (val === undefined) {
            val = ev[key];
        }
        used[key] = true;
        args.push(val);
    }
    ev[init].apply(ev, args);

    // webkit key event issue workaround
    if (family === 'KeyboardEvent') {
        ev = check_kb(ev, opts);
    }

    // attach remaining unused options to the object
    for (var key in opts) {
        if (!used[key]) {
            ev[key] = opts[key];
        }
    }

    return ev;
};

var legacy = function (type, opts) {
    opts = opts || {};
    var ev = doc.createEventObject();

    ev.type = type;
    for (var key in opts) {
        if (opts[key] !== undefined) {
            ev[key] = opts[key];
        }
    }

    return ev;
};

// expose either the modern version of event generation or legacy
// depending on what we support
// avoids if statements in the code later
module.exports = doc.createEvent ? modern : legacy;

var initSignatures = _dereq_('./init.json');
var types = _dereq_('./types.json');
var typeOf = (function () {
    var typs = {};
    for (var key in types) {
        var ts = types[key];
        for (var i = 0; i < ts.length; i++) {
            typs[ts[i]] = key;
        }
    }

    return function (name) {
        return typs[name] || 'Event';
    };
})();

},{"./init.json":4,"./types.json":5}],4:[function(_dereq_,module,exports){
module.exports={
  "initEvent" : [
    "type",
    "bubbles",
    "cancelable"
  ],
  "initUIEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "detail"
  ],
  "initMouseEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "detail",
    "screenX",
    "screenY",
    "clientX",
    "clientY",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "button",
    "relatedTarget"
  ],
  "initMutationEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "relatedNode",
    "prevValue",
    "newValue",
    "attrName",
    "attrChange"
  ],
  "initKeyboardEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "keyCode",
    "charCode"
  ],
  "initKeyEvent" : [
    "type",
    "bubbles",
    "cancelable",
    "view",
    "ctrlKey",
    "altKey",
    "shiftKey",
    "metaKey",
    "keyCode",
    "charCode"
  ]
}

},{}],5:[function(_dereq_,module,exports){
module.exports={
  "MouseEvent" : [
    "click",
    "mousedown",
    "mouseup",
    "mouseover",
    "mousemove",
    "mouseout"
  ],
  "KeyboardEvent" : [
    "keydown",
    "keyup",
    "keypress"
  ],
  "MutationEvent" : [
    "DOMSubtreeModified",
    "DOMNodeInserted",
    "DOMNodeRemoved",
    "DOMNodeRemovedFromDocument",
    "DOMNodeInsertedIntoDocument",
    "DOMAttrModified",
    "DOMCharacterDataModified"
  ],
  "HTMLEvents" : [
    "load",
    "unload",
    "abort",
    "error",
    "select",
    "change",
    "submit",
    "reset",
    "focus",
    "blur",
    "resize",
    "scroll"
  ],
  "UIEvent" : [
    "DOMFocusIn",
    "DOMFocusOut",
    "DOMActivate"
  ]
}

},{}],6:[function(_dereq_,module,exports){
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

},{}],7:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],8:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],9:[function(_dereq_,module,exports){
(function (process,global){
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

exports.isBuffer = _dereq_('./support/isBuffer');

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
exports.inherits = _dereq_('inherits');

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

}).call(this,_dereq_("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":8,"inherits":6,"oMfpAn":7}],10:[function(_dereq_,module,exports){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule cx
 */

/**
 * This function is used to mark string literals representing CSS class names
 * so that they can be transformed statically. This allows for modularization
 * and minification of CSS class names.
 *
 * In static_upstream, this function is actually implemented, but it should
 * eventually be replaced with something more descriptive, and the transform
 * that is used in the main stack should be ported for use elsewhere.
 *
 * @param string|object className to modularize, or an object of key/values.
 *                      In the object case, the values are conditions that
 *                      determine if the className keys should be included.
 * @param [string ...]  Variable list of classNames in the string case.
 * @return string       Renderable space-separated CSS className.
 */
function cx(classNames) {
  if (typeof classNames == 'object') {
    return Object.keys(classNames).filter(function(className) {
      return classNames[className];
    }).join(' ');
  } else {
    return Array.prototype.join.call(arguments, ' ');
  }
}

module.exports = cx;

},{}],11:[function(_dereq_,module,exports){
var classSet;

classSet = _dereq_('react/lib/cx');

module.exports = React.createClass({
  handleDayClick: function(e) {
    if (this.props.disabled || !this.props.day.isInCurrentMonth) {
      return e.preventDefault();
    }
    return this.props.onDaySelect(this.props.day.date.getDate());
  },
  render: function() {
    var classes, day, idx, text;
    idx = this.props.index;
    day = this.props.day;
    text = day.isInCurrentMonth ? day.date.getDate() : '&nbsp;';
    classes = classSet({
      'day': day.isInCurrentMonth,
      'emptycell': !day.isInCurrentMonth,
      'weekend': idx === 5 || idx === 6,
      'selected': this.props.selected,
      'today': day.isToday,
      'highlightable': !this.props.disabled,
      'disabled': this.props.disabled
    });
    return React.createElement(React.DOM.td, {
      "className": classes,
      "dangerouslySetInnerHTML": {
        __html: text
      },
      "onClick": this.handleDayClick
    });
  }
});

},{"react/lib/cx":10}],12:[function(_dereq_,module,exports){
var Calendar, CalendarDay, classSet, util,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

classSet = _dereq_('react/lib/cx');

Calendar = _dereq_('calendar.js');

util = _dereq_('util');

CalendarDay = _dereq_('./calendar-day');

module.exports = React.createClass({
  _cal: new Calendar(),

  /**
  * Handle navigation button click
  * @param {string} type Navigation button type, one of 4 strings: ly = less
  *  year, lm = less month, gm = greater year, gy = greater year
   */
  handleNavig: function(type) {
    var month, year;
    month = null;
    year = null;
    switch (type) {
      case 'ly':
        year = this.props.date.getFullYear() - 1;
        break;
      case 'lm':
        month = this.props.date.getMonth() - 1;
        if (month < 0 && __indexOf.call(this.props.disabled, 'y') >= 0) {
          month = 11;
        }
        break;
      case 'gm':
        month = this.props.date.getMonth() + 1;
        if (month > 11 && __indexOf.call(this.props.disabled, 'y') >= 0) {
          month = 0;
        }
        break;
      case 'gy':
        year = this.props.date.getFullYear() + 1;
    }
    return this.props.onMonthYearChange(month, year);
  },
  createDay: function(day, idx) {
    var disabled, selected;
    selected = day.isInCurrentMonth && this.props.date.getDate() === day.date.getDate();
    disabled = __indexOf.call(this.props.disabled, 'd') >= 0;
    return React.createElement(CalendarDay, {
      "day": day,
      "index": idx,
      "key": idx,
      "selected": selected,
      "disabled": disabled,
      "onDaySelect": this.props.onDaySelect
    });
  },

  /**
  * @param {Array.<Object>} week List of days at week
  * @param {number} idx Index of week at list of weeks of actual month
   */
  createWeek: function(week, idx) {
    var days, rowClass;
    if (week.length) {
      days = week.map(this.createDay);
    } else {
      days = React.createElement(React.DOM.td, {
        "className": "emptycell",
        "colSpan": 7.
      }, "\u00a0");
    }
    rowClass = util.isArray(days) ? 'daysrow' : 'emptyrow';
    return React.createElement(React.DOM.tr, {
      "className": rowClass,
      "key": idx
    }, days);
  },

  /**
  * @param {number} order Order of day at week, Monday is 0, Tuesday 1, etc.
   */
  createDayTitle: function(order) {
    var classes, name;
    name = trl("gui.datetime.daynames." + order);
    classes = classSet({
      'day': true,
      'name': true,
      'weekend': order === 5 || order === 6
    });
    return React.createElement(React.DOM.td, {
      "className": classes,
      "key": order
    }, name);
  },
  render: function() {
    var daynames, monthCalendar, monthsDisabled, stylesLeftBtns, stylesRightBtns, yearsDisabled;
    daynames = [0, 1, 2, 3, 4, 5, 6].map(this.createDayTitle);
    monthCalendar = this._cal.monthCalendar(this.props.date);
    stylesLeftBtns = {
      'float': 'left'
    };
    stylesRightBtns = {
      'float': 'right'
    };
    yearsDisabled = __indexOf.call(this.props.disabled, 'y') >= 0;
    monthsDisabled = __indexOf.call(this.props.disabled, 'm') >= 0;
    while (monthCalendar.calendar.length < 6) {
      monthCalendar.calendar.push([]);
    }
    return React.createElement(React.DOM.div, null, React.createElement(React.DOM.div, {
      "className": "nav-buttons"
    }, React.createElement(React.DOM.div, {
      "className": "left"
    }, React.createElement(React.DOM.button, {
      "disabled": yearsDisabled,
      "onClick": this.handleNavig.bind(this, 'ly')
    }, "\x3C\x3C"), React.createElement(React.DOM.button, {
      "disabled": monthsDisabled,
      "onClick": this.handleNavig.bind(this, 'lm')
    }, "\x3C")), React.createElement(React.DOM.div, {
      "className": "right"
    }, React.createElement(React.DOM.button, {
      "disabled": monthsDisabled,
      "onClick": this.handleNavig.bind(this, 'gm')
    }, "\x3E"), React.createElement(React.DOM.button, {
      "disabled": yearsDisabled,
      "onClick": this.handleNavig.bind(this, 'gy')
    }, "\x3E\x3E"))), React.createElement(React.DOM.table, null, React.createElement(React.DOM.thead, null, React.createElement(React.DOM.tr, {
      "className": "daynames"
    }, daynames)), React.createElement(React.DOM.tbody, null, monthCalendar.calendar.map(this.createWeek))));
  }
});

},{"./calendar-day":11,"calendar.js":1,"react/lib/cx":10,"util":9}],13:[function(_dereq_,module,exports){
var FullCalendar, TimePicker;

FullCalendar = _dereq_('./calendar');

TimePicker = _dereq_('./time-picker');

module.exports = React.createClass({

  /**
  * @param {Object.<string, number>} position
  * @param {Date=} date Date to set as default, if null then `now` date will be
  *  used
  * @param {Array.<string>} disabled List of fields disabled for change. Can
  *  contain one  or more of key chars: `y` = years, `m` = months, `d` = days,
  *  `h` = hours, `i` = minutes, `s` = seconds
   */

  /*
  show: (position, date = new Date, disabled = [], confirmCb = ->) ->
    @setState {
      visible: true
      position: position
      actualDate: date
      disabled: disabled
    }
  
    @setProps confirmCb: confirmCb
  
  hide: ->
    @setState visible: false
   */

  /**
  * Invoked when day at calendar is selected
  *
  * @param {number} day Which day was selected
   */
  handleDateChange: function(day, month, year) {
    var nextDate;
    nextDate = this.state.actualDate;
    if (day != null) {
      nextDate.setDate(day);
    }
    if (month != null) {
      nextDate.setMonth(month);
    }
    if (year != null) {
      nextDate.setFullYear(year);
    }
    return this.setState({
      actualDate: nextDate
    });
  },

  /**
  *
  * @param {string} type
  * @param {number} value
   */
  handleTimeChange: function(type, value) {
    var nextDate;
    nextDate = this.state.actualDate;
    switch (type) {
      case 'hour':
        nextDate.setHours(value);
        break;
      case 'minute':
        nextDate.setMinutes(value);
        break;
      case 'second':
        nextDate.setSeconds(value);
    }
    return this.setState(nextDate);
  },
  handleConfirm: function() {
    if (this.props.confirmCb != null) {
      this.props.confirmCb(this.state.actualDate);
    }
    return this.hide();
  },
  getInitialState: function() {
    return {
      visible: true,
      position: {
        x: 0,
        y: 0
      },
      actualDate: new Date,
      disabled: []
    };
  },
  render: function() {
    var actualDate, calendarStyles, containerStyles, hours, mins, month, secs, year;
    actualDate = this.state.actualDate;
    month = trl("gui.datetime.months." + (this.state.actualDate.getMonth()));
    year = actualDate.getFullYear().toString();
    hours = actualDate.getHours();
    mins = actualDate.getMinutes();
    secs = actualDate.getSeconds();
    containerStyles = {
      display: this.state.visible ? 'block' : 'none'
    };
    calendarStyles = {};
    if (this.state.visible) {
      calendarStyles = {
        left: this.state.position.x,
        top: this.state.position.y
      };
    }
    return React.createElement(React.DOM.div, {
      "style": containerStyles
    }, React.createElement(React.DOM.div, {
      "className": "overlay",
      "onClick": this.hide
    }), React.createElement(React.DOM.div, {
      "className": "calendar",
      "style": calendarStyles
    }, React.createElement(React.DOM.div, {
      "className": "head"
    }, React.createElement(React.DOM.span, {
      "className": "title"
    }, month, " - ", year), React.createElement(React.DOM.span, {
      "className": "closer",
      "onClick": this.hide
    }, "x")), React.createElement(FullCalendar, {
      "date": this.state.actualDate,
      "disabled": this.state.disabled,
      "onDaySelect": this.handleDateChange,
      "onMonthYearChange": this.handleDateChange.bind(this, null)
    }), React.createElement(TimePicker, {
      "hours": hours,
      "mins": mins,
      "secs": secs,
      "disabled": this.state.disabled,
      "onTimeChange": this.handleTimeChange
    }), React.createElement(React.DOM.button, {
      "className": "confirm",
      "onClick": this.handleConfirm
    }, trl('gui.datetime.confirmbtn'))));
  }
});

},{"./calendar":12,"./time-picker":15}],14:[function(_dereq_,module,exports){
var TimeCell, classSet, domEvents;

classSet = _dereq_('react/lib/cx');

domEvents = _dereq_('dom-events');

module.exports = TimeCell = React.createClass({
  statics: {
    delayBeforeStart: 1000,
    incrementSpeed: 100
  },
  _startTimer: null,
  _incrementTimer: null,
  handleMouseDown: function(e) {
    this.setState({
      active: true
    });
    domEvents.once(document, 'mouseup', this.handleMouseUp);
    return this._startTimer = setTimeout(this.startIncrementing, TimeCell.delayBeforeStart);
  },
  clearStartTimer: function() {
    clearTimeout(this._startTimer);
    return this._startTimer = null;
  },
  startIncrementing: function() {
    this.clearStartTimer();
    return this._incrementTimer = setInterval(this.incrementValue, TimeCell.incrementSpeed);
  },
  handleMouseUp: function() {
    if (this._startTimer != null) {
      this.clearStartTimer();
    } else if (this._incrementTimer != null) {
      clearInterval(this._incrementTimer);
      this._incrementTimer = null;
    }
    return this.setState({
      active: false
    });
  },
  incrementValue: function(e) {
    var value;
    value = this.state.value + 1;
    if (value > this.props.maxVal) {
      value = 0;
    }
    return this.props.onChange(this.props.type, value);
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.value != null) {
      return this.setState({
        value: nextProps.value
      });
    }
  },
  getInitialState: function() {
    return {
      value: this.props.value,
      active: false
    };
  },
  render: function() {
    var classes, clickCb, mouseDownCb, value;
    classes = classSet({
      'value': true,
      'disabled': this.props.disabled,
      'highlightable': !this.props.disabled,
      'active': this.state.active
    });
    value = this.state.value.toString();
    if (value.length === 1) {
      value = "0" + value;
    }
    if (!this.props.disabled) {
      clickCb = this.incrementValue;
      mouseDownCb = this.handleMouseDown;
    }
    return React.createElement(React.DOM.span, {
      "className": classes,
      "onClick": clickCb,
      "onMouseDown": mouseDownCb
    }, value);
  }
});

},{"dom-events":2,"react/lib/cx":10}],15:[function(_dereq_,module,exports){
var TimeCell,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

TimeCell = _dereq_('./time-cell');

module.exports = React.createClass({
  createTimeCell: function(value, type, disabled, maxVal) {
    return React.createElement(TimeCell, {
      "value": value,
      "type": type,
      "disabled": disabled,
      "maxVal": maxVal,
      "onChange": this.props.onTimeChange
    });
  },
  render: function() {
    var hourDisabled, minDisabled, secDisabled;
    hourDisabled = __indexOf.call(this.props.disabled, 'h') >= 0;
    minDisabled = __indexOf.call(this.props.disabled, 'i') >= 0;
    secDisabled = __indexOf.call(this.props.disabled, 's') >= 0;
    return React.createElement(React.DOM.div, {
      "className": "timerow"
    }, React.createElement(React.DOM.span, {
      "className": "label"
    }, trl('gui.datetime.timelabel'), ":"), React.createElement(React.DOM.div, {
      "className": "time"
    }, this.createTimeCell(this.props.hours, 'hour', hourDisabled, 23), React.createElement(React.DOM.span, {
      "className": "colon"
    }, ":"), this.createTimeCell(this.props.mins, 'minute', minDisabled, 59), React.createElement(React.DOM.span, {
      "className": "colon"
    }, ":"), this.createTimeCell(this.props.secs, 'second', secDisabled, 59)));
  }
});

},{"./time-cell":14}]},{},[13])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zcnYvZ2l0L3JlYWN0LWRhdGV0aW1lLXBpY2tlci9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvc3J2L2dpdC9yZWFjdC1kYXRldGltZS1waWNrZXIvbm9kZV9tb2R1bGVzL2NhbGVuZGFyLmpzL2NhbGVuZGFyLmpzIiwiL3Nydi9naXQvcmVhY3QtZGF0ZXRpbWUtcGlja2VyL25vZGVfbW9kdWxlcy9kb20tZXZlbnRzL2luZGV4LmpzIiwiL3Nydi9naXQvcmVhY3QtZGF0ZXRpbWUtcGlja2VyL25vZGVfbW9kdWxlcy9kb20tZXZlbnRzL25vZGVfbW9kdWxlcy9zeW50aGV0aWMtZG9tLWV2ZW50cy9pbmRleC5qcyIsIi9zcnYvZ2l0L3JlYWN0LWRhdGV0aW1lLXBpY2tlci9ub2RlX21vZHVsZXMvZG9tLWV2ZW50cy9ub2RlX21vZHVsZXMvc3ludGhldGljLWRvbS1ldmVudHMvaW5pdC5qc29uIiwiL3Nydi9naXQvcmVhY3QtZGF0ZXRpbWUtcGlja2VyL25vZGVfbW9kdWxlcy9kb20tZXZlbnRzL25vZGVfbW9kdWxlcy9zeW50aGV0aWMtZG9tLWV2ZW50cy90eXBlcy5qc29uIiwiL3Nydi9naXQvcmVhY3QtZGF0ZXRpbWUtcGlja2VyL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIvc3J2L2dpdC9yZWFjdC1kYXRldGltZS1waWNrZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL3Nydi9naXQvcmVhY3QtZGF0ZXRpbWUtcGlja2VyL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCIvc3J2L2dpdC9yZWFjdC1kYXRldGltZS1waWNrZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwiL3Nydi9naXQvcmVhY3QtZGF0ZXRpbWUtcGlja2VyL25vZGVfbW9kdWxlcy9yZWFjdC9saWIvY3guanMiLCIvc3J2L2dpdC9yZWFjdC1kYXRldGltZS1waWNrZXIvc3JjL2pzL2NhbGVuZGFyLWRheS5qcyIsIi9zcnYvZ2l0L3JlYWN0LWRhdGV0aW1lLXBpY2tlci9zcmMvanMvY2FsZW5kYXIuanMiLCIvc3J2L2dpdC9yZWFjdC1kYXRldGltZS1waWNrZXIvc3JjL2pzL2Zha2VfZDE3OWNhZGQuanMiLCIvc3J2L2dpdC9yZWFjdC1kYXRldGltZS1waWNrZXIvc3JjL2pzL3RpbWUtY2VsbC5qcyIsIi9zcnYvZ2l0L3JlYWN0LWRhdGV0aW1lLXBpY2tlci9zcmMvanMvdGltZS1waWNrZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIENhbGVuZGFyIChkYXRlKSB7XG4gICAgLy8gYSBjdXN0b20gJ3RvZGF5JyBkYXRlIGNhbiBiZSBpbmplY3RlZFxuICAgIHRoaXMubm93ID0gZGF0ZSB8fCBuZXcgRGF0ZSgpO1xuICB9XG5cbiAgQ2FsZW5kYXIucHJvdG90eXBlLm1vbnRoQ2FsZW5kYXIgPSBmdW5jdGlvbihkYXRlLCBvcHRpb25zLCBhY3Rpb24pIHtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgb3B0aW9ucy52aWV3ID0gJ21vbnRoJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9ucyA9IHsgdmlldzogJ21vbnRoJyB9O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jcmVhdGVDYWxlbmRhcihkYXRlLCBvcHRpb25zLCBhY3Rpb24pO1xuICB9O1xuXG4gIENhbGVuZGFyLnByb3RvdHlwZS53ZWVrc0NhbGVuZGFyID0gZnVuY3Rpb24oZGF0ZSwgb3B0aW9ucywgYWN0aW9uKSB7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMudmlldyA9ICd3ZWVrcyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdGlvbnMgPSB7IHZpZXc6ICd3ZWVrcycgfTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlQ2FsZW5kYXIoZGF0ZSwgb3B0aW9ucywgYWN0aW9uKTtcbiAgfTtcblxuICBDYWxlbmRhci5wcm90b3R5cGUuY3JlYXRlQ2FsZW5kYXIgPSBmdW5jdGlvbiAoZGF0ZU9iaiwgb3B0aW9ucywgYWN0aW9uKSB7XG4gICAgdmFyIGRhdGUgPSBkYXRlT2JqIHx8IHRoaXMubm93O1xuICAgIG9wdGlvbnMudmlldyA9IG9wdGlvbnMudmlldyB8fCAnbW9udGgnO1xuICAgIHZhciBjWWVhciA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICB2YXIgY01vbnRoID0gZGF0ZS5nZXRNb250aCgpO1xuICAgIHZhciBjRGF0ZSA9IGRhdGUuZ2V0RGF0ZSgpO1xuICAgIHZhciBjV2Vla1N0YXJ0ID0gKG9wdGlvbnMud2Vla1N0YXJ0ID09PSAwKSA/IDAgOiBvcHRpb25zLndlZWtTdGFydCB8fCAxOyAvLyB3ZWVrIHN0YXJ0cyBvbiBtb25kYXkgYnkgZGVmYXVsdCwgc3VuZGF5OiAwXG4gICAgLy8gVE9ETzogc3dpdGNoXG4gICAgdmFyIGNXZWVrcywgZmlyc3REYXlPZlZpZXcsIGZpcnN0RGF5T2Zmc2V0O1xuICAgIC8vIC0tLSBtb250aENhbGVuZGFyIC0tLVxuICAgIGlmIChvcHRpb25zLnZpZXcgPT09ICdtb250aCcpIHtcbiAgICAgIHZhciBmaXJzdERheU9mTW9udGggPSBuZXcgRGF0ZShjWWVhciwgY01vbnRoLCAxKS5nZXREYXkoKTsgLy8gd2Vla2RheSBvZiBmaXJzdCBtb250aFxuICAgICAgdmFyIGxhc3REYXRlT2ZNb250aCA9IG5ldyBEYXRlKGNZZWFyLCBjTW9udGgrMSwgMCkuZ2V0RGF0ZSgpOyAvLyBudW1iZXIgb2YgZGF5cyBpbiBjdXJyZW50IG1vbnRoXG4gICAgICBmaXJzdERheU9mZnNldCA9IGNXZWVrU3RhcnQgPiBmaXJzdERheU9mTW9udGggPyBjV2Vla1N0YXJ0LTcgOiBjV2Vla1N0YXJ0OyAvLyBzZXQgb2Zmc2V0IGZvciBmaXJzdCBkYXkgb2Ygdmlld1xuICAgICAgZmlyc3REYXlPZlZpZXcgPSAgbmV3IERhdGUoY1llYXIsIGNNb250aCwgZmlyc3REYXlPZmZzZXQtZmlyc3REYXlPZk1vbnRoKzEpOyAvLyAgZmlyc3QgZGF5IGluIGZpcnN0IHJvd1xuICAgICAgLy8gY2FsY3VsYXRlIHJvd3Mgb2Ygdmlld1xuICAgICAgLy8gVE9ETzogc2ltcGxpZnkhXG4gICAgICBpZihmaXJzdERheU9mVmlldy5nZXREYXRlKCkgPT09IDEpIHtcbiAgICAgICAgLy8gTW9udGggc3RhcnRzIGF0IHJvdyAxIGluIGNvbHVtbiAxXG4gICAgICAgIGNXZWVrcyA9IE1hdGguY2VpbChsYXN0RGF0ZU9mTW9udGggLyA3KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBsYXN0RGF0ZU9mTGFzdE1vbnRoID0gbmV3IERhdGUoY1llYXIsIGNNb250aCwgMCkuZ2V0RGF0ZSgpO1xuICAgICAgICB2YXIgYWRkaXRpb25hbERheXMgPSBsYXN0RGF0ZU9mTGFzdE1vbnRoIC0gZmlyc3REYXlPZlZpZXcuZ2V0RGF0ZSgpICsgMTtcbiAgICAgICAgY1dlZWtzID0gTWF0aC5jZWlsKChsYXN0RGF0ZU9mTW9udGggKyBhZGRpdGlvbmFsRGF5cykgLyA3KTtcbiAgICAgIH1cbiAgICAvLyAtLS0gd2Vla3NDYWxlbmRhciAtLS1cbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMudmlldyA9PT0gJ3dlZWtzJykge1xuICAgICAgY1dlZWtzID0gb3B0aW9ucy53ZWVrcyB8fCA0OyAvLyBzaG93IDQgd2Vla3MgYnkgZGVmYXVsdFxuICAgICAgZmlyc3REYXlPZlZpZXcgPSBuZXcgRGF0ZShjWWVhciwgY01vbnRoLCBjRGF0ZSk7XG4gICAgICBmaXJzdERheU9mZnNldCA9IGNXZWVrU3RhcnQgPiBmaXJzdERheU9mVmlldy5nZXREYXkoKSA/IGNXZWVrU3RhcnQtNyA6IGNXZWVrU3RhcnQ7XG4gICAgICBmaXJzdERheU9mVmlldy5zZXREYXRlKGNEYXRlIC0gZmlyc3REYXlPZlZpZXcuZ2V0RGF5KCkgKyBwYXJzZUludChmaXJzdERheU9mZnNldCwgMTApKTtcbiAgICB9XG5cbiAgICB2YXIgY3VycmVudERhdGUgPSBmaXJzdERheU9mVmlldztcbiAgICB2YXIgY2FsID0gW107XG5cbiAgICAvLyBjcmVhdGUgY2FsZW5kYXIgbW9kZWxcbiAgICBmb3IgKHZhciB3ZWVrID0gMDsgd2VlayA8IGNXZWVrczsgd2VlaysrKSB7XG4gICAgICBjYWxbd2Vla10gPSBbXTtcbiAgICAgIGZvciAodmFyIGRheSA9IDA7IGRheSA8IDc7IGRheSsrKSB7XG4gICAgICAgIC8vIGRldGVybWluZSBleHBvc2VkIHBhcmFtZXRlcnNcbiAgICAgICAgdmFyIHRvZGF5ID0gKHRoaXMubm93LmdldEZ1bGxZZWFyKCkgPT09IGN1cnJlbnREYXRlLmdldEZ1bGxZZWFyKCkgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3cuZ2V0TW9udGgoKSA9PT0gY3VycmVudERhdGUuZ2V0TW9udGgoKSAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vdy5nZXREYXRlKCkgPT09IGN1cnJlbnREYXRlLmdldERhdGUoKSk7XG5cbiAgICAgICAgLy8gaW1wbGVtZW50YXRpb24gb2YgYWxyZWFkeSBwYXN0IGRheXNcbiAgICAgICAgdmFyIHBhc3REYXkgPSAoY3VycmVudERhdGUudmFsdWVPZigpIDwgdGhpcy5ub3cudmFsdWVPZigpICYmICF0b2RheSk7XG5cbiAgICAgICAgdmFyIHRoaXNNb250aCA9IChjTW9udGggPT09IGN1cnJlbnREYXRlLmdldE1vbnRoKCkpO1xuXG4gICAgICAgIC8vIFRPRE86IHRoaXNXZWVrP1xuXG4gICAgICAgIHZhciBjb250ZW50cyA9IHtcbiAgICAgICAgICBkYXRlOiBjdXJyZW50RGF0ZSxcbiAgICAgICAgICBpc0luQ3VycmVudE1vbnRoOiB0aGlzTW9udGgsXG4gICAgICAgICAgaXNUb2RheTogdG9kYXksXG4gICAgICAgICAgaXNQYXN0RGF0ZTogcGFzdERheVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGlmIGFjdGlvbiBpcyBkZWZpbmVkIHJlc3VsdHMgb2YgdGhlIGFjdGlvbiBmdW5jdGlvbiBhcmUgcHVzaGVkIGludG8gdGhlIGNhbGVuZGFyIGFycmF5XG4gICAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgYWN0aW9uKSB7XG4gICAgICAgICAgY29udGVudHMuZW50cmllcyA9IGFjdGlvbihjdXJyZW50RGF0ZSwgdGhpc01vbnRoLCB0b2RheSwgcGFzdERheSkgfHwgW107XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNhbFt3ZWVrXS5wdXNoKGNvbnRlbnRzKTtcbiAgICAgICAgXG4gICAgICAgIC8vIGluY3JlbWVudCBkYXlcbiAgICAgICAgY3VycmVudERhdGUgPSBuZXcgRGF0ZShjdXJyZW50RGF0ZS5nZXRGdWxsWWVhcigpLCBjdXJyZW50RGF0ZS5nZXRNb250aCgpLCBjdXJyZW50RGF0ZS5nZXREYXRlKCkrMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcG9wdWxhdGUoZm4pIHtcbiAgICAgIGZvciAodmFyIGkgPSBjYWwubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IGNhbFtpXS5sZW5ndGggLSAxOyBqID49IDA7IGotLSkge1xuICAgICAgICAgIGNhbFtpXVtqXS5lbnRyaWVzID0gZm4oY2FsW2ldW2pdLmRhdGUsIGNhbFtpXVtqXS5pc0luQ3VycmVudE1vbnRoLCBjYWxbaV1bal0uaXNUb2RheSwgY2FsW2ldW2pdLmlzUGFzdERhdGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNhbGVuZGFyOiBjYWwsXG4gICAgICBwb3B1bGF0ZTogcG9wdWxhdGVcbiAgICB9O1xuXG4gIH07XG5cbiAgLy8gZm9yIG5vZGUuanNcbiAgaWYgKHR5cGVvZihtb2R1bGUpICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gQ2FsZW5kYXI7XG4gIH0gZWxzZSB7XG4gICAgd2luZG93LkNhbGVuZGFyID0gQ2FsZW5kYXI7XG4gIH1cbn0pKCk7IiwiXG52YXIgc3ludGggPSByZXF1aXJlKCdzeW50aGV0aWMtZG9tLWV2ZW50cycpO1xuXG52YXIgb24gPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lLCBmbiwgY2FwdHVyZSkge1xuICAgIHJldHVybiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZm4sIGNhcHR1cmUgfHwgZmFsc2UpO1xufTtcblxudmFyIG9mZiA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUsIGZuLCBjYXB0dXJlKSB7XG4gICAgcmV0dXJuIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBmbiwgY2FwdHVyZSB8fCBmYWxzZSk7XG59O1xuXG52YXIgb25jZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBuYW1lLCBmbiwgY2FwdHVyZSkge1xuICAgIGZ1bmN0aW9uIHRtcCAoZXYpIHtcbiAgICAgICAgb2ZmKGVsZW1lbnQsIG5hbWUsIHRtcCwgY2FwdHVyZSk7XG4gICAgICAgIGZuKGV2KTtcbiAgICB9XG4gICAgb24oZWxlbWVudCwgbmFtZSwgdG1wLCBjYXB0dXJlKTtcbn07XG5cbnZhciBlbWl0ID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZSwgb3B0KSB7XG4gICAgdmFyIGV2ID0gc3ludGgobmFtZSwgb3B0KTtcbiAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXYpO1xufTtcblxuaWYgKCFkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgb24gPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lLCBmbikge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5hdHRhY2hFdmVudCgnb24nICsgbmFtZSwgZm4pO1xuICAgIH07XG59XG5cbmlmICghZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgIG9mZiA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUsIGZuKSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50LmRldGFjaEV2ZW50KCdvbicgKyBuYW1lLCBmbik7XG4gICAgfTtcbn1cblxuaWYgKCFkb2N1bWVudC5kaXNwYXRjaEV2ZW50KSB7XG4gICAgZW1pdCA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUsIG9wdCkge1xuICAgICAgICB2YXIgZXYgPSBzeW50aChuYW1lLCBvcHQpO1xuICAgICAgICByZXR1cm4gZWxlbWVudC5maXJlRXZlbnQoJ29uJyArIGV2LnR5cGUsIGV2KTtcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBvbjogb24sXG4gICAgb2ZmOiBvZmYsXG4gICAgb25jZTogb25jZSxcbiAgICBlbWl0OiBlbWl0XG59O1xuIiwiXG4vLyBmb3IgY29tcHJlc3Npb25cbnZhciB3aW4gPSB3aW5kb3c7XG52YXIgZG9jID0gZG9jdW1lbnQgfHwge307XG52YXIgcm9vdCA9IGRvYy5kb2N1bWVudEVsZW1lbnQgfHwge307XG5cbi8vIGRldGVjdCBpZiB3ZSBuZWVkIHRvIHVzZSBmaXJlZm94IEtleUV2ZW50cyB2cyBLZXlib2FyZEV2ZW50c1xudmFyIHVzZV9rZXlfZXZlbnQgPSB0cnVlO1xudHJ5IHtcbiAgICBkb2MuY3JlYXRlRXZlbnQoJ0tleUV2ZW50cycpO1xufVxuY2F0Y2ggKGVycikge1xuICAgIHVzZV9rZXlfZXZlbnQgPSBmYWxzZTtcbn1cblxuLy8gV29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE2NzM1XG5mdW5jdGlvbiBjaGVja19rYihldiwgb3B0cykge1xuICAgIGlmIChldi5jdHJsS2V5ICE9IChvcHRzLmN0cmxLZXkgfHwgZmFsc2UpIHx8XG4gICAgICAgIGV2LmFsdEtleSAhPSAob3B0cy5hbHRLZXkgfHwgZmFsc2UpIHx8XG4gICAgICAgIGV2LnNoaWZ0S2V5ICE9IChvcHRzLnNoaWZ0S2V5IHx8IGZhbHNlKSB8fFxuICAgICAgICBldi5tZXRhS2V5ICE9IChvcHRzLm1ldGFLZXkgfHwgZmFsc2UpIHx8XG4gICAgICAgIGV2LmtleUNvZGUgIT0gKG9wdHMua2V5Q29kZSB8fCAwKSB8fFxuICAgICAgICBldi5jaGFyQ29kZSAhPSAob3B0cy5jaGFyQ29kZSB8fCAwKSkge1xuXG4gICAgICAgIGV2ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICAgIGV2LmluaXRFdmVudChvcHRzLnR5cGUsIG9wdHMuYnViYmxlcywgb3B0cy5jYW5jZWxhYmxlKTtcbiAgICAgICAgZXYuY3RybEtleSAgPSBvcHRzLmN0cmxLZXkgfHwgZmFsc2U7XG4gICAgICAgIGV2LmFsdEtleSAgID0gb3B0cy5hbHRLZXkgfHwgZmFsc2U7XG4gICAgICAgIGV2LnNoaWZ0S2V5ID0gb3B0cy5zaGlmdEtleSB8fCBmYWxzZTtcbiAgICAgICAgZXYubWV0YUtleSAgPSBvcHRzLm1ldGFLZXkgfHwgZmFsc2U7XG4gICAgICAgIGV2LmtleUNvZGUgID0gb3B0cy5rZXlDb2RlIHx8IDA7XG4gICAgICAgIGV2LmNoYXJDb2RlID0gb3B0cy5jaGFyQ29kZSB8fCAwO1xuICAgIH1cblxuICAgIHJldHVybiBldjtcbn1cblxuLy8gbW9kZXJuIGJyb3dzZXJzLCBkbyBhIHByb3BlciBkaXNwYXRjaEV2ZW50KClcbnZhciBtb2Rlcm4gPSBmdW5jdGlvbih0eXBlLCBvcHRzKSB7XG4gICAgb3B0cyA9IG9wdHMgfHwge307XG5cbiAgICAvLyB3aGljaCBpbml0IGZuIGRvIHdlIHVzZVxuICAgIHZhciBmYW1pbHkgPSB0eXBlT2YodHlwZSk7XG4gICAgdmFyIGluaXRfZmFtID0gZmFtaWx5O1xuICAgIGlmIChmYW1pbHkgPT09ICdLZXlib2FyZEV2ZW50JyAmJiB1c2Vfa2V5X2V2ZW50KSB7XG4gICAgICAgIGZhbWlseSA9ICdLZXlFdmVudHMnO1xuICAgICAgICBpbml0X2ZhbSA9ICdLZXlFdmVudCc7XG4gICAgfVxuXG4gICAgdmFyIGV2ID0gZG9jLmNyZWF0ZUV2ZW50KGZhbWlseSk7XG4gICAgdmFyIGluaXRfZm4gPSAnaW5pdCcgKyBpbml0X2ZhbTtcbiAgICB2YXIgaW5pdCA9IHR5cGVvZiBldltpbml0X2ZuXSA9PT0gJ2Z1bmN0aW9uJyA/IGluaXRfZm4gOiAnaW5pdEV2ZW50JztcblxuICAgIHZhciBzaWcgPSBpbml0U2lnbmF0dXJlc1tpbml0XTtcbiAgICB2YXIgYXJncyA9IFtdO1xuICAgIHZhciB1c2VkID0ge307XG5cbiAgICBvcHRzLnR5cGUgPSB0eXBlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lnLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBrZXkgPSBzaWdbaV07XG4gICAgICAgIHZhciB2YWwgPSBvcHRzW2tleV07XG4gICAgICAgIC8vIGlmIG5vIHVzZXIgc3BlY2lmaWVkIHZhbHVlLCB0aGVuIHVzZSBldmVudCBkZWZhdWx0XG4gICAgICAgIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFsID0gZXZba2V5XTtcbiAgICAgICAgfVxuICAgICAgICB1c2VkW2tleV0gPSB0cnVlO1xuICAgICAgICBhcmdzLnB1c2godmFsKTtcbiAgICB9XG4gICAgZXZbaW5pdF0uYXBwbHkoZXYsIGFyZ3MpO1xuXG4gICAgLy8gd2Via2l0IGtleSBldmVudCBpc3N1ZSB3b3JrYXJvdW5kXG4gICAgaWYgKGZhbWlseSA9PT0gJ0tleWJvYXJkRXZlbnQnKSB7XG4gICAgICAgIGV2ID0gY2hlY2tfa2IoZXYsIG9wdHMpO1xuICAgIH1cblxuICAgIC8vIGF0dGFjaCByZW1haW5pbmcgdW51c2VkIG9wdGlvbnMgdG8gdGhlIG9iamVjdFxuICAgIGZvciAodmFyIGtleSBpbiBvcHRzKSB7XG4gICAgICAgIGlmICghdXNlZFtrZXldKSB7XG4gICAgICAgICAgICBldltrZXldID0gb3B0c1trZXldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGV2O1xufTtcblxudmFyIGxlZ2FjeSA9IGZ1bmN0aW9uICh0eXBlLCBvcHRzKSB7XG4gICAgb3B0cyA9IG9wdHMgfHwge307XG4gICAgdmFyIGV2ID0gZG9jLmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG5cbiAgICBldi50eXBlID0gdHlwZTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb3B0cykge1xuICAgICAgICBpZiAob3B0c1trZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGV2W2tleV0gPSBvcHRzW2tleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZXY7XG59O1xuXG4vLyBleHBvc2UgZWl0aGVyIHRoZSBtb2Rlcm4gdmVyc2lvbiBvZiBldmVudCBnZW5lcmF0aW9uIG9yIGxlZ2FjeVxuLy8gZGVwZW5kaW5nIG9uIHdoYXQgd2Ugc3VwcG9ydFxuLy8gYXZvaWRzIGlmIHN0YXRlbWVudHMgaW4gdGhlIGNvZGUgbGF0ZXJcbm1vZHVsZS5leHBvcnRzID0gZG9jLmNyZWF0ZUV2ZW50ID8gbW9kZXJuIDogbGVnYWN5O1xuXG52YXIgaW5pdFNpZ25hdHVyZXMgPSByZXF1aXJlKCcuL2luaXQuanNvbicpO1xudmFyIHR5cGVzID0gcmVxdWlyZSgnLi90eXBlcy5qc29uJyk7XG52YXIgdHlwZU9mID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdHlwcyA9IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiB0eXBlcykge1xuICAgICAgICB2YXIgdHMgPSB0eXBlc1trZXldO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0eXBzW3RzW2ldXSA9IGtleTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICByZXR1cm4gdHlwc1tuYW1lXSB8fCAnRXZlbnQnO1xuICAgIH07XG59KSgpO1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcImluaXRFdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiYnViYmxlc1wiLFxuICAgIFwiY2FuY2VsYWJsZVwiXG4gIF0sXG4gIFwiaW5pdFVJRXZlbnRcIiA6IFtcbiAgICBcInR5cGVcIixcbiAgICBcImJ1YmJsZXNcIixcbiAgICBcImNhbmNlbGFibGVcIixcbiAgICBcInZpZXdcIixcbiAgICBcImRldGFpbFwiXG4gIF0sXG4gIFwiaW5pdE1vdXNlRXZlbnRcIiA6IFtcbiAgICBcInR5cGVcIixcbiAgICBcImJ1YmJsZXNcIixcbiAgICBcImNhbmNlbGFibGVcIixcbiAgICBcInZpZXdcIixcbiAgICBcImRldGFpbFwiLFxuICAgIFwic2NyZWVuWFwiLFxuICAgIFwic2NyZWVuWVwiLFxuICAgIFwiY2xpZW50WFwiLFxuICAgIFwiY2xpZW50WVwiLFxuICAgIFwiY3RybEtleVwiLFxuICAgIFwiYWx0S2V5XCIsXG4gICAgXCJzaGlmdEtleVwiLFxuICAgIFwibWV0YUtleVwiLFxuICAgIFwiYnV0dG9uXCIsXG4gICAgXCJyZWxhdGVkVGFyZ2V0XCJcbiAgXSxcbiAgXCJpbml0TXV0YXRpb25FdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiYnViYmxlc1wiLFxuICAgIFwiY2FuY2VsYWJsZVwiLFxuICAgIFwicmVsYXRlZE5vZGVcIixcbiAgICBcInByZXZWYWx1ZVwiLFxuICAgIFwibmV3VmFsdWVcIixcbiAgICBcImF0dHJOYW1lXCIsXG4gICAgXCJhdHRyQ2hhbmdlXCJcbiAgXSxcbiAgXCJpbml0S2V5Ym9hcmRFdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiYnViYmxlc1wiLFxuICAgIFwiY2FuY2VsYWJsZVwiLFxuICAgIFwidmlld1wiLFxuICAgIFwiY3RybEtleVwiLFxuICAgIFwiYWx0S2V5XCIsXG4gICAgXCJzaGlmdEtleVwiLFxuICAgIFwibWV0YUtleVwiLFxuICAgIFwia2V5Q29kZVwiLFxuICAgIFwiY2hhckNvZGVcIlxuICBdLFxuICBcImluaXRLZXlFdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiYnViYmxlc1wiLFxuICAgIFwiY2FuY2VsYWJsZVwiLFxuICAgIFwidmlld1wiLFxuICAgIFwiY3RybEtleVwiLFxuICAgIFwiYWx0S2V5XCIsXG4gICAgXCJzaGlmdEtleVwiLFxuICAgIFwibWV0YUtleVwiLFxuICAgIFwia2V5Q29kZVwiLFxuICAgIFwiY2hhckNvZGVcIlxuICBdXG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiTW91c2VFdmVudFwiIDogW1xuICAgIFwiY2xpY2tcIixcbiAgICBcIm1vdXNlZG93blwiLFxuICAgIFwibW91c2V1cFwiLFxuICAgIFwibW91c2VvdmVyXCIsXG4gICAgXCJtb3VzZW1vdmVcIixcbiAgICBcIm1vdXNlb3V0XCJcbiAgXSxcbiAgXCJLZXlib2FyZEV2ZW50XCIgOiBbXG4gICAgXCJrZXlkb3duXCIsXG4gICAgXCJrZXl1cFwiLFxuICAgIFwia2V5cHJlc3NcIlxuICBdLFxuICBcIk11dGF0aW9uRXZlbnRcIiA6IFtcbiAgICBcIkRPTVN1YnRyZWVNb2RpZmllZFwiLFxuICAgIFwiRE9NTm9kZUluc2VydGVkXCIsXG4gICAgXCJET01Ob2RlUmVtb3ZlZFwiLFxuICAgIFwiRE9NTm9kZVJlbW92ZWRGcm9tRG9jdW1lbnRcIixcbiAgICBcIkRPTU5vZGVJbnNlcnRlZEludG9Eb2N1bWVudFwiLFxuICAgIFwiRE9NQXR0ck1vZGlmaWVkXCIsXG4gICAgXCJET01DaGFyYWN0ZXJEYXRhTW9kaWZpZWRcIlxuICBdLFxuICBcIkhUTUxFdmVudHNcIiA6IFtcbiAgICBcImxvYWRcIixcbiAgICBcInVubG9hZFwiLFxuICAgIFwiYWJvcnRcIixcbiAgICBcImVycm9yXCIsXG4gICAgXCJzZWxlY3RcIixcbiAgICBcImNoYW5nZVwiLFxuICAgIFwic3VibWl0XCIsXG4gICAgXCJyZXNldFwiLFxuICAgIFwiZm9jdXNcIixcbiAgICBcImJsdXJcIixcbiAgICBcInJlc2l6ZVwiLFxuICAgIFwic2Nyb2xsXCJcbiAgXSxcbiAgXCJVSUV2ZW50XCIgOiBbXG4gICAgXCJET01Gb2N1c0luXCIsXG4gICAgXCJET01Gb2N1c091dFwiLFxuICAgIFwiRE9NQWN0aXZhdGVcIlxuICBdXG59XG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0J1ZmZlcihhcmcpIHtcbiAgcmV0dXJuIGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0J1xuICAgICYmIHR5cGVvZiBhcmcuY29weSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcuZmlsbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBhcmcucmVhZFVJbnQ4ID09PSAnZnVuY3Rpb24nO1xufSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwpe1xuLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIm9NZnBBblwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxMy0yMDE0IEZhY2Vib29rLCBJbmMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIGN4XG4gKi9cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gbWFyayBzdHJpbmcgbGl0ZXJhbHMgcmVwcmVzZW50aW5nIENTUyBjbGFzcyBuYW1lc1xuICogc28gdGhhdCB0aGV5IGNhbiBiZSB0cmFuc2Zvcm1lZCBzdGF0aWNhbGx5LiBUaGlzIGFsbG93cyBmb3IgbW9kdWxhcml6YXRpb25cbiAqIGFuZCBtaW5pZmljYXRpb24gb2YgQ1NTIGNsYXNzIG5hbWVzLlxuICpcbiAqIEluIHN0YXRpY191cHN0cmVhbSwgdGhpcyBmdW5jdGlvbiBpcyBhY3R1YWxseSBpbXBsZW1lbnRlZCwgYnV0IGl0IHNob3VsZFxuICogZXZlbnR1YWxseSBiZSByZXBsYWNlZCB3aXRoIHNvbWV0aGluZyBtb3JlIGRlc2NyaXB0aXZlLCBhbmQgdGhlIHRyYW5zZm9ybVxuICogdGhhdCBpcyB1c2VkIGluIHRoZSBtYWluIHN0YWNrIHNob3VsZCBiZSBwb3J0ZWQgZm9yIHVzZSBlbHNld2hlcmUuXG4gKlxuICogQHBhcmFtIHN0cmluZ3xvYmplY3QgY2xhc3NOYW1lIHRvIG1vZHVsYXJpemUsIG9yIGFuIG9iamVjdCBvZiBrZXkvdmFsdWVzLlxuICogICAgICAgICAgICAgICAgICAgICAgSW4gdGhlIG9iamVjdCBjYXNlLCB0aGUgdmFsdWVzIGFyZSBjb25kaXRpb25zIHRoYXRcbiAqICAgICAgICAgICAgICAgICAgICAgIGRldGVybWluZSBpZiB0aGUgY2xhc3NOYW1lIGtleXMgc2hvdWxkIGJlIGluY2x1ZGVkLlxuICogQHBhcmFtIFtzdHJpbmcgLi4uXSAgVmFyaWFibGUgbGlzdCBvZiBjbGFzc05hbWVzIGluIHRoZSBzdHJpbmcgY2FzZS5cbiAqIEByZXR1cm4gc3RyaW5nICAgICAgIFJlbmRlcmFibGUgc3BhY2Utc2VwYXJhdGVkIENTUyBjbGFzc05hbWUuXG4gKi9cbmZ1bmN0aW9uIGN4KGNsYXNzTmFtZXMpIHtcbiAgaWYgKHR5cGVvZiBjbGFzc05hbWVzID09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGNsYXNzTmFtZXMpLmZpbHRlcihmdW5jdGlvbihjbGFzc05hbWUpIHtcbiAgICAgIHJldHVybiBjbGFzc05hbWVzW2NsYXNzTmFtZV07XG4gICAgfSkuam9pbignICcpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuam9pbi5jYWxsKGFyZ3VtZW50cywgJyAnKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGN4O1xuIiwidmFyIGNsYXNzU2V0O1xuXG5jbGFzc1NldCA9IHJlcXVpcmUoJ3JlYWN0L2xpYi9jeCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgaGFuZGxlRGF5Q2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCB8fCAhdGhpcy5wcm9wcy5kYXkuaXNJbkN1cnJlbnRNb250aCkge1xuICAgICAgcmV0dXJuIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJvcHMub25EYXlTZWxlY3QodGhpcy5wcm9wcy5kYXkuZGF0ZS5nZXREYXRlKCkpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjbGFzc2VzLCBkYXksIGlkeCwgdGV4dDtcbiAgICBpZHggPSB0aGlzLnByb3BzLmluZGV4O1xuICAgIGRheSA9IHRoaXMucHJvcHMuZGF5O1xuICAgIHRleHQgPSBkYXkuaXNJbkN1cnJlbnRNb250aCA/IGRheS5kYXRlLmdldERhdGUoKSA6ICcmbmJzcDsnO1xuICAgIGNsYXNzZXMgPSBjbGFzc1NldCh7XG4gICAgICAnZGF5JzogZGF5LmlzSW5DdXJyZW50TW9udGgsXG4gICAgICAnZW1wdHljZWxsJzogIWRheS5pc0luQ3VycmVudE1vbnRoLFxuICAgICAgJ3dlZWtlbmQnOiBpZHggPT09IDUgfHwgaWR4ID09PSA2LFxuICAgICAgJ3NlbGVjdGVkJzogdGhpcy5wcm9wcy5zZWxlY3RlZCxcbiAgICAgICd0b2RheSc6IGRheS5pc1RvZGF5LFxuICAgICAgJ2hpZ2hsaWdodGFibGUnOiAhdGhpcy5wcm9wcy5kaXNhYmxlZCxcbiAgICAgICdkaXNhYmxlZCc6IHRoaXMucHJvcHMuZGlzYWJsZWRcbiAgICB9KTtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00udGQsIHtcbiAgICAgIFwiY2xhc3NOYW1lXCI6IGNsYXNzZXMsXG4gICAgICBcImRhbmdlcm91c2x5U2V0SW5uZXJIVE1MXCI6IHtcbiAgICAgICAgX19odG1sOiB0ZXh0XG4gICAgICB9LFxuICAgICAgXCJvbkNsaWNrXCI6IHRoaXMuaGFuZGxlRGF5Q2xpY2tcbiAgICB9KTtcbiAgfVxufSk7XG4iLCJ2YXIgQ2FsZW5kYXIsIENhbGVuZGFyRGF5LCBjbGFzc1NldCwgdXRpbCxcbiAgX19pbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbmNsYXNzU2V0ID0gcmVxdWlyZSgncmVhY3QvbGliL2N4Jyk7XG5cbkNhbGVuZGFyID0gcmVxdWlyZSgnY2FsZW5kYXIuanMnKTtcblxudXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcblxuQ2FsZW5kYXJEYXkgPSByZXF1aXJlKCcuL2NhbGVuZGFyLWRheScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgX2NhbDogbmV3IENhbGVuZGFyKCksXG5cbiAgLyoqXG4gICogSGFuZGxlIG5hdmlnYXRpb24gYnV0dG9uIGNsaWNrXG4gICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgTmF2aWdhdGlvbiBidXR0b24gdHlwZSwgb25lIG9mIDQgc3RyaW5nczogbHkgPSBsZXNzXG4gICogIHllYXIsIGxtID0gbGVzcyBtb250aCwgZ20gPSBncmVhdGVyIHllYXIsIGd5ID0gZ3JlYXRlciB5ZWFyXG4gICAqL1xuICBoYW5kbGVOYXZpZzogZnVuY3Rpb24odHlwZSkge1xuICAgIHZhciBtb250aCwgeWVhcjtcbiAgICBtb250aCA9IG51bGw7XG4gICAgeWVhciA9IG51bGw7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdseSc6XG4gICAgICAgIHllYXIgPSB0aGlzLnByb3BzLmRhdGUuZ2V0RnVsbFllYXIoKSAtIDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbG0nOlxuICAgICAgICBtb250aCA9IHRoaXMucHJvcHMuZGF0ZS5nZXRNb250aCgpIC0gMTtcbiAgICAgICAgaWYgKG1vbnRoIDwgMCAmJiBfX2luZGV4T2YuY2FsbCh0aGlzLnByb3BzLmRpc2FibGVkLCAneScpID49IDApIHtcbiAgICAgICAgICBtb250aCA9IDExO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZ20nOlxuICAgICAgICBtb250aCA9IHRoaXMucHJvcHMuZGF0ZS5nZXRNb250aCgpICsgMTtcbiAgICAgICAgaWYgKG1vbnRoID4gMTEgJiYgX19pbmRleE9mLmNhbGwodGhpcy5wcm9wcy5kaXNhYmxlZCwgJ3knKSA+PSAwKSB7XG4gICAgICAgICAgbW9udGggPSAwO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZ3knOlxuICAgICAgICB5ZWFyID0gdGhpcy5wcm9wcy5kYXRlLmdldEZ1bGxZZWFyKCkgKyAxO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbk1vbnRoWWVhckNoYW5nZShtb250aCwgeWVhcik7XG4gIH0sXG4gIGNyZWF0ZURheTogZnVuY3Rpb24oZGF5LCBpZHgpIHtcbiAgICB2YXIgZGlzYWJsZWQsIHNlbGVjdGVkO1xuICAgIHNlbGVjdGVkID0gZGF5LmlzSW5DdXJyZW50TW9udGggJiYgdGhpcy5wcm9wcy5kYXRlLmdldERhdGUoKSA9PT0gZGF5LmRhdGUuZ2V0RGF0ZSgpO1xuICAgIGRpc2FibGVkID0gX19pbmRleE9mLmNhbGwodGhpcy5wcm9wcy5kaXNhYmxlZCwgJ2QnKSA+PSAwO1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KENhbGVuZGFyRGF5LCB7XG4gICAgICBcImRheVwiOiBkYXksXG4gICAgICBcImluZGV4XCI6IGlkeCxcbiAgICAgIFwia2V5XCI6IGlkeCxcbiAgICAgIFwic2VsZWN0ZWRcIjogc2VsZWN0ZWQsXG4gICAgICBcImRpc2FibGVkXCI6IGRpc2FibGVkLFxuICAgICAgXCJvbkRheVNlbGVjdFwiOiB0aGlzLnByb3BzLm9uRGF5U2VsZWN0XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICogQHBhcmFtIHtBcnJheS48T2JqZWN0Pn0gd2VlayBMaXN0IG9mIGRheXMgYXQgd2Vla1xuICAqIEBwYXJhbSB7bnVtYmVyfSBpZHggSW5kZXggb2Ygd2VlayBhdCBsaXN0IG9mIHdlZWtzIG9mIGFjdHVhbCBtb250aFxuICAgKi9cbiAgY3JlYXRlV2VlazogZnVuY3Rpb24od2VlaywgaWR4KSB7XG4gICAgdmFyIGRheXMsIHJvd0NsYXNzO1xuICAgIGlmICh3ZWVrLmxlbmd0aCkge1xuICAgICAgZGF5cyA9IHdlZWsubWFwKHRoaXMuY3JlYXRlRGF5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGF5cyA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLnRkLCB7XG4gICAgICAgIFwiY2xhc3NOYW1lXCI6IFwiZW1wdHljZWxsXCIsXG4gICAgICAgIFwiY29sU3BhblwiOiA3LlxuICAgICAgfSwgXCJcXHUwMGEwXCIpO1xuICAgIH1cbiAgICByb3dDbGFzcyA9IHV0aWwuaXNBcnJheShkYXlzKSA/ICdkYXlzcm93JyA6ICdlbXB0eXJvdyc7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLnRyLCB7XG4gICAgICBcImNsYXNzTmFtZVwiOiByb3dDbGFzcyxcbiAgICAgIFwia2V5XCI6IGlkeFxuICAgIH0sIGRheXMpO1xuICB9LFxuXG4gIC8qKlxuICAqIEBwYXJhbSB7bnVtYmVyfSBvcmRlciBPcmRlciBvZiBkYXkgYXQgd2VlaywgTW9uZGF5IGlzIDAsIFR1ZXNkYXkgMSwgZXRjLlxuICAgKi9cbiAgY3JlYXRlRGF5VGl0bGU6IGZ1bmN0aW9uKG9yZGVyKSB7XG4gICAgdmFyIGNsYXNzZXMsIG5hbWU7XG4gICAgbmFtZSA9IHRybChcImd1aS5kYXRldGltZS5kYXluYW1lcy5cIiArIG9yZGVyKTtcbiAgICBjbGFzc2VzID0gY2xhc3NTZXQoe1xuICAgICAgJ2RheSc6IHRydWUsXG4gICAgICAnbmFtZSc6IHRydWUsXG4gICAgICAnd2Vla2VuZCc6IG9yZGVyID09PSA1IHx8IG9yZGVyID09PSA2XG4gICAgfSk7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLnRkLCB7XG4gICAgICBcImNsYXNzTmFtZVwiOiBjbGFzc2VzLFxuICAgICAgXCJrZXlcIjogb3JkZXJcbiAgICB9LCBuYW1lKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGF5bmFtZXMsIG1vbnRoQ2FsZW5kYXIsIG1vbnRoc0Rpc2FibGVkLCBzdHlsZXNMZWZ0QnRucywgc3R5bGVzUmlnaHRCdG5zLCB5ZWFyc0Rpc2FibGVkO1xuICAgIGRheW5hbWVzID0gWzAsIDEsIDIsIDMsIDQsIDUsIDZdLm1hcCh0aGlzLmNyZWF0ZURheVRpdGxlKTtcbiAgICBtb250aENhbGVuZGFyID0gdGhpcy5fY2FsLm1vbnRoQ2FsZW5kYXIodGhpcy5wcm9wcy5kYXRlKTtcbiAgICBzdHlsZXNMZWZ0QnRucyA9IHtcbiAgICAgICdmbG9hdCc6ICdsZWZ0J1xuICAgIH07XG4gICAgc3R5bGVzUmlnaHRCdG5zID0ge1xuICAgICAgJ2Zsb2F0JzogJ3JpZ2h0J1xuICAgIH07XG4gICAgeWVhcnNEaXNhYmxlZCA9IF9faW5kZXhPZi5jYWxsKHRoaXMucHJvcHMuZGlzYWJsZWQsICd5JykgPj0gMDtcbiAgICBtb250aHNEaXNhYmxlZCA9IF9faW5kZXhPZi5jYWxsKHRoaXMucHJvcHMuZGlzYWJsZWQsICdtJykgPj0gMDtcbiAgICB3aGlsZSAobW9udGhDYWxlbmRhci5jYWxlbmRhci5sZW5ndGggPCA2KSB7XG4gICAgICBtb250aENhbGVuZGFyLmNhbGVuZGFyLnB1c2goW10pO1xuICAgIH1cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00uZGl2LCBudWxsLCBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS5kaXYsIHtcbiAgICAgIFwiY2xhc3NOYW1lXCI6IFwibmF2LWJ1dHRvbnNcIlxuICAgIH0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLmRpdiwge1xuICAgICAgXCJjbGFzc05hbWVcIjogXCJsZWZ0XCJcbiAgICB9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS5idXR0b24sIHtcbiAgICAgIFwiZGlzYWJsZWRcIjogeWVhcnNEaXNhYmxlZCxcbiAgICAgIFwib25DbGlja1wiOiB0aGlzLmhhbmRsZU5hdmlnLmJpbmQodGhpcywgJ2x5JylcbiAgICB9LCBcIlxceDNDXFx4M0NcIiksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLmJ1dHRvbiwge1xuICAgICAgXCJkaXNhYmxlZFwiOiBtb250aHNEaXNhYmxlZCxcbiAgICAgIFwib25DbGlja1wiOiB0aGlzLmhhbmRsZU5hdmlnLmJpbmQodGhpcywgJ2xtJylcbiAgICB9LCBcIlxceDNDXCIpKSwgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00uZGl2LCB7XG4gICAgICBcImNsYXNzTmFtZVwiOiBcInJpZ2h0XCJcbiAgICB9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS5idXR0b24sIHtcbiAgICAgIFwiZGlzYWJsZWRcIjogbW9udGhzRGlzYWJsZWQsXG4gICAgICBcIm9uQ2xpY2tcIjogdGhpcy5oYW5kbGVOYXZpZy5iaW5kKHRoaXMsICdnbScpXG4gICAgfSwgXCJcXHgzRVwiKSwgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00uYnV0dG9uLCB7XG4gICAgICBcImRpc2FibGVkXCI6IHllYXJzRGlzYWJsZWQsXG4gICAgICBcIm9uQ2xpY2tcIjogdGhpcy5oYW5kbGVOYXZpZy5iaW5kKHRoaXMsICdneScpXG4gICAgfSwgXCJcXHgzRVxceDNFXCIpKSksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLnRhYmxlLCBudWxsLCBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS50aGVhZCwgbnVsbCwgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00udHIsIHtcbiAgICAgIFwiY2xhc3NOYW1lXCI6IFwiZGF5bmFtZXNcIlxuICAgIH0sIGRheW5hbWVzKSksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLnRib2R5LCBudWxsLCBtb250aENhbGVuZGFyLmNhbGVuZGFyLm1hcCh0aGlzLmNyZWF0ZVdlZWspKSkpO1xuICB9XG59KTtcbiIsInZhciBGdWxsQ2FsZW5kYXIsIFRpbWVQaWNrZXI7XG5cbkZ1bGxDYWxlbmRhciA9IHJlcXVpcmUoJy4vY2FsZW5kYXInKTtcblxuVGltZVBpY2tlciA9IHJlcXVpcmUoJy4vdGltZS1waWNrZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgLyoqXG4gICogQHBhcmFtIHtPYmplY3QuPHN0cmluZywgbnVtYmVyPn0gcG9zaXRpb25cbiAgKiBAcGFyYW0ge0RhdGU9fSBkYXRlIERhdGUgdG8gc2V0IGFzIGRlZmF1bHQsIGlmIG51bGwgdGhlbiBgbm93YCBkYXRlIHdpbGwgYmVcbiAgKiAgdXNlZFxuICAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IGRpc2FibGVkIExpc3Qgb2YgZmllbGRzIGRpc2FibGVkIGZvciBjaGFuZ2UuIENhblxuICAqICBjb250YWluIG9uZSAgb3IgbW9yZSBvZiBrZXkgY2hhcnM6IGB5YCA9IHllYXJzLCBgbWAgPSBtb250aHMsIGBkYCA9IGRheXMsXG4gICogIGBoYCA9IGhvdXJzLCBgaWAgPSBtaW51dGVzLCBgc2AgPSBzZWNvbmRzXG4gICAqL1xuXG4gIC8qXG4gIHNob3c6IChwb3NpdGlvbiwgZGF0ZSA9IG5ldyBEYXRlLCBkaXNhYmxlZCA9IFtdLCBjb25maXJtQ2IgPSAtPikgLT5cbiAgICBAc2V0U3RhdGUge1xuICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgcG9zaXRpb246IHBvc2l0aW9uXG4gICAgICBhY3R1YWxEYXRlOiBkYXRlXG4gICAgICBkaXNhYmxlZDogZGlzYWJsZWRcbiAgICB9XG4gIFxuICAgIEBzZXRQcm9wcyBjb25maXJtQ2I6IGNvbmZpcm1DYlxuICBcbiAgaGlkZTogLT5cbiAgICBAc2V0U3RhdGUgdmlzaWJsZTogZmFsc2VcbiAgICovXG5cbiAgLyoqXG4gICogSW52b2tlZCB3aGVuIGRheSBhdCBjYWxlbmRhciBpcyBzZWxlY3RlZFxuICAqXG4gICogQHBhcmFtIHtudW1iZXJ9IGRheSBXaGljaCBkYXkgd2FzIHNlbGVjdGVkXG4gICAqL1xuICBoYW5kbGVEYXRlQ2hhbmdlOiBmdW5jdGlvbihkYXksIG1vbnRoLCB5ZWFyKSB7XG4gICAgdmFyIG5leHREYXRlO1xuICAgIG5leHREYXRlID0gdGhpcy5zdGF0ZS5hY3R1YWxEYXRlO1xuICAgIGlmIChkYXkgIT0gbnVsbCkge1xuICAgICAgbmV4dERhdGUuc2V0RGF0ZShkYXkpO1xuICAgIH1cbiAgICBpZiAobW9udGggIT0gbnVsbCkge1xuICAgICAgbmV4dERhdGUuc2V0TW9udGgobW9udGgpO1xuICAgIH1cbiAgICBpZiAoeWVhciAhPSBudWxsKSB7XG4gICAgICBuZXh0RGF0ZS5zZXRGdWxsWWVhcih5ZWFyKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYWN0dWFsRGF0ZTogbmV4dERhdGVcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gICAqL1xuICBoYW5kbGVUaW1lQ2hhbmdlOiBmdW5jdGlvbih0eXBlLCB2YWx1ZSkge1xuICAgIHZhciBuZXh0RGF0ZTtcbiAgICBuZXh0RGF0ZSA9IHRoaXMuc3RhdGUuYWN0dWFsRGF0ZTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ2hvdXInOlxuICAgICAgICBuZXh0RGF0ZS5zZXRIb3Vycyh2YWx1ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbWludXRlJzpcbiAgICAgICAgbmV4dERhdGUuc2V0TWludXRlcyh2YWx1ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2Vjb25kJzpcbiAgICAgICAgbmV4dERhdGUuc2V0U2Vjb25kcyh2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNldFN0YXRlKG5leHREYXRlKTtcbiAgfSxcbiAgaGFuZGxlQ29uZmlybTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMucHJvcHMuY29uZmlybUNiICE9IG51bGwpIHtcbiAgICAgIHRoaXMucHJvcHMuY29uZmlybUNiKHRoaXMuc3RhdGUuYWN0dWFsRGF0ZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmhpZGUoKTtcbiAgfSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgIHBvc2l0aW9uOiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICAgIH0sXG4gICAgICBhY3R1YWxEYXRlOiBuZXcgRGF0ZSxcbiAgICAgIGRpc2FibGVkOiBbXVxuICAgIH07XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFjdHVhbERhdGUsIGNhbGVuZGFyU3R5bGVzLCBjb250YWluZXJTdHlsZXMsIGhvdXJzLCBtaW5zLCBtb250aCwgc2VjcywgeWVhcjtcbiAgICBhY3R1YWxEYXRlID0gdGhpcy5zdGF0ZS5hY3R1YWxEYXRlO1xuICAgIG1vbnRoID0gdHJsKFwiZ3VpLmRhdGV0aW1lLm1vbnRocy5cIiArICh0aGlzLnN0YXRlLmFjdHVhbERhdGUuZ2V0TW9udGgoKSkpO1xuICAgIHllYXIgPSBhY3R1YWxEYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcbiAgICBob3VycyA9IGFjdHVhbERhdGUuZ2V0SG91cnMoKTtcbiAgICBtaW5zID0gYWN0dWFsRGF0ZS5nZXRNaW51dGVzKCk7XG4gICAgc2VjcyA9IGFjdHVhbERhdGUuZ2V0U2Vjb25kcygpO1xuICAgIGNvbnRhaW5lclN0eWxlcyA9IHtcbiAgICAgIGRpc3BsYXk6IHRoaXMuc3RhdGUudmlzaWJsZSA/ICdibG9jaycgOiAnbm9uZSdcbiAgICB9O1xuICAgIGNhbGVuZGFyU3R5bGVzID0ge307XG4gICAgaWYgKHRoaXMuc3RhdGUudmlzaWJsZSkge1xuICAgICAgY2FsZW5kYXJTdHlsZXMgPSB7XG4gICAgICAgIGxlZnQ6IHRoaXMuc3RhdGUucG9zaXRpb24ueCxcbiAgICAgICAgdG9wOiB0aGlzLnN0YXRlLnBvc2l0aW9uLnlcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS5kaXYsIHtcbiAgICAgIFwic3R5bGVcIjogY29udGFpbmVyU3R5bGVzXG4gICAgfSwgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00uZGl2LCB7XG4gICAgICBcImNsYXNzTmFtZVwiOiBcIm92ZXJsYXlcIixcbiAgICAgIFwib25DbGlja1wiOiB0aGlzLmhpZGVcbiAgICB9KSwgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00uZGl2LCB7XG4gICAgICBcImNsYXNzTmFtZVwiOiBcImNhbGVuZGFyXCIsXG4gICAgICBcInN0eWxlXCI6IGNhbGVuZGFyU3R5bGVzXG4gICAgfSwgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00uZGl2LCB7XG4gICAgICBcImNsYXNzTmFtZVwiOiBcImhlYWRcIlxuICAgIH0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLnNwYW4sIHtcbiAgICAgIFwiY2xhc3NOYW1lXCI6IFwidGl0bGVcIlxuICAgIH0sIG1vbnRoLCBcIiAtIFwiLCB5ZWFyKSwgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00uc3Bhbiwge1xuICAgICAgXCJjbGFzc05hbWVcIjogXCJjbG9zZXJcIixcbiAgICAgIFwib25DbGlja1wiOiB0aGlzLmhpZGVcbiAgICB9LCBcInhcIikpLCBSZWFjdC5jcmVhdGVFbGVtZW50KEZ1bGxDYWxlbmRhciwge1xuICAgICAgXCJkYXRlXCI6IHRoaXMuc3RhdGUuYWN0dWFsRGF0ZSxcbiAgICAgIFwiZGlzYWJsZWRcIjogdGhpcy5zdGF0ZS5kaXNhYmxlZCxcbiAgICAgIFwib25EYXlTZWxlY3RcIjogdGhpcy5oYW5kbGVEYXRlQ2hhbmdlLFxuICAgICAgXCJvbk1vbnRoWWVhckNoYW5nZVwiOiB0aGlzLmhhbmRsZURhdGVDaGFuZ2UuYmluZCh0aGlzLCBudWxsKVxuICAgIH0pLCBSZWFjdC5jcmVhdGVFbGVtZW50KFRpbWVQaWNrZXIsIHtcbiAgICAgIFwiaG91cnNcIjogaG91cnMsXG4gICAgICBcIm1pbnNcIjogbWlucyxcbiAgICAgIFwic2Vjc1wiOiBzZWNzLFxuICAgICAgXCJkaXNhYmxlZFwiOiB0aGlzLnN0YXRlLmRpc2FibGVkLFxuICAgICAgXCJvblRpbWVDaGFuZ2VcIjogdGhpcy5oYW5kbGVUaW1lQ2hhbmdlXG4gICAgfSksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLmJ1dHRvbiwge1xuICAgICAgXCJjbGFzc05hbWVcIjogXCJjb25maXJtXCIsXG4gICAgICBcIm9uQ2xpY2tcIjogdGhpcy5oYW5kbGVDb25maXJtXG4gICAgfSwgdHJsKCdndWkuZGF0ZXRpbWUuY29uZmlybWJ0bicpKSkpO1xuICB9XG59KTtcbiIsInZhciBUaW1lQ2VsbCwgY2xhc3NTZXQsIGRvbUV2ZW50cztcblxuY2xhc3NTZXQgPSByZXF1aXJlKCdyZWFjdC9saWIvY3gnKTtcblxuZG9tRXZlbnRzID0gcmVxdWlyZSgnZG9tLWV2ZW50cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVDZWxsID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBzdGF0aWNzOiB7XG4gICAgZGVsYXlCZWZvcmVTdGFydDogMTAwMCxcbiAgICBpbmNyZW1lbnRTcGVlZDogMTAwXG4gIH0sXG4gIF9zdGFydFRpbWVyOiBudWxsLFxuICBfaW5jcmVtZW50VGltZXI6IG51bGwsXG4gIGhhbmRsZU1vdXNlRG93bjogZnVuY3Rpb24oZSkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYWN0aXZlOiB0cnVlXG4gICAgfSk7XG4gICAgZG9tRXZlbnRzLm9uY2UoZG9jdW1lbnQsICdtb3VzZXVwJywgdGhpcy5oYW5kbGVNb3VzZVVwKTtcbiAgICByZXR1cm4gdGhpcy5fc3RhcnRUaW1lciA9IHNldFRpbWVvdXQodGhpcy5zdGFydEluY3JlbWVudGluZywgVGltZUNlbGwuZGVsYXlCZWZvcmVTdGFydCk7XG4gIH0sXG4gIGNsZWFyU3RhcnRUaW1lcjogZnVuY3Rpb24oKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3N0YXJ0VGltZXIpO1xuICAgIHJldHVybiB0aGlzLl9zdGFydFRpbWVyID0gbnVsbDtcbiAgfSxcbiAgc3RhcnRJbmNyZW1lbnRpbmc6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2xlYXJTdGFydFRpbWVyKCk7XG4gICAgcmV0dXJuIHRoaXMuX2luY3JlbWVudFRpbWVyID0gc2V0SW50ZXJ2YWwodGhpcy5pbmNyZW1lbnRWYWx1ZSwgVGltZUNlbGwuaW5jcmVtZW50U3BlZWQpO1xuICB9LFxuICBoYW5kbGVNb3VzZVVwOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fc3RhcnRUaW1lciAhPSBudWxsKSB7XG4gICAgICB0aGlzLmNsZWFyU3RhcnRUaW1lcigpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5faW5jcmVtZW50VGltZXIgIT0gbnVsbCkge1xuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLl9pbmNyZW1lbnRUaW1lcik7XG4gICAgICB0aGlzLl9pbmNyZW1lbnRUaW1lciA9IG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICB9KTtcbiAgfSxcbiAgaW5jcmVtZW50VmFsdWU6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgdmFsdWU7XG4gICAgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlICsgMTtcbiAgICBpZiAodmFsdWUgPiB0aGlzLnByb3BzLm1heFZhbCkge1xuICAgICAgdmFsdWUgPSAwO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLnByb3BzLnR5cGUsIHZhbHVlKTtcbiAgfSxcbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzKSB7XG4gICAgaWYgKG5leHRQcm9wcy52YWx1ZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIHZhbHVlOiBuZXh0UHJvcHMudmFsdWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsdWU6IHRoaXMucHJvcHMudmFsdWUsXG4gICAgICBhY3RpdmU6IGZhbHNlXG4gICAgfTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2xhc3NlcywgY2xpY2tDYiwgbW91c2VEb3duQ2IsIHZhbHVlO1xuICAgIGNsYXNzZXMgPSBjbGFzc1NldCh7XG4gICAgICAndmFsdWUnOiB0cnVlLFxuICAgICAgJ2Rpc2FibGVkJzogdGhpcy5wcm9wcy5kaXNhYmxlZCxcbiAgICAgICdoaWdobGlnaHRhYmxlJzogIXRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAnYWN0aXZlJzogdGhpcy5zdGF0ZS5hY3RpdmVcbiAgICB9KTtcbiAgICB2YWx1ZSA9IHRoaXMuc3RhdGUudmFsdWUudG9TdHJpbmcoKTtcbiAgICBpZiAodmFsdWUubGVuZ3RoID09PSAxKSB7XG4gICAgICB2YWx1ZSA9IFwiMFwiICsgdmFsdWU7XG4gICAgfVxuICAgIGlmICghdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuICAgICAgY2xpY2tDYiA9IHRoaXMuaW5jcmVtZW50VmFsdWU7XG4gICAgICBtb3VzZURvd25DYiA9IHRoaXMuaGFuZGxlTW91c2VEb3duO1xuICAgIH1cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00uc3Bhbiwge1xuICAgICAgXCJjbGFzc05hbWVcIjogY2xhc3NlcyxcbiAgICAgIFwib25DbGlja1wiOiBjbGlja0NiLFxuICAgICAgXCJvbk1vdXNlRG93blwiOiBtb3VzZURvd25DYlxuICAgIH0sIHZhbHVlKTtcbiAgfVxufSk7XG4iLCJ2YXIgVGltZUNlbGwsXG4gIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG5UaW1lQ2VsbCA9IHJlcXVpcmUoJy4vdGltZS1jZWxsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBjcmVhdGVUaW1lQ2VsbDogZnVuY3Rpb24odmFsdWUsIHR5cGUsIGRpc2FibGVkLCBtYXhWYWwpIHtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChUaW1lQ2VsbCwge1xuICAgICAgXCJ2YWx1ZVwiOiB2YWx1ZSxcbiAgICAgIFwidHlwZVwiOiB0eXBlLFxuICAgICAgXCJkaXNhYmxlZFwiOiBkaXNhYmxlZCxcbiAgICAgIFwibWF4VmFsXCI6IG1heFZhbCxcbiAgICAgIFwib25DaGFuZ2VcIjogdGhpcy5wcm9wcy5vblRpbWVDaGFuZ2VcbiAgICB9KTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgaG91ckRpc2FibGVkLCBtaW5EaXNhYmxlZCwgc2VjRGlzYWJsZWQ7XG4gICAgaG91ckRpc2FibGVkID0gX19pbmRleE9mLmNhbGwodGhpcy5wcm9wcy5kaXNhYmxlZCwgJ2gnKSA+PSAwO1xuICAgIG1pbkRpc2FibGVkID0gX19pbmRleE9mLmNhbGwodGhpcy5wcm9wcy5kaXNhYmxlZCwgJ2knKSA+PSAwO1xuICAgIHNlY0Rpc2FibGVkID0gX19pbmRleE9mLmNhbGwodGhpcy5wcm9wcy5kaXNhYmxlZCwgJ3MnKSA+PSAwO1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS5kaXYsIHtcbiAgICAgIFwiY2xhc3NOYW1lXCI6IFwidGltZXJvd1wiXG4gICAgfSwgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00uc3Bhbiwge1xuICAgICAgXCJjbGFzc05hbWVcIjogXCJsYWJlbFwiXG4gICAgfSwgdHJsKCdndWkuZGF0ZXRpbWUudGltZWxhYmVsJyksIFwiOlwiKSwgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00uZGl2LCB7XG4gICAgICBcImNsYXNzTmFtZVwiOiBcInRpbWVcIlxuICAgIH0sIHRoaXMuY3JlYXRlVGltZUNlbGwodGhpcy5wcm9wcy5ob3VycywgJ2hvdXInLCBob3VyRGlzYWJsZWQsIDIzKSwgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00uc3Bhbiwge1xuICAgICAgXCJjbGFzc05hbWVcIjogXCJjb2xvblwiXG4gICAgfSwgXCI6XCIpLCB0aGlzLmNyZWF0ZVRpbWVDZWxsKHRoaXMucHJvcHMubWlucywgJ21pbnV0ZScsIG1pbkRpc2FibGVkLCA1OSksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLnNwYW4sIHtcbiAgICAgIFwiY2xhc3NOYW1lXCI6IFwiY29sb25cIlxuICAgIH0sIFwiOlwiKSwgdGhpcy5jcmVhdGVUaW1lQ2VsbCh0aGlzLnByb3BzLnNlY3MsICdzZWNvbmQnLCBzZWNEaXNhYmxlZCwgNTkpKSk7XG4gIH1cbn0pO1xuIl19
(13)
});
