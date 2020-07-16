'use strict';
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const MinefieldUtils = require('../../../src/js/utils/MinefieldUtils');

describe('MinefieldUtils', function () {
  const sandbox = sinon.createSandbox();
  
  afterEach(function () {
    sandbox.restore();
  });
  
  describe('generateMinefield()', function () {
    it('should return a valid minefield', function () {
      const expectedMinefield = [
        { id: '0', row: 0, col: 0, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
        { id: '1', row: 0, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
        { id: '2', row: 0, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
        { id: '3', row: 0, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
        { id: '4', row: 1, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
        { id: '5', row: 1, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 2 },
        { id: '6', row: 1, col: 2, revealed: false, hasMine: true, hasFlag: false, numAdjacentMines: 0 },
        { id: '7', row: 1, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
        { id: '8', row: 2, col: 0, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        { id: '9', row: 2, col: 1, revealed: true, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
        { id: '10', row: 2, col: 2, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
        { id: '11', row: 2, col: 3, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 1 },
      ];

      assert.deepEqual(
        MinefieldUtils.generateMinefield({
          gameSeed: 'game seed',
          dimensions: { rows: 3, cols: 4 },
          numMines: 2
        }),
        expectedMinefield
      );
    });
  });
});