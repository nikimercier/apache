# dc-utils
[![Travis Build](https://img.shields.io/travis/dcortes92/dc-utils.svg?maxAge=2592000)](https://travis-ci.org/dcortes92/dc-utils)
[![Codecov](https://img.shields.io/codecov/c/github/dcortes92/dc-utils.svg?maxAge=2592000)](https://codecov.io/github/dcortes92/dc-utils)
[![npm](https://img.shields.io/npm/dm/dc-utils.svg?maxAge=2592000)](http://npm-stat.com/charts.html?package=dc-utils)
[![npm](https://img.shields.io/npm/v/dc-utils.svg?maxAge=2592000)](https://www.npmjs.com/package/dc-utils)

This library was created following the series *How to Write an Open Source JavaScript Library by @kentcdodds for egghead.io*

## Installation

`npm install -g dc-utils`

## Usage

```javascript
var dc = require('dc-utils')

// check if an array
dc.isArray(['2', 'a', '4']) //true
dc.isArray(42) //false

// sorting an array
var arr = [7, 5, 3, 10, 6, 1 ,8]
dc.sort(arr) // [1, 3, 5, 6, 7, 8, 10]
dc.sort(42) // []

// sorting using a comparisson function
var arr = [
    { first: 'daniel', last: 'cortes' },
    { first: 'tim', last: 'drake' },
    { first: 'bruce', last: 'wayne' },
    { first: 'kate', last: 'kane'}
]

arr.sort(dc.by('first')) 
// output:
// [ { first: 'bruce', last: 'wayne' },
//   { first: 'daniel', last: 'cortes' },
//   { first: 'kate', last: 'kane'},
//   { first: 'tim', last: 'drake' }
// ]

```

## Attribution
The code used by this library was adapted from the book "_Javascript: The Good Parts by Douglas Crockford._"