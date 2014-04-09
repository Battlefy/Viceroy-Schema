
var test = require('tape');

var SchemaRule = require('../lib/schema-rule');

test('SchemaRule()', function(t) {

  t.throws(function() { new SchemaRule(); });
  t.throws(function() { new SchemaRule(null); });
  t.throws(function() { new SchemaRule(1); });
  t.throws(function() { new SchemaRule('s'); });
  t.throws(function() { new SchemaRule(false); });
  t.throws(function() { new SchemaRule({}); });
  t.throws(function() { new SchemaRule({ type: null }); });
  t.throws(function() { new SchemaRule({ type: 1 }); });
  t.throws(function() { new SchemaRule({ type: 's' }); });
  t.throws(function() { new SchemaRule({ type: false }); });
  t.throws(function() { new SchemaRule({ type: {} }); });
  t.throws(function() { new SchemaRule({ type: [] }); });
  t.throws(function() { new SchemaRule({ type: String, match: null }); });
  t.throws(function() { new SchemaRule({ type: String, match: 1 }); });
  t.throws(function() { new SchemaRule({ type: String, match: 's' }); });
  t.throws(function() { new SchemaRule({ type: String, match: [] }); });
  new SchemaRule(String);
  t.doesNotThrow(function() { new SchemaRule(String); });
  t.doesNotThrow(function() { new SchemaRule({ type: String }); });
  t.doesNotThrow(function() { new SchemaRule({ type: String, match: {} }); });

  t.end();
});

test('schemaRule{}', function(t) {

  var schemaRule = new SchemaRule(String);
  t.equal(schemaRule.type, String);

  schemaRule = new SchemaRule({ type: String, match: { exists: true } });
  t.equal(schemaRule.type, String);
  t.deepEqual(typeof schemaRule.match, 'function');

  t.end();
});

test('schemaRule.validate()', function(t) {

  var schemaRule = new SchemaRule(String);
  t.doesNotThrow(function() { schemaRule.validate(); });
  t.doesNotThrow(function() { schemaRule.validate(null); });
  t.doesNotThrow(function() { schemaRule.validate(1); });
  t.doesNotThrow(function() { schemaRule.validate('s'); });
  t.doesNotThrow(function() { schemaRule.validate(false); });
  t.doesNotThrow(function() { schemaRule.validate({ type: [] }); });
  t.doesNotThrow(function() { schemaRule.validate({ type: String, match: null }); });
  t.doesNotThrow(function() { schemaRule.validate({ type: String, match: 1 }); });
  t.doesNotThrow(function() { schemaRule.validate({ type: String, match: 's' }); });
  t.doesNotThrow(function() { schemaRule.validate({ type: String, match: [] }); });
  t.doesNotThrow(function() { schemaRule.validate(String); });
  t.doesNotThrow(function() { schemaRule.validate({ type: String }); });
  t.doesNotThrow(function() { schemaRule.validate({ type: String, match: {} }); });

  t.end();
});