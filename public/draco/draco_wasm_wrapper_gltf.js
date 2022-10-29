var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function (m) {
    var n = 0;
    return function () {
        return n < m.length ? { done: !1, value: m[n++] } : { done: !0 };
    };
};
$jscomp.arrayIterator = function (m) {
    return { next: $jscomp.arrayIteratorImpl(m) };
};
$jscomp.makeIterator = function (m) {
    var n =
        "undefined" != typeof Symbol && Symbol.iterator && m[Symbol.iterator];
    return n ? n.call(m) : $jscomp.arrayIterator(m);
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.ISOLATE_POLYFILLS = !1;
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = !1;
$jscomp.getGlobal = function (m) {
    m = [
        "object" == typeof globalThis && globalThis,
        m,
        "object" == typeof window && window,
        "object" == typeof self && self,
        "object" == typeof global && global,
    ];
    for (var n = 0; n < m.length; ++n) {
        var k = m[n];
        if (k && k.Math == Math) return k;
    }
    throw Error("Cannot find global object");
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.defineProperty =
    $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties
        ? Object.defineProperty
        : function (m, n, k) {
              if (m == Array.prototype || m == Object.prototype) return m;
              m[n] = k.value;
              return m;
          };
$jscomp.IS_SYMBOL_NATIVE =
    "function" === typeof Symbol && "symbol" === typeof Symbol("x");
$jscomp.TRUST_ES6_POLYFILLS =
    !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = "$jscp$";
var $jscomp$lookupPolyfilledValue = function (m, n) {
    var k = $jscomp.propertyToPolyfillSymbol[n];
    if (null == k) return m[n];
    k = m[k];
    return void 0 !== k ? k : m[n];
};
$jscomp.polyfill = function (m, n, k, q) {
    n &&
        ($jscomp.ISOLATE_POLYFILLS
            ? $jscomp.polyfillIsolated(m, n, k, q)
            : $jscomp.polyfillUnisolated(m, n, k, q));
};
$jscomp.polyfillUnisolated = function (m, n, k, q) {
    k = $jscomp.global;
    m = m.split(".");
    for (q = 0; q < m.length - 1; q++) {
        var h = m[q];
        if (!(h in k)) return;
        k = k[h];
    }
    m = m[m.length - 1];
    q = k[m];
    n = n(q);
    n != q &&
        null != n &&
        $jscomp.defineProperty(k, m, {
            configurable: !0,
            writable: !0,
            value: n,
        });
};
$jscomp.polyfillIsolated = function (m, n, k, q) {
    var h = m.split(".");
    m = 1 === h.length;
    q = h[0];
    q = !m && q in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
    for (var A = 0; A < h.length - 1; A++) {
        var f = h[A];
        if (!(f in q)) return;
        q = q[f];
    }
    h = h[h.length - 1];
    k = $jscomp.IS_SYMBOL_NATIVE && "es6" === k ? q[h] : null;
    n = n(k);
    null != n &&
        (m
            ? $jscomp.defineProperty($jscomp.polyfills, h, {
                  configurable: !0,
                  writable: !0,
                  value: n,
              })
            : n !== k &&
              (void 0 === $jscomp.propertyToPolyfillSymbol[h] &&
                  ((k = (1e9 * Math.random()) >>> 0),
                  ($jscomp.propertyToPolyfillSymbol[h] =
                      $jscomp.IS_SYMBOL_NATIVE
                          ? $jscomp.global.Symbol(h)
                          : $jscomp.POLYFILL_PREFIX + k + "$" + h)),
              $jscomp.defineProperty(q, $jscomp.propertyToPolyfillSymbol[h], {
                  configurable: !0,
                  writable: !0,
                  value: n,
              })));
};
$jscomp.polyfill(
    "Promise",
    function (m) {
        function n() {
            this.batch_ = null;
        }
        function k(f) {
            return f instanceof h
                ? f
                : new h(function (p, v) {
                      p(f);
                  });
        }
        if (
            m &&
            (!(
                $jscomp.FORCE_POLYFILL_PROMISE ||
                ($jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION &&
                    "undefined" === typeof $jscomp.global.PromiseRejectionEvent)
            ) ||
                !$jscomp.global.Promise ||
                -1 ===
                    $jscomp.global.Promise.toString().indexOf("[native code]"))
        )
            return m;
        n.prototype.asyncExecute = function (f) {
            if (null == this.batch_) {
                this.batch_ = [];
                var p = this;
                this.asyncExecuteFunction(function () {
                    p.executeBatch_();
                });
            }
            this.batch_.push(f);
        };
        var q = $jscomp.global.setTimeout;
        n.prototype.asyncExecuteFunction = function (f) {
            q(f, 0);
        };
        n.prototype.executeBatch_ = function () {
            for (; this.batch_ && this.batch_.length; ) {
                var f = this.batch_;
                this.batch_ = [];
                for (var p = 0; p < f.length; ++p) {
                    var v = f[p];
                    f[p] = null;
                    try {
                        v();
                    } catch (z) {
                        this.asyncThrow_(z);
                    }
                }
            }
            this.batch_ = null;
        };
        n.prototype.asyncThrow_ = function (f) {
            this.asyncExecuteFunction(function () {
                throw f;
            });
        };
        var h = function (f) {
            this.state_ = 0;
            this.result_ = void 0;
            this.onSettledCallbacks_ = [];
            this.isRejectionHandled_ = !1;
            var p = this.createResolveAndReject_();
            try {
                f(p.resolve, p.reject);
            } catch (v) {
                p.reject(v);
            }
        };
        h.prototype.createResolveAndReject_ = function () {
            function f(z) {
                return function (F) {
                    v || ((v = !0), z.call(p, F));
                };
            }
            var p = this,
                v = !1;
            return { resolve: f(this.resolveTo_), reject: f(this.reject_) };
        };
        h.prototype.resolveTo_ = function (f) {
            if (f === this)
                this.reject_(
                    new TypeError("A Promise cannot resolve to itself")
                );
            else if (f instanceof h) this.settleSameAsPromise_(f);
            else {
                a: switch (typeof f) {
                    case "object":
                        var p = null != f;
                        break a;
                    case "function":
                        p = !0;
                        break a;
                    default:
                        p = !1;
                }
                p ? this.resolveToNonPromiseObj_(f) : this.fulfill_(f);
            }
        };
        h.prototype.resolveToNonPromiseObj_ = function (f) {
            var p = void 0;
            try {
                p = f.then;
            } catch (v) {
                this.reject_(v);
                return;
            }
            "function" == typeof p
                ? this.settleSameAsThenable_(p, f)
                : this.fulfill_(f);
        };
        h.prototype.reject_ = function (f) {
            this.settle_(2, f);
        };
        h.prototype.fulfill_ = function (f) {
            this.settle_(1, f);
        };
        h.prototype.settle_ = function (f, p) {
            if (0 != this.state_)
                throw Error(
                    "Cannot settle(" +
                        f +
                        ", " +
                        p +
                        "): Promise already settled in state" +
                        this.state_
                );
            this.state_ = f;
            this.result_ = p;
            2 === this.state_ && this.scheduleUnhandledRejectionCheck_();
            this.executeOnSettledCallbacks_();
        };
        h.prototype.scheduleUnhandledRejectionCheck_ = function () {
            var f = this;
            q(function () {
                if (f.notifyUnhandledRejection_()) {
                    var p = $jscomp.global.console;
                    "undefined" !== typeof p && p.error(f.result_);
                }
            }, 1);
        };
        h.prototype.notifyUnhandledRejection_ = function () {
            if (this.isRejectionHandled_) return !1;
            var f = $jscomp.global.CustomEvent,
                p = $jscomp.global.Event,
                v = $jscomp.global.dispatchEvent;
            if ("undefined" === typeof v) return !0;
            "function" === typeof f
                ? (f = new f("unhandledrejection", { cancelable: !0 }))
                : "function" === typeof p
                ? (f = new p("unhandledrejection", { cancelable: !0 }))
                : ((f = $jscomp.global.document.createEvent("CustomEvent")),
                  f.initCustomEvent("unhandledrejection", !1, !0, f));
            f.promise = this;
            f.reason = this.result_;
            return v(f);
        };
        h.prototype.executeOnSettledCallbacks_ = function () {
            if (null != this.onSettledCallbacks_) {
                for (var f = 0; f < this.onSettledCallbacks_.length; ++f)
                    A.asyncExecute(this.onSettledCallbacks_[f]);
                this.onSettledCallbacks_ = null;
            }
        };
        var A = new n();
        h.prototype.settleSameAsPromise_ = function (f) {
            var p = this.createResolveAndReject_();
            f.callWhenSettled_(p.resolve, p.reject);
        };
        h.prototype.settleSameAsThenable_ = function (f, p) {
            var v = this.createResolveAndReject_();
            try {
                f.call(p, v.resolve, v.reject);
            } catch (z) {
                v.reject(z);
            }
        };
        h.prototype.then = function (f, p) {
            function v(P, t) {
                return "function" == typeof P
                    ? function (x) {
                          try {
                              z(P(x));
                          } catch (D) {
                              F(D);
                          }
                      }
                    : t;
            }
            var z,
                F,
                fa = new h(function (P, t) {
                    z = P;
                    F = t;
                });
            this.callWhenSettled_(v(f, z), v(p, F));
            return fa;
        };
        h.prototype.catch = function (f) {
            return this.then(void 0, f);
        };
        h.prototype.callWhenSettled_ = function (f, p) {
            function v() {
                switch (z.state_) {
                    case 1:
                        f(z.result_);
                        break;
                    case 2:
                        p(z.result_);
                        break;
                    default:
                        throw Error("Unexpected state: " + z.state_);
                }
            }
            var z = this;
            null == this.onSettledCallbacks_
                ? A.asyncExecute(v)
                : this.onSettledCallbacks_.push(v);
            this.isRejectionHandled_ = !0;
        };
        h.resolve = k;
        h.reject = function (f) {
            return new h(function (p, v) {
                v(f);
            });
        };
        h.race = function (f) {
            return new h(function (p, v) {
                for (
                    var z = $jscomp.makeIterator(f), F = z.next();
                    !F.done;
                    F = z.next()
                )
                    k(F.value).callWhenSettled_(p, v);
            });
        };
        h.all = function (f) {
            var p = $jscomp.makeIterator(f),
                v = p.next();
            return v.done
                ? k([])
                : new h(function (z, F) {
                      function fa(x) {
                          return function (D) {
                              P[x] = D;
                              t--;
                              0 == t && z(P);
                          };
                      }
                      var P = [],
                          t = 0;
                      do
                          P.push(void 0),
                              t++,
                              k(v.value).callWhenSettled_(fa(P.length - 1), F),
                              (v = p.next());
                      while (!v.done);
                  });
        };
        return h;
    },
    "es6",
    "es3"
);
$jscomp.checkStringArgs = function (m, n, k) {
    if (null == m)
        throw new TypeError(
            "The 'this' value for String.prototype." +
                k +
                " must not be null or undefined"
        );
    if (n instanceof RegExp)
        throw new TypeError(
            "First argument to String.prototype." +
                k +
                " must not be a regular expression"
        );
    return m + "";
};
$jscomp.polyfill(
    "String.prototype.startsWith",
    function (m) {
        return m
            ? m
            : function (n, k) {
                  var q = $jscomp.checkStringArgs(this, n, "startsWith");
                  n += "";
                  var h = q.length,
                      A = n.length;
                  k = Math.max(0, Math.min(k | 0, q.length));
                  for (var f = 0; f < A && k < h; )
                      if (q[k++] != n[f++]) return !1;
                  return f >= A;
              };
    },
    "es6",
    "es3"
);
$jscomp.polyfill(
    "Array.prototype.copyWithin",
    function (m) {
        function n(k) {
            k = Number(k);
            return Infinity === k || -Infinity === k ? k : k | 0;
        }
        return m
            ? m
            : function (k, q, h) {
                  var A = this.length;
                  k = n(k);
                  q = n(q);
                  h = void 0 === h ? A : n(h);
                  k = 0 > k ? Math.max(A + k, 0) : Math.min(k, A);
                  q = 0 > q ? Math.max(A + q, 0) : Math.min(q, A);
                  h = 0 > h ? Math.max(A + h, 0) : Math.min(h, A);
                  if (k < q)
                      for (; q < h; )
                          q in this
                              ? (this[k++] = this[q++])
                              : (delete this[k++], q++);
                  else
                      for (h = Math.min(h, A + q - k), k += h - q; h > q; )
                          --h in this
                              ? (this[--k] = this[h])
                              : delete this[--k];
                  return this;
              };
    },
    "es6",
    "es3"
);
$jscomp.typedArrayCopyWithin = function (m) {
    return m ? m : Array.prototype.copyWithin;
};
$jscomp.polyfill(
    "Int8Array.prototype.copyWithin",
    $jscomp.typedArrayCopyWithin,
    "es6",
    "es5"
);
$jscomp.polyfill(
    "Uint8Array.prototype.copyWithin",
    $jscomp.typedArrayCopyWithin,
    "es6",
    "es5"
);
$jscomp.polyfill(
    "Uint8ClampedArray.prototype.copyWithin",
    $jscomp.typedArrayCopyWithin,
    "es6",
    "es5"
);
$jscomp.polyfill(
    "Int16Array.prototype.copyWithin",
    $jscomp.typedArrayCopyWithin,
    "es6",
    "es5"
);
$jscomp.polyfill(
    "Uint16Array.prototype.copyWithin",
    $jscomp.typedArrayCopyWithin,
    "es6",
    "es5"
);
$jscomp.polyfill(
    "Int32Array.prototype.copyWithin",
    $jscomp.typedArrayCopyWithin,
    "es6",
    "es5"
);
$jscomp.polyfill(
    "Uint32Array.prototype.copyWithin",
    $jscomp.typedArrayCopyWithin,
    "es6",
    "es5"
);
$jscomp.polyfill(
    "Float32Array.prototype.copyWithin",
    $jscomp.typedArrayCopyWithin,
    "es6",
    "es5"
);
$jscomp.polyfill(
    "Float64Array.prototype.copyWithin",
    $jscomp.typedArrayCopyWithin,
    "es6",
    "es5"
);
var DracoDecoderModule = (function () {
    var m =
        "undefined" !== typeof document && document.currentScript
            ? document.currentScript.src
            : void 0;
    "undefined" !== typeof __filename && (m = m || __filename);
    return function (n) {
        function k(e) {
            return a.locateFile ? a.locateFile(e, U) : U + e;
        }
        function q(e, b) {
            e || f("Assertion failed: " + b);
        }
        function h(e, b) {
            if (e) {
                var c = ma;
                var d = e + b;
                for (b = e; c[b] && !(b >= d); ) ++b;
                if (16 < b - e && c.subarray && wa)
                    c = wa.decode(c.subarray(e, b));
                else {
                    for (d = ""; e < b; ) {
                        var g = c[e++];
                        if (g & 128) {
                            var u = c[e++] & 63;
                            if (192 == (g & 224))
                                d += String.fromCharCode(((g & 31) << 6) | u);
                            else {
                                var X = c[e++] & 63;
                                g =
                                    224 == (g & 240)
                                        ? ((g & 15) << 12) | (u << 6) | X
                                        : ((g & 7) << 18) |
                                          (u << 12) |
                                          (X << 6) |
                                          (c[e++] & 63);
                                65536 > g
                                    ? (d += String.fromCharCode(g))
                                    : ((g -= 65536),
                                      (d += String.fromCharCode(
                                          55296 | (g >> 10),
                                          56320 | (g & 1023)
                                      )));
                            }
                        } else d += String.fromCharCode(g);
                    }
                    c = d;
                }
            } else c = "";
            return c;
        }
        function A(e) {
            xa = e;
            a.HEAP8 = Y = new Int8Array(e);
            a.HEAP16 = new Int16Array(e);
            a.HEAP32 = V = new Int32Array(e);
            a.HEAPU8 = ma = new Uint8Array(e);
            a.HEAPU16 = new Uint16Array(e);
            a.HEAPU32 = new Uint32Array(e);
            a.HEAPF32 = new Float32Array(e);
            a.HEAPF64 = new Float64Array(e);
        }
        function f(e) {
            if (a.onAbort) a.onAbort(e);
            e = "Aborted(" + e + ")";
            ha(e);
            ya = !0;
            e = new WebAssembly.RuntimeError(
                e + ". Build with -s ASSERTIONS=1 for more info."
            );
            qa(e);
            throw e;
        }
        function p(e) {
            try {
                if (e == Q && ia) return new Uint8Array(ia);
                if (ra) return ra(e);
                throw "both async and sync fetching of the wasm failed";
            } catch (b) {
                f(b);
            }
        }
        function v() {
            if (!ia && (za || ja)) {
                if ("function" === typeof fetch && !Q.startsWith("file://"))
                    return fetch(Q, { credentials: "same-origin" })
                        .then(function (e) {
                            if (!e.ok)
                                throw (
                                    "failed to load wasm binary file at '" +
                                    Q +
                                    "'"
                                );
                            return e.arrayBuffer();
                        })
                        .catch(function () {
                            return p(Q);
                        });
                if (sa)
                    return new Promise(function (e, b) {
                        sa(
                            Q,
                            function (c) {
                                e(new Uint8Array(c));
                            },
                            b
                        );
                    });
            }
            return Promise.resolve().then(function () {
                return p(Q);
            });
        }
        function z(e) {
            for (; 0 < e.length; ) {
                var b = e.shift();
                if ("function" == typeof b) b(a);
                else {
                    var c = b.func;
                    "number" === typeof c
                        ? void 0 === b.arg
                            ? F(c)()
                            : F(c)(b.arg)
                        : c(void 0 === b.arg ? null : b.arg);
                }
            }
        }
        function F(e) {
            var b = na[e];
            b ||
                (e >= na.length && (na.length = e + 1),
                (na[e] = b = Aa.get(e)));
            return b;
        }
        function fa(e) {
            this.excPtr = e;
            this.ptr = e - 16;
            this.set_type = function (b) {
                V[(this.ptr + 4) >> 2] = b;
            };
            this.get_type = function () {
                return V[(this.ptr + 4) >> 2];
            };
            this.set_destructor = function (b) {
                V[(this.ptr + 8) >> 2] = b;
            };
            this.get_destructor = function () {
                return V[(this.ptr + 8) >> 2];
            };
            this.set_refcount = function (b) {
                V[this.ptr >> 2] = b;
            };
            this.set_caught = function (b) {
                Y[(this.ptr + 12) >> 0] = b ? 1 : 0;
            };
            this.get_caught = function () {
                return 0 != Y[(this.ptr + 12) >> 0];
            };
            this.set_rethrown = function (b) {
                Y[(this.ptr + 13) >> 0] = b ? 1 : 0;
            };
            this.get_rethrown = function () {
                return 0 != Y[(this.ptr + 13) >> 0];
            };
            this.init = function (b, c) {
                this.set_type(b);
                this.set_destructor(c);
                this.set_refcount(0);
                this.set_caught(!1);
                this.set_rethrown(!1);
            };
            this.add_ref = function () {
                V[this.ptr >> 2] += 1;
            };
            this.release_ref = function () {
                var b = V[this.ptr >> 2];
                V[this.ptr >> 2] = b - 1;
                return 1 === b;
            };
        }
        function P(e) {
            function b() {
                if (!oa && ((oa = !0), (a.calledRun = !0), !ya)) {
                    Ba = !0;
                    z(ta);
                    Ca(a);
                    if (a.onRuntimeInitialized) a.onRuntimeInitialized();
                    if (a.postRun)
                        for (
                            "function" == typeof a.postRun &&
                            (a.postRun = [a.postRun]);
                            a.postRun.length;

                        )
                            Da.unshift(a.postRun.shift());
                    z(Da);
                }
            }
            if (!(0 < ca)) {
                if (a.preRun)
                    for (
                        "function" == typeof a.preRun &&
                        (a.preRun = [a.preRun]);
                        a.preRun.length;

                    )
                        Ea.unshift(a.preRun.shift());
                z(Ea);
                0 < ca ||
                    (a.setStatus
                        ? (a.setStatus("Running..."),
                          setTimeout(function () {
                              setTimeout(function () {
                                  a.setStatus("");
                              }, 1);
                              b();
                          }, 1))
                        : b());
            }
        }
        function t() {}
        function x(e) {
            return (e || t).__cache__;
        }
        function D(e, b) {
            var c = x(b),
                d = c[e];
            if (d) return d;
            d = Object.create((b || t).prototype);
            d.ptr = e;
            return (c[e] = d);
        }
        function aa(e) {
            if ("string" === typeof e) {
                for (var b = 0, c = 0; c < e.length; ++c) {
                    var d = e.charCodeAt(c);
                    55296 <= d &&
                        57343 >= d &&
                        (d =
                            (65536 + ((d & 1023) << 10)) |
                            (e.charCodeAt(++c) & 1023));
                    127 >= d
                        ? ++b
                        : (b = 2047 >= d ? b + 2 : 65535 >= d ? b + 3 : b + 4);
                }
                b = Array(b + 1);
                c = 0;
                d = b.length;
                if (0 < d) {
                    d = c + d - 1;
                    for (var g = 0; g < e.length; ++g) {
                        var u = e.charCodeAt(g);
                        if (55296 <= u && 57343 >= u) {
                            var X = e.charCodeAt(++g);
                            u = (65536 + ((u & 1023) << 10)) | (X & 1023);
                        }
                        if (127 >= u) {
                            if (c >= d) break;
                            b[c++] = u;
                        } else {
                            if (2047 >= u) {
                                if (c + 1 >= d) break;
                                b[c++] = 192 | (u >> 6);
                            } else {
                                if (65535 >= u) {
                                    if (c + 2 >= d) break;
                                    b[c++] = 224 | (u >> 12);
                                } else {
                                    if (c + 3 >= d) break;
                                    b[c++] = 240 | (u >> 18);
                                    b[c++] = 128 | ((u >> 12) & 63);
                                }
                                b[c++] = 128 | ((u >> 6) & 63);
                            }
                            b[c++] = 128 | (u & 63);
                        }
                    }
                    b[c] = 0;
                }
                e = r.alloc(b, Y);
                r.copy(b, Y, e);
                return e;
            }
            return e;
        }
        function ua(e) {
            if ("object" === typeof e) {
                var b = r.alloc(e, Y);
                r.copy(e, Y, b);
                return b;
            }
            return e;
        }
        function Z() {
            throw "cannot construct a VoidPtr, no constructor in IDL";
        }
        function S() {
            this.ptr = Fa();
            x(S)[this.ptr] = this;
        }
        function R() {
            this.ptr = Ga();
            x(R)[this.ptr] = this;
        }
        function W() {
            this.ptr = Ha();
            x(W)[this.ptr] = this;
        }
        function w() {
            this.ptr = Ia();
            x(w)[this.ptr] = this;
        }
        function C() {
            this.ptr = Ja();
            x(C)[this.ptr] = this;
        }
        function G() {
            this.ptr = Ka();
            x(G)[this.ptr] = this;
        }
        function H() {
            this.ptr = La();
            x(H)[this.ptr] = this;
        }
        function E() {
            this.ptr = Ma();
            x(E)[this.ptr] = this;
        }
        function T() {
            this.ptr = Na();
            x(T)[this.ptr] = this;
        }
        function B() {
            throw "cannot construct a Status, no constructor in IDL";
        }
        function I() {
            this.ptr = Oa();
            x(I)[this.ptr] = this;
        }
        function J() {
            this.ptr = Pa();
            x(J)[this.ptr] = this;
        }
        function K() {
            this.ptr = Qa();
            x(K)[this.ptr] = this;
        }
        function L() {
            this.ptr = Ra();
            x(L)[this.ptr] = this;
        }
        function M() {
            this.ptr = Sa();
            x(M)[this.ptr] = this;
        }
        function N() {
            this.ptr = Ta();
            x(N)[this.ptr] = this;
        }
        function O() {
            this.ptr = Ua();
            x(O)[this.ptr] = this;
        }
        function y() {
            this.ptr = Va();
            x(y)[this.ptr] = this;
        }
        function l() {
            this.ptr = Wa();
            x(l)[this.ptr] = this;
        }
        n = n || {};
        var a = "undefined" !== typeof n ? n : {},
            Ca,
            qa;
        a.ready = new Promise(function (e, b) {
            Ca = e;
            qa = b;
        });
        var Xa = !1,
            Ya = !1;
        a.onRuntimeInitialized = function () {
            Xa = !0;
            if (Ya && "function" === typeof a.onModuleLoaded)
                a.onModuleLoaded(a);
        };
        a.onModuleParsed = function () {
            Ya = !0;
            if (Xa && "function" === typeof a.onModuleLoaded)
                a.onModuleLoaded(a);
        };
        a.isVersionSupported = function (e) {
            if ("string" !== typeof e) return !1;
            e = e.split(".");
            return 2 > e.length || 3 < e.length
                ? !1
                : 1 == e[0] && 0 <= e[1] && 5 >= e[1]
                ? !0
                : 0 != e[0] || 10 < e[1]
                ? !1
                : !0;
        };
        var ka = {},
            ba;
        for (ba in a) a.hasOwnProperty(ba) && (ka[ba] = a[ba]);
        var za = "object" === typeof window,
            ja = "function" === typeof importScripts,
            U = "",
            da,
            ea;
        if (
            "object" === typeof process &&
            "object" === typeof process.versions &&
            "string" === typeof process.versions.node
        ) {
            U = ja ? require("path").dirname(U) + "/" : __dirname + "/";
            var Za = function (e, b) {
                da || (da = require("fs"));
                ea || (ea = require("path"));
                e = ea.normalize(e);
                return da.readFileSync(e, b ? null : "utf8");
            };
            var ra = function (e) {
                e = Za(e, !0);
                e.buffer || (e = new Uint8Array(e));
                q(e.buffer);
                return e;
            };
            var sa = function (e, b, c) {
                da || (da = require("fs"));
                ea || (ea = require("path"));
                e = ea.normalize(e);
                da.readFile(e, function (d, g) {
                    d ? c(d) : b(g.buffer);
                });
            };
            1 < process.argv.length && process.argv[1].replace(/\\/g, "/");
            process.argv.slice(2);
            a.inspect = function () {
                return "[Emscripten Module object]";
            };
        } else if (za || ja)
            ja
                ? (U = self.location.href)
                : "undefined" !== typeof document &&
                  document.currentScript &&
                  (U = document.currentScript.src),
                m && (U = m),
                (U =
                    0 !== U.indexOf("blob:")
                        ? U.substr(
                              0,
                              U.replace(/[?#].*/, "").lastIndexOf("/") + 1
                          )
                        : ""),
                (Za = function (e) {
                    var b = new XMLHttpRequest();
                    b.open("GET", e, !1);
                    b.send(null);
                    return b.responseText;
                }),
                ja &&
                    (ra = function (e) {
                        var b = new XMLHttpRequest();
                        b.open("GET", e, !1);
                        b.responseType = "arraybuffer";
                        b.send(null);
                        return new Uint8Array(b.response);
                    }),
                (sa = function (e, b, c) {
                    var d = new XMLHttpRequest();
                    d.open("GET", e, !0);
                    d.responseType = "arraybuffer";
                    d.onload = function () {
                        200 == d.status || (0 == d.status && d.response)
                            ? b(d.response)
                            : c();
                    };
                    d.onerror = c;
                    d.send(null);
                });
        a.print || console.log.bind(console);
        var ha = a.printErr || console.warn.bind(console);
        for (ba in ka) ka.hasOwnProperty(ba) && (a[ba] = ka[ba]);
        ka = null;
        var ia;
        a.wasmBinary && (ia = a.wasmBinary);
        "object" !== typeof WebAssembly && f("no native wasm support detected");
        var pa,
            ya = !1,
            wa =
                "undefined" !== typeof TextDecoder
                    ? new TextDecoder("utf8")
                    : void 0,
            xa,
            Y,
            ma,
            V,
            Aa,
            Ea = [],
            ta = [],
            Da = [],
            Ba = !1,
            ca = 0,
            va = null,
            la = null;
        a.preloadedImages = {};
        a.preloadedAudios = {};
        var Q = "draco_decoder_gltf.wasm";
        Q.startsWith("data:application/octet-stream;base64,") || (Q = k(Q));
        var na = [],
            td = 0,
            ud = {
                e: function (e) {
                    return $a(e + 16) + 16;
                },
                d: function (e, b, c) {
                    new fa(e).init(b, c);
                    td++;
                    throw e;
                },
                a: function () {
                    f("");
                },
                b: function (e, b, c) {
                    ma.copyWithin(e, b, b + c);
                },
                c: function (e) {
                    var b = ma.length;
                    e >>>= 0;
                    if (2147483648 < e) return !1;
                    for (var c = 1; 4 >= c; c *= 2) {
                        var d = b * (1 + 0.2 / c);
                        d = Math.min(d, e + 100663296);
                        var g = Math,
                            u = g.min;
                        d = Math.max(e, d);
                        0 < d % 65536 && (d += 65536 - (d % 65536));
                        g = u.call(g, 2147483648, d);
                        a: {
                            try {
                                pa.grow((g - xa.byteLength + 65535) >>> 16);
                                A(pa.buffer);
                                var X = 1;
                                break a;
                            } catch (vd) {}
                            X = void 0;
                        }
                        if (X) return !0;
                    }
                    return !1;
                },
            };
        (function () {
            function e(g, u) {
                a.asm = g.exports;
                pa = a.asm.f;
                A(pa.buffer);
                Aa = a.asm.h;
                ta.unshift(a.asm.g);
                ca--;
                a.monitorRunDependencies && a.monitorRunDependencies(ca);
                0 == ca &&
                    (null !== va && (clearInterval(va), (va = null)),
                    la && ((g = la), (la = null), g()));
            }
            function b(g) {
                e(g.instance);
            }
            function c(g) {
                return v()
                    .then(function (u) {
                        return WebAssembly.instantiate(u, d);
                    })
                    .then(function (u) {
                        return u;
                    })
                    .then(g, function (u) {
                        ha("failed to asynchronously prepare wasm: " + u);
                        f(u);
                    });
            }
            var d = { a: ud };
            ca++;
            a.monitorRunDependencies && a.monitorRunDependencies(ca);
            if (a.instantiateWasm)
                try {
                    return a.instantiateWasm(d, e);
                } catch (g) {
                    return (
                        ha(
                            "Module.instantiateWasm callback failed with error: " +
                                g
                        ),
                        !1
                    );
                }
            (function () {
                return ia ||
                    "function" !== typeof WebAssembly.instantiateStreaming ||
                    Q.startsWith("data:application/octet-stream;base64,") ||
                    Q.startsWith("file://") ||
                    "function" !== typeof fetch
                    ? c(b)
                    : fetch(Q, { credentials: "same-origin" }).then(function (
                          g
                      ) {
                          return WebAssembly.instantiateStreaming(g, d).then(
                              b,
                              function (u) {
                                  ha("wasm streaming compile failed: " + u);
                                  ha(
                                      "falling back to ArrayBuffer instantiation"
                                  );
                                  return c(b);
                              }
                          );
                      });
            })().catch(qa);
            return {};
        })();
        a.___wasm_call_ctors = function () {
            return (a.___wasm_call_ctors = a.asm.g).apply(null, arguments);
        };
        var ab = (a._emscripten_bind_VoidPtr___destroy___0 = function () {
                return (ab = a._emscripten_bind_VoidPtr___destroy___0 =
                    a.asm.i).apply(null, arguments);
            }),
            Fa = (a._emscripten_bind_DecoderBuffer_DecoderBuffer_0 =
                function () {
                    return (Fa =
                        a._emscripten_bind_DecoderBuffer_DecoderBuffer_0 =
                            a.asm.j).apply(null, arguments);
                }),
            bb = (a._emscripten_bind_DecoderBuffer_Init_2 = function () {
                return (bb = a._emscripten_bind_DecoderBuffer_Init_2 =
                    a.asm.k).apply(null, arguments);
            }),
            cb = (a._emscripten_bind_DecoderBuffer___destroy___0 = function () {
                return (cb = a._emscripten_bind_DecoderBuffer___destroy___0 =
                    a.asm.l).apply(null, arguments);
            }),
            Ga =
                (a._emscripten_bind_AttributeTransformData_AttributeTransformData_0 =
                    function () {
                        return (Ga =
                            a._emscripten_bind_AttributeTransformData_AttributeTransformData_0 =
                                a.asm.m).apply(null, arguments);
                    }),
            db = (a._emscripten_bind_AttributeTransformData_transform_type_0 =
                function () {
                    return (db =
                        a._emscripten_bind_AttributeTransformData_transform_type_0 =
                            a.asm.n).apply(null, arguments);
                }),
            eb = (a._emscripten_bind_AttributeTransformData___destroy___0 =
                function () {
                    return (eb =
                        a._emscripten_bind_AttributeTransformData___destroy___0 =
                            a.asm.o).apply(null, arguments);
                }),
            Ha = (a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 =
                function () {
                    return (Ha =
                        a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 =
                            a.asm.p).apply(null, arguments);
                }),
            fb = (a._emscripten_bind_GeometryAttribute___destroy___0 =
                function () {
                    return (fb =
                        a._emscripten_bind_GeometryAttribute___destroy___0 =
                            a.asm.q).apply(null, arguments);
                }),
            Ia = (a._emscripten_bind_PointAttribute_PointAttribute_0 =
                function () {
                    return (Ia =
                        a._emscripten_bind_PointAttribute_PointAttribute_0 =
                            a.asm.r).apply(null, arguments);
                }),
            gb = (a._emscripten_bind_PointAttribute_size_0 = function () {
                return (gb = a._emscripten_bind_PointAttribute_size_0 =
                    a.asm.s).apply(null, arguments);
            }),
            hb =
                (a._emscripten_bind_PointAttribute_GetAttributeTransformData_0 =
                    function () {
                        return (hb =
                            a._emscripten_bind_PointAttribute_GetAttributeTransformData_0 =
                                a.asm.t).apply(null, arguments);
                    }),
            ib = (a._emscripten_bind_PointAttribute_attribute_type_0 =
                function () {
                    return (ib =
                        a._emscripten_bind_PointAttribute_attribute_type_0 =
                            a.asm.u).apply(null, arguments);
                }),
            jb = (a._emscripten_bind_PointAttribute_data_type_0 = function () {
                return (jb = a._emscripten_bind_PointAttribute_data_type_0 =
                    a.asm.v).apply(null, arguments);
            }),
            kb = (a._emscripten_bind_PointAttribute_num_components_0 =
                function () {
                    return (kb =
                        a._emscripten_bind_PointAttribute_num_components_0 =
                            a.asm.w).apply(null, arguments);
                }),
            lb = (a._emscripten_bind_PointAttribute_normalized_0 = function () {
                return (lb = a._emscripten_bind_PointAttribute_normalized_0 =
                    a.asm.x).apply(null, arguments);
            }),
            mb = (a._emscripten_bind_PointAttribute_byte_stride_0 =
                function () {
                    return (mb =
                        a._emscripten_bind_PointAttribute_byte_stride_0 =
                            a.asm.y).apply(null, arguments);
                }),
            nb = (a._emscripten_bind_PointAttribute_byte_offset_0 =
                function () {
                    return (nb =
                        a._emscripten_bind_PointAttribute_byte_offset_0 =
                            a.asm.z).apply(null, arguments);
                }),
            ob = (a._emscripten_bind_PointAttribute_unique_id_0 = function () {
                return (ob = a._emscripten_bind_PointAttribute_unique_id_0 =
                    a.asm.A).apply(null, arguments);
            }),
            pb = (a._emscripten_bind_PointAttribute___destroy___0 =
                function () {
                    return (pb =
                        a._emscripten_bind_PointAttribute___destroy___0 =
                            a.asm.B).apply(null, arguments);
                }),
            Ja =
                (a._emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 =
                    function () {
                        return (Ja =
                            a._emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 =
                                a.asm.C).apply(null, arguments);
                    }),
            qb =
                (a._emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 =
                    function () {
                        return (qb =
                            a._emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 =
                                a.asm.D).apply(null, arguments);
                    }),
            rb =
                (a._emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 =
                    function () {
                        return (rb =
                            a._emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 =
                                a.asm.E).apply(null, arguments);
                    }),
            sb =
                (a._emscripten_bind_AttributeQuantizationTransform_min_value_1 =
                    function () {
                        return (sb =
                            a._emscripten_bind_AttributeQuantizationTransform_min_value_1 =
                                a.asm.F).apply(null, arguments);
                    }),
            tb = (a._emscripten_bind_AttributeQuantizationTransform_range_0 =
                function () {
                    return (tb =
                        a._emscripten_bind_AttributeQuantizationTransform_range_0 =
                            a.asm.G).apply(null, arguments);
                }),
            ub =
                (a._emscripten_bind_AttributeQuantizationTransform___destroy___0 =
                    function () {
                        return (ub =
                            a._emscripten_bind_AttributeQuantizationTransform___destroy___0 =
                                a.asm.H).apply(null, arguments);
                    }),
            Ka =
                (a._emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 =
                    function () {
                        return (Ka =
                            a._emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 =
                                a.asm.I).apply(null, arguments);
                    }),
            vb =
                (a._emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 =
                    function () {
                        return (vb =
                            a._emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 =
                                a.asm.J).apply(null, arguments);
                    }),
            wb =
                (a._emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 =
                    function () {
                        return (wb =
                            a._emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 =
                                a.asm.K).apply(null, arguments);
                    }),
            xb =
                (a._emscripten_bind_AttributeOctahedronTransform___destroy___0 =
                    function () {
                        return (xb =
                            a._emscripten_bind_AttributeOctahedronTransform___destroy___0 =
                                a.asm.L).apply(null, arguments);
                    }),
            La = (a._emscripten_bind_PointCloud_PointCloud_0 = function () {
                return (La = a._emscripten_bind_PointCloud_PointCloud_0 =
                    a.asm.M).apply(null, arguments);
            }),
            yb = (a._emscripten_bind_PointCloud_num_attributes_0 = function () {
                return (yb = a._emscripten_bind_PointCloud_num_attributes_0 =
                    a.asm.N).apply(null, arguments);
            }),
            zb = (a._emscripten_bind_PointCloud_num_points_0 = function () {
                return (zb = a._emscripten_bind_PointCloud_num_points_0 =
                    a.asm.O).apply(null, arguments);
            }),
            Ab = (a._emscripten_bind_PointCloud___destroy___0 = function () {
                return (Ab = a._emscripten_bind_PointCloud___destroy___0 =
                    a.asm.P).apply(null, arguments);
            }),
            Ma = (a._emscripten_bind_Mesh_Mesh_0 = function () {
                return (Ma = a._emscripten_bind_Mesh_Mesh_0 = a.asm.Q).apply(
                    null,
                    arguments
                );
            }),
            Bb = (a._emscripten_bind_Mesh_num_faces_0 = function () {
                return (Bb = a._emscripten_bind_Mesh_num_faces_0 =
                    a.asm.R).apply(null, arguments);
            }),
            Cb = (a._emscripten_bind_Mesh_num_attributes_0 = function () {
                return (Cb = a._emscripten_bind_Mesh_num_attributes_0 =
                    a.asm.S).apply(null, arguments);
            }),
            Db = (a._emscripten_bind_Mesh_num_points_0 = function () {
                return (Db = a._emscripten_bind_Mesh_num_points_0 =
                    a.asm.T).apply(null, arguments);
            }),
            Eb = (a._emscripten_bind_Mesh___destroy___0 = function () {
                return (Eb = a._emscripten_bind_Mesh___destroy___0 =
                    a.asm.U).apply(null, arguments);
            }),
            Na = (a._emscripten_bind_Metadata_Metadata_0 = function () {
                return (Na = a._emscripten_bind_Metadata_Metadata_0 =
                    a.asm.V).apply(null, arguments);
            }),
            Fb = (a._emscripten_bind_Metadata___destroy___0 = function () {
                return (Fb = a._emscripten_bind_Metadata___destroy___0 =
                    a.asm.W).apply(null, arguments);
            }),
            Gb = (a._emscripten_bind_Status_code_0 = function () {
                return (Gb = a._emscripten_bind_Status_code_0 = a.asm.X).apply(
                    null,
                    arguments
                );
            }),
            Hb = (a._emscripten_bind_Status_ok_0 = function () {
                return (Hb = a._emscripten_bind_Status_ok_0 = a.asm.Y).apply(
                    null,
                    arguments
                );
            }),
            Ib = (a._emscripten_bind_Status_error_msg_0 = function () {
                return (Ib = a._emscripten_bind_Status_error_msg_0 =
                    a.asm.Z).apply(null, arguments);
            }),
            Jb = (a._emscripten_bind_Status___destroy___0 = function () {
                return (Jb = a._emscripten_bind_Status___destroy___0 =
                    a.asm._).apply(null, arguments);
            }),
            Oa = (a._emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 =
                function () {
                    return (Oa =
                        a._emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 =
                            a.asm.$).apply(null, arguments);
                }),
            Kb = (a._emscripten_bind_DracoFloat32Array_GetValue_1 =
                function () {
                    return (Kb =
                        a._emscripten_bind_DracoFloat32Array_GetValue_1 =
                            a.asm.aa).apply(null, arguments);
                }),
            Lb = (a._emscripten_bind_DracoFloat32Array_size_0 = function () {
                return (Lb = a._emscripten_bind_DracoFloat32Array_size_0 =
                    a.asm.ba).apply(null, arguments);
            }),
            Mb = (a._emscripten_bind_DracoFloat32Array___destroy___0 =
                function () {
                    return (Mb =
                        a._emscripten_bind_DracoFloat32Array___destroy___0 =
                            a.asm.ca).apply(null, arguments);
                }),
            Pa = (a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 =
                function () {
                    return (Pa =
                        a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 =
                            a.asm.da).apply(null, arguments);
                }),
            Nb = (a._emscripten_bind_DracoInt8Array_GetValue_1 = function () {
                return (Nb = a._emscripten_bind_DracoInt8Array_GetValue_1 =
                    a.asm.ea).apply(null, arguments);
            }),
            Ob = (a._emscripten_bind_DracoInt8Array_size_0 = function () {
                return (Ob = a._emscripten_bind_DracoInt8Array_size_0 =
                    a.asm.fa).apply(null, arguments);
            }),
            Pb = (a._emscripten_bind_DracoInt8Array___destroy___0 =
                function () {
                    return (Pb =
                        a._emscripten_bind_DracoInt8Array___destroy___0 =
                            a.asm.ga).apply(null, arguments);
                }),
            Qa = (a._emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 =
                function () {
                    return (Qa =
                        a._emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 =
                            a.asm.ha).apply(null, arguments);
                }),
            Qb = (a._emscripten_bind_DracoUInt8Array_GetValue_1 = function () {
                return (Qb = a._emscripten_bind_DracoUInt8Array_GetValue_1 =
                    a.asm.ia).apply(null, arguments);
            }),
            Rb = (a._emscripten_bind_DracoUInt8Array_size_0 = function () {
                return (Rb = a._emscripten_bind_DracoUInt8Array_size_0 =
                    a.asm.ja).apply(null, arguments);
            }),
            Sb = (a._emscripten_bind_DracoUInt8Array___destroy___0 =
                function () {
                    return (Sb =
                        a._emscripten_bind_DracoUInt8Array___destroy___0 =
                            a.asm.ka).apply(null, arguments);
                }),
            Ra = (a._emscripten_bind_DracoInt16Array_DracoInt16Array_0 =
                function () {
                    return (Ra =
                        a._emscripten_bind_DracoInt16Array_DracoInt16Array_0 =
                            a.asm.la).apply(null, arguments);
                }),
            Tb = (a._emscripten_bind_DracoInt16Array_GetValue_1 = function () {
                return (Tb = a._emscripten_bind_DracoInt16Array_GetValue_1 =
                    a.asm.ma).apply(null, arguments);
            }),
            Ub = (a._emscripten_bind_DracoInt16Array_size_0 = function () {
                return (Ub = a._emscripten_bind_DracoInt16Array_size_0 =
                    a.asm.na).apply(null, arguments);
            }),
            Vb = (a._emscripten_bind_DracoInt16Array___destroy___0 =
                function () {
                    return (Vb =
                        a._emscripten_bind_DracoInt16Array___destroy___0 =
                            a.asm.oa).apply(null, arguments);
                }),
            Sa = (a._emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 =
                function () {
                    return (Sa =
                        a._emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 =
                            a.asm.pa).apply(null, arguments);
                }),
            Wb = (a._emscripten_bind_DracoUInt16Array_GetValue_1 = function () {
                return (Wb = a._emscripten_bind_DracoUInt16Array_GetValue_1 =
                    a.asm.qa).apply(null, arguments);
            }),
            Xb = (a._emscripten_bind_DracoUInt16Array_size_0 = function () {
                return (Xb = a._emscripten_bind_DracoUInt16Array_size_0 =
                    a.asm.ra).apply(null, arguments);
            }),
            Yb = (a._emscripten_bind_DracoUInt16Array___destroy___0 =
                function () {
                    return (Yb =
                        a._emscripten_bind_DracoUInt16Array___destroy___0 =
                            a.asm.sa).apply(null, arguments);
                }),
            Ta = (a._emscripten_bind_DracoInt32Array_DracoInt32Array_0 =
                function () {
                    return (Ta =
                        a._emscripten_bind_DracoInt32Array_DracoInt32Array_0 =
                            a.asm.ta).apply(null, arguments);
                }),
            Zb = (a._emscripten_bind_DracoInt32Array_GetValue_1 = function () {
                return (Zb = a._emscripten_bind_DracoInt32Array_GetValue_1 =
                    a.asm.ua).apply(null, arguments);
            }),
            $b = (a._emscripten_bind_DracoInt32Array_size_0 = function () {
                return ($b = a._emscripten_bind_DracoInt32Array_size_0 =
                    a.asm.va).apply(null, arguments);
            }),
            ac = (a._emscripten_bind_DracoInt32Array___destroy___0 =
                function () {
                    return (ac =
                        a._emscripten_bind_DracoInt32Array___destroy___0 =
                            a.asm.wa).apply(null, arguments);
                }),
            Ua = (a._emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 =
                function () {
                    return (Ua =
                        a._emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 =
                            a.asm.xa).apply(null, arguments);
                }),
            bc = (a._emscripten_bind_DracoUInt32Array_GetValue_1 = function () {
                return (bc = a._emscripten_bind_DracoUInt32Array_GetValue_1 =
                    a.asm.ya).apply(null, arguments);
            }),
            cc = (a._emscripten_bind_DracoUInt32Array_size_0 = function () {
                return (cc = a._emscripten_bind_DracoUInt32Array_size_0 =
                    a.asm.za).apply(null, arguments);
            }),
            dc = (a._emscripten_bind_DracoUInt32Array___destroy___0 =
                function () {
                    return (dc =
                        a._emscripten_bind_DracoUInt32Array___destroy___0 =
                            a.asm.Aa).apply(null, arguments);
                }),
            Va = (a._emscripten_bind_MetadataQuerier_MetadataQuerier_0 =
                function () {
                    return (Va =
                        a._emscripten_bind_MetadataQuerier_MetadataQuerier_0 =
                            a.asm.Ba).apply(null, arguments);
                }),
            ec = (a._emscripten_bind_MetadataQuerier_HasEntry_2 = function () {
                return (ec = a._emscripten_bind_MetadataQuerier_HasEntry_2 =
                    a.asm.Ca).apply(null, arguments);
            }),
            fc = (a._emscripten_bind_MetadataQuerier_GetIntEntry_2 =
                function () {
                    return (fc =
                        a._emscripten_bind_MetadataQuerier_GetIntEntry_2 =
                            a.asm.Da).apply(null, arguments);
                }),
            gc = (a._emscripten_bind_MetadataQuerier_GetIntEntryArray_3 =
                function () {
                    return (gc =
                        a._emscripten_bind_MetadataQuerier_GetIntEntryArray_3 =
                            a.asm.Ea).apply(null, arguments);
                }),
            hc = (a._emscripten_bind_MetadataQuerier_GetDoubleEntry_2 =
                function () {
                    return (hc =
                        a._emscripten_bind_MetadataQuerier_GetDoubleEntry_2 =
                            a.asm.Fa).apply(null, arguments);
                }),
            ic = (a._emscripten_bind_MetadataQuerier_GetStringEntry_2 =
                function () {
                    return (ic =
                        a._emscripten_bind_MetadataQuerier_GetStringEntry_2 =
                            a.asm.Ga).apply(null, arguments);
                }),
            jc = (a._emscripten_bind_MetadataQuerier_NumEntries_1 =
                function () {
                    return (jc =
                        a._emscripten_bind_MetadataQuerier_NumEntries_1 =
                            a.asm.Ha).apply(null, arguments);
                }),
            kc = (a._emscripten_bind_MetadataQuerier_GetEntryName_2 =
                function () {
                    return (kc =
                        a._emscripten_bind_MetadataQuerier_GetEntryName_2 =
                            a.asm.Ia).apply(null, arguments);
                }),
            lc = (a._emscripten_bind_MetadataQuerier___destroy___0 =
                function () {
                    return (lc =
                        a._emscripten_bind_MetadataQuerier___destroy___0 =
                            a.asm.Ja).apply(null, arguments);
                }),
            Wa = (a._emscripten_bind_Decoder_Decoder_0 = function () {
                return (Wa = a._emscripten_bind_Decoder_Decoder_0 =
                    a.asm.Ka).apply(null, arguments);
            }),
            mc = (a._emscripten_bind_Decoder_DecodeArrayToPointCloud_3 =
                function () {
                    return (mc =
                        a._emscripten_bind_Decoder_DecodeArrayToPointCloud_3 =
                            a.asm.La).apply(null, arguments);
                }),
            nc = (a._emscripten_bind_Decoder_DecodeArrayToMesh_3 = function () {
                return (nc = a._emscripten_bind_Decoder_DecodeArrayToMesh_3 =
                    a.asm.Ma).apply(null, arguments);
            }),
            oc = (a._emscripten_bind_Decoder_GetAttributeId_2 = function () {
                return (oc = a._emscripten_bind_Decoder_GetAttributeId_2 =
                    a.asm.Na).apply(null, arguments);
            }),
            pc = (a._emscripten_bind_Decoder_GetAttributeIdByName_2 =
                function () {
                    return (pc =
                        a._emscripten_bind_Decoder_GetAttributeIdByName_2 =
                            a.asm.Oa).apply(null, arguments);
                }),
            qc = (a._emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 =
                function () {
                    return (qc =
                        a._emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 =
                            a.asm.Pa).apply(null, arguments);
                }),
            rc = (a._emscripten_bind_Decoder_GetAttribute_2 = function () {
                return (rc = a._emscripten_bind_Decoder_GetAttribute_2 =
                    a.asm.Qa).apply(null, arguments);
            }),
            sc = (a._emscripten_bind_Decoder_GetAttributeByUniqueId_2 =
                function () {
                    return (sc =
                        a._emscripten_bind_Decoder_GetAttributeByUniqueId_2 =
                            a.asm.Ra).apply(null, arguments);
                }),
            tc = (a._emscripten_bind_Decoder_GetMetadata_1 = function () {
                return (tc = a._emscripten_bind_Decoder_GetMetadata_1 =
                    a.asm.Sa).apply(null, arguments);
            }),
            uc = (a._emscripten_bind_Decoder_GetAttributeMetadata_2 =
                function () {
                    return (uc =
                        a._emscripten_bind_Decoder_GetAttributeMetadata_2 =
                            a.asm.Ta).apply(null, arguments);
                }),
            vc = (a._emscripten_bind_Decoder_GetFaceFromMesh_3 = function () {
                return (vc = a._emscripten_bind_Decoder_GetFaceFromMesh_3 =
                    a.asm.Ua).apply(null, arguments);
            }),
            wc = (a._emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 =
                function () {
                    return (wc =
                        a._emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 =
                            a.asm.Va).apply(null, arguments);
                }),
            xc = (a._emscripten_bind_Decoder_GetTrianglesUInt16Array_3 =
                function () {
                    return (xc =
                        a._emscripten_bind_Decoder_GetTrianglesUInt16Array_3 =
                            a.asm.Wa).apply(null, arguments);
                }),
            yc = (a._emscripten_bind_Decoder_GetTrianglesUInt32Array_3 =
                function () {
                    return (yc =
                        a._emscripten_bind_Decoder_GetTrianglesUInt32Array_3 =
                            a.asm.Xa).apply(null, arguments);
                }),
            zc = (a._emscripten_bind_Decoder_GetAttributeFloat_3 = function () {
                return (zc = a._emscripten_bind_Decoder_GetAttributeFloat_3 =
                    a.asm.Ya).apply(null, arguments);
            }),
            Ac = (a._emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 =
                function () {
                    return (Ac =
                        a._emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 =
                            a.asm.Za).apply(null, arguments);
                }),
            Bc = (a._emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 =
                function () {
                    return (Bc =
                        a._emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 =
                            a.asm._a).apply(null, arguments);
                }),
            Cc = (a._emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 =
                function () {
                    return (Cc =
                        a._emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 =
                            a.asm.$a).apply(null, arguments);
                }),
            Dc = (a._emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 =
                function () {
                    return (Dc =
                        a._emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 =
                            a.asm.ab).apply(null, arguments);
                }),
            Ec = (a._emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 =
                function () {
                    return (Ec =
                        a._emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 =
                            a.asm.bb).apply(null, arguments);
                }),
            Fc = (a._emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 =
                function () {
                    return (Fc =
                        a._emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 =
                            a.asm.cb).apply(null, arguments);
                }),
            Gc = (a._emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 =
                function () {
                    return (Gc =
                        a._emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 =
                            a.asm.db).apply(null, arguments);
                }),
            Hc = (a._emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 =
                function () {
                    return (Hc =
                        a._emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 =
                            a.asm.eb).apply(null, arguments);
                }),
            Ic =
                (a._emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 =
                    function () {
                        return (Ic =
                            a._emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 =
                                a.asm.fb).apply(null, arguments);
                    }),
            Jc = (a._emscripten_bind_Decoder_SkipAttributeTransform_1 =
                function () {
                    return (Jc =
                        a._emscripten_bind_Decoder_SkipAttributeTransform_1 =
                            a.asm.gb).apply(null, arguments);
                }),
            Kc =
                (a._emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 =
                    function () {
                        return (Kc =
                            a._emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 =
                                a.asm.hb).apply(null, arguments);
                    }),
            Lc = (a._emscripten_bind_Decoder_DecodeBufferToPointCloud_2 =
                function () {
                    return (Lc =
                        a._emscripten_bind_Decoder_DecodeBufferToPointCloud_2 =
                            a.asm.ib).apply(null, arguments);
                }),
            Mc = (a._emscripten_bind_Decoder_DecodeBufferToMesh_2 =
                function () {
                    return (Mc =
                        a._emscripten_bind_Decoder_DecodeBufferToMesh_2 =
                            a.asm.jb).apply(null, arguments);
                }),
            Nc = (a._emscripten_bind_Decoder___destroy___0 = function () {
                return (Nc = a._emscripten_bind_Decoder___destroy___0 =
                    a.asm.kb).apply(null, arguments);
            }),
            Oc =
                (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM =
                    function () {
                        return (Oc =
                            a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM =
                                a.asm.lb).apply(null, arguments);
                    }),
            Pc =
                (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM =
                    function () {
                        return (Pc =
                            a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM =
                                a.asm.mb).apply(null, arguments);
                    }),
            Qc =
                (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM =
                    function () {
                        return (Qc =
                            a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM =
                                a.asm.nb).apply(null, arguments);
                    }),
            Rc =
                (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM =
                    function () {
                        return (Rc =
                            a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM =
                                a.asm.ob).apply(null, arguments);
                    }),
            Sc = (a._emscripten_enum_draco_GeometryAttribute_Type_INVALID =
                function () {
                    return (Sc =
                        a._emscripten_enum_draco_GeometryAttribute_Type_INVALID =
                            a.asm.pb).apply(null, arguments);
                }),
            Tc = (a._emscripten_enum_draco_GeometryAttribute_Type_POSITION =
                function () {
                    return (Tc =
                        a._emscripten_enum_draco_GeometryAttribute_Type_POSITION =
                            a.asm.qb).apply(null, arguments);
                }),
            Uc = (a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL =
                function () {
                    return (Uc =
                        a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL =
                            a.asm.rb).apply(null, arguments);
                }),
            Vc = (a._emscripten_enum_draco_GeometryAttribute_Type_COLOR =
                function () {
                    return (Vc =
                        a._emscripten_enum_draco_GeometryAttribute_Type_COLOR =
                            a.asm.sb).apply(null, arguments);
                }),
            Wc = (a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD =
                function () {
                    return (Wc =
                        a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD =
                            a.asm.tb).apply(null, arguments);
                }),
            Xc = (a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC =
                function () {
                    return (Xc =
                        a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC =
                            a.asm.ub).apply(null, arguments);
                }),
            Yc =
                (a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE =
                    function () {
                        return (Yc =
                            a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE =
                                a.asm.vb).apply(null, arguments);
                    }),
            Zc = (a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD =
                function () {
                    return (Zc =
                        a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD =
                            a.asm.wb).apply(null, arguments);
                }),
            $c = (a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH =
                function () {
                    return ($c =
                        a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH =
                            a.asm.xb).apply(null, arguments);
                }),
            ad = (a._emscripten_enum_draco_DataType_DT_INVALID = function () {
                return (ad = a._emscripten_enum_draco_DataType_DT_INVALID =
                    a.asm.yb).apply(null, arguments);
            }),
            bd = (a._emscripten_enum_draco_DataType_DT_INT8 = function () {
                return (bd = a._emscripten_enum_draco_DataType_DT_INT8 =
                    a.asm.zb).apply(null, arguments);
            }),
            cd = (a._emscripten_enum_draco_DataType_DT_UINT8 = function () {
                return (cd = a._emscripten_enum_draco_DataType_DT_UINT8 =
                    a.asm.Ab).apply(null, arguments);
            }),
            dd = (a._emscripten_enum_draco_DataType_DT_INT16 = function () {
                return (dd = a._emscripten_enum_draco_DataType_DT_INT16 =
                    a.asm.Bb).apply(null, arguments);
            }),
            ed = (a._emscripten_enum_draco_DataType_DT_UINT16 = function () {
                return (ed = a._emscripten_enum_draco_DataType_DT_UINT16 =
                    a.asm.Cb).apply(null, arguments);
            }),
            fd = (a._emscripten_enum_draco_DataType_DT_INT32 = function () {
                return (fd = a._emscripten_enum_draco_DataType_DT_INT32 =
                    a.asm.Db).apply(null, arguments);
            }),
            gd = (a._emscripten_enum_draco_DataType_DT_UINT32 = function () {
                return (gd = a._emscripten_enum_draco_DataType_DT_UINT32 =
                    a.asm.Eb).apply(null, arguments);
            }),
            hd = (a._emscripten_enum_draco_DataType_DT_INT64 = function () {
                return (hd = a._emscripten_enum_draco_DataType_DT_INT64 =
                    a.asm.Fb).apply(null, arguments);
            }),
            id = (a._emscripten_enum_draco_DataType_DT_UINT64 = function () {
                return (id = a._emscripten_enum_draco_DataType_DT_UINT64 =
                    a.asm.Gb).apply(null, arguments);
            }),
            jd = (a._emscripten_enum_draco_DataType_DT_FLOAT32 = function () {
                return (jd = a._emscripten_enum_draco_DataType_DT_FLOAT32 =
                    a.asm.Hb).apply(null, arguments);
            }),
            kd = (a._emscripten_enum_draco_DataType_DT_FLOAT64 = function () {
                return (kd = a._emscripten_enum_draco_DataType_DT_FLOAT64 =
                    a.asm.Ib).apply(null, arguments);
            }),
            ld = (a._emscripten_enum_draco_DataType_DT_BOOL = function () {
                return (ld = a._emscripten_enum_draco_DataType_DT_BOOL =
                    a.asm.Jb).apply(null, arguments);
            }),
            md = (a._emscripten_enum_draco_DataType_DT_TYPES_COUNT =
                function () {
                    return (md =
                        a._emscripten_enum_draco_DataType_DT_TYPES_COUNT =
                            a.asm.Kb).apply(null, arguments);
                }),
            nd = (a._emscripten_enum_draco_StatusCode_OK = function () {
                return (nd = a._emscripten_enum_draco_StatusCode_OK =
                    a.asm.Lb).apply(null, arguments);
            }),
            od = (a._emscripten_enum_draco_StatusCode_DRACO_ERROR =
                function () {
                    return (od =
                        a._emscripten_enum_draco_StatusCode_DRACO_ERROR =
                            a.asm.Mb).apply(null, arguments);
                }),
            pd = (a._emscripten_enum_draco_StatusCode_IO_ERROR = function () {
                return (pd = a._emscripten_enum_draco_StatusCode_IO_ERROR =
                    a.asm.Nb).apply(null, arguments);
            }),
            qd = (a._emscripten_enum_draco_StatusCode_INVALID_PARAMETER =
                function () {
                    return (qd =
                        a._emscripten_enum_draco_StatusCode_INVALID_PARAMETER =
                            a.asm.Ob).apply(null, arguments);
                }),
            rd = (a._emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION =
                function () {
                    return (rd =
                        a._emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION =
                            a.asm.Pb).apply(null, arguments);
                }),
            sd = (a._emscripten_enum_draco_StatusCode_UNKNOWN_VERSION =
                function () {
                    return (sd =
                        a._emscripten_enum_draco_StatusCode_UNKNOWN_VERSION =
                            a.asm.Qb).apply(null, arguments);
                }),
            $a = (a._malloc = function () {
                return ($a = a._malloc = a.asm.Rb).apply(null, arguments);
            });
        a._free = function () {
            return (a._free = a.asm.Sb).apply(null, arguments);
        };
        var oa;
        la = function b() {
            oa || P();
            oa || (la = b);
        };
        a.run = P;
        if (a.preInit)
            for (
                "function" == typeof a.preInit && (a.preInit = [a.preInit]);
                0 < a.preInit.length;

            )
                a.preInit.pop()();
        P();
        t.prototype = Object.create(t.prototype);
        t.prototype.constructor = t;
        t.prototype.__class__ = t;
        t.__cache__ = {};
        a.WrapperObject = t;
        a.getCache = x;
        a.wrapPointer = D;
        a.castObject = function (b, c) {
            return D(b.ptr, c);
        };
        a.NULL = D(0);
        a.destroy = function (b) {
            if (!b.__destroy__)
                throw "Error: Cannot destroy object. (Did you create it yourself?)";
            b.__destroy__();
            delete x(b.__class__)[b.ptr];
        };
        a.compare = function (b, c) {
            return b.ptr === c.ptr;
        };
        a.getPointer = function (b) {
            return b.ptr;
        };
        a.getClass = function (b) {
            return b.__class__;
        };
        var r = {
            buffer: 0,
            size: 0,
            pos: 0,
            temps: [],
            needed: 0,
            prepare: function () {
                if (r.needed) {
                    for (var b = 0; b < r.temps.length; b++)
                        a._free(r.temps[b]);
                    r.temps.length = 0;
                    a._free(r.buffer);
                    r.buffer = 0;
                    r.size += r.needed;
                    r.needed = 0;
                }
                r.buffer ||
                    ((r.size += 128),
                    (r.buffer = a._malloc(r.size)),
                    q(r.buffer));
                r.pos = 0;
            },
            alloc: function (b, c) {
                q(r.buffer);
                b = b.length * c.BYTES_PER_ELEMENT;
                b = (b + 7) & -8;
                r.pos + b >= r.size
                    ? (q(0 < b),
                      (r.needed += b),
                      (c = a._malloc(b)),
                      r.temps.push(c))
                    : ((c = r.buffer + r.pos), (r.pos += b));
                return c;
            },
            copy: function (b, c, d) {
                d >>>= 0;
                switch (c.BYTES_PER_ELEMENT) {
                    case 2:
                        d >>>= 1;
                        break;
                    case 4:
                        d >>>= 2;
                        break;
                    case 8:
                        d >>>= 3;
                }
                for (var g = 0; g < b.length; g++) c[d + g] = b[g];
            },
        };
        Z.prototype = Object.create(t.prototype);
        Z.prototype.constructor = Z;
        Z.prototype.__class__ = Z;
        Z.__cache__ = {};
        a.VoidPtr = Z;
        Z.prototype.__destroy__ = Z.prototype.__destroy__ = function () {
            ab(this.ptr);
        };
        S.prototype = Object.create(t.prototype);
        S.prototype.constructor = S;
        S.prototype.__class__ = S;
        S.__cache__ = {};
        a.DecoderBuffer = S;
        S.prototype.Init = S.prototype.Init = function (b, c) {
            var d = this.ptr;
            r.prepare();
            "object" == typeof b && (b = ua(b));
            c && "object" === typeof c && (c = c.ptr);
            bb(d, b, c);
        };
        S.prototype.__destroy__ = S.prototype.__destroy__ = function () {
            cb(this.ptr);
        };
        R.prototype = Object.create(t.prototype);
        R.prototype.constructor = R;
        R.prototype.__class__ = R;
        R.__cache__ = {};
        a.AttributeTransformData = R;
        R.prototype.transform_type = R.prototype.transform_type = function () {
            return db(this.ptr);
        };
        R.prototype.__destroy__ = R.prototype.__destroy__ = function () {
            eb(this.ptr);
        };
        W.prototype = Object.create(t.prototype);
        W.prototype.constructor = W;
        W.prototype.__class__ = W;
        W.__cache__ = {};
        a.GeometryAttribute = W;
        W.prototype.__destroy__ = W.prototype.__destroy__ = function () {
            fb(this.ptr);
        };
        w.prototype = Object.create(t.prototype);
        w.prototype.constructor = w;
        w.prototype.__class__ = w;
        w.__cache__ = {};
        a.PointAttribute = w;
        w.prototype.size = w.prototype.size = function () {
            return gb(this.ptr);
        };
        w.prototype.GetAttributeTransformData =
            w.prototype.GetAttributeTransformData = function () {
                return D(hb(this.ptr), R);
            };
        w.prototype.attribute_type = w.prototype.attribute_type = function () {
            return ib(this.ptr);
        };
        w.prototype.data_type = w.prototype.data_type = function () {
            return jb(this.ptr);
        };
        w.prototype.num_components = w.prototype.num_components = function () {
            return kb(this.ptr);
        };
        w.prototype.normalized = w.prototype.normalized = function () {
            return !!lb(this.ptr);
        };
        w.prototype.byte_stride = w.prototype.byte_stride = function () {
            return mb(this.ptr);
        };
        w.prototype.byte_offset = w.prototype.byte_offset = function () {
            return nb(this.ptr);
        };
        w.prototype.unique_id = w.prototype.unique_id = function () {
            return ob(this.ptr);
        };
        w.prototype.__destroy__ = w.prototype.__destroy__ = function () {
            pb(this.ptr);
        };
        C.prototype = Object.create(t.prototype);
        C.prototype.constructor = C;
        C.prototype.__class__ = C;
        C.__cache__ = {};
        a.AttributeQuantizationTransform = C;
        C.prototype.InitFromAttribute = C.prototype.InitFromAttribute =
            function (b) {
                var c = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                return !!qb(c, b);
            };
        C.prototype.quantization_bits = C.prototype.quantization_bits =
            function () {
                return rb(this.ptr);
            };
        C.prototype.min_value = C.prototype.min_value = function (b) {
            var c = this.ptr;
            b && "object" === typeof b && (b = b.ptr);
            return sb(c, b);
        };
        C.prototype.range = C.prototype.range = function () {
            return tb(this.ptr);
        };
        C.prototype.__destroy__ = C.prototype.__destroy__ = function () {
            ub(this.ptr);
        };
        G.prototype = Object.create(t.prototype);
        G.prototype.constructor = G;
        G.prototype.__class__ = G;
        G.__cache__ = {};
        a.AttributeOctahedronTransform = G;
        G.prototype.InitFromAttribute = G.prototype.InitFromAttribute =
            function (b) {
                var c = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                return !!vb(c, b);
            };
        G.prototype.quantization_bits = G.prototype.quantization_bits =
            function () {
                return wb(this.ptr);
            };
        G.prototype.__destroy__ = G.prototype.__destroy__ = function () {
            xb(this.ptr);
        };
        H.prototype = Object.create(t.prototype);
        H.prototype.constructor = H;
        H.prototype.__class__ = H;
        H.__cache__ = {};
        a.PointCloud = H;
        H.prototype.num_attributes = H.prototype.num_attributes = function () {
            return yb(this.ptr);
        };
        H.prototype.num_points = H.prototype.num_points = function () {
            return zb(this.ptr);
        };
        H.prototype.__destroy__ = H.prototype.__destroy__ = function () {
            Ab(this.ptr);
        };
        E.prototype = Object.create(t.prototype);
        E.prototype.constructor = E;
        E.prototype.__class__ = E;
        E.__cache__ = {};
        a.Mesh = E;
        E.prototype.num_faces = E.prototype.num_faces = function () {
            return Bb(this.ptr);
        };
        E.prototype.num_attributes = E.prototype.num_attributes = function () {
            return Cb(this.ptr);
        };
        E.prototype.num_points = E.prototype.num_points = function () {
            return Db(this.ptr);
        };
        E.prototype.__destroy__ = E.prototype.__destroy__ = function () {
            Eb(this.ptr);
        };
        T.prototype = Object.create(t.prototype);
        T.prototype.constructor = T;
        T.prototype.__class__ = T;
        T.__cache__ = {};
        a.Metadata = T;
        T.prototype.__destroy__ = T.prototype.__destroy__ = function () {
            Fb(this.ptr);
        };
        B.prototype = Object.create(t.prototype);
        B.prototype.constructor = B;
        B.prototype.__class__ = B;
        B.__cache__ = {};
        a.Status = B;
        B.prototype.code = B.prototype.code = function () {
            return Gb(this.ptr);
        };
        B.prototype.ok = B.prototype.ok = function () {
            return !!Hb(this.ptr);
        };
        B.prototype.error_msg = B.prototype.error_msg = function () {
            return h(Ib(this.ptr));
        };
        B.prototype.__destroy__ = B.prototype.__destroy__ = function () {
            Jb(this.ptr);
        };
        I.prototype = Object.create(t.prototype);
        I.prototype.constructor = I;
        I.prototype.__class__ = I;
        I.__cache__ = {};
        a.DracoFloat32Array = I;
        I.prototype.GetValue = I.prototype.GetValue = function (b) {
            var c = this.ptr;
            b && "object" === typeof b && (b = b.ptr);
            return Kb(c, b);
        };
        I.prototype.size = I.prototype.size = function () {
            return Lb(this.ptr);
        };
        I.prototype.__destroy__ = I.prototype.__destroy__ = function () {
            Mb(this.ptr);
        };
        J.prototype = Object.create(t.prototype);
        J.prototype.constructor = J;
        J.prototype.__class__ = J;
        J.__cache__ = {};
        a.DracoInt8Array = J;
        J.prototype.GetValue = J.prototype.GetValue = function (b) {
            var c = this.ptr;
            b && "object" === typeof b && (b = b.ptr);
            return Nb(c, b);
        };
        J.prototype.size = J.prototype.size = function () {
            return Ob(this.ptr);
        };
        J.prototype.__destroy__ = J.prototype.__destroy__ = function () {
            Pb(this.ptr);
        };
        K.prototype = Object.create(t.prototype);
        K.prototype.constructor = K;
        K.prototype.__class__ = K;
        K.__cache__ = {};
        a.DracoUInt8Array = K;
        K.prototype.GetValue = K.prototype.GetValue = function (b) {
            var c = this.ptr;
            b && "object" === typeof b && (b = b.ptr);
            return Qb(c, b);
        };
        K.prototype.size = K.prototype.size = function () {
            return Rb(this.ptr);
        };
        K.prototype.__destroy__ = K.prototype.__destroy__ = function () {
            Sb(this.ptr);
        };
        L.prototype = Object.create(t.prototype);
        L.prototype.constructor = L;
        L.prototype.__class__ = L;
        L.__cache__ = {};
        a.DracoInt16Array = L;
        L.prototype.GetValue = L.prototype.GetValue = function (b) {
            var c = this.ptr;
            b && "object" === typeof b && (b = b.ptr);
            return Tb(c, b);
        };
        L.prototype.size = L.prototype.size = function () {
            return Ub(this.ptr);
        };
        L.prototype.__destroy__ = L.prototype.__destroy__ = function () {
            Vb(this.ptr);
        };
        M.prototype = Object.create(t.prototype);
        M.prototype.constructor = M;
        M.prototype.__class__ = M;
        M.__cache__ = {};
        a.DracoUInt16Array = M;
        M.prototype.GetValue = M.prototype.GetValue = function (b) {
            var c = this.ptr;
            b && "object" === typeof b && (b = b.ptr);
            return Wb(c, b);
        };
        M.prototype.size = M.prototype.size = function () {
            return Xb(this.ptr);
        };
        M.prototype.__destroy__ = M.prototype.__destroy__ = function () {
            Yb(this.ptr);
        };
        N.prototype = Object.create(t.prototype);
        N.prototype.constructor = N;
        N.prototype.__class__ = N;
        N.__cache__ = {};
        a.DracoInt32Array = N;
        N.prototype.GetValue = N.prototype.GetValue = function (b) {
            var c = this.ptr;
            b && "object" === typeof b && (b = b.ptr);
            return Zb(c, b);
        };
        N.prototype.size = N.prototype.size = function () {
            return $b(this.ptr);
        };
        N.prototype.__destroy__ = N.prototype.__destroy__ = function () {
            ac(this.ptr);
        };
        O.prototype = Object.create(t.prototype);
        O.prototype.constructor = O;
        O.prototype.__class__ = O;
        O.__cache__ = {};
        a.DracoUInt32Array = O;
        O.prototype.GetValue = O.prototype.GetValue = function (b) {
            var c = this.ptr;
            b && "object" === typeof b && (b = b.ptr);
            return bc(c, b);
        };
        O.prototype.size = O.prototype.size = function () {
            return cc(this.ptr);
        };
        O.prototype.__destroy__ = O.prototype.__destroy__ = function () {
            dc(this.ptr);
        };
        y.prototype = Object.create(t.prototype);
        y.prototype.constructor = y;
        y.prototype.__class__ = y;
        y.__cache__ = {};
        a.MetadataQuerier = y;
        y.prototype.HasEntry = y.prototype.HasEntry = function (b, c) {
            var d = this.ptr;
            r.prepare();
            b && "object" === typeof b && (b = b.ptr);
            c = c && "object" === typeof c ? c.ptr : aa(c);
            return !!ec(d, b, c);
        };
        y.prototype.GetIntEntry = y.prototype.GetIntEntry = function (b, c) {
            var d = this.ptr;
            r.prepare();
            b && "object" === typeof b && (b = b.ptr);
            c = c && "object" === typeof c ? c.ptr : aa(c);
            return fc(d, b, c);
        };
        y.prototype.GetIntEntryArray = y.prototype.GetIntEntryArray = function (
            b,
            c,
            d
        ) {
            var g = this.ptr;
            r.prepare();
            b && "object" === typeof b && (b = b.ptr);
            c = c && "object" === typeof c ? c.ptr : aa(c);
            d && "object" === typeof d && (d = d.ptr);
            gc(g, b, c, d);
        };
        y.prototype.GetDoubleEntry = y.prototype.GetDoubleEntry = function (
            b,
            c
        ) {
            var d = this.ptr;
            r.prepare();
            b && "object" === typeof b && (b = b.ptr);
            c = c && "object" === typeof c ? c.ptr : aa(c);
            return hc(d, b, c);
        };
        y.prototype.GetStringEntry = y.prototype.GetStringEntry = function (
            b,
            c
        ) {
            var d = this.ptr;
            r.prepare();
            b && "object" === typeof b && (b = b.ptr);
            c = c && "object" === typeof c ? c.ptr : aa(c);
            return h(ic(d, b, c));
        };
        y.prototype.NumEntries = y.prototype.NumEntries = function (b) {
            var c = this.ptr;
            b && "object" === typeof b && (b = b.ptr);
            return jc(c, b);
        };
        y.prototype.GetEntryName = y.prototype.GetEntryName = function (b, c) {
            var d = this.ptr;
            b && "object" === typeof b && (b = b.ptr);
            c && "object" === typeof c && (c = c.ptr);
            return h(kc(d, b, c));
        };
        y.prototype.__destroy__ = y.prototype.__destroy__ = function () {
            lc(this.ptr);
        };
        l.prototype = Object.create(t.prototype);
        l.prototype.constructor = l;
        l.prototype.__class__ = l;
        l.__cache__ = {};
        a.Decoder = l;
        l.prototype.DecodeArrayToPointCloud =
            l.prototype.DecodeArrayToPointCloud = function (b, c, d) {
                var g = this.ptr;
                r.prepare();
                "object" == typeof b && (b = ua(b));
                c && "object" === typeof c && (c = c.ptr);
                d && "object" === typeof d && (d = d.ptr);
                return D(mc(g, b, c, d), B);
            };
        l.prototype.DecodeArrayToMesh = l.prototype.DecodeArrayToMesh =
            function (b, c, d) {
                var g = this.ptr;
                r.prepare();
                "object" == typeof b && (b = ua(b));
                c && "object" === typeof c && (c = c.ptr);
                d && "object" === typeof d && (d = d.ptr);
                return D(nc(g, b, c, d), B);
            };
        l.prototype.GetAttributeId = l.prototype.GetAttributeId = function (
            b,
            c
        ) {
            var d = this.ptr;
            b && "object" === typeof b && (b = b.ptr);
            c && "object" === typeof c && (c = c.ptr);
            return oc(d, b, c);
        };
        l.prototype.GetAttributeIdByName = l.prototype.GetAttributeIdByName =
            function (b, c) {
                var d = this.ptr;
                r.prepare();
                b && "object" === typeof b && (b = b.ptr);
                c = c && "object" === typeof c ? c.ptr : aa(c);
                return pc(d, b, c);
            };
        l.prototype.GetAttributeIdByMetadataEntry =
            l.prototype.GetAttributeIdByMetadataEntry = function (b, c, d) {
                var g = this.ptr;
                r.prepare();
                b && "object" === typeof b && (b = b.ptr);
                c = c && "object" === typeof c ? c.ptr : aa(c);
                d = d && "object" === typeof d ? d.ptr : aa(d);
                return qc(g, b, c, d);
            };
        l.prototype.GetAttribute = l.prototype.GetAttribute = function (b, c) {
            var d = this.ptr;
            b && "object" === typeof b && (b = b.ptr);
            c && "object" === typeof c && (c = c.ptr);
            return D(rc(d, b, c), w);
        };
        l.prototype.GetAttributeByUniqueId =
            l.prototype.GetAttributeByUniqueId = function (b, c) {
                var d = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                return D(sc(d, b, c), w);
            };
        l.prototype.GetMetadata = l.prototype.GetMetadata = function (b) {
            var c = this.ptr;
            b && "object" === typeof b && (b = b.ptr);
            return D(tc(c, b), T);
        };
        l.prototype.GetAttributeMetadata = l.prototype.GetAttributeMetadata =
            function (b, c) {
                var d = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                return D(uc(d, b, c), T);
            };
        l.prototype.GetFaceFromMesh = l.prototype.GetFaceFromMesh = function (
            b,
            c,
            d
        ) {
            var g = this.ptr;
            b && "object" === typeof b && (b = b.ptr);
            c && "object" === typeof c && (c = c.ptr);
            d && "object" === typeof d && (d = d.ptr);
            return !!vc(g, b, c, d);
        };
        l.prototype.GetTriangleStripsFromMesh =
            l.prototype.GetTriangleStripsFromMesh = function (b, c) {
                var d = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                return wc(d, b, c);
            };
        l.prototype.GetTrianglesUInt16Array =
            l.prototype.GetTrianglesUInt16Array = function (b, c, d) {
                var g = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                d && "object" === typeof d && (d = d.ptr);
                return !!xc(g, b, c, d);
            };
        l.prototype.GetTrianglesUInt32Array =
            l.prototype.GetTrianglesUInt32Array = function (b, c, d) {
                var g = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                d && "object" === typeof d && (d = d.ptr);
                return !!yc(g, b, c, d);
            };
        l.prototype.GetAttributeFloat = l.prototype.GetAttributeFloat =
            function (b, c, d) {
                var g = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                d && "object" === typeof d && (d = d.ptr);
                return !!zc(g, b, c, d);
            };
        l.prototype.GetAttributeFloatForAllPoints =
            l.prototype.GetAttributeFloatForAllPoints = function (b, c, d) {
                var g = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                d && "object" === typeof d && (d = d.ptr);
                return !!Ac(g, b, c, d);
            };
        l.prototype.GetAttributeIntForAllPoints =
            l.prototype.GetAttributeIntForAllPoints = function (b, c, d) {
                var g = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                d && "object" === typeof d && (d = d.ptr);
                return !!Bc(g, b, c, d);
            };
        l.prototype.GetAttributeInt8ForAllPoints =
            l.prototype.GetAttributeInt8ForAllPoints = function (b, c, d) {
                var g = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                d && "object" === typeof d && (d = d.ptr);
                return !!Cc(g, b, c, d);
            };
        l.prototype.GetAttributeUInt8ForAllPoints =
            l.prototype.GetAttributeUInt8ForAllPoints = function (b, c, d) {
                var g = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                d && "object" === typeof d && (d = d.ptr);
                return !!Dc(g, b, c, d);
            };
        l.prototype.GetAttributeInt16ForAllPoints =
            l.prototype.GetAttributeInt16ForAllPoints = function (b, c, d) {
                var g = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                d && "object" === typeof d && (d = d.ptr);
                return !!Ec(g, b, c, d);
            };
        l.prototype.GetAttributeUInt16ForAllPoints =
            l.prototype.GetAttributeUInt16ForAllPoints = function (b, c, d) {
                var g = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                d && "object" === typeof d && (d = d.ptr);
                return !!Fc(g, b, c, d);
            };
        l.prototype.GetAttributeInt32ForAllPoints =
            l.prototype.GetAttributeInt32ForAllPoints = function (b, c, d) {
                var g = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                d && "object" === typeof d && (d = d.ptr);
                return !!Gc(g, b, c, d);
            };
        l.prototype.GetAttributeUInt32ForAllPoints =
            l.prototype.GetAttributeUInt32ForAllPoints = function (b, c, d) {
                var g = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                d && "object" === typeof d && (d = d.ptr);
                return !!Hc(g, b, c, d);
            };
        l.prototype.GetAttributeDataArrayForAllPoints =
            l.prototype.GetAttributeDataArrayForAllPoints = function (
                b,
                c,
                d,
                g,
                u
            ) {
                var X = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                d && "object" === typeof d && (d = d.ptr);
                g && "object" === typeof g && (g = g.ptr);
                u && "object" === typeof u && (u = u.ptr);
                return !!Ic(X, b, c, d, g, u);
            };
        l.prototype.SkipAttributeTransform =
            l.prototype.SkipAttributeTransform = function (b) {
                var c = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                Jc(c, b);
            };
        l.prototype.GetEncodedGeometryType_Deprecated =
            l.prototype.GetEncodedGeometryType_Deprecated = function (b) {
                var c = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                return Kc(c, b);
            };
        l.prototype.DecodeBufferToPointCloud =
            l.prototype.DecodeBufferToPointCloud = function (b, c) {
                var d = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                return D(Lc(d, b, c), B);
            };
        l.prototype.DecodeBufferToMesh = l.prototype.DecodeBufferToMesh =
            function (b, c) {
                var d = this.ptr;
                b && "object" === typeof b && (b = b.ptr);
                c && "object" === typeof c && (c = c.ptr);
                return D(Mc(d, b, c), B);
            };
        l.prototype.__destroy__ = l.prototype.__destroy__ = function () {
            Nc(this.ptr);
        };
        (function () {
            function b() {
                a.ATTRIBUTE_INVALID_TRANSFORM = Oc();
                a.ATTRIBUTE_NO_TRANSFORM = Pc();
                a.ATTRIBUTE_QUANTIZATION_TRANSFORM = Qc();
                a.ATTRIBUTE_OCTAHEDRON_TRANSFORM = Rc();
                a.INVALID = Sc();
                a.POSITION = Tc();
                a.NORMAL = Uc();
                a.COLOR = Vc();
                a.TEX_COORD = Wc();
                a.GENERIC = Xc();
                a.INVALID_GEOMETRY_TYPE = Yc();
                a.POINT_CLOUD = Zc();
                a.TRIANGULAR_MESH = $c();
                a.DT_INVALID = ad();
                a.DT_INT8 = bd();
                a.DT_UINT8 = cd();
                a.DT_INT16 = dd();
                a.DT_UINT16 = ed();
                a.DT_INT32 = fd();
                a.DT_UINT32 = gd();
                a.DT_INT64 = hd();
                a.DT_UINT64 = id();
                a.DT_FLOAT32 = jd();
                a.DT_FLOAT64 = kd();
                a.DT_BOOL = ld();
                a.DT_TYPES_COUNT = md();
                a.OK = nd();
                a.DRACO_ERROR = od();
                a.IO_ERROR = pd();
                a.INVALID_PARAMETER = qd();
                a.UNSUPPORTED_VERSION = rd();
                a.UNKNOWN_VERSION = sd();
            }
            Ba ? b() : ta.unshift(b);
        })();
        if ("function" === typeof a.onModuleParsed) a.onModuleParsed();
        a.Decoder.prototype.GetEncodedGeometryType = function (b) {
            if (b.__class__ && b.__class__ === a.DecoderBuffer)
                return a.Decoder.prototype.GetEncodedGeometryType_Deprecated(b);
            if (8 > b.byteLength) return a.INVALID_GEOMETRY_TYPE;
            switch (b[7]) {
                case 0:
                    return a.POINT_CLOUD;
                case 1:
                    return a.TRIANGULAR_MESH;
                default:
                    return a.INVALID_GEOMETRY_TYPE;
            }
        };
        return n.ready;
    };
})();
"object" === typeof exports && "object" === typeof module
    ? (module.exports = DracoDecoderModule)
    : "function" === typeof define && define.amd
    ? define([], function () {
          return DracoDecoderModule;
      })
    : "object" === typeof exports &&
      (exports.DracoDecoderModule = DracoDecoderModule);
