'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const actions = require('../../src/js/actions/actionTypes');

describe('Redux Store and Middlewares', function () {
  const sandbox = sinon.createSandbox();
  let fakeTimers;
  let proxyStore;

  beforeEach(function () {
    fakeTimers = sandbox.useFakeTimers(new Date());
    global.window = {};

    proxyStore = proxyquire('../../src/js/store.js', {});
  });

  afterEach(function () {
    fakeTimers.restore();
    sandbox.restore();
    delete global.window;
  });
  
  describe('GENERATE_MINEFIELD action', function () {
    it('should update the store with the generated minefield', function () {
      const payload = {
        numMines: 1,
        dimensions: { rows: 3, cols: 3 },
        flagsEnabled: true,
        numLives: 1,
        gameSeed: 'test seed',
        gameMode: 'classic',
      };
      proxyStore.store.dispatch({
        type: actions.GENERATE_MINEFIELD,
        payload
      });

      assert.deepEqual(
        proxyStore.store.getState(),
        {
          setup: {
            flagsEnabled: true,
            numLives: 1,
            gameSeed: 'test seed',
            gameMode: 'classic',
            gameStartUTC: fakeTimers.now,
            gameEndUTC: null,
          },
          minefield: [ '0', '1', '2', '3', '4', '5', '6', '7', '8' ],
          tiles: {
            '0': {
              id: '0',
              row: 0,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '1': {
              id: '1',
              row: 0,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '2': {
              id: '2',
              row: 0,
              col: 2,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '3': {
              id: '3',
              row: 1,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '4': {
              id: '4',
              row: 1,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '5': {
              id: '5',
              row: 1,
              col: 2,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '6': {
              id: '6',
              row: 2,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '7': {
              id: '7',
              row: 2,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '8': {
              id: '8',
              row: 2,
              col: 2,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 0
            }
          },
        }
      );
    });
  });

  describe('SHOW_NEW_GAME_SETUP action', function () {
    beforeEach(function () {
      const payload = {
        numMines: 1,
        dimensions: { rows: 3, cols: 3 },
        flagsEnabled: true,
        numLives: 1,
        gameSeed: 'test seed',
        gameMode: 'classic',
      };
      proxyStore.store.dispatch({
        type: actions.GENERATE_MINEFIELD,
        payload
      });
    });

    it('should update the store with the initial value', function () {
      proxyStore.store.dispatch({
        type: actions.SHOW_NEW_GAME_SETUP,
        payload: undefined,
      });

      assert.deepEqual(
        proxyStore.store.getState(),
        {
          setup: null,
          minefield: [],
          tiles: {},
        }
      );
    });
  });

  describe('START_GAME action', function () {
    it('should update the store with the game\'s data', function () {
      const payload = {
        setup: {
          flagsEnabled: true,
          numLives: 1,
          gameSeed: 'test seed',
          gameMode: 'classic',
          gameStartUTC: fakeTimers.now,
          gameEndUTC: null,
        },
        minefield: [ '0', '1', '2', '3', '4', '5', '6', '7', '8' ],
        tiles: {
          '0': {
            id: '0',
            row: 0,
            col: 0,
            revealed: true,
            hasMine: false,
            hasFlag: false,
            numAdjacentMines: 0
          },
          '1': {
            id: '1',
            row: 0,
            col: 1,
            revealed: true,
            hasMine: false,
            hasFlag: false,
            numAdjacentMines: 0
          },
          '2': {
            id: '2',
            row: 0,
            col: 2,
            revealed: true,
            hasMine: false,
            hasFlag: false,
            numAdjacentMines: 0
          },
          '3': {
            id: '3',
            row: 1,
            col: 0,
            revealed: true,
            hasMine: false,
            hasFlag: false,
            numAdjacentMines: 0
          },
          '4': {
            id: '4',
            row: 1,
            col: 1,
            revealed: true,
            hasMine: false,
            hasFlag: false,
            numAdjacentMines: 1
          },
          '5': {
            id: '5',
            row: 1,
            col: 2,
            revealed: true,
            hasMine: false,
            hasFlag: false,
            numAdjacentMines: 1
          },
          '6': {
            id: '6',
            row: 2,
            col: 0,
            revealed: true,
            hasMine: false,
            hasFlag: false,
            numAdjacentMines: 0
          },
          '7': {
            id: '7',
            row: 2,
            col: 1,
            revealed: true,
            hasMine: false,
            hasFlag: false,
            numAdjacentMines: 1
          },
          '8': {
            id: '8',
            row: 2,
            col: 2,
            revealed: false,
            hasMine: true,
            hasFlag: false,
            numAdjacentMines: 0
          }
        },
      };
      proxyStore.store.dispatch({
        type: actions.START_GAME,
        payload
      });

      assert.deepEqual(proxyStore.store.getState(), payload);
    });
  });

  describe('END_GAME action', function () {
    beforeEach(function () {
      const payload = {
        numMines: 1,
        dimensions: { rows: 3, cols: 3 },
        flagsEnabled: true,
        numLives: 1,
        gameSeed: 'test seed',
        gameMode: 'classic',
      };
      proxyStore.store.dispatch({
        type: actions.GENERATE_MINEFIELD,
        payload
      });
    });
  
    it('should update the store with the end game timestamp', function () {
      proxyStore.store.dispatch({
        type: actions.END_GAME,
        payload: fakeTimers.now + 123456789,
      });
  
      assert.deepEqual(
        proxyStore.store.getState(),
        {
          setup: {
            flagsEnabled: true,
            numLives: 1,
            gameSeed: 'test seed',
            gameMode: 'classic',
            gameStartUTC: fakeTimers.now,
            gameEndUTC: fakeTimers.now + 123456789,
          },
          minefield: [ '0', '1', '2', '3', '4', '5', '6', '7', '8' ],
          tiles: {
            '0': {
              id: '0',
              row: 0,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '1': {
              id: '1',
              row: 0,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '2': {
              id: '2',
              row: 0,
              col: 2,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '3': {
              id: '3',
              row: 1,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '4': {
              id: '4',
              row: 1,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '5': {
              id: '5',
              row: 1,
              col: 2,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '6': {
              id: '6',
              row: 2,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '7': {
              id: '7',
              row: 2,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '8': {
              id: '8',
              row: 2,
              col: 2,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 0
            }
          },
        }
      );
    });
  });

  describe('CHECK_GAME_END action', function () {
    describe('if the game has reached an end game state', function () {
      beforeEach(function () {
        const payload = {
          numMines: 1,
          dimensions: { rows: 3, cols: 3 },
          flagsEnabled: true,
          numLives: 1,
          gameSeed: 'test seed',
          gameMode: 'classic',
        };
        proxyStore.store.dispatch({
          type: actions.GENERATE_MINEFIELD,
          payload
        });
      });

      it('should update the store with the game ended timestamp', function () {
        proxyStore.store.dispatch({
          type: actions.CHECK_GAME_END,
          payload: undefined,
        });

        assert.deepEqual(
          proxyStore.store.getState(),
          {
            setup: {
              flagsEnabled: true,
              numLives: 1,
              gameSeed: 'test seed',
              gameMode: 'classic',
              gameStartUTC: fakeTimers.now,
              gameEndUTC: fakeTimers.now,
            },
            minefield: [ '0', '1', '2', '3', '4', '5', '6', '7', '8' ],
            tiles: {
              '0': {
                id: '0',
                row: 0,
                col: 0,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 0
              },
              '1': {
                id: '1',
                row: 0,
                col: 1,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 0
              },
              '2': {
                id: '2',
                row: 0,
                col: 2,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 0
              },
              '3': {
                id: '3',
                row: 1,
                col: 0,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 0
              },
              '4': {
                id: '4',
                row: 1,
                col: 1,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 1
              },
              '5': {
                id: '5',
                row: 1,
                col: 2,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 1
              },
              '6': {
                id: '6',
                row: 2,
                col: 0,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 0
              },
              '7': {
                id: '7',
                row: 2,
                col: 1,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 1
              },
              '8': {
                id: '8',
                row: 2,
                col: 2,
                revealed: false,
                hasMine: true,
                hasFlag: false,
                numAdjacentMines: 0
              }
            },
          }
        );
      });
    });

    describe('if the game has not reached an end game state', function () {
      beforeEach(function () {
        const payload = {
          numMines: 4,
          dimensions: { rows: 4, cols: 4 },
          flagsEnabled: true,
          numLives: 1,
          gameSeed: 'test seed',
          gameMode: 'classic',
        };
        proxyStore.store.dispatch({
          type: actions.GENERATE_MINEFIELD,
          payload
        });
      });

      it('should make no changes to the store', function () {
        proxyStore.store.dispatch({
          type: actions.CHECK_GAME_END,
          payload: undefined,
        });

        assert.deepEqual(
          proxyStore.store.getState(),
          {
            setup: {
              numLives: 1,
              flagsEnabled: true,
              gameSeed: 'test seed',
              gameMode: 'classic',
              gameStartUTC: fakeTimers.now,
              gameEndUTC: null
            },
            minefield: [
              '0',  '1',  '2',  '3',
              '4',  '5',  '6',  '7',
              '8',  '9',  '10', '11',
              '12', '13', '14', '15'
            ],
            tiles: {
              '0': {
                id: '0',
                row: 0,
                col: 0,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 0
              },
              '1': {
                id: '1',
                row: 0,
                col: 1,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 0
              },
              '2': {
                id: '2',
                row: 0,
                col: 2,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 1
              },
              '3': {
                id: '3',
                row: 0,
                col: 3,
                revealed: false,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 1
              },
              '4': {
                id: '4',
                row: 1,
                col: 0,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 0
              },
              '5': {
                id: '5',
                row: 1,
                col: 1,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 1
              },
              '6': {
                id: '6',
                row: 1,
                col: 2,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 3
              },
              '7': {
                id: '7',
                row: 1,
                col: 3,
                revealed: false,
                hasMine: true,
                hasFlag: false,
                numAdjacentMines: 2
              },
              '8': {
                id: '8',
                row: 2,
                col: 0,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 0
              },
              '9': {
                id: '9',
                row: 2,
                col: 1,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 2
              },
              '10': {
                id: '10',
                row: 2,
                col: 2,
                revealed: false,
                hasMine: true,
                hasFlag: false,
                numAdjacentMines: 3
              },
              '11': {
                id: '11',
                row: 2,
                col: 3,
                revealed: false,
                hasMine: true,
                hasFlag: false,
                numAdjacentMines: 3
              },
              '12': {
                id: '12',
                row: 3,
                col: 0,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 0
              },
              '13': {
                id: '13',
                row: 3,
                col: 1,
                revealed: true,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 2
              },
              '14': {
                id: '14',
                row: 3,
                col: 2,
                revealed: false,
                hasMine: true,
                hasFlag: false,
                numAdjacentMines: 2
              },
              '15': {
                id: '15',
                row: 3,
                col: 3,
                revealed: false,
                hasMine: false,
                hasFlag: false,
                numAdjacentMines: 3
              }
            }
          }
        );
      });
    });
  });

  describe('TILE_LEFT_CLICK action', function () {
    beforeEach(function () {
      const payload = {
        numMines: 4,
        dimensions: { rows: 4, cols: 4 },
        flagsEnabled: true,
        numLives: 1,
        gameSeed: 'test seed',
        gameMode: 'classic',
      };
      proxyStore.store.dispatch({
        type: actions.GENERATE_MINEFIELD,
        payload
      });
    });
  
    it('should update the store to reveal the relevant tiles', function () {
      proxyStore.store.dispatch({
        type: actions.TILE_LEFT_CLICK,
        payload: '3',
      });

      assert.deepEqual(
        proxyStore.store.getState(),
        {
          setup: {
            numLives: 1,
            flagsEnabled: true,
            gameSeed: 'test seed',
            gameMode: 'classic',
            gameStartUTC: fakeTimers.now,
            gameEndUTC: null
          },
          minefield: [
            '0',  '1',  '2',  '3',
            '4',  '5',  '6',  '7',
            '8',  '9',  '10', '11',
            '12', '13', '14', '15'
          ],
          tiles: {
            '0': {
              id: '0',
              row: 0,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '1': {
              id: '1',
              row: 0,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '2': {
              id: '2',
              row: 0,
              col: 2,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '3': {
              id: '3',
              row: 0,
              col: 3,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '4': {
              id: '4',
              row: 1,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '5': {
              id: '5',
              row: 1,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '6': {
              id: '6',
              row: 1,
              col: 2,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 3
            },
            '7': {
              id: '7',
              row: 1,
              col: 3,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '8': {
              id: '8',
              row: 2,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '9': {
              id: '9',
              row: 2,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '10': {
              id: '10',
              row: 2,
              col: 2,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 3
            },
            '11': {
              id: '11',
              row: 2,
              col: 3,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 3
            },
            '12': {
              id: '12',
              row: 3,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '13': {
              id: '13',
              row: 3,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '14': {
              id: '14',
              row: 3,
              col: 2,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '15': {
              id: '15',
              row: 3,
              col: 3,
              revealed: false,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 3
            }
          }
        }
      );
    });
  });

  describe('TILE_RIGHT_CLICK action', function () {
    beforeEach(function () {
      const payload = {
        numMines: 4,
        dimensions: { rows: 4, cols: 4 },
        flagsEnabled: true,
        numLives: 1,
        gameSeed: 'test seed',
        gameMode: 'classic',
      };
      proxyStore.store.dispatch({
        type: actions.GENERATE_MINEFIELD,
        payload
      });
    });
  
    it('should update the store to mark the relevant tile as having a flag', function () {
      proxyStore.store.dispatch({
        type: actions.TILE_RIGHT_CLICK,
        payload: '11',
      });

      assert.deepEqual(
        proxyStore.store.getState(),
        {
          setup: {
            numLives: 1,
            flagsEnabled: true,
            gameSeed: 'test seed',
            gameMode: 'classic',
            gameStartUTC: fakeTimers.now,
            gameEndUTC: null
          },
          minefield: [
            '0',  '1',  '2',  '3',
            '4',  '5',  '6',  '7',
            '8',  '9',  '10', '11',
            '12', '13', '14', '15'
          ],
          tiles: {
            '0': {
              id: '0',
              row: 0,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '1': {
              id: '1',
              row: 0,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '2': {
              id: '2',
              row: 0,
              col: 2,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '3': {
              id: '3',
              row: 0,
              col: 3,
              revealed: false,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '4': {
              id: '4',
              row: 1,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '5': {
              id: '5',
              row: 1,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '6': {
              id: '6',
              row: 1,
              col: 2,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 3
            },
            '7': {
              id: '7',
              row: 1,
              col: 3,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '8': {
              id: '8',
              row: 2,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '9': {
              id: '9',
              row: 2,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '10': {
              id: '10',
              row: 2,
              col: 2,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 3
            },
            '11': {
              id: '11',
              row: 2,
              col: 3,
              revealed: false,
              hasMine: true,
              hasFlag: true,
              numAdjacentMines: 3
            },
            '12': {
              id: '12',
              row: 3,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '13': {
              id: '13',
              row: 3,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '14': {
              id: '14',
              row: 3,
              col: 2,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '15': {
              id: '15',
              row: 3,
              col: 3,
              revealed: false,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 3
            }
          }
        }
      );
    });
  });

  describe('TILE_BOTH_CLICK action', function () {
    beforeEach(function () {
      const payload = {
        numMines: 4,
        dimensions: { rows: 4, cols: 4 },
        flagsEnabled: true,
        numLives: 1,
        gameSeed: 'test seed',
        gameMode: 'classic',
      };
      proxyStore.store.dispatch({
        type: actions.GENERATE_MINEFIELD,
        payload
      });
    });
  
    it('should update the store to reveal the relevant tiles', function () {
      proxyStore.store.dispatch({
        type: actions.TILE_RIGHT_CLICK,
        payload: '7',
      });
      proxyStore.store.dispatch({
        type: actions.TILE_BOTH_CLICK,
        payload: '2',
      });

      assert.deepEqual(
        proxyStore.store.getState(),
        {
          setup: {
            numLives: 1,
            flagsEnabled: true,
            gameSeed: 'test seed',
            gameMode: 'classic',
            gameStartUTC: fakeTimers.now,
            gameEndUTC: null
          },
          minefield: [
            '0',  '1',  '2',  '3',
            '4',  '5',  '6',  '7',
            '8',  '9',  '10', '11',
            '12', '13', '14', '15'
          ],
          tiles: {
            '0': {
              id: '0',
              row: 0,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '1': {
              id: '1',
              row: 0,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '2': {
              id: '2',
              row: 0,
              col: 2,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '3': {
              id: '3',
              row: 0,
              col: 3,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '4': {
              id: '4',
              row: 1,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '5': {
              id: '5',
              row: 1,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '6': {
              id: '6',
              row: 1,
              col: 2,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 3
            },
            '7': {
              id: '7',
              row: 1,
              col: 3,
              revealed: false,
              hasMine: true,
              hasFlag: true,
              numAdjacentMines: 2
            },
            '8': {
              id: '8',
              row: 2,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '9': {
              id: '9',
              row: 2,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '10': {
              id: '10',
              row: 2,
              col: 2,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 3
            },
            '11': {
              id: '11',
              row: 2,
              col: 3,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 3
            },
            '12': {
              id: '12',
              row: 3,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '13': {
              id: '13',
              row: 3,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '14': {
              id: '14',
              row: 3,
              col: 2,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '15': {
              id: '15',
              row: 3,
              col: 3,
              revealed: false,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 3
            }
          }
        }
      );
    });
  });

  describe('REVEAL_TILES action', function () {
    beforeEach(function () {
      const payload = {
        numMines: 4,
        dimensions: { rows: 4, cols: 4 },
        flagsEnabled: true,
        numLives: 1,
        gameSeed: 'test seed',
        gameMode: 'classic',
      };
      proxyStore.store.dispatch({
        type: actions.GENERATE_MINEFIELD,
        payload
      });
    });
  
    it('should update the store to reveal the relevant tiles', function () {
      proxyStore.store.dispatch({
        type: actions.REVEAL_TILES,
        payload: ['3'],
      });

      assert.deepEqual(
        proxyStore.store.getState(),
        {
          setup: {
            numLives: 1,
            flagsEnabled: true,
            gameSeed: 'test seed',
            gameMode: 'classic',
            gameStartUTC: fakeTimers.now,
            gameEndUTC: null
          },
          minefield: [
            '0',  '1',  '2',  '3',
            '4',  '5',  '6',  '7',
            '8',  '9',  '10', '11',
            '12', '13', '14', '15'
          ],
          tiles: {
            '0': {
              id: '0',
              row: 0,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '1': {
              id: '1',
              row: 0,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '2': {
              id: '2',
              row: 0,
              col: 2,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '3': {
              id: '3',
              row: 0,
              col: 3,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '4': {
              id: '4',
              row: 1,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '5': {
              id: '5',
              row: 1,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '6': {
              id: '6',
              row: 1,
              col: 2,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 3
            },
            '7': {
              id: '7',
              row: 1,
              col: 3,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '8': {
              id: '8',
              row: 2,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '9': {
              id: '9',
              row: 2,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '10': {
              id: '10',
              row: 2,
              col: 2,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 3
            },
            '11': {
              id: '11',
              row: 2,
              col: 3,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 3
            },
            '12': {
              id: '12',
              row: 3,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '13': {
              id: '13',
              row: 3,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '14': {
              id: '14',
              row: 3,
              col: 2,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '15': {
              id: '15',
              row: 3,
              col: 3,
              revealed: false,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 3
            }
          }
        }
      );
    });
  });

  describe('TOGGLE_FLAG action', function () {
    beforeEach(function () {
      const payload = {
        numMines: 4,
        dimensions: { rows: 4, cols: 4 },
        flagsEnabled: true,
        numLives: 1,
        gameSeed: 'test seed',
        gameMode: 'classic',
      };
      proxyStore.store.dispatch({
        type: actions.GENERATE_MINEFIELD,
        payload
      });
    });
  
    it('should update the store to mark the relevant tile as having a flag', function () {
      proxyStore.store.dispatch({
        type: actions.TOGGLE_FLAG,
        payload: '11',
      });

      assert.deepEqual(
        proxyStore.store.getState(),
        {
          setup: {
            numLives: 1,
            flagsEnabled: true,
            gameSeed: 'test seed',
            gameMode: 'classic',
            gameStartUTC: fakeTimers.now,
            gameEndUTC: null
          },
          minefield: [
            '0',  '1',  '2',  '3',
            '4',  '5',  '6',  '7',
            '8',  '9',  '10', '11',
            '12', '13', '14', '15'
          ],
          tiles: {
            '0': {
              id: '0',
              row: 0,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '1': {
              id: '1',
              row: 0,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '2': {
              id: '2',
              row: 0,
              col: 2,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '3': {
              id: '3',
              row: 0,
              col: 3,
              revealed: false,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '4': {
              id: '4',
              row: 1,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '5': {
              id: '5',
              row: 1,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 1
            },
            '6': {
              id: '6',
              row: 1,
              col: 2,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 3
            },
            '7': {
              id: '7',
              row: 1,
              col: 3,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '8': {
              id: '8',
              row: 2,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '9': {
              id: '9',
              row: 2,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '10': {
              id: '10',
              row: 2,
              col: 2,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 3
            },
            '11': {
              id: '11',
              row: 2,
              col: 3,
              revealed: false,
              hasMine: true,
              hasFlag: true,
              numAdjacentMines: 3
            },
            '12': {
              id: '12',
              row: 3,
              col: 0,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0
            },
            '13': {
              id: '13',
              row: 3,
              col: 1,
              revealed: true,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '14': {
              id: '14',
              row: 3,
              col: 2,
              revealed: false,
              hasMine: true,
              hasFlag: false,
              numAdjacentMines: 2
            },
            '15': {
              id: '15',
              row: 3,
              col: 3,
              revealed: false,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 3
            }
          }
        }
      );
    });
  });
});