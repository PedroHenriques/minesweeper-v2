'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const minefieldUtils = require('../../../src/js/utils/MinefieldUtils.js');
const actionCreators = require('../../../src/js/actions/creators.js');

describe('checkIfGameEnded Middleware', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyMiddleware;
  let testStore;

  beforeEach(function () {
    doubles = {
      getState: sandbox.stub(),
      dispatchStub: sandbox.stub(),
      nextStub: sandbox.stub(),
      minefieldUtils: sandbox.stub(minefieldUtils),
      actionCreators: sandbox.stub(actionCreators),
    };
    proxyMiddleware = proxyquire('../../../src/js/middleware/checkIfGameEnded.js', {
      '../actions/actionTypes': {
        CHECK_GAME_END: 'check end game action type',
      },
      '../actions/creators': doubles.actionCreators,
      '../utils/MinefieldUtils': doubles.minefieldUtils,
      '../data': {
        GAME_WON: 'game won value',
        GAME_LOST: 'game lost value',
      },
    });

    testStore = {
      getState: doubles.getState,
      dispatch: doubles.dispatchStub,
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should expose a property named "checkIfGameEnded" which is a curry function 3 levels deep', function () {
    assert.typeOf(proxyMiddleware.checkIfGameEnded, 'function');
    const secondTier = proxyMiddleware.checkIfGameEnded({});
    assert.typeOf(secondTier, 'function');
    const thirdTier = secondTier({});
    assert.typeOf(thirdTier, 'function');
  });

  describe('if the action is of type "CHECK_GAME_END"', function () {
    let testAction;
    let testState;
    beforeEach(function () {
      testAction = { type: 'check end game action type' };
      testState = {
        setup: {},
        minefield: [],
        tiles: {},
      };

      doubles.getState.returns(testState);
    });

    it('should return void', function () {
      assert.isUndefined(proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction));
    });

    it('should call getState(), on the object provided as argument to the 1st function in the curry, once', function () {
      proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.getState.callCount, 1);
    });

    it('should call getState(), on the object provided as argument to the 1st function in the curry, with no arguments', function () {
      proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.getState.args[0].length, 0);
    });

    it('should call getGameState(), of the MinefieldUtils module, once', function () {
      proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.minefieldUtils.getGameState.callCount, 1);
    });

    it('should call getGameState(), of the MinefieldUtils module, with 2 arguments', function () {
      proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.minefieldUtils.getGameState.args[0].length, 2);
    });

    describe('1st argument provided to getGameState()', function () {
      it('should be an array representing the tiles in the minefield', function () {
        testState.minefield = ['1', '3', '4'];
        testState.tiles = {
          1: { id: '1', key1: 'value 1'},
          2: { id: '2', key1: 'value 2'},
          3: { id: '3', key1: 'value 3'},
          4: { id: '4', key1: 'value 4'},
        };

        proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
        assert.deepStrictEqual(
          doubles.minefieldUtils.getGameState.args[0][0],
          [
            testState.tiles['1'],
            testState.tiles['3'],
            testState.tiles['4'],
          ]
        );
      });
    });

    describe('2nd argument provided to getGameState()', function () {
      it('should be the value of "state.setup.numLives"', function () {
        testState.setup.numLives = 1234567890;
        proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.minefieldUtils.getGameState.args[0][1], 1234567890);
      });
    });

    it('should not call the function provided as argument to the 2nd function in the curry', function () {
      proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.nextStub.callCount, 0);
    });

    describe('if the call to getGameState(), of the MinefieldUtils module, returns the value of the const "GAME_WON"', function () {
      it('should call endGame(), of the creators module, once', function () {
        doubles.minefieldUtils.getGameState.returns('game won value');
        proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.actionCreators.endGame.callCount, 1);
      });

      it('should call endGame(), of the creators module, with no argument', function () {
        doubles.minefieldUtils.getGameState.returns('game won value');
        proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.actionCreators.endGame.args[0].length, 0);
      });

      it('should call dispatch(), on the object provided as argument to the 1st function of the curry, once', function () {
        doubles.minefieldUtils.getGameState.returns('game won value');
        proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(testStore.dispatch.callCount, 1);
      });

      it('should call dispatch(), on the object provided as argument to the 1st function of the curry, with 1 argument', function () {
        doubles.minefieldUtils.getGameState.returns('game won value');
        proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(testStore.dispatch.args[0].length, 1);
      });

      describe('1st argument provided to the call of dispatch(), on the object provided as argument to the 1st function of the curry', function () {
        it('should be the value returned by endGame(), of the creators module', function () {
          doubles.minefieldUtils.getGameState.returns('game won value');
          const endGameTestAction = {};
          doubles.actionCreators.endGame.returns(endGameTestAction);

          proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(testStore.dispatch.args[0][0], endGameTestAction);
        });
      });

      it('should not call the function provided as argument to the 2nd function in the curry', function () {
        doubles.minefieldUtils.getGameState.returns('game won value');
        proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.nextStub.callCount, 0);
      });
    });

    describe('if the call to getGameState(), of the MinefieldUtils module, returns the value of the const "GAME_LOST"', function () {
      it('should call endGame(), of the creators module, once', function () {
        doubles.minefieldUtils.getGameState.returns('game lost value');
        proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.actionCreators.endGame.callCount, 1);
      });

      it('should call endGame(), of the creators module, with no argument', function () {
        doubles.minefieldUtils.getGameState.returns('game lost value');
        proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.actionCreators.endGame.args[0].length, 0);
      });

      it('should call dispatch(), on the object provided as argument to the 1st function of the curry, once', function () {
        doubles.minefieldUtils.getGameState.returns('game lost value');
        proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(testStore.dispatch.callCount, 1);
      });

      it('should call dispatch(), on the object provided as argument to the 1st function of the curry, with 1 argument', function () {
        doubles.minefieldUtils.getGameState.returns('game lost value');
        proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(testStore.dispatch.args[0].length, 1);
      });

      describe('1st argument provided to the call of dispatch(), on the object provided as argument to the 1st function of the curry', function () {
        it('should be the value returned by endGame(), of the creators module', function () {
          doubles.minefieldUtils.getGameState.returns('game lost value');
          const endGameTestAction = {};
          doubles.actionCreators.endGame.returns(endGameTestAction);

          proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(testStore.dispatch.args[0][0], endGameTestAction);
        });
      });

      it('should not call the function provided as argument to the 2nd function in the curry', function () {
        doubles.minefieldUtils.getGameState.returns('game lost value');
        proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.nextStub.callCount, 0);
      });
    });
  });

  describe('if the action is not of type "CHECK_GAME_END"', function () {
    let testAction;
    let testState;
    beforeEach(function () {
      testAction = { type: 'some action type' };
      testState = {
        setup: {},
        minefield: [],
        tiles: {},
      };

      doubles.getState.returns(testState);
    });

    it('should call the function provided as argument to the 2nd function of the curry, once', function () {
      proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.nextStub.callCount, 1);
    });

    it('should call the function provided as argument to the 2nd function of the curry, with 1 argument', function () {
      proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.nextStub.args[0].length, 1);
    });

    describe('1st argument provided to the call of the function provided as argument to the 2nd function of the curry', function () {
      it('should be the action being processed', function () {
        proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.nextStub.args[0][0], testAction);
      });
    });

    it('should return the result of calling the function provided as argument to the 2nd function of the curry', function () {
      const nextReturn = {};
      doubles.nextStub.returns(nextReturn);

      assert.strictEqual(
        proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction),
        nextReturn
      );
    });

    it('should not call dispatch(), on the the object provided as argument to the 1st function of the curry', function () {
      proxyMiddleware.checkIfGameEnded(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(testStore.dispatch.callCount, 0);
    });
  });
});