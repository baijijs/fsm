'use strict';

/*!
 * Expose Finite State Machine.
 */
module.exports = FSM;

/**
 * global Promise
 * use Promise from ECMA6 if provided natively, else use bluebird
 */
try {
  FSM.Promise = Promise;
} catch(e) {
  FSM.Promise = require('bluebird');
}

/**
 * FSM Constants
 */
FSM.WILDCARD = '*';

/*!
 * Module dependencies.
 */
var util = require('util');

var State = require('./state');
var Transition = require('./transition');
var helpers = require('./helpers');

/**
 * FSM constructor
 * @class
 * @param {String} stateName initial state name
 */
function FSM(config, target) {
  if (config instanceof FSM) return config;
  if (!(this instanceof FSM)) return new FSM(config, target);

  config = config || {};

  // The target object for hook FSM in
  target = target || config.target;

  // The inner wrapper for FSM object
  // For safe mode, hook FSM with a whole new property called fsm,
  // otherwise just hook it as properties of the target object
  var _fsm = this._fsm = target ?
    (
      config.safe ?
      Object.defineProperty(target, config.fsmAlias || 'fsm', {
        enumerable: true,
        writable: true,
        configurable: true,
        value: {}
      }) :
      target
    ) :
    {};

  _fsm.states = {};
  _fsm.transitions = {};

  _fsm.is = function(state) {
    return Array.isArray(state) ?
      !!~state.indexOf(_fsm.current) :
      (state === _fsm.current);
  };

  // Check if specified transition is available for current state
  _fsm.can = function(name) {
    var transitions = _fsm.transitions[name];

    for(var i in transitions) {
      var transition = transitions[i];
      if (transition.from.name === _fsm.current || transition.from.name === _fsm.WILDCARD) {
        return true;
      }
    }
    return false;
  };

  // Get a list of allowed transitions for specified state
  _fsm.allowedEvents = function(state) {
    state = _fsm.states[state || _fsm.current];
    return state.getAllowedEvents();
  };

  _fsm.has_state = function(state) {
    return _fsm.states.hasOwnProperty(state);
  };

  _fsm.get_state = function(state) {
    if(!(state in _fsm.states)) {
      throw new Error(util.format('%s is not a registered state.', state));
    }

    return _fsm.states[state];
  };

  _fsm.set_state = function(state) {
    state = _fsm.get_state(state);

    _fsm.previous = _fsm.current;

    _fsm.current = state.name;
    _fsm.current_state = state;
  };

  _fsm.add_state = (function(state) {
    this.add_states(state);
  }).bind(this);

  var states = config.states || [];
  var transitions = config.transitions || [];
  if (states) this.add_states(states);
  if (transitions) this.add_transitions(transitions);

  if (!config.initial) {
    _fsm.add_state('initial');
    config.initial = 'initial';
  }
  _fsm.set_state(config.initial);

  return this;
}

FSM.prototype.add_states = function add_states(states) {
  var _fsm = this._fsm;

  states = helpers.arrayify(states);

  states.forEach(function(state) {
    state = new State(state);

    var name = state.name;

    _fsm.states[name] = state;
    Object.defineProperty(_fsm, util.format('is_%s', name), {
      enumerable: true,
      writable: false,
      configurable: false,
      value: (function(name) {
        return function() {
          return _fsm.is(name);
        };
      })(name)
    });
  });
};

FSM.prototype.add_transitions = function add_transition(transitions) {
  var _fsm = this._fsm;

  transitions = helpers.arrayify(transitions);

  transitions.forEach(function(transition) {
    var name = transition.name;
    var froms = helpers.arrayify(transition.from, _fsm.WILDCARD);

    if (!_fsm.transitions.hasOwnProperty(name)) {
      _fsm.transitions[name] = [];
      Object.defineProperty(_fsm, name, {
        enumerable: true,
        writable: true,
        configurable: false,
        value: (function(name) {
          return function() {
            var transitions = _fsm.transitions[name];
            for (var i in transitions) {
              var transition = transitions[i];
              if (transition.from.name === _fsm.current) {
                _fsm.set_state(transition.to.name);
                return _fsm.chainable ? _fsm : transition.to.name;
              }
            }
            return _fsm.chainable ? _fsm : false;
          };
        })(name)
      });
    }

    froms.forEach(function(from) {
      var t = new Transition(name, _fsm, from, transition.to, transition.conditions);
      _fsm.transitions[name].push(t);
    });
  });
};
