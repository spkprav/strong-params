/* global describe, beforeEach, afterEach, it */
var params = require('../..')
var koa = require('koa')
var bodyparser = require('koa-bodyparser')
var qs = require('koa-qs')
var request = require('request')
var should = require('should')

// should always return an instance

describe('koaMiddleware', function () {
  var ctx

  beforeEach(function () {
    ctx = {}
    ctx.port = 3001
    ctx.url = 'http://localhost:' + ctx.port
    ctx.app = new koa() // eslint-disable-line new-cap
    qs(ctx.app)
    ctx.app.use(bodyparser())
    ctx.app.use(function (ctx, next) {
      ctx.params = { id: 'id' }
      return next()
    })
    ctx.app.use(params.koaMiddleware())
  })

  afterEach(function () {
    ctx.server.close()
  })

  describe('req.parameters.all()', function () {

    it('should return `all` params', function (done) {
      ctx.app.use(function (ctx, next) {
        ctx.body = ctx.parameters.all()
      })
      ctx.server = ctx.app.listen(ctx.port)

      request.post({ url: ctx.url + '/?p1=1&p2=2', form: { a1: 1, a2: 2 } }, function (err, res, body) {
        should(JSON.parse(body)).eql({ p1: '1', p2: '2', a1: '1', a2: '2', id: 'id' })
        done(err)
      })
    })

  })

  describe('req.parameters.permit()', function () {

    it('should return `permit` selected params', function (done) {
      ctx.app.use(function (ctx, next) {
        ctx.body = ctx.parameters.permit('p1', 'a2').value()
      })
      ctx.server = ctx.app.listen(ctx.port)

      request.post({ url: ctx.url + '/?p1=1&p2=2', form: { a1: 1, a2: 2 } }, function (err, res, body) {
        should(JSON.parse(body)).eql({ p1: '1', a2: '2' })
        done(err)
      })
    })

  })

  describe('req.parameters.require()', function () {

    it('should return a `params` object of the required key', function (done) {
      ctx.app.use(function (ctx, next) {
        ctx.body = ctx.parameters.require('p1').all()
      })
      ctx.server = ctx.app.listen(ctx.port)

      request.post({ url: ctx.url + '/?p1[s1]=1&p2=2', form: { p1: { s2: 2 }, a2: 2 } }, function (err, res, body) {
        should(JSON.parse(body)).eql({ s1: '1', s2: '2' })
        done(err)
      })
    })

    it('should throw an exception if the required key does not exist', function (done) {
      ctx.app.use(async function (ctx, next) {
        try {
          await next()
        } catch (err) {
          ctx.response.status = 500
          ctx.response.body = err.message
        }
      })
      ctx.app.use(function (ctx, next) {
        ctx.body = ctx.parameters.require('xx').all()
      })
      ctx.server = ctx.app.listen(ctx.port)

      request.post({ url: ctx.url + '/?p1=1', form: { a1: 1 } }, function (err, res, body) {
        should(res.statusCode).eql(500)
        should(body).equal('param `xx` required')
        done(err)
      })
    })

  })

})
