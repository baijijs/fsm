'use strict';

function State(name) {
  if (!(this instanceof State)) return new State(name);

  if (typeof name === 'string') {
    this.name = name;
  } else if (typeof name === 'object' && name !== null) {
    this.name = name.name;
  }

  this.allowedTransitions = [];
}

State.prototype.addAllowedTransition = function(transition) {
  if(!~this.allowedTransitions.indexOf(transition)) {
    this.allowedTransitions.push(transition);
  }
};

State.prototype.getAllowedEvents = function() {
  if (!this.hasOwnProperty('events')) {
    this.events = [];
    for (var i in this.allowedTransitions) {
      var transition = this.allowedTransitions[i];
      this.events.push(transition.name);
    }
  }
  return this.events;
};

module.exports = State;
