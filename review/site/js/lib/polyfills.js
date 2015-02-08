// Polyfill for element.classList
/////////////////////////////////////////////////////////////////////////////////////////////////////
if ("document" in self && !("classList" in document.createElement("_"))) {
    (function(j) {
        "use strict";
        if (!("Element" in j)) {
            return
        }
        var a = "classList",
            f = "prototype",
            m = j.Element[f],
            b = Object,
            k = String[f].trim || function() {
                return this.replace(/^\s+|\s+$/g, "")
            },
            c = Array[f].indexOf || function(q) {
                var p = 0,
                    o = this.length;
                for (; p < o; p++) {
                    if (p in this && this[p] === q) {
                        return p
                    }
                }
                return -1
            },
            n = function(o, p) {
                this.name = o;
                this.code = DOMException[o];
                this.message = p
            },
            g = function(p, o) {
                if (o === "") {
                    throw new n("SYNTAX_ERR", "An invalid or illegal string was specified")
                }
                if (/\s/.test(o)) {
                    throw new n("INVALID_CHARACTER_ERR", "String contains an invalid character")
                }
                return c.call(p, o)
            },
            d = function(s) {
                var r = k.call(s.getAttribute("class") || ""),
                    q = r ? r.split(/\s+/) : [],
                    p = 0,
                    o = q.length;
                for (; p < o; p++) {
                    this.push(q[p])
                }
                this._updateClassName = function() {
                    s.setAttribute("class", this.toString())
                }
            },
            e = d[f] = [],
            i = function() {
                return new d(this)
            };
        n[f] = Error[f];
        e.item = function(o) {
            return this[o] || null
        };
        e.contains = function(o) {
            o += "";
            return g(this, o) !== -1
        };
        e.add = function() {
            var s = arguments,
                r = 0,
                p = s.length,
                q, o = false;
            do {
                q = s[r] + "";
                if (g(this, q) === -1) {
                    this.push(q);
                    o = true
                }
            } while (++r < p);
            if (o) {
                this._updateClassName()
            }
        };
        e.remove = function() {
            var t = arguments,
                s = 0,
                p = t.length,
                r, o = false;
            do {
                r = t[s] + "";
                var q = g(this, r);
                if (q !== -1) {
                    this.splice(q, 1);
                    o = true
                }
            } while (++s < p);
            if (o) {
                this._updateClassName()
            }
        };
        e.toggle = function(p, q) {
            p += "";
            var o = this.contains(p),
                r = o ? q !== true && "remove" : q !== false && "add";
            if (r) {
                this[r](p)
            }
            return !o
        };
        e.toString = function() {
            return this.join(" ")
        };
        if (b.defineProperty) {
            var l = {
                get: i,
                enumerable: true,
                configurable: true
            };
            try {
                b.defineProperty(m, a, l)
            } catch (h) {
                if (h.number === -2146823252) {
                    l.enumerable = false;
                    b.defineProperty(m, a, l)
                }
            }
        } else {
            if (b[f].__defineGetter__) {
                m.__defineGetter__(a, i)
            }
        }
    }(self))
};

// Polyfill for EventListeners
/////////////////////////////////////////////////////////////////////////////////////////////////////
this.Element && Element.prototype.attachEvent && !Element.prototype.addEventListener && function() {
    function e(e, t) {
        Window.prototype[e] = HTMLDocument.prototype[e] = Element.prototype[e] = t
    }

    function t() {
        t.interval && document.body && (t.interval = clearInterval(t.interval), document.dispatchEvent(new CustomEvent("DOMContentLoaded")))
    }
    e("addEventListener", function(e, t) {
        var n = this,
            r = n.addEventListener.listeners = n.addEventListener.listeners || {},
            a = r[e] = r[e] || [];
        a.length || n.attachEvent("on" + e, a.event = function(e) {
            var t = n.document && n.document.documentElement || n.documentElement || {
                scrollLeft: 0,
                scrollTop: 0
            };
            e.currentTarget = n, e.pageX = e.clientX + t.scrollLeft, e.pageY = e.clientY + t.scrollTop, e.preventDefault = function() {
                e.returnValue = !1
            }, e.relatedTarget = e.fromElement || null, e.stopImmediatePropagation = function() {
                i = !1, e.cancelBubble = !0
            }, e.stopPropagation = function() {
                e.cancelBubble = !0
            }, e.target = e.srcElement || n, e.timeStamp = +new Date;
            for (var r, o = 0, l = [].concat(a), i = !0; i && (r = l[o]); ++o)
                for (var c, s = 0; c = a[s]; ++s)
                    if (c == r) {
                        c.call(n, e);
                        break
                    }
        }), a.push(t)
    }), e("removeEventListener", function(e, t) {
        for (var n, r = this, a = r.addEventListener.listeners = r.addEventListener.listeners || {}, o = a[e] = a[e] || [], l = o.length - 1; n = o[l]; --l)
            if (n == t) {
                o.splice(l, 1);
                break
            }!o.length && o.event && r.detachEvent("on" + e, o.event)
    }), e("dispatchEvent", function(e) {
        var t = this,
            n = e.type,
            r = t.addEventListener.listeners = t.addEventListener.listeners || {},
            a = r[n] = r[n] || [];
        try {
            return t.fireEvent("on" + n, e)
        } catch (o) {
            return a.event && a.event(e), void 0
        }
    }), Object.defineProperty(Window.prototype, "CustomEvent", {
        get: function() {
            var e = this;
            return function(t, n) {
                var r, a = e.document.createEventObject();
                a.type = t;
                for (r in n) "cancelable" == r ? a.returnValue = !n.cancelable : "bubbles" == r ? a.cancelBubble = !n.bubbles : "detail" == r && (a.detail = n.detail);
                return a
            }
        }
    }), t.interval = setInterval(t, 1), window.addEventListener("load", t)
}(), !this.CustomEvent && function() {
    window.CustomEvent = function(e, t) {
        var n;
        t = t || {
            bubbles: !1,
            cancelable: !1,
            detail: void 0
        };
        try {
            n = document.createEvent("CustomEvent"), n.initCustomEvent(e, t.bubbles, t.cancelable, t.detail)
        } catch (r) {
            n = document.createEvent("Event"), n.initEvent(e, t.bubbles, t.cancelable), n.detail = t.detail
        }
        return n
    }
}();

// Polyfill for trim() function
/////////////////////////////////////////////////////////////////////////////////////////////////////
if (!String.prototype.trim) {
  (function() {
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function() {
      return this.replace(rtrim, '');
    };
  })();
}