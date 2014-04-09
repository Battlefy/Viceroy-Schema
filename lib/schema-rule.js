
// modules
var equal = require('deep-equal');


/**
 * SchemaRule constructor
 * @constructor
 * @param {Object|SchemaRule} rule Rule object or SchemaRule instance.
 */
function SchemaRule(rule) {

  // defaults
  if(typeof rule == 'function') { rule = { type: rule }; }

  // validate
  if(rule === null || typeof rule != 'object') { throw new Error('rule must be an object'); }
  if(typeof rule.type != 'function') { throw new Error('rule.type must be a constructor'); }
  if(
    rule.match !== undefined &&
    typeof rule.match != 'function' &&
    (typeof rule.match != 'object' || rule.match.constructor != Object) &&
    (typeof rule.match != 'object' || rule.match.constructor != RegExp)
  ) { throw new Error('rule.type must be a constructor, regular expression, or object'); }

  // process match conditions
  if(rule.match && typeof rule.match != 'function') {
    rule.match = this._processMatchConditions(rule.match);
  }

  // setup
  this.type = rule.type;
  if(rule.match) { this.match = rule.match; }
}

/**
 * Allowed properties within a rule.
 * @type {Array}
 */
SchemaRule.ruleProps = ['type', 'match'];

/**
 * Allowed properties within a match condition.
 * @type {Array}
 */
SchemaRule.matchProps = ['not', 'exists', 'lt', 'gt', 'min', 'max', 'length', 'in', 'notIn'];

/**
 * Types array. Populated by Schema class.
 * @type {Array}
 */
SchemaRule.types = null;

/**
 * Register object for type.
 * @param  {Function} Class Type class.
 * @param  {Object}   opts  Type opts.
 * @return {Object}         Type object.
 */
SchemaRule.addType = function() {
  throw new Error('Types has not been setup. Has Schema been correctly loaded?');
};

/**
 * Get registered type object.
 * @param  {Function|String} Class Type class.
 * @return {Object}                Type object.
 */
SchemaRule.getType = SchemaRule.addType;

/**
 * Check an object to see if its a valid rule object.
 * @param  {Object|SchemaRule}  rule Rule object of SchemaRule instance.
 * @return {Boolean}                 Is a valid rule.
 */
SchemaRule.isRule = function(rule) {
  var keys = Object.keys(rule);

  // if there are more than two keys its not a
  // rule.
  if(keys.length > 2) { return false; }

  // ensure that only valid keys are used.
  for(var i = 0; i < keys.length; i += 1) {
    if(SchemaRule.ruleProps.indexOf(keys[i]) == -1) { return false; }
  }

  // ensure the type of type and match
  if(typeof rule.type != 'function') { return false; }
  if(
    rule.match !== undefined &&
    typeof rule.match != 'object' && typeof rule.match != 'function'
  ) { return false; }

  // validate match conditions if they are given
  if(typeof rule.match == 'object') {
    keys = Object.keys(rule.match);
    if(keys.length > SchemaRule.matchProps.length) { return false; }
    for(var i = 0; i < keys.length; i += 1) {
      if(SchemaRule.matchProps.indexOf(keys[i]) == -1) { return false; }
    }
  }
  return true;
}

/**
 * Validate a value against the rule.
 * @param                       val   Any value to validate.
 * @param  {Object}             [ctx] Context for validation callback.
 * @param  {ValidationCallback} [cb]  Executed upon completion.
 */
SchemaRule.prototype.validate = function(val, ctx, cb) {

  // defaults
  if(typeof ctx == 'function') { cb = ctx; ctx = null; }
  if(!cb) { cb = function() {}; }

  // validate
  if(SchemaRule.types === null) {
    throw new Error('There are no registered types. Has viceroy-schema been correctly loaded?');
  }
  if(typeof cb != 'function') { return cb(new Error('cb must be a function')); }
  if(ctx && (typeof ctx != 'function' || typeof ctx != 'object')) {
    return cb(new Error('ctx must be a function or object'));
  }

  // validate the type
  if(val !== undefined && val !== null) {
    var type = SchemaRule.getType(this.type);
    if(!type) {
      return cb(new Error('Rule is of unsupported type'));
    }
    if(!type.validate(val)) {
      return cb(new Error('Must be an instance of ' + type.name));
    }
  }

  // preform match condition validation
  if(this.match) {
    if(this.match.length > 1) {
      this.match.call(ctx, val, cb);
    } else {
      cb(this.match.call(ctx, val));
    }
  } else { cb(null); }
};

