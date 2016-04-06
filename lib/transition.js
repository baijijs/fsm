'use strict';

function Transition(name, fsm, from, to, conditions) {
  if (!(this instanceof Transition)) return new Transition(name, fsm, from, to, conditions);

  this.name = name;
  this._fsm = fsm;
  if (!fsm.has_state(from)) {
    fsm.add_state(from);
  }
  this.from = fsm.get_state(from);
  if (!fsm.has_state(to)) {
    fsm.add_state(to);
  }
  this.to = fsm.get_state(to);
  this.conditions = conditions;

  this.from.addAllowedTransition(this);
}

Transition.prototype.execute = function execute() {
};

module.exports = Transition;
