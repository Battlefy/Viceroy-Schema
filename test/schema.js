
var createSchema = require('../').create;
var SchemaType = require('../').SchemaType;
var test = require('tape');


test('Schema()', function(t) {

  t.throws(function() { createSchema(); });
  t.throws(function() { createSchema(null); });
  t.throws(function() { createSchema(1); });
  t.throws(function() { createSchema('s'); });
  t.throws(function() { createSchema({ field: { invalid: true } }); });
  t.doesNotThrow(function() { createSchema({}); });

  var schema = createSchema({ field: String });
  t.equal(typeof schema.rules.field, 'object');
  t.equal(schema.rules.field.constructor, SchemaType);
  t.equal(schema.rules.field.type, String);

  schema = createSchema({ field: { type: String } });
  t.equal(typeof schema.rules.field, 'object');
  t.equal(schema.rules.field.constructor, SchemaType);
  t.equal(schema.rules.field.type, String);

  var pattern = /pattern/;
  schema = createSchema({ field: { type: String, match: pattern } });
  t.equal(typeof schema.rules.field, 'object');
  t.equal(schema.rules.field.constructor, SchemaType);
  t.equal(schema.rules.field.type, String);
  t.equal(typeof schema.rules.field.match, 'function');

  var fn = function() {};
  schema = createSchema({ field: { type: String, match: fn } });
  t.equal(typeof schema.rules.field, 'object');
  t.equal(schema.rules.field.constructor, SchemaType);
  t.equal(schema.rules.field.type, String);
  t.equal(schema.rules.field.match, fn);

  var fn = function() {};
  schema = createSchema({ field: { type: String, match: fn } });
  t.equal(typeof schema.rules.field, 'object');
  t.equal(schema.rules.field.constructor, SchemaType);
  t.equal(schema.rules.field.type, String);
  t.equal(schema.rules.field.match, fn);

  t.end();
});

test('schema{}', function(t) {

  var schema = createSchema({ field: String });
  t.equal(typeof schema, 'object');
  t.equal(typeof schema.validate, 'function');
  t.equal(typeof schema.rules, 'object');
  t.equal(typeof schema.opts, 'object');

  t.end();
});

