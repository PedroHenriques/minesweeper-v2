'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const actionTypes = require('../../../src/js/actions/actionTypes.js');
const actionCreators = require('../../../src/js/actions/creators.js');
const minefieldUtils = require('../../../src/js/utils/MinefieldUtils.js');

describe('handleRevealTiles Middleware', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyMiddleware;

  beforeEach(function () {
    doubles = {};
    doubles.actionCreators = sandbox.stub(actionCreators);
    doubles.minefieldUtils = sandbox.stub(minefieldUtils);
    proxyMiddleware = proxyquire('../../../src/js/middleware/handleRevealTiles.js', {
      '../actions/creators': doubles.actionCreators,
      '../utils/MinefieldUtils': doubles.minefieldUtils,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should expose a property named "handleRevealTiles" which is a curry function 3 levels deep', function () {
    assert.typeOf(proxyMiddleware.handleRevealTiles, 'function');
    const secondTier = proxyMiddleware.handleRevealTiles({});
    assert.typeOf(secondTier, 'function');
    const thirdTier = secondTier({});
    assert.typeOf(thirdTier, 'function');
  });

  describe('if the action is not of the TILE_LEFT_CLICK or TILE_BOTH_CLICK type', function () {
    let testStore;
    let nextStub;
    let testAction;

    beforeEach(function () {
      testStore = {
        getState: sandbox.stub(),
        dispatch: sandbox.stub(),
      };
      nextStub = sandbox.stub();
      testAction = {
        type: 'test action type',
      };

      testStore.getState.returns({});
    });

    it('should return the next middleware\'s result', function () {
      nextStub.returns('dispatch return value.');

      assert.strictEqual(
        proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction),
        'dispatch return value.'
      );
    });

    it('should call the next middleware once', function () {
      proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
      assert.strictEqual(nextStub.callCount, 1);
    });
    
    it('should call the next middleware with 1 argument', function () {
      proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
      assert.strictEqual(nextStub.args[0].length, 1);
    });

    it('should call the next middleware with the action as argument', function () {
      proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
      assert.strictEqual(nextStub.args[0][0], testAction);
    });

    it('should not call getState() on the store', function () {
      proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
      assert.strictEqual(testStore.getState.callCount, 0);
    });

    it('should not call dispatch() on the store', function () {
      proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
      assert.strictEqual(testStore.dispatch.callCount, 0);
    });
  });

  describe('if the action is of the TILE_LEFT_CLICK type', function () {
    describe('if the clicked tile has a flag', function () {
      let testStore;
      let nextStub;
      let testAction;
      let testState;

      beforeEach(function () {
        testStore = {
          getState: sandbox.stub(),
          dispatch: sandbox.stub(),
        };
        nextStub = sandbox.stub();
        testAction = {
          type: actionTypes.TILE_LEFT_CLICK,
          payload: '1',
        };
        testState = {
          minefield: [ '1', '2', '3' ],
          tiles: {
            '1': { id: '1', revealed: false, hasFlag: true },
            '2': { id: '2', revealed: true, hasFlag: false },
            '3': { id: '3', revealed: false, hasFlag: false },
          },
        };

        testStore.getState.returns(testState);
      });

      it('should return void', function () {
        nextStub.returns('dispatch return value.');

        assert.strictEqual(
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction),
          undefined
        );
      });

      it('should not call next() once', function() {
        proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
        assert.strictEqual(nextStub.callCount, 0);
      });

      it('should call getState(), on the store, once', function() {
        proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
        assert.strictEqual(testStore.getState.callCount, 1);
      });

      it('should call getState() on the store, with no arguments', function() {
        proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
        assert.strictEqual(testStore.getState.args[0].length, 0);
      });

      it('should not call dispatch() on the store', function() {
        proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
        assert.strictEqual(testStore.dispatch.callCount, 0);
      });
    });

    describe('if the clicked tile does not have a flag', function () {
      describe('if the clicked tile is revealed', function () {
        let testStore;
        let nextStub;
        let testAction;
        let testState;

        beforeEach(function () {
          testStore = {
            getState: sandbox.stub(),
            dispatch: sandbox.stub(),
          };
          nextStub = sandbox.stub();
          testAction = {
            type: actionTypes.TILE_LEFT_CLICK,
            payload: '2',
          };
          testState = {
            minefield: [ '1', '2', '3' ],
            tiles: {
              '1': { id: '1', revealed: false, hasFlag: true },
              '2': { id: '2', revealed: true, hasFlag: false },
              '3': { id: '3', revealed: false, hasFlag: false },
            },
          };

          testStore.getState.returns(testState);
        });

        it('should return void', function () {
          nextStub.returns('dispatch return value.');

          assert.strictEqual(
            proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction),
            undefined
          );
        });

        it('should not call next() once', function() {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(nextStub.callCount, 0);
        });

        it('should call getState(), on the store, once', function() {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(testStore.getState.callCount, 1);
        });

        it('should call getState() on the store, with no arguments', function() {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(testStore.getState.args[0].length, 0);
        });

        it('should not call dispatch() on the store', function() {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(testStore.dispatch.callCount, 0);
        });
      });

      describe('if the clicked tile is not revealed', function () {
        let testStore;
        let nextStub;
        let testAction;
        let testState;

        beforeEach(function() {
          testStore = {
            getState: sandbox.stub(),
            dispatch: sandbox.stub(),
          };
          nextStub = sandbox.stub();
          testAction = {
            type: actionTypes.TILE_LEFT_CLICK,
            payload: '3',
          };
          testState = {
            minefield: [ '1', '2', '3' ],
            tiles: {
              '1': { id: '1', revealed: false, hasFlag: true },
              '2': { id: '2', revealed: true, hasFlag: false },
              '3': { id: '3', revealed: false, hasFlag: false },
            },
          };

          testStore.getState.returns(testState);
        });

        it('should call getState() on the store once', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(testStore.getState.callCount, 1);
        });

        it('should call getState() on the store with no arguments', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(testStore.getState.args[0].length, 0);
        });

        it('should call calcTilesToReveal(), from the MinefieldUtils module, once', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(doubles.minefieldUtils.calcTilesToReveal.callCount, 1);
        });

        it('should call calcTilesToReveal(), from the MinefieldUtils module, with 2 arguments', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(doubles.minefieldUtils.calcTilesToReveal.args[0].length, 2);
        });

        describe('1st argument of the call to calcTilesToReveal(), from the MinefieldUtils module', function () {
          it('should be the minefield object, for the current game, in its current state', function () {
            proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
            assert.deepEqual(
              doubles.minefieldUtils.calcTilesToReveal.args[0][0],
              [
                { id: '1', revealed: false, hasFlag: true },
                { id: '2', revealed: true, hasFlag: false },
                { id: '3', revealed: false, hasFlag: false },
              ]
            );
          });
        });

        describe('2nd argument of the call to calcTilesToReveal(), from the MinefieldUtils module', function () {
          it('should be the index of the clicked tile, as a number', function () {
            proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
            assert.strictEqual(doubles.minefieldUtils.calcTilesToReveal.args[0][1], 3);
          });
        });

        it('should call the revealTiles() action creator once', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(doubles.actionCreators.revealTiles.callCount, 1);
        });

        it('should call the revealTiles() action creator with 1 argument', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(doubles.actionCreators.revealTiles.args[0].length, 1);
        });

        it('should call the revealTiles() action creator with the result of the call to calcTilesToReveal() as argument', function () {
          doubles.minefieldUtils.calcTilesToReveal.returns([ '1', '3' ]);
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.deepEqual(
            doubles.actionCreators.revealTiles.args[0][0],
            [ '1', '3' ]
          );
        });

        it('should call dispatch() on the store once', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(testStore.dispatch.callCount, 1);
        });

        it('should call dispatch() on the store with 1 argument', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(testStore.dispatch.args[0].length, 1);
        });

        it('should call dispatch() on the store with the result of calling the revealTiles() action creator as argument', function () {
          const dispatchedAction = {
            type: actionTypes.REVEAL_TILES,
            payload: [ '1', '3' ],
          };
          doubles.actionCreators.revealTiles.returns(dispatchedAction);

          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(testStore.dispatch.args[0][0], dispatchedAction);
        });

        it('should not call the next middleware', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(nextStub.callCount, 0);
        });
      });
    });
  });

  describe('if the action is of the TILE_BOTH_CLICK type', function () {
    describe('if the clicked tile has a flag', function () {
      let testStore;
      let nextStub;
      let testAction;
      let testState;

      beforeEach(function () {
        testStore = {
          getState: sandbox.stub(),
          dispatch: sandbox.stub(),
        };
        nextStub = sandbox.stub();
        testAction = {
          type: actionTypes.TILE_BOTH_CLICK,
          payload: '1',
        };
        testState = {
          minefield: [ '1', '2', '3' ],
          tiles: {
            '1': { id: '1', revealed: false, hasFlag: true },
            '2': { id: '2', revealed: true, hasFlag: false },
            '3': { id: '3', revealed: false, hasFlag: false },
          },
        };

        testStore.getState.returns(testState);
        nextStub.returns('dispatch return value.');
      });

      it('should call getState(), on the store object, once', function () {
        proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
        assert.strictEqual(testStore.getState.callCount, 1);
      });

      it('should call getState(), on the store object, with no arguments', function () {
        proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
        assert.strictEqual(testStore.getState.args[0].length, 0);
      });

      it('should not call next(), blocking the current action', function () {
        proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
        assert.strictEqual(nextStub.callCount, 0);
      });

      it('should not call dispatch()', function () {
        proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
        assert.strictEqual(testStore.dispatch.callCount, 0);
      });
    });

    describe('if the clicked tile does not have a flag', function () {
      describe('if the clicked tile is not revealed', function () {
        let testStore;
        let nextStub;
        let testAction;
        let testState;

        beforeEach(function () {
          testStore = {
            getState: sandbox.stub(),
            dispatch: sandbox.stub(),
          };
          nextStub = sandbox.stub();
          testAction = {
            type: actionTypes.TILE_BOTH_CLICK,
            payload: '3',
          };
          testState = {
            minefield: [ '1', '2', '3' ],
            tiles: {
              '1': { id: '1', revealed: false, hasFlag: true },
              '2': { id: '2', revealed: true, hasFlag: false },
              '3': { id: '3', revealed: false, hasFlag: false },
            },
          };

          testStore.getState.returns(testState);
          nextStub.returns('dispatch return value.');
        });

        it('should call getState(), on the store object, once', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(testStore.getState.callCount, 1);
        });

        it('should call getState(), on the store object, with no arguments', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(testStore.getState.args[0].length, 0);
        });
        
        it('should not call next(), blocking the current action', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(nextStub.callCount, 0);
        });
        
        it('should not call dispatch()', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(testStore.dispatch.callCount, 0);
        });
      });

      describe('if the clicked tile is revealed', function () {
        let testStore;
        let nextStub;
        let testAction;
        let testState;
        let dispatchedAction;

        beforeEach(function () {
          testStore = {
            getState: sandbox.stub(),
            dispatch: sandbox.stub(),
          };
          nextStub = sandbox.stub();
          testAction = {
            type: actionTypes.TILE_BOTH_CLICK,
            payload: '2',
          };
          testState = {
            minefield: [ '1', '2', '3' ],
            tiles: {
              '1': { id: '1', revealed: false, hasFlag: true, numAdjacentMines: 0 },
              '2': { id: '2', revealed: true, hasFlag: false, numAdjacentMines: 0 },
              '3': { id: '3', revealed: false, hasFlag: false, numAdjacentMines: 0 },
            },
          };
          dispatchedAction = {
            type: actionTypes.REVEAL_TILES,
            payload: [ '1', '2' ],
          };

          testStore.getState.returns(testState);
          doubles.minefieldUtils.calcTilesToReveal.returns([ '1', '2' ]);
          doubles.actionCreators.revealTiles.returns(dispatchedAction);
          doubles.minefieldUtils.countIdentifiedMines.returns(0);
          nextStub.returns('dispatch return value.');
        });

        it('should call getState(), on the store object, once', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(testStore.getState.callCount, 1);
        });
        
        it('should call getState(), on the store object, with no arguments', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(testStore.getState.args[0].length, 0);
        });
        
        it('should call countIdentifiedMines(), of the "MinefieldUtils" module, once', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(doubles.minefieldUtils.countIdentifiedMines.callCount, 1);
        });
        
        it('should call countIdentifiedMines(), of the "MinefieldUtils" module, with 2 arguments', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(doubles.minefieldUtils.countIdentifiedMines.args[0].length, 2);
        });

        describe('1st argument passed to the call to countIdentifiedMines(), of the "MinefieldUtils" module', function () {
          it('should be an array with the tile information in the order of the minefield', function () {
            proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
            assert.deepEqual(
              doubles.minefieldUtils.countIdentifiedMines.args[0][0],
              [
                { id: '1', revealed: false, hasFlag: true, numAdjacentMines: 0 },
                { id: '2', revealed: true, hasFlag: false, numAdjacentMines: 0 },
                { id: '3', revealed: false, hasFlag: false, numAdjacentMines: 0 },
              ]
            );
          });
        });
        
        describe('2nd argument passed to the call to countIdentifiedMines(), of the "MinefieldUtils" module', function () {
          it('should be the index of tile clicked, as a number', function () {
            proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
            assert.strictEqual(doubles.minefieldUtils.countIdentifiedMines.args[0][1], 2);
          });
        });

        it('should not call dispatch(), blocking the current action', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(nextStub.callCount, 0);
        });

        it('should not call calcTilesToReveal(), from the "minefieldUtils" module, once', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(doubles.minefieldUtils.calcTilesToReveal.callCount, 1);
        });

        it('should not call calcTilesToReveal(), from the "minefieldUtils" module, with 2 arguments', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(doubles.minefieldUtils.calcTilesToReveal.args[0].length, 2);
        });

        describe('1st argument passed to the call to calcTilesToReveal(), from the "minefieldUtils" module', function () {
          it('should have the current minefield state', function () {
            proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
            assert.deepEqual(
              doubles.minefieldUtils.calcTilesToReveal.args[0][0],
              [
                { id: '1', revealed: false, hasFlag: true, numAdjacentMines: 0 },
                { id: '2', revealed: true, hasFlag: false, numAdjacentMines: 0 },
                { id: '3', revealed: false, hasFlag: false, numAdjacentMines: 0 },
              ]
            );
          });
        });
        
        describe('2nd argument passed to the call to calcTilesToReveal(), from the "minefieldUtils" module', function () {
          it('should have the clicked tile ID', function () {
            proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
            assert.strictEqual(doubles.minefieldUtils.calcTilesToReveal.args[0][1], 2);
          });
        });

        it('should call dispatch(), on the store object, once', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.strictEqual(testStore.dispatch.callCount, 1);
        });

        it('should call dispatch(), on the store object, with the correct arguments', function () {
          proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
          assert.deepStrictEqual(testStore.dispatch.args[0], [ dispatchedAction ]);
        });

        describe('if the call to countIdentifiedMines(), of the "MinefieldUtils" module, returns a value lower than the clicked tile\'s number of adjacent mines', function () {
          beforeEach(function () {
            testState.tiles = {
              '1': { id: '1', revealed: false, hasFlag: true, numAdjacentMines: 0 },
              '2': { id: '2', revealed: true, hasFlag: false, numAdjacentMines: 4 },
              '3': { id: '3', revealed: false, hasFlag: false, numAdjacentMines: 0 },
            };
            doubles.minefieldUtils.calcTilesToReveal.returns(3);
          });

          it('should not call dispatch(), on the store object', function () {
            proxyMiddleware.handleRevealTiles(testStore)(nextStub)(testAction);
            assert.strictEqual(testStore.dispatch.callCount, 0);
          });
        });
      });
    });
  });
});