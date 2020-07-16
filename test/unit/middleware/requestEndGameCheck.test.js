'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const actionCreators = require('../../../src/js/actions/creators.js');

describe('requestEndGameCheck Middleware', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyMiddleware;
  let testStore;
  let testAction;

  beforeEach(function () {
    doubles = {
      getState: sandbox.stub(),
      dispatchStub: sandbox.stub(),
      nextStub: sandbox.stub(),
      actionCreators: sandbox.stub(actionCreators),
    };
    proxyMiddleware = proxyquire('../../../src/js/middleware/requestEndGameCheck.js', {
      '../actions/creators': doubles.actionCreators,
      '../actions/actionTypes': {
        REVEAL_TILES: 'test reveal tiles action',
      },
    });

    testStore = {
      getState: doubles.getState,
      dispatch: doubles.dispatchStub,
    };
    testAction = {};
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should expose a property named "requestEndGameCheck" which is a curry function 3 levels deep', function () {
    assert.typeOf(proxyMiddleware.requestEndGameCheck, 'function');
    const secondTier = proxyMiddleware.requestEndGameCheck({});
    assert.typeOf(secondTier, 'function');
    const thirdTier = secondTier({});
    assert.typeOf(thirdTier, 'function');
  });

  it('should call the 1st argument provided to the 2nd function, of the curry, once', function () {
    proxyMiddleware.requestEndGameCheck(testStore)(doubles.nextStub)(testAction);
    assert.strictEqual(doubles.nextStub.callCount, 1);
  });

  it('should call the 1st argument provided to the 2nd function, of the curry, with 1 argument', function () {
    proxyMiddleware.requestEndGameCheck(testStore)(doubles.nextStub)(testAction);
    assert.strictEqual(doubles.nextStub.args[0].length, 1);
  });

  describe('1st argument provided to the 2nd function of the curry', function () {
    it('should be the action being processed', function () {
      proxyMiddleware.requestEndGameCheck(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.nextStub.args[0][0], testAction);
    });
  });

  it('should return the result of calling the 1st argument provided to the 2nd function, of the curry', function () {
    const expectedResult = {};
    doubles.nextStub.returns(expectedResult);

    assert.strictEqual(
      proxyMiddleware.requestEndGameCheck(testStore)(doubles.nextStub)(testAction),
      expectedResult
    );
  });

  it('should not call checkGameEnd(), from the "creators" module', function () {
    proxyMiddleware.requestEndGameCheck(testStore)(doubles.nextStub)(testAction);
    assert.strictEqual(doubles.actionCreators.checkGameEnd.callCount, 0);
  });

  describe('if the action being processed is of the type "REVEAL_TILES"', function () {
    beforeEach(function () {
      testAction.type = 'test reveal tiles action';
    });

    it('should call checkGameEnd(), from the "creators" module, once', function () {
      proxyMiddleware.requestEndGameCheck(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.actionCreators.checkGameEnd.callCount, 1);
    });

    it('should call checkGameEnd(), from the "creators" module, with no arguments', function () {
      proxyMiddleware.requestEndGameCheck(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.actionCreators.checkGameEnd.args[0].length, 0);
    });
    
    it('should call dispatch(), of the store object, once', function () {
      proxyMiddleware.requestEndGameCheck(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.dispatchStub.callCount, 1);
    });

    it('should call dispatch(), of the store object, with 1 argument', function () {
      proxyMiddleware.requestEndGameCheck(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.dispatchStub.args[0].length, 1);
    });

    describe('1st argument provided to dispatch(), of the store object', function () {
      it('should be the return value of checkGameEnd(), from the "creators" module', function () {
        const expectedAction = {};
        doubles.actionCreators.checkGameEnd.returns(expectedAction);

        proxyMiddleware.requestEndGameCheck(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.dispatchStub.args[0][0], expectedAction);
      });
    });

    it('should call the 1st argument provided to the 2nd function, of the curry, once', function () {
      proxyMiddleware.requestEndGameCheck(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.nextStub.callCount, 1);
    });
  
    it('should call the 1st argument provided to the 2nd function, of the curry, with 1 argument', function () {
      proxyMiddleware.requestEndGameCheck(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.nextStub.args[0].length, 1);
    });
  
    describe('1st argument provided to the 2nd function of the curry', function () {
      it('should be the action being processed', function () {
        proxyMiddleware.requestEndGameCheck(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.nextStub.args[0][0], testAction);
      });
    });

    it('should call the 1st argument provided to the 2nd function, of the curry, before calling dispatch(), of the store object', function () {
      proxyMiddleware.requestEndGameCheck(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.nextStub.calledBefore(doubles.dispatchStub), true);
    });
  });
});