Viceroy Schema
==============

Viceroy Schema is a schema implementation
developed for the (soon to be released) Viceroy ORM.

Designed as a standalone package to allow anyone
to use schemas without needing an entire ORM.

Use it with node or in the browser using
browserify.

```shell
npm install viceroy-schema
```

[![NPM version](https://badge.fury.io/js/viceroy-schema.png)](http://badge.fury.io/js/viceroy-schema)

[![Browser Support](https://ci.testling.com/Battlefy/Viceroy-Schema.png)](https://ci.testling.com/Battlefy/Viceroy-Schema)

Example
-------
```javascript
var schema = require('viceroy-schema');

// create a schema for a person object.
var s = schema.create({
  name: {
    first: String,
    last: String
  },
  born: Date,
  sex: { type: String, match: { in: ['M', 'F'] }}
});

// create a person object containing some guy
// named mike.
var mike = {
  name: {
    first: 'Mike',
    last: 'Wright'
  },
  born: new Date(1982, 4, 7),
  sex: 'M'
};

// validate mike against our schema.
s.validate(mike, function(err) {
  // since mike is a valid person object we
  // don't get any errors.
  err => null;
});

// now lets create a person object for some
// lady named sue.
var sue = {
  name: {
    first: 'Sue',
    last: 0
  },
  born: '1971, 23, 14',
  sex: 'female'
};

// validate sue against our schema.
s.validate(sue, function(err) {
  // sue doesn't pass validation.
  // The err object contains paths to
  // each schema rule error.
  err => {
    name: {
      last: 'Must be an instance of String'
    },
    born: 'Must be an instance of Date',
    sex: 'Must be one of the following values: \'M\', \'F\''
  };
});
```

Possible Schema Rules
---------------------
Below is an example of the possible fields in
a schema rule set.

```javascript
{
  // Valid types
  field: String,
  field: Number,
  field: Boolean,
  field: Date,
  field: RegExp,
  field: Object,
  field: Array,
  field: Buffer,
  
  // Valid rules
  field: Type, // Shorthand for { type: Type }.
  field: { type: Type }, // value must be a an instance of 'Type'.
  field: { type: Type, match: /pattern/ }, // Value must match /pattern/.
  field: { type: Type, match: { lt: 10 }}, // Value must be less than 10.
  field: { type: Type, match: { lt: 'abc' }}, // Value must be less than 'abc'.
  field: { type: Type, match: { gt: 10 }}, // Value must be greater than 10.
  field: { type: Type, match: { gt: 'abc' }}, // Value must be greater than 'abc'.
  field: { type: Type, match: { min: 10 }}, // Value must be longer than 10 chars.
  field: { type: Type, match: { max: 10 }}, // Value must be shorter than 10 chars.
  field: { type: Type, match: { length: 10 }}, // Value must be 10 chars in length.
  field: { type: Type, match: { in: ['a', 'b'] }}, // Value must be 'a' or 'b'.
  field: { type: Type, match: { notIn: ['a', 'b'] }}, // Value must not be 'a' or 'b'.
  field: { type: Type, match: { exists: true }}, // Value must exist.
  field: { type: Type, match: function(val) { return new Error('err'); } }, // Value must not cause fn to return an error.
  field: { type: Type, match: function(val, cb) { cb(new Error('err')); } }, // Value must not cause fn to callback with an error.
  
  // Nest rules within sub objects
  field: {
    subField: String // All of the above rule formats can be used here...
  },
  
  // Require that value or sub objects
  // be wrapped within an array.
  field: [String], // Value must be an array of strings.
  field: [{ // Value must be an array of sub objects.
    subField: String // All of the above rule formats can be used here...
  }],
  
  // schema options.
  $strict: true // disallow extra fields not in the schema.
}
```

Schema
-----
```javascript
schema(Object rules) => Schema s
```
Creates a new schema. The schema can be used
to validate any object and deterime if it
matches the rules within the schema.

The each rule within the schema must have a
type. Valid types are:
- `String`
- `Number`
- `Boolean`
- `Date`
- `Buffer`
- `RexExp`
- `Object`
- `Array`

Note that `Object` can contain any object.
Anything contained within the object will be
ignored by the schema. `Array` will match any
array, and its contents will also be ignored.
These can be used as mixed types.

Rules can also have match conditions. These
match conditions are optional.

#### Pattern Match
```javascript
{ field: { type: String, match: /pattern/ }}
```
Will match a value matching the pattern
/pattern/.

#### Exists
```javascript
{ field: { type: String, match: { exists: true }}}
```
Will match a value if it exists. By default
values can be undefined. Exists forces then
to be present in order to pass validation.

#### Less Than
```javascript
{ field: { type: String, match: { lt: 'abc' }}}
{ field: { type: Number, match: { lt: 10 }}}
```
The first example will match a value less
than 'abc'. The second example will match
a value less than 10.

#### Greater Than
```javascript
{ field: { type: String, match: { gt: 'abc' }}}
{ field: { type: Number, match: { gt: 10 }}}
```
The first example will match a value greater
than 'abc'. The second example will match
a value greater than 10.

#### Minimun Length
```javascript
{ field: { type: String, match: { min: 10 }}}
```
Will match a value longer or equal to 10
characters in length.

#### Maximum Length
```javascript
{ field: { type: String, match: { max: 10 }}}
```
Will match a value shorter or equal to 10
characters in length.

#### Length
```javascript
{ field: { type: String, match: { length: 10 }}}
```
Will match a value equal to 10 characters
in length.

#### In
```javascript
{ field: { type: String, match: { in: ['a', 'b'] }}}
```
Will match a value equal to 'a' or 'b'.

#### Not In
```javascript
{ field: { type: String, match: { notIn: ['a', 'b'] }}}
```
Will match a value not equal to 'a' or 'b'.

#### Custom Validatiors
```javascript
{ field: { type: String, match: function(val) { ... } }}
{ field: { type: String, match: function(val, cb) { ... } }}
```
If you need to do custom validation on a field a
validation function can be passed as the match
contition.

```javascript
{ field: { type: String, match: function(val) { ... } }}
```
A validation function with a single argument 
will be passed the value of the field and
is expected to return an error if validation
fails. If nothing is returned then the value 
will pass validation.

```javascript
{ field: { type: String, match: function(val, cb) { ... } }}
```
A validation function with a two arguments
will be passed the value of the field and a
callback. It will be is expected to callback
with an error if validation fails.
If the callback is executed with no arguments
then the value will pass validation.
