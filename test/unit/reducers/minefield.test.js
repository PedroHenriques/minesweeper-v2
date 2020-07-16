'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const actionTypes = require('../../../src/js/actions/actionTypes.js');

describe('minefield Reducer', function () {
  const sandbox = sinon.createSandbox();
  let proxyReducer;

  beforeEach(function () {
    proxyReducer = proxyquire('../../../src/js/reducers/minefield.js', {});
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('if the action is of the START_GAME type', function () {
    it('should return the "minefield" property of the action\'s payload', function () {
      const minefieldState = [ '0', '1', '2' ];
      const testAction = {
        type: actionTypes.START_GAME,
        payload: {
          setup: 'setup payload',
          minefield: 'minefield payload',
          tiles: 'tiles payload',
        },
      };

      assert.strictEqual(proxyReducer.minefield(minefieldState, testAction), testAction.payload.minefield);
    });
  });
  
  describe('if the action is of the SHOW_NEW_GAME_SETUP type', function () {
    it('should return an empty array', function () {
      const minefieldState = [ '0', '1', '2' ];
      const testAction = {
        type: actionTypes.SHOW_NEW_GAME_SETUP,
        payload: undefined,
      };

      assert.deepEqual(proxyReducer.minefield(minefieldState, testAction), []);
    });
  });

  describe('if the action is not of the START_GAME nor SHOW_NEW_GAME_SETUP types', function () {
    it('should return the state that was provided as argument', function () {
      const minefieldState = [ '0', '1', '2' ];
      const testAction = {
        type: 'test action type',
        payload: {
          setup: 'setup payload',
          minefield: 'minefield payload',
          tiles: 'tiles payload',
        },
      };

      assert.strictEqual(proxyReducer.minefield(minefieldState, testAction), minefieldState);
    });

    describe('if the state provided as argument is UNDEFINED', function () {
      it('should return an empty array', function () {
        const minefieldState = undefined;
        const testAction = {
          type: 'test action type',
          payload: {
            setup: 'setup payload',
            minefield: 'minefield payload',
            tiles: 'tiles payload',
          },
        };
  
        assert.deepEqual(proxyReducer.minefield(minefieldState, testAction), []);
      });
    });
  });
});