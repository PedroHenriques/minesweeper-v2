'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const reactRedux = require('react-redux');
const minefieldComponent = require('../../../src/js/components/Minefield.js');
const actionCreators = require('../../../src/js/actions/creators.js');

describe('Minefield Container', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyContainer;

  beforeEach(function () {
    doubles = {};
    doubles.connectSpy = sandbox.spy(reactRedux, 'connect');
    doubles.minefieldComponent = sandbox.stub(minefieldComponent);
    doubles.actionCreators = sandbox.stub(actionCreators);
    proxyContainer = proxyquire('../../../src/js/containers/Minefield.js', {
      'react-redux': reactRedux,
      '../components/Minefield': doubles.minefieldComponent,
      '../actions/creators': doubles.actionCreators,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should call react-redux connect() once', function () {
    assert.strictEqual(doubles.connectSpy.callCount, 1);
  });
  
  it('should call react-redux connect() with 2 arguments', function () {
    assert.strictEqual(doubles.connectSpy.args[0].length, 2);
  });
  
  it('should call react-redux connect() with a function as the 1st argument', function () {
    assert.typeOf(doubles.connectSpy.args[0][0], 'function');
  });
  
  it('should call react-redux connect() with a function as the 2nd argument', function () {
    assert.typeOf(doubles.connectSpy.args[0][1], 'function');
  });

  describe('mapStateToProps', function () {
    let state;
    let mapStateToProps;

    beforeEach(function () {
      state = {
        setup: null,
        minefield: [],
        tiles: {},
      };
      mapStateToProps = doubles.connectSpy.args[0][0];
    });

    describe('return value', function () {
      let props;
      
      beforeEach(function () {
        props = mapStateToProps(state);
      });

      it('should return an object with 3 properties', function () {
        assert.strictEqual(Object.getOwnPropertyNames(props).length, 3);
      });
      
      it('should return an object with a "gameEnded" property', function () {
        assert.isTrue(Object.getOwnPropertyNames(props).includes('gameEnded'));
      });
      
      it('should return an object with a "dimensions" property', function () {
        assert.isTrue(Object.getOwnPropertyNames(props).includes('dimensions'));
      });
      
      it('should return an object with a "minefield" property', function () {
        assert.isTrue(Object.getOwnPropertyNames(props).includes('minefield'));
      });
    });


    describe('if the setup property of the redux store is null', function () {
      it('should return false as the value of the "gameEnded" property', function () {
        state.setup = null;
        const props = mapStateToProps(state);
        assert.isFalse(props.gameEnded);
      });
    });

    describe('if the setup property of the redux store is not null', function () {
      describe('if the setup.gameEndUTC value of the redux store property is null', function () {
        it('should return false as the value of the "gameEnded" property', function () {
          state.setup = { gameEndUTC: null };
          const props = mapStateToProps(state);
          assert.isFalse(props.gameEnded);
        });
      });

      describe('if the setup.gameEndUTC value of the redux store property is not null', function () {
        it('should return true as the value of the "gameEnded" property', function () {
          state.setup = { gameEndUTC: 123456 };
          const props = mapStateToProps(state);
          assert.isTrue(props.gameEnded);
        });
      });
    });

    describe('if the redux store has an empty "minefield" property', function () {
      let props;

      beforeEach(function() {
        state.minefield = [];
        props = mapStateToProps(state);
      });

      it('should have the "rows" property set to zero, in the returned object "dimensions" property', function () {
        assert.strictEqual(props.dimensions.rows, 0);
      });
      
      it('should have the "cols" property set to zero, in the returned object "dimensions" property', function () {
        assert.strictEqual(props.dimensions.cols, 0);
      });

      it('should return an empty array as the value of the "minefield" property of the returned object', function () {
        assert.deepEqual(props.minefield, []);
      });
    });

    describe('if the redux store has a non empty "minefield" property', function () {
      let props;

      beforeEach(function () {
        state.minefield = [ '0', '1', '2', '3', '4' ];
        state.tiles = {
          '0': { row: 0, col: 1 },
          '1': { row: 1, col: 0 },
          '2': { row: 4, col: 8 },
          '3': { row: 10, col: 3 },
          '4': { row: 7, col: 6 },
        };
        props = mapStateToProps(state);
      });

      it('should set the "dimensions.rows" value to the biggest tile row, added 1', function () {
        assert.strictEqual(props.dimensions.rows, 11);
      });
      
      it('should set the "dimensions.cols" value to the biggest tile column, added 1', function () {
        assert.strictEqual(props.dimensions.cols, 9);
      });

      it('should set the denormalized minefield data, by combining the "minefield" and "tiles" properties of the redux store, as the value of the "minefield" property of the returned object', function () {
        assert.deepEqual(
          props.minefield,
          [
            { row: 0, col: 1 },
            { row: 1, col: 0 },
            { row: 4, col: 8 },
            { row: 10, col: 3 },
            { row: 7, col: 6 },
          ]
        );
      });
    });
  });

  describe('mapDispatchToProps', function () {
    let mapDispatchToProps;
    let dispatchStub;
    let props;

    beforeEach(function () {
      mapDispatchToProps = doubles.connectSpy.args[0][1];
      dispatchStub = sandbox.stub();
      props = mapDispatchToProps(dispatchStub);
    });

    it('should return an object with "handleLeftClick", "handleRightClick" and "handleBothClick" properties', function () {
      assert.deepEqual(Object.getOwnPropertyNames(props), [ 'handleLeftClick', 'handleRightClick', 'handleBothClick' ]);
    });

    describe('handleLeftClick', function () {
      beforeEach(function () {
        doubles.actionCreators.tileLeftClick.returns('tileLeftClick action.');
      });

      it('should return void', function () {
        assert.typeOf(props.handleLeftClick('test tile id'), 'undefined');
      });

      it('should call tileLeftClick() action creator once', function () {
        props.handleLeftClick('test tile id');
        assert.strictEqual(doubles.actionCreators.tileLeftClick.callCount, 1);
      });
      
      it('should call tileLeftClick() action creator with one argument', function () {
        props.handleLeftClick('test tile id');
        assert.strictEqual(doubles.actionCreators.tileLeftClick.args[0].length, 1);
      });
      
      it('should call tileLeftClick() action creator with the provided tile ID', function () {
        props.handleLeftClick('test tile id');
        assert.strictEqual(doubles.actionCreators.tileLeftClick.args[0][0], 'test tile id');
      });
      
      it('should call dispatch() once', function () {
        props.handleLeftClick('test tile id');
        assert.strictEqual(dispatchStub.callCount, 1);
      });
      
      it('should call dispatch() with one argument', function () {
        props.handleLeftClick('test tile id');
        assert.strictEqual(dispatchStub.args[0].length, 1);
      });
      
      it('should call dispatch() with the return value from tileLeftClick() action creator', function () {
        props.handleLeftClick('test tile id');
        assert.strictEqual(dispatchStub.args[0][0], 'tileLeftClick action.');
      });
    });

    describe('handleRightClick', function () {
      beforeEach(function () {
        doubles.actionCreators.tileRightClick.returns('tileRightClick action.');
      });

      it('should return void', function () {
        assert.typeOf(props.handleRightClick('test tile id'), 'undefined');
      });

      it('should call tileRightClick() action creator once', function () {
        props.handleRightClick('test tile id');
        assert.strictEqual(doubles.actionCreators.tileRightClick.callCount, 1);
      });
      
      it('should call tileRightClick() action creator with one argument', function () {
        props.handleRightClick('test tile id');
        assert.strictEqual(doubles.actionCreators.tileRightClick.args[0].length, 1);
      });
      
      it('should call tileRightClick() action creator with the provided tile ID', function () {
        props.handleRightClick('test tile id');
        assert.strictEqual(doubles.actionCreators.tileRightClick.args[0][0], 'test tile id');
      });
      
      it('should call dispatch() once', function () {
        props.handleRightClick('test tile id');
        assert.strictEqual(dispatchStub.callCount, 1);
      });
      
      it('should call dispatch() with one argument', function () {
        props.handleRightClick('test tile id');
        assert.strictEqual(dispatchStub.args[0].length, 1);
      });
      
      it('should call dispatch() with the return value from tileRightClick() action creator', function () {
        props.handleRightClick('test tile id');
        assert.strictEqual(dispatchStub.args[0][0], 'tileRightClick action.');
      });
    });

    describe('handleBothClick', function () {
      beforeEach(function () {
        doubles.actionCreators.tileBothClick.returns('tileBothClick action.');
      });

      it('should return void', function () {
        assert.typeOf(props.handleBothClick('test tile id'), 'undefined');
      });

      it('should call tileBothClick() action creator once', function () {
        props.handleBothClick('test tile id');
        assert.strictEqual(doubles.actionCreators.tileBothClick.callCount, 1);
      });
      
      it('should call tileBothClick() action creator with one argument', function () {
        props.handleBothClick('test tile id');
        assert.strictEqual(doubles.actionCreators.tileBothClick.args[0].length, 1);
      });
      
      it('should call tileBothClick() action creator with the provided tile ID', function () {
        props.handleBothClick('test tile id');
        assert.strictEqual(doubles.actionCreators.tileBothClick.args[0][0], 'test tile id');
      });
      
      it('should call dispatch() once', function () {
        props.handleBothClick('test tile id');
        assert.strictEqual(dispatchStub.callCount, 1);
      });
      
      it('should call dispatch() with one argument', function () {
        props.handleBothClick('test tile id');
        assert.strictEqual(dispatchStub.args[0].length, 1);
      });
      
      it('should call dispatch() with the return value from tileBothClick() action creator', function () {
        props.handleBothClick('test tile id');
        assert.strictEqual(dispatchStub.args[0][0], 'tileBothClick action.');
      });
    });
  });
});