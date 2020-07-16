'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const react = require("react");

describe('Header Component', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyHeader;

  beforeEach(function () {
    sandbox.useFakeTimers();
    global.BASE_URL = '/';
    doubles = {
      createElementStub: sandbox.stub(react, 'createElement'),
      setStateStub: sandbox.stub(),
    };
    proxyHeader = proxyquire('../../../src/js/components/Header.js', {
      'react': react,
    });
  });

  afterEach(function () {
    sandbox.restore();
    delete global.BASE_URL;
  });

  describe('constructor()', function () {
    let header = null;
    const props = { initialTimer: 1234567890 };

    beforeEach(function () {
      header = new proxyHeader.Header(props);
    });

    it('should set the initial value for state.timer equal to the value of props.initialTimer', function () {
      assert.deepEqual(header.state.timer, props.initialTimer);
    });
  });

  describe('componentDidUpdate()', function () {
    let header = null;
    const props = { initialTimer: 1234567890 };

    beforeEach(function () {
      header = new proxyHeader.Header(props);
      header.setState = doubles.setStateStub;
    });

    it('should return void', function () {
      assert.isUndefined(header.componentDidUpdate(props));
    });

    describe('if the value of props.initialTimer hasn\'t changed', function () {
      it('should not call setState()', function () {
        header.componentDidUpdate({ initialTimer: props.initialTimer });
        assert.strictEqual(doubles.setStateStub.callCount, 0);
      });
    });
    
    describe('if the value of props.initialTimer changed', function () {
      let prevProps = { initialTimer: props.initialTimer };

      it('should call setState() once', function () {
        props.initialTimer += 10;

        header.componentDidUpdate(prevProps);
        assert.strictEqual(doubles.setStateStub.callCount, 1);
      });
      
      it('should call setState() with an object that has 1 property', function () {
        props.initialTimer += 1367;

        header.componentDidUpdate(prevProps);
        assert.strictEqual(Object.getOwnPropertyNames(doubles.setStateStub.args[0][0]).length, 1);
      });
      
      it('should call setState() with an object that has the "timer" property', function () {
        props.initialTimer += 17;

        header.componentDidUpdate(prevProps);
        assert.strictEqual(Object.getOwnPropertyNames(doubles.setStateStub.args[0][0])[0], 'timer');
      });
      
      it('should call setState() and set the "timer" property to the new props.initialTimer value', function () {
        props.initialTimer += 56787;

        header.componentDidUpdate(prevProps);
        assert.strictEqual(doubles.setStateStub.args[0][0].timer, props.initialTimer);
      });
    });
  });

  describe('componentDidMount()', function () {
    let header = null;

    beforeEach(function () {
      header = new proxyHeader.Header({});
      header.setState = doubles.setStateStub;
    });

    it('should return void', function () {
      assert.isUndefined(header.componentDidMount());
    });

    it('should register a timer', function () {
      assert.isUndefined(sandbox.clock.timers);
      header.componentDidMount();

      assert.strictEqual(Object.keys(sandbox.clock.timers).length, 1);
    });

    it('should register an interval', function () {
      header.componentDidMount();

      const timersKeys = Object.keys(sandbox.clock.timers);
      assert.strictEqual(sandbox.clock.timers[timersKeys[0]].type, 'Interval');
    });
    
    it('should register the interval with 1000ms delay', function () {
      header.componentDidMount();

      const timersKeys = Object.keys(sandbox.clock.timers);
      assert.strictEqual(sandbox.clock.timers[timersKeys[0]].interval, 1000);
    });
    
    it('should register the interval with the correct arguments', function () {
      header.componentDidMount();

      const timersKeys = Object.keys(sandbox.clock.timers);
      assert.deepEqual(sandbox.clock.timers[timersKeys[0]].args, []);
    });
    
    describe('the interval callback', function () {
      it('should call setState() once', function () {
        header.componentDidMount();

        sandbox.clock.next();
        assert.isTrue(doubles.setStateStub.calledOnce);
      });
      
      it('should call setState() with a function callback', function () {
        header.componentDidMount();

        sandbox.clock.next();
        assert.typeOf(doubles.setStateStub.args[0][0], 'function');
      });
      
      describe('the setState() callback', function () {
        it('should increment the previous state.timer by 1000', function () {
          header.componentDidMount();

          sandbox.clock.next();
          assert.deepEqual(doubles.setStateStub.args[0][0]({ timer: 20 }), { timer: 1020 });
        });
      });
    });
  });

  describe('componentWillUnmount()', function () {
    let header = null;

    beforeEach(function () {
      header = new proxyHeader.Header({});
    });

    it('should return void', function () {
      assert.isUndefined(header.componentWillUnmount());
    });

    describe('if an interval is registered', function () {
      beforeEach(function () {
        header.intervalId = global.setInterval(() => {}, 1000);
      });

      it('should unregister the interval advancing the timer', function () {
        assert.strictEqual(Object.keys(sandbox.clock.timers).length, 1);
        header.componentWillUnmount();
        assert.strictEqual(Object.keys(sandbox.clock.timers).length, 0);
      });
    });
  });

  describe('render()', function () {
    const props = {};
    let header = null;

    beforeEach(function () {
      doubles.createElementStub.onCall(0).returns('timer img.');
      doubles.createElementStub.onCall(1).returns('timer div.');
      doubles.createElementStub.onCall(2).returns('mine img.');
      doubles.createElementStub.onCall(3).returns('mines-left div.');
      doubles.createElementStub.onCall(4).returns('lives img.');
      doubles.createElementStub.onCall(5).returns('lives div.');
      doubles.createElementStub.onCall(6).returns('Header component.');

      header = new proxyHeader.Header(props);
      header.intervalId = global.setInterval(() => {}, 1000);
    });

    it('should call React createElement() with an "img" tag with its props, for the timer', function () {
      header.render();

      assert.deepEqual(
        doubles.createElementStub.args[0],
        ['img', { src: '/img/timer.png', alt: 'game timer' }]
      );
    });
    
    it('should call React createElement() with a "div" tag with its props and children, for the timer', function () {
      header.state = { timer: (60*2 + 25) * 1000 };
      header.render();

      assert.deepEqual(
        doubles.createElementStub.args[1],
        ['div', { id: 'game-timer' }, 'timer img.', '02:25']
      );
    });
    
    it('should call React createElement() with an "img" tag with its props, for the mines left', function () {
      header.render();

      assert.deepEqual(
        doubles.createElementStub.args[2],
        ['img', { src: '/img/mine.png', alt: 'mines left' }]
      );
    });
    
    it('should call React createElement() with a "div" tag with its props and children, for the mines left', function () {
      props.minesLeft = 10;
      header.render();

      assert.deepEqual(
        doubles.createElementStub.args[3],
        ['div', { id: 'mines-left' }, 'mine img.', props.minesLeft]
      );
    });
    
    it('should call React createElement() with an "img" tag with its props, for the lives left', function () {
      header.render();

      assert.deepEqual(
        doubles.createElementStub.args[4],
        ['img', { src: '/img/lives.png', alt: 'lives left' }]
      );
    });
    
    it('should call React createElement() with a "div" tag with its props and children, for the lives left', function () {
      props.lives = 2;
      header.render();

      assert.deepEqual(
        doubles.createElementStub.args[5],
        ['div', { id: 'lives' }, 'lives img.', props.lives]
      );
    });
    
    it('should call React createElement() with a "div" tag with its props and children, for the component wrapper', function () {
      header.render();

      assert.deepEqual(
        doubles.createElementStub.args[6],
        ['div', { id: 'header' }, 'timer div.', 'mines-left div.', 'lives div.']
      );
    });

    it('should return the wrapper "div" HTML element', function () {
      assert.strictEqual(header.render(), 'Header component.');
    });

    it('should not cancel the interval timer', function () {
      assert.strictEqual(Object.keys(sandbox.clock.timers).length, 1);
    });

    describe('if the game has ended', function () {
      beforeEach(function () {
        props.gameEnded = true;
      });

      it('should unregister the interval advancing the timer', function () {
        assert.strictEqual(Object.keys(sandbox.clock.timers).length, 1);
        header.render();
        assert.strictEqual(Object.keys(sandbox.clock.timers).length, 0);
      });
    });
  });
});