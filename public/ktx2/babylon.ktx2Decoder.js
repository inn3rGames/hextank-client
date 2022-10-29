!(function (e, t) {
    "object" == typeof exports && "object" == typeof module
        ? (module.exports = t())
        : "function" == typeof define && define.amd
        ? define("babylonjs-ktx2decoder", [], t)
        : "object" == typeof exports
        ? (exports["babylonjs-ktx2decoder"] = t())
        : (e.KTX2DECODER = t());
})(
    "undefined" != typeof self
        ? self
        : "undefined" != typeof global
        ? global
        : this,
    () =>
        (() => {
            "use strict";
            var e = {
                d: (t, r) => {
                    for (var a in r)
                        e.o(r, a) &&
                            !e.o(t, a) &&
                            Object.defineProperty(t, a, {
                                enumerable: !0,
                                get: r[a],
                            });
                },
            };
            (e.g = (function () {
                if ("object" == typeof globalThis) return globalThis;
                try {
                    return this || new Function("return this")();
                } catch (e) {
                    if ("object" == typeof window) return window;
                }
            })()),
                (e.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
                (e.r = (e) => {
                    "undefined" != typeof Symbol &&
                        Symbol.toStringTag &&
                        Object.defineProperty(e, Symbol.toStringTag, {
                            value: "Module",
                        }),
                        Object.defineProperty(e, "__esModule", { value: !0 });
                });
            var t = {};
            e.d(t, { default: () => R });
            var r,
                a,
                s,
                n = {};
            e.r(n),
                e.d(n, {
                    DataReader: () => o,
                    KTX2Decoder: () => S,
                    KTX2FileReader: () => d,
                    LiteTranscoder: () => h,
                    LiteTranscoder_UASTC_ASTC: () => m,
                    LiteTranscoder_UASTC_BC7: () => u,
                    LiteTranscoder_UASTC_RGBA_SRGB: () => _,
                    LiteTranscoder_UASTC_RGBA_UNORM: () => f,
                    MSCTranscoder: () => y,
                    SupercompressionScheme: () => s,
                    Transcoder: () => i,
                    TranscoderManager: () => l,
                    WASMMemoryManager: () => c,
                    ZSTDDecoder: () => w,
                    sourceTextureFormat: () => r,
                    transcodeTarget: () => a,
                });
            class o {
                constructor(e, t, r) {
                    e.buffer
                        ? (this._dataView = new DataView(
                              e.buffer,
                              e.byteOffset + (t ?? 0),
                              r ?? e.byteLength
                          ))
                        : (this._dataView = new DataView(
                              e,
                              t ?? 0,
                              r ?? e.byteLength
                          )),
                        (this._dataByteOffset = 0);
                }
                get byteOffset() {
                    return this._dataByteOffset;
                }
                readUint8() {
                    const e = this._dataView.getUint8(this._dataByteOffset);
                    return (this._dataByteOffset += 1), e;
                }
                readInt8() {
                    const e = this._dataView.getInt8(this._dataByteOffset);
                    return (this._dataByteOffset += 1), e;
                }
                readUint16() {
                    const e = this._dataView.getUint16(
                        this._dataByteOffset,
                        !0
                    );
                    return (this._dataByteOffset += 2), e;
                }
                readInt16() {
                    const e = this._dataView.getInt16(this._dataByteOffset, !0);
                    return (this._dataByteOffset += 2), e;
                }
                readUint32() {
                    const e = this._dataView.getUint32(
                        this._dataByteOffset,
                        !0
                    );
                    return (this._dataByteOffset += 4), e;
                }
                readInt32() {
                    const e = this._dataView.getInt32(this._dataByteOffset, !0);
                    return (this._dataByteOffset += 4), e;
                }
                readUint64() {
                    const e =
                        this._dataView.getUint32(this._dataByteOffset, !0) +
                        2 ** 32 *
                            this._dataView.getUint32(
                                this._dataByteOffset + 4,
                                !0
                            );
                    return (this._dataByteOffset += 8), e;
                }
                readUint8Array(e) {
                    const t = new Uint8Array(
                        this._dataView.buffer,
                        this._dataView.byteOffset + this._dataByteOffset,
                        e
                    );
                    return (this._dataByteOffset += e), t;
                }
                skipBytes(e) {
                    return (this._dataByteOffset += e), this;
                }
            }
            !(function (e) {
                (e[(e.ETC1S = 0)] = "ETC1S"),
                    (e[(e.UASTC4x4 = 1)] = "UASTC4x4");
            })(r || (r = {})),
                (function (e) {
                    (e[(e.ASTC_4x4_RGBA = 0)] = "ASTC_4x4_RGBA"),
                        (e[(e.BC7_RGBA = 1)] = "BC7_RGBA"),
                        (e[(e.BC3_RGBA = 2)] = "BC3_RGBA"),
                        (e[(e.BC1_RGB = 3)] = "BC1_RGB"),
                        (e[(e.PVRTC1_4_RGBA = 4)] = "PVRTC1_4_RGBA"),
                        (e[(e.PVRTC1_4_RGB = 5)] = "PVRTC1_4_RGB"),
                        (e[(e.ETC2_RGBA = 6)] = "ETC2_RGBA"),
                        (e[(e.ETC1_RGB = 7)] = "ETC1_RGB"),
                        (e[(e.RGBA32 = 8)] = "RGBA32");
                })(a || (a = {}));
            class i {
                static CanTranscode(e, t, r) {
                    return !1;
                }
                getName() {
                    return i.Name;
                }
                initialize() {}
                needMemoryManager() {
                    return !1;
                }
                setMemoryManager(e) {}
                transcode(e, t, r, a, s, n, o, i, d) {
                    return Promise.resolve(null);
                }
            }
            (i.Name = "Transcoder"),
                (function (e) {
                    (e[(e.None = 0)] = "None"),
                        (e[(e.BasisLZ = 1)] = "BasisLZ"),
                        (e[(e.ZStandard = 2)] = "ZStandard"),
                        (e[(e.ZLib = 3)] = "ZLib");
                })(s || (s = {}));
            class d {
                constructor(e) {
                    this._data = e;
                }
                get data() {
                    return this._data;
                }
                get header() {
                    return this._header;
                }
                get levels() {
                    return this._levels;
                }
                get dfdBlock() {
                    return this._dfdBlock;
                }
                get supercompressionGlobalData() {
                    return this._supercompressionGlobalData;
                }
                isValid() {
                    return d.IsValid(this._data);
                }
                parse() {
                    let e = 12;
                    const t = new o(this._data, e, 68),
                        r = (this._header = {
                            vkFormat: t.readUint32(),
                            typeSize: t.readUint32(),
                            pixelWidth: t.readUint32(),
                            pixelHeight: t.readUint32(),
                            pixelDepth: t.readUint32(),
                            layerCount: t.readUint32(),
                            faceCount: t.readUint32(),
                            levelCount: t.readUint32(),
                            supercompressionScheme: t.readUint32(),
                            dfdByteOffset: t.readUint32(),
                            dfdByteLength: t.readUint32(),
                            kvdByteOffset: t.readUint32(),
                            kvdByteLength: t.readUint32(),
                            sgdByteOffset: t.readUint64(),
                            sgdByteLength: t.readUint64(),
                        });
                    if (r.pixelDepth > 0)
                        throw new Error(
                            "Failed to parse KTX2 file - Only 2D textures are currently supported."
                        );
                    if (r.layerCount > 1)
                        throw new Error(
                            "Failed to parse KTX2 file - Array textures are not currently supported."
                        );
                    if (r.faceCount > 1)
                        throw new Error(
                            "Failed to parse KTX2 file - Cube textures are not currently supported."
                        );
                    e += t.byteOffset;
                    let a = Math.max(1, r.levelCount);
                    const s = new o(this._data, e, 3 * a * 8),
                        n = (this._levels = []);
                    for (; a--; )
                        n.push({
                            byteOffset: s.readUint64(),
                            byteLength: s.readUint64(),
                            uncompressedByteLength: s.readUint64(),
                        });
                    e += s.byteOffset;
                    const i = new o(
                            this._data,
                            r.dfdByteOffset,
                            r.dfdByteLength
                        ),
                        d = (this._dfdBlock = {
                            vendorId: i.skipBytes(4).readUint16(),
                            descriptorType: i.readUint16(),
                            versionNumber: i.readUint16(),
                            descriptorBlockSize: i.readUint16(),
                            colorModel: i.readUint8(),
                            colorPrimaries: i.readUint8(),
                            transferFunction: i.readUint8(),
                            flags: i.readUint8(),
                            texelBlockDimension: {
                                x: i.readUint8() + 1,
                                y: i.readUint8() + 1,
                                z: i.readUint8() + 1,
                                w: i.readUint8() + 1,
                            },
                            bytesPlane: [
                                i.readUint8(),
                                i.readUint8(),
                                i.readUint8(),
                                i.readUint8(),
                                i.readUint8(),
                                i.readUint8(),
                                i.readUint8(),
                                i.readUint8(),
                            ],
                            numSamples: 0,
                            samples: new Array(),
                        });
                    d.numSamples = (d.descriptorBlockSize - 24) / 16;
                    for (let e = 0; e < d.numSamples; e++) {
                        const e = {
                            bitOffset: i.readUint16(),
                            bitLength: i.readUint8() + 1,
                            channelType: i.readUint8(),
                            channelFlags: 0,
                            samplePosition: [
                                i.readUint8(),
                                i.readUint8(),
                                i.readUint8(),
                                i.readUint8(),
                            ],
                            sampleLower: i.readUint32(),
                            sampleUpper: i.readUint32(),
                        };
                        (e.channelFlags = (240 & e.channelType) >> 4),
                            (e.channelType = 15 & e.channelType),
                            d.samples.push(e);
                    }
                    const c = (this._supercompressionGlobalData = {});
                    if (r.sgdByteLength > 0) {
                        const e = new o(
                            this._data,
                            r.sgdByteOffset,
                            r.sgdByteLength
                        );
                        (c.endpointCount = e.readUint16()),
                            (c.selectorCount = e.readUint16()),
                            (c.endpointsByteLength = e.readUint32()),
                            (c.selectorsByteLength = e.readUint32()),
                            (c.tablesByteLength = e.readUint32()),
                            (c.extendedByteLength = e.readUint32()),
                            (c.imageDescs = []);
                        const t = this._getImageCount();
                        for (let r = 0; r < t; r++)
                            c.imageDescs.push({
                                imageFlags: e.readUint32(),
                                rgbSliceByteOffset: e.readUint32(),
                                rgbSliceByteLength: e.readUint32(),
                                alphaSliceByteOffset: e.readUint32(),
                                alphaSliceByteLength: e.readUint32(),
                            });
                        const a = r.sgdByteOffset + e.byteOffset,
                            s = a + c.endpointsByteLength,
                            n = s + c.selectorsByteLength,
                            i = n + c.tablesByteLength;
                        (c.endpointsData = new Uint8Array(
                            this._data.buffer,
                            this._data.byteOffset + a,
                            c.endpointsByteLength
                        )),
                            (c.selectorsData = new Uint8Array(
                                this._data.buffer,
                                this._data.byteOffset + s,
                                c.selectorsByteLength
                            )),
                            (c.tablesData = new Uint8Array(
                                this._data.buffer,
                                this._data.byteOffset + n,
                                c.tablesByteLength
                            )),
                            (c.extendedData = new Uint8Array(
                                this._data.buffer,
                                this._data.byteOffset + i,
                                c.extendedByteLength
                            ));
                    }
                }
                _getImageCount() {
                    let e = Math.max(this._header.pixelDepth, 1);
                    for (let t = 1; t < this._header.levelCount; t++)
                        e += Math.max(this._header.pixelDepth >> t, 1);
                    return (
                        Math.max(this._header.layerCount, 1) *
                        this._header.faceCount *
                        e
                    );
                }
                get textureFormat() {
                    return 166 === this._dfdBlock.colorModel
                        ? r.UASTC4x4
                        : r.ETC1S;
                }
                get hasAlpha() {
                    switch (this.textureFormat) {
                        case r.ETC1S:
                            return (
                                2 === this._dfdBlock.numSamples &&
                                (15 === this._dfdBlock.samples[0].channelType ||
                                    15 ===
                                        this._dfdBlock.samples[1].channelType)
                            );
                        case r.UASTC4x4:
                            return 3 === this._dfdBlock.samples[0].channelType;
                    }
                    return !1;
                }
                get needZSTDDecoder() {
                    return this._header.supercompressionScheme === s.ZStandard;
                }
                get isInGammaSpace() {
                    return 2 === this._dfdBlock.transferFunction;
                }
                static IsValid(e) {
                    if (e.byteLength >= 12) {
                        const t = new Uint8Array(e.buffer, e.byteOffset, 12);
                        if (
                            171 === t[0] &&
                            75 === t[1] &&
                            84 === t[2] &&
                            88 === t[3] &&
                            32 === t[4] &&
                            50 === t[5] &&
                            48 === t[6] &&
                            187 === t[7] &&
                            13 === t[8] &&
                            10 === t[9] &&
                            26 === t[10] &&
                            10 === t[11]
                        )
                            return !0;
                    }
                    return !1;
                }
            }
            class c {
                constructor(e = c.InitialMemoryPages) {
                    (this._numPages = e),
                        (this._memory = new WebAssembly.Memory({
                            initial: this._numPages,
                        })),
                        (this._memoryViewByteLength = this._numPages << 16),
                        (this._memoryViewOffset = 0),
                        (this._memoryView = new Uint8Array(
                            this._memory.buffer,
                            this._memoryViewOffset,
                            this._memoryViewByteLength
                        ));
                }
                static LoadWASM(e) {
                    if (this.LoadBinariesFromCurrentThread)
                        return new Promise((t, r) => {
                            fetch(e)
                                .then((t) => {
                                    if (t.ok) return t.arrayBuffer();
                                    throw new Error(
                                        `Could not fetch the wasm component from "${e}": ${t.status} - ${t.statusText}`
                                    );
                                })
                                .then((e) => t(e))
                                .catch((e) => {
                                    r(e);
                                });
                        });
                    const t = this._RequestId++;
                    return new Promise((r) => {
                        const a = (e) => {
                            "wasmLoaded" === e.data.action &&
                                e.data.id === t &&
                                (self.removeEventListener("message", a),
                                r(e.data.wasmBinary));
                        };
                        self.addEventListener("message", a),
                            postMessage({ action: "loadWASM", path: e, id: t });
                    });
                }
                get wasmMemory() {
                    return this._memory;
                }
                getMemoryView(e, t = 0, r) {
                    return (
                        (r = r ?? e << 16),
                        this._numPages < e
                            ? (this._memory.grow(e - this._numPages),
                              (this._numPages = e),
                              (this._memoryView = new Uint8Array(
                                  this._memory.buffer,
                                  t,
                                  r
                              )),
                              (this._memoryViewByteLength = r),
                              (this._memoryViewOffset = t))
                            : ((this._memoryView = new Uint8Array(
                                  this._memory.buffer,
                                  t,
                                  r
                              )),
                              (this._memoryViewByteLength = r),
                              (this._memoryViewOffset = t)),
                        this._memoryView
                    );
                }
            }
            (c.LoadBinariesFromCurrentThread = !0),
                (c.InitialMemoryPages = 16),
                (c._RequestId = 0);
            class l {
                static RegisterTranscoder(e) {
                    l._Transcoders.push(e);
                }
                findTranscoder(e, t, s, n) {
                    let o = null;
                    const i = r[e] + "_" + a[t];
                    for (let r = 0; r < l._Transcoders.length; ++r)
                        if (
                            l._Transcoders[r].CanTranscode(e, t, s) &&
                            (!n || n.indexOf(l._Transcoders[r].Name) < 0)
                        ) {
                            (o = this._getExistingTranscoder(
                                i,
                                l._Transcoders[r].Name
                            )),
                                o ||
                                    ((o = new l._Transcoders[r]()),
                                    o.initialize(),
                                    o.needMemoryManager() &&
                                        (this._wasmMemoryManager ||
                                            (this._wasmMemoryManager = new c()),
                                        o.setMemoryManager(
                                            this._wasmMemoryManager
                                        )),
                                    l._TranscoderInstances[i] ||
                                        (l._TranscoderInstances[i] = []),
                                    l._TranscoderInstances[i].push(o));
                            break;
                        }
                    return o;
                }
                _getExistingTranscoder(e, t) {
                    const r = l._TranscoderInstances[e];
                    if (r)
                        for (let e = 0; e < r.length; ++e) {
                            const a = r[e];
                            if (t === a.getName()) return a;
                        }
                    return null;
                }
            }
            (l._Transcoders = []), (l._TranscoderInstances = {});
            class h extends i {
                _loadModule() {
                    return (
                        this._modulePromise ||
                            (this._modulePromise = c
                                .LoadWASM(this._modulePath)
                                .then(
                                    (e) =>
                                        new Promise((t) => {
                                            WebAssembly.instantiate(e, {
                                                env: {
                                                    memory: this._memoryManager
                                                        .wasmMemory,
                                                },
                                            }).then((e) => {
                                                t({
                                                    module: e.instance.exports,
                                                });
                                            });
                                        })
                                )),
                        this._modulePromise
                    );
                }
                get memoryManager() {
                    return this._memoryManager;
                }
                setModulePath(e) {
                    this._modulePath = e;
                }
                initialize() {
                    this._transcodeInPlace = !0;
                }
                needMemoryManager() {
                    return !0;
                }
                setMemoryManager(e) {
                    this._memoryManager = e;
                }
                transcode(e, t, r, a, s, n, o, i, d) {
                    return this._loadModule().then((e) => {
                        const t = e.module,
                            [r, o, i] = this._prepareTranscoding(a, s, n, d);
                        return 0 === t.transcode(i)
                            ? this._transcodeInPlace
                                ? r.slice()
                                : o.slice()
                            : null;
                    });
                }
                _prepareTranscoding(e, t, r, a, s = !1) {
                    const n = ((e + 3) >> 2) * ((t + 3) >> 2);
                    s && (r = e * ((t + 3) >> 2) * 4 * 4);
                    const o =
                            1 +
                            ((16 * n +
                                65535 +
                                (this._transcodeInPlace ? 0 : r)) >>
                                16),
                        i = this.memoryManager.getMemoryView(o, 65536, 16 * n),
                        d = this._transcodeInPlace
                            ? null
                            : new Uint8Array(
                                  this._memoryManager.wasmMemory.buffer,
                                  65536 + 16 * n,
                                  s ? e * t * 4 : r
                              );
                    return i.set(a), [i, d, n];
                }
            }
            class m extends h {
                static CanTranscode(e, t, s) {
                    return e === r.UASTC4x4 && t === a.ASTC_4x4_RGBA;
                }
                getName() {
                    return m.Name;
                }
                initialize() {
                    super.initialize(), this.setModulePath(m.WasmModuleURL);
                }
            }
            (m.WasmModuleURL =
                "https://preview.babylonjs.com/ktx2Transcoders/uastc_astc.wasm"),
                (m.Name = "UniversalTranscoder_UASTC_ASTC");
            class u extends h {
                static CanTranscode(e, t, s) {
                    return e === r.UASTC4x4 && t === a.BC7_RGBA;
                }
                getName() {
                    return u.Name;
                }
                initialize() {
                    super.initialize(), this.setModulePath(u.WasmModuleURL);
                }
            }
            (u.WasmModuleURL =
                "https://preview.babylonjs.com/ktx2Transcoders/uastc_bc7.wasm"),
                (u.Name = "UniversalTranscoder_UASTC_BC7");
            class f extends h {
                static CanTranscode(e, t, s) {
                    return e === r.UASTC4x4 && t === a.RGBA32 && !s;
                }
                getName() {
                    return f.Name;
                }
                initialize() {
                    super.initialize(),
                        (this._transcodeInPlace = !1),
                        this.setModulePath(f.WasmModuleURL);
                }
                transcode(e, t, r, a, s, n, o, i, d) {
                    return this._loadModule().then((e) => {
                        const t = e.module,
                            [, r] = this._prepareTranscoding(a, s, n, d, !0);
                        return 0 === t.decodeRGBA32(a, s) ? r.slice() : null;
                    });
                }
            }
            (f.WasmModuleURL =
                "https://preview.babylonjs.com/ktx2Transcoders/uastc_rgba32_unorm.wasm"),
                (f.Name = "UniversalTranscoder_UASTC_RGBA_UNORM");
            class _ extends h {
                static CanTranscode(e, t, s) {
                    return e === r.UASTC4x4 && t === a.RGBA32 && s;
                }
                getName() {
                    return _.Name;
                }
                initialize() {
                    super.initialize(),
                        (this._transcodeInPlace = !1),
                        this.setModulePath(_.WasmModuleURL);
                }
                transcode(e, t, r, a, s, n, o, i, d) {
                    return this._loadModule().then((e) => {
                        const t = e.module,
                            [, r] = this._prepareTranscoding(a, s, n, d, !0);
                        return 0 === t.decodeRGBA32(a, s) ? r.slice() : null;
                    });
                }
            }
            (_.WasmModuleURL =
                "https://preview.babylonjs.com/ktx2Transcoders/uastc_rgba32_srgb.wasm"),
                (_.Name = "UniversalTranscoder_UASTC_RGBA_SRGB");
            class y extends i {
                getName() {
                    return y.Name;
                }
                _getMSCBasisTranscoder() {
                    return (
                        this._mscBasisTranscoderPromise ||
                            (this._mscBasisTranscoderPromise = c
                                .LoadWASM(y.WasmModuleURL)
                                .then((e) => {
                                    if (y.UseFromWorkerThread)
                                        importScripts(y.JSModuleURL);
                                    else if (
                                        "undefined" == typeof MSC_TRANSCODER
                                    )
                                        return new Promise((t, r) => {
                                            const a =
                                                    document.getElementsByTagName(
                                                        "head"
                                                    )[0],
                                                s =
                                                    document.createElement(
                                                        "script"
                                                    );
                                            s.setAttribute(
                                                "type",
                                                "text/javascript"
                                            ),
                                                s.setAttribute(
                                                    "src",
                                                    y.JSModuleURL
                                                ),
                                                (s.onload = () => {
                                                    MSC_TRANSCODER({
                                                        wasmBinary: e,
                                                    }).then((e) => {
                                                        e.initTranscoders(),
                                                            (this._mscBasisModule =
                                                                e),
                                                            t();
                                                    });
                                                }),
                                                (s.onerror = () => {
                                                    r(
                                                        "Can not load MSC_TRANSCODER script."
                                                    );
                                                }),
                                                a.appendChild(s);
                                        });
                                    return new Promise((t) => {
                                        MSC_TRANSCODER({ wasmBinary: e }).then(
                                            (e) => {
                                                e.initTranscoders(),
                                                    (this._mscBasisModule = e),
                                                    t();
                                            }
                                        );
                                    });
                                })),
                        this._mscBasisTranscoderPromise
                    );
                }
                static CanTranscode(e, t, r) {
                    return !0;
                }
                transcode(e, t, s, n, o, i, d, c, l) {
                    return this._getMSCBasisTranscoder().then(() => {
                        const h = this._mscBasisModule;
                        let m,
                            u,
                            f,
                            _ = null;
                        try {
                            m =
                                e === r.UASTC4x4
                                    ? new h.UastcImageTranscoder()
                                    : new h.BasisLzEtc1sImageTranscoder();
                            const y =
                                e === r.UASTC4x4
                                    ? h.TextureFormat.UASTC4x4
                                    : h.TextureFormat.ETC1S;
                            u = new h.ImageInfo(y, n, o, s);
                            const p = h.TranscodeTarget[a[t]];
                            if (!h.isFormatSupported(p, y))
                                throw new Error(
                                    `MSCTranscoder: Transcoding from "${r[e]}" to "${a[t]}" not supported by current transcoder build.`
                                );
                            if (e === r.ETC1S) {
                                const e = d.supercompressionGlobalData;
                                m.decodePalettes(
                                    e.endpointCount,
                                    e.endpointsData,
                                    e.selectorCount,
                                    e.selectorsData
                                ),
                                    m.decodeTables(e.tablesData),
                                    (u.flags = c.imageFlags),
                                    (u.rgbByteOffset = 0),
                                    (u.rgbByteLength = c.rgbSliceByteLength),
                                    (u.alphaByteOffset =
                                        c.alphaSliceByteOffset > 0
                                            ? c.rgbSliceByteLength
                                            : 0),
                                    (u.alphaByteLength =
                                        c.alphaSliceByteLength),
                                    (f = m.transcodeImage(p, l, u, 0, !1));
                            } else
                                (u.flags = 0),
                                    (u.rgbByteOffset = 0),
                                    (u.rgbByteLength = i),
                                    (u.alphaByteOffset = 0),
                                    (u.alphaByteLength = 0),
                                    (f = m.transcodeImage(
                                        p,
                                        l,
                                        u,
                                        0,
                                        d.hasAlpha,
                                        !1
                                    ));
                        } finally {
                            m && m.delete(),
                                u && u.delete(),
                                f &&
                                    f.transcodedImage &&
                                    ((_ = f.transcodedImage
                                        .get_typed_memory_view()
                                        .slice()),
                                    f.transcodedImage.delete());
                        }
                        return _;
                    });
                }
            }
            let p, g, T;
            (y.JSModuleURL =
                "https://preview.babylonjs.com/ktx2Transcoders/msc_basis_transcoder.js"),
                (y.WasmModuleURL =
                    "https://preview.babylonjs.com/ktx2Transcoders/msc_basis_transcoder.wasm"),
                (y.UseFromWorkerThread = !0),
                (y.Name = "MSCTranscoder");
            const B = {
                env: {
                    emscripten_notify_memory_growth: function () {
                        T = new Uint8Array(g.exports.memory.buffer);
                    },
                },
            };
            class w {
                init() {
                    return (
                        p ||
                        ((p =
                            "undefined" != typeof fetch
                                ? fetch(w.WasmModuleURL)
                                      .then((e) => {
                                          if (e.ok) return e.arrayBuffer();
                                          throw new Error(
                                              `Could not fetch the wasm component for the Zstandard decompression lib: ${e.status} - ${e.statusText}`
                                          );
                                      })
                                      .then((e) =>
                                          WebAssembly.instantiate(e, B)
                                      )
                                      .then(this._init)
                                : WebAssembly.instantiateStreaming(
                                      fetch(w.WasmModuleURL),
                                      B
                                  ).then(this._init)),
                        p)
                    );
                }
                _init(e) {
                    (g = e.instance), B.env.emscripten_notify_memory_growth();
                }
                decode(e, t = 0) {
                    if (!g)
                        throw new Error(
                            "ZSTDDecoder: Await .init() before decoding."
                        );
                    const r = e.byteLength,
                        a = g.exports.malloc(r);
                    T.set(e, a),
                        (t =
                            t ||
                            Number(g.exports.ZSTD_findDecompressedSize(a, r)));
                    const s = g.exports.malloc(t),
                        n = g.exports.ZSTD_decompress(s, t, a, r),
                        o = T.slice(s, s + n);
                    return g.exports.free(a), g.exports.free(s), o;
                }
            }
            w.WasmModuleURL = "https://preview.babylonjs.com/zstddec.wasm";
            const U = 32856,
                b = {
                    ETC1S: {
                        option: "forceRGBA",
                        yes: {
                            transcodeFormat: a.RGBA32,
                            engineFormat: U,
                            roundToMultiple4: !1,
                        },
                        no: {
                            cap: "etc2",
                            yes: {
                                alpha: !0,
                                yes: {
                                    transcodeFormat: a.ETC2_RGBA,
                                    engineFormat: 37496,
                                },
                                no: {
                                    transcodeFormat: a.ETC1_RGB,
                                    engineFormat: 37492,
                                },
                            },
                            no: {
                                cap: "etc1",
                                alpha: !1,
                                yes: {
                                    transcodeFormat: a.ETC1_RGB,
                                    engineFormat: 36196,
                                },
                                no: {
                                    cap: "bptc",
                                    yes: {
                                        transcodeFormat: a.BC7_RGBA,
                                        engineFormat: 36492,
                                    },
                                    no: {
                                        cap: "s3tc",
                                        yes: {
                                            alpha: !0,
                                            yes: {
                                                transcodeFormat: a.BC3_RGBA,
                                                engineFormat: 33779,
                                            },
                                            no: {
                                                transcodeFormat: a.BC1_RGB,
                                                engineFormat: 33776,
                                            },
                                        },
                                        no: {
                                            cap: "pvrtc",
                                            needsPowerOfTwo: !0,
                                            yes: {
                                                alpha: !0,
                                                yes: {
                                                    transcodeFormat:
                                                        a.PVRTC1_4_RGBA,
                                                    engineFormat: 35842,
                                                },
                                                no: {
                                                    transcodeFormat:
                                                        a.PVRTC1_4_RGB,
                                                    engineFormat: 35840,
                                                },
                                            },
                                            no: {
                                                transcodeFormat: a.RGBA32,
                                                engineFormat: U,
                                                roundToMultiple4: !1,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    UASTC: {
                        option: "forceRGBA",
                        yes: {
                            transcodeFormat: a.RGBA32,
                            engineFormat: U,
                            roundToMultiple4: !1,
                        },
                        no: {
                            cap: "astc",
                            yes: {
                                transcodeFormat: a.ASTC_4x4_RGBA,
                                engineFormat: 37808,
                            },
                            no: {
                                cap: "bptc",
                                yes: {
                                    transcodeFormat: a.BC7_RGBA,
                                    engineFormat: 36492,
                                },
                                no: {
                                    option: "useRGBAIfASTCBC7NotAvailableWhenUASTC",
                                    yes: {
                                        transcodeFormat: a.RGBA32,
                                        engineFormat: U,
                                        roundToMultiple4: !1,
                                    },
                                    no: {
                                        cap: "etc2",
                                        yes: {
                                            alpha: !0,
                                            yes: {
                                                transcodeFormat: a.ETC2_RGBA,
                                                engineFormat: 37496,
                                            },
                                            no: {
                                                transcodeFormat: a.ETC1_RGB,
                                                engineFormat: 37492,
                                            },
                                        },
                                        no: {
                                            cap: "etc1",
                                            yes: {
                                                transcodeFormat: a.ETC1_RGB,
                                                engineFormat: 36196,
                                            },
                                            no: {
                                                cap: "s3tc",
                                                yes: {
                                                    alpha: !0,
                                                    yes: {
                                                        transcodeFormat:
                                                            a.BC3_RGBA,
                                                        engineFormat: 33779,
                                                    },
                                                    no: {
                                                        transcodeFormat:
                                                            a.BC1_RGB,
                                                        engineFormat: 33776,
                                                    },
                                                },
                                                no: {
                                                    cap: "pvrtc",
                                                    needsPowerOfTwo: !0,
                                                    yes: {
                                                        alpha: !0,
                                                        yes: {
                                                            transcodeFormat:
                                                                a.PVRTC1_4_RGBA,
                                                            engineFormat: 35842,
                                                        },
                                                        no: {
                                                            transcodeFormat:
                                                                a.PVRTC1_4_RGB,
                                                            engineFormat: 35840,
                                                        },
                                                    },
                                                    no: {
                                                        transcodeFormat:
                                                            a.RGBA32,
                                                        engineFormat: U,
                                                        roundToMultiple4: !1,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                };
            class C {
                constructor(e, t, a, s, n) {
                    (this._hasAlpha = t),
                        (this._isPowerOfTwo = a),
                        (this._caps = s),
                        (this._options = n ?? {}),
                        this._parseNode(e === r.UASTC4x4 ? b.UASTC : b.ETC1S);
                }
                static _IsLeafNode(e) {
                    return void 0 !== e.transcodeFormat;
                }
                get transcodeFormat() {
                    return this._transcodeFormat;
                }
                get engineFormat() {
                    return this._engineFormat;
                }
                get roundToMultiple4() {
                    return this._roundToMultiple4;
                }
                _parseNode(e) {
                    if (C._IsLeafNode(e))
                        (this._transcodeFormat = e.transcodeFormat),
                            (this._engineFormat = e.engineFormat),
                            (this._roundToMultiple4 = e.roundToMultiple4 ?? !0);
                    else {
                        let t = !0;
                        void 0 !== e.cap && (t = t && this._caps[e.cap]),
                            void 0 !== e.option &&
                                (t = t && this._options[e.option]),
                            void 0 !== e.alpha &&
                                (t = t && this._hasAlpha === e.alpha),
                            void 0 !== e.needsPowerOfTwo &&
                                (t =
                                    t &&
                                    this._isPowerOfTwo === e.needsPowerOfTwo),
                            this._parseNode(t ? e.yes : e.no);
                    }
                }
            }
            const A = (e) => 0 == (e & (e - 1)) && 0 !== e;
            class S {
                constructor() {
                    this._transcoderMgr = new l();
                }
                decode(e, t, r) {
                    return Promise.resolve().then(() => {
                        const a = new d(e);
                        if (!a.isValid())
                            throw new Error(
                                "Invalid KT2 file: wrong signature"
                            );
                        return (
                            a.parse(),
                            a.needZSTDDecoder
                                ? (this._zstdDecoder ||
                                      (this._zstdDecoder = new w()),
                                  this._zstdDecoder
                                      .init()
                                      .then(() => this._decodeData(a, t, r)))
                                : this._decodeData(a, t, r)
                        );
                    });
                }
                _decodeData(e, t, n) {
                    const o = e.header.pixelWidth,
                        i = e.header.pixelHeight,
                        d = e.textureFormat,
                        c = new C(d, e.hasAlpha, A(o) && A(i), t, n),
                        l = c.transcodeFormat,
                        h = c.engineFormat,
                        m = c.roundToMultiple4,
                        u = this._transcoderMgr.findTranscoder(
                            d,
                            l,
                            e.isInGammaSpace,
                            n?.bypassTranscoders
                        );
                    if (null === u)
                        throw new Error(
                            `no transcoder found to transcode source texture format "${r[d]}" to format "${a[l]}"`
                        );
                    const f = [],
                        _ = [],
                        y = {
                            width: 0,
                            height: 0,
                            transcodedFormat: h,
                            mipmaps: f,
                            isInGammaSpace: e.isInGammaSpace,
                            hasAlpha: e.hasAlpha,
                            transcoderName: u.getName(),
                        };
                    let p = 0;
                    for (let t = 0; t < e.header.levelCount; t++) {
                        t > 0 &&
                            (p +=
                                Math.max(e.header.layerCount, 1) *
                                e.header.faceCount *
                                Math.max(e.header.pixelDepth >> (t - 1), 1));
                        const r = Math.floor(o / (1 << t)) || 1,
                            a = Math.floor(i / (1 << t)) || 1,
                            n = e.header.faceCount,
                            c =
                                ((r + 3) >> 2) *
                                ((a + 3) >> 2) *
                                e.dfdBlock.bytesPlane[0],
                            h = e.levels[t].uncompressedByteLength;
                        let g = e.data.buffer,
                            T = e.levels[t].byteOffset + e.data.byteOffset,
                            B = 0;
                        e.header.supercompressionScheme === s.ZStandard &&
                            ((g = this._zstdDecoder.decode(
                                new Uint8Array(g, T, e.levels[t].byteLength),
                                h
                            )),
                            (T = 0)),
                            0 === t &&
                                ((y.width = m ? (r + 3) & -4 : r),
                                (y.height = m ? (a + 3) & -4 : a));
                        for (let o = 0; o < n; o++) {
                            let n,
                                i = null;
                            e.header.supercompressionScheme === s.BasisLZ
                                ? ((i =
                                      e.supercompressionGlobalData.imageDescs[
                                          p + o
                                      ]),
                                  (n = new Uint8Array(
                                      g,
                                      T + i.rgbSliceByteOffset,
                                      i.rgbSliceByteLength +
                                          i.alphaSliceByteLength
                                  )))
                                : ((n = new Uint8Array(g, T + B, c)), (B += c));
                            const m = { data: null, width: r, height: a },
                                w = u
                                    .transcode(d, l, t, r, a, h, e, i, n)
                                    .then((e) => ((m.data = e), e))
                                    .catch(
                                        (e) => (
                                            (y.errors = y.errors ?? ""),
                                            (y.errors +=
                                                e + "\n" + e.stack + "\n"),
                                            null
                                        )
                                    );
                            _.push(w), f.push(m);
                        }
                    }
                    return Promise.all(_).then(() => y);
                }
            }
            l.RegisterTranscoder(m),
                l.RegisterTranscoder(u),
                l.RegisterTranscoder(f),
                l.RegisterTranscoder(_),
                l.RegisterTranscoder(y);
            const M =
                void 0 !== e.g
                    ? e.g
                    : "undefined" != typeof window
                    ? window
                    : void 0;
            void 0 !== M && (M.KTX2DECODER = S);
            const R = n;
            return t.default;
        })()
);
//# sourceMappingURL=babylon.ktx2Decoder.js.map
