'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

describe('creators', function () {
  const sandbox = sinon.createSandbox();
  let fakeTimers;
  let proxyCreators;

  beforeEach(function () {
    fakeTimers = sandbox.useFakeTimers(new Date());
    proxyCreators = proxyquire('../../../src/js/actions/creators.js', {
      './actionTypes': {
        GENERATE_MINEFIELD: 'generated minefield action type',
        START_GAME: 'start game action type',
        END_GAME: 'end game action type',
        CHECK_GAME_END: 'check game end action type',
        TILE_LEFT_CLICK: 'tile left click action type',
        TILE_RIGHT_CLICK: 'tile right click action type',
        TILE_BOTH_CLICK: 'tile both click action type',
        REVEAL_TILES: 'reveal tiles action type',
        TOGGLE_FLAG: 'toggle flag action type',
        SHOW_NEW_GAME_SETUP: 'show new game setup action type',
      },
    });
  });

  afterEach(function () {
    fakeTimers.restore();
    sandbox.restore();
  });

  describe('generateMinefield()', function () {
    it('should return an object with the "type" property of "GENERATE_MINEFIELD"', function () {
      assert.strictEqual(
        proxyCreators.generateMinefield({ numMines: 10, flagsEnables: true }).type,
        'generated minefield action type'
      );
    });
    
    it('should return an object with the "payload" property equal to the received argument', function () {
      assert.deepEqual(
        proxyCreators.generateMinefield({ numMines: 10, flagsEnables: true }).payload,
        { numMines: 10, flagsEnables: true },
      );
    });

    describe('if the received argument in null', function () {
      it('should return an object with the "type" property of "GENERATE_MINEFIELD"', function () {
        assert.strictEqual(
          proxyCreators.generateMinefield(null).type,
          'generated minefield action type'
        );
      });
      
      it('should return an object with the "payload" property equal to null', function () {
        assert.strictEqual(
          proxyCreators.generateMinefield(null).payload,
          null
        );
      });
    });
  });

  describe('showNewGameSetup()', function () {
    it('should return an object with the "type" property of "SHOW_NEW_GAME_SETUP"', function () {
      assert.strictEqual(
        proxyCreators.showNewGameSetup().type,
        'show new game setup action type'
      );
    });
    
    it('should return an object with the "payload" property equal to undefined', function () {
      assert.isUndefined(proxyCreators.showNewGameSetup().payload);
    });
  });

  describe('startGame()', function () {
    it('should return an object with the "type" property of "START_GAME"', function () {
      assert.strictEqual(
        proxyCreators.startGame({ numMines: 10, flagsEnables: true }, ['0', '2'], { '0': { id: '0' }, '1': { id: '1' } }).type,
        'start game action type'
      );
    });
    
    it('should return an object with the "payload" property equal to the received arguments as an object', function () {
      assert.deepEqual(
        proxyCreators.startGame({ numMines: 10, flagsEnables: true }, ['0', '2'], { '0': { id: '0' }, '1': { id: '1' } }).payload,
        {
          setup: { numMines: 10, flagsEnables: true },
          minefield: ['0', '2'],
          tiles: { '0': { id: '0' }, '1': { id: '1' } },
        }
      );
    });
  });

  describe('endGame()', function () {
    it('should return an object with "type" property of "END_GAME"', function () {
      assert.strictEqual(proxyCreators.endGame().type, 'end game action type');
    });
    
    it('should return an object with the "payload" property equal to the current timestamp', function () {
      assert.strictEqual(proxyCreators.endGame().payload, fakeTimers.now);
    });
  });

  describe('tileLeftClick()', function () {
    it('should return an object with "type" property of "TILE_LEFT_CLICK"', function () {
      assert.strictEqual(
        proxyCreators.tileLeftClick('3').type,
        'tile left click action type'
      );
    });
    
    it('should return an object with the "payload" property equal to the received argument', function () {
      assert.strictEqual(
        proxyCreators.tileLeftClick('3').payload,
        '3'
      );
    });
  });

  describe('tileRightClick()', function () {
    it('should return an object with "type" property of "TILE_RIGHT_CLICK"', function () {
      assert.strictEqual(
        proxyCreators.tileRightClick('3').type,
        'tile right click action type'
      );
    });
    
    it('should return an object with the "payload" property equal to the received argument', function () {
      assert.strictEqual(
        proxyCreators.tileRightClick('3').payload,
        '3'
      );
    });
  });

  describe('tileBothClick()', function () {
    it('should return an object with the "type" property of "TILE_BOTH_CLICK"', function () {
      assert.strictEqual(
        proxyCreators.tileBothClick('3').type,
        'tile both click action type'
      );
    });
    
    it('should return an object with the "payload" property equal to the received argument', function () {
      assert.strictEqual(
        proxyCreators.tileBothClick('3').payload,
        '3'
      );
    });
  });

  describe('revealTiles()', function () {
    it('should return an object with the "type" property "REVEAL_TILES"', function () {
      assert.strictEqual(
        proxyCreators.revealTiles(['3', '10']).type,
        'reveal tiles action type'
      );
    });
    
    it('should return an object with the "payload" property equal to the received argument', function () {
      assert.deepEqual(
        proxyCreators.revealTiles(['3', '10']).payload,
        ['3', '10']
      );
    });
  });

  describe('toggleFlag()', function () {
    it('should return an object with the "type" property "TOGGLE_FLAG"', function () {
      assert.strictEqual(
        proxyCreators.toggleFlag('10').type,
        'toggle flag action type'
      );
    });
    
    it('should return an object with the "payload" property equal to the received argument', function () {
      assert.strictEqual(
        proxyCreators.toggleFlag('10').payload,
        '10'
      );
    });
  });

  describe('checkGameEnd()', function () {
    it('should return an object with the "type" property of "CHECK_GAME_END"', function () {
      assert.strictEqual(
        proxyCreators.checkGameEnd().type,
        'check game end action type'
      );
    });
    
    it('should return an object with the "payload" property equal to undefined', function () {
      assert.isUndefined(proxyCreators.checkGameEnd().payload);
    });
  });
});