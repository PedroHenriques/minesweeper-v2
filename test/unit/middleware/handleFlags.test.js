'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const actionTypes = require('../../../src/js/actions/actionTypes.js');
const actionCreators = require('../../../src/js/actions/creators.js');

describe('handleFlags Middleware', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyMiddleware;
  let testStore;
  let testAction;

  beforeEach(function () {
    doubles = {
      getState: sandbox.stub(),
      dispatch: sandbox.stub(),
      nextStub: sandbox.stub(),
    };
    doubles.actionCreators = sandbox.stub(actionCreators);
    proxyMiddleware = proxyquire('../../../src/js/middleware/handleFlags.js', {
      '../actions/creators': doubles.actionCreators,
    });

    testStore = {
      getState: doubles.getState,
      dispatch: doubles.dispatch,
    };
    testAction = {};
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should expose a property named "handleFlags" which is a curry function 3 levels deep', function () {
    assert.typeOf(proxyMiddleware.handleFlags, 'function');
    const secondTier = proxyMiddleware.handleFlags({});
    assert.typeOf(secondTier, 'function');
    const thirdTier = secondTier({});
    assert.typeOf(thirdTier, 'function');
  });

  describe('if the provided action is not of the "TILE_RIGHT_CLICK" type', function () {
    beforeEach(function () {
      testAction = {
        type: 'test action type',
      };
      testStore.getState.returns({});
      doubles.nextStub.returns('dispatch return value.');
    });

    it('should let the action through to the next middleware and return its value', function () {
      assert.strictEqual(
        proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction),
        'dispatch return value.'
      );
    });

    it('should not call getState()', function () {
      proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(testStore.getState.callCount, 0);
    });
    
    it('should call next() once', function () {
      proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.nextStub.callCount, 1);
    });
    
    it('should call next() with 1 argument', function () {
      proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.nextStub.args[0].length, 1);
    });
    
    it('should call next() with the provided action as the argument', function () {
      proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.nextStub.args[0][0], testAction);
    });
    
    it('should not call dispatch()', function () {
      proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(testStore.dispatch.callCount, 0);
    });
  });

  describe('if the provided action is of the "TILE_RIGHT_CLICK" type', function () {
    beforeEach(function () {
      testAction = {
        type: actionTypes.TILE_RIGHT_CLICK,
        payload: '5',
      };
      testStore.getState.returns({
        tiles: {
          '1': { revealed: false },
          '5': { revealed: true },
          '8': { revealed: true },
          '10': { revealed: false },
        },
      });
      doubles.nextStub.returns('dispatch return value.');
    });

    it('should not let the action through to the next middleware and return void', function () {
      assert.strictEqual(
        proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction),
        undefined
      );
    });

    it('should call getState() once', function () {
      proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(testStore.getState.callCount, 1);
    });
    
    it('should call getState() with no arguments', function () {
      proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(testStore.getState.args[0].length, 0);
    });

    describe('if the clicked tile is revealed', function () {
      it('should not call next()', function () {
        proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.nextStub.callCount, 0);
      });
      
      it('should not call dispatch()', function () {
        proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(testStore.dispatch.callCount, 0);
      });
    });

    describe('if the clicked tile is not revealed', function () {
      let dispatchedAction;

      beforeEach(function () {
        testAction.payload = '1';
        dispatchedAction = {
          type: actionTypes.TOGGLE_FLAG,
          payload: '1',
        };
        doubles.actionCreators.toggleFlag.returns(dispatchedAction);
      });

      it('should call the toggleFlag action creator once', function () {
        proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.actionCreators.toggleFlag.callCount, 1);
      });
      
      it('should call the toggleFlag action creator with 1 argument', function () {
        proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.actionCreators.toggleFlag.args[0].length, 1);
      });
      
      it('should call the toggleFlag action creator with the provided action payload as argument', function () {
        proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.actionCreators.toggleFlag.args[0][0], '1');
      });
      
      it('should not call next()', function () {
        proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.nextStub.callCount, 0);
      });
      
      it('should call dispatch() once', function () {
        proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(testStore.dispatch.callCount, 1);
      });
      
      it('should call dispatch() with 1 argument', function () {
        proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(testStore.dispatch.args[0].length, 1);
      });

      it('should call dispatch() with the result of the toggleFlag action creator as argument', function () {
        proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(testStore.dispatch.args[0][0], dispatchedAction);
      });
    });

    describe('if the clicked tile\'s ID doesn\'t exist in the "tiles" property of the redux store', function () {
      beforeEach(function () {
        testAction = {
          type: actionTypes.TILE_RIGHT_CLICK,
          payload: '29',
        };
      });

      it('should not call next()', function () {
        proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.nextStub.callCount, 0);
      });

      it('should not call dispatch()', function () {
        proxyMiddleware.handleFlags(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(testStore.dispatch.callCount, 0);
      });
    });
  });
});