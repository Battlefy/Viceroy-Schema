
// libs
var Schema = require('./schema');


////////////////
// CORE TYPES //
////////////////

Schema.addType(String, {
  name: 'String',
  validate: function(val) { return typeof val == 'string'; }
});
Schema.addType(Number, {
  name: 'Number',
  validate: function(val) { return typeof val == 'number'; }
});
Schema.addType(Boolean, {
  name: 'Boolean',
  validate: function(val) { return typeof val == 'boolean'; }
});
Schema.addType(Array, {
  name: 'Array',
  validate: function(val) {
    return val !== null && typeof val == 'object' &&
           val.constructor == Array;
  }
});
Schema.addType(Object, {
  name: 'Object',
  validate: function(val) {
    return val !== null && typeof val == 'object' &&
           val.constructor == Object;
  }
});
Schema.addType(Date, {
  name: 'Date',
  validate: function(val) {
    return val !== null && typeof val == 'object' &&
           val.constructor == Date;
  }
});
Schema.addType(RegExp, {
  name: 'RegExp',
  validate: function(val) {
    return val !== null && typeof val == 'object' &&
           val.constructor == RegExp;
  }
});
Schema.addType(Buffer, {
  name: 'Buffer',
  validate: function(val) {
    // allow buffers to be Uint8Arrays for
    // Browserify Buffers.
    return val !== null && typeof val == 'object' &&
           (val.constructor == Buffer || val.constructor === Uint8Array);
  }
});

