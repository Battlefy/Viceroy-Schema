
var SchemaRule = require('./schema-rule');

/**
 * @callback ValidationCallback
 * @param {Object} [errors] Validation errors object.
 */

/**
 * Schema constructor
 * @constructor
 * @param {Object} rules An object containing schema rules.
 */
function Schema(rules) {
  if(rules === null || typeof rules != 'object') { throw new Error('rules must be an object'); }
  this.opts = this._extractOpts(rules);
  this.rules = this._createRules(rules);
}

/**
 * Get registered type object.
 * @param  {Function|String} Class Type class.
 * @return {Object}                Type object.
 */
Schema.getType = SchemaRule.getType = function(Class) {
  if(typeof Class != 'function' && typeof Class != 'string') {
    throw new Error('Class must be a constructor or string');
  }
  for(var i = 0; i < Schema.types.length; i += 1) {
    if(typeof Class == 'string') {
      return Schema.types[i].name == Class;
    } else if(Schema.types[i].Class == Class) {
      return Schema.types[i];
    }
  }
  return null;
};

/**
 * Register object for type.
 * @param  {Function} Class Type class.
 * @param  {Object}   opts  Type opts.
 * @return {Object}         Type object.
 */
Schema.addType = SchemaRule.addType =function(Class, opts) {

  // validate
  if(typeof Class != 'function') { throw new Error('Class must be a constructor'); }
  if(Schema.getType(Class)) { throw new Error('Class is already registered'); }
  if(opts === null || typeof opts != 'object') { throw new Error('opts must be an object'); }
  if(typeof opts.name != 'string') { throw new Error('opts.name must be a string'); }
  if(typeof opts.validate != 'function') { throw new Error('opts.validate must be a function'); }
  
  // create the type object.
  var type = {
    name: opts.name,
    Class: Class,
    validate: opts.validate
  };

  // add it to registered types.
  Schema.types.push(type);

  // return the type object.
  return type;
};

Schema.types = SchemaRule.types = [];

/**
 * Validate object against the schema
 * @param  {Object}             obj     Data to be validated.
 * @param  {Object}             [fields] The fields to validate. Strict
 *                                       mode will be disabled if true.
 * @param  {Object}             [ctx]    Validation context.
 * @param  {ValidationCallback} [cb]     Callback executed upon completion.
 */
Schema.prototype.validate = function(obj, fields, ctx, cb) {
  var _this = this;

  // defaults
  if(typeof fields == 'function') { cb = fields; fields = null; }
  if(typeof ctx == 'function') { cb = ctx; ctx = fields; fields = null; }
  if(typeof cb != 'function') { cb = function() {}; }

  // validate
  if(fields) {
    if(typeof fields != 'object' || typeof fields.length != 'number') { return cb(new Error('fields must be an array')); }
    for(var i = 0; i < fields.length; i += 1) {
      if(typeof fields[i] != 'string') { return cb(new Error('fields must only contain strings')); }
    }
  }
  if(ctx && (typeof ctx != 'function' || typeof ctx != 'object')) {
    return cb(new Error('ctx must be a function or object'));
  }

  // exit early if the obj is not an object
  if(obj === null || typeof obj != 'object') { return cb(new Error('must be an object')); }

  // recurse and validate
  (function rec(path, rules, obj, cb) {

    // grab the obj and rule properties and
    // create the errors variable
    var props = Object.keys(obj);
    var rProps = Object.keys(rules);
    var errors = null;

    // ensure there are no extra properties in
    // strict mode.
    if(_this.opts.strict) {
      for(var i = 0; i < props.length; i += 1) {
        var prop = props[i];
        if(rProps.indexOf(prop) == -1) {
          var subPath = path && path + '.' + prop || prop;
          if(!errors) { errors = {}; }
          errors[subPath] = new Error('invalid property');
        }
      }
    }

    // loop through each validation rule and save
    // any errors that occur.
    var j = rProps.length;
    var next = function(subPath) {
      return function(err) {
        if(err) {
          if(!errors) { errors = {}; }
          if(typeof err == 'object' && err.constructor == Object) {
            for(var prop in err) { errors[prop] = err[prop]; }
          }
          else { errors[subPath] = err; }
        }
        j -= 1; if(j == 0) { cb(errors); }
      };
    };
    for(var i = 0; i < rProps.length; i += 1) {
      var rProp = rProps[i];

      // create the sub path
      var subPath = path && path + '.' + rProp || rProp;

      // validate the current property
      if(rules[rProp].constructor == SchemaRule) {
        if(!fields || fields.indexOf(subPath) > -1) {
          rules[rProp].validate(obj[rProp], ctx, next(subPath));
        } else { next()(); }
      }

      // recurse over sub arrays
      else if(rules[rProp].constructor == Array) {
        if(
          obj[rProp] !== null &&
          typeof obj[rProp] == 'object' &&
          typeof obj[rProp].length == 'number'
        ) {
          if(obj[rProp].length > 0) {
            j += obj[rProp].length - 1;
            for(var k = 0; k < obj[rProp].length; k += 1) {
              rec(subPath + '[' + k + ']', rules[rProp][0], obj[rProp][k], next());
            }
          } else { next()(); }
        } else {
          next(subPath)(new Error('Must be an instance of Array'));
        }
      }

      // recurse over sub objects
      else if(rules[rProp].constructor == Object) {
        if(obj[rProp] !== null && typeof obj[rProp] == 'object') {
          rec(subPath, rules[rProp], obj[rProp], next(subPath)); 
        } else {
          next(subPath)(new Error('Must be an instance of Object'));
        }
      }

      // if the current property is not an object
      // then skip it, unless we're in strict
      // mode.
      else { next(subPath)(new Error('Invalid rule')); }

    }
  })('', this.rules, obj, cb);
};

/**
 * Accepts a rules object and converts each
 * rule within the object to a SchemaRule
 * instance.
 * @param  {Object} rules Rules object.
 * @return {Object}       Schema rules object.
 */
Schema.prototype._createRules = function(rules) {

  // validate
  if(typeof rules != 'object') { throw new Error('rules must be an object'); }

  // build the schema rules.
  return (function rec(rules) {
    var schema = {};
    var hasRule = false;
    for(var prop in rules) {

      // convert shorthand type rules
      if(typeof rules[prop] == 'function') {
        rules[prop] = { type: rules[prop] };
      }

      // validate
      if(rules[prop] === null || typeof rules[prop] != 'object') {
        throw new Error('each rule must be an object or constructor');
      }

      // create the rules type
      if(rules[prop].constructor == SchemaRule || SchemaRule.isRule(rules[prop])) {
        hasRule = true;
        if(rules[prop].constructor != SchemaRule) {
          rules[prop] = new SchemaRule(rules[prop]);
        }
        schema[prop] = rules[prop];
      } else if(typeof rules[prop].length == 'number') {
        hasRule = true;
        schema[prop] = [rec(rules[prop][0])];
      } else {
        hasRule = true;
        schema[prop] = rec(rules[prop]);
      }
    }

    // validate
    if(!hasRule) {
      throw new Error('schema rule object must contain at least one rule');
    }

    // return
    return schema;
  })(rules);
};

/**
 * Extract opts from rules.
 * @private
 * @param  {Object} rules Schema rule object.
 * @return {Object}       Schema opts.
 */
Schema.prototype._extractOpts = function(rules) {
  var opts = {};
  if(rules.$strict) {
    if(typeof rules.$strict != 'boolean') { throw new Error('rules.$strict must be a boolean'); }
    opts.strict = rules.$strict;
    delete rules.$strict;
  }
  return opts;
};


module.exports = Schema;