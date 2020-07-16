'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const mineGenerators = require('../../../src/js/utils/MineGenerators.js');

describe('MineGenerators', function () {
  const sandbox = sinon.createSandbox();
  let doubles;

  beforeEach(function () {
    doubles = {};
    doubles.prngStub = sandbox.stub();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('pureRNG()', function () {
    it('should select the requested number of random tiles to have mines', function () {
      doubles.prngStub.onCall(0).returns(0/81);
      doubles.prngStub.onCall(1).returns(2/81);
      doubles.prngStub.onCall(2).returns(4/81);
      doubles.prngStub.onCall(3).returns(6/81);
      doubles.prngStub.onCall(4).returns(8/81);

      assert.deepEqual(
        mineGenerators.pureRNG({ rows: 9, cols: 9 }, 5, doubles.prngStub),
        [0, 2, 4, 6, 8]
      );
    });

    describe('if a tile is selected more than once', function () {
      it('should select a new random tile', function () {
        doubles.prngStub.onCall(0).returns(0/81);
        doubles.prngStub.onCall(1).returns(2/81);
        doubles.prngStub.onCall(2).returns(4/81);
        doubles.prngStub.onCall(3).returns(4/81);
        doubles.prngStub.onCall(4).returns(6/81);
        doubles.prngStub.onCall(5).returns(8/81);
  
        assert.deepEqual(
          mineGenerators.pureRNG({ rows: 9, cols: 9 }, 5, doubles.prngStub),
          [0, 2, 4, 6, 8]
        );
      });
    });
  });
});