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
var Calendar, CalendarDay, classSet, dayNamesAbbr, util,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

classSet = _dereq_('react/lib/cx');

Calendar = _dereq_('calendar.js');

util = _dereq_('util');

CalendarDay = _dereq_('./calendar-day');

dayNamesAbbr = ['Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat', 'Sun'];

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
    name = dayNamesAbbr[order];
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
var FullCalendar, TimePicker, months;

FullCalendar = _dereq_('./calendar');

TimePicker = _dereq_('./time-picker');

months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Semptember', 'October', 'December', 'November'];

module.exports = React.createClass({
  propTypes: {
    visible: React.PropTypes.bool,
    disabled: React.PropTypes.array
  },

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
    if (this.props.onDateConfirm != null) {
      return this.props.onDateConfirm(this.state.actualDate);
    }
  },
  getInitialState: function() {
    return {
      actualDate: new Date
    };
  },
  getDefaultProps: function() {
    return {
      visible: true,
      disabled: []
    };
  },
  render: function() {
    var Closer, actualDate, calendarStyles, containerStyles, hours, mins, month, secs, year;
    actualDate = this.state.actualDate;
    month = months[this.state.actualDate.getMonth()];
    year = actualDate.getFullYear().toString();
    hours = actualDate.getHours();
    mins = actualDate.getMinutes();
    secs = actualDate.getSeconds();
    containerStyles = {
      display: this.props.visible ? 'block' : 'none'
    };
    calendarStyles = {};
    if (this.props.onClose != null) {
      Closer = React.createElement(React.DOM.span, {
        "className": "closer",
        "onClick": this.props.onClose
      }, "x");
    }
    return React.createElement(React.DOM.div, {
      "className": "datetime-picker"
    }, React.createElement(React.DOM.div, {
      "className": "head"
    }, React.createElement(React.DOM.span, {
      "className": "title"
    }, month, " - ", year), Closer), React.createElement(FullCalendar, {
      "date": this.state.actualDate,
      "disabled": this.props.disabled,
      "onDaySelect": this.handleDateChange,
      "onMonthYearChange": this.handleDateChange.bind(this, null)
    }), React.createElement(TimePicker, {
      "hours": hours,
      "mins": mins,
      "secs": secs,
      "disabled": this.props.disabled,
      "onTimeChange": this.handleTimeChange
    }), React.createElement(React.DOM.button, {
      "className": "confirm",
      "onClick": this.handleConfirm
    }, "Set date"));
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
    }, "Time:"), React.createElement(React.DOM.div, {
      "className": "time"
    }, this.createTimeCell(this.props.hours, 'hour', hourDisabled, 23), React.createElement(React.DOM.span, {
      "className": "colon"
    }, ":"), this.createTimeCell(this.props.mins, 'minute', minDisabled, 59), React.createElement(React.DOM.span, {
      "className": "colon"
    }, ":"), this.createTimeCell(this.props.secs, 'second', secDisabled, 59)));
  }
});

},{"./time-cell":14}]},{},[13])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9zcnYvZ2l0L3JlYWN0LWRhdGV0aW1lLXBpY2tlci9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvc3J2L2dpdC9yZWFjdC1kYXRldGltZS1waWNrZXIvbm9kZV9tb2R1bGVzL2NhbGVuZGFyLmpzL2NhbGVuZGFyLmpzIiwiL3Nydi9naXQvcmVhY3QtZGF0ZXRpbWUtcGlja2VyL25vZGVfbW9kdWxlcy9kb20tZXZlbnRzL2luZGV4LmpzIiwiL3Nydi9naXQvcmVhY3QtZGF0ZXRpbWUtcGlja2VyL25vZGVfbW9kdWxlcy9kb20tZXZlbnRzL25vZGVfbW9kdWxlcy9zeW50aGV0aWMtZG9tLWV2ZW50cy9pbmRleC5qcyIsIi9zcnYvZ2l0L3JlYWN0LWRhdGV0aW1lLXBpY2tlci9ub2RlX21vZHVsZXMvZG9tLWV2ZW50cy9ub2RlX21vZHVsZXMvc3ludGhldGljLWRvbS1ldmVudHMvaW5pdC5qc29uIiwiL3Nydi9naXQvcmVhY3QtZGF0ZXRpbWUtcGlja2VyL25vZGVfbW9kdWxlcy9kb20tZXZlbnRzL25vZGVfbW9kdWxlcy9zeW50aGV0aWMtZG9tLWV2ZW50cy90eXBlcy5qc29uIiwiL3Nydi9naXQvcmVhY3QtZGF0ZXRpbWUtcGlja2VyL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIvc3J2L2dpdC9yZWFjdC1kYXRldGltZS1waWNrZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL3Nydi9naXQvcmVhY3QtZGF0ZXRpbWUtcGlja2VyL25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCIvc3J2L2dpdC9yZWFjdC1kYXRldGltZS1waWNrZXIvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzIiwiL3Nydi9naXQvcmVhY3QtZGF0ZXRpbWUtcGlja2VyL25vZGVfbW9kdWxlcy9yZWFjdC9saWIvY3guanMiLCIvc3J2L2dpdC9yZWFjdC1kYXRldGltZS1waWNrZXIvc3JjL2pzL2NhbGVuZGFyLWRheS5qcyIsIi9zcnYvZ2l0L3JlYWN0LWRhdGV0aW1lLXBpY2tlci9zcmMvanMvY2FsZW5kYXIuanMiLCIvc3J2L2dpdC9yZWFjdC1kYXRldGltZS1waWNrZXIvc3JjL2pzL2Zha2VfMjI4MDdiNzUuanMiLCIvc3J2L2dpdC9yZWFjdC1kYXRldGltZS1waWNrZXIvc3JjL2pzL3RpbWUtY2VsbC5qcyIsIi9zcnYvZ2l0L3JlYWN0LWRhdGV0aW1lLXBpY2tlci9zcmMvanMvdGltZS1waWNrZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gQ2FsZW5kYXIgKGRhdGUpIHtcbiAgICAvLyBhIGN1c3RvbSAndG9kYXknIGRhdGUgY2FuIGJlIGluamVjdGVkXG4gICAgdGhpcy5ub3cgPSBkYXRlIHx8IG5ldyBEYXRlKCk7XG4gIH1cblxuICBDYWxlbmRhci5wcm90b3R5cGUubW9udGhDYWxlbmRhciA9IGZ1bmN0aW9uKGRhdGUsIG9wdGlvbnMsIGFjdGlvbikge1xuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBvcHRpb25zLnZpZXcgPSAnbW9udGgnO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRpb25zID0geyB2aWV3OiAnbW9udGgnIH07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNyZWF0ZUNhbGVuZGFyKGRhdGUsIG9wdGlvbnMsIGFjdGlvbik7XG4gIH07XG5cbiAgQ2FsZW5kYXIucHJvdG90eXBlLndlZWtzQ2FsZW5kYXIgPSBmdW5jdGlvbihkYXRlLCBvcHRpb25zLCBhY3Rpb24pIHtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgb3B0aW9ucy52aWV3ID0gJ3dlZWtzJztcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9ucyA9IHsgdmlldzogJ3dlZWtzJyB9O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jcmVhdGVDYWxlbmRhcihkYXRlLCBvcHRpb25zLCBhY3Rpb24pO1xuICB9O1xuXG4gIENhbGVuZGFyLnByb3RvdHlwZS5jcmVhdGVDYWxlbmRhciA9IGZ1bmN0aW9uIChkYXRlT2JqLCBvcHRpb25zLCBhY3Rpb24pIHtcbiAgICB2YXIgZGF0ZSA9IGRhdGVPYmogfHwgdGhpcy5ub3c7XG4gICAgb3B0aW9ucy52aWV3ID0gb3B0aW9ucy52aWV3IHx8ICdtb250aCc7XG4gICAgdmFyIGNZZWFyID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgIHZhciBjTW9udGggPSBkYXRlLmdldE1vbnRoKCk7XG4gICAgdmFyIGNEYXRlID0gZGF0ZS5nZXREYXRlKCk7XG4gICAgdmFyIGNXZWVrU3RhcnQgPSAob3B0aW9ucy53ZWVrU3RhcnQgPT09IDApID8gMCA6IG9wdGlvbnMud2Vla1N0YXJ0IHx8IDE7IC8vIHdlZWsgc3RhcnRzIG9uIG1vbmRheSBieSBkZWZhdWx0LCBzdW5kYXk6IDBcbiAgICAvLyBUT0RPOiBzd2l0Y2hcbiAgICB2YXIgY1dlZWtzLCBmaXJzdERheU9mVmlldywgZmlyc3REYXlPZmZzZXQ7XG4gICAgLy8gLS0tIG1vbnRoQ2FsZW5kYXIgLS0tXG4gICAgaWYgKG9wdGlvbnMudmlldyA9PT0gJ21vbnRoJykge1xuICAgICAgdmFyIGZpcnN0RGF5T2ZNb250aCA9IG5ldyBEYXRlKGNZZWFyLCBjTW9udGgsIDEpLmdldERheSgpOyAvLyB3ZWVrZGF5IG9mIGZpcnN0IG1vbnRoXG4gICAgICB2YXIgbGFzdERhdGVPZk1vbnRoID0gbmV3IERhdGUoY1llYXIsIGNNb250aCsxLCAwKS5nZXREYXRlKCk7IC8vIG51bWJlciBvZiBkYXlzIGluIGN1cnJlbnQgbW9udGhcbiAgICAgIGZpcnN0RGF5T2Zmc2V0ID0gY1dlZWtTdGFydCA+IGZpcnN0RGF5T2ZNb250aCA/IGNXZWVrU3RhcnQtNyA6IGNXZWVrU3RhcnQ7IC8vIHNldCBvZmZzZXQgZm9yIGZpcnN0IGRheSBvZiB2aWV3XG4gICAgICBmaXJzdERheU9mVmlldyA9ICBuZXcgRGF0ZShjWWVhciwgY01vbnRoLCBmaXJzdERheU9mZnNldC1maXJzdERheU9mTW9udGgrMSk7IC8vICBmaXJzdCBkYXkgaW4gZmlyc3Qgcm93XG4gICAgICAvLyBjYWxjdWxhdGUgcm93cyBvZiB2aWV3XG4gICAgICAvLyBUT0RPOiBzaW1wbGlmeSFcbiAgICAgIGlmKGZpcnN0RGF5T2ZWaWV3LmdldERhdGUoKSA9PT0gMSkge1xuICAgICAgICAvLyBNb250aCBzdGFydHMgYXQgcm93IDEgaW4gY29sdW1uIDFcbiAgICAgICAgY1dlZWtzID0gTWF0aC5jZWlsKGxhc3REYXRlT2ZNb250aCAvIDcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGxhc3REYXRlT2ZMYXN0TW9udGggPSBuZXcgRGF0ZShjWWVhciwgY01vbnRoLCAwKS5nZXREYXRlKCk7XG4gICAgICAgIHZhciBhZGRpdGlvbmFsRGF5cyA9IGxhc3REYXRlT2ZMYXN0TW9udGggLSBmaXJzdERheU9mVmlldy5nZXREYXRlKCkgKyAxO1xuICAgICAgICBjV2Vla3MgPSBNYXRoLmNlaWwoKGxhc3REYXRlT2ZNb250aCArIGFkZGl0aW9uYWxEYXlzKSAvIDcpO1xuICAgICAgfVxuICAgIC8vIC0tLSB3ZWVrc0NhbGVuZGFyIC0tLVxuICAgIH0gZWxzZSBpZiAob3B0aW9ucy52aWV3ID09PSAnd2Vla3MnKSB7XG4gICAgICBjV2Vla3MgPSBvcHRpb25zLndlZWtzIHx8IDQ7IC8vIHNob3cgNCB3ZWVrcyBieSBkZWZhdWx0XG4gICAgICBmaXJzdERheU9mVmlldyA9IG5ldyBEYXRlKGNZZWFyLCBjTW9udGgsIGNEYXRlKTtcbiAgICAgIGZpcnN0RGF5T2Zmc2V0ID0gY1dlZWtTdGFydCA+IGZpcnN0RGF5T2ZWaWV3LmdldERheSgpID8gY1dlZWtTdGFydC03IDogY1dlZWtTdGFydDtcbiAgICAgIGZpcnN0RGF5T2ZWaWV3LnNldERhdGUoY0RhdGUgLSBmaXJzdERheU9mVmlldy5nZXREYXkoKSArIHBhcnNlSW50KGZpcnN0RGF5T2Zmc2V0LCAxMCkpO1xuICAgIH1cblxuICAgIHZhciBjdXJyZW50RGF0ZSA9IGZpcnN0RGF5T2ZWaWV3O1xuICAgIHZhciBjYWwgPSBbXTtcblxuICAgIC8vIGNyZWF0ZSBjYWxlbmRhciBtb2RlbFxuICAgIGZvciAodmFyIHdlZWsgPSAwOyB3ZWVrIDwgY1dlZWtzOyB3ZWVrKyspIHtcbiAgICAgIGNhbFt3ZWVrXSA9IFtdO1xuICAgICAgZm9yICh2YXIgZGF5ID0gMDsgZGF5IDwgNzsgZGF5KyspIHtcbiAgICAgICAgLy8gZGV0ZXJtaW5lIGV4cG9zZWQgcGFyYW1ldGVyc1xuICAgICAgICB2YXIgdG9kYXkgPSAodGhpcy5ub3cuZ2V0RnVsbFllYXIoKSA9PT0gY3VycmVudERhdGUuZ2V0RnVsbFllYXIoKSAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vdy5nZXRNb250aCgpID09PSBjdXJyZW50RGF0ZS5nZXRNb250aCgpICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm93LmdldERhdGUoKSA9PT0gY3VycmVudERhdGUuZ2V0RGF0ZSgpKTtcblxuICAgICAgICAvLyBpbXBsZW1lbnRhdGlvbiBvZiBhbHJlYWR5IHBhc3QgZGF5c1xuICAgICAgICB2YXIgcGFzdERheSA9IChjdXJyZW50RGF0ZS52YWx1ZU9mKCkgPCB0aGlzLm5vdy52YWx1ZU9mKCkgJiYgIXRvZGF5KTtcblxuICAgICAgICB2YXIgdGhpc01vbnRoID0gKGNNb250aCA9PT0gY3VycmVudERhdGUuZ2V0TW9udGgoKSk7XG5cbiAgICAgICAgLy8gVE9ETzogdGhpc1dlZWs/XG5cbiAgICAgICAgdmFyIGNvbnRlbnRzID0ge1xuICAgICAgICAgIGRhdGU6IGN1cnJlbnREYXRlLFxuICAgICAgICAgIGlzSW5DdXJyZW50TW9udGg6IHRoaXNNb250aCxcbiAgICAgICAgICBpc1RvZGF5OiB0b2RheSxcbiAgICAgICAgICBpc1Bhc3REYXRlOiBwYXN0RGF5XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gaWYgYWN0aW9uIGlzIGRlZmluZWQgcmVzdWx0cyBvZiB0aGUgYWN0aW9uIGZ1bmN0aW9uIGFyZSBwdXNoZWQgaW50byB0aGUgY2FsZW5kYXIgYXJyYXlcbiAgICAgICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBhY3Rpb24pIHtcbiAgICAgICAgICBjb250ZW50cy5lbnRyaWVzID0gYWN0aW9uKGN1cnJlbnREYXRlLCB0aGlzTW9udGgsIHRvZGF5LCBwYXN0RGF5KSB8fCBbXTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY2FsW3dlZWtdLnB1c2goY29udGVudHMpO1xuICAgICAgICBcbiAgICAgICAgLy8gaW5jcmVtZW50IGRheVxuICAgICAgICBjdXJyZW50RGF0ZSA9IG5ldyBEYXRlKGN1cnJlbnREYXRlLmdldEZ1bGxZZWFyKCksIGN1cnJlbnREYXRlLmdldE1vbnRoKCksIGN1cnJlbnREYXRlLmdldERhdGUoKSsxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb3B1bGF0ZShmbikge1xuICAgICAgZm9yICh2YXIgaSA9IGNhbC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBmb3IgKHZhciBqID0gY2FsW2ldLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tKSB7XG4gICAgICAgICAgY2FsW2ldW2pdLmVudHJpZXMgPSBmbihjYWxbaV1bal0uZGF0ZSwgY2FsW2ldW2pdLmlzSW5DdXJyZW50TW9udGgsIGNhbFtpXVtqXS5pc1RvZGF5LCBjYWxbaV1bal0uaXNQYXN0RGF0ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY2FsZW5kYXI6IGNhbCxcbiAgICAgIHBvcHVsYXRlOiBwb3B1bGF0ZVxuICAgIH07XG5cbiAgfTtcblxuICAvLyBmb3Igbm9kZS5qc1xuICBpZiAodHlwZW9mKG1vZHVsZSkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDYWxlbmRhcjtcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3cuQ2FsZW5kYXIgPSBDYWxlbmRhcjtcbiAgfVxufSkoKTsiLCJcbnZhciBzeW50aCA9IHJlcXVpcmUoJ3N5bnRoZXRpYy1kb20tZXZlbnRzJyk7XG5cbnZhciBvbiA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUsIGZuLCBjYXB0dXJlKSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBmbiwgY2FwdHVyZSB8fCBmYWxzZSk7XG59O1xuXG52YXIgb2ZmID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZSwgZm4sIGNhcHR1cmUpIHtcbiAgICByZXR1cm4gZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGZuLCBjYXB0dXJlIHx8IGZhbHNlKTtcbn07XG5cbnZhciBvbmNlID0gZnVuY3Rpb24gKGVsZW1lbnQsIG5hbWUsIGZuLCBjYXB0dXJlKSB7XG4gICAgZnVuY3Rpb24gdG1wIChldikge1xuICAgICAgICBvZmYoZWxlbWVudCwgbmFtZSwgdG1wLCBjYXB0dXJlKTtcbiAgICAgICAgZm4oZXYpO1xuICAgIH1cbiAgICBvbihlbGVtZW50LCBuYW1lLCB0bXAsIGNhcHR1cmUpO1xufTtcblxudmFyIGVtaXQgPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lLCBvcHQpIHtcbiAgICB2YXIgZXYgPSBzeW50aChuYW1lLCBvcHQpO1xuICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChldik7XG59O1xuXG5pZiAoIWRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICBvbiA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWUsIGZuKSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50LmF0dGFjaEV2ZW50KCdvbicgKyBuYW1lLCBmbik7XG4gICAgfTtcbn1cblxuaWYgKCFkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gICAgb2ZmID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZSwgZm4pIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuZGV0YWNoRXZlbnQoJ29uJyArIG5hbWUsIGZuKTtcbiAgICB9O1xufVxuXG5pZiAoIWRvY3VtZW50LmRpc3BhdGNoRXZlbnQpIHtcbiAgICBlbWl0ID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZSwgb3B0KSB7XG4gICAgICAgIHZhciBldiA9IHN5bnRoKG5hbWUsIG9wdCk7XG4gICAgICAgIHJldHVybiBlbGVtZW50LmZpcmVFdmVudCgnb24nICsgZXYudHlwZSwgZXYpO1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG9uOiBvbixcbiAgICBvZmY6IG9mZixcbiAgICBvbmNlOiBvbmNlLFxuICAgIGVtaXQ6IGVtaXRcbn07XG4iLCJcbi8vIGZvciBjb21wcmVzc2lvblxudmFyIHdpbiA9IHdpbmRvdztcbnZhciBkb2MgPSBkb2N1bWVudCB8fCB7fTtcbnZhciByb290ID0gZG9jLmRvY3VtZW50RWxlbWVudCB8fCB7fTtcblxuLy8gZGV0ZWN0IGlmIHdlIG5lZWQgdG8gdXNlIGZpcmVmb3ggS2V5RXZlbnRzIHZzIEtleWJvYXJkRXZlbnRzXG52YXIgdXNlX2tleV9ldmVudCA9IHRydWU7XG50cnkge1xuICAgIGRvYy5jcmVhdGVFdmVudCgnS2V5RXZlbnRzJyk7XG59XG5jYXRjaCAoZXJyKSB7XG4gICAgdXNlX2tleV9ldmVudCA9IGZhbHNlO1xufVxuXG4vLyBXb3JrYXJvdW5kIGZvciBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTY3MzVcbmZ1bmN0aW9uIGNoZWNrX2tiKGV2LCBvcHRzKSB7XG4gICAgaWYgKGV2LmN0cmxLZXkgIT0gKG9wdHMuY3RybEtleSB8fCBmYWxzZSkgfHxcbiAgICAgICAgZXYuYWx0S2V5ICE9IChvcHRzLmFsdEtleSB8fCBmYWxzZSkgfHxcbiAgICAgICAgZXYuc2hpZnRLZXkgIT0gKG9wdHMuc2hpZnRLZXkgfHwgZmFsc2UpIHx8XG4gICAgICAgIGV2Lm1ldGFLZXkgIT0gKG9wdHMubWV0YUtleSB8fCBmYWxzZSkgfHxcbiAgICAgICAgZXYua2V5Q29kZSAhPSAob3B0cy5rZXlDb2RlIHx8IDApIHx8XG4gICAgICAgIGV2LmNoYXJDb2RlICE9IChvcHRzLmNoYXJDb2RlIHx8IDApKSB7XG5cbiAgICAgICAgZXYgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICAgICAgZXYuaW5pdEV2ZW50KG9wdHMudHlwZSwgb3B0cy5idWJibGVzLCBvcHRzLmNhbmNlbGFibGUpO1xuICAgICAgICBldi5jdHJsS2V5ICA9IG9wdHMuY3RybEtleSB8fCBmYWxzZTtcbiAgICAgICAgZXYuYWx0S2V5ICAgPSBvcHRzLmFsdEtleSB8fCBmYWxzZTtcbiAgICAgICAgZXYuc2hpZnRLZXkgPSBvcHRzLnNoaWZ0S2V5IHx8IGZhbHNlO1xuICAgICAgICBldi5tZXRhS2V5ICA9IG9wdHMubWV0YUtleSB8fCBmYWxzZTtcbiAgICAgICAgZXYua2V5Q29kZSAgPSBvcHRzLmtleUNvZGUgfHwgMDtcbiAgICAgICAgZXYuY2hhckNvZGUgPSBvcHRzLmNoYXJDb2RlIHx8IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV2O1xufVxuXG4vLyBtb2Rlcm4gYnJvd3NlcnMsIGRvIGEgcHJvcGVyIGRpc3BhdGNoRXZlbnQoKVxudmFyIG1vZGVybiA9IGZ1bmN0aW9uKHR5cGUsIG9wdHMpIHtcbiAgICBvcHRzID0gb3B0cyB8fCB7fTtcblxuICAgIC8vIHdoaWNoIGluaXQgZm4gZG8gd2UgdXNlXG4gICAgdmFyIGZhbWlseSA9IHR5cGVPZih0eXBlKTtcbiAgICB2YXIgaW5pdF9mYW0gPSBmYW1pbHk7XG4gICAgaWYgKGZhbWlseSA9PT0gJ0tleWJvYXJkRXZlbnQnICYmIHVzZV9rZXlfZXZlbnQpIHtcbiAgICAgICAgZmFtaWx5ID0gJ0tleUV2ZW50cyc7XG4gICAgICAgIGluaXRfZmFtID0gJ0tleUV2ZW50JztcbiAgICB9XG5cbiAgICB2YXIgZXYgPSBkb2MuY3JlYXRlRXZlbnQoZmFtaWx5KTtcbiAgICB2YXIgaW5pdF9mbiA9ICdpbml0JyArIGluaXRfZmFtO1xuICAgIHZhciBpbml0ID0gdHlwZW9mIGV2W2luaXRfZm5dID09PSAnZnVuY3Rpb24nID8gaW5pdF9mbiA6ICdpbml0RXZlbnQnO1xuXG4gICAgdmFyIHNpZyA9IGluaXRTaWduYXR1cmVzW2luaXRdO1xuICAgIHZhciBhcmdzID0gW107XG4gICAgdmFyIHVzZWQgPSB7fTtcblxuICAgIG9wdHMudHlwZSA9IHR5cGU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaWcubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGtleSA9IHNpZ1tpXTtcbiAgICAgICAgdmFyIHZhbCA9IG9wdHNba2V5XTtcbiAgICAgICAgLy8gaWYgbm8gdXNlciBzcGVjaWZpZWQgdmFsdWUsIHRoZW4gdXNlIGV2ZW50IGRlZmF1bHRcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2YWwgPSBldltrZXldO1xuICAgICAgICB9XG4gICAgICAgIHVzZWRba2V5XSA9IHRydWU7XG4gICAgICAgIGFyZ3MucHVzaCh2YWwpO1xuICAgIH1cbiAgICBldltpbml0XS5hcHBseShldiwgYXJncyk7XG5cbiAgICAvLyB3ZWJraXQga2V5IGV2ZW50IGlzc3VlIHdvcmthcm91bmRcbiAgICBpZiAoZmFtaWx5ID09PSAnS2V5Ym9hcmRFdmVudCcpIHtcbiAgICAgICAgZXYgPSBjaGVja19rYihldiwgb3B0cyk7XG4gICAgfVxuXG4gICAgLy8gYXR0YWNoIHJlbWFpbmluZyB1bnVzZWQgb3B0aW9ucyB0byB0aGUgb2JqZWN0XG4gICAgZm9yICh2YXIga2V5IGluIG9wdHMpIHtcbiAgICAgICAgaWYgKCF1c2VkW2tleV0pIHtcbiAgICAgICAgICAgIGV2W2tleV0gPSBvcHRzW2tleV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZXY7XG59O1xuXG52YXIgbGVnYWN5ID0gZnVuY3Rpb24gKHR5cGUsIG9wdHMpIHtcbiAgICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgICB2YXIgZXYgPSBkb2MuY3JlYXRlRXZlbnRPYmplY3QoKTtcblxuICAgIGV2LnR5cGUgPSB0eXBlO1xuICAgIGZvciAodmFyIGtleSBpbiBvcHRzKSB7XG4gICAgICAgIGlmIChvcHRzW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZXZba2V5XSA9IG9wdHNba2V5XTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBldjtcbn07XG5cbi8vIGV4cG9zZSBlaXRoZXIgdGhlIG1vZGVybiB2ZXJzaW9uIG9mIGV2ZW50IGdlbmVyYXRpb24gb3IgbGVnYWN5XG4vLyBkZXBlbmRpbmcgb24gd2hhdCB3ZSBzdXBwb3J0XG4vLyBhdm9pZHMgaWYgc3RhdGVtZW50cyBpbiB0aGUgY29kZSBsYXRlclxubW9kdWxlLmV4cG9ydHMgPSBkb2MuY3JlYXRlRXZlbnQgPyBtb2Rlcm4gOiBsZWdhY3k7XG5cbnZhciBpbml0U2lnbmF0dXJlcyA9IHJlcXVpcmUoJy4vaW5pdC5qc29uJyk7XG52YXIgdHlwZXMgPSByZXF1aXJlKCcuL3R5cGVzLmpzb24nKTtcbnZhciB0eXBlT2YgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciB0eXBzID0ge307XG4gICAgZm9yICh2YXIga2V5IGluIHR5cGVzKSB7XG4gICAgICAgIHZhciB0cyA9IHR5cGVzW2tleV07XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHR5cHNbdHNbaV1dID0ga2V5O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0eXBzW25hbWVdIHx8ICdFdmVudCc7XG4gICAgfTtcbn0pKCk7XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiaW5pdEV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCJcbiAgXSxcbiAgXCJpbml0VUlFdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiYnViYmxlc1wiLFxuICAgIFwiY2FuY2VsYWJsZVwiLFxuICAgIFwidmlld1wiLFxuICAgIFwiZGV0YWlsXCJcbiAgXSxcbiAgXCJpbml0TW91c2VFdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiYnViYmxlc1wiLFxuICAgIFwiY2FuY2VsYWJsZVwiLFxuICAgIFwidmlld1wiLFxuICAgIFwiZGV0YWlsXCIsXG4gICAgXCJzY3JlZW5YXCIsXG4gICAgXCJzY3JlZW5ZXCIsXG4gICAgXCJjbGllbnRYXCIsXG4gICAgXCJjbGllbnRZXCIsXG4gICAgXCJjdHJsS2V5XCIsXG4gICAgXCJhbHRLZXlcIixcbiAgICBcInNoaWZ0S2V5XCIsXG4gICAgXCJtZXRhS2V5XCIsXG4gICAgXCJidXR0b25cIixcbiAgICBcInJlbGF0ZWRUYXJnZXRcIlxuICBdLFxuICBcImluaXRNdXRhdGlvbkV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCIsXG4gICAgXCJyZWxhdGVkTm9kZVwiLFxuICAgIFwicHJldlZhbHVlXCIsXG4gICAgXCJuZXdWYWx1ZVwiLFxuICAgIFwiYXR0ck5hbWVcIixcbiAgICBcImF0dHJDaGFuZ2VcIlxuICBdLFxuICBcImluaXRLZXlib2FyZEV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCIsXG4gICAgXCJ2aWV3XCIsXG4gICAgXCJjdHJsS2V5XCIsXG4gICAgXCJhbHRLZXlcIixcbiAgICBcInNoaWZ0S2V5XCIsXG4gICAgXCJtZXRhS2V5XCIsXG4gICAgXCJrZXlDb2RlXCIsXG4gICAgXCJjaGFyQ29kZVwiXG4gIF0sXG4gIFwiaW5pdEtleUV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJidWJibGVzXCIsXG4gICAgXCJjYW5jZWxhYmxlXCIsXG4gICAgXCJ2aWV3XCIsXG4gICAgXCJjdHJsS2V5XCIsXG4gICAgXCJhbHRLZXlcIixcbiAgICBcInNoaWZ0S2V5XCIsXG4gICAgXCJtZXRhS2V5XCIsXG4gICAgXCJrZXlDb2RlXCIsXG4gICAgXCJjaGFyQ29kZVwiXG4gIF1cbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJNb3VzZUV2ZW50XCIgOiBbXG4gICAgXCJjbGlja1wiLFxuICAgIFwibW91c2Vkb3duXCIsXG4gICAgXCJtb3VzZXVwXCIsXG4gICAgXCJtb3VzZW92ZXJcIixcbiAgICBcIm1vdXNlbW92ZVwiLFxuICAgIFwibW91c2VvdXRcIlxuICBdLFxuICBcIktleWJvYXJkRXZlbnRcIiA6IFtcbiAgICBcImtleWRvd25cIixcbiAgICBcImtleXVwXCIsXG4gICAgXCJrZXlwcmVzc1wiXG4gIF0sXG4gIFwiTXV0YXRpb25FdmVudFwiIDogW1xuICAgIFwiRE9NU3VidHJlZU1vZGlmaWVkXCIsXG4gICAgXCJET01Ob2RlSW5zZXJ0ZWRcIixcbiAgICBcIkRPTU5vZGVSZW1vdmVkXCIsXG4gICAgXCJET01Ob2RlUmVtb3ZlZEZyb21Eb2N1bWVudFwiLFxuICAgIFwiRE9NTm9kZUluc2VydGVkSW50b0RvY3VtZW50XCIsXG4gICAgXCJET01BdHRyTW9kaWZpZWRcIixcbiAgICBcIkRPTUNoYXJhY3RlckRhdGFNb2RpZmllZFwiXG4gIF0sXG4gIFwiSFRNTEV2ZW50c1wiIDogW1xuICAgIFwibG9hZFwiLFxuICAgIFwidW5sb2FkXCIsXG4gICAgXCJhYm9ydFwiLFxuICAgIFwiZXJyb3JcIixcbiAgICBcInNlbGVjdFwiLFxuICAgIFwiY2hhbmdlXCIsXG4gICAgXCJzdWJtaXRcIixcbiAgICBcInJlc2V0XCIsXG4gICAgXCJmb2N1c1wiLFxuICAgIFwiYmx1clwiLFxuICAgIFwicmVzaXplXCIsXG4gICAgXCJzY3JvbGxcIlxuICBdLFxuICBcIlVJRXZlbnRcIiA6IFtcbiAgICBcIkRPTUZvY3VzSW5cIixcbiAgICBcIkRPTUZvY3VzT3V0XCIsXG4gICAgXCJET01BY3RpdmF0ZVwiXG4gIF1cbn1cbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4vLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIC8vIEFsbG93IGZvciBkZXByZWNhdGluZyB0aGluZ3MgaW4gdGhlIHByb2Nlc3Mgb2Ygc3RhcnRpbmcgdXAuXG4gIGlmIChpc1VuZGVmaW5lZChnbG9iYWwucHJvY2VzcykpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhwb3J0cy5kZXByZWNhdGUoZm4sIG1zZykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHByb2Nlc3Mubm9EZXByZWNhdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbjtcbiAgfVxuXG4gIHZhciB3YXJuZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBpZiAoIXdhcm5lZCkge1xuICAgICAgaWYgKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy50cmFjZURlcHJlY2F0aW9uKSB7XG4gICAgICAgIGNvbnNvbGUudHJhY2UobXNnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgICAgIH1cbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIGRlcHJlY2F0ZWQ7XG59O1xuXG5cbnZhciBkZWJ1Z3MgPSB7fTtcbnZhciBkZWJ1Z0Vudmlyb247XG5leHBvcnRzLmRlYnVnbG9nID0gZnVuY3Rpb24oc2V0KSB7XG4gIGlmIChpc1VuZGVmaW5lZChkZWJ1Z0Vudmlyb24pKVxuICAgIGRlYnVnRW52aXJvbiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUcgfHwgJyc7XG4gIHNldCA9IHNldC50b1VwcGVyQ2FzZSgpO1xuICBpZiAoIWRlYnVnc1tzZXRdKSB7XG4gICAgaWYgKG5ldyBSZWdFeHAoJ1xcXFxiJyArIHNldCArICdcXFxcYicsICdpJykudGVzdChkZWJ1Z0Vudmlyb24pKSB7XG4gICAgICB2YXIgcGlkID0gcHJvY2Vzcy5waWQ7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbXNnID0gZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignJXMgJWQ6ICVzJywgc2V0LCBwaWQsIG1zZyk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1Z3Nbc2V0XSA9IGZ1bmN0aW9uKCkge307XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWJ1Z3Nbc2V0XTtcbn07XG5cblxuLyoqXG4gKiBFY2hvcyB0aGUgdmFsdWUgb2YgYSB2YWx1ZS4gVHJ5cyB0byBwcmludCB0aGUgdmFsdWUgb3V0XG4gKiBpbiB0aGUgYmVzdCB3YXkgcG9zc2libGUgZ2l2ZW4gdGhlIGRpZmZlcmVudCB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gcHJpbnQgb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9uYWwgb3B0aW9ucyBvYmplY3QgdGhhdCBhbHRlcnMgdGhlIG91dHB1dC5cbiAqL1xuLyogbGVnYWN5OiBvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMqL1xuZnVuY3Rpb24gaW5zcGVjdChvYmosIG9wdHMpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25zXG4gIHZhciBjdHggPSB7XG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogc3R5bGl6ZU5vQ29sb3JcbiAgfTtcbiAgLy8gbGVnYWN5Li4uXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDMpIGN0eC5kZXB0aCA9IGFyZ3VtZW50c1syXTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkgY3R4LmNvbG9ycyA9IGFyZ3VtZW50c1szXTtcbiAgaWYgKGlzQm9vbGVhbihvcHRzKSkge1xuICAgIC8vIGxlZ2FjeS4uLlxuICAgIGN0eC5zaG93SGlkZGVuID0gb3B0cztcbiAgfSBlbHNlIGlmIChvcHRzKSB7XG4gICAgLy8gZ290IGFuIFwib3B0aW9uc1wiIG9iamVjdFxuICAgIGV4cG9ydHMuX2V4dGVuZChjdHgsIG9wdHMpO1xuICB9XG4gIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5zaG93SGlkZGVuKSkgY3R4LnNob3dIaWRkZW4gPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5kZXB0aCkpIGN0eC5kZXB0aCA9IDI7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY29sb3JzKSkgY3R4LmNvbG9ycyA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmN1c3RvbUluc3BlY3QpKSBjdHguY3VzdG9tSW5zcGVjdCA9IHRydWU7XG4gIGlmIChjdHguY29sb3JzKSBjdHguc3R5bGl6ZSA9IHN0eWxpemVXaXRoQ29sb3I7XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgY3R4LmRlcHRoKTtcbn1cbmV4cG9ydHMuaW5zcGVjdCA9IGluc3BlY3Q7XG5cblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG5pbnNwZWN0LmNvbG9ycyA9IHtcbiAgJ2JvbGQnIDogWzEsIDIyXSxcbiAgJ2l0YWxpYycgOiBbMywgMjNdLFxuICAndW5kZXJsaW5lJyA6IFs0LCAyNF0sXG4gICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICd3aGl0ZScgOiBbMzcsIDM5XSxcbiAgJ2dyZXknIDogWzkwLCAzOV0sXG4gICdibGFjaycgOiBbMzAsIDM5XSxcbiAgJ2JsdWUnIDogWzM0LCAzOV0sXG4gICdjeWFuJyA6IFszNiwgMzldLFxuICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICdtYWdlbnRhJyA6IFszNSwgMzldLFxuICAncmVkJyA6IFszMSwgMzldLFxuICAneWVsbG93JyA6IFszMywgMzldXG59O1xuXG4vLyBEb24ndCB1c2UgJ2JsdWUnIG5vdCB2aXNpYmxlIG9uIGNtZC5leGVcbmluc3BlY3Quc3R5bGVzID0ge1xuICAnc3BlY2lhbCc6ICdjeWFuJyxcbiAgJ251bWJlcic6ICd5ZWxsb3cnLFxuICAnYm9vbGVhbic6ICd5ZWxsb3cnLFxuICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAnbnVsbCc6ICdib2xkJyxcbiAgJ3N0cmluZyc6ICdncmVlbicsXG4gICdkYXRlJzogJ21hZ2VudGEnLFxuICAvLyBcIm5hbWVcIjogaW50ZW50aW9uYWxseSBub3Qgc3R5bGluZ1xuICAncmVnZXhwJzogJ3JlZCdcbn07XG5cblxuZnVuY3Rpb24gc3R5bGl6ZVdpdGhDb2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICB2YXIgc3R5bGUgPSBpbnNwZWN0LnN0eWxlc1tzdHlsZVR5cGVdO1xuXG4gIGlmIChzdHlsZSkge1xuICAgIHJldHVybiAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdICsgJ20nICsgc3RyICtcbiAgICAgICAgICAgJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVsxXSArICdtJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59XG5cblxuZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgcmV0dXJuIHN0cjtcbn1cblxuXG5mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSkge1xuICB2YXIgaGFzaCA9IHt9O1xuXG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcywgY3R4KTtcbiAgICBpZiAoIWlzU3RyaW5nKHJldCkpIHtcbiAgICAgIHJldCA9IGZvcm1hdFZhbHVlKGN0eCwgcmV0LCByZWN1cnNlVGltZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLy8gUHJpbWl0aXZlIHR5cGVzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXNcbiAgdmFyIHByaW1pdGl2ZSA9IGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKTtcbiAgaWYgKHByaW1pdGl2ZSkge1xuICAgIHJldHVybiBwcmltaXRpdmU7XG4gIH1cblxuICAvLyBMb29rIHVwIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModmFsdWUpO1xuICB9XG5cbiAgLy8gSUUgZG9lc24ndCBtYWtlIGVycm9yIGZpZWxkcyBub24tZW51bWVyYWJsZVxuICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZHd3NTJzYnQodj12cy45NCkuYXNweFxuICBpZiAoaXNFcnJvcih2YWx1ZSlcbiAgICAgICYmIChrZXlzLmluZGV4T2YoJ21lc3NhZ2UnKSA+PSAwIHx8IGtleXMuaW5kZXhPZignZGVzY3JpcHRpb24nKSA+PSAwKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSkgfHwgeyB2YWx1ZTogdmFsdWVba2V5XSB9O1xuICBpZiAoZGVzYy5nZXQpIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGVzYy5zZXQpIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmICghaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsIGtleSkpIHtcbiAgICBuYW1lID0gJ1snICsga2V5ICsgJ10nO1xuICB9XG4gIGlmICghc3RyKSB7XG4gICAgaWYgKGN0eC5zZWVuLmluZGV4T2YoZGVzYy52YWx1ZSkgPCAwKSB7XG4gICAgICBpZiAoaXNOdWxsKHJlY3Vyc2VUaW1lcykpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoaXNVbmRlZmluZWQobmFtZSkpIHtcbiAgICBpZiAoYXJyYXkgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9XG4gICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICBpZiAobmFtZS5tYXRjaCgvXlwiKFthLXpBLVpfXVthLXpBLVpfMC05XSopXCIkLykpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigxLCBuYW1lLmxlbmd0aCAtIDIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICduYW1lJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgbmFtZSA9IGN0eC5zdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG59XG5cblxuZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpIHtcbiAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgdmFyIGxlbmd0aCA9IG91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQcmltaXRpdmUoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGwgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3ltYm9sJyB8fCAgLy8gRVM2IHN5bWJvbFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3VuZGVmaW5lZCc7XG59XG5leHBvcnRzLmlzUHJpbWl0aXZlID0gaXNQcmltaXRpdmU7XG5cbmV4cG9ydHMuaXNCdWZmZXIgPSByZXF1aXJlKCcuL3N1cHBvcnQvaXNCdWZmZXInKTtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcblxuZXhwb3J0cy5fZXh0ZW5kID0gZnVuY3Rpb24ob3JpZ2luLCBhZGQpIHtcbiAgLy8gRG9uJ3QgZG8gYW55dGhpbmcgaWYgYWRkIGlzbid0IGFuIG9iamVjdFxuICBpZiAoIWFkZCB8fCAhaXNPYmplY3QoYWRkKSkgcmV0dXJuIG9yaWdpbjtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFkZCk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBvcmlnaW5ba2V5c1tpXV0gPSBhZGRba2V5c1tpXV07XG4gIH1cbiAgcmV0dXJuIG9yaWdpbjtcbn07XG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwib01mcEFuXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTQgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgY3hcbiAqL1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBtYXJrIHN0cmluZyBsaXRlcmFscyByZXByZXNlbnRpbmcgQ1NTIGNsYXNzIG5hbWVzXG4gKiBzbyB0aGF0IHRoZXkgY2FuIGJlIHRyYW5zZm9ybWVkIHN0YXRpY2FsbHkuIFRoaXMgYWxsb3dzIGZvciBtb2R1bGFyaXphdGlvblxuICogYW5kIG1pbmlmaWNhdGlvbiBvZiBDU1MgY2xhc3MgbmFtZXMuXG4gKlxuICogSW4gc3RhdGljX3Vwc3RyZWFtLCB0aGlzIGZ1bmN0aW9uIGlzIGFjdHVhbGx5IGltcGxlbWVudGVkLCBidXQgaXQgc2hvdWxkXG4gKiBldmVudHVhbGx5IGJlIHJlcGxhY2VkIHdpdGggc29tZXRoaW5nIG1vcmUgZGVzY3JpcHRpdmUsIGFuZCB0aGUgdHJhbnNmb3JtXG4gKiB0aGF0IGlzIHVzZWQgaW4gdGhlIG1haW4gc3RhY2sgc2hvdWxkIGJlIHBvcnRlZCBmb3IgdXNlIGVsc2V3aGVyZS5cbiAqXG4gKiBAcGFyYW0gc3RyaW5nfG9iamVjdCBjbGFzc05hbWUgdG8gbW9kdWxhcml6ZSwgb3IgYW4gb2JqZWN0IG9mIGtleS92YWx1ZXMuXG4gKiAgICAgICAgICAgICAgICAgICAgICBJbiB0aGUgb2JqZWN0IGNhc2UsIHRoZSB2YWx1ZXMgYXJlIGNvbmRpdGlvbnMgdGhhdFxuICogICAgICAgICAgICAgICAgICAgICAgZGV0ZXJtaW5lIGlmIHRoZSBjbGFzc05hbWUga2V5cyBzaG91bGQgYmUgaW5jbHVkZWQuXG4gKiBAcGFyYW0gW3N0cmluZyAuLi5dICBWYXJpYWJsZSBsaXN0IG9mIGNsYXNzTmFtZXMgaW4gdGhlIHN0cmluZyBjYXNlLlxuICogQHJldHVybiBzdHJpbmcgICAgICAgUmVuZGVyYWJsZSBzcGFjZS1zZXBhcmF0ZWQgQ1NTIGNsYXNzTmFtZS5cbiAqL1xuZnVuY3Rpb24gY3goY2xhc3NOYW1lcykge1xuICBpZiAodHlwZW9mIGNsYXNzTmFtZXMgPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoY2xhc3NOYW1lcykuZmlsdGVyKGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xuICAgICAgcmV0dXJuIGNsYXNzTmFtZXNbY2xhc3NOYW1lXTtcbiAgICB9KS5qb2luKCcgJyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5qb2luLmNhbGwoYXJndW1lbnRzLCAnICcpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3g7XG4iLCJ2YXIgY2xhc3NTZXQ7XG5cbmNsYXNzU2V0ID0gcmVxdWlyZSgncmVhY3QvbGliL2N4Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBoYW5kbGVEYXlDbGljazogZnVuY3Rpb24oZSkge1xuICAgIGlmICh0aGlzLnByb3BzLmRpc2FibGVkIHx8ICF0aGlzLnByb3BzLmRheS5pc0luQ3VycmVudE1vbnRoKSB7XG4gICAgICByZXR1cm4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkRheVNlbGVjdCh0aGlzLnByb3BzLmRheS5kYXRlLmdldERhdGUoKSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNsYXNzZXMsIGRheSwgaWR4LCB0ZXh0O1xuICAgIGlkeCA9IHRoaXMucHJvcHMuaW5kZXg7XG4gICAgZGF5ID0gdGhpcy5wcm9wcy5kYXk7XG4gICAgdGV4dCA9IGRheS5pc0luQ3VycmVudE1vbnRoID8gZGF5LmRhdGUuZ2V0RGF0ZSgpIDogJyZuYnNwOyc7XG4gICAgY2xhc3NlcyA9IGNsYXNzU2V0KHtcbiAgICAgICdkYXknOiBkYXkuaXNJbkN1cnJlbnRNb250aCxcbiAgICAgICdlbXB0eWNlbGwnOiAhZGF5LmlzSW5DdXJyZW50TW9udGgsXG4gICAgICAnd2Vla2VuZCc6IGlkeCA9PT0gNSB8fCBpZHggPT09IDYsXG4gICAgICAnc2VsZWN0ZWQnOiB0aGlzLnByb3BzLnNlbGVjdGVkLFxuICAgICAgJ3RvZGF5JzogZGF5LmlzVG9kYXksXG4gICAgICAnaGlnaGxpZ2h0YWJsZSc6ICF0aGlzLnByb3BzLmRpc2FibGVkLFxuICAgICAgJ2Rpc2FibGVkJzogdGhpcy5wcm9wcy5kaXNhYmxlZFxuICAgIH0pO1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS50ZCwge1xuICAgICAgXCJjbGFzc05hbWVcIjogY2xhc3NlcyxcbiAgICAgIFwiZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUxcIjoge1xuICAgICAgICBfX2h0bWw6IHRleHRcbiAgICAgIH0sXG4gICAgICBcIm9uQ2xpY2tcIjogdGhpcy5oYW5kbGVEYXlDbGlja1xuICAgIH0pO1xuICB9XG59KTtcbiIsInZhciBDYWxlbmRhciwgQ2FsZW5kYXJEYXksIGNsYXNzU2V0LCBkYXlOYW1lc0FiYnIsIHV0aWwsXG4gIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG5jbGFzc1NldCA9IHJlcXVpcmUoJ3JlYWN0L2xpYi9jeCcpO1xuXG5DYWxlbmRhciA9IHJlcXVpcmUoJ2NhbGVuZGFyLmpzJyk7XG5cbnV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5cbkNhbGVuZGFyRGF5ID0gcmVxdWlyZSgnLi9jYWxlbmRhci1kYXknKTtcblxuZGF5TmFtZXNBYmJyID0gWydNb24nLCAnVHVlJywgJ1dlZCcsICdUaHInLCAnRnJpJywgJ1NhdCcsICdTdW4nXTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIF9jYWw6IG5ldyBDYWxlbmRhcigpLFxuXG4gIC8qKlxuICAqIEhhbmRsZSBuYXZpZ2F0aW9uIGJ1dHRvbiBjbGlja1xuICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIE5hdmlnYXRpb24gYnV0dG9uIHR5cGUsIG9uZSBvZiA0IHN0cmluZ3M6IGx5ID0gbGVzc1xuICAqICB5ZWFyLCBsbSA9IGxlc3MgbW9udGgsIGdtID0gZ3JlYXRlciB5ZWFyLCBneSA9IGdyZWF0ZXIgeWVhclxuICAgKi9cbiAgaGFuZGxlTmF2aWc6IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICB2YXIgbW9udGgsIHllYXI7XG4gICAgbW9udGggPSBudWxsO1xuICAgIHllYXIgPSBudWxsO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnbHknOlxuICAgICAgICB5ZWFyID0gdGhpcy5wcm9wcy5kYXRlLmdldEZ1bGxZZWFyKCkgLSAxO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2xtJzpcbiAgICAgICAgbW9udGggPSB0aGlzLnByb3BzLmRhdGUuZ2V0TW9udGgoKSAtIDE7XG4gICAgICAgIGlmIChtb250aCA8IDAgJiYgX19pbmRleE9mLmNhbGwodGhpcy5wcm9wcy5kaXNhYmxlZCwgJ3knKSA+PSAwKSB7XG4gICAgICAgICAgbW9udGggPSAxMTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2dtJzpcbiAgICAgICAgbW9udGggPSB0aGlzLnByb3BzLmRhdGUuZ2V0TW9udGgoKSArIDE7XG4gICAgICAgIGlmIChtb250aCA+IDExICYmIF9faW5kZXhPZi5jYWxsKHRoaXMucHJvcHMuZGlzYWJsZWQsICd5JykgPj0gMCkge1xuICAgICAgICAgIG1vbnRoID0gMDtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2d5JzpcbiAgICAgICAgeWVhciA9IHRoaXMucHJvcHMuZGF0ZS5nZXRGdWxsWWVhcigpICsgMTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJvcHMub25Nb250aFllYXJDaGFuZ2UobW9udGgsIHllYXIpO1xuICB9LFxuICBjcmVhdGVEYXk6IGZ1bmN0aW9uKGRheSwgaWR4KSB7XG4gICAgdmFyIGRpc2FibGVkLCBzZWxlY3RlZDtcbiAgICBzZWxlY3RlZCA9IGRheS5pc0luQ3VycmVudE1vbnRoICYmIHRoaXMucHJvcHMuZGF0ZS5nZXREYXRlKCkgPT09IGRheS5kYXRlLmdldERhdGUoKTtcbiAgICBkaXNhYmxlZCA9IF9faW5kZXhPZi5jYWxsKHRoaXMucHJvcHMuZGlzYWJsZWQsICdkJykgPj0gMDtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChDYWxlbmRhckRheSwge1xuICAgICAgXCJkYXlcIjogZGF5LFxuICAgICAgXCJpbmRleFwiOiBpZHgsXG4gICAgICBcImtleVwiOiBpZHgsXG4gICAgICBcInNlbGVjdGVkXCI6IHNlbGVjdGVkLFxuICAgICAgXCJkaXNhYmxlZFwiOiBkaXNhYmxlZCxcbiAgICAgIFwib25EYXlTZWxlY3RcIjogdGhpcy5wcm9wcy5vbkRheVNlbGVjdFxuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAqIEBwYXJhbSB7QXJyYXkuPE9iamVjdD59IHdlZWsgTGlzdCBvZiBkYXlzIGF0IHdlZWtcbiAgKiBAcGFyYW0ge251bWJlcn0gaWR4IEluZGV4IG9mIHdlZWsgYXQgbGlzdCBvZiB3ZWVrcyBvZiBhY3R1YWwgbW9udGhcbiAgICovXG4gIGNyZWF0ZVdlZWs6IGZ1bmN0aW9uKHdlZWssIGlkeCkge1xuICAgIHZhciBkYXlzLCByb3dDbGFzcztcbiAgICBpZiAod2Vlay5sZW5ndGgpIHtcbiAgICAgIGRheXMgPSB3ZWVrLm1hcCh0aGlzLmNyZWF0ZURheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRheXMgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS50ZCwge1xuICAgICAgICBcImNsYXNzTmFtZVwiOiBcImVtcHR5Y2VsbFwiLFxuICAgICAgICBcImNvbFNwYW5cIjogNy5cbiAgICAgIH0sIFwiXFx1MDBhMFwiKTtcbiAgICB9XG4gICAgcm93Q2xhc3MgPSB1dGlsLmlzQXJyYXkoZGF5cykgPyAnZGF5c3JvdycgOiAnZW1wdHlyb3cnO1xuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS50ciwge1xuICAgICAgXCJjbGFzc05hbWVcIjogcm93Q2xhc3MsXG4gICAgICBcImtleVwiOiBpZHhcbiAgICB9LCBkYXlzKTtcbiAgfSxcblxuICAvKipcbiAgKiBAcGFyYW0ge251bWJlcn0gb3JkZXIgT3JkZXIgb2YgZGF5IGF0IHdlZWssIE1vbmRheSBpcyAwLCBUdWVzZGF5IDEsIGV0Yy5cbiAgICovXG4gIGNyZWF0ZURheVRpdGxlOiBmdW5jdGlvbihvcmRlcikge1xuICAgIHZhciBjbGFzc2VzLCBuYW1lO1xuICAgIG5hbWUgPSBkYXlOYW1lc0FiYnJbb3JkZXJdO1xuICAgIGNsYXNzZXMgPSBjbGFzc1NldCh7XG4gICAgICAnZGF5JzogdHJ1ZSxcbiAgICAgICduYW1lJzogdHJ1ZSxcbiAgICAgICd3ZWVrZW5kJzogb3JkZXIgPT09IDUgfHwgb3JkZXIgPT09IDZcbiAgICB9KTtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00udGQsIHtcbiAgICAgIFwiY2xhc3NOYW1lXCI6IGNsYXNzZXMsXG4gICAgICBcImtleVwiOiBvcmRlclxuICAgIH0sIG5hbWUpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkYXluYW1lcywgbW9udGhDYWxlbmRhciwgbW9udGhzRGlzYWJsZWQsIHN0eWxlc0xlZnRCdG5zLCBzdHlsZXNSaWdodEJ0bnMsIHllYXJzRGlzYWJsZWQ7XG4gICAgZGF5bmFtZXMgPSBbMCwgMSwgMiwgMywgNCwgNSwgNl0ubWFwKHRoaXMuY3JlYXRlRGF5VGl0bGUpO1xuICAgIG1vbnRoQ2FsZW5kYXIgPSB0aGlzLl9jYWwubW9udGhDYWxlbmRhcih0aGlzLnByb3BzLmRhdGUpO1xuICAgIHN0eWxlc0xlZnRCdG5zID0ge1xuICAgICAgJ2Zsb2F0JzogJ2xlZnQnXG4gICAgfTtcbiAgICBzdHlsZXNSaWdodEJ0bnMgPSB7XG4gICAgICAnZmxvYXQnOiAncmlnaHQnXG4gICAgfTtcbiAgICB5ZWFyc0Rpc2FibGVkID0gX19pbmRleE9mLmNhbGwodGhpcy5wcm9wcy5kaXNhYmxlZCwgJ3knKSA+PSAwO1xuICAgIG1vbnRoc0Rpc2FibGVkID0gX19pbmRleE9mLmNhbGwodGhpcy5wcm9wcy5kaXNhYmxlZCwgJ20nKSA+PSAwO1xuICAgIHdoaWxlIChtb250aENhbGVuZGFyLmNhbGVuZGFyLmxlbmd0aCA8IDYpIHtcbiAgICAgIG1vbnRoQ2FsZW5kYXIuY2FsZW5kYXIucHVzaChbXSk7XG4gICAgfVxuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS5kaXYsIG51bGwsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLmRpdiwge1xuICAgICAgXCJjbGFzc05hbWVcIjogXCJuYXYtYnV0dG9uc1wiXG4gICAgfSwgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00uZGl2LCB7XG4gICAgICBcImNsYXNzTmFtZVwiOiBcImxlZnRcIlxuICAgIH0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLmJ1dHRvbiwge1xuICAgICAgXCJkaXNhYmxlZFwiOiB5ZWFyc0Rpc2FibGVkLFxuICAgICAgXCJvbkNsaWNrXCI6IHRoaXMuaGFuZGxlTmF2aWcuYmluZCh0aGlzLCAnbHknKVxuICAgIH0sIFwiXFx4M0NcXHgzQ1wiKSwgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00uYnV0dG9uLCB7XG4gICAgICBcImRpc2FibGVkXCI6IG1vbnRoc0Rpc2FibGVkLFxuICAgICAgXCJvbkNsaWNrXCI6IHRoaXMuaGFuZGxlTmF2aWcuYmluZCh0aGlzLCAnbG0nKVxuICAgIH0sIFwiXFx4M0NcIikpLCBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS5kaXYsIHtcbiAgICAgIFwiY2xhc3NOYW1lXCI6IFwicmlnaHRcIlxuICAgIH0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLmJ1dHRvbiwge1xuICAgICAgXCJkaXNhYmxlZFwiOiBtb250aHNEaXNhYmxlZCxcbiAgICAgIFwib25DbGlja1wiOiB0aGlzLmhhbmRsZU5hdmlnLmJpbmQodGhpcywgJ2dtJylcbiAgICB9LCBcIlxceDNFXCIpLCBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS5idXR0b24sIHtcbiAgICAgIFwiZGlzYWJsZWRcIjogeWVhcnNEaXNhYmxlZCxcbiAgICAgIFwib25DbGlja1wiOiB0aGlzLmhhbmRsZU5hdmlnLmJpbmQodGhpcywgJ2d5JylcbiAgICB9LCBcIlxceDNFXFx4M0VcIikpKSwgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00udGFibGUsIG51bGwsIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLnRoZWFkLCBudWxsLCBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS50ciwge1xuICAgICAgXCJjbGFzc05hbWVcIjogXCJkYXluYW1lc1wiXG4gICAgfSwgZGF5bmFtZXMpKSwgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00udGJvZHksIG51bGwsIG1vbnRoQ2FsZW5kYXIuY2FsZW5kYXIubWFwKHRoaXMuY3JlYXRlV2VlaykpKSk7XG4gIH1cbn0pO1xuIiwidmFyIEZ1bGxDYWxlbmRhciwgVGltZVBpY2tlciwgbW9udGhzO1xuXG5GdWxsQ2FsZW5kYXIgPSByZXF1aXJlKCcuL2NhbGVuZGFyJyk7XG5cblRpbWVQaWNrZXIgPSByZXF1aXJlKCcuL3RpbWUtcGlja2VyJyk7XG5cbm1vbnRocyA9IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZW1wdGVtYmVyJywgJ09jdG9iZXInLCAnRGVjZW1iZXInLCAnTm92ZW1iZXInXTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHByb3BUeXBlczoge1xuICAgIHZpc2libGU6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgIGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXlcbiAgfSxcblxuICAvKipcbiAgKiBJbnZva2VkIHdoZW4gZGF5IGF0IGNhbGVuZGFyIGlzIHNlbGVjdGVkXG4gICpcbiAgKiBAcGFyYW0ge251bWJlcn0gZGF5IFdoaWNoIGRheSB3YXMgc2VsZWN0ZWRcbiAgICovXG4gIGhhbmRsZURhdGVDaGFuZ2U6IGZ1bmN0aW9uKGRheSwgbW9udGgsIHllYXIpIHtcbiAgICB2YXIgbmV4dERhdGU7XG4gICAgbmV4dERhdGUgPSB0aGlzLnN0YXRlLmFjdHVhbERhdGU7XG4gICAgaWYgKGRheSAhPSBudWxsKSB7XG4gICAgICBuZXh0RGF0ZS5zZXREYXRlKGRheSk7XG4gICAgfVxuICAgIGlmIChtb250aCAhPSBudWxsKSB7XG4gICAgICBuZXh0RGF0ZS5zZXRNb250aChtb250aCk7XG4gICAgfVxuICAgIGlmICh5ZWFyICE9IG51bGwpIHtcbiAgICAgIG5leHREYXRlLnNldEZ1bGxZZWFyKHllYXIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhY3R1YWxEYXRlOiBuZXh0RGF0ZVxuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICovXG4gIGhhbmRsZVRpbWVDaGFuZ2U6IGZ1bmN0aW9uKHR5cGUsIHZhbHVlKSB7XG4gICAgdmFyIG5leHREYXRlO1xuICAgIG5leHREYXRlID0gdGhpcy5zdGF0ZS5hY3R1YWxEYXRlO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnaG91cic6XG4gICAgICAgIG5leHREYXRlLnNldEhvdXJzKHZhbHVlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtaW51dGUnOlxuICAgICAgICBuZXh0RGF0ZS5zZXRNaW51dGVzKHZhbHVlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzZWNvbmQnOlxuICAgICAgICBuZXh0RGF0ZS5zZXRTZWNvbmRzKHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2V0U3RhdGUobmV4dERhdGUpO1xuICB9LFxuICBoYW5kbGVDb25maXJtOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkRhdGVDb25maXJtICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb3BzLm9uRGF0ZUNvbmZpcm0odGhpcy5zdGF0ZS5hY3R1YWxEYXRlKTtcbiAgICB9XG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFjdHVhbERhdGU6IG5ldyBEYXRlXG4gICAgfTtcbiAgfSxcbiAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgIGRpc2FibGVkOiBbXVxuICAgIH07XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIENsb3NlciwgYWN0dWFsRGF0ZSwgY2FsZW5kYXJTdHlsZXMsIGNvbnRhaW5lclN0eWxlcywgaG91cnMsIG1pbnMsIG1vbnRoLCBzZWNzLCB5ZWFyO1xuICAgIGFjdHVhbERhdGUgPSB0aGlzLnN0YXRlLmFjdHVhbERhdGU7XG4gICAgbW9udGggPSBtb250aHNbdGhpcy5zdGF0ZS5hY3R1YWxEYXRlLmdldE1vbnRoKCldO1xuICAgIHllYXIgPSBhY3R1YWxEYXRlLmdldEZ1bGxZZWFyKCkudG9TdHJpbmcoKTtcbiAgICBob3VycyA9IGFjdHVhbERhdGUuZ2V0SG91cnMoKTtcbiAgICBtaW5zID0gYWN0dWFsRGF0ZS5nZXRNaW51dGVzKCk7XG4gICAgc2VjcyA9IGFjdHVhbERhdGUuZ2V0U2Vjb25kcygpO1xuICAgIGNvbnRhaW5lclN0eWxlcyA9IHtcbiAgICAgIGRpc3BsYXk6IHRoaXMucHJvcHMudmlzaWJsZSA/ICdibG9jaycgOiAnbm9uZSdcbiAgICB9O1xuICAgIGNhbGVuZGFyU3R5bGVzID0ge307XG4gICAgaWYgKHRoaXMucHJvcHMub25DbG9zZSAhPSBudWxsKSB7XG4gICAgICBDbG9zZXIgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS5zcGFuLCB7XG4gICAgICAgIFwiY2xhc3NOYW1lXCI6IFwiY2xvc2VyXCIsXG4gICAgICAgIFwib25DbGlja1wiOiB0aGlzLnByb3BzLm9uQ2xvc2VcbiAgICAgIH0sIFwieFwiKTtcbiAgICB9XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLmRpdiwge1xuICAgICAgXCJjbGFzc05hbWVcIjogXCJkYXRldGltZS1waWNrZXJcIlxuICAgIH0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLmRpdiwge1xuICAgICAgXCJjbGFzc05hbWVcIjogXCJoZWFkXCJcbiAgICB9LCBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS5zcGFuLCB7XG4gICAgICBcImNsYXNzTmFtZVwiOiBcInRpdGxlXCJcbiAgICB9LCBtb250aCwgXCIgLSBcIiwgeWVhciksIENsb3NlciksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoRnVsbENhbGVuZGFyLCB7XG4gICAgICBcImRhdGVcIjogdGhpcy5zdGF0ZS5hY3R1YWxEYXRlLFxuICAgICAgXCJkaXNhYmxlZFwiOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuICAgICAgXCJvbkRheVNlbGVjdFwiOiB0aGlzLmhhbmRsZURhdGVDaGFuZ2UsXG4gICAgICBcIm9uTW9udGhZZWFyQ2hhbmdlXCI6IHRoaXMuaGFuZGxlRGF0ZUNoYW5nZS5iaW5kKHRoaXMsIG51bGwpXG4gICAgfSksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGltZVBpY2tlciwge1xuICAgICAgXCJob3Vyc1wiOiBob3VycyxcbiAgICAgIFwibWluc1wiOiBtaW5zLFxuICAgICAgXCJzZWNzXCI6IHNlY3MsXG4gICAgICBcImRpc2FibGVkXCI6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICBcIm9uVGltZUNoYW5nZVwiOiB0aGlzLmhhbmRsZVRpbWVDaGFuZ2VcbiAgICB9KSwgUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00uYnV0dG9uLCB7XG4gICAgICBcImNsYXNzTmFtZVwiOiBcImNvbmZpcm1cIixcbiAgICAgIFwib25DbGlja1wiOiB0aGlzLmhhbmRsZUNvbmZpcm1cbiAgICB9LCBcIlNldCBkYXRlXCIpKTtcbiAgfVxufSk7XG4iLCJ2YXIgVGltZUNlbGwsIGNsYXNzU2V0LCBkb21FdmVudHM7XG5cbmNsYXNzU2V0ID0gcmVxdWlyZSgncmVhY3QvbGliL2N4Jyk7XG5cbmRvbUV2ZW50cyA9IHJlcXVpcmUoJ2RvbS1ldmVudHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lQ2VsbCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgc3RhdGljczoge1xuICAgIGRlbGF5QmVmb3JlU3RhcnQ6IDEwMDAsXG4gICAgaW5jcmVtZW50U3BlZWQ6IDEwMFxuICB9LFxuICBfc3RhcnRUaW1lcjogbnVsbCxcbiAgX2luY3JlbWVudFRpbWVyOiBudWxsLFxuICBoYW5kbGVNb3VzZURvd246IGZ1bmN0aW9uKGUpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGFjdGl2ZTogdHJ1ZVxuICAgIH0pO1xuICAgIGRvbUV2ZW50cy5vbmNlKGRvY3VtZW50LCAnbW91c2V1cCcsIHRoaXMuaGFuZGxlTW91c2VVcCk7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0VGltZXIgPSBzZXRUaW1lb3V0KHRoaXMuc3RhcnRJbmNyZW1lbnRpbmcsIFRpbWVDZWxsLmRlbGF5QmVmb3JlU3RhcnQpO1xuICB9LFxuICBjbGVhclN0YXJ0VGltZXI6IGZ1bmN0aW9uKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9zdGFydFRpbWVyKTtcbiAgICByZXR1cm4gdGhpcy5fc3RhcnRUaW1lciA9IG51bGw7XG4gIH0sXG4gIHN0YXJ0SW5jcmVtZW50aW5nOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNsZWFyU3RhcnRUaW1lcigpO1xuICAgIHJldHVybiB0aGlzLl9pbmNyZW1lbnRUaW1lciA9IHNldEludGVydmFsKHRoaXMuaW5jcmVtZW50VmFsdWUsIFRpbWVDZWxsLmluY3JlbWVudFNwZWVkKTtcbiAgfSxcbiAgaGFuZGxlTW91c2VVcDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX3N0YXJ0VGltZXIgIT0gbnVsbCkge1xuICAgICAgdGhpcy5jbGVhclN0YXJ0VGltZXIoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2luY3JlbWVudFRpbWVyICE9IG51bGwpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5faW5jcmVtZW50VGltZXIpO1xuICAgICAgdGhpcy5faW5jcmVtZW50VGltZXIgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhY3RpdmU6IGZhbHNlXG4gICAgfSk7XG4gIH0sXG4gIGluY3JlbWVudFZhbHVlOiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHZhbHVlO1xuICAgIHZhbHVlID0gdGhpcy5zdGF0ZS52YWx1ZSArIDE7XG4gICAgaWYgKHZhbHVlID4gdGhpcy5wcm9wcy5tYXhWYWwpIHtcbiAgICAgIHZhbHVlID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5wcm9wcy50eXBlLCB2YWx1ZSk7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcykge1xuICAgIGlmIChuZXh0UHJvcHMudmFsdWUgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICB2YWx1ZTogbmV4dFByb3BzLnZhbHVlXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiB0aGlzLnByb3BzLnZhbHVlLFxuICAgICAgYWN0aXZlOiBmYWxzZVxuICAgIH07XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNsYXNzZXMsIGNsaWNrQ2IsIG1vdXNlRG93bkNiLCB2YWx1ZTtcbiAgICBjbGFzc2VzID0gY2xhc3NTZXQoe1xuICAgICAgJ3ZhbHVlJzogdHJ1ZSxcbiAgICAgICdkaXNhYmxlZCc6IHRoaXMucHJvcHMuZGlzYWJsZWQsXG4gICAgICAnaGlnaGxpZ2h0YWJsZSc6ICF0aGlzLnByb3BzLmRpc2FibGVkLFxuICAgICAgJ2FjdGl2ZSc6IHRoaXMuc3RhdGUuYWN0aXZlXG4gICAgfSk7XG4gICAgdmFsdWUgPSB0aGlzLnN0YXRlLnZhbHVlLnRvU3RyaW5nKCk7XG4gICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdmFsdWUgPSBcIjBcIiArIHZhbHVlO1xuICAgIH1cbiAgICBpZiAoIXRoaXMucHJvcHMuZGlzYWJsZWQpIHtcbiAgICAgIGNsaWNrQ2IgPSB0aGlzLmluY3JlbWVudFZhbHVlO1xuICAgICAgbW91c2VEb3duQ2IgPSB0aGlzLmhhbmRsZU1vdXNlRG93bjtcbiAgICB9XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLnNwYW4sIHtcbiAgICAgIFwiY2xhc3NOYW1lXCI6IGNsYXNzZXMsXG4gICAgICBcIm9uQ2xpY2tcIjogY2xpY2tDYixcbiAgICAgIFwib25Nb3VzZURvd25cIjogbW91c2VEb3duQ2JcbiAgICB9LCB2YWx1ZSk7XG4gIH1cbn0pO1xuIiwidmFyIFRpbWVDZWxsLFxuICBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuVGltZUNlbGwgPSByZXF1aXJlKCcuL3RpbWUtY2VsbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgY3JlYXRlVGltZUNlbGw6IGZ1bmN0aW9uKHZhbHVlLCB0eXBlLCBkaXNhYmxlZCwgbWF4VmFsKSB7XG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoVGltZUNlbGwsIHtcbiAgICAgIFwidmFsdWVcIjogdmFsdWUsXG4gICAgICBcInR5cGVcIjogdHlwZSxcbiAgICAgIFwiZGlzYWJsZWRcIjogZGlzYWJsZWQsXG4gICAgICBcIm1heFZhbFwiOiBtYXhWYWwsXG4gICAgICBcIm9uQ2hhbmdlXCI6IHRoaXMucHJvcHMub25UaW1lQ2hhbmdlXG4gICAgfSk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhvdXJEaXNhYmxlZCwgbWluRGlzYWJsZWQsIHNlY0Rpc2FibGVkO1xuICAgIGhvdXJEaXNhYmxlZCA9IF9faW5kZXhPZi5jYWxsKHRoaXMucHJvcHMuZGlzYWJsZWQsICdoJykgPj0gMDtcbiAgICBtaW5EaXNhYmxlZCA9IF9faW5kZXhPZi5jYWxsKHRoaXMucHJvcHMuZGlzYWJsZWQsICdpJykgPj0gMDtcbiAgICBzZWNEaXNhYmxlZCA9IF9faW5kZXhPZi5jYWxsKHRoaXMucHJvcHMuZGlzYWJsZWQsICdzJykgPj0gMDtcbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5ET00uZGl2LCB7XG4gICAgICBcImNsYXNzTmFtZVwiOiBcInRpbWVyb3dcIlxuICAgIH0sIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLnNwYW4sIHtcbiAgICAgIFwiY2xhc3NOYW1lXCI6IFwibGFiZWxcIlxuICAgIH0sIFwiVGltZTpcIiksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLmRpdiwge1xuICAgICAgXCJjbGFzc05hbWVcIjogXCJ0aW1lXCJcbiAgICB9LCB0aGlzLmNyZWF0ZVRpbWVDZWxsKHRoaXMucHJvcHMuaG91cnMsICdob3VyJywgaG91ckRpc2FibGVkLCAyMyksIFJlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRE9NLnNwYW4sIHtcbiAgICAgIFwiY2xhc3NOYW1lXCI6IFwiY29sb25cIlxuICAgIH0sIFwiOlwiKSwgdGhpcy5jcmVhdGVUaW1lQ2VsbCh0aGlzLnByb3BzLm1pbnMsICdtaW51dGUnLCBtaW5EaXNhYmxlZCwgNTkpLCBSZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkRPTS5zcGFuLCB7XG4gICAgICBcImNsYXNzTmFtZVwiOiBcImNvbG9uXCJcbiAgICB9LCBcIjpcIiksIHRoaXMuY3JlYXRlVGltZUNlbGwodGhpcy5wcm9wcy5zZWNzLCAnc2Vjb25kJywgc2VjRGlzYWJsZWQsIDU5KSkpO1xuICB9XG59KTtcbiJdfQ==
(13)
});
