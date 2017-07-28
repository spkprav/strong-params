/**
 * Polyfills.
 */

require('es6-object-assign').polyfill()

/**
 * Module dependencies.
 */

var _ = require('lodash')
var ParameterMissingError = require('./parameter-missing-error')

/**
 * Constants.
 */

var PRIMITIVE_TYPES = [Boolean, Number, String, function Null () {}]

/**
 * A class for rails-like strong-parameters.
 * @constructor
 */

function Parameters (attrs) {
  if (!(this instanceof Parameters)) {
    return new Parameters(attrs)
  }

  this._attrs = attrs = attrs || {}
  this._params = {}
  this._filters = []

  if (attrs instanceof Array) {
    this._params = attrs.map(Parameters._initValue)
  } else {
    for (var key in attrs) {
      var value = attrs[key]
      this._params[key] = Parameters._initValue(value)
    }
  }
}

/**
 * Define class methods.
 */

Object.assign(Parameters, {
  _initValue: function (value) {
    return !Parameters._isPrimitive(value)
      ? new Parameters(value)
      : value
  },

  /**
   * Indicates if the value is a primitive. Primitive types are {Boolean},
   * {Number}. and {String}.
   *
   * @return {Parameters}
   * @api public
   */

  _isPrimitive: function (value) {
    return PRIMITIVE_TYPES.some(function (Primitive) {
      return [typeof value, String(value)].some(function (val) { return val === Primitive.name.toLowerCase() })
    })
  },

  /**
   * Tries to clone Parameters instance. Otherwise just returns provided input.
   *
   * @return {Parameters}
   * @api public
   */

  clone: function (value) {
    return value instanceof Parameters ? value.clone() : value
  },
  _cloneArray: function (params) {
    return params.map(function (param) {
      return Parameters.clone(param)
    })
  },
  _cloneObject: function (params) {
    return _.transform(params, function (result, value, key) {
      result[key] = Parameters.clone(value)
    }, {})
  }
})

/**
 * Define instance methods.
 */

Object.assign(Parameters.prototype, {

  /**
   * Returns a sub-parameters or throws an error if the requested key does not
   * exist. This is usefull when working with nested data (e.g. user[name]).
   *
   * @return {Parameters}
   * @api public
   */

  require: function (key) {
    var param = Parameters.clone(this._fetch(key))
    if (!param) throw new ParameterMissingError('param `' + key + '` required')
    if (!(param instanceof Parameters)) throw new Error('param `' + key + '` is not a Parameters instance')
    return param
  },

  /**
   * Defines filter to use on parameters.
   *
   * @return {Parameters}
   * @api public
   */

  permit: function (filters) {
    if (!_.isArray(filters)) {
      filters = Array.prototype.slice.call(arguments)
    }
    var _this = this.clone()
    _this._filters = filters || []

    return _this
  },

  /**
   * Returns object with permitted structure.
   *
   * @return {object}
   * @api public
   */

  value: function () {
    var _this = this.clone()
    var params = {}

    _this._filters.forEach(function (filter) {
      if (typeof filter === 'object') {
        _this._permitObject(params, filter)
      } else {
        _this._permitPrimitive(params, filter)
      }
    })

    return params
  },

  /**
   * Returns all object data.
   *
   * @return {object}
   * @api public
   */

  all: function () {
    return _.cloneDeep(this._attrs)
  },

  /**
   * Returns parameters value identified by key.
   *
   * @return {object}
   * @api private
   */

  _fetch: function (key) { return this._params[key] },

  /**
   * Indicates if the key exists.
   *
   * @return {object}
   * @api private
   */

  _hasKey: function (key) { return this._fetch(key) !== undefined },

  /**
   * Performs an assignment of primitive value to provided object.
   *
   * @api private
   */

  _permitPrimitive: function (params, key) {
    if (this._hasKey(key) && Parameters._isPrimitive(this._fetch(key))) {
      params[key] = this._fetch(key)
    }
  },

  /**
   * Performs an assignment of non-primitive values to provided object. Also
   * handles nested parameters.
   *
   * @api private
   */

  _permitObject: function (params, filters) {
    for (var key in filters) {
      var param
      var isArrObj
      var filtersArray = filters[key]
      if (_.isArray(filtersArray) && (param = this._fetch(key))) {
        if (_.isArray(param._params) || (isArrObj = Object.keys(param._params).every(function (i) { return !_.isNaN(Number(i)) }))) {
          if (isArrObj) {
            params[key] = _.transform(param._params, function (result, value, key) {
              result[key] = Parameters._isPrimitive(value) ? value : value.permit(filtersArray).value()
            }, {})
          } else if (!param._params.some(Parameters._isPrimitive)) {
            params[key] = param._params.map(function (param) { return param.permit(filtersArray).value() })
          } else {
            params[key] = param._params.filter(function (elem) { return Parameters._isPrimitive(elem) })
          }
          continue
        }
        if (filtersArray.length > 0 && param instanceof Parameters) {
          params[key] = param.permit(filtersArray).value()
          continue
        }
      }
    }
  },

  /**
   * Clones the current instance of Parameters
   *
   * @return {Parameters}
   * @api public
   */

  clone: function () {
    var _this = this
    var parameters = new Parameters()
    parameters._attrs = _.cloneDeep(this._attrs)
    parameters._filters = _.cloneDeep(this._filters)
    parameters._params = (function () {
      if (_.isArray(_this._params)) {
        return Parameters._cloneArray(_this._params)
      } else if (_.isObject(_this._params)) {
        return Parameters._cloneObject(_this._params)
      } else {
        throw new Error('Invalid parameter value', _this._params)
      }
    })()
    return parameters
  }
})

module.exports = Parameters
