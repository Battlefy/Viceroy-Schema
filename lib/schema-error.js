
var util = require('util');


/**
 * Schema Error constructor
 * @param {Object} errors Errors object
 */
function SchemaError(errors) {
  this.errors = this._unwrapErrors(errors);
  this.message = this._createMessage(this.errors);
}
util.inherits(SchemaError, TypeError);

/**
 * valueOf
 * @return {Object} Errors object.
 */
SchemaError.prototype.valueOf = function() {
  return this.errors;
};

/**
 * toJSON
 * @return {Object} Errors object.
 */
SchemaError.prototype.toJSON = function() {
  return this.errors;
};

/**
 * toString
 * @return {Object} Errors JSON string.
 */
SchemaError.prototype.toString = function() {
  return JSON.stringify(this);
};

SchemaError.prototype._unwrapErrors = function(errors) {
  (function rec(errors) {
    for(var prop in errors) {
      if(
        errors.hasOwnProperty(prop) &&
        errors[prop] !== null &&
        typeof errors[prop] == 'object'
      ) {
        if(typeof errors[prop].message == 'string') {
          errors[prop] = errors[prop].message;
        } else {
          rec(errors[prop]);
        }
      }
    }
  })(errors);
  return errors;
};

SchemaError.prototype._createMessage = function(errors) {
  var errMsgs = [];
  (function rec(path, errors) {
    for(var prop in errors) {
      if(errors.hasOwnProperty(prop)) {
        var subPath = path && path + '.' + prop || prop;
        if(typeof errors[prop] == 'object') {
          rec(subPath, errors[prop]);
        } else {
          errMsgs.push('\t' + subPath + ': ' + errors[prop]);
        }
      }
    }
  })('', errors);
  return 'Schema Error:\n' + errMsgs.join('\n');
};


module.exports = SchemaError;