/**
 * Convert a match conditions object to a function.
 * @private
 * @param  {Object}   match Match condition object.
 * @return {Function}       Validator function.
 */
SchemaRule.prototype._processMatchConditions = function(match) {

  //validate
  if(match === null || typeof match != 'object') { throw new Error('match must be an object'); }

  // create the validators
  var validators = [];

  // regex
  if(match.constructor == RegExp) {
    return function(val) {
      if(!match.test(val)) { return new Error('Must match expression ' + match.toString()); }
    }
  }

  // exists
  if(match.exists !== undefined) {
    if(typeof match.exists != 'boolean') { throw new Error('match.exists must be a boolean'); }
    validators.push(function(val) {
      if(val === undefined) { return new Error('Must exist'); }
    });
  }

  // not
  if(match.not !== undefined) {
    validators.push(function(val) {
      if(equal(val, match.not)) { return new Error('Must not equal ' + match.not); }
    });
  }

  // less than
  if(match.lt !== undefined) {
    if(typeof match.lt != 'number' && typeof match.lt != 'string') { throw new Error('match.lt must be a number or string'); }
    validators.push(function(val) {
      if(val >= match.lt) { return new Error('Must be less than than ' + match.lt); }
    });
  }

  // greater than
  if(match.gt !== undefined) {
    if(typeof match.gt != 'number' && typeof match.gt != 'string') { throw new Error('match.gt must be a number or string'); }
    validators.push(function(val) {
      if(val <= match.gt) { return new Error('Must be greater than ' + match.gt); }
    });
  }

  // min
  if(match.min !== undefined) {
    if(typeof match.min != 'number') { throw new Error('match.min must be a number'); }
    validators.push(function(val) {
      if(val === null || val === undefined || val.length < match.min) {
        return new Error('Must be greater than ' + match.min + ' chars in length');
      }
    });
  }

  // max
  if(match.max !== undefined) {
    if(typeof match.max != 'number') { throw new Error('match.max must be a number'); }
    validators.push(function(val) {
      if(val === null || val === undefined || val.length > match.max) {
        return new Error('Must be less than ' + match.max + ' chars in length');
      }
    });
  }

  // length
  if(match.length !== undefined) {
    if(typeof match.length != 'number') { throw new Error('match.length must be a number'); }
    validators.push(function(val) {
      if(val === null || val === undefined || val.length != match.length) {
        return new Error('Must be ' + match.length + ' chars in length');
      }
    });
  }

  // in
  if(match.in !== undefined) {
    if(typeof match.in != 'object' || typeof match.in.length != 'number') {
      throw new Error('match.in must be an array');
    }
    validators.push(function(val) {
      var found = false;
      for(var i = 0; i < match.in.length; i += 1) {
        if(equal(match.in[i], val)) { found = true; break; }
      }
      if(!found) {
        return new Error('Must match one of the following values: \'' + match.in.join('\', \'') + '\'');
      }
    });
  }

  // not in
  if(match.notIn !== undefined) {
    if(typeof match.notIn != 'object' || typeof match.notIn.length != 'number') {
      throw new Error('match.notIn must be an array');
    }
    validators.push(function(val) {
      for(var i = 0; i < match.notIn.length; i += 1) {
        if(equal(match.notIn[i], val)) {
          return new Error('Must not match any of the following values: \'' + match.notIn.join('\', \'') + '\'');
        }
      }
    });
  }

  // return a wrapping validation function
  return function(val) {
    for(var i = 0; i < validators.length; i += 1) {
      var err = validators[i](val);
      if(err) { return err; }
    }
  }
};


module.exports = SchemaRule;

