'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const reactRedux = require('react-redux');
const headerComponent = require('../../../src/js/components/Header.js');
const minefieldUtils = require('../../../src/js/utils/MinefieldUtils.js');

describe('Header Container', function () {
  const sandbox = sinon.createSandbox();
  let fakeTimers;
  let doubles;
  let proxyContainer;

  beforeEach(function () {
    fakeTimers = sandbox.useFakeTimers(new Date());
    doubles = {};
    doubles.connectSpy = sandbox.spy(reactRedux, 'connect');
    doubles.headerComponent = sandbox.stub(headerComponent);
    doubles.minefieldUtils = sandbox.stub(minefieldUtils);
    proxyContainer = proxyquire('../../../src/js/containers/Header.js', {
      'react-redux': reactRedux,
      '../components/Header': doubles.headerComponent,
      '../utils/MinefieldUtils': doubles.minefieldUtils,
    });
  });

  afterEach(function () {
    fakeTimers.restore();
    sandbox.restore();
  });

  it('should call react-redux connect() once', function () {
    assert.strictEqual(doubles.connectSpy.callCount, 1);
  });
  
  it('should call react-redux connect() with 1 argument', function () {
    assert.strictEqual(doubles.connectSpy.args[0].length, 1);
  });
  
  it('should call react-redux connect() with a function as argument', function () {
    assert.typeOf(doubles.connectSpy.args[0][0], 'function');
  });

  describe('mapStateToProps', function () {
    describe('if the setup property of the redux store is null', function () {
      let mapStateToProps;
      let state;
      let props;

      beforeEach(function () {
        mapStateToProps = doubles.connectSpy.args[0][0];
        state = {
          setup: null,
          minefield: [],
          tiles: {},
        };
        props = mapStateToProps(state);
      });

      it('should return an object with 3 properties', function () {
        assert.strictEqual(Object.getOwnPropertyNames(props).length, 3);
      });

      it('should return an object with a "minesLeft" property', function () {
        assert.isTrue(Object.getOwnPropertyNames(props).includes('minesLeft'));
      });

      it('should return an object wich has the "minesLeft" property set to zero', function () {
        assert.strictEqual(props.minesLeft, 0);
      });
      
      it('should return an object with "lives" property', function () {
        assert.isTrue(Object.getOwnPropertyNames(props).includes('lives'));
      });

      it('should return an object wich has the "lives" property set to zero', function () {
        assert.strictEqual(props.lives, 0);
      });
      
      it('should return an object with "initialTimer" property', function () {
        assert.isTrue(Object.getOwnPropertyNames(props).includes('initialTimer'));
      });

      it('should return an object wich has the "initialTimer" property set to zero', function () {
        assert.strictEqual(props.initialTimer, 0);
      });

      it('should should not call the function that calculates the stats of the current minefield', function () {
        assert.strictEqual(doubles.minefieldUtils.getMinefieldStats.callCount, 0);
      });
    });

    describe('if the setup property of the redux store is not null', function () {
      let state;
      let minefieldStats;
      let mapStateToProps;

      beforeEach(function () {
        state = {
          setup: {},
          minefield: [],
          tiles: {},
        };
        minefieldStats = {};
        doubles.minefieldUtils.getMinefieldStats.returns(minefieldStats);
        mapStateToProps = doubles.connectSpy.args[0][0];
      });

      it('should call MinefieldUtils getMinefieldStats() once', function () {
        mapStateToProps(state);
        assert.strictEqual(doubles.minefieldUtils.getMinefieldStats.callCount, 1);
      });
      
      it('should call MinefieldUtils getMinefieldStats() with one argument', function () {
        mapStateToProps(state);
        assert.strictEqual(doubles.minefieldUtils.getMinefieldStats.args[0].length, 1);
      });
      
      it('should call MinefieldUtils getMinefieldStats() with an array containing the values of state.tiles', function () {
        state.setup = { numLives: 100 };
        state.minefield = ['0', '1'];
        state.tiles = {
          '0': { key1: 'tile id 0' },
          '1': { key1: 'tile id 1' },
        };
        mapStateToProps(state);
        assert.deepEqual(
          doubles.minefieldUtils.getMinefieldStats.args[0][0],
          [
            { key1: 'tile id 0' },
            { key1: 'tile id 1' },
          ]
        );
      });

      describe('return value', function () {
        let props;

        beforeEach(function () {
          props = mapStateToProps(state);
        });

        it('should return an object with 3 properties', function () {
          assert.strictEqual(Object.getOwnPropertyNames(props).length, 3);
        });

        it('should return an object with a "minesLeft" property', function () {
          assert.isTrue(Object.getOwnPropertyNames(props).includes('minesLeft'));
        });
        
        it('should return an object with a "lives" property', function () {
          assert.isTrue(Object.getOwnPropertyNames(props).includes('lives'));
        });
        
        it('should return an object with a "initialTimer" property', function () {
          assert.isTrue(Object.getOwnPropertyNames(props).includes('initialTimer'));
        });
      });
      
      it('should return the number of mines left, based on the values returned by MinefieldUtils getMinefieldStats()', function () {
        minefieldStats.numMines = 40;
        minefieldStats.numFlags = 7;

        const props = mapStateToProps(state);
        assert.strictEqual(props.minesLeft, minefieldStats.numMines - minefieldStats.numFlags);
      });
      
      it('should return the number of lives left, based on the values returned by MinefieldUtils getMinefieldStats() and the state.setup', function () {
        state.setup.numLives = 5;
        minefieldStats.numLivesLost = 2;

        const props = mapStateToProps(state);
        assert.strictEqual(props.lives, state.setup.numLives - minefieldStats.numLivesLost);
      });
      
      it('should return the value of the initial timer, based on the values of the state.setup', function () {
        state.setup.gameStartUTC = 1234567890;

        const props = mapStateToProps(state);
        assert.strictEqual(props.initialTimer, fakeTimers.now - state.setup.gameStartUTC);
      });
    });
  });
});