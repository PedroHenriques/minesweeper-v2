'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const actionTypes = require('../../../src/js/actions/actionTypes.js');

describe('gameEndedBlocker Middleware', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyMiddleware;
  let testStore;
  let testAction;

  beforeEach(function () {
    doubles = {
      getState: sandbox.stub(),
      dispatchStub: sandbox.stub(),
    };
    proxyMiddleware = proxyquire('../../../src/js/middleware/gameEndedBlocker.js', {});

    testStore = {
      getState: doubles.getState,
    };
    testAction = {};
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should expose a property named "gameEndedBlocker" which is a curry function 3 levels deep', function () {
    assert.typeOf(proxyMiddleware.gameEndedBlocker, 'function');
    const secondTier = proxyMiddleware.gameEndedBlocker({});
    assert.typeOf(secondTier, 'function');
    const thirdTier = secondTier({});
    assert.typeOf(thirdTier, 'function');
  });

  it('should call getState(), from the store object, once', function () {
    doubles.getState.returns({ setup: { gameEndUTC: null } });
    proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
    assert.strictEqual(doubles.getState.callCount, 1);
  });

  it('should call getState() with no arguments', function () {
    doubles.getState.returns({ setup: { gameEndUTC: null } });
    proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
    assert.strictEqual(doubles.getState.args[0].length, 0);
  });

  describe('if a game is running', function () {
    describe('if the game has not yet ended', function () {
      beforeEach(function () {
        doubles.getState.returns({ setup: { gameEndUTC: null } });
        doubles.dispatchStub.returns('dispatch return value.');
      });

      it('should return the result of calling dispatch()', function () {
        assert.strictEqual(
          proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction),
          'dispatch return value.'
        );
      });

      it('should call dispatch() once', function () {
        proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
        assert.strictEqual(doubles.dispatchStub.callCount, 1);
      });

      it('should call dispatch() with 1 argument', function () {
        proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
        assert.strictEqual(doubles.dispatchStub.args[0].length, 1);
      });

      it('should call dispatch() with the provided action', function () {
        proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
        assert.strictEqual(doubles.dispatchStub.args[0][0], testAction);
      });
    });

    describe('if the game has ended', function () {
      beforeEach(function () {
        testStore.getState.returns({ setup: { gameEndUTC: 123456 } });
        doubles.dispatchStub.returns('dispatch return value.');
      });

      describe('if the provided action is of the "GENERATE_MINEFIELD" type', function () {
        beforeEach(function () {
          testAction = {
            type: actionTypes.GENERATE_MINEFIELD,
          };
        });

        it('should let the action through to the next middleware and return its value', function () {
          assert.strictEqual(
            proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction),
            'dispatch return value.'
          );
        });

        it('should call dispatch() once', function () {
          proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
          assert.strictEqual(doubles.dispatchStub.callCount, 1);
        });
  
        it('should call dispatch() with 1 argument', function () {
          proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
          assert.strictEqual(doubles.dispatchStub.args[0].length, 1);
        });
  
        it('should call dispatch() with the provided action', function () {
          proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
          assert.strictEqual(doubles.dispatchStub.args[0][0], testAction);
        });
      });

      describe('if the provided action is of the "START_GAME" type', function () {
        beforeEach(function () {
          testAction = {
            type: actionTypes.START_GAME,
          };
        });

        it('should let the action through to the next middleware and return its value', function () {
          assert.strictEqual(
            proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction),
            'dispatch return value.'
          );
        });

        it('should call dispatch() once', function () {
          proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
          assert.strictEqual(doubles.dispatchStub.callCount, 1);
        });
  
        it('should call dispatch() with 1 argument', function () {
          proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
          assert.strictEqual(doubles.dispatchStub.args[0].length, 1);
        });
  
        it('should call dispatch() with the provided action', function () {
          proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
          assert.strictEqual(doubles.dispatchStub.args[0][0], testAction);
        });
      });

      describe('if the provided action is of the "SHOW_NEW_GAME_SETUP" type', function () {
        beforeEach(function () {
          testAction = {
            type: actionTypes.SHOW_NEW_GAME_SETUP,
          };
        });

        it('should let the action through to the next middleware and return its value', function () {
          assert.strictEqual(
            proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction),
            'dispatch return value.'
          );
        });

        it('should call dispatch() once', function () {
          proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
          assert.strictEqual(doubles.dispatchStub.callCount, 1);
        });
  
        it('should call dispatch() with 1 argument', function () {
          proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
          assert.strictEqual(doubles.dispatchStub.args[0].length, 1);
        });
  
        it('should call dispatch() with the provided action', function () {
          proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
          assert.strictEqual(doubles.dispatchStub.args[0][0], testAction);
        });
      });

      describe('if the provided action is of any other type', function () {
        beforeEach(function () {
          testAction = {
            type: 'not allowed action type',
          };
        });

        it('should not let the action through to the next middleware and return void', function () {
          assert.strictEqual(
            proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction),
            undefined
          );
        });

        it('should not call dispatch()', function () {
          proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
          assert.strictEqual(doubles.dispatchStub.callCount, 0);
        });
      });
    });
  });

  describe('if a game is not running', function () {
    beforeEach(function () {
      testStore.getState.returns({ setup: null });
      doubles.dispatchStub.returns('dispatch return value.');
    });

    it('should let any action through to the next middleware and return its value', function () {
      assert.strictEqual(
        proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction),
        'dispatch return value.'
      );
    });

    it('should call dispatch() once', function () {
      proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
      assert.strictEqual(doubles.dispatchStub.callCount, 1);
    });

    it('should call dispatch() with 1 argument', function () {
      proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
      assert.strictEqual(doubles.dispatchStub.args[0].length, 1);
    });

    it('should call dispatch() with the provided action', function () {
      proxyMiddleware.gameEndedBlocker(testStore)(doubles.dispatchStub)(testAction);
      assert.strictEqual(doubles.dispatchStub.args[0][0], testAction);
    });
  });
});