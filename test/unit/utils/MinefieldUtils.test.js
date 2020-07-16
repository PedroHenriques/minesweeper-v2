'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const mineGenerators = require('../../../src/js/utils/MineGenerators.js');

describe('MinefieldUtils', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyUtils;
  let testData;

  beforeEach(function () {
    testData = {
      GAME_RUNNING: 'game running',
      GAME_WON: 'game won',
      GAME_LOST: 'game lost',
    };
    doubles = {};
    doubles.mineGeneratorsStub = sandbox.stub(mineGenerators);
    doubles.seedrandomStub = sandbox.stub();
    doubles.prng = sandbox.stub();
    proxyUtils = proxyquire('../../../src/js/utils/MinefieldUtils.js', {
      './MineGenerators': doubles.mineGeneratorsStub,
      '../data': testData,
      'seedrandom': doubles.seedrandomStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('getGameState()', function () {
    it('should return the value of the "GAME_RUNNING" const', function () {
      const minefield = [
        { hasMine: false, revealed: true },
        { hasMine: false, revealed: false },
        { hasMine: true, revealed: false },
        { hasMine: false, revealed: false },
      ];

      assert.strictEqual(proxyUtils.getGameState(minefield, 1), testData.GAME_RUNNING);
    });

    describe('if there are no revealed tiles with mines', function () {
      describe('if the number of non revealed tiles is equal to the number of mines', function () {
        it('should return the value of the "GAME_WON" const', function () {
          const minefield = [
            { hasMine: false, revealed: true },
            { hasMine: false, revealed: true },
            { hasMine: true, revealed: false },
            { hasMine: false, revealed: true },
          ];

          assert.strictEqual(proxyUtils.getGameState(minefield, 1), testData.GAME_WON);
        });
      });
    });

    describe('if there are revealed tiles with mines', function () {
      describe('if all non revealed tiles contain mines', function () {
        it('should return the value of the "GAME_WON" const', function () {
          const minefield = [
            { hasMine: false, revealed: true },
            { hasMine: false, revealed: true },
            { hasMine: true, revealed: true },
            { hasMine: false, revealed: true },
            { hasMine: true, revealed: false },
            { hasMine: true, revealed: false },
          ];
  
          assert.strictEqual(proxyUtils.getGameState(minefield, 2), testData.GAME_WON);
        });
      });

      describe('if their number is equal to the number of lives', function () {
        it('should return the value of the "GAME_LOST" const', function () {
          const minefield = [
            { hasMine: false, revealed: false },
            { hasMine: false, revealed: false },
            { hasMine: true, revealed: true },
            { hasMine: false, revealed: false },
          ];
  
          assert.strictEqual(proxyUtils.getGameState(minefield, 1), testData.GAME_LOST);
        });
      });
    });
  });

  describe('getMinefieldStats()', function () {
    it('should return an object with the expected properties', function () {
      assert.hasAllDeepKeys(
        proxyUtils.getMinefieldStats([]),
        [ 'numMines', 'numFlags', 'numLivesLost', 'numRevealedTiles' ]
      );
    });

    describe('"numMines" property', function () {
      it('should return a number representing the number of tiles with a mine (revealed or not)', function () {
        const minefield = [
          { id: '1', hasMine: true, revealed: false },
          { id: '1', hasMine: false, revealed: false },
          { id: '1', hasMine: true, revealed: true },
          { id: '1', hasMine: false, revealed: false },
          { id: '1', hasMine: true, revealed: false, hasFlag: true },
        ];

        assert.strictEqual(proxyUtils.getMinefieldStats(minefield).numMines, 3);
      });
    });

    describe('"numFlags" property', function () {
      it('should return a number representing the number of tiles with a flag', function () {
        const minefield = [
          { id: '1', hasMine: true, revealed: false },
          { id: '1', hasMine: false, revealed: false },
          { id: '1', hasMine: true, revealed: true },
          { id: '1', hasMine: false, revealed: false },
          { id: '1', hasMine: true, revealed: false, hasFlag: true },
        ];

        assert.strictEqual(proxyUtils.getMinefieldStats(minefield).numFlags, 1);
      });
    });

    describe('"numLivesLost" property', function () {
      it('should return a number representing the number of revealed tiles with a mine', function () {
        const minefield = [
          { id: '1', hasMine: true, revealed: false },
          { id: '1', hasMine: false, revealed: false },
          { id: '1', hasMine: true, revealed: true },
          { id: '1', hasMine: false, revealed: false },
          { id: '1', hasMine: true, revealed: false, hasFlag: true },
        ];

        assert.strictEqual(proxyUtils.getMinefieldStats(minefield).numLivesLost, 1);
      });
    });

    describe('"numRevealedTiles" property', function () {
      it('should return a number representing the number of revealed tiles', function () {
        const minefield = [
          { id: '1', hasMine: true, revealed: true },
          { id: '1', hasMine: false, revealed: true },
          { id: '1', hasMine: true, revealed: true },
          { id: '1', hasMine: false, revealed: false },
          { id: '1', hasMine: true, revealed: false, hasFlag: true },
        ];

        assert.strictEqual(proxyUtils.getMinefieldStats(minefield).numRevealedTiles, 3);
      });
    });

    describe('if a tile has a mine, is revealed and has a flag', function () {
      it('should be counted for all properties', function () {
        const minefield = [
          { id: '1', hasMine: true, revealed: true, hasFlag: true },
        ];

        assert.deepEqual(
          proxyUtils.getMinefieldStats(minefield),
          {
            numMines: 1,
            numFlags: 1,
            numLivesLost: 1,
            numRevealedTiles: 1,
          }
        );
      });
    });
  });

  describe('generateMinefield()', function () {
    it('should call "seedrandom" module once', function () {
      doubles.seedrandomStub.returns(doubles.prng);
      doubles.mineGeneratorsStub.pureRNG.returns([0, 10]);
      doubles.prng.returns(0.99);
      testData.initialPatchMinSize = 0;

      proxyUtils.generateMinefield({
        gameSeed: 'game seed',
        dimensions: { rows: 3, cols: 4 },
        numMines: 2
      });
      assert.strictEqual(doubles.seedrandomStub.callCount, 1);
    });
    
    it('should call "seedrandom" module with the correct arguments', function () {
      doubles.seedrandomStub.returns(doubles.prng);
      doubles.mineGeneratorsStub.pureRNG.returns([0, 10]);
      doubles.prng.returns(0.99);
      testData.initialPatchMinSize = 0;

      proxyUtils.generateMinefield({
        gameSeed: 'game seed',
        dimensions: { rows: 3, cols: 4 },
        numMines: 2
      });
      assert.deepStrictEqual(doubles.seedrandomStub.args[0], [ 'game seed' ]);
    });

    it('should call "pureRNG", from the "MineGenerators" module, once', function () {
      doubles.seedrandomStub.returns(doubles.prng);
      doubles.mineGeneratorsStub.pureRNG.returns([0, 10]);
      doubles.prng.returns(0.99);
      testData.initialPatchMinSize = 0;

      proxyUtils.generateMinefield({
        gameSeed: 'game seed',
        dimensions: { rows: 3, cols: 4 },
        numMines: 2
      });
      assert.strictEqual(doubles.mineGeneratorsStub.pureRNG.callCount, 1);
    });
    
    it('should call "pureRNG", from the "MineGenerators" module, with the correct arguments', function () {
      doubles.seedrandomStub.returns(doubles.prng);
      doubles.mineGeneratorsStub.pureRNG.returns([0, 10]);
      doubles.prng.returns(0.99);
      testData.initialPatchMinSize = 0;

      proxyUtils.generateMinefield({
        gameSeed: 'game seed',
        dimensions: { rows: 3, cols: 4 },
        numMines: 2
      });
      assert.deepStrictEqual(
        doubles.mineGeneratorsStub.pureRNG.args[0],
        [ { rows: 3, cols: 4 }, 2, doubles.prng ]
      );
    });
    
    it('should call the result of calling "seedrandom" once', function () {
      doubles.seedrandomStub.returns(doubles.prng);
      doubles.mineGeneratorsStub.pureRNG.returns([0, 10]);
      doubles.prng.returns(0.99);
      testData.initialPatchMinSize = 0;

      proxyUtils.generateMinefield({
        gameSeed: 'game seed',
        dimensions: { rows: 3, cols: 4 },
        numMines: 2
      });
      assert.strictEqual(doubles.prng.callCount, 1);
    });
    
    it('should call the result of calling "seedrandom" with no arguments', function () {
      doubles.seedrandomStub.returns(doubles.prng);
      doubles.mineGeneratorsStub.pureRNG.returns([0, 10]);
      doubles.prng.returns(0.99);
      testData.initialPatchMinSize = 0;

      proxyUtils.generateMinefield({
        gameSeed: 'game seed',
        dimensions: { rows: 3, cols: 4 },
        numMines: 2
      });
      assert.strictEqual(doubles.prng.args[0].length, 0);
    });
    
    it('should return an array of objects representing the generated minefiled', function () {
      doubles.seedrandomStub.returns(doubles.prng);
      doubles.mineGeneratorsStub.pureRNG.returns([0, 10]);
      doubles.prng.returns(0.99);
      testData.initialPatchMinSize = 0;

      const expectedMinefield = [
        { id: '0', row: 0, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
        { id: '1', row: 0, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
        { id: '2', row: 0, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        { id: '3', row: 0, col: 3, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        { id: '4', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
        { id: '5', row: 1, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
        { id: '6', row: 1, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
        { id: '7', row: 1, col: 3, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
        { id: '8', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        { id: '9', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
        { id: '10', row: 2, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
        { id: '11', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
      ];
      assert.deepEqual(
        proxyUtils.generateMinefield({
          gameSeed: 'game seed',
          dimensions: { rows: 3, cols: 4 },
          numMines: 2
        }),
        expectedMinefield
      );
    });

    describe('if the random number generated points to the first empty patch', function () {
      it('should return the minefield with the second empty patch revealed', function () {
        doubles.seedrandomStub.returns(doubles.prng);
        doubles.mineGeneratorsStub.pureRNG.returns([0, 10]);
        doubles.prng.returns(0);
        testData.initialPatchMinSize = 0;
  
        const expectedMinefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
          { id: '1', row: 0, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '4', row: 1, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '5', row: 1, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
          { id: '6', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '7', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '8', row: 2, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '9', row: 2, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '10', row: 2, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
          { id: '11', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
        ];
        assert.deepEqual(
          proxyUtils.generateMinefield({
            gameSeed: 'game seed',
            dimensions: { rows: 3, cols: 4 },
            numMines: 2
          }),
          expectedMinefield
        );
      });
    });

    describe('if an empty patch has less tiles than the minimum size', function () {
      it('should ignore it', function () {
        doubles.seedrandomStub.returns(doubles.prng);
        doubles.mineGeneratorsStub.pureRNG.returns([0, 10]);
        doubles.prng.returns(0);
        testData.initialPatchMinSize = 0.4;
  
        const expectedMinefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
          { id: '1', row: 0, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '2', row: 0, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '3', row: 0, col: 3, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '4', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '5', row: 1, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
          { id: '6', row: 1, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '7', row: 1, col: 3, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '8', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '9', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '10', row: 2, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
          { id: '11', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
        ];
        assert.deepEqual(
          proxyUtils.generateMinefield({
            gameSeed: 'game seed',
            dimensions: { rows: 3, cols: 4 },
            numMines: 2
          }),
          expectedMinefield
        );
      });
    });

    describe('if no valid empty patch was found', function () {
      it('should discard the minefield and generate a new one', function () {
        doubles.seedrandomStub.returns(doubles.prng);
        doubles.mineGeneratorsStub.pureRNG.onCall(0).returns([0, 10]);
        doubles.mineGeneratorsStub.pureRNG.onCall(1).returns([0, 1]);
        doubles.prng.returns(0);
        testData.initialPatchMinSize = 0.8;
  
        const expectedMinefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 1 },
          { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 1 },
          { id: '2', row: 0, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '3', row: 0, col: 3, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '4', row: 1, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
          { id: '5', row: 1, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
          { id: '6', row: 1, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '7', row: 1, col: 3, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '8', row: 2, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '9', row: 2, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '10', row: 2, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '11', row: 2, col: 3, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        ];
        assert.deepEqual(
          proxyUtils.generateMinefield({
            gameSeed: 'game seed',
            dimensions: { rows: 3, cols: 4 },
            numMines: 2
          }),
          expectedMinefield
        );
      });
    });

    describe('if a mine is on the top row', function () {
      it('should avoid checking out of bound indexes', function () {
        doubles.seedrandomStub.returns(doubles.prng);
        doubles.mineGeneratorsStub.pureRNG.returns([1]);
        doubles.prng.returns(0);
        testData.initialPatchMinSize = 0;
        
        const expectedMinefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
          { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '3', row: 1, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '4', row: 1, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '5', row: 1, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '6', row: 2, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '7', row: 2, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '8', row: 2, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        ];
        assert.deepEqual(
          proxyUtils.generateMinefield({
            gameSeed: 'game seed',
            dimensions: { rows: 3, cols: 3 },
            numMines: 1
          }),
          expectedMinefield
        );
      });
    });

    describe('if a mine is on the bottom row', function () {
      it('should avoid checking out of bound indexes', function () {
        doubles.seedrandomStub.returns(doubles.prng);
        doubles.mineGeneratorsStub.pureRNG.returns([7]);
        doubles.prng.returns(0);
        testData.initialPatchMinSize = 0;
        
        const expectedMinefield = [
          { id: '0', row: 0, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '1', row: 0, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '2', row: 0, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '3', row: 1, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '4', row: 1, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '5', row: 1, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '6', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '7', row: 2, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
          { id: '8', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
        ];
        assert.deepEqual(
          proxyUtils.generateMinefield({
            gameSeed: 'game seed',
            dimensions: { rows: 3, cols: 3 },
            numMines: 1
          }),
          expectedMinefield
        );
      });
    });

    describe('if a mine is on the right most column', function () {
      it('should avoid checking out of bound indexes', function () {
        doubles.seedrandomStub.returns(doubles.prng);
        doubles.mineGeneratorsStub.pureRNG.returns([5]);
        doubles.prng.returns(0);
        testData.initialPatchMinSize = 0;
        
        const expectedMinefield = [
          { id: '0', row: 0, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '1', row: 0, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '3', row: 1, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '4', row: 1, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '5', row: 1, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
          { id: '6', row: 2, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '7', row: 2, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '8', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
        ];
        assert.deepEqual(
          proxyUtils.generateMinefield({
            gameSeed: 'game seed',
            dimensions: { rows: 3, cols: 3 },
            numMines: 1
          }),
          expectedMinefield
        );
      });
    });

    describe('if a mine is on the left most column', function () {
      it('should avoid checking out of bound indexes', function () {
        doubles.seedrandomStub.returns(doubles.prng);
        doubles.mineGeneratorsStub.pureRNG.returns([3]);
        doubles.prng.returns(0);
        testData.initialPatchMinSize = 0;
        
        const expectedMinefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '1', row: 0, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '2', row: 0, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '3', row: 1, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
          { id: '4', row: 1, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '5', row: 1, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '6', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '7', row: 2, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '8', row: 2, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        ];
        assert.deepEqual(
          proxyUtils.generateMinefield({
            gameSeed: 'game seed',
            dimensions: { rows: 3, cols: 3 },
            numMines: 1
          }),
          expectedMinefield
        );
      });
    });

    describe('if a tile has 1 adjacent mine', function () {
      it('should set that tile\'s numAdjacentMines property to 1', function () {
        doubles.seedrandomStub.returns(doubles.prng);
        doubles.mineGeneratorsStub.pureRNG.returns([0]);
        doubles.prng.returns(0);
        testData.initialPatchMinSize = 0;
        
        const expectedMinefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
          { id: '1', row: 0, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '2', row: 0, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '3', row: 1, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '4', row: 1, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '5', row: 1, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '6', row: 2, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '7', row: 2, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '8', row: 2, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        ];
        assert.deepEqual(
          proxyUtils.generateMinefield({
            gameSeed: 'game seed',
            dimensions: { rows: 3, cols: 3 },
            numMines: 1
          }),
          expectedMinefield
        );
      });
    });

    describe('if a tile has 2 adjacent mine', function () {
      it('should set that tile\'s numAdjacentMines property to 2', function () {
        doubles.seedrandomStub.returns(doubles.prng);
        doubles.mineGeneratorsStub.pureRNG.returns([0, 1]);
        doubles.prng.returns(0);
        testData.initialPatchMinSize = 0;
        
        const expectedMinefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 1 },
          { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 1 },
          { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '3', row: 1, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
          { id: '4', row: 1, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
          { id: '5', row: 1, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '6', row: 2, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '7', row: 2, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '8', row: 2, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        ];
        assert.deepEqual(
          proxyUtils.generateMinefield({
            gameSeed: 'game seed',
            dimensions: { rows: 3, cols: 3 },
            numMines: 2
          }),
          expectedMinefield
        );
      });
    });

    describe('if a tile has 3 adjacent mine', function () {
      it('should set that tile\'s numAdjacentMines property to 3', function () {
        doubles.seedrandomStub.returns(doubles.prng);
        doubles.mineGeneratorsStub.pureRNG.returns([0, 1, 2]);
        doubles.prng.returns(0);
        testData.initialPatchMinSize = 0;
        
        const expectedMinefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 1 },
          { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '2', row: 0, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 1 },
          { id: '3', row: 1, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
          { id: '4', row: 1, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 3 },
          { id: '5', row: 1, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
          { id: '6', row: 2, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '7', row: 2, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '8', row: 2, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        ];
        assert.deepEqual(
          proxyUtils.generateMinefield({
            gameSeed: 'game seed',
            dimensions: { rows: 3, cols: 3 },
            numMines: 3
          }),
          expectedMinefield
        );
      });
    });

    describe('if a tile has 4 adjacent mine', function () {
      it('should set that tile\'s numAdjacentMines property to 4', function () {
        doubles.seedrandomStub.returns(doubles.prng);
        doubles.mineGeneratorsStub.pureRNG.returns([0, 1, 2, 3]);
        doubles.prng.returns(0);
        testData.initialPatchMinSize = 0;
        
        const expectedMinefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 3 },
          { id: '2', row: 0, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 1 },
          { id: '3', row: 1, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '4', row: 1, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 4 },
          { id: '5', row: 1, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
          { id: '6', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '7', row: 2, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '8', row: 2, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        ];
        assert.deepEqual(
          proxyUtils.generateMinefield({
            gameSeed: 'game seed',
            dimensions: { rows: 3, cols: 3 },
            numMines: 4
          }),
          expectedMinefield
        );
      });
    });

    describe('if a tile has 5 adjacent mine', function () {
      it('should set that tile\'s numAdjacentMines property to 5', function () {
        doubles.seedrandomStub.returns(doubles.prng);
        doubles.mineGeneratorsStub.pureRNG.returns([0, 1, 2, 3, 5]);
        doubles.prng.returns(0);
        testData.initialPatchMinSize = 0;
        
        const expectedMinefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 4 },
          { id: '2', row: 0, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '3', row: 1, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '4', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 5 },
          { id: '5', row: 1, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '6', row: 2, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '7', row: 2, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
          { id: '8', row: 2, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '9', row: 3, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '10', row: 3, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '11', row: 3, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        ];
        assert.deepEqual(
          proxyUtils.generateMinefield({
            gameSeed: 'game seed',
            dimensions: { rows: 4, cols: 3 },
            numMines: 5
          }),
          expectedMinefield
        );
      });
    });

    describe('if a tile has 6 adjacent mine', function () {
      it('should set that tile\'s numAdjacentMines property to 6', function () {
        doubles.seedrandomStub.returns(doubles.prng);
        doubles.mineGeneratorsStub.pureRNG.returns([0, 1, 2, 3, 5, 6]);
        doubles.prng.returns(0);
        testData.initialPatchMinSize = 0;
        
        const expectedMinefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 4 },
          { id: '2', row: 0, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '3', row: 1, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 3 },
          { id: '4', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 6 },
          { id: '5', row: 1, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '6', row: 2, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 1 },
          { id: '7', row: 2, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 3 },
          { id: '8', row: 2, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '9', row: 3, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '10', row: 3, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '11', row: 3, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        ];
        assert.deepEqual(
          proxyUtils.generateMinefield({
            gameSeed: 'game seed',
            dimensions: { rows: 4, cols: 3 },
            numMines: 6
          }),
          expectedMinefield
        );
      });
    });

    describe('if a tile has 7 adjacent mine', function () {
      it('should set that tile\'s numAdjacentMines property to 7', function () {
        doubles.seedrandomStub.returns(doubles.prng);
        doubles.mineGeneratorsStub.pureRNG.returns([0, 1, 2, 3, 5, 6, 7]);
        doubles.prng.returns(0);
        testData.initialPatchMinSize = 0;
        
        const expectedMinefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 4 },
          { id: '2', row: 0, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '3', row: 1, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 4 },
          { id: '4', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 7 },
          { id: '5', row: 1, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 3 },
          { id: '6', row: 2, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '7', row: 2, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 3 },
          { id: '8', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
          { id: '9', row: 3, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
          { id: '10', row: 3, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
          { id: '11', row: 3, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '12', row: 4, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '13', row: 4, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '14', row: 4, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        ];
        assert.deepEqual(
          proxyUtils.generateMinefield({
            gameSeed: 'game seed',
            dimensions: { rows: 5, cols: 3 },
            numMines: 7
          }),
          expectedMinefield
        );
      });
    });

    describe('if a tile has 8 adjacent mine', function () {
      it('should set that tile\'s numAdjacentMines property to 8', function () {
        doubles.seedrandomStub.returns(doubles.prng);
        doubles.mineGeneratorsStub.pureRNG.returns([0, 1, 2, 3, 5, 6, 7, 8]);
        doubles.prng.returns(0);
        testData.initialPatchMinSize = 0;
        
        const expectedMinefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 4 },
          { id: '2', row: 0, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '3', row: 1, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 4 },
          { id: '4', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 8 },
          { id: '5', row: 1, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 4 },
          { id: '6', row: 2, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '7', row: 2, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 4 },
          { id: '8', row: 2, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 2 },
          { id: '9', row: 3, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
          { id: '10', row: 3, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 3 },
          { id: '11', row: 3, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
          { id: '12', row: 4, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '13', row: 4, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '14', row: 4, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        ];
        assert.deepEqual(
          proxyUtils.generateMinefield({
            gameSeed: 'game seed',
            dimensions: { rows: 5, cols: 3 },
            numMines: 8
          }),
          expectedMinefield
        );
      });
    });
  });

  describe('findTileIndexes()', function () {
    it('should return the indexes calculated by applying the offsets to the index of focus, that are within the provided dimensions', function () {
      const expectedReturn = [2, 5];
      assert.deepEqual(proxyUtils.findTileIndexes({rows: 3, cols: 3}, 1, [[-1, 0], [0, 1], [1, 1]]), expectedReturn);
    });

    describe('if the index of focus is in the top row', function () {
      it('should not return indexes that are out of bounds', function () {
        const expectedReturn = [2, 5];
        assert.deepEqual(proxyUtils.findTileIndexes({rows: 3, cols: 3}, 1, [[-1, -1], [0, 1], [1, 1]]), expectedReturn);
      });
    });
    
    describe('if the index of focus is in the bottom row', function () {
      it('should not return indexes that are out of bounds', function () {
        const expectedReturn = [3, 8];
        assert.deepEqual(proxyUtils.findTileIndexes({rows: 3, cols: 3}, 7, [[-1, -1], [0, 1], [1, 1]]), expectedReturn);
      });
    });
    
    describe('if the index of focus is in the left column', function () {
      it('should not return indexes that are out of bounds', function () {
        const expectedReturn = [4, 7];
        assert.deepEqual(proxyUtils.findTileIndexes({rows: 3, cols: 3}, 3, [[-1, -1], [0, 1], [1, 1]]), expectedReturn);
      });
    });
    
    describe('if the index of focus is in the right column', function () {
      it('should not return indexes that are out of bounds', function () {
        const expectedReturn = [1];
        assert.deepEqual(proxyUtils.findTileIndexes({rows: 3, cols: 3}, 5, [[-1, -1], [0, 1], [1, 1]]), expectedReturn);
      });
    });
  });

  describe('calcTilesToReveal()', function () {
    describe('if the tile in focus is not revealed', function () {
      describe('if it has adjacent mines', function () {
        it('should return just the index of the tile in focus', function () {
          const minefield = [
            { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '4', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '5', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '6', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '7', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '8', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '9', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '10', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '11', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          ];
    
          assert.sameDeepMembers(
            proxyUtils.calcTilesToReveal(minefield, 2),
            ['2']
          );
        });
      });

      describe('if it has a mine', function () {
        it('should return just the index of the tile in focus', function () {
          const minefield = [
            { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '4', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '5', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '6', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '7', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '8', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '9', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '10', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '11', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          ];
    
          assert.sameDeepMembers(
            proxyUtils.calcTilesToReveal(minefield, 1),
            ['1']
          );
        });
      });

      describe('if the tile in focus is empty', function () {
        it('should return the index of the tile in focus and all its valid and not revealed adjacent tile indexes', function () {
          const minefield = [
            { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '1', row: 0, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '2', row: 0, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '4', row: 0, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '5', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '6', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '7', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '8', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '9', row: 1, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '10', row: 2, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '11', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '12', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '13', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '14', row: 2, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '15', row: 3, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '16', row: 3, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '17', row: 3, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '18', row: 3, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '19', row: 3, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '20', row: 4, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '21', row: 4, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '22', row: 4, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '23', row: 4, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '24', row: 4, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          ];
    
          assert.sameDeepMembers(
            proxyUtils.calcTilesToReveal(minefield, 12),
            ['6', '7', '8', '11', '12', '13', '16', '17', '18']
          );
        });
  
        describe('if a valid adjacent tile is already revealed', function () {
          it('should not add that tile index to the return value', function () {
            const minefield = [
              { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '1', row: 0, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '2', row: 0, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '4', row: 0, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '5', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '6', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '7', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '8', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '9', row: 1, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '10', row: 2, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '11', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '12', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '13', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '14', row: 2, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '15', row: 3, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '16', row: 3, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '17', row: 3, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '18', row: 3, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '19', row: 3, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '20', row: 4, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '21', row: 4, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '22', row: 4, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '23', row: 4, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '24', row: 4, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            ];
      
            assert.sameDeepMembers(
              proxyUtils.calcTilesToReveal(minefield, 12),
              ['6', '7', '8', '11', '12', '13', '17', '18']
            );
          });
        });

        describe('if a valid adjacent tile has a flag', function () {
          it('should not add that tile index to the return value', function () {
            const minefield = [
              { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '1', row: 0, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '2', row: 0, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '4', row: 0, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '5', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '6', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '7', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '8', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '9', row: 1, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '10', row: 2, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '11', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '12', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '13', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '14', row: 2, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '15', row: 3, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '16', row: 3, col: 1, revealed: false, hasMine: false, hasFlag: true, numAdjacentMines: 2 },
              { id: '17', row: 3, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '18', row: 3, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '19', row: 3, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '20', row: 4, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '21', row: 4, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '22', row: 4, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '23', row: 4, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '24', row: 4, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            ];
      
            assert.sameDeepMembers(
              proxyUtils.calcTilesToReveal(minefield, 12),
              ['6', '7', '8', '11', '12', '13', '17', '18']
            );
          });
        });
  
        describe('if there are other empty tiles connected to the tile in focus', function () {
          it('should reveal all connected empty tiles and their non-empty immediate neighbors', function () {
            const minefield = [
              { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '4', row: 0, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '5', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '6', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '7', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '8', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '9', row: 1, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '10', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '11', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '12', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '13', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '14', row: 2, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '15', row: 3, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '16', row: 3, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '17', row: 3, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '18', row: 3, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '19', row: 3, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '20', row: 4, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '21', row: 4, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '22', row: 4, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '23', row: 4, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '24', row: 4, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            ];
      
            assert.sameDeepMembers(
              proxyUtils.calcTilesToReveal(minefield, 12),
              ['5', '6', '7', '8', '10', '11', '12', '13', '15', '16', '17', '18', '20', '21']
            );
          });

          describe('if one of them has a flag', function () {
            it('should reveal all connected empty tiles and their non-empty immediate neighbors', function () {
              const minefield = [
                { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
                { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '4', row: 0, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
                { id: '5', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '6', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '7', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '8', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
                { id: '9', row: 1, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
                { id: '10', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
                { id: '11', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: true, numAdjacentMines: 0 },
                { id: '12', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
                { id: '13', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '14', row: 2, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
                { id: '15', row: 3, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
                { id: '16', row: 3, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '17', row: 3, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '18', row: 3, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
                { id: '19', row: 3, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '20', row: 4, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
                { id: '21', row: 4, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '22', row: 4, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
                { id: '23', row: 4, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '24', row: 4, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              ];
        
              assert.sameDeepMembers(
                proxyUtils.calcTilesToReveal(minefield, 12),
                ['6', '7', '8', '12', '13', '16', '17', '18']
              );
            });
          });
        });
      });
    });

    describe('if the tile in focus is revealed', function () {
      describe('if it has adjacent mines', function () {
        it('should return the index of all its valid and not revealed adjacent tile indexes', function () {
          const minefield = [
            { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '1', row: 0, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '2', row: 0, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '4', row: 0, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '5', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '6', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '7', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '8', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '9', row: 1, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '10', row: 2, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '11', row: 2, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '12', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '13', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '14', row: 2, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '15', row: 3, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '16', row: 3, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '17', row: 3, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '18', row: 3, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '19', row: 3, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '20', row: 4, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '21', row: 4, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '22', row: 4, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '23', row: 4, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '24', row: 4, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          ];
    
          assert.sameDeepMembers(
            proxyUtils.calcTilesToReveal(minefield, 11),
            ['5', '6', '7', '8', '10', '12', '13', '15', '16', '17', '18']
          );
        });
      });

      describe('if it has a mine', function () {
        it('should return the index of all its valid and not revealed adjacent tile indexes', function () {
          const minefield = [
            { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '1', row: 0, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '2', row: 0, col: 2, revealed: true, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '4', row: 0, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '5', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '6', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '7', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '8', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '9', row: 1, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '10', row: 2, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '11', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '12', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '13', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '14', row: 2, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '15', row: 3, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '16', row: 3, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '17', row: 3, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '18', row: 3, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '19', row: 3, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '20', row: 4, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '21', row: 4, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '22', row: 4, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '23', row: 4, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '24', row: 4, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          ];
    
          assert.sameDeepMembers(
            proxyUtils.calcTilesToReveal(minefield, 2),
            ['1', '3', '6', '7', '8']
          );
        });
      });

      describe('if the tile in focus is empty', function () {
        it('should return the index of all its valid and not revealed adjacent tile indexes', function () {
          const minefield = [
            { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '1', row: 0, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '2', row: 0, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '4', row: 0, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '5', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '6', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '7', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '8', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '9', row: 1, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '10', row: 2, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '11', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '12', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '13', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '14', row: 2, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '15', row: 3, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '16', row: 3, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '17', row: 3, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '18', row: 3, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
            { id: '19', row: 3, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '20', row: 4, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            { id: '21', row: 4, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '22', row: 4, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
            { id: '23', row: 4, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
            { id: '24', row: 4, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          ];
    
          assert.sameDeepMembers(
            proxyUtils.calcTilesToReveal(minefield, 12),
            ['6', '7', '8', '11', '12', '13', '16', '17', '18']
          );
        });

        describe('if a valid adjacent tile is already revealed', function () {
          it('should return the index of all its valid and not revealed adjacent tile indexes', function () {
            const minefield = [
              { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '1', row: 0, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '2', row: 0, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '4', row: 0, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '5', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '6', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '7', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '8', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '9', row: 1, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '10', row: 2, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '11', row: 2, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '12', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '13', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '14', row: 2, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '15', row: 3, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '16', row: 3, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '17', row: 3, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '18', row: 3, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '19', row: 3, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '20', row: 4, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '21', row: 4, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '22', row: 4, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '23', row: 4, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '24', row: 4, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            ];
      
            assert.sameDeepMembers(
              proxyUtils.calcTilesToReveal(minefield, 12),
              ['6', '7', '8', '12', '13', '16', '17', '18']
            );
          });
        });

        describe('if a valid adjacent tile has a flag', function () {
          it('should return the index of all its valid and not revealed adjacent tile indexes', function () {
            const minefield = [
              { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '1', row: 0, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '2', row: 0, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '4', row: 0, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '5', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '6', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '7', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '8', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '9', row: 1, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '10', row: 2, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '11', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: true, numAdjacentMines: 1 },
              { id: '12', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '13', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '14', row: 2, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '15', row: 3, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '16', row: 3, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '17', row: 3, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '18', row: 3, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '19', row: 3, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '20', row: 4, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '21', row: 4, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '22', row: 4, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '23', row: 4, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '24', row: 4, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            ];
      
            assert.sameDeepMembers(
              proxyUtils.calcTilesToReveal(minefield, 12),
              ['6', '7', '8', '12', '13', '16', '17', '18']
            );
          });
        });

        describe('if there are other empty tiles connected to the tile in focus', function () {
          it('should reveal all connected empty tiles and their non-empty immediate neighbors', function () {
            const minefield = [
              { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '4', row: 0, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '5', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '6', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '7', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '8', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '9', row: 1, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '10', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '11', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '12', row: 2, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '13', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '14', row: 2, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '15', row: 3, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '16', row: 3, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '17', row: 3, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '18', row: 3, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '19', row: 3, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '20', row: 4, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '21', row: 4, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '22', row: 4, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '23', row: 4, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '24', row: 4, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            ];
      
            assert.sameDeepMembers(
              proxyUtils.calcTilesToReveal(minefield, 12),
              ['5', '6', '7', '8', '10', '11', '13', '15', '16', '17', '18', '20', '21']
            );
          });

          describe('if one of them has a flag', function () {
            it('should reveal all connected empty tiles and their non-empty immediate neighbors', function () {
              const minefield = [
                { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
                { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '4', row: 0, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
                { id: '5', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '6', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '7', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '8', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
                { id: '9', row: 1, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
                { id: '10', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
                { id: '11', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: true, numAdjacentMines: 0 },
                { id: '12', row: 2, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
                { id: '13', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '14', row: 2, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
                { id: '15', row: 3, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
                { id: '16', row: 3, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '17', row: 3, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '18', row: 3, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
                { id: '19', row: 3, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '20', row: 4, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
                { id: '21', row: 4, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '22', row: 4, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
                { id: '23', row: 4, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
                { id: '24', row: 4, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              ];
        
              assert.sameDeepMembers(
                proxyUtils.calcTilesToReveal(minefield, 12),
                ['6', '7', '8', '13', '16', '17', '18']
              );
            });
          });
        });
      });
    });

    describe('Bug regression catchers', function () {
      describe('if the tile in focus is empty', function () {
        describe('if there are other, revealed, empty tiles connected to the tile in focus', function () {
          it('should not get stuck in an infinite loop due to adding already checked tiles to the queue, making it so that the queue never becomes empty', function () {
            const minefield = [
              { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '4', row: 0, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '5', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '6', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '7', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '8', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '9', row: 1, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '10', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '11', row: 2, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '12', row: 2, col: 2, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '13', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '14', row: 2, col: 4, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '15', row: 3, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '16', row: 3, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '17', row: 3, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '18', row: 3, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
              { id: '19', row: 3, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '20', row: 4, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
              { id: '21', row: 4, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '22', row: 4, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
              { id: '23', row: 4, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
              { id: '24', row: 4, col: 4, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
            ];
      
            assert.sameDeepMembers(
              proxyUtils.calcTilesToReveal(minefield, 12),
              ['5', '6', '7', '8', '10', '13', '15', '16', '17', '18', '20', '21']
            );
          });
        });
      });
    });
  });

  describe('countIdentifiedMines()', function () {
    it('should be a function', function () {
      assert.isFunction(proxyUtils.countIdentifiedMines);
    });

    describe('if the tiles adjacent to the provided index have no flags nor revealed mines', function () {
      it('should return zero', function () {
        const minefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
          { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '4', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '5', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '6', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '7', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '8', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '9', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '10', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '11', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        ];

        assert.strictEqual(proxyUtils.countIdentifiedMines(minefield, 8), 0);
      });
    });
    
    describe('if there are tiles adjacent to the provided index with a flag', function () {
      it('should return the number of adjacent flags', function () {
        const minefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '1', row: 0, col: 1, revealed: false, hasMine: true, hasFlag: true, numAdjacentMines: 0 },
          { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '4', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '5', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: true, numAdjacentMines: 1 },
          { id: '6', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '7', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '8', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '9', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '10', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: true, numAdjacentMines: 0 },
          { id: '11', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        ];

        assert.strictEqual(proxyUtils.countIdentifiedMines(minefield, 2), 2);
      });
    });
    
    describe('if there are revealed tiles adjacent to the provided index with a mine', function () {
      it('should return the number of adjacent revealed mines', function () {
        const minefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '1', row: 0, col: 1, revealed: true, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
          { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '4', row: 1, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 1 },
          { id: '5', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '6', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '7', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '8', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '9', row: 2, col: 1, revealed: true, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
          { id: '10', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '11', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        ];

        assert.strictEqual(proxyUtils.countIdentifiedMines(minefield, 0), 1);
      });
    });
    
    describe('if there are revealed tiles adjacent to the provided index with a mine and other adjacent tiles with flags', function () {
      it('should return the number of adjacent revealed mines and flags', function () {
        const minefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: true, numAdjacentMines: 1 },
          { id: '1', row: 0, col: 1, revealed: true, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
          { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '4', row: 1, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 1 },
          { id: '5', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
          { id: '6', row: 1, col: 2, revealed: false, hasMine: false, hasFlag: true, numAdjacentMines: 1 },
          { id: '7', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '8', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '9', row: 2, col: 1, revealed: true, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
          { id: '10', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '11', row: 2, col: 3, revealed: true, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
        ];

        assert.strictEqual(proxyUtils.countIdentifiedMines(minefield, 7), 2);
      });
    });
  });
});