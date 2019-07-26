# strong-params

![Build Status](https://travis-ci.org/ssowonny/strong-params.svg?branch=master)&nbsp;[![NPM version](https://badge.fury.io/js/strong-params.svg)](http://badge.fury.io/js/strong-params)

Rails-style implementation of strong parameters. It supports [Express](http://expressjs.com/), [Koa](https://github.com/koajs/koa) and also can be used as standalone. The middleware adds the `parameters` object to the [Express request](http://expressjs.com/4x/api.html#req) (or `ctx.parameters` for [Koa context](http://koajs.com/#context)) which returns an object, built from `query string`, `request body` and `route params` data. The returned object has some useful methods allows for data `requiring` and `filtering`.

## Notice

The implementation of strong parameters was previously forked from [koa-strong-params](https://github.com/xpepermint/koa-strong-params) but now has it's own implementation. Along with this change `only`, `except` and `merge` methods have been dropped from the API as they do not exist in Rails Strong Parameters API.

## Installation

Install the [npm](https://www.npmjs.org/package/strong-params) package.

```
npm install strong-params --save
```

#### Attach the middleware.

##### Express

```js
var express = require('express')
var params = require('strong-params')
app.use(params.expressMiddleware())
```

##### Koa

```js
var koa = require('koa')
var params = require('strong-params')
var app = new koa()
app.use(params.koaMiddleware())
```

## Usage

### Get strong parameters

##### Express

```js
app.use(function (req, res, next) {
  var params = req.parameters
})
```

##### Koa

```js
app.use(function (ctx, next) {
  var params = ctx.parameters
})
```

##### Standalone

```js
var Parameters = require('strong-params').Parameters
var params = Parameters({
  id: '13',
  name: 'Bob',
  age: '13',
  hobbies: ['skydiving', 'football', 'photographing'],
  address: {
    country: 'US',
    street: '261 West'
  },
  contacts: [
    {
      type: 'e-mail',
      value: 'bob@random.rnd'
    }, {
      type: 'mobile',
      value: '+123987456'
    }
  ]
})
```

### Methods

```js
// All available params
params.all()
// -> { id: '13', name: 'Bob', age: '13', hobbies: ['skydiving', 'football', 'photographing'], address: { country: 'US', street: '261 West' }, contacts: [{ type: 'e-mail', value: 'bob@random.rnd' }, { type: 'mobile', value: '+123987456' }] }

// Only selected params
params.permit('name', 'age').value()
// -> { name: 'Bob', age: '13' }

params.permit('id', 'name', {hobbies: []}).value()
// -> { id: '13', name: 'Bob', hobbies: ['skydiving', 'football', 'photographing'] }

params.permit('id', 'name', {contacts: []}).value()
// -> { id: '13', name: 'Bob', contacts: [] }

params.permit('id', 'name', {contacts: ['type', 'value']}).value()
// -> { id: '13', name: 'Bob', contacts: [{ type: 'e-mail', value: 'bob@random.rnd' }, { type: 'mobile', value: '+123987456' }] }

// All params of a sub-object
params.require('address').all()
// -> { country: 'US', street: '261 West' }

// All params of a sub-object
params.require('contacts').permit('type', 'value').value()
// -> [{ type: 'e-mail', value: 'bob@random.rnd' }, { type: 'mobile', value: '+123987456' }]
```

### Errors

```js
// ParameterMissingError
try {
  params.require('missingKey')
} catch(err) {
  err instanceof ParameterMissingError // -> true
  err instanceof Error // -> true
}
```

Look [Rails Strong Parameters specification](http://edgeguides.rubyonrails.org/action_controller_overview.html#strong-parameters) for more information.

## Contributing

Please follow [Contributing](./CONTRIBUTING.md)
