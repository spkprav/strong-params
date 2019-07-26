/* global describe, beforeEach, afterEach, it */
var params = require('../..')
var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var should = require('should')

describe('expressMiddleware', function () {
  var ctx

  beforeEach(function () {
    ctx = {}
    ctx.port = 3001
    ctx.url = 'http://localhost:' + ctx.port
    ctx.app = express()
    ctx.app.use(bodyParser.json())
    ctx.app.use(bodyParser.urlencoded({ extended: true }))
    ctx.app.use(params.expressMiddleware())
  })

  afterEach(function () {
    ctx.server.close()
  })

  describe('req.parameters.all()', function () {
    it('should return `all` params', function (done) {
      ctx.app.use(function (req, res, next) {
        res.json(req.parameters.all())
      })
      ctx.server = ctx.app.listen(ctx.port)

      request.post({ url: ctx.url + '/?p1=1&p2=2', form: { a1: 1, a2: 2 } }, function (err, res, body) {
        should(JSON.parse(body)).eql({ p1: '1', p2: '2', a1: '1', a2: '2' })
        done(err)
      })
    })
  })

  describe('req.parameters.permit()', function () {
    it('should return `permit` selected params', function (done) {
      ctx.app.use(function (req, res, next) {
        res.json(req.parameters.permit('p1', 'a2').value())
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
      ctx.app.use(function (req, res, next) {
        res.json(req.parameters.require('p1').all())
      })
      ctx.server = ctx.app.listen(ctx.port)

      request.post({ url: ctx.url + '/?p1[s1]=1&p2=2', form: { p1: { s2: 2 }, a2: 2 } }, function (err, res, body) {
        should(JSON.parse(body)).eql({ s1: '1', s2: '2' })
        done(err)
      })
    })

    it('should throw an exception if the required key does not exist', function (done) {
      ctx.app.use(function (req, res, next) {
        res.json(req.parameters.require('xx').all())
      })
      ctx.app.use(function (err, req, res, next) {
        should(err.message).equal('param `xx` required')
        res.status(500).send()
      })
      ctx.server = ctx.app.listen(ctx.port)

      request.post({ url: ctx.url + '/?p1=1', form: { a1: 1 } }, function (err, res, body) {
        should(res.statusCode).eql(500)
        done(err)
      })
    })
  })
})
