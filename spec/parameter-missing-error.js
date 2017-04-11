/* global describe, it */
var ParameterMissingError = require('..').ParameterMissingError

describe('ParameterMissingError', function () {
  it('should be instance of Error', function () {
    var subject = new ParameterMissingError()
    subject.should.be.a.instanceOf(Error)
  })

  it('should assing a message passed in constructor', function () {
    var message = 'lorem ipsum'
    var subject = new ParameterMissingError(message)
    subject.message.should.eql(message)
  })
})
