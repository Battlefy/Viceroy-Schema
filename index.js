
var Schema = require('./lib/schema');
var SchemaType = require('./lib/schema-rule');

// load up the schema types
require('./lib/types');

exports.create = function(rules) {
  return new Schema(rules);
};
exports.addType = function(Class, opts) {
  return Schema.addType(Class, opts);
};

exports.Schema = Schema;
exports.SchemaType = SchemaType;
