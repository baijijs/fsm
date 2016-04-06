var chai = require('chai');
var expect = chai.expect;

var FSM = require('../lib/fsm');

describe('FSM without any config options', function() {
  describe('without target object', function() {
    it('should return a fsm with initial state set as "initial"', function() {
      var fsm = FSM();
      expect(fsm).to.have.property('_fsm');
      expect(fsm._fsm).to.be.an('object');
      expect(fsm._fsm).to.have.property('current', 'initial');
    });
  });

  describe('with a target object', function() {
    it('should hook fsm to specified object with initial state set as "initial"', function() {
      var obj = Object.create(null);
      var fsm = FSM({}, obj);
      expect(fsm).to.have.property('_fsm');
      expect(fsm._fsm).to.be.an('object');
      expect(obj).to.have.property('current', 'initial');
      expect(obj.is_initial()).to.eql(true);
    });
  });
});

describe('FSM with config options', function() {
  var config;
  var obj;

  beforeEach(function() {
    config = {
      initial: 'red',
      states: [
        'green',
        'yellow',
        'red'
      ],
      transitions: [
        { name: 'green', from: 'yellow', to: 'green' },
        { name: 'yellow', from: 'red', to: 'yellow' },
        { name: 'red', from: 'green', to: 'red' }
      ]
    };
    obj = Object.create(null);
    FSM(config, obj);
  });

  describe('hook fsm to specified object', function() {
    it('it should contain is_ states check and transition functions and etc', function() {
      expect(obj).to.have.property('previous', undefined);
      expect(obj).to.have.property('current', 'red');

      expect(obj).to.have.property('is_green');
      expect(obj).to.have.property('is_yellow');
      expect(obj).to.have.property('is_red');

      expect(obj).to.have.property('green');
      expect(obj).to.have.property('yellow');
      expect(obj).to.have.property('red');

      expect(obj).to.have.property('can');
    });
  });

  describe('is_ states check function', function() {
    it('check if specified state is current state', function() {
      expect(obj).to.have.property('current', 'red');

      expect(obj.is_green()).to.eql(false);
      expect(obj.is_yellow()).to.eql(false);
      expect(obj.is_red()).to.eql(true);
    });
  });

  describe('transition function', function() {
    it('should transit states accordingly', function() {
      obj.yellow();
      expect(obj).to.have.property('previous', 'red');
      expect(obj).to.have.property('current', 'yellow');
    });
  });

  describe('can function', function() {
    it('check the specified transition availability according to current state', function() {
      expect(obj).to.have.property('current', 'red');
      expect(obj.can('green')).to.eql(false);
      expect(obj.can('red')).to.eql(false);
      expect(obj.can('yellow')).to.eql(true);
    });
  });

  describe('allowedEvents function', function() {
    it('should return the available transitions for specified state', function() {
      expect(obj.allowedEvents()).to.eql(['yellow']);
    });
  });
});

describe('FSM without states options', function() {
  var config;
  var obj;

  beforeEach(function() {
    config = {
      initial: 'red',
      transitions: [
        { name: 'green', from: 'yellow', to: 'green' },
        { name: 'yellow', from: 'red', to: 'yellow' },
        { name: 'red', from: 'green', to: 'red' }
      ]
    };
    obj = Object.create(null);
    FSM(config, obj);
  });

  describe('hook fsm to specified object', function() {
    it('it should contain is_ states check and transition functions and etc', function() {
      expect(obj).to.have.property('previous', undefined);
      expect(obj).to.have.property('current', 'red');

      expect(obj).to.have.property('is_green');
      expect(obj).to.have.property('is_yellow');
      expect(obj).to.have.property('is_red');

      expect(obj).to.have.property('green');
      expect(obj).to.have.property('yellow');
      expect(obj).to.have.property('red');

      expect(obj).to.have.property('can');
    });
  });

  describe('is_ states check function', function() {
    it('check if specified state is current state', function() {
      expect(obj).to.have.property('current', 'red');
      expect(obj.is_red()).to.eql(true);
    });
  });

  describe('transition function', function() {
    it('should transit states accordingly', function() {
      obj.yellow();
      expect(obj).to.have.property('previous', 'red');
      expect(obj).to.have.property('current', 'yellow');
    });
  });

  describe('can function', function() {
    it('check the specified transition availability according to current state', function() {
      expect(obj).to.have.property('current', 'red');
      expect(obj.can('green')).to.eql(false);
      expect(obj.can('red')).to.eql(false);
      expect(obj.can('yellow')).to.eql(true);
    });
  });

  describe('allowedEvents function', function() {
    it('should return the available transitions for specified state', function() {
      expect(obj.allowedEvents()).to.eql(['yellow']);
    });
  });
});

describe('FSM with multiple froms states to a single to state', function() {
  var config;
  var obj;

  beforeEach(function() {
    config = {
      initial: 'asleep',
      transitions: [
        { name: 'wakeup', from: 'asleep', to: 'hungry'},
        { name: 'eat', from: 'hungry', to: 'satisfied' },
        { name: 'work', from: 'satisfied', to: 'hungry' },
        { name: 'play', from: 'satisfied', to: 'sleepy' },
        { name: 'nap', from: ['sleepy', 'tired'], to: 'asleep' }
      ]
    };
    obj = Object.create(null);
    FSM(config, obj);
  });

  describe('hook fsm to specified object', function() {
    it('it should contain is_ states check and transition functions and etc', function() {
      expect(obj).to.have.property('previous', undefined);
      expect(obj).to.have.property('current', 'asleep');

      expect(obj).to.have.property('is_asleep');
      expect(obj).to.have.property('is_hungry');
      expect(obj).to.have.property('is_satisfied');
      expect(obj).to.have.property('is_sleepy');
      expect(obj).to.have.property('is_tired');
      expect(obj).to.have.property('is_asleep');

      expect(obj).to.have.property('wakeup');
      expect(obj).to.have.property('eat');
      expect(obj).to.have.property('work');
      expect(obj).to.have.property('play');
      expect(obj).to.have.property('nap');

      expect(obj.can('wakeup')).to.eql(true);
      expect(obj.can('eat')).to.eql(false);
      expect(obj.can('work')).to.eql(false);
      expect(obj.can('play')).to.eql(false);
      expect(obj.can('nap')).to.eql(false);
    });
  });

  describe('allowedEvents function', function() {
    it('should return the available transitions for specified state', function() {
      expect(obj.allowedEvents()).to.eql(['wakeup']);
      expect(obj.allowedEvents('satisfied')).to.eql(['work', 'play']);
    });
  });

  describe('transitions confirm', function() {
    it('should transit states accordingly', function() {
      obj.wakeup();
      expect(obj).to.have.property('current', 'hungry');
      expect(obj.work()).to.eql(false);
      obj.eat();
      expect(obj).to.have.property('current', 'satisfied');
      expect(obj.work()).to.eql('hungry');

      obj.chainable = true;
      obj.eat().play().nap();
      expect(obj).to.have.property('current', 'asleep');
    });
  });
});
