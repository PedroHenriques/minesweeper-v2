'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const actionTypes = require('../../../src/js/actions/actionTypes.js');

describe('tiles Reducer', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyReducer;

  beforeEach(function () {
    doubles = {};
    proxyReducer = proxyquire('../../../src/js/reducers/tiles.js', {});
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should return the state provided as argument', function () {
    const tilesState = {
      '6': { id: '6', revealed: true, hasFlag: false },
      '7': { id: '7', revealed: false, hasFlag: false },
      '8': { id: '8', revealed: false, hasFlag: true },
      '9': { id: '9', revealed: false, hasFlag: false },
    };
    const testAction = {
      type: 'test action type',
      payload: '6',
    };

    assert.strictEqual(proxyReducer.tiles(tilesState, testAction), tilesState);
  });

  describe('if the state provided as argument is UNDEFINED', function () {
    it('should return an empty object', function () {
      const tilesState = undefined;
      const testAction = {
        type: 'test action type',
        payload: '6',
      };
  
      assert.deepEqual(proxyReducer.tiles(tilesState, testAction), {});
    });
  });

  describe('if the action is of the START_GAME type', function () {
    it('should return the contents of the tiles property of the action\'s payload', function () {
      const tilesState = {
        '6': { id: '6', revealed: true, hasFlag: false },
        '7': { id: '7', revealed: false, hasFlag: false },
        '8': { id: '8', revealed: false, hasFlag: true },
        '9': { id: '9', revealed: false, hasFlag: false },
      };
      const testAction = {
        type: actionTypes.START_GAME,
        payload: {
          setup: {},
          minefield: [ '0', '1', '2', '3' ],
          tiles: {
            '0': { id: '0', revealed: true, hasFlag: false },
            '1': { id: '1', revealed: false, hasFlag: false },
            '2': { id: '2', revealed: false, hasFlag: true },
            '3': { id: '3', revealed: false, hasFlag: false },
          },
        },
      };

      const actualValue = proxyReducer.tiles(tilesState, testAction);
      assert.deepEqual(actualValue, testAction.payload.tiles);
    });
    
    it('should not return the tiles property of the action\'s payload directly', function () {
      const tilesState = {
        '6': { id: '6', revealed: true, hasFlag: false },
        '7': { id: '7', revealed: false, hasFlag: false },
        '8': { id: '8', revealed: false, hasFlag: true },
        '9': { id: '9', revealed: false, hasFlag: false },
      };
      const testAction = {
        type: actionTypes.START_GAME,
        payload: {
          setup: {},
          minefield: [ '0', '1', '2', '3' ],
          tiles: {
            '0': { id: '0', revealed: true, hasFlag: false },
            '1': { id: '1', revealed: false, hasFlag: false },
            '2': { id: '2', revealed: false, hasFlag: true },
            '3': { id: '3', revealed: false, hasFlag: false },
          },
        },
      };

      const actualValue = proxyReducer.tiles(tilesState, testAction);
      assert.notStrictEqual(actualValue, testAction.payload.tiles);
    });
  });

  describe('if the action is of the REVEAL_TILES type', function () {
    it('should return the state provided as argument with the affected tiles overwritten to their new state', function () {
      const tilesState = {
        '6': { id: '6', revealed: true, hasFlag: false },
        '7': { id: '7', revealed: false, hasFlag: false },
        '8': { id: '8', revealed: false, hasFlag: true },
        '9': { id: '9', revealed: false, hasFlag: false },
      };
      const testAction = {
        type: actionTypes.REVEAL_TILES,
        payload: [ '7', '9' ],
      };

      const actualValue = proxyReducer.tiles(tilesState, testAction);
      assert.deepEqual(
        actualValue,
        {
          '6': { id: '6', revealed: true, hasFlag: false },
          '7': { id: '7', revealed: true, hasFlag: false },
          '8': { id: '8', revealed: false, hasFlag: true },
          '9': { id: '9', revealed: true, hasFlag: false },
        }
      );
    });
    
    it('should not return the state provided as argument directly', function () {
      const tilesState = {
        '6': { id: '6', revealed: true, hasFlag: false },
        '7': { id: '7', revealed: false, hasFlag: false },
        '8': { id: '8', revealed: false, hasFlag: true },
        '9': { id: '9', revealed: false, hasFlag: false },
      };
      const testAction = {
        type: actionTypes.REVEAL_TILES,
        payload: [ '7', '9' ],
      };

      const actualValue = proxyReducer.tiles(tilesState, testAction);
      assert.notStrictEqual(actualValue, testAction.payload.tiles);
    });
  });

  describe('if the action is of the TOGGLE_FLAG type', function () {
    it('should return a new object with the state provided as argument with the affected tile overwritten to its new state', function () {
      const tilesState = {
        '6': { id: '6', revealed: true, hasFlag: false },
        '7': { id: '7', revealed: false, hasFlag: false },
        '8': { id: '8', revealed: false, hasFlag: true },
        '9': { id: '9', revealed: false, hasFlag: false },
      };
      const testAction = {
        type: actionTypes.TOGGLE_FLAG,
        payload: '6',
      };

      const actualValue = proxyReducer.tiles(tilesState, testAction);
      assert.deepEqual(
        actualValue,
        {
          '6': { id: '6', revealed: true, hasFlag: true },
          '7': { id: '7', revealed: false, hasFlag: false },
          '8': { id: '8', revealed: false, hasFlag: true },
          '9': { id: '9', revealed: false, hasFlag: false },
        }
      );
    });
    
    it('should not return the state provided as argument directly', function () {
      const tilesState = {
        '6': { id: '6', revealed: true, hasFlag: false },
        '7': { id: '7', revealed: false, hasFlag: false },
        '8': { id: '8', revealed: false, hasFlag: true },
        '9': { id: '9', revealed: false, hasFlag: false },
      };
      const testAction = {
        type: actionTypes.TOGGLE_FLAG,
        payload: '6',
      };

      const actualValue = proxyReducer.tiles(tilesState, testAction);
      assert.notStrictEqual(actualValue, testAction.payload.tiles);
    });
  });

  describe('if the action is of the SHOW_NEW_GAME_SETUP type', function () {
    it('should return an empty object', function () {
      const tilesState = {
        '6': { id: '6', revealed: true, hasFlag: false },
        '7': { id: '7', revealed: false, hasFlag: false },
        '8': { id: '8', revealed: false, hasFlag: true },
        '9': { id: '9', revealed: false, hasFlag: false },
      };
      const testAction = {
        type: actionTypes.SHOW_NEW_GAME_SETUP,
        payload: {
          setup: {},
          minefield: [ '0', '1', '2', '3' ],
          tiles: {
            '0': { id: '0', revealed: true, hasFlag: false },
            '1': { id: '1', revealed: false, hasFlag: false },
            '2': { id: '2', revealed: false, hasFlag: true },
            '3': { id: '3', revealed: false, hasFlag: false },
          },
        },
      };

      assert.deepEqual(proxyReducer.tiles(tilesState, testAction), {});
    });
  });
});