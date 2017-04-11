var util = require('util')

function ParameterMissingError (message) {
  Error.captureStackTrace(this, this.constructor)
  this.name = this.constructor.name
  this.message = message
}

util.inherits(ParameterMissingError, Error)
module.exports = ParameterMissingError
