/* eslint-disable no-self-compare */
/* eslint-disable eqeqeq */
const symToStringTag = Symbol ? Symbol.toStringTag : undefined;
const MAX_SAFE_INTEGER = 9007199254740991;
const LARGE_ARRAY_SIZE = 200;
const undefinedTag = "[object Undefined]";
const nullTag = "[object Null]";
const proxyTag = "[object Proxy]";
const asyncTag = "[object AsyncFunction]";
const funcTag = "[object Function]";
const genTag = "[object GeneratorFunction]";
const argsTag = "[object Arguments]";
const spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

function isObject(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}

function isLength(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
    tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

var nativeObjectToString = Object.prototype.toString;

function objectToString(value) {
  return nativeObjectToString.call(value);
}

function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}

function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

function isObjectLike(value) {
  return value != null && typeof value == "object";
}

function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
    length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
    index = fromIndex + (fromRight ? 1 : -1);

  while (fromRight ? index-- : ++index < length) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}
function baseIsNaN(value) {
  return value !== value;
}

function baseIndexOf(array, value, fromIndex) {
  return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
}

function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

function arrayMap(array, iteratee) {
  var index = -1,
    length = array == null ? 0 : array.length,
    result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

function baseUnary(func) {
  return function (value) {
    return func(value);
  };
}

function cacheHas(cache, key) {
  return cache.has(key);
}

function arrayIncludesWith(array, value, comparator) {
  var index = -1,
    length = array == null ? 0 : array.length;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

function MapCache(entries) {
  var index = -1,
    length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

function SetCache(values) {
  var index = -1,
    length = values == null ? 0 : values.length;

  this.__data__ = new MapCache();
  while (++index < length) {
    this.add(values[index]);
  }
}

function baseDifference(array, values, iteratee, comparator) {
  var index = -1,
    includes = arrayIncludes,
    isCommon = true,
    length = array.length,
    result = [],
    valuesLength = values.length;

  if (!length) {
    return result;
  }
  if (iteratee) {
    values = arrayMap(values, baseUnary(iteratee));
  }
  if (comparator) {
    includes = arrayIncludesWith;
    isCommon = false;
  } else if (values.length >= LARGE_ARRAY_SIZE) {
    includes = cacheHas;
    isCommon = false;
    values = new SetCache(values);
  }
  outer: while (++index < length) {
    var value = array[index],
      computed = iteratee == null ? value : iteratee(value);

    value = comparator || value !== 0 ? value : 0;
    if (isCommon && computed === computed) {
      var valuesIndex = valuesLength;
      while (valuesIndex--) {
        if (values[valuesIndex] === computed) {
          continue outer;
        }
      }
      result.push(value);
    } else if (!includes(values, computed, comparator)) {
      result.push(value);
    }
  }
  return result;
}
var isArray = Array.isArray;

function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

var isArguments = baseIsArguments(
  (function () {
    return arguments;
  })()
)
  ? baseIsArguments
  : function (value) {
      return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
    };

function isFlattenable(value) {
  return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
}

function arrayPush(array, values) {
  var index = -1,
    length = values.length,
    offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
    length = array.length;

  predicate || (predicate = isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

function difference(array, values) {
  return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true)) : [];
}

export const _difference = difference;
