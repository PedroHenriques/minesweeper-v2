'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const normalizr = require('normalizr');
const actionTypes = require('../../../src/js/actions/actionTypes.js');
const actionCreators = require('../../../src/js/actions/creators.js');
const schemas = require('../../../src/js/schemas.js');
const minefieldUtils = require('../../../src/js/utils/MinefieldUtils.js');

describe('handleGenerateMinefield Middleware', function () {
  const sandbox = sinon.createSandbox();
  let fakeTimers;
  let doubles;
  let proxyMiddleware;
  let testStore;
  let testAction;

  beforeEach(function () {
    fakeTimers = sandbox.useFakeTimers(new Date());
    doubles = {
      normalizr: sandbox.stub(normalizr),
      actionCreators: sandbox.stub(actionCreators),
      minefieldUtils: sandbox.stub(minefieldUtils),
      getState: sandbox.stub(),
      dispatch: sandbox.stub(),
      nextStub: sandbox.stub(),
    };
    proxyMiddleware = proxyquire('../../../src/js/middleware/handleGenerateMinefield.js', {
      'normalizr': doubles.normalizr,
      '../actions/creators': doubles.actionCreators,
      '../utils/MinefieldUtils': doubles.minefieldUtils,
    });

    testStore = {
      getState: doubles.getState,
      dispatch: doubles.dispatch,
    };
    testAction = {};
  });

  afterEach(function () {
    fakeTimers.restore();
    sandbox.restore();
  });

  it('should expose a property named "handleGenerateMinefield" which is a curry function 3 levels deep', function () {
    assert.typeOf(proxyMiddleware.handleGenerateMinefield, 'function');
    const secondTier = proxyMiddleware.handleGenerateMinefield({});
    assert.typeOf(secondTier, 'function');
    const thirdTier = secondTier({});
    assert.typeOf(thirdTier, 'function');
  });

  describe('if the provided action is not of the "GENERATE_MINEFIELD" type', function () {
    beforeEach(function () {
      testAction.type = 'test action type';
      doubles.nextStub.returns('dispatch return value.');
    });

    it('should let the action through to the next middleware and return its value', function () {
      assert.strictEqual(
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction),
        'dispatch return value.'
      );
    });

    it('should not call getState()', function () {
      proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(testStore.getState.callCount, 0);
    });
    
    it('should call next() once', function () {
      proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.nextStub.callCount, 1);
    });
    
    it('should call next() with 1 argument', function () {
      proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.nextStub.args[0].length, 1);
    });
    
    it('should call next() with the provided action as argument', function () {
      proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(doubles.nextStub.args[0][0], testAction);
    });
    
    it('should not call dispatch()', function () {
      proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
      assert.strictEqual(testStore.dispatch.callCount, 0);
    });
  });

  describe('if the provided action is of the "GENERATE_MINEFIELD" type', function () {
    let testState;

    beforeEach(function () {
      testState = {};
      testAction.type = actionTypes.GENERATE_MINEFIELD;
      testStore.getState.returns(testState);
      doubles.nextStub.returns('dispatch return value.');
    });

    describe('if the action\'s payload is null (restart of current game)', function () {
      beforeEach(function () {
        testAction.payload = null;
      });

      describe('if the store\'s setup property is null', function () {
        beforeEach(function () {
          testState.setup = null;
        });

        it('should block the action and return void', function () {
          assert.strictEqual(
            proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction),
            undefined
          );
        });

        it('should call getState() once', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(testStore.getState.callCount, 1);
        });
        
        it('should call getState() with no arguments', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(testStore.getState.args[0].length, 0);
        });
        
        it('should not call next()', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(doubles.nextStub.callCount, 0);
        });
        
        it('should not call dispatch()', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(testStore.dispatch.callCount, 0);
        });
      });

      describe('if the store\'s setup property is not null', function () {
        let dispatchedAction;
        let newMinefield;

        beforeEach(function () {
          testState.setup = {
            gameSeed: 'game seed',
            numLives: 57,
            flagsEnabled: true,
            gameMode: 'game mode',
          };
          testState.minefield = [ '1', '4', '2', '5', '3' ];
          testState.tiles = {
            '1': { id: '1', row: 0, col: 0 },
            '2': { id: '2', row: 1, col: 0 },
            '3': { id: '3', row: 2, col: 0 },
            '4': { id: '4', row: 0, col: 1 },
            '5': { id: '5', row: 1, col: 1 },
          };
          dispatchedAction = {
            type: actionTypes.START_GAME,
            payload: {
              setup: {},
              minefield: [],
              tiles: {},
            },
          };
          newMinefield = [
            { id: '1', row: 0, col: 0 },
            { id: '2', row: 1, col: 0 },
            { id: '3', row: 2, col: 0 },
            { id: '4', row: 0, col: 1 },
            { id: '5', row: 1, col: 1 },
          ];

          doubles.getState.returns(testState);
          doubles.minefieldUtils.getMinefieldStats.returns({ numMines: 28 });
          doubles.minefieldUtils.generateMinefield.returns(newMinefield);
          doubles.normalizr.normalize.returns({
            result: 'normalize result',
            entities: {
              tiles: 'normalize entities tiles',
            },
          });
          doubles.actionCreators.startGame.returns(dispatchedAction);
          doubles.nextStub.returns('dispatch return value.');
        });

        it('should block the action and return void', function () {
          assert.strictEqual(
            proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction),
            undefined
          );
        });

        it('should call getState() once', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(testStore.getState.callCount, 1);
        });
        
        it('should call getState() with no arguments', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(testStore.getState.args[0].length, 0);
        });
        
        it('should call MinefieldUtils getMinefieldStats() once', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(doubles.minefieldUtils.getMinefieldStats.callCount, 1);
        });
        
        it('should call MinefieldUtils getMinefieldStats() with 1 argument', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(doubles.minefieldUtils.getMinefieldStats.args[0].length, 1);
        });
        
        it('should call MinefieldUtils getMinefieldStats() with the current board as argument', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.deepEqual(
            doubles.minefieldUtils.getMinefieldStats.args[0][0],
            [
              { id: '1', row: 0, col: 0 },
              { id: '4', row: 0, col: 1 },
              { id: '2', row: 1, col: 0 },
              { id: '5', row: 1, col: 1 },
              { id: '3', row: 2, col: 0 },
            ]
          );
        });

        it('should call MinefieldUtils generateMinefield() once', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(doubles.minefieldUtils.generateMinefield.callCount, 1);
        });
        
        it('should call MinefieldUtils generateMinefield() with 1 argument', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(doubles.minefieldUtils.generateMinefield.args[0].length, 1);
        });
        
        it('should call MinefieldUtils generateMinefield() with the game setup argument', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.deepEqual(
            doubles.minefieldUtils.generateMinefield.args[0][0],
            {
              gameSeed: testState.setup.gameSeed,
              dimensions: { rows: 3, cols: 1 },
              numMines: 28,
            }
          );
        });

        it('should call normalize() once', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(doubles.normalizr.normalize.callCount, 1);
        });
        
        it('should call normalize() with 2 arguments', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(doubles.normalizr.normalize.args[0].length, 2);
        });
        
        it('should call normalize() with the generated minefield as the 1st arguments', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(doubles.normalizr.normalize.args[0][0], newMinefield);
        });
        
        it('should call normalize() with the minefield schema as the 2nd arguments', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(doubles.normalizr.normalize.args[0][1], schemas.minefieldSchema);
        });

        it('should call the startGame action creator once', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(doubles.actionCreators.startGame.callCount, 1);
        });
        
        it('should call the startGame action creator with 3 arguments', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(doubles.actionCreators.startGame.args[0].length, 3);
        });
        
        it('should call the startGame action creator with the game setup as the 1st argument', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.deepEqual(
            doubles.actionCreators.startGame.args[0][0],
            {
              numLives: testState.setup.numLives,
              flagsEnabled: testState.setup.flagsEnabled,
              gameSeed: testState.setup.gameSeed,
              gameMode: testState.setup.gameMode,
              gameStartUTC: fakeTimers.now,
              gameEndUTC: null,
            }
          );
        });
        
        it('should call the startGame action creator with the normalized IDs as the 2nd argument', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(doubles.actionCreators.startGame.args[0][1], 'normalize result');
        });
        
        it('should call the startGame action creator with the normalized entities as the 3rd argument', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(doubles.actionCreators.startGame.args[0][2], 'normalize entities tiles');
        });
        
        it('should call dispatch() once', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(testStore.dispatch.callCount, 1);
        });
        
        it('should call dispatch() with 1 argument', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(testStore.dispatch.args[0].length, 1);
        });
        
        it('should call dispatch() with the result of calling the startGame action creator argument', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(testStore.dispatch.args[0][0], dispatchedAction);
        });
        
        it('should not call next()', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(doubles.nextStub.callCount, 0);
        });

        describe('if normalize(), from the "normalizr" module, returns undefined', function () {
          beforeEach(function () {
            doubles.normalizr.normalize.returns(undefined);
          });

          it('should not call dispatch()', function () {
            proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
            assert.strictEqual(testStore.dispatch.callCount, 0);
          });
          
          it('should return undefined', function () {
            assert.isUndefined(proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction));
          });
        });
        
        describe('if the result of normalize(), from the "normalizr" module, has the "entities" property set to undefined', function () {
          beforeEach(function () {
            doubles.normalizr.normalize.returns({});
          });

          it('should not call dispatch()', function () {
            proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
            assert.strictEqual(testStore.dispatch.callCount, 0);
          });
          
          it('should return undefined', function () {
            assert.isUndefined(proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction));
          });
        });
        
        describe('if the result of normalize(), from the "normalizr" module, has the "entities.tiles" property set to undefined', function () {
          beforeEach(function () {
            doubles.normalizr.normalize.returns({ entities: {} });
          });

          it('should not call dispatch()', function () {
            proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
            assert.strictEqual(testStore.dispatch.callCount, 0);
          });
          
          it('should return undefined', function () {
            assert.isUndefined(proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction));
          });
        });
      });
    });

    describe('if the action\'s payload is not null (start a new game)', function () {
      let newMinefield;
      let dispatchedAction;

      beforeEach(function () {
        testAction.payload = {
          gameSeed: 'game seed',
          dimensions: { rows: 4, cols: 2 },
          numMines: 79,
          numLives: 35,
          flagsEnabled: false,
          gameMode: 'game mode',
        };
        newMinefield = [
          { id: '1', row: 0, col: 0 },
          { id: '2', row: 1, col: 0 },
          { id: '3', row: 2, col: 0 },
          { id: '4', row: 0, col: 1 },
          { id: '5', row: 1, col: 1 },
        ];
        dispatchedAction = {
          type: actionTypes.START_GAME,
          payload: {
            setup: {},
            minefield: [],
            tiles: {},
          },
        };

        doubles.getState.returns(testState);
        doubles.minefieldUtils.getMinefieldStats.returns({ numMines: 28 });
        doubles.minefieldUtils.generateMinefield.returns(newMinefield);
        doubles.normalizr.normalize.returns({
          result: 'normalize result',
          entities: {
            tiles: 'normalize entities tiles',
          },
        });
        doubles.actionCreators.startGame.returns(dispatchedAction);
        doubles.nextStub.returns('dispatch return value.');
      });

      it('should block the action and return void', function () {
        assert.strictEqual(
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction),
          undefined
        );
      });

      it('should not call getState()', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(testStore.getState.callCount, 0);
      });
      
      it('should not call getMinefieldStats()', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.minefieldUtils.getMinefieldStats.callCount, 0);
      });
      
      it('should call generateMinefield() once', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.minefieldUtils.generateMinefield.callCount, 1);
      });
      
      it('should call generateMinefield() with 1 argument', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.minefieldUtils.generateMinefield.args[0].length, 1);
      });
      
      it('should call generateMinefield() with the data provided in the action as argument', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.deepEqual(
          doubles.minefieldUtils.generateMinefield.args[0][0],
          {
            gameSeed: testAction.payload.gameSeed,
            dimensions: testAction.payload.dimensions,
            numMines: testAction.payload.numMines,
          }
        );
      });

      it('should call normalize() once', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.normalizr.normalize.callCount, 1);
      });
      
      it('should call normalize() with 2 arguments', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.normalizr.normalize.args[0].length, 2);
      });
      
      it('should call normalize() with the generated minefield as the 1st argument', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.normalizr.normalize.args[0][0], newMinefield);
      });
      
      it('should call normalize() with the minefield schema as the 2nd argument', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.normalizr.normalize.args[0][1], schemas.minefieldSchema);
      });

      it('should call the startGame action creator once', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.actionCreators.startGame.callCount, 1);
      });
      
      it('should call the startGame action creator with 3 arguments', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.actionCreators.startGame.args[0].length, 3);
      });
      
      it('should call the startGame action creator with the game setup as the 1st argument', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.deepEqual(
          doubles.actionCreators.startGame.args[0][0],
          {
            numLives: testAction.payload.numLives,
            flagsEnabled: testAction.payload.flagsEnabled,
            gameSeed: testAction.payload.gameSeed,
            gameMode: testAction.payload.gameMode,
            gameStartUTC: fakeTimers.now,
            gameEndUTC: null,
          }
        );
      });
      
      it('should call the startGame action creator with the normalized IDs as the 2nd argument', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.actionCreators.startGame.args[0][1], 'normalize result');
      });
      
      it('should call the startGame action creator with the normalized entities as the 3rd argument', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.actionCreators.startGame.args[0][2], 'normalize entities tiles');
      });
      
      it('should call dispatch() once', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(testStore.dispatch.callCount, 1);
      });
      
      it('should call dispatch() with 1 argument', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(testStore.dispatch.args[0].length, 1);
      });
      
      it('should call dispatch() with the result of calling the startGame action creator argument', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(testStore.dispatch.args[0][0], dispatchedAction);
      });
      
      it('should not call next()', function () {
        proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
        assert.strictEqual(doubles.nextStub.callCount, 0);
      });

      describe('if normalize(), from the "normalizr" module, returns undefined', function () {
        beforeEach(function () {
          doubles.normalizr.normalize.returns(undefined);
        });

        it('should not call dispatch()', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(testStore.dispatch.callCount, 0);
        });
        
        it('should return undefined', function () {
          assert.isUndefined(proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction));
        });
      });
      
      describe('if the result of normalize(), from the "normalizr" module, has the "entities" property set to undefined', function () {
        beforeEach(function () {
          doubles.normalizr.normalize.returns({});
        });

        it('should not call dispatch()', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(testStore.dispatch.callCount, 0);
        });
        
        it('should return undefined', function () {
          assert.isUndefined(proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction));
        });
      });
      
      describe('if the result of normalize(), from the "normalizr" module, has the "entities.tiles" property set to undefined', function () {
        beforeEach(function () {
          doubles.normalizr.normalize.returns({ entities: {} });
        });

        it('should not call dispatch()', function () {
          proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction);
          assert.strictEqual(testStore.dispatch.callCount, 0);
        });
        
        it('should return undefined', function () {
          assert.isUndefined(proxyMiddleware.handleGenerateMinefield(testStore)(doubles.nextStub)(testAction));
        });
      });
    });
  });
});