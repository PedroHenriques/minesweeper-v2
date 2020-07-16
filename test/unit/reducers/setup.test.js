'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const actionTypes = require('../../../src/js/actions/actionTypes.js');

describe('setup Reducer', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyReducer;

  beforeEach(function () {
    doubles = {};
    proxyReducer = proxyquire('../../../src/js/reducers/setup.js', {});
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should return the state that was provided as argument', function () {
    const setupState = {};
    const testAction = {
      type: 'test action type',
      payload: {
        setup: 'setup payload',
        minefield: 'minefield payload',
        tiles: 'tiles payload',
      },
    };

    assert.strictEqual(proxyReducer.setup(setupState, testAction), setupState);
  });

  describe('if the state provided as argument is UNDEFINED', function () {
    it('should return NULL', function () {
      const setupState = undefined;
      const testAction = {
        type: 'test action type',
        payload: {
          setup: 'setup payload',
          minefield: 'minefield payload',
          tiles: 'tiles payload',
        },
      };
  
      assert.strictEqual(proxyReducer.setup(setupState, testAction), null);
    });
  });

  describe('if the action is of the START_GAME type', function () {
    it('should return the "setup" property of the action\'s payload', function () {
      const setupState = {};
      const testAction = {
        type: actionTypes.START_GAME,
        payload: {
          setup: {},
          minefield: {},
          tiles: {},
        },
      };

      const actualValue = proxyReducer.setup(setupState, testAction);
      assert.deepEqual(actualValue, testAction.payload.setup);
    });
    
    it('should not return the "setup" property of the action\'s payload directly', function () {
      const setupState = {};
      const testAction = {
        type: actionTypes.START_GAME,
        payload: {
          setup: {},
          minefield: {},
          tiles: {},
        },
      };

      const actualValue = proxyReducer.setup(setupState, testAction);
      assert.notStrictEqual(actualValue, testAction.payload.setup);
    });
  });

  describe('if the action is of the END_GAME type', function () {
    describe('if the provided state is null', function () {
      it('should return null', function () {
        const setupState = null;
        const testAction = {
          type: actionTypes.END_GAME,
          payload: 123,
        };
  
        const actualValue = proxyReducer.setup(setupState, testAction);
        assert.strictEqual(actualValue, null);
      });
    });

    describe('if the provided state is not null', function () {
      it('should return the provided state with the gameEndUTC property set to the action payload value', function () {
        const setupState = {
          numLives: 2,
          flagsEnabled: false,
          gameSeed: 'game seed',
          gameMode: 'game mode',
          gameStartUTC: 1234567890,
          gameEndUTC: null,
        };
        const testAction = {
          type: actionTypes.END_GAME,
          payload: 123,
        };
  
        const actualValue = proxyReducer.setup(setupState, testAction);
        assert.deepEqual(
          actualValue,
          {
            numLives: 2,
            flagsEnabled: false,
            gameSeed: 'game seed',
            gameMode: 'game mode',
            gameStartUTC: 1234567890,
            gameEndUTC: testAction.payload,
          }
        );
      });
      
      it('should not return the provided state object directly', function () {
        const setupState = {};
        const testAction = {
          type: actionTypes.END_GAME,
          payload: 123,
        };
  
        const actualValue = proxyReducer.setup(setupState, testAction);
        assert.notStrictEqual(actualValue, setupState);
      });
    });
  });

  describe('if the action is of the SHOW_NEW_GAME_SETUP type', function () {
    it('should return NULL', function () {
      const setupState = {};
      const testAction = {
        type: actionTypes.SHOW_NEW_GAME_SETUP,
        payload: {
          setup: {},
          minefield: {},
          tiles: {},
        },
      };

      assert.strictEqual(proxyReducer.setup(setupState, testAction), null);
    });
  });
});