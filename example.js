


var createSchema = require('viceroy-schema');


createSchema({
  field: String,
  field: Number,
  field: Boolean,
  field: Object,
  field: Array,
  field: RegExp,
  field: [String],
  field: { type: String },
  field: { type: String, match: /pattern/ },
  field: { type: String, match: { lt: 1 } },
  field: { type: String, match: { gt: 1 } },
  field: { type: String, match: { min: 1 } },
  field: { type: String, match: { max: 1 } },
  field: { type: String, match: { len: 1 } },
  field: { type: String, match: { in: [1, 2] } },
  field: { type: String, match: { notIn: [1, 2] } },
  field: { type: String, match: { exists: true } },
  field: { type: String, match: function(val, cb) { return cb(this.foobar == this.bazack); } },
  $strict: true
});