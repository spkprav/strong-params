/* global beforeEach, describe, it */
var should = require('should')
var sinon = require('sinon')

var Parameters = require('..').Parameters
var PRIMITIVE_TYPES = [Boolean, Number, String, function Null () {
  this.valueOf = function () { return null }
}]

describe('Parameters', function () {

  describe('class methods', function () {

    describe('_initValue', function () {
      PRIMITIVE_TYPES.forEach(function (Primitive) {
        it('should return primitive for ' + Primitive.name, function () {
          // Prepare
          var input = new Primitive().valueOf()
          // Test
          var result = Parameters._initValue(input)
          // Verify
          should(result).be.a[Primitive.name]()
        })
      })
      it('should return instance of Parameters', function () {
        // Prepare
        var input = {}
        // Test
        var result = Parameters._initValue(input)
        // Verify
        result.should.be.a.instanceOf(Parameters)
      })
    })

    describe('_isPrimitive', function () {
      PRIMITIVE_TYPES.forEach(function (Primitive) {
        it('should return true for primitive ' + Primitive.name + ' input', function () {
          // Prepare
          var input = new Primitive().valueOf()
          // Test
          var result = Parameters._isPrimitive(input)
          // Verify
          result.should.be.true()
        })
      })
      it('should return false for not primitive Object input', function () {
        // Prepare
        var input = {}
        // Test
        var result = Parameters._isPrimitive(input)
        // Verify
        result.should.be.false()
      })
    })

    describe('clone', function () {
      it('should call instance `clone` for Parameters input', sinon.test(function () {
        // Prepare
        var params = new Parameters()
        this.spy(params, 'clone')
        // Test
        var cloned = Parameters.clone(params)
        // Verify
        params.clone.calledOnce.should.be.true()
        cloned.should.be.instanceOf(Parameters)
        cloned.should.not.equal(params)
      }))
      it('should return input if it is not instance of Parameters', function () {
        // Prepare
        var primitive = Number()
        // Test
        var cloned = Parameters.clone(primitive)
        // Verify
        cloned.should.equal(primitive)
      })
    })

    describe('_cloneArray', function () {
      it('should return correctly', sinon.test(function () {
        // Prepare
        var cb = this.stub(Parameters, 'clone', function (input) { return input })
        var input = [1, 3, 2]
        // Test
        var result = Parameters._cloneArray(input)
        // Verify
        result.should.eql(input)
        cb.callCount.should.equal(3)
      }))
    })

    describe('_cloneObject', function () {
      it('should return correctly', sinon.test(function () {
        // Prepare
        var cb = this.stub(Parameters, 'clone', function (input) { return input })
        var input = {
          first: 1,
          second: 3,
          third: 2
        }
        // Test
        var result = Parameters._cloneObject(input)
        // Verify
        result.should.eql(input)
        cb.callCount.should.equal(3)
      }))
    })

  })

  describe('instance methods', function () {})

  describe('operations', function () {

    describe('constructing', function () {})
    describe('cloning', function () {})
    describe('whitelisting', function () {
      var params

      beforeEach(function () {
        params = new Parameters({
          primBoolean: true,
          primNumber: 1,
          primString: 'string',
          array: [1, 3, 2],
          objectArray: [
            {
              primBoolean: true,
              primNumber: 1,
              primString: 'string',
              otherPrimary: 'other',
              array: [1, 3, 2]
            },
            {
              primBoolean: false,
              primNumber: 2,
              primString: '',
              otherPrimary: 'other',
              array: [4, 6, 5]
            }
          ],
          objectNotatedArray: {
            '0': {
              primBoolean: true,
              primNumber: 1,
              primString: 'string',
              otherPrimary: 'other'
            },
            '20': {
              primBoolean: false,
              primNumber: 2,
              primString: '',
              otherPrimary: 'other'
            }
          },
          object: {
            primBoolean: true,
            primNumber: 1,
            primString: 'string',
            array: [1, 3, 2],
            nestedObject: {
              primBoolean: true,
              primNumber: 1,
              primString: 'string',
              array: [1, 3, 2]
            }
          },
          anotherObject: {
            primBoolean: true,
            primNumber: 1,
            primString: 'string',
            array: [1, 3, 2]
          }
        })
      })

      it('should whitelist primitives correctly', function () {
        // Prepare
        var filters = ['primBoolean', 'primNumber', 'primString']
        // Test
        var result = params.permit(filters).value()
        // Verify
        result.should.eql({
          primBoolean: true,
          primNumber: 1,
          primString: 'string'
        })
      })

      it('should whitelist primitives array correctly', function () {
        // Prepare
        var filters = [{array: []}]
        // Test
        var result = params.permit(filters).value()
        // Verify
        result.should.eql({
          array: [1, 3, 2]
        })
      })

      it('should whitelist nested object correctly', function () {
        // Prepare
        var filters = [{object: [{array: [], nestedObject: ['primBoolean', 'primNumber', 'primString']}]}]
        // Test
        var result = params.permit(filters).value()
        // Verify
        result.should.eql({
          object: {
            array: [1, 3, 2],
            nestedObject: {
              primBoolean: true,
              primNumber: 1,
              primString: 'string'
            }
          }
        })
      })

      it('should whitelist object array correctly', function () {
        // Prepare
        var filters = [{objectArray: ['primBoolean', 'primNumber', 'primString', {array: []}]}]
        // Test
        var result = params.permit(filters).value()
        // Verify
        result.should.deepEqual({
          objectArray: [
            {
              primBoolean: true,
              primNumber: 1,
              primString: 'string',
              array: [1, 3, 2]
            },
            {
              primBoolean: false,
              primNumber: 2,
              primString: '',
              array: [4, 6, 5]
            }
          ]
        })
      })

      it('should whitelist of same fingerprint object and array correctly', function () {
        // Prepare
        var filters = [{objectArray: ['primBoolean', 'primNumber', 'primString', {array: []}], anotherObject: ['primBoolean', 'primNumber', 'primString', {array: []}]}]
        // Test
        var result = params.permit(filters).value()
        // Verify
        result.should.deepEqual({
          objectArray: [
            {
              primBoolean: true,
              primNumber: 1,
              primString: 'string',
              array: [1, 3, 2]
            },
            {
              primBoolean: false,
              primNumber: 2,
              primString: '',
              array: [4, 6, 5]
            }
          ],
          anotherObject: {
            primBoolean: true,
            primNumber: 1,
            primString: 'string',
            array: [1, 3, 2]
          }
        })
      })

      it('should whitelist object notated array correctly', function () {
        // Prepare
        var filters = [{objectNotatedArray: ['primBoolean', 'primNumber', 'primString']}]
        // Test
        var result = params.permit(filters).value()
        // Verify
        result.should.deepEqual({
          objectNotatedArray: {
            '0': {
              primBoolean: true,
              primNumber: 1,
              primString: 'string'
            },
            '20': {
              primBoolean: false,
              primNumber: 2,
              primString: ''
            }
          }
        })
      })
    })

  })

})