test('schema.validate()', function(t) {

  var schema = createSchema({ field: String });
  t.doesNotThrow(function() { schema.validate(); });
  t.doesNotThrow(function() { schema.validate({}, function() {}); });
  t.doesNotThrow(function() { schema.validate(null, function() {}); });
  t.doesNotThrow(function() { schema.validate(1, function() {}); });
  t.doesNotThrow(function() { schema.validate('s', function() {}); });
  t.doesNotThrow(function() { schema.validate(true, function() {}); });
  schema.validate(null, function(err) {
    t.ok(err);
    t.equal(err.message, 'must be an object');
  });
  schema.validate(1, function(err) {
    t.ok(err);
    t.equal(err.message, 'must be an object');
  });
  schema.validate('s', function(err) {
    t.ok(err);
    t.equal(err.message, 'must be an object');
  });
  schema.validate(false, function(err) {
    t.ok(err);
    t.equal(err.message, 'must be an object');
  });
  schema.validate({}, function(err) {
    t.error(err);
  });

  var tests = [

    { schema: { field: String }, obj: {}, expected: null },
    { schema: { field: Number }, obj: {}, expected: null },
    { schema: { field: Boolean }, obj: {}, expected: null },
    { schema: { field: Array }, obj: {}, expected: null },
    { schema: { field: Object }, obj: {}, expected: null },
    { schema: { field: Date }, obj: {}, expected: null },
    { schema: { field: RegExp }, obj: {}, expected: null },
    { schema: { field: Buffer }, obj: {}, expected: null },

    { schema: { field: { type: String, match: /pattern/ }}, obj: { field: '' }, expected: { field: 'Must match expression /pattern/' }},
    { schema: { field: { type: String, match: /pattern/ }}, obj: { field: 'pattern' }, expected: null },
    { schema: { field: { type: String, match: { lt: 'b' }}}, obj: { field: 'c' }, expected: { field: 'Must be less than than b' }},
    { schema: { field: { type: String, match: { lt: 'b' }}}, obj: { field: 'a' }, expected: null },
    { schema: { field: { type: String, match: { gt: 'b' }}}, obj: { field: 'a' }, expected: { field: 'Must be greater than b' }},
    { schema: { field: { type: String, match: { gt: 'b' }}}, obj: { field: 'c' }, expected: null },
    { schema: { field: { type: String, match: { min: 2 }}}, obj: { field: 'a' }, expected: { field: 'Must be greater than 2 chars in length' }},
    { schema: { field: { type: String, match: { min: 2 }}}, obj: { field: 'ab' }, expected: null },
    { schema: { field: { type: String, match: { max: 2 }}}, obj: { field: 'abc' }, expected: { field: 'Must be less than 2 chars in length' }},
    { schema: { field: { type: String, match: { max: 2 }}}, obj: { field: 'ab' }, expected: null },
    { schema: { field: { type: String, match: { length: 2 }}}, obj: { field: 'a' }, expected: { field: 'Must be 2 chars in length' }},
    { schema: { field: { type: String, match: { length: 2 }}}, obj: { field: 'abc' }, expected: { field: 'Must be 2 chars in length' }},
    { schema: { field: { type: String, match: { length: 2 }}}, obj: { field: 'ab' }, expected: null },
    { schema: { field: { type: String, match: { in: ['a', 'b'] }}}, obj: { field: '' }, expected: { field: 'Must match one of the following values: \'a\', \'b\'' }},
    { schema: { field: { type: String, match: { in: ['a', 'b'] }}}, obj: { field: 'a' }, expected:  null },
    { schema: { field: { type: String, match: { in: ['a', 'b'] }}}, obj: { field: 'b' }, expected:  null },
    { schema: { field: { type: String, match: { notIn: ['a', 'b'] }}}, obj: { field: '' }, expected: null },
    { schema: { field: { type: String, match: { notIn: ['a', 'b'] }}}, obj: { field: 'a' }, expected:  { field: 'Must not match any of the following values: \'a\', \'b\'' }},
    { schema: { field: { type: String, match: { notIn: ['a', 'b'] }}}, obj: { field: 'b' }, expected:  { field: 'Must not match any of the following values: \'a\', \'b\'' }},
    { schema: { field: { type: String, match: { exists: true }}}, obj: {}, expected: { field: 'Must exist' }},
    { schema: { field: { type: String, match: { exists: true }}}, obj: { field: '' }, expected: null },
    { schema: { field: { type: String, match: function(val) { t.equal(val, ''); return new Error('test err'); } }}, obj: { field: '' }, expected: { field: 'test err' }},
    { schema: { field: { type: String, match: function(val) { t.equal(val, ''); } }}, obj: { field: '' }, expected: null },
    
    { schema: { field: { field: String }}, obj: {}, expected: { field: 'Must be an instance of Object' }},
    { schema: { field: { field: String }}, obj: { field: '' }, expected: { field: 'Must be an instance of Object' }},
    { schema: { field: { field: String }}, obj: { field: {} }, expected: null },
    { schema: { field: { field: { type: String, match: { exists: true }}}}, obj: { field: {} }, expected: { field: { field: 'Must exist' }}},
    { schema: { field: { field: String }}, obj: { field: { field: 1 } }, expected: { field: { field: 'Must be an instance of String' }}},
    { schema: { field: { field: String }}, obj: { field: { field: '' } }, expected: null },
    { schema: { field: [{ field: String }] }, obj: {}, expected: { field: 'Must be an instance of Array' }},
    { schema: { field: [{ field: String }] }, obj: { field: {} }, expected: { field: 'Must be an instance of Array' } },
    { schema: { field: [{ field: String }] }, obj: { field: { field: '' } }, expected: { field: 'Must be an instance of Array' } },
    { schema: { field: [{ field: String }] }, obj: { field: [] }, expected: null },
    { schema: { field: [{ field: String }] }, obj: { field: [{ field: 1 }] }, expected: { field: [{ field: 'Must be an instance of String' }] }},
    { schema: { field: [{ field: String }] }, obj: { field: [{ field: '' }] }, expected: null },

    { schema: { field: String }, obj: { field: '' }, expected: null },
    { schema: { field: Number }, obj: { field: 1 }, expected: null },
    { schema: { field: Boolean }, obj: { field: true }, expected: null },
    { schema: { field: Array }, obj: { field: [] }, expected: null },
    { schema: { field: Object }, obj: { field: {} }, expected: null },
    { schema: { field: Date }, obj: { field: new Date() }, expected: null },
    { schema: { field: RegExp }, obj: { field: /pattern/ }, expected: null },
    { schema: { field: Buffer }, obj: { field: new Buffer('') }, expected: null },

    { schema: { field: String }, obj: { field: 1 }, expected: { field: 'Must be an instance of String' } },
    { schema: { field: String }, obj: { field: true }, expected: { field: 'Must be an instance of String' } },
    { schema: { field: String }, obj: { field: [] }, expected: { field: 'Must be an instance of String' } },
    { schema: { field: String }, obj: { field: {} }, expected: { field: 'Must be an instance of String' } },
    { schema: { field: String }, obj: { field: new Date() }, expected: { field: 'Must be an instance of String' } },
    { schema: { field: String }, obj: { field: /pattern/ }, expected: { field: 'Must be an instance of String' } },
    { schema: { field: String }, obj: { field: new Buffer('') }, expected: { field: 'Must be an instance of String' } },

    { schema: { field: Number }, obj: { field: '' }, expected: { field: 'Must be an instance of Number' } },
    { schema: { field: Number }, obj: { field: true }, expected: { field: 'Must be an instance of Number' } },
    { schema: { field: Number }, obj: { field: [] }, expected: { field: 'Must be an instance of Number' } },
    { schema: { field: Number }, obj: { field: {} }, expected: { field: 'Must be an instance of Number' } },
    { schema: { field: Number }, obj: { field: new Date() }, expected: { field: 'Must be an instance of Number' } },
    { schema: { field: Number }, obj: { field: /pattern/ }, expected: { field: 'Must be an instance of Number' } },
    { schema: { field: Number }, obj: { field: new Buffer('') }, expected: { field: 'Must be an instance of Number' } },

    { schema: { field: Boolean }, obj: { field: '' }, expected: { field: 'Must be an instance of Boolean' } },
    { schema: { field: Boolean }, obj: { field: 1 }, expected: { field: 'Must be an instance of Boolean' } },
    { schema: { field: Boolean }, obj: { field: [] }, expected: { field: 'Must be an instance of Boolean' } },
    { schema: { field: Boolean }, obj: { field: {} }, expected: { field: 'Must be an instance of Boolean' } },
    { schema: { field: Boolean }, obj: { field: new Date() }, expected: { field: 'Must be an instance of Boolean' } },
    { schema: { field: Boolean }, obj: { field: /pattern/ }, expected: { field: 'Must be an instance of Boolean' } },
    { schema: { field: Boolean }, obj: { field: new Buffer('') }, expected: { field: 'Must be an instance of Boolean' } },

    { schema: { field: Array }, obj: { field: '' }, expected: { field: 'Must be an instance of Array' } },
    { schema: { field: Array }, obj: { field: 1 }, expected: { field: 'Must be an instance of Array' } },
    { schema: { field: Array }, obj: { field: true }, expected: { field: 'Must be an instance of Array' } },
    { schema: { field: Array }, obj: { field: {} }, expected: { field: 'Must be an instance of Array' } },
    { schema: { field: Array }, obj: { field: new Date() }, expected: { field: 'Must be an instance of Array' } },
    { schema: { field: Array }, obj: { field: /pattern/ }, expected: { field: 'Must be an instance of Array' } },
    { schema: { field: Array }, obj: { field: new Buffer('') }, expected: { field: 'Must be an instance of Array' } },

    { schema: { field: Object }, obj: { field: '' }, expected: { field: 'Must be an instance of Object' } },
    { schema: { field: Object }, obj: { field: 1 }, expected: { field: 'Must be an instance of Object' } },
    { schema: { field: Object }, obj: { field: true }, expected: { field: 'Must be an instance of Object' } },
    { schema: { field: Object }, obj: { field: [] }, expected: { field: 'Must be an instance of Object' } },
    { schema: { field: Object }, obj: { field: new Date() }, expected: { field: 'Must be an instance of Object' } },
    { schema: { field: Object }, obj: { field: /pattern/ }, expected: { field: 'Must be an instance of Object' } },
    { schema: { field: Object }, obj: { field: new Buffer('') }, expected: { field: 'Must be an instance of Object' } },

    { schema: { field: Date }, obj: { field: '' }, expected: { field: 'Must be an instance of Date' } },
    { schema: { field: Date }, obj: { field: 1 }, expected: { field: 'Must be an instance of Date' } },
    { schema: { field: Date }, obj: { field: true }, expected: { field: 'Must be an instance of Date' } },
    { schema: { field: Date }, obj: { field: [] }, expected: { field: 'Must be an instance of Date' } },
    { schema: { field: Date }, obj: { field: {} }, expected: { field: 'Must be an instance of Date' } },
    { schema: { field: Date }, obj: { field: /pattern/ }, expected: { field: 'Must be an instance of Date' } },
    { schema: { field: Date }, obj: { field: new Buffer('') }, expected: { field: 'Must be an instance of Date' } },

    { schema: { field: RegExp }, obj: { field: '' }, expected: { field: 'Must be an instance of RegExp' } },
    { schema: { field: RegExp }, obj: { field: 1 }, expected: { field: 'Must be an instance of RegExp' } },
    { schema: { field: RegExp }, obj: { field: true }, expected: { field: 'Must be an instance of RegExp' } },
    { schema: { field: RegExp }, obj: { field: [] }, expected: { field: 'Must be an instance of RegExp' } },
    { schema: { field: RegExp }, obj: { field: {} }, expected: { field: 'Must be an instance of RegExp' } },
    { schema: { field: RegExp }, obj: { field: new Date() }, expected: { field: 'Must be an instance of RegExp' } },
    { schema: { field: RegExp }, obj: { field: new Buffer('') }, expected: { field: 'Must be an instance of RegExp' } },

    { schema: { field: Buffer }, obj: { field: '' }, expected: { field: 'Must be an instance of Buffer' } },
    { schema: { field: Buffer }, obj: { field: 1 }, expected: { field: 'Must be an instance of Buffer' } },
    { schema: { field: Buffer }, obj: { field: true }, expected: { field: 'Must be an instance of Buffer' } },
    { schema: { field: Buffer }, obj: { field: [] }, expected: { field: 'Must be an instance of Buffer' } },
    { schema: { field: Buffer }, obj: { field: {} }, expected: { field: 'Must be an instance of Buffer' } },
    { schema: { field: Buffer }, obj: { field: new Date() }, expected: { field: 'Must be an instance of Buffer' } },
    { schema: { field: Buffer }, obj: { field: /pattern/ }, expected: { field: 'Must be an instance of Buffer' } },
  ];
  for(var i = 0; i < tests.length; i += 1) {
    var test = tests[i];
    schema = createSchema(test.schema);
    schema.validate(test.obj, function(err) {
      if(test.expected) {
        t.deepEqual(test.expected, err.errors, 't' + i);
      } else {
        t.error(err, 't' + i);
      }
    });
  }

  schema = createSchema({
    field: {
      type: String,
      match: function(val, cb) {
        t.equal(val, '');
        setTimeout(function() {
          cb(new Error('test err'));
        }, 10);
      }
    }
  });
  schema.validate({ field: '' }, function(err) {
    t.equal(err.errors.field, 'test err');
    t.end();
  });
});

