export const compose = (...fns) => (...args) => fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];

export const map = fn => mappable => mappable.map(fn);

export const filter = (fn) => (arr) => arr.reduce((newArr, item) => {
    return fn(item) ? newArr.concat([item]) : newArr;
}, []);

export const add = (a) => (b) => a + b;

export const inc = add(1);

export const when = (cond, f) => x => cond(x) ? f(x) : x;

export const unless = (cond, f) => x => cond(x) ? x : f(x);

export const isEqual = (a) => (b) => a === b;

export const isNotEqual = (a) => (b) => a !== b;

export const concatString = (a) => (b) => a + b;

export const getEmptyObject = () => {};

export const isObject = (value) => typeof value === "object";

export const isValueEmpty = (val) => (val + "").trim().length <= 0;

export const isValueNumber = (val) => typeof val === "number";

export const isValidValue = (val) => (val !== undefined && val !== null);

export const isValidStringOrNumber = (val) => (isValidValue(val) && (isValueNumber(val) || !isValueEmpty(val)));

export const isArrayEmpty = (val) => Array.isArray(val) && val.length < 1;

export const isArray = (val) => Array.isArray(val);

export const isNotArray = (val) => !Array.isArray(val);

export const getEmptyArray = () => [];

export const getNull = () => null;

export const getFirstArrayElement = (data) => data[0];

export const setJsonValue = (key) => (value) => (json = {}) => {

    const newJson = deepClone(json);
    newJson[key] = value;
    return newJson;
    
}

export const getPromiseFromValue = (value) => {
    return (new Promise(
      function (resolve, reject) {
        resolve(value);
      }
    ));
  }

export const isFunction = (x) => {
    
    let type = Object.prototype.toString.call(x);

    return type  === '[object Function]' ||
      type === '[object AsyncFunction]' ||
      type === '[object GeneratorFunction]' ||
      type === '[object AsyncGeneratorFunction]';
}

export const isPromise = (promise) => {
    if (promise == null || !isFunction(promise.then)) {
        return false;
    }

    return true;
};


/**
 * Returns the result of applying the onSuccess function to the value inside a successfully resolved promise. 
 * This is useful for working with promises inside function compositions.
 * 
 * @param {function} callback 
 * @returns{(promise:Promise) => any}
 */
export const andThen = (callback) => (promise) => {

    if(isPromise(promise) === true){
        return promise.then(callback);
    }
}


/**
 * Returns the result of applying the onFailure function to the value inside a failed promise. 
 * This is useful for handling rejected promises inside function compositions.
 * 
 * @param {function} callback 
 * @returns{(promise:Promise) => any}
 */
export const otherwise = (callback) => (promise) => {

    if(isPromise(promise) === true){
        return promise.then(null, callback);
    }
}


/**
 * Returns whether or not a path exists in an object. Only the object's
 * own properties are checked.
 * 
 * @param {Array<string>} _path 
 * @returns {(obj:any) => boolean}
 */
export const hasPath = (_path) => (obj) => {
    if (_path.length === 0 || isValidValue(obj)) {
      return false;
    }
    var val = obj;
    var idx = 0;
    while (idx < _path.length) {
      if (!isValidValue(val) && Object.prototype.hasOwnProperty.call(_path[idx], val)) {
        val = val[_path[idx]];
        idx += 1;
      } else {
        return false;
      }
    }
    return true;
}


/**
 * Returns whether or not an object has an own property with the specified name
 *
 * @param {string} prop
 * @returns {(obj:any) => boolean}
 */
export const has = (prop)  => (obj) => {
    return hasPath([prop], obj);
}


/**
 * Returns a partial copy of an object containing only the keys specified. If
 * the key does not exist, the property is ignored.
 * 
 * @param {Array} names an array of String property names to copy onto a new object
 * @param {Object} obj The object to copy from
 * @return {Object} A new object with only properties from `names` on it.
 * @example
 *
 *      R.pick(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
 *      R.pick(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1}
 */
export function pick(names, obj) {
  var result = {};
  var idx = 0;
  while (idx < names.length) {
    if (names[idx] in obj) {
      result[names[idx]] = obj[names[idx]];
    }
    idx += 1;
  }
  return result;
};


function _has(prop, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function _objectAssign(target) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  var output = Object(target);
  var idx = 1;
  var length = arguments.length;
  while (idx < length) {
    var source = arguments[idx];
    if (source != null) {
      for (var nextKey in source) {
        if (_has(nextKey, source)) {
          output[nextKey] = source[nextKey];
        }
      }
    }
    idx += 1;
  }
  return output;
}


/**
 * Merges a list of objects together into one object.
 *
 * @param {Array} list An array of objects
 * @return {Object} A merged object.
 *
 *      R.mergeAll([{foo:1},{bar:2},{baz:3}]); //=> {foo:1,bar:2,baz:3}
 *      R.mergeAll([{foo:1},{foo:2},{bar:2}]); //=> {foo:2,bar:2}
 * @symb R.mergeAll([{ x: 1 }, { y: 2 }, { z: 3 }]) = { x: 1, y: 2, z: 3 }
 */
export function mergeAll(list) {
  return _objectAssign.apply(null, [{}].concat(list));
}


/**
 * Create a new object with the own properties of the first object merged with
 * the own properties of the second object. If a key exists in both objects,
 * the value from the second object will be used.
 *
 * @param {Object} l
 * @return {(r:Object) => Object}
 * @example
 *
 *      R.mergeRight({ 'name': 'fred', 'age': 10 }, { 'age': 40 });
 *      //=> { 'name': 'fred', 'age': 40 }
 *
 *      const withDefaults = R.mergeRight({x: 0, y: 0});
 *      withDefaults({y: 2}); //=> {x: 0, y: 2}
 * @symb R.mergeRight(a, b) = {...a, ...b}
 */
export const mergeRight = (l) => (r) => {
  return _objectAssign({}, l, r);
}



/**
 * Create a new object with the own properties of the first object merged with
 * the own properties of the second object. If a key exists in both objects,
 * the value from the first object will be used.
 *
 * @param {Object} l
 * @return {(r:Object) => Object}
 * @example
 *
 *      R.mergeLeft({ 'age': 40 }, { 'name': 'fred', 'age': 10 });
 *      //=> { 'name': 'fred', 'age': 40 }
 *
 *      const resetToDefault = R.mergeLeft({x: 0});
 *      resetToDefault({x: 5, y: 2}); //=> {x: 0, y: 2}
 * @symb R.mergeLeft(a, b) = {...b, ...a}
 */
export const mergeLeft = (l) => (r) => {
  return _objectAssign({}, r, l);
};