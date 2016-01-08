var Module = {};
Module.noInitialRun = true;
var Runtime = {
 STACK_ALIGN: 16,
 functionPointers: [],
 funcWrappers: {},
 stackAlloc: (function(size) {
  var ret = STACKTOP;
  STACKTOP = STACKTOP + size | 0;
  STACKTOP = STACKTOP + 15 & -16;
  return ret;
 }),
 staticAlloc: (function(size) {
  var ret = STATICTOP;
  STATICTOP = STATICTOP + size | 0;
  STATICTOP = STATICTOP + 15 & -16;
  return ret;
 }),
 dynamicAlloc: (function(size) {
  var ret = DYNAMICTOP;
  DYNAMICTOP = DYNAMICTOP + size | 0;
  DYNAMICTOP = DYNAMICTOP + 15 & -16;
  if (DYNAMICTOP >= TOTAL_MEMORY) {
   var success = enlargeMemory();
   if (!success) {
    DYNAMICTOP = ret;
    return 0;
   }
  }
  return ret;
 }),
 alignMemory: (function(size, quantum) {
  var ret = size = Math.ceil(size / (quantum ? quantum : 16)) * (quantum ? quantum : 16);
  return ret;
 }),
 GLOBAL_BASE: 8,
 QUANTUM_SIZE: 4,
 __dummy__: 0
};
Module["Runtime"] = Runtime;
var __THREW__ = 0;
var ABORT = false;
var EXITSTATUS = 0;
var undef = 0;
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
 if (!condition) {
  abort("Assertion failed: " + text);
 }
}
var globalScope = this;
function getCFunc(ident) {
 var func = Module["_" + ident];
 return func;
}
var cwrap, ccall;
((function() {
 var toC = {
 };
 ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
   for (var i = 0; i < args.length; i++) {
    var converter = toC[argTypes[i]];
    if (converter) {
     if (stack === 0) stack = Runtime.stackSave();
     cArgs[i] = converter(args[i]);
    } else {
     cArgs[i] = args[i];
    }
   }
  }
  var ret = func.apply(null, cArgs);
  if (returnType === "string") ret = Pointer_stringify(ret);
  if (stack !== 0) {
   if (opts && opts.async) {
    EmterpreterAsync.asyncFinalizers.push((function() {
     Runtime.stackRestore(stack);
    }));
    return;
   }
   Runtime.stackRestore(stack);
  }
  return ret;
 };
 var JSsource = {};
}))();
Module["ccall"] = ccall;
var ALLOC_NORMAL = 0;
var ALLOC_STACK = 1;
var ALLOC_STATIC = 2;
var ALLOC_DYNAMIC = 3;
var ALLOC_NONE = 4;
function allocate(slab, types, allocator, ptr) {
 var zeroinit, size;
 if (typeof slab === "number") {
  zeroinit = true;
  size = slab;
 } else {
  zeroinit = false;
  size = slab.length;
 }
 var singleType = typeof types === "string" ? types : null;
 var ret;
 if (allocator == ALLOC_NONE) {
  ret = ptr;
 } else {
  ret = [ _malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc ][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
 }
 if (zeroinit) {
  var ptr = ret, stop;
  assert((ret & 3) == 0);
  stop = ret + (size & ~3);
  for (; ptr < stop; ptr += 4) {
   HEAP32[ptr >> 2] = 0;
  }
  stop = ret + size;
  while (ptr < stop) {
   HEAP8[ptr++ >> 0] = 0;
  }
  return ret;
 }
 if (singleType === "i8") {
  if (slab.subarray || slab.slice) {
   HEAPU8.set(slab, ret);
  } else {
   HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
 }
 var i = 0, type, typeSize, previousType;
 while (i < size) {
  var curr = slab[i];
  if (typeof curr === "function") {
   curr = Runtime.getFunctionIndex(curr);
  }
  type = singleType || types[i];
  if (type === 0) {
   i++;
   continue;
  }
  if (type == "i64") type = "i32";
  setValue(ret + i, curr, type);
  if (previousType !== type) {
   typeSize = Runtime.getNativeTypeSize(type);
   previousType = type;
  }
  i += typeSize;
 }
 return ret;
}
function stackTrace() {
}
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
 if (x % 4096 > 0) {
  x += 4096 - x % 4096;
 }
 return x;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false;
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0;
var DYNAMIC_BASE = 0, DYNAMICTOP = 0;
function abortOnCannotGrowMemory() {
 abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ");
}
function enlargeMemory() {
 return false;
}
var TOTAL_STACK = Module["TOTAL_STACK"] || 5242880;
var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 402653184;
var totalMemory = 64 * 1024;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2 * TOTAL_STACK) {
 if (totalMemory < 16 * 1024 * 1024) {
  totalMemory *= 2;
 } else {
  totalMemory += 16 * 1024 * 1024;
 }
}
if (totalMemory !== TOTAL_MEMORY) {
 TOTAL_MEMORY = totalMemory;
}
assert(typeof Int32Array !== "undefined" && typeof Float64Array !== "undefined" && !!(new Int32Array(1))["subarray"] && !!(new Int32Array(1))["set"], "JS engine does not provide full typed array support");
var buffer;
buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, "Typed arrays 2 must be run on a little-endian system");
Module["HEAP"] = HEAP;
Module["buffer"] = buffer;
Module["HEAP8"] = HEAP8;
Module["HEAP16"] = HEAP16;
Module["HEAP32"] = HEAP32;
Module["HEAPU8"] = HEAPU8;
Module["HEAPU16"] = HEAPU16;
Module["HEAPU32"] = HEAPU32;
Module["HEAPF32"] = HEAPF32;
Module["HEAPF64"] = HEAPF64;
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;
if (!Math["imul"] || Math["imul"](4294967295, 5) !== -5) Math["imul"] = function imul(a, b) {
 var ah = a >>> 16;
 var al = a & 65535;
 var bh = b >>> 16;
 var bl = b & 65535;
 return al * bl + (ah * bl + al * bh << 16) | 0;
};
Math.imul = Math["imul"];
if (!Math["clz32"]) Math["clz32"] = (function(x) {
 x = x >>> 0;
 for (var i = 0; i < 32; i++) {
  if (x & 1 << 31 - i) return i;
 }
 return 32;
});
Math.clz32 = Math["clz32"];
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;
var Math_clz32 = Math.clz32;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};
var memoryInitializer = null;
var ASM_CONSTS = [];
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 560;
__ATINIT__.push();
allocate([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function _sbrk(bytes) {
 var self = _sbrk;
 if (!self.called) {
  DYNAMICTOP = alignMemoryPage(DYNAMICTOP);
  self.called = true;
  assert(Runtime.dynamicAlloc);
  self.alloc = Runtime.dynamicAlloc;
  Runtime.dynamicAlloc = (function() {
   abort("cannot dynamically allocate, sbrk now has control");
  });
 }
 var ret = DYNAMICTOP;
 if (bytes != 0) {
  var success = self.alloc(bytes);
  if (!success) return -1 >>> 0;
 }
 return ret;
}
function ___setErrNo(value) {
 if (Module["___errno_location"]) HEAP32[Module["___errno_location"]() >> 2] = value;
 return value;
}
var ERRNO_CODES = {
 EPERM: 1,
 ENOENT: 2,
 ESRCH: 3,
 EINTR: 4,
 EIO: 5,
 ENXIO: 6,
 E2BIG: 7,
 ENOEXEC: 8,
 EBADF: 9,
 ECHILD: 10,
 EAGAIN: 11,
 EWOULDBLOCK: 11,
 ENOMEM: 12,
 EACCES: 13,
 EFAULT: 14,
 ENOTBLK: 15,
 EBUSY: 16,
 EEXIST: 17,
 EXDEV: 18,
 ENODEV: 19,
 ENOTDIR: 20,
 EISDIR: 21,
 EINVAL: 22,
 ENFILE: 23,
 EMFILE: 24,
 ENOTTY: 25,
 ETXTBSY: 26,
 EFBIG: 27,
 ENOSPC: 28,
 ESPIPE: 29,
 EROFS: 30,
 EMLINK: 31,
 EPIPE: 32,
 EDOM: 33,
 ERANGE: 34,
 ENOMSG: 42,
 EIDRM: 43,
 ECHRNG: 44,
 EL2NSYNC: 45,
 EL3HLT: 46,
 EL3RST: 47,
 ELNRNG: 48,
 EUNATCH: 49,
 ENOCSI: 50,
 EL2HLT: 51,
 EDEADLK: 35,
 ENOLCK: 37,
 EBADE: 52,
 EBADR: 53,
 EXFULL: 54,
 ENOANO: 55,
 EBADRQC: 56,
 EBADSLT: 57,
 EDEADLOCK: 35,
 EBFONT: 59,
 ENOSTR: 60,
 ENODATA: 61,
 ETIME: 62,
 ENOSR: 63,
 ENONET: 64,
 ENOPKG: 65,
 EREMOTE: 66,
 ENOLINK: 67,
 EADV: 68,
 ESRMNT: 69,
 ECOMM: 70,
 EPROTO: 71,
 EMULTIHOP: 72,
 EDOTDOT: 73,
 EBADMSG: 74,
 ENOTUNIQ: 76,
 EBADFD: 77,
 EREMCHG: 78,
 ELIBACC: 79,
 ELIBBAD: 80,
 ELIBSCN: 81,
 ELIBMAX: 82,
 ELIBEXEC: 83,
 ENOSYS: 38,
 ENOTEMPTY: 39,
 ENAMETOOLONG: 36,
 ELOOP: 40,
 EOPNOTSUPP: 95,
 EPFNOSUPPORT: 96,
 ECONNRESET: 104,
 ENOBUFS: 105,
 EAFNOSUPPORT: 97,
 EPROTOTYPE: 91,
 ENOTSOCK: 88,
 ENOPROTOOPT: 92,
 ESHUTDOWN: 108,
 ECONNREFUSED: 111,
 EADDRINUSE: 98,
 ECONNABORTED: 103,
 ENETUNREACH: 101,
 ENETDOWN: 100,
 ETIMEDOUT: 110,
 EHOSTDOWN: 112,
 EHOSTUNREACH: 113,
 EINPROGRESS: 115,
 EALREADY: 114,
 EDESTADDRREQ: 89,
 EMSGSIZE: 90,
 EPROTONOSUPPORT: 93,
 ESOCKTNOSUPPORT: 94,
 EADDRNOTAVAIL: 99,
 ENETRESET: 102,
 EISCONN: 106,
 ENOTCONN: 107,
 ETOOMANYREFS: 109,
 EUSERS: 87,
 EDQUOT: 122,
 ESTALE: 116,
 ENOTSUP: 95,
 ENOMEDIUM: 123,
 EILSEQ: 84,
 EOVERFLOW: 75,
 ECANCELED: 125,
 ENOTRECOVERABLE: 131,
 EOWNERDEAD: 130,
 ESTRPIPE: 86
};
function _sysconf(name) {
 switch (name) {
 case 30:
  return PAGE_SIZE;
 case 85:
  return totalMemory / PAGE_SIZE;
 case 132:
 case 133:
 case 12:
 case 137:
 case 138:
 case 15:
 case 235:
 case 16:
 case 17:
 case 18:
 case 19:
 case 20:
 case 149:
 case 13:
 case 10:
 case 236:
 case 153:
 case 9:
 case 21:
 case 22:
 case 159:
 case 154:
 case 14:
 case 77:
 case 78:
 case 139:
 case 80:
 case 81:
 case 82:
 case 68:
 case 67:
 case 164:
 case 11:
 case 29:
 case 47:
 case 48:
 case 95:
 case 52:
 case 51:
 case 46:
  return 200809;
 case 79:
  return 0;
 case 27:
 case 246:
 case 127:
 case 128:
 case 23:
 case 24:
 case 160:
 case 161:
 case 181:
 case 182:
 case 242:
 case 183:
 case 184:
 case 243:
 case 244:
 case 245:
 case 165:
 case 178:
 case 179:
 case 49:
 case 50:
 case 168:
 case 169:
 case 175:
 case 170:
 case 171:
 case 172:
 case 97:
 case 76:
 case 32:
 case 173:
 case 35:
  return -1;
 case 176:
 case 177:
 case 7:
 case 155:
 case 8:
 case 157:
 case 125:
 case 126:
 case 92:
 case 93:
 case 129:
 case 130:
 case 131:
 case 94:
 case 91:
  return 1;
 case 74:
 case 60:
 case 69:
 case 70:
 case 4:
  return 1024;
 case 31:
 case 42:
 case 72:
  return 32;
 case 87:
 case 26:
 case 33:
  return 2147483647;
 case 34:
 case 1:
  return 47839;
 case 38:
 case 36:
  return 99;
 case 43:
 case 37:
  return 2048;
 case 0:
  return 2097152;
 case 3:
  return 65536;
 case 28:
  return 32768;
 case 44:
  return 32767;
 case 75:
  return 16384;
 case 39:
  return 1e3;
 case 89:
  return 700;
 case 71:
  return 256;
 case 40:
  return 255;
 case 2:
  return 100;
 case 180:
  return 64;
 case 25:
  return 20;
 case 5:
  return 16;
 case 6:
  return 6;
 case 73:
  return 4;
 case 84:
  {
   if (typeof navigator === "object") return navigator["hardwareConcurrency"] || 1;
   return 1;
  }
 }
 ___setErrNo(ERRNO_CODES.EINVAL);
 return -1;
}
Module["_memset"] = _memset;
function _abort() {
 Module["abort"]();
}
function _time(ptr) {
 var ret = Date.now() / 1e3 | 0;
 if (ptr) {
  HEAP32[ptr >> 2] = ret;
 }
 return ret;
}
function _pthread_self() {
 return 0;
}
function _emscripten_memcpy_big(dest, src, num) {
 HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
 return dest;
}
Module["_memcpy"] = _memcpy;
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true;
STACK_MAX = STACK_BASE + TOTAL_STACK;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");
Module.asmGlobalArg = {
 "Math": Math,
 "Int8Array": Int8Array,
 "Int16Array": Int16Array,
 "Int32Array": Int32Array,
 "Uint8Array": Uint8Array,
 "Uint16Array": Uint16Array,
 "Uint32Array": Uint32Array,
 "Float32Array": Float32Array,
 "Float64Array": Float64Array,
 "NaN": NaN,
 "Infinity": Infinity
};
Module.asmLibraryArg = {
 "abort": abort,
 "assert": assert,
 "_pthread_self": _pthread_self,
 "_abort": _abort,
 "___setErrNo": ___setErrNo,
 "_sbrk": _sbrk,
 "_time": _time,
 "_emscripten_memcpy_big": _emscripten_memcpy_big,
 "_sysconf": _sysconf,
 "STACKTOP": STACKTOP,
 "STACK_MAX": STACK_MAX,
 "tempDoublePtr": tempDoublePtr,
 "ABORT": ABORT
};
// EMSCRIPTEN_START_ASM
var asm = (function(global,env,buffer) {
 "use asm";
 var a = new global.Int8Array(buffer);
 var b = new global.Int16Array(buffer);
 var c = new global.Int32Array(buffer);
 var d = new global.Uint8Array(buffer);
 var e = new global.Uint16Array(buffer);
 var f = new global.Uint32Array(buffer);
 var g = new global.Float32Array(buffer);
 var h = new global.Float64Array(buffer);
 var i = env.STACKTOP | 0;
 var j = env.STACK_MAX | 0;
 var k = env.tempDoublePtr | 0;
 var l = env.ABORT | 0;
 var m = 0;
 var n = 0;
 var o = 0;
 var p = 0;
 var q = global.NaN, r = global.Infinity;
 var s = 0, t = 0, u = 0, v = 0, w = 0.0, x = 0, y = 0, z = 0, A = 0.0;
 var B = 0;
 var C = 0;
 var D = 0;
 var E = 0;
 var F = 0;
 var G = 0;
 var H = 0;
 var I = 0;
 var J = 0;
 var K = 0;
 var L = global.Math.floor;
 var M = global.Math.abs;
 var N = global.Math.sqrt;
 var O = global.Math.pow;
 var P = global.Math.cos;
 var Q = global.Math.sin;
 var R = global.Math.tan;
 var S = global.Math.acos;
 var T = global.Math.asin;
 var U = global.Math.atan;
 var V = global.Math.atan2;
 var W = global.Math.exp;
 var X = global.Math.log;
 var Y = global.Math.ceil;
 var Z = global.Math.imul;
 var _ = global.Math.min;
 var $ = global.Math.clz32;
 var aa = env.abort;
 var ba = env.assert;
 var ca = env._pthread_self;
 var da = env._abort;
 var ea = env.___setErrNo;
 var fa = env._sbrk;
 var ga = env._time;
 var ha = env._emscripten_memcpy_big;
 var ia = env._sysconf;
 var ja = 0.0;
 
// EMSCRIPTEN_START_FUNCS
function Ga(a) {
 a = a | 0;
 var b = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0;
 do if (a >>> 0 < 245) {
  n = a >>> 0 < 11 ? 16 : a + 11 & -8;
  g = c[16] | 0;
  if (g >>> (n >>> 3) & 3) {
   a = (g >>> (n >>> 3) & 1 ^ 1) + (n >>> 3) << 1;
   b = c[104 + (a + 2 << 2) >> 2] | 0;
   d = c[b + 8 >> 2] | 0;
   do if ((104 + (a << 2) | 0) == (d | 0)) c[16] = g & ~(1 << (g >>> (n >>> 3) & 1 ^ 1) + (n >>> 3)); else {
    if (d >>> 0 < (c[20] | 0) >>> 0) da();
    if ((c[d + 12 >> 2] | 0) == (b | 0)) {
     c[d + 12 >> 2] = 104 + (a << 2);
     c[104 + (a + 2 << 2) >> 2] = d;
     break;
    } else da();
   } while (0);
   A = (g >>> (n >>> 3) & 1 ^ 1) + (n >>> 3) << 3;
   c[b + 4 >> 2] = A | 3;
   c[b + (A | 4) >> 2] = c[b + (A | 4) >> 2] | 1;
   A = b + 8 | 0;
   return A | 0;
  }
  b = c[18] | 0;
  if (n >>> 0 > b >>> 0) {
   if (g >>> (n >>> 3)) {
    a = g >>> (n >>> 3) << (n >>> 3) & (2 << (n >>> 3) | 0 - (2 << (n >>> 3)));
    f = ((a & 0 - a) + -1 | 0) >>> (((a & 0 - a) + -1 | 0) >>> 12 & 16);
    e = f >>> (f >>> 5 & 8) >>> (f >>> (f >>> 5 & 8) >>> 2 & 4);
    e = (f >>> 5 & 8 | ((a & 0 - a) + -1 | 0) >>> 12 & 16 | f >>> (f >>> 5 & 8) >>> 2 & 4 | e >>> 1 & 2 | e >>> (e >>> 1 & 2) >>> 1 & 1) + (e >>> (e >>> 1 & 2) >>> (e >>> (e >>> 1 & 2) >>> 1 & 1)) | 0;
    f = c[104 + ((e << 1) + 2 << 2) >> 2] | 0;
    a = c[f + 8 >> 2] | 0;
    do if ((104 + (e << 1 << 2) | 0) == (a | 0)) {
     c[16] = g & ~(1 << e);
     h = b;
    } else {
     if (a >>> 0 < (c[20] | 0) >>> 0) da();
     if ((c[a + 12 >> 2] | 0) == (f | 0)) {
      c[a + 12 >> 2] = 104 + (e << 1 << 2);
      c[104 + ((e << 1) + 2 << 2) >> 2] = a;
      h = c[18] | 0;
      break;
     } else da();
    } while (0);
    c[f + 4 >> 2] = n | 3;
    c[f + (n | 4) >> 2] = (e << 3) - n | 1;
    c[f + (e << 3) >> 2] = (e << 3) - n;
    if (h) {
     d = c[21] | 0;
     b = h >>> 3;
     a = c[16] | 0;
     if (!(a & 1 << b)) {
      c[16] = a | 1 << b;
      i = 104 + ((b << 1) + 2 << 2) | 0;
      j = 104 + (b << 1 << 2) | 0;
     } else {
      a = c[104 + ((b << 1) + 2 << 2) >> 2] | 0;
      if (a >>> 0 < (c[20] | 0) >>> 0) da(); else {
       i = 104 + ((b << 1) + 2 << 2) | 0;
       j = a;
      }
     }
     c[i >> 2] = d;
     c[j + 12 >> 2] = d;
     c[d + 8 >> 2] = j;
     c[d + 12 >> 2] = 104 + (b << 1 << 2);
    }
    c[18] = (e << 3) - n;
    c[21] = f + n;
    A = f + 8 | 0;
    return A | 0;
   }
   a = c[17] | 0;
   if (!a) s = n; else {
    d = ((a & 0 - a) + -1 | 0) >>> (((a & 0 - a) + -1 | 0) >>> 12 & 16);
    e = d >>> (d >>> 5 & 8) >>> (d >>> (d >>> 5 & 8) >>> 2 & 4);
    e = c[368 + ((d >>> 5 & 8 | ((a & 0 - a) + -1 | 0) >>> 12 & 16 | d >>> (d >>> 5 & 8) >>> 2 & 4 | e >>> 1 & 2 | e >>> (e >>> 1 & 2) >>> 1 & 1) + (e >>> (e >>> 1 & 2) >>> (e >>> (e >>> 1 & 2) >>> 1 & 1)) << 2) >> 2] | 0;
    d = (c[e + 4 >> 2] & -8) - n | 0;
    b = e;
    while (1) {
     a = c[b + 16 >> 2] | 0;
     if (!a) {
      a = c[b + 20 >> 2] | 0;
      if (!a) {
       i = d;
       break;
      }
     }
     b = (c[a + 4 >> 2] & -8) - n | 0;
     A = b >>> 0 < d >>> 0;
     d = A ? b : d;
     b = a;
     e = A ? a : e;
    }
    g = c[20] | 0;
    if (e >>> 0 < g >>> 0) da();
    if (e >>> 0 >= (e + n | 0) >>> 0) da();
    h = c[e + 24 >> 2] | 0;
    a = c[e + 12 >> 2] | 0;
    do if ((a | 0) == (e | 0)) {
     a = c[e + 20 >> 2] | 0;
     if (!a) {
      a = c[e + 16 >> 2] | 0;
      if (!a) {
       k = 0;
       break;
      } else b = e + 16 | 0;
     } else b = e + 20 | 0;
     while (1) {
      d = a + 20 | 0;
      f = c[d >> 2] | 0;
      if (f) {
       a = f;
       b = d;
       continue;
      }
      d = a + 16 | 0;
      f = c[d >> 2] | 0;
      if (!f) break; else {
       a = f;
       b = d;
      }
     }
     if (b >>> 0 < g >>> 0) da(); else {
      c[b >> 2] = 0;
      k = a;
      break;
     }
    } else {
     b = c[e + 8 >> 2] | 0;
     if (b >>> 0 < g >>> 0) da();
     if ((c[b + 12 >> 2] | 0) != (e | 0)) da();
     if ((c[a + 8 >> 2] | 0) == (e | 0)) {
      c[b + 12 >> 2] = a;
      c[a + 8 >> 2] = b;
      k = a;
      break;
     } else da();
    } while (0);
    do if (h) {
     a = c[e + 28 >> 2] | 0;
     if ((e | 0) == (c[368 + (a << 2) >> 2] | 0)) {
      c[368 + (a << 2) >> 2] = k;
      if (!k) {
       c[17] = c[17] & ~(1 << a);
       break;
      }
     } else {
      if (h >>> 0 < (c[20] | 0) >>> 0) da();
      if ((c[h + 16 >> 2] | 0) == (e | 0)) c[h + 16 >> 2] = k; else c[h + 20 >> 2] = k;
      if (!k) break;
     }
     b = c[20] | 0;
     if (k >>> 0 < b >>> 0) da();
     c[k + 24 >> 2] = h;
     a = c[e + 16 >> 2] | 0;
     do if (a) if (a >>> 0 < b >>> 0) da(); else {
      c[k + 16 >> 2] = a;
      c[a + 24 >> 2] = k;
      break;
     } while (0);
     a = c[e + 20 >> 2] | 0;
     if (a) if (a >>> 0 < (c[20] | 0) >>> 0) da(); else {
      c[k + 20 >> 2] = a;
      c[a + 24 >> 2] = k;
      break;
     }
    } while (0);
    if (i >>> 0 < 16) {
     c[e + 4 >> 2] = i + n | 3;
     c[e + (i + n + 4) >> 2] = c[e + (i + n + 4) >> 2] | 1;
    } else {
     c[e + 4 >> 2] = n | 3;
     c[e + (n | 4) >> 2] = i | 1;
     c[e + (i + n) >> 2] = i;
     b = c[18] | 0;
     if (b) {
      d = c[21] | 0;
      a = c[16] | 0;
      if (!(a & 1 << (b >>> 3))) {
       c[16] = a | 1 << (b >>> 3);
       l = 104 + ((b >>> 3 << 1) + 2 << 2) | 0;
       m = 104 + (b >>> 3 << 1 << 2) | 0;
      } else {
       a = c[104 + ((b >>> 3 << 1) + 2 << 2) >> 2] | 0;
       if (a >>> 0 < (c[20] | 0) >>> 0) da(); else {
        l = 104 + ((b >>> 3 << 1) + 2 << 2) | 0;
        m = a;
       }
      }
      c[l >> 2] = d;
      c[m + 12 >> 2] = d;
      c[d + 8 >> 2] = m;
      c[d + 12 >> 2] = 104 + (b >>> 3 << 1 << 2);
     }
     c[18] = i;
     c[21] = e + n;
    }
    A = e + 8 | 0;
    return A | 0;
   }
  } else s = n;
 } else if (a >>> 0 > 4294967231) s = -1; else {
  k = a + 11 & -8;
  i = c[17] | 0;
  if (!i) s = k; else {
   if (!((a + 11 | 0) >>> 8)) h = 0; else if (k >>> 0 > 16777215) h = 31; else {
    h = (a + 11 | 0) >>> 8 << ((((a + 11 | 0) >>> 8) + 1048320 | 0) >>> 16 & 8);
    h = 14 - ((h + 520192 | 0) >>> 16 & 4 | (((a + 11 | 0) >>> 8) + 1048320 | 0) >>> 16 & 8 | ((h << ((h + 520192 | 0) >>> 16 & 4)) + 245760 | 0) >>> 16 & 2) + (h << ((h + 520192 | 0) >>> 16 & 4) << (((h << ((h + 520192 | 0) >>> 16 & 4)) + 245760 | 0) >>> 16 & 2) >>> 15) | 0;
    h = k >>> (h + 7 | 0) & 1 | h << 1;
   }
   a = c[368 + (h << 2) >> 2] | 0;
   a : do if (!a) {
    b = 0 - k | 0;
    d = 0;
    a = 0;
    r = 86;
   } else {
    b = 0 - k | 0;
    d = 0;
    f = k << ((h | 0) == 31 ? 0 : 25 - (h >>> 1) | 0);
    g = a;
    a = 0;
    while (1) {
     e = c[g + 4 >> 2] & -8;
     if ((e - k | 0) >>> 0 < b >>> 0) if ((e | 0) == (k | 0)) {
      b = e - k | 0;
      e = g;
      a = g;
      r = 90;
      break a;
     } else {
      b = e - k | 0;
      a = g;
     }
     s = c[g + 20 >> 2] | 0;
     g = c[g + 16 + (f >>> 31 << 2) >> 2] | 0;
     d = (s | 0) == 0 | (s | 0) == (g | 0) ? d : s;
     if (!g) {
      r = 86;
      break;
     } else f = f << 1;
    }
   } while (0);
   if ((r | 0) == 86) {
    if ((d | 0) == 0 & (a | 0) == 0) {
     a = 2 << h;
     if (!(i & (a | 0 - a))) {
      s = k;
      break;
     }
     s = (i & (a | 0 - a) & 0 - (i & (a | 0 - a))) + -1 | 0;
     a = s >>> (s >>> 12 & 16) >>> (s >>> (s >>> 12 & 16) >>> 5 & 8);
     d = a >>> (a >>> 2 & 4) >>> (a >>> (a >>> 2 & 4) >>> 1 & 2);
     d = c[368 + ((s >>> (s >>> 12 & 16) >>> 5 & 8 | s >>> 12 & 16 | a >>> 2 & 4 | a >>> (a >>> 2 & 4) >>> 1 & 2 | d >>> 1 & 1) + (d >>> (d >>> 1 & 1)) << 2) >> 2] | 0;
     a = 0;
    }
    if (!d) {
     i = b;
     j = a;
    } else {
     e = d;
     r = 90;
    }
   }
   if ((r | 0) == 90) while (1) {
    r = 0;
    s = (c[e + 4 >> 2] & -8) - k | 0;
    d = s >>> 0 < b >>> 0;
    b = d ? s : b;
    a = d ? e : a;
    d = c[e + 16 >> 2] | 0;
    if (d) {
     e = d;
     r = 90;
     continue;
    }
    e = c[e + 20 >> 2] | 0;
    if (!e) {
     i = b;
     j = a;
     break;
    } else r = 90;
   }
   if (!j) s = k; else if (i >>> 0 < ((c[18] | 0) - k | 0) >>> 0) {
    f = c[20] | 0;
    if (j >>> 0 < f >>> 0) da();
    h = j + k | 0;
    if (j >>> 0 >= h >>> 0) da();
    g = c[j + 24 >> 2] | 0;
    a = c[j + 12 >> 2] | 0;
    do if ((a | 0) == (j | 0)) {
     b = j + 20 | 0;
     a = c[b >> 2] | 0;
     if (!a) {
      b = j + 16 | 0;
      a = c[b >> 2] | 0;
      if (!a) {
       n = 0;
       break;
      }
     }
     while (1) {
      d = a + 20 | 0;
      e = c[d >> 2] | 0;
      if (e) {
       a = e;
       b = d;
       continue;
      }
      d = a + 16 | 0;
      e = c[d >> 2] | 0;
      if (!e) break; else {
       a = e;
       b = d;
      }
     }
     if (b >>> 0 < f >>> 0) da(); else {
      c[b >> 2] = 0;
      n = a;
      break;
     }
    } else {
     b = c[j + 8 >> 2] | 0;
     if (b >>> 0 < f >>> 0) da();
     if ((c[b + 12 >> 2] | 0) != (j | 0)) da();
     if ((c[a + 8 >> 2] | 0) == (j | 0)) {
      c[b + 12 >> 2] = a;
      c[a + 8 >> 2] = b;
      n = a;
      break;
     } else da();
    } while (0);
    do if (g) {
     a = c[j + 28 >> 2] | 0;
     if ((j | 0) == (c[368 + (a << 2) >> 2] | 0)) {
      c[368 + (a << 2) >> 2] = n;
      if (!n) {
       c[17] = c[17] & ~(1 << a);
       break;
      }
     } else {
      if (g >>> 0 < (c[20] | 0) >>> 0) da();
      if ((c[g + 16 >> 2] | 0) == (j | 0)) c[g + 16 >> 2] = n; else c[g + 20 >> 2] = n;
      if (!n) break;
     }
     b = c[20] | 0;
     if (n >>> 0 < b >>> 0) da();
     c[n + 24 >> 2] = g;
     a = c[j + 16 >> 2] | 0;
     do if (a) if (a >>> 0 < b >>> 0) da(); else {
      c[n + 16 >> 2] = a;
      c[a + 24 >> 2] = n;
      break;
     } while (0);
     a = c[j + 20 >> 2] | 0;
     if (a) if (a >>> 0 < (c[20] | 0) >>> 0) da(); else {
      c[n + 20 >> 2] = a;
      c[a + 24 >> 2] = n;
      break;
     }
    } while (0);
    b : do if (i >>> 0 < 16) {
     A = i + k | 0;
     c[j + 4 >> 2] = A | 3;
     A = j + (A + 4) | 0;
     c[A >> 2] = c[A >> 2] | 1;
    } else {
     c[j + 4 >> 2] = k | 3;
     c[j + (k | 4) >> 2] = i | 1;
     c[j + (i + k) >> 2] = i;
     b = i >>> 3;
     if (i >>> 0 < 256) {
      a = c[16] | 0;
      if (!(a & 1 << b)) {
       c[16] = a | 1 << b;
       o = 104 + ((b << 1) + 2 << 2) | 0;
       p = 104 + (b << 1 << 2) | 0;
      } else {
       a = c[104 + ((b << 1) + 2 << 2) >> 2] | 0;
       if (a >>> 0 < (c[20] | 0) >>> 0) da(); else {
        o = 104 + ((b << 1) + 2 << 2) | 0;
        p = a;
       }
      }
      c[o >> 2] = h;
      c[p + 12 >> 2] = h;
      c[j + (k + 8) >> 2] = p;
      c[j + (k + 12) >> 2] = 104 + (b << 1 << 2);
      break;
     }
     a = i >>> 8;
     if (!a) e = 0; else if (i >>> 0 > 16777215) e = 31; else {
      e = a << ((a + 1048320 | 0) >>> 16 & 8) << (((a << ((a + 1048320 | 0) >>> 16 & 8)) + 520192 | 0) >>> 16 & 4);
      e = 14 - (((a << ((a + 1048320 | 0) >>> 16 & 8)) + 520192 | 0) >>> 16 & 4 | (a + 1048320 | 0) >>> 16 & 8 | (e + 245760 | 0) >>> 16 & 2) + (e << ((e + 245760 | 0) >>> 16 & 2) >>> 15) | 0;
      e = i >>> (e + 7 | 0) & 1 | e << 1;
     }
     a = 368 + (e << 2) | 0;
     c[j + (k + 28) >> 2] = e;
     c[j + (k + 20) >> 2] = 0;
     c[j + (k + 16) >> 2] = 0;
     b = c[17] | 0;
     d = 1 << e;
     if (!(b & d)) {
      c[17] = b | d;
      c[a >> 2] = h;
      c[j + (k + 24) >> 2] = a;
      c[j + (k + 12) >> 2] = h;
      c[j + (k + 8) >> 2] = h;
      break;
     }
     a = c[a >> 2] | 0;
     c : do if ((c[a + 4 >> 2] & -8 | 0) == (i | 0)) q = a; else {
      e = i << ((e | 0) == 31 ? 0 : 25 - (e >>> 1) | 0);
      while (1) {
       d = a + 16 + (e >>> 31 << 2) | 0;
       b = c[d >> 2] | 0;
       if (!b) break;
       if ((c[b + 4 >> 2] & -8 | 0) == (i | 0)) {
        q = b;
        break c;
       } else {
        e = e << 1;
        a = b;
       }
      }
      if (d >>> 0 < (c[20] | 0) >>> 0) da(); else {
       c[d >> 2] = h;
       c[j + (k + 24) >> 2] = a;
       c[j + (k + 12) >> 2] = h;
       c[j + (k + 8) >> 2] = h;
       break b;
      }
     } while (0);
     a = q + 8 | 0;
     b = c[a >> 2] | 0;
     A = c[20] | 0;
     if (b >>> 0 >= A >>> 0 & q >>> 0 >= A >>> 0) {
      c[b + 12 >> 2] = h;
      c[a >> 2] = h;
      c[j + (k + 8) >> 2] = b;
      c[j + (k + 12) >> 2] = q;
      c[j + (k + 24) >> 2] = 0;
      break;
     } else da();
    } while (0);
    A = j + 8 | 0;
    return A | 0;
   } else s = k;
  }
 } while (0);
 d = c[18] | 0;
 if (d >>> 0 >= s >>> 0) {
  a = d - s | 0;
  b = c[21] | 0;
  if (a >>> 0 > 15) {
   c[21] = b + s;
   c[18] = a;
   c[b + (s + 4) >> 2] = a | 1;
   c[b + d >> 2] = a;
   c[b + 4 >> 2] = s | 3;
  } else {
   c[18] = 0;
   c[21] = 0;
   c[b + 4 >> 2] = d | 3;
   c[b + (d + 4) >> 2] = c[b + (d + 4) >> 2] | 1;
  }
  A = b + 8 | 0;
  return A | 0;
 }
 a = c[19] | 0;
 if (a >>> 0 > s >>> 0) {
  z = a - s | 0;
  c[19] = z;
  A = c[22] | 0;
  c[22] = A + s;
  c[A + (s + 4) >> 2] = z | 1;
  c[A + 4 >> 2] = s | 3;
  A = A + 8 | 0;
  return A | 0;
 }
 do if (!(c[134] | 0)) {
  a = ia(30) | 0;
  if (!(a + -1 & a)) {
   c[136] = a;
   c[135] = a;
   c[137] = -1;
   c[138] = -1;
   c[139] = 0;
   c[127] = 0;
   c[134] = (ga(0) | 0) & -16 ^ 1431655768;
   break;
  } else da();
 } while (0);
 g = s + 48 | 0;
 e = c[136] | 0;
 h = s + 47 | 0;
 i = e + h & 0 - e;
 if (i >>> 0 <= s >>> 0) {
  A = 0;
  return A | 0;
 }
 a = c[126] | 0;
 if (a) {
  q = c[124] | 0;
  if ((q + i | 0) >>> 0 <= q >>> 0 | (q + i | 0) >>> 0 > a >>> 0) {
   A = 0;
   return A | 0;
  }
 }
 d : do if (!(c[127] & 4)) {
  b = c[22] | 0;
  e : do if (!b) r = 174; else {
   a = 512;
   while (1) {
    d = c[a >> 2] | 0;
    if (d >>> 0 <= b >>> 0) {
     f = a + 4 | 0;
     if ((d + (c[f >> 2] | 0) | 0) >>> 0 > b >>> 0) break;
    }
    a = c[a + 8 >> 2] | 0;
    if (!a) {
     r = 174;
     break e;
    }
   }
   b = e + h - (c[19] | 0) & 0 - e;
   if (b >>> 0 < 2147483647) {
    d = fa(b | 0) | 0;
    q = (d | 0) == ((c[a >> 2] | 0) + (c[f >> 2] | 0) | 0);
    a = q ? b : 0;
    if (q) {
     if ((d | 0) != (-1 | 0)) {
      q = d;
      p = a;
      r = 194;
      break d;
     }
    } else {
     f = d;
     r = 184;
    }
   } else a = 0;
  } while (0);
  do if ((r | 0) == 174) {
   f = fa(0) | 0;
   if ((f | 0) == (-1 | 0)) a = 0; else {
    a = c[135] | 0;
    if (!(a + -1 & f)) b = i; else b = i - f + (a + -1 + f & 0 - a) | 0;
    a = c[124] | 0;
    d = a + b | 0;
    if (b >>> 0 > s >>> 0 & b >>> 0 < 2147483647) {
     e = c[126] | 0;
     if (e) if (d >>> 0 <= a >>> 0 | d >>> 0 > e >>> 0) {
      a = 0;
      break;
     }
     d = fa(b | 0) | 0;
     a = (d | 0) == (f | 0) ? b : 0;
     if ((d | 0) == (f | 0)) {
      q = f;
      p = a;
      r = 194;
      break d;
     } else {
      f = d;
      r = 184;
     }
    } else a = 0;
   }
  } while (0);
  f : do if ((r | 0) == 184) {
   e = 0 - b | 0;
   do if (g >>> 0 > b >>> 0 & (b >>> 0 < 2147483647 & (f | 0) != (-1 | 0))) {
    d = c[136] | 0;
    d = h - b + d & 0 - d;
    if (d >>> 0 < 2147483647) if ((fa(d | 0) | 0) == (-1 | 0)) {
     fa(e | 0) | 0;
     break f;
    } else {
     b = d + b | 0;
     break;
    }
   } while (0);
   if ((f | 0) != (-1 | 0)) {
    q = f;
    p = b;
    r = 194;
    break d;
   }
  } while (0);
  c[127] = c[127] | 4;
  r = 191;
 } else {
  a = 0;
  r = 191;
 } while (0);
 if ((r | 0) == 191) if (i >>> 0 < 2147483647) {
  b = fa(i | 0) | 0;
  d = fa(0) | 0;
  if (b >>> 0 < d >>> 0 & ((b | 0) != (-1 | 0) & (d | 0) != (-1 | 0))) {
   e = (d - b | 0) >>> 0 > (s + 40 | 0) >>> 0;
   if (e) {
    q = b;
    p = e ? d - b | 0 : a;
    r = 194;
   }
  }
 }
 if ((r | 0) == 194) {
  a = (c[124] | 0) + p | 0;
  c[124] = a;
  if (a >>> 0 > (c[125] | 0) >>> 0) c[125] = a;
  g = c[22] | 0;
  g : do if (!g) {
   A = c[20] | 0;
   if ((A | 0) == 0 | q >>> 0 < A >>> 0) c[20] = q;
   c[128] = q;
   c[129] = p;
   c[131] = 0;
   c[25] = c[134];
   c[24] = -1;
   a = 0;
   do {
    A = a << 1;
    c[104 + (A + 3 << 2) >> 2] = 104 + (A << 2);
    c[104 + (A + 2 << 2) >> 2] = 104 + (A << 2);
    a = a + 1 | 0;
   } while ((a | 0) != 32);
   A = q + 8 | 0;
   A = (A & 7 | 0) == 0 ? 0 : 0 - A & 7;
   z = p + -40 - A | 0;
   c[22] = q + A;
   c[19] = z;
   c[q + (A + 4) >> 2] = z | 1;
   c[q + (p + -36) >> 2] = 40;
   c[23] = c[138];
  } else {
   a = 512;
   do {
    b = c[a >> 2] | 0;
    d = a + 4 | 0;
    e = c[d >> 2] | 0;
    if ((q | 0) == (b + e | 0)) {
     r = 204;
     break;
    }
    a = c[a + 8 >> 2] | 0;
   } while ((a | 0) != 0);
   if ((r | 0) == 204) if (!(c[a + 12 >> 2] & 8)) if (g >>> 0 < q >>> 0 & g >>> 0 >= b >>> 0) {
    c[d >> 2] = e + p;
    A = (c[19] | 0) + p | 0;
    z = (g + 8 & 7 | 0) == 0 ? 0 : 0 - (g + 8) & 7;
    c[22] = g + z;
    c[19] = A - z;
    c[g + (z + 4) >> 2] = A - z | 1;
    c[g + (A + 4) >> 2] = 40;
    c[23] = c[138];
    break;
   }
   a = c[20] | 0;
   if (q >>> 0 < a >>> 0) {
    c[20] = q;
    l = q;
   } else l = a;
   a = q + p | 0;
   d = 512;
   while (1) {
    if ((c[d >> 2] | 0) == (a | 0)) {
     b = d;
     a = d;
     r = 212;
     break;
    }
    d = c[d + 8 >> 2] | 0;
    if (!d) {
     a = 512;
     break;
    }
   }
   if ((r | 0) == 212) if (!(c[a + 12 >> 2] & 8)) {
    c[b >> 2] = q;
    c[a + 4 >> 2] = (c[a + 4 >> 2] | 0) + p;
    n = q + 8 | 0;
    n = (n & 7 | 0) == 0 ? 0 : 0 - n & 7;
    j = q + (p + 8) | 0;
    j = (j & 7 | 0) == 0 ? 0 : 0 - j & 7;
    a = q + (j + p) | 0;
    m = n + s | 0;
    o = q + m | 0;
    k = a - (q + n) - s | 0;
    c[q + (n + 4) >> 2] = s | 3;
    h : do if ((a | 0) == (g | 0)) {
     A = (c[19] | 0) + k | 0;
     c[19] = A;
     c[22] = o;
     c[q + (m + 4) >> 2] = A | 1;
    } else {
     if ((a | 0) == (c[21] | 0)) {
      A = (c[18] | 0) + k | 0;
      c[18] = A;
      c[21] = o;
      c[q + (m + 4) >> 2] = A | 1;
      c[q + (A + m) >> 2] = A;
      break;
     }
     h = p + 4 | 0;
     i = c[q + (h + j) >> 2] | 0;
     if ((i & 3 | 0) == 1) {
      i : do if (i >>> 0 < 256) {
       b = c[q + ((j | 8) + p) >> 2] | 0;
       d = c[q + (p + 12 + j) >> 2] | 0;
       do if ((b | 0) != (104 + (i >>> 3 << 1 << 2) | 0)) {
        if (b >>> 0 < l >>> 0) da();
        if ((c[b + 12 >> 2] | 0) == (a | 0)) break;
        da();
       } while (0);
       if ((d | 0) == (b | 0)) {
        c[16] = c[16] & ~(1 << (i >>> 3));
        break;
       }
       do if ((d | 0) == (104 + (i >>> 3 << 1 << 2) | 0)) v = d + 8 | 0; else {
        if (d >>> 0 < l >>> 0) da();
        if ((c[d + 8 >> 2] | 0) == (a | 0)) {
         v = d + 8 | 0;
         break;
        }
        da();
       } while (0);
       c[b + 12 >> 2] = d;
       c[v >> 2] = b;
      } else {
       g = c[q + ((j | 24) + p) >> 2] | 0;
       b = c[q + (p + 12 + j) >> 2] | 0;
       do if ((b | 0) == (a | 0)) {
        d = q + (h + (j | 16)) | 0;
        b = c[d >> 2] | 0;
        if (!b) {
         d = q + ((j | 16) + p) | 0;
         b = c[d >> 2] | 0;
         if (!b) {
          x = 0;
          break;
         }
        }
        while (1) {
         e = b + 20 | 0;
         f = c[e >> 2] | 0;
         if (f) {
          b = f;
          d = e;
          continue;
         }
         e = b + 16 | 0;
         f = c[e >> 2] | 0;
         if (!f) break; else {
          b = f;
          d = e;
         }
        }
        if (d >>> 0 < l >>> 0) da(); else {
         c[d >> 2] = 0;
         x = b;
         break;
        }
       } else {
        d = c[q + ((j | 8) + p) >> 2] | 0;
        if (d >>> 0 < l >>> 0) da();
        if ((c[d + 12 >> 2] | 0) != (a | 0)) da();
        if ((c[b + 8 >> 2] | 0) == (a | 0)) {
         c[d + 12 >> 2] = b;
         c[b + 8 >> 2] = d;
         x = b;
         break;
        } else da();
       } while (0);
       if (!g) break;
       b = c[q + (p + 28 + j) >> 2] | 0;
       do if ((a | 0) == (c[368 + (b << 2) >> 2] | 0)) {
        c[368 + (b << 2) >> 2] = x;
        if (x) break;
        c[17] = c[17] & ~(1 << b);
        break i;
       } else {
        if (g >>> 0 < (c[20] | 0) >>> 0) da();
        if ((c[g + 16 >> 2] | 0) == (a | 0)) c[g + 16 >> 2] = x; else c[g + 20 >> 2] = x;
        if (!x) break i;
       } while (0);
       b = c[20] | 0;
       if (x >>> 0 < b >>> 0) da();
       c[x + 24 >> 2] = g;
       a = c[q + ((j | 16) + p) >> 2] | 0;
       do if (a) if (a >>> 0 < b >>> 0) da(); else {
        c[x + 16 >> 2] = a;
        c[a + 24 >> 2] = x;
        break;
       } while (0);
       a = c[q + (h + (j | 16)) >> 2] | 0;
       if (!a) break;
       if (a >>> 0 < (c[20] | 0) >>> 0) da(); else {
        c[x + 20 >> 2] = a;
        c[a + 24 >> 2] = x;
        break;
       }
      } while (0);
      a = q + ((i & -8 | j) + p) | 0;
      f = (i & -8) + k | 0;
     } else f = k;
     b = a + 4 | 0;
     c[b >> 2] = c[b >> 2] & -2;
     c[q + (m + 4) >> 2] = f | 1;
     c[q + (f + m) >> 2] = f;
     b = f >>> 3;
     if (f >>> 0 < 256) {
      a = c[16] | 0;
      do if (!(a & 1 << b)) {
       c[16] = a | 1 << b;
       y = 104 + ((b << 1) + 2 << 2) | 0;
       z = 104 + (b << 1 << 2) | 0;
      } else {
       a = c[104 + ((b << 1) + 2 << 2) >> 2] | 0;
       if (a >>> 0 >= (c[20] | 0) >>> 0) {
        y = 104 + ((b << 1) + 2 << 2) | 0;
        z = a;
        break;
       }
       da();
      } while (0);
      c[y >> 2] = o;
      c[z + 12 >> 2] = o;
      c[q + (m + 8) >> 2] = z;
      c[q + (m + 12) >> 2] = 104 + (b << 1 << 2);
      break;
     }
     a = f >>> 8;
     do if (!a) e = 0; else {
      if (f >>> 0 > 16777215) {
       e = 31;
       break;
      }
      e = a << ((a + 1048320 | 0) >>> 16 & 8) << (((a << ((a + 1048320 | 0) >>> 16 & 8)) + 520192 | 0) >>> 16 & 4);
      e = 14 - (((a << ((a + 1048320 | 0) >>> 16 & 8)) + 520192 | 0) >>> 16 & 4 | (a + 1048320 | 0) >>> 16 & 8 | (e + 245760 | 0) >>> 16 & 2) + (e << ((e + 245760 | 0) >>> 16 & 2) >>> 15) | 0;
      e = f >>> (e + 7 | 0) & 1 | e << 1;
     } while (0);
     a = 368 + (e << 2) | 0;
     c[q + (m + 28) >> 2] = e;
     c[q + (m + 20) >> 2] = 0;
     c[q + (m + 16) >> 2] = 0;
     b = c[17] | 0;
     d = 1 << e;
     if (!(b & d)) {
      c[17] = b | d;
      c[a >> 2] = o;
      c[q + (m + 24) >> 2] = a;
      c[q + (m + 12) >> 2] = o;
      c[q + (m + 8) >> 2] = o;
      break;
     }
     a = c[a >> 2] | 0;
     j : do if ((c[a + 4 >> 2] & -8 | 0) == (f | 0)) A = a; else {
      e = f << ((e | 0) == 31 ? 0 : 25 - (e >>> 1) | 0);
      while (1) {
       d = a + 16 + (e >>> 31 << 2) | 0;
       b = c[d >> 2] | 0;
       if (!b) break;
       if ((c[b + 4 >> 2] & -8 | 0) == (f | 0)) {
        A = b;
        break j;
       } else {
        e = e << 1;
        a = b;
       }
      }
      if (d >>> 0 < (c[20] | 0) >>> 0) da(); else {
       c[d >> 2] = o;
       c[q + (m + 24) >> 2] = a;
       c[q + (m + 12) >> 2] = o;
       c[q + (m + 8) >> 2] = o;
       break h;
      }
     } while (0);
     a = A + 8 | 0;
     b = c[a >> 2] | 0;
     z = c[20] | 0;
     if (b >>> 0 >= z >>> 0 & A >>> 0 >= z >>> 0) {
      c[b + 12 >> 2] = o;
      c[a >> 2] = o;
      c[q + (m + 8) >> 2] = b;
      c[q + (m + 12) >> 2] = A;
      c[q + (m + 24) >> 2] = 0;
      break;
     } else da();
    } while (0);
    A = q + (n | 8) | 0;
    return A | 0;
   } else a = 512;
   while (1) {
    b = c[a >> 2] | 0;
    if (b >>> 0 <= g >>> 0) {
     d = c[a + 4 >> 2] | 0;
     if ((b + d | 0) >>> 0 > g >>> 0) break;
    }
    a = c[a + 8 >> 2] | 0;
   }
   f = b + (d + -47 + ((b + (d + -39) & 7 | 0) == 0 ? 0 : 0 - (b + (d + -39)) & 7)) | 0;
   f = f >>> 0 < (g + 16 | 0) >>> 0 ? g : f;
   A = q + 8 | 0;
   A = (A & 7 | 0) == 0 ? 0 : 0 - A & 7;
   z = p + -40 - A | 0;
   c[22] = q + A;
   c[19] = z;
   c[q + (A + 4) >> 2] = z | 1;
   c[q + (p + -36) >> 2] = 40;
   c[23] = c[138];
   c[f + 4 >> 2] = 27;
   c[f + 8 >> 2] = c[128];
   c[f + 8 + 4 >> 2] = c[129];
   c[f + 8 + 8 >> 2] = c[130];
   c[f + 8 + 12 >> 2] = c[131];
   c[128] = q;
   c[129] = p;
   c[131] = 0;
   c[130] = f + 8;
   c[f + 28 >> 2] = 7;
   if ((f + 32 | 0) >>> 0 < (b + d | 0) >>> 0) {
    a = f + 28 | 0;
    do {
     A = a;
     a = a + 4 | 0;
     c[a >> 2] = 7;
    } while ((A + 8 | 0) >>> 0 < (b + d | 0) >>> 0);
   }
   if ((f | 0) != (g | 0)) {
    c[f + 4 >> 2] = c[f + 4 >> 2] & -2;
    c[g + 4 >> 2] = f - g | 1;
    c[f >> 2] = f - g;
    if ((f - g | 0) >>> 0 < 256) {
     a = c[16] | 0;
     if (!(a & 1 << ((f - g | 0) >>> 3))) {
      c[16] = a | 1 << ((f - g | 0) >>> 3);
      t = 104 + (((f - g | 0) >>> 3 << 1) + 2 << 2) | 0;
      u = 104 + ((f - g | 0) >>> 3 << 1 << 2) | 0;
     } else {
      a = c[104 + (((f - g | 0) >>> 3 << 1) + 2 << 2) >> 2] | 0;
      if (a >>> 0 < (c[20] | 0) >>> 0) da(); else {
       t = 104 + (((f - g | 0) >>> 3 << 1) + 2 << 2) | 0;
       u = a;
      }
     }
     c[t >> 2] = g;
     c[u + 12 >> 2] = g;
     c[g + 8 >> 2] = u;
     c[g + 12 >> 2] = 104 + ((f - g | 0) >>> 3 << 1 << 2);
     break;
    }
    if (!((f - g | 0) >>> 8)) e = 0; else if ((f - g | 0) >>> 0 > 16777215) e = 31; else {
     e = (f - g | 0) >>> 8 << ((((f - g | 0) >>> 8) + 1048320 | 0) >>> 16 & 8);
     e = 14 - ((e + 520192 | 0) >>> 16 & 4 | (((f - g | 0) >>> 8) + 1048320 | 0) >>> 16 & 8 | ((e << ((e + 520192 | 0) >>> 16 & 4)) + 245760 | 0) >>> 16 & 2) + (e << ((e + 520192 | 0) >>> 16 & 4) << (((e << ((e + 520192 | 0) >>> 16 & 4)) + 245760 | 0) >>> 16 & 2) >>> 15) | 0;
     e = (f - g | 0) >>> (e + 7 | 0) & 1 | e << 1;
    }
    a = 368 + (e << 2) | 0;
    c[g + 28 >> 2] = e;
    c[g + 20 >> 2] = 0;
    c[g + 16 >> 2] = 0;
    b = c[17] | 0;
    d = 1 << e;
    if (!(b & d)) {
     c[17] = b | d;
     c[a >> 2] = g;
     c[g + 24 >> 2] = a;
     c[g + 12 >> 2] = g;
     c[g + 8 >> 2] = g;
     break;
    }
    a = c[a >> 2] | 0;
    k : do if ((c[a + 4 >> 2] & -8 | 0) == (f - g | 0)) w = a; else {
     e = f - g << ((e | 0) == 31 ? 0 : 25 - (e >>> 1) | 0);
     while (1) {
      d = a + 16 + (e >>> 31 << 2) | 0;
      b = c[d >> 2] | 0;
      if (!b) break;
      if ((c[b + 4 >> 2] & -8 | 0) == (f - g | 0)) {
       w = b;
       break k;
      } else {
       e = e << 1;
       a = b;
      }
     }
     if (d >>> 0 < (c[20] | 0) >>> 0) da(); else {
      c[d >> 2] = g;
      c[g + 24 >> 2] = a;
      c[g + 12 >> 2] = g;
      c[g + 8 >> 2] = g;
      break g;
     }
    } while (0);
    a = w + 8 | 0;
    b = c[a >> 2] | 0;
    A = c[20] | 0;
    if (b >>> 0 >= A >>> 0 & w >>> 0 >= A >>> 0) {
     c[b + 12 >> 2] = g;
     c[a >> 2] = g;
     c[g + 8 >> 2] = b;
     c[g + 12 >> 2] = w;
     c[g + 24 >> 2] = 0;
     break;
    } else da();
   }
  } while (0);
  a = c[19] | 0;
  if (a >>> 0 > s >>> 0) {
   z = a - s | 0;
   c[19] = z;
   A = c[22] | 0;
   c[22] = A + s;
   c[A + (s + 4) >> 2] = z | 1;
   c[A + 4 >> 2] = s | 3;
   A = A + 8 | 0;
   return A | 0;
  }
 }
 c[(Fa() | 0) >> 2] = 12;
 A = 0;
 return A | 0;
}
function Ha(a) {
 a = a | 0;
 var b = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0;
 if (!a) return;
 i = c[20] | 0;
 if ((a + -8 | 0) >>> 0 < i >>> 0) da();
 p = c[a + -4 >> 2] | 0;
 if ((p & 3 | 0) == 1) da();
 o = a + ((p & -8) + -8) | 0;
 do if (!(p & 1)) {
  k = c[a + -8 >> 2] | 0;
  if (!(p & 3)) return;
  l = a + (-8 - k) | 0;
  m = k + (p & -8) | 0;
  if (l >>> 0 < i >>> 0) da();
  if ((l | 0) == (c[21] | 0)) {
   b = c[a + ((p & -8) + -4) >> 2] | 0;
   if ((b & 3 | 0) != 3) {
    t = l;
    g = m;
    break;
   }
   c[18] = m;
   c[a + ((p & -8) + -4) >> 2] = b & -2;
   c[a + (-8 - k + 4) >> 2] = m | 1;
   c[o >> 2] = m;
   return;
  }
  if (k >>> 0 < 256) {
   b = c[a + (-8 - k + 8) >> 2] | 0;
   d = c[a + (-8 - k + 12) >> 2] | 0;
   if ((b | 0) != (104 + (k >>> 3 << 1 << 2) | 0)) {
    if (b >>> 0 < i >>> 0) da();
    if ((c[b + 12 >> 2] | 0) != (l | 0)) da();
   }
   if ((d | 0) == (b | 0)) {
    c[16] = c[16] & ~(1 << (k >>> 3));
    t = l;
    g = m;
    break;
   }
   if ((d | 0) == (104 + (k >>> 3 << 1 << 2) | 0)) e = d + 8 | 0; else {
    if (d >>> 0 < i >>> 0) da();
    if ((c[d + 8 >> 2] | 0) == (l | 0)) e = d + 8 | 0; else da();
   }
   c[b + 12 >> 2] = d;
   c[e >> 2] = b;
   t = l;
   g = m;
   break;
  }
  h = c[a + (-8 - k + 24) >> 2] | 0;
  b = c[a + (-8 - k + 12) >> 2] | 0;
  do if ((b | 0) == (l | 0)) {
   b = c[a + (-8 - k + 20) >> 2] | 0;
   if (!b) {
    b = c[a + (-8 - k + 16) >> 2] | 0;
    if (!b) {
     j = 0;
     break;
    } else d = a + (-8 - k + 16) | 0;
   } else d = a + (-8 - k + 20) | 0;
   while (1) {
    e = b + 20 | 0;
    f = c[e >> 2] | 0;
    if (f) {
     b = f;
     d = e;
     continue;
    }
    e = b + 16 | 0;
    f = c[e >> 2] | 0;
    if (!f) break; else {
     b = f;
     d = e;
    }
   }
   if (d >>> 0 < i >>> 0) da(); else {
    c[d >> 2] = 0;
    j = b;
    break;
   }
  } else {
   d = c[a + (-8 - k + 8) >> 2] | 0;
   if (d >>> 0 < i >>> 0) da();
   if ((c[d + 12 >> 2] | 0) != (l | 0)) da();
   if ((c[b + 8 >> 2] | 0) == (l | 0)) {
    c[d + 12 >> 2] = b;
    c[b + 8 >> 2] = d;
    j = b;
    break;
   } else da();
  } while (0);
  if (!h) {
   t = l;
   g = m;
  } else {
   b = c[a + (-8 - k + 28) >> 2] | 0;
   if ((l | 0) == (c[368 + (b << 2) >> 2] | 0)) {
    c[368 + (b << 2) >> 2] = j;
    if (!j) {
     c[17] = c[17] & ~(1 << b);
     t = l;
     g = m;
     break;
    }
   } else {
    if (h >>> 0 < (c[20] | 0) >>> 0) da();
    if ((c[h + 16 >> 2] | 0) == (l | 0)) c[h + 16 >> 2] = j; else c[h + 20 >> 2] = j;
    if (!j) {
     t = l;
     g = m;
     break;
    }
   }
   d = c[20] | 0;
   if (j >>> 0 < d >>> 0) da();
   c[j + 24 >> 2] = h;
   b = c[a + (-8 - k + 16) >> 2] | 0;
   do if (b) if (b >>> 0 < d >>> 0) da(); else {
    c[j + 16 >> 2] = b;
    c[b + 24 >> 2] = j;
    break;
   } while (0);
   b = c[a + (-8 - k + 20) >> 2] | 0;
   if (!b) {
    t = l;
    g = m;
   } else if (b >>> 0 < (c[20] | 0) >>> 0) da(); else {
    c[j + 20 >> 2] = b;
    c[b + 24 >> 2] = j;
    t = l;
    g = m;
    break;
   }
  }
 } else {
  t = a + -8 | 0;
  g = p & -8;
 } while (0);
 if (t >>> 0 >= o >>> 0) da();
 e = c[a + ((p & -8) + -4) >> 2] | 0;
 if (!(e & 1)) da();
 if (!(e & 2)) {
  if ((o | 0) == (c[22] | 0)) {
   u = (c[19] | 0) + g | 0;
   c[19] = u;
   c[22] = t;
   c[t + 4 >> 2] = u | 1;
   if ((t | 0) != (c[21] | 0)) return;
   c[21] = 0;
   c[18] = 0;
   return;
  }
  if ((o | 0) == (c[21] | 0)) {
   u = (c[18] | 0) + g | 0;
   c[18] = u;
   c[21] = t;
   c[t + 4 >> 2] = u | 1;
   c[t + u >> 2] = u;
   return;
  }
  g = (e & -8) + g | 0;
  do if (e >>> 0 < 256) {
   d = c[a + (p & -8) >> 2] | 0;
   b = c[a + (p & -8 | 4) >> 2] | 0;
   if ((d | 0) != (104 + (e >>> 3 << 1 << 2) | 0)) {
    if (d >>> 0 < (c[20] | 0) >>> 0) da();
    if ((c[d + 12 >> 2] | 0) != (o | 0)) da();
   }
   if ((b | 0) == (d | 0)) {
    c[16] = c[16] & ~(1 << (e >>> 3));
    break;
   }
   if ((b | 0) == (104 + (e >>> 3 << 1 << 2) | 0)) n = b + 8 | 0; else {
    if (b >>> 0 < (c[20] | 0) >>> 0) da();
    if ((c[b + 8 >> 2] | 0) == (o | 0)) n = b + 8 | 0; else da();
   }
   c[d + 12 >> 2] = b;
   c[n >> 2] = d;
  } else {
   h = c[a + ((p & -8) + 16) >> 2] | 0;
   b = c[a + (p & -8 | 4) >> 2] | 0;
   do if ((b | 0) == (o | 0)) {
    b = c[a + ((p & -8) + 12) >> 2] | 0;
    if (!b) {
     b = c[a + ((p & -8) + 8) >> 2] | 0;
     if (!b) {
      q = 0;
      break;
     } else d = a + ((p & -8) + 8) | 0;
    } else d = a + ((p & -8) + 12) | 0;
    while (1) {
     e = b + 20 | 0;
     f = c[e >> 2] | 0;
     if (f) {
      b = f;
      d = e;
      continue;
     }
     e = b + 16 | 0;
     f = c[e >> 2] | 0;
     if (!f) break; else {
      b = f;
      d = e;
     }
    }
    if (d >>> 0 < (c[20] | 0) >>> 0) da(); else {
     c[d >> 2] = 0;
     q = b;
     break;
    }
   } else {
    d = c[a + (p & -8) >> 2] | 0;
    if (d >>> 0 < (c[20] | 0) >>> 0) da();
    if ((c[d + 12 >> 2] | 0) != (o | 0)) da();
    if ((c[b + 8 >> 2] | 0) == (o | 0)) {
     c[d + 12 >> 2] = b;
     c[b + 8 >> 2] = d;
     q = b;
     break;
    } else da();
   } while (0);
   if (h) {
    b = c[a + ((p & -8) + 20) >> 2] | 0;
    if ((o | 0) == (c[368 + (b << 2) >> 2] | 0)) {
     c[368 + (b << 2) >> 2] = q;
     if (!q) {
      c[17] = c[17] & ~(1 << b);
      break;
     }
    } else {
     if (h >>> 0 < (c[20] | 0) >>> 0) da();
     if ((c[h + 16 >> 2] | 0) == (o | 0)) c[h + 16 >> 2] = q; else c[h + 20 >> 2] = q;
     if (!q) break;
    }
    d = c[20] | 0;
    if (q >>> 0 < d >>> 0) da();
    c[q + 24 >> 2] = h;
    b = c[a + ((p & -8) + 8) >> 2] | 0;
    do if (b) if (b >>> 0 < d >>> 0) da(); else {
     c[q + 16 >> 2] = b;
     c[b + 24 >> 2] = q;
     break;
    } while (0);
    b = c[a + ((p & -8) + 12) >> 2] | 0;
    if (b) if (b >>> 0 < (c[20] | 0) >>> 0) da(); else {
     c[q + 20 >> 2] = b;
     c[b + 24 >> 2] = q;
     break;
    }
   }
  } while (0);
  c[t + 4 >> 2] = g | 1;
  c[t + g >> 2] = g;
  if ((t | 0) == (c[21] | 0)) {
   c[18] = g;
   return;
  }
 } else {
  c[a + ((p & -8) + -4) >> 2] = e & -2;
  c[t + 4 >> 2] = g | 1;
  c[t + g >> 2] = g;
 }
 d = g >>> 3;
 if (g >>> 0 < 256) {
  b = c[16] | 0;
  if (!(b & 1 << d)) {
   c[16] = b | 1 << d;
   r = 104 + ((d << 1) + 2 << 2) | 0;
   s = 104 + (d << 1 << 2) | 0;
  } else {
   b = c[104 + ((d << 1) + 2 << 2) >> 2] | 0;
   if (b >>> 0 < (c[20] | 0) >>> 0) da(); else {
    r = 104 + ((d << 1) + 2 << 2) | 0;
    s = b;
   }
  }
  c[r >> 2] = t;
  c[s + 12 >> 2] = t;
  c[t + 8 >> 2] = s;
  c[t + 12 >> 2] = 104 + (d << 1 << 2);
  return;
 }
 b = g >>> 8;
 if (!b) f = 0; else if (g >>> 0 > 16777215) f = 31; else {
  f = b << ((b + 1048320 | 0) >>> 16 & 8) << (((b << ((b + 1048320 | 0) >>> 16 & 8)) + 520192 | 0) >>> 16 & 4);
  f = 14 - (((b << ((b + 1048320 | 0) >>> 16 & 8)) + 520192 | 0) >>> 16 & 4 | (b + 1048320 | 0) >>> 16 & 8 | (f + 245760 | 0) >>> 16 & 2) + (f << ((f + 245760 | 0) >>> 16 & 2) >>> 15) | 0;
  f = g >>> (f + 7 | 0) & 1 | f << 1;
 }
 b = 368 + (f << 2) | 0;
 c[t + 28 >> 2] = f;
 c[t + 20 >> 2] = 0;
 c[t + 16 >> 2] = 0;
 d = c[17] | 0;
 e = 1 << f;
 a : do if (!(d & e)) {
  c[17] = d | e;
  c[b >> 2] = t;
  c[t + 24 >> 2] = b;
  c[t + 12 >> 2] = t;
  c[t + 8 >> 2] = t;
 } else {
  b = c[b >> 2] | 0;
  b : do if ((c[b + 4 >> 2] & -8 | 0) == (g | 0)) u = b; else {
   f = g << ((f | 0) == 31 ? 0 : 25 - (f >>> 1) | 0);
   while (1) {
    e = b + 16 + (f >>> 31 << 2) | 0;
    d = c[e >> 2] | 0;
    if (!d) break;
    if ((c[d + 4 >> 2] & -8 | 0) == (g | 0)) {
     u = d;
     break b;
    } else {
     f = f << 1;
     b = d;
    }
   }
   if (e >>> 0 < (c[20] | 0) >>> 0) da(); else {
    c[e >> 2] = t;
    c[t + 24 >> 2] = b;
    c[t + 12 >> 2] = t;
    c[t + 8 >> 2] = t;
    break a;
   }
  } while (0);
  b = u + 8 | 0;
  d = c[b >> 2] | 0;
  s = c[20] | 0;
  if (d >>> 0 >= s >>> 0 & u >>> 0 >= s >>> 0) {
   c[d + 12 >> 2] = t;
   c[b >> 2] = t;
   c[t + 8 >> 2] = d;
   c[t + 12 >> 2] = u;
   c[t + 24 >> 2] = 0;
   break;
  } else da();
 } while (0);
 u = (c[24] | 0) + -1 | 0;
 c[24] = u;
 if (!u) b = 520; else return;
 while (1) {
  b = c[b >> 2] | 0;
  if (!b) break; else b = b + 8 | 0;
 }
 c[24] = -1;
 return;
}
function ya(b, d) {
 b = b | 0;
 d = d | 0;
 var e = 0, f = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0;
 e = c[d >> 2] | 0;
 m = c[b >> 2] | 0;
 a : do if (e) {
  n = a[m >> 0] | 0;
  b : do if (n << 24 >> 24) {
   o = n;
   while (1) {
    n = a[e >> 0] | 0;
    if (n << 24 >> 24 == 42) {
     j = m;
     l = e;
     s = 42;
     k = o;
     q = 0;
     r = 0;
     break;
    }
    if (!(n << 24 >> 24 == 63 ? 1 : n << 24 >> 24 == o << 24 >> 24)) {
     t = 0;
     u = 24;
     break;
    }
    e = e + 1 | 0;
    m = m + 1 | 0;
    o = a[m >> 0] | 0;
    if (!(o << 24 >> 24)) break b;
   }
   if ((u | 0) == 24) return t | 0;
   while (1) {
    p = j + 1 | 0;
    e = s;
    m = q;
    j = r;
    while (1) {
     if (e << 24 >> 24 != 42) {
      o = j;
      break;
     }
     j = l + 1 | 0;
     e = a[j >> 0] | 0;
     if (!(e << 24 >> 24)) break a; else {
      l = j;
      m = p;
     }
    }
    n = e << 24 >> 24 == 63 ? 1 : e << 24 >> 24 == k << 24 >> 24;
    e = n ? l + 1 | 0 : o;
    j = n ? p : m;
    k = a[j >> 0] | 0;
    if (!(k << 24 >> 24)) break b;
    l = e;
    s = a[e >> 0] | 0;
    q = n ? m : m + 1 | 0;
    r = o;
   }
  } while (0);
  c : while (1) switch (a[e >> 0] | 0) {
  case 0:
   break a;
  case 42:
   {
    e = e + 1 | 0;
    break;
   }
  default:
   {
    t = 0;
    break c;
   }
  }
  return t | 0;
 } while (0);
 e = c[d + 4 >> 2] | 0;
 j = c[b + 8 >> 2] | 0;
 if (!e) {
  w = 1;
  return w | 0;
 }
 k = a[j >> 0] | 0;
 d : do if (k << 24 >> 24) {
  l = k;
  while (1) {
   k = a[e >> 0] | 0;
   if (k << 24 >> 24 == 42) {
    f = j;
    h = e;
    w = 42;
    g = l;
    i = 0;
    v = 0;
    break;
   }
   if (!(k << 24 >> 24 == 63 ? 1 : k << 24 >> 24 == l << 24 >> 24)) {
    t = 0;
    u = 24;
    break;
   }
   e = e + 1 | 0;
   j = j + 1 | 0;
   l = a[j >> 0] | 0;
   if (!(l << 24 >> 24)) break d;
  }
  if ((u | 0) == 24) return t | 0;
  e : while (1) {
   l = f + 1 | 0;
   e = w;
   f = v;
   while (1) {
    if (e << 24 >> 24 != 42) {
     k = f;
     break;
    }
    f = h + 1 | 0;
    e = a[f >> 0] | 0;
    if (!(e << 24 >> 24)) {
     t = 1;
     break e;
    } else {
     h = f;
     i = l;
    }
   }
   j = e << 24 >> 24 == 63 ? 1 : e << 24 >> 24 == g << 24 >> 24;
   e = j ? h + 1 | 0 : k;
   f = j ? l : i;
   g = a[f >> 0] | 0;
   if (!(g << 24 >> 24)) break d;
   h = e;
   w = a[e >> 0] | 0;
   i = j ? i : i + 1 | 0;
   v = k;
  }
  return t | 0;
 } while (0);
 while (1) {
  f = a[e >> 0] | 0;
  if (f << 24 >> 24 == 42) e = e + 1 | 0; else break;
 }
 w = f << 24 >> 24 == 0;
 return w | 0;
}
function wa(a) {
 a = a | 0;
 var b = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0;
 k = c[a + 8 >> 2] | 0;
 f = 32;
 do {
  b = c[a >> 2] | 0;
  d = b + ((f << 24 >> 24) + -32 << 2) | 0;
  e = c[d >> 2] | 0;
  if (!e) c[d >> 2] = b; else {
   c[e + 388 >> 2] = b;
   d = Ga(8) | 0;
   if (!d) {
    j = 0;
    g = 39;
    break;
   }
   c[d >> 2] = e;
   c[d + 4 >> 2] = 0;
   if (!(c[k >> 2] | 0)) c[k >> 2] = d;
   b = c[k + 4 >> 2] | 0;
   if (b) c[b + 4 >> 2] = d;
   c[k + 4 >> 2] = d;
  }
  f = f + 1 | 0;
 } while ((f | 0) < 128);
 if ((g | 0) == 39) return j | 0;
 b = c[k >> 2] | 0;
 if (!b) {
  l = 1;
  return l | 0;
 }
 a : while (1) {
  i = c[b >> 2] | 0;
  h = 32;
  do {
   d = (h << 24 >> 24) + -32 | 0;
   a = c[i + (d << 2) >> 2] | 0;
   f = c[(c[i + 388 >> 2] | 0) + (d << 2) >> 2] | 0;
   if (!a) c[i + (d << 2) >> 2] = f; else {
    d = Ga(8) | 0;
    if (!d) {
     j = 0;
     g = 39;
     break a;
    }
    c[d >> 2] = a;
    c[d + 4 >> 2] = 0;
    if (!(c[k >> 2] | 0)) c[k >> 2] = d;
    e = c[k + 4 >> 2] | 0;
    if (e) c[e + 4 >> 2] = d;
    c[k + 4 >> 2] = d;
    c[a + 388 >> 2] = f;
    g = c[a + 384 >> 2] | 0;
    d = c[c[f + 384 >> 2] >> 2] | 0;
    if (d) do {
     a = c[d >> 2] | 0;
     e = c[a >> 2] | 0;
     a = c[a + 4 >> 2] | 0;
     l = Ga(8) | 0;
     if (!l) {
      j = 0;
      g = 39;
      break a;
     }
     c[l >> 2] = e;
     c[l + 4 >> 2] = a;
     e = Ga(8) | 0;
     if (!e) {
      g = 27;
      break a;
     }
     c[e >> 2] = l;
     c[e + 4 >> 2] = 0;
     if (!(c[g >> 2] | 0)) c[g >> 2] = e;
     a = c[g + 4 >> 2] | 0;
     if (a) c[a + 4 >> 2] = e;
     c[g + 4 >> 2] = e;
     d = c[d + 4 >> 2] | 0;
    } while ((d | 0) != 0);
   }
   h = h + 1 | 0;
  } while ((h | 0) < 128);
  f = c[i + 384 >> 2] | 0;
  e = c[f >> 2] | 0;
  if (!e) c[i + 392 >> 2] = 0; else {
   d = 0;
   do {
    d = d + 1 | 0;
    e = c[e + 4 >> 2] | 0;
   } while ((e | 0) != 0);
   c[i + 392 >> 2] = d;
   if (d) {
    a = Ga(d << 3) | 0;
    if (!a) {
     j = 0;
     g = 39;
     break;
    }
    c[i + 396 >> 2] = a;
    d = c[f >> 2] | 0;
    if (d) {
     e = 0;
     while (1) {
      i = c[d >> 2] | 0;
      c[a + (e << 3) >> 2] = c[i >> 2];
      c[a + (e << 3) + 4 >> 2] = c[i + 4 >> 2];
      d = c[d + 4 >> 2] | 0;
      if (!d) break; else e = e + 1 | 0;
     }
    }
   }
  }
  b = c[b + 4 >> 2] | 0;
  if (!b) {
   j = 1;
   g = 39;
   break;
  }
 }
 if ((g | 0) == 27) {
  Ha(l);
  l = 0;
  return l | 0;
 } else if ((g | 0) == 39) return j | 0;
 return 0;
}
function va(b, d, e, f, g) {
 b = b | 0;
 d = d | 0;
 e = e | 0;
 f = f | 0;
 g = g | 0;
 var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0;
 h = c[b >> 2] | 0;
 a : do if ((e | 0) > 0) {
  i = 0;
  while (1) {
   j = c[h + ((a[d + i >> 0] | 0) + -32 << 2) >> 2] | 0;
   if (!j) break a;
   h = i + 1 | 0;
   if ((h | 0) < (e | 0)) {
    i = h;
    h = j;
   } else {
    i = h;
    h = j;
    break;
   }
  }
 } else i = 0; while (0);
 b : do if ((i | 0) < (e | 0)) {
  while (1) {
   m = Ia(400, 1) | 0;
   if (!m) {
    h = 0;
    i = 26;
    break;
   }
   j = Ga(8) | 0;
   if (!j) {
    i = 8;
    break;
   }
   c[j >> 2] = 0;
   c[j + 4 >> 2] = 0;
   c[m + 384 >> 2] = j;
   k = c[b + 4 >> 2] | 0;
   l = Ga(8) | 0;
   if (!l) {
    i = 14;
    break;
   }
   c[l >> 2] = m;
   c[l + 4 >> 2] = 0;
   if (!(c[k >> 2] | 0)) c[k >> 2] = l;
   j = c[k + 4 >> 2] | 0;
   if (j) c[j + 4 >> 2] = l;
   c[k + 4 >> 2] = l;
   c[h + ((a[d + i >> 0] | 0) + -32 << 2) >> 2] = m;
   i = i + 1 | 0;
   if ((i | 0) >= (e | 0)) {
    h = m;
    break b;
   } else h = m;
  }
  if ((i | 0) == 8) {
   Ha(m);
   g = 0;
   return g | 0;
  } else if ((i | 0) == 14) {
   h = c[j >> 2] | 0;
   if (h) do {
    g = h;
    h = c[h + 4 >> 2] | 0;
    Ha(c[g >> 2] | 0);
    Ha(g);
   } while ((h | 0) != 0);
   Ha(j);
   Ha(c[m + 396 >> 2] | 0);
   Ha(m);
   g = 0;
   return g | 0;
  } else if ((i | 0) == 26) return h | 0;
 } while (0);
 j = c[h + 384 >> 2] | 0;
 h = Ga(8) | 0;
 if (!h) {
  g = 0;
  return g | 0;
 }
 c[h >> 2] = f;
 c[h + 4 >> 2] = g;
 i = Ga(8) | 0;
 if (!i) {
  Ha(h);
  g = 0;
  return g | 0;
 }
 c[i >> 2] = h;
 c[i + 4 >> 2] = 0;
 if (!(c[j >> 2] | 0)) c[j >> 2] = i;
 h = c[j + 4 >> 2] | 0;
 if (h) c[h + 4 >> 2] = i;
 c[j + 4 >> 2] = i;
 g = 1;
 return g | 0;
}
function Ca(a) {
 a = a | 0;
 var b = 0, d = 0, e = 0, f = 0, g = 0, h = 0;
 h = ta() | 0;
 c[4] = h;
 a : do if (h) {
  h = ta() | 0;
  c[5] = h;
  if (h) {
   b = c[11] | 0;
   h = Ia(b, 4) | 0;
   c[6] = h;
   if (h) {
    h = Ia(b, 4) | 0;
    c[7] = h;
    if (h) if (xa() | 0) if (wa(c[4] | 0) | 0) if (wa(c[5] | 0) | 0) {
     b = c[11] | 0;
     h = Ia(b, 4) | 0;
     c[8] = h;
     if (h) {
      h = Ia(b, 4) | 0;
      c[9] = h;
      if (h) {
       Ba(a);
       b = c[2] | 0;
       if (b) {
        if ((c[13] | 0) <= 0) return;
        d = c[12] | 0;
        e = 0;
        while (1) {
         h = b;
         b = za(d, b + 4 | 0) | 0;
         c[h >> 2] = (b - h >> 2) + -1;
         if (b >>> 0 > (c[3] | 0) >>> 0) break a;
         e = e + 1 | 0;
         if ((e | 0) >= (c[13] | 0)) break; else d = d + 16 | 0;
        }
        return;
       }
      }
     }
    }
   }
  }
 } while (0);
 Ha(c[2] | 0);
 c[2] = 0;
 ua(c[4] | 0);
 c[4] = 0;
 ua(c[5] | 0);
 c[5] = 0;
 Ha(c[6] | 0);
 c[6] = 0;
 Ha(c[7] | 0);
 c[7] = 0;
 Ha(c[8] | 0);
 c[8] = 0;
 Ha(c[9] | 0);
 c[9] = 0;
 Ba(a);
 b = c[2] | 0;
 if (!b) da();
 if ((c[13] | 0) <= 0) return;
 g = c[12] | 0;
 h = 0;
 while (1) {
  d = b + 4 | 0;
  e = c[11] | 0;
  if ((e | 0) > 0) {
   f = c[10] | 0;
   a = 0;
   do {
    if (ya(g, f + (a << 3) | 0) | 0) {
     c[d >> 2] = a;
     d = d + 4 | 0;
     e = c[11] | 0;
    }
    a = a + 1 | 0;
   } while ((a | 0) < (e | 0));
  }
  c[b >> 2] = (d - b >> 2) + -1;
  if (d >>> 0 > (c[3] | 0) >>> 0) {
   b = 26;
   break;
  }
  h = h + 1 | 0;
  if ((h | 0) >= (c[13] | 0)) {
   b = 26;
   break;
  } else {
   g = g + 16 | 0;
   b = d;
  }
 }
 if ((b | 0) == 26) return;
}
function za(b, d) {
 b = b | 0;
 d = d | 0;
 var e = 0, f = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0;
 e = c[b >> 2] | 0;
 g = c[b + 4 >> 2] | 0;
 m = c[8] | 0;
 if ((g | 0) > 0) {
  j = 0;
  k = c[c[4] >> 2] | 0;
  do {
   k = c[k + ((a[e + j >> 0] | 0) + -32 << 2) >> 2] | 0;
   f = c[k + 392 >> 2] | 0;
   if ((f | 0) > 0) {
    h = 0;
    i = c[k + 396 >> 2] | 0;
    while (1) {
     l = m + (c[i >> 2] << 2) | 0;
     c[l >> 2] = c[l >> 2] | c[i + 4 >> 2];
     h = h + 1 | 0;
     if ((h | 0) == (f | 0)) break; else i = i + 8 | 0;
    }
   }
   j = j + 1 | 0;
  } while ((j | 0) != (g | 0));
 }
 e = c[b + 8 >> 2] | 0;
 f = c[b + 12 >> 2] | 0;
 l = c[9] | 0;
 if ((f | 0) > 0) {
  j = 0;
  k = c[c[5] >> 2] | 0;
  do {
   k = c[k + ((a[e + j >> 0] | 0) + -32 << 2) >> 2] | 0;
   g = c[k + 392 >> 2] | 0;
   if ((g | 0) > 0) {
    h = 0;
    i = c[k + 396 >> 2] | 0;
    while (1) {
     o = l + (c[i >> 2] << 2) | 0;
     c[o >> 2] = c[o >> 2] | c[i + 4 >> 2];
     h = h + 1 | 0;
     if ((h | 0) == (g | 0)) break; else i = i + 8 | 0;
    }
   }
   j = j + 1 | 0;
  } while ((j | 0) != (f | 0));
 }
 if ((c[11] | 0) > 0) f = 0; else {
  o = d;
  return o | 0;
 }
 do {
  e = c[(c[6] | 0) + (f << 2) >> 2] | 0;
  if (!e) n = 16; else if ((c[m + (f << 2) >> 2] | 0) == (e | 0)) n = 16;
  do if ((n | 0) == 16) {
   n = 0;
   e = c[(c[7] | 0) + (f << 2) >> 2] | 0;
   if (e) if ((c[l + (f << 2) >> 2] | 0) != (e | 0)) break;
   if (ya(b, (c[10] | 0) + (f << 3) | 0) | 0) {
    c[d >> 2] = f;
    d = d + 4 | 0;
   }
  } while (0);
  c[m + (f << 2) >> 2] = 0;
  c[l + (f << 2) >> 2] = 0;
  f = f + 1 | 0;
 } while ((f | 0) < (c[11] | 0));
 return d | 0;
}
function xa() {
 var b = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0, j = 0, k = 0;
 if ((c[11] | 0) <= 0) {
  k = 1;
  return k | 0;
 }
 j = c[10] | 0;
 k = 0;
 a : while (1) {
  d = c[j >> 2] | 0;
  if (d) {
   h = c[4] | 0;
   i = c[6] | 0;
   b = 1;
   while (1) {
    e = d;
    b : while (1) {
     g = a[e >> 0] | 0;
     switch (g << 24 >> 24) {
     case 0:
     case 42:
     case 63:
      break b;
     default:
      {}
     }
     e = e + 1 | 0;
    }
    if ((e | 0) != (d | 0)) {
     f = e - d | 0;
     if ((f | 0) > 6) {
      if (!(va(h, d, f, k, b) | 0)) {
       b = 0;
       d = 26;
       break a;
      }
      b = b << 1;
      if ((b | 0) == 1073741824) {
       b = 1073741824;
       break;
      }
     }
    }
    if (!(g << 24 >> 24)) break; else d = e + 1 | 0;
   }
   c[i + (k << 2) >> 2] = b + -1;
  }
  d = c[j + 4 >> 2] | 0;
  if (d) {
   h = c[5] | 0;
   i = c[7] | 0;
   b = 1;
   while (1) {
    e = d;
    c : while (1) {
     g = a[e >> 0] | 0;
     switch (g << 24 >> 24) {
     case 0:
     case 42:
     case 63:
      break c;
     default:
      {}
     }
     e = e + 1 | 0;
    }
    if ((e | 0) != (d | 0)) {
     f = e - d | 0;
     if ((f | 0) > 6) {
      if (!(va(h, d, f, k, b) | 0)) {
       b = 0;
       d = 26;
       break a;
      }
      b = b << 1;
      if ((b | 0) == 1073741824) {
       b = 1073741824;
       break;
      }
     }
    }
    if (!(g << 24 >> 24)) break; else d = e + 1 | 0;
   }
   c[i + (k << 2) >> 2] = b + -1;
  }
  k = k + 1 | 0;
  if ((k | 0) >= (c[11] | 0)) {
   b = 1;
   d = 26;
   break;
  } else j = j + 8 | 0;
 }
 if ((d | 0) == 26) return b | 0;
 return 0;
}
function ta() {
 var a = 0, b = 0, d = 0, e = 0, f = 0;
 e = Ga(12) | 0;
 if (!e) {
  e = 0;
  return e | 0;
 }
 d = Ia(400, 1) | 0;
 do if (d) {
  a = Ga(8) | 0;
  if (!a) {
   Ha(d);
   break;
  }
  c[a >> 2] = 0;
  c[a + 4 >> 2] = 0;
  c[d + 384 >> 2] = a;
  c[e >> 2] = d;
  a = Ga(8) | 0;
  if (!a) {
   c[e + 4 >> 2] = 0;
   b = c[d + 384 >> 2] | 0;
   if (b) {
    a = c[b >> 2] | 0;
    if (a) do {
     f = a;
     a = c[a + 4 >> 2] | 0;
     Ha(c[f >> 2] | 0);
     Ha(f);
    } while ((a | 0) != 0);
    Ha(b);
   }
   Ha(c[d + 396 >> 2] | 0);
   Ha(d);
   Ha(e);
   f = 0;
   return f | 0;
  }
  c[a >> 2] = 0;
  c[a + 4 >> 2] = 0;
  c[e + 4 >> 2] = a;
  a = Ga(8) | 0;
  if (a) {
   c[a >> 2] = 0;
   c[a + 4 >> 2] = 0;
   c[e + 8 >> 2] = a;
   f = e;
   return f | 0;
  }
  c[e + 8 >> 2] = 0;
  b = c[d + 384 >> 2] | 0;
  if (b) {
   a = c[b >> 2] | 0;
   if (a) do {
    f = a;
    a = c[a + 4 >> 2] | 0;
    Ha(c[f >> 2] | 0);
    Ha(f);
   } while ((a | 0) != 0);
   Ha(b);
  }
  Ha(c[d + 396 >> 2] | 0);
  Ha(d);
  b = c[e + 4 >> 2] | 0;
  if (b) {
   a = c[b >> 2] | 0;
   if (a) do {
    f = a;
    a = c[a + 4 >> 2] | 0;
    Ha(f);
   } while ((a | 0) != 0);
   Ha(b);
  }
  Ha(e);
  f = 0;
  return f | 0;
 } while (0);
 Ha(e);
 f = 0;
 return f | 0;
}
function ua(a) {
 a = a | 0;
 var b = 0, d = 0, e = 0, f = 0, g = 0, h = 0;
 if (!a) return;
 d = c[a >> 2] | 0;
 e = c[d + 384 >> 2] | 0;
 if (e) {
  b = c[e >> 2] | 0;
  if (b) do {
   g = b;
   b = c[b + 4 >> 2] | 0;
   Ha(c[g >> 2] | 0);
   Ha(g);
  } while ((b | 0) != 0);
  Ha(e);
 }
 Ha(c[d + 396 >> 2] | 0);
 Ha(d);
 g = c[a + 4 >> 2] | 0;
 b = c[g >> 2] | 0;
 if (b) do {
  e = c[b >> 2] | 0;
  f = c[e + 384 >> 2] | 0;
  if (f) {
   d = c[f >> 2] | 0;
   if (d) do {
    h = d;
    d = c[d + 4 >> 2] | 0;
    Ha(c[h >> 2] | 0);
    Ha(h);
   } while ((d | 0) != 0);
   Ha(f);
  }
  Ha(c[e + 396 >> 2] | 0);
  Ha(e);
  b = c[b + 4 >> 2] | 0;
 } while ((b | 0) != 0);
 if (g) {
  b = c[g >> 2] | 0;
  if (b) do {
   h = b;
   b = c[b + 4 >> 2] | 0;
   Ha(h);
  } while ((b | 0) != 0);
  Ha(g);
 }
 d = c[a + 8 >> 2] | 0;
 if (d) {
  b = c[d >> 2] | 0;
  if (b) do {
   h = b;
   b = c[b + 4 >> 2] | 0;
   Ha(h);
  } while ((b | 0) != 0);
  Ha(d);
 }
 Ha(a);
 return;
}
function La(b, d, e) {
 b = b | 0;
 d = d | 0;
 e = e | 0;
 var f = 0;
 if ((e | 0) >= 4096) return ha(b | 0, d | 0, e | 0) | 0;
 f = b | 0;
 if ((b & 3) == (d & 3)) {
  while (b & 3) {
   if (!e) return f | 0;
   a[b >> 0] = a[d >> 0] | 0;
   b = b + 1 | 0;
   d = d + 1 | 0;
   e = e - 1 | 0;
  }
  while ((e | 0) >= 4) {
   c[b >> 2] = c[d >> 2];
   b = b + 4 | 0;
   d = d + 4 | 0;
   e = e - 4 | 0;
  }
 }
 while ((e | 0) > 0) {
  a[b >> 0] = a[d >> 0] | 0;
  b = b + 1 | 0;
  d = d + 1 | 0;
  e = e - 1 | 0;
 }
 return f | 0;
}
function Ja() {}
function Ka(b, d, e) {
 b = b | 0;
 d = d | 0;
 e = e | 0;
 var f = 0, g = 0, h = 0;
 f = b + e | 0;
 if ((e | 0) >= 20) {
  d = d & 255;
  g = b & 3;
  h = d | d << 8 | d << 16 | d << 24;
  if (g) {
   g = b + 4 - g | 0;
   while ((b | 0) < (g | 0)) {
    a[b >> 0] = d;
    b = b + 1 | 0;
   }
  }
  while ((b | 0) < (f & ~3 | 0)) {
   c[b >> 2] = h;
   b = b + 4 | 0;
  }
 }
 while ((b | 0) < (f | 0)) {
  a[b >> 0] = d;
  b = b + 1 | 0;
 }
 return b - e | 0;
}
function Ba(a) {
 a = a | 0;
 var b = 0;
 b = Ga(1024) | 0;
 if (!b) return;
 do if (a) {
  if (b >>> 0 <= 385875968 >>> 0) {
   c[14] = 385875968 - b;
   Ha(b);
   a = c[14] | 0;
   b = a;
   a = Ga(a) | 0;
   break;
  }
  Ha(b);
  return;
 } else {
  c[14] = 251658240;
  Ha(b);
  a = c[14] | 0;
  b = a;
  a = Ia(a, 1) | 0;
 } while (0);
 c[2] = a;
 if (!a) {
  c[14] = 0;
  return;
 } else {
  c[3] = a + ((b >>> 2) + -2 - (c[11] | 0) << 2);
  return;
 }
}
function Ia(a, b) {
 a = a | 0;
 b = b | 0;
 var d = 0;
 if (!a) d = 0; else {
  d = Z(b, a) | 0;
  if ((b | a) >>> 0 > 65535) d = ((d >>> 0) / (a >>> 0) | 0 | 0) == (b | 0) ? d : -1;
 }
 b = Ga(d) | 0;
 if (!b) return b | 0;
 if (!(c[b + -4 >> 2] & 3)) return b | 0;
 Ka(b | 0, 0, d | 0) | 0;
 return b | 0;
}
function qa(b) {
 b = b | 0;
 a[k >> 0] = a[b >> 0];
 a[k + 1 >> 0] = a[b + 1 >> 0];
 a[k + 2 >> 0] = a[b + 2 >> 0];
 a[k + 3 >> 0] = a[b + 3 >> 0];
 a[k + 4 >> 0] = a[b + 4 >> 0];
 a[k + 5 >> 0] = a[b + 5 >> 0];
 a[k + 6 >> 0] = a[b + 6 >> 0];
 a[k + 7 >> 0] = a[b + 7 >> 0];
}
function Aa() {
 Ha(c[2] | 0);
 c[2] = 0;
 ua(c[4] | 0);
 c[4] = 0;
 ua(c[5] | 0);
 c[5] = 0;
 Ha(c[6] | 0);
 c[6] = 0;
 Ha(c[7] | 0);
 c[7] = 0;
 Ha(c[8] | 0);
 c[8] = 0;
 Ha(c[9] | 0);
 c[9] = 0;
 return 0;
}
function pa(b) {
 b = b | 0;
 a[k >> 0] = a[b >> 0];
 a[k + 1 >> 0] = a[b + 1 >> 0];
 a[k + 2 >> 0] = a[b + 2 >> 0];
 a[k + 3 >> 0] = a[b + 3 >> 0];
}
function Da(a, b, d, e) {
 a = a | 0;
 b = b | 0;
 d = d | 0;
 e = e | 0;
 c[12] = a;
 c[10] = b;
 c[13] = d;
 c[11] = e;
 Ca(1);
 return c[2] | 0;
}
function ka(a) {
 a = a | 0;
 var b = 0;
 b = i;
 i = i + a | 0;
 i = i + 15 & -16;
 return b | 0;
}
function Fa() {
 var a = 0;
 if (!0) a = 60; else a = c[(ca() | 0) + 60 >> 2] | 0;
 return a | 0;
}
function oa(a, b) {
 a = a | 0;
 b = b | 0;
 if (!m) {
  m = a;
  n = b;
 }
}
function Ea(a, b) {
 a = a | 0;
 b = b | 0;
 da();
 return 0;
}
function na(a, b) {
 a = a | 0;
 b = b | 0;
 i = a;
 j = b;
}
function ra(a) {
 a = a | 0;
 B = a;
}
function ma(a) {
 a = a | 0;
 i = a;
}
function sa() {
 return B | 0;
}
function la() {
 return i | 0;
}
// EMSCRIPTEN_END_FUNCS
 return {
  _free: Ha,
  _main: Ea,
  _memset: Ka,
  _malloc: Ga,
  _cleanup: Aa,
  _memcpy: La,
  _solve: Da,
  runPostSets: Ja,
  stackAlloc: ka,
  stackSave: la,
  stackRestore: ma,
  establishStackSpace: na,
  setThrew: oa,
  setTempRet0: ra,
  getTempRet0: sa
 };
})
// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg, Module.asmLibraryArg, buffer);
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _cleanup = Module["_cleanup"] = asm["_cleanup"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _solve = Module["_solve"] = asm["_solve"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
Runtime.stackAlloc = asm["stackAlloc"];
Runtime.stackSave = asm["stackSave"];
Runtime.stackRestore = asm["stackRestore"];
Runtime.establishStackSpace = asm["establishStackSpace"];
Runtime.setTempRet0 = asm["setTempRet0"];
Runtime.getTempRet0 = asm["getTempRet0"];
function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = "Program terminated with exit(" + status + ")";
 this.status = status;
}
ExitStatus.prototype = new Error;
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
function run(args) {
}
function exit(status, implicit) {
}
var abortDecorators = [];
function abort(what) {
 if (what !== undefined) {
  Module.print(what);
  Module.printErr(what);
  what = JSON.stringify(what);
 } else {
  what = "";
 }
 ABORT = true;
 EXITSTATUS = 1;
 var extra = "\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";
 var output = "abort(" + what + ") at " + stackTrace() + extra;
 if (abortDecorators) {
  abortDecorators.forEach((function(decorator) {
   output = decorator(output, what);
  }));
 }
 throw output;
}
var shouldRunNow = true;
if (Module["noInitialRun"]) {
 shouldRunNow = false;
}
Module["noExitRuntime"] = true;
run();
"use strict";
function write_ascii_to_memory(string, memory) {
 var heap8 = Module.HEAP8;
 var length = string.length;
 for (var i = 0; i < length; i++) {
  heap8[memory++] = string.charCodeAt(i);
 }
 heap8[memory++] = 0;
 return memory;
}
var raw_buffer_size = 16 * 1024 * 1024;
function raw_buffer_add(raw_buffers) {
 var buffer = Module._malloc(raw_buffer_size);
 raw_buffers.buffers.push(buffer);
 raw_buffers.pos = buffer;
 raw_buffers.end = buffer + raw_buffer_size;
}
function raw_buffers_init() {
 return {
  buffers: [],
  pos: 0,
  end: 0
 };
}
function raw_buffers_free(raw_buffers) {
 raw_buffers.buffers.some((function(buffer) {
  Module._free(buffer);
 }));
}
function stringify_input_messages(messages, messages_order, messages_count, messages_buffer, raw_buffers) {
 var heap8 = Module.HEAP8;
 var heap32 = Module.HEAP32;
 var pos = messages_buffer >> 2;
 var pos_raw = raw_buffers.pos;
 var end_raw = raw_buffers.end;
 for (var i = 0; i < messages_count; i++) {
  var key = messages_order[i];
  var message = messages[key];
  if (pos_raw + message.from.length + message.to.length + 2 > end_raw) {
   raw_buffer_add(raw_buffers);
   pos_raw = raw_buffers.pos;
   end_raw = raw_buffers.end;
  }
  heap32[pos++] = pos_raw;
  pos_raw = write_ascii_to_memory(message.from, pos_raw);
  heap32[pos++] = message.from.length;
  heap32[pos++] = pos_raw;
  pos_raw = write_ascii_to_memory(message.to, pos_raw);
  heap32[pos++] = message.to.length;
 }
 raw_buffers.pos = pos_raw;
}
function stringify_input_rules(rules, rules_order, rules_count, rules_buffer, raw_buffers) {
 var heap8 = Module.HEAP8;
 var heap32 = Module.HEAP32;
 var pos = rules_buffer >> 2;
 var pos_raw = raw_buffers.pos;
 var end_raw = raw_buffers.end;
 for (var i = 0; i < rules_count; i++) {
  var rule = rules[i];
  var rule_from = rule.from;
  var rule_to = rule.to;
  if (!rule_from) {
   heap32[pos++] = 0;
  } else {
   if (pos_raw + rule_from.length + 2 > end_raw) {
    raw_buffer_add(raw_buffers);
    pos_raw = raw_buffers.pos;
    end_raw = raw_buffers.end;
   }
   heap32[pos++] = pos_raw;
   pos_raw = write_ascii_to_memory(rule_from, pos_raw);
  }
  if (!rule_to) {
   heap32[pos++] = 0;
  } else {
   if (pos_raw + rule_to.length + 2 > end_raw) {
    raw_buffer_add(raw_buffers);
    pos_raw = raw_buffers.pos;
    end_raw = raw_buffers.end;
   }
   heap32[pos++] = pos_raw;
   pos_raw = write_ascii_to_memory(rule_to, pos_raw);
  }
 }
 raw_buffers.pos = pos_raw;
}
function parse_output(messages, rules, messages_order, messages_count, results_buffer) {
 var heap32 = Module.HEAP32;
 var pos = results_buffer >> 2;
 var results = messages;
 for (var i = 0; i < messages_count; i++) {
  var key = messages_order[i];
  var result = results[key] = [];
  var header = heap32[pos++];
  if (header > 0) {
   result[header - 1] = null;
  }
  var end = pos + header;
  var index = 0;
  for (var j = pos; j < end; j++, index++) {
   result[index] = rules[heap32[j]].action;
  }
  pos = end;
 }
 return results;
}
function solve(messages, rules) {
 var messages_order = Object.keys(messages);
 var messages_count = messages_order.length;
 var rules_order = rules;
 var rules_count = rules_order.length;
 var sizeof_messages = 16 * messages_count;
 var sizeof_rules = 8 * rules_count;
 var raw_buffers = raw_buffers_init();
 var messages_buffer = Module._malloc(sizeof_messages);
 var rules_buffer = Module._malloc(sizeof_rules);
 stringify_input_messages(messages, messages_order, messages_count, messages_buffer, raw_buffers);
 stringify_input_rules(rules, rules_order, rules_count, rules_buffer, raw_buffers);
 Module.ticks_counter = 0;
 var results_buffer = Module.ccall("solve", "number", [ "number", "number", "number", "number" ], [ messages_buffer, rules_buffer, messages_count, rules_count ]);
 var result = parse_output(messages, rules, messages_order, messages_count, results_buffer);
 return result;
}
module.exports = solve;


