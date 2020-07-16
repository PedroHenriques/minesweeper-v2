'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const redux = require('redux');
const gameEndedBlocker = require('../../../src/js/middleware/gameEndedBlocker.js');
const checkIfGameEnded = require('../../../src/js/middleware/checkIfGameEnded.js');
const handleFlags = require('../../../src/js/middleware/handleFlags.js');
const handleRevealTiles = require('../../../src/js/middleware/handleRevealTiles.js');
const handleGenerateMinefield = require('../../../src/js/middleware/handleGenerateMinefield.js');
const requestEndGameCheck = require('../../../src/js/middleware/requestEndGameCheck.js');

describe('index Middleware', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyMiddleware;
  let applyMiddlewareReturn;

  beforeEach(function () {
    doubles = {
      redux: sandbox.stub(redux),
      gameEndedBlocker: sandbox.stub(gameEndedBlocker),
      checkIfGameEnded: sandbox.stub(checkIfGameEnded),
      handleFlags: sandbox.stub(handleFlags),
      handleRevealTiles: sandbox.stub(handleRevealTiles),
      handleGenerateMinefield: sandbox.stub(handleGenerateMinefield),
      requestEndGameCheck: sandbox.stub(requestEndGameCheck),
    };

    applyMiddlewareReturn = {};
    doubles.redux.applyMiddleware.returns(applyMiddlewareReturn);

    proxyMiddleware = proxyquire('../../../src/js/middleware/index.js', {
      'redux': doubles.redux,
      './gameEndedBlocker': doubles.gameEndedBlocker,
      './checkIfGameEnded': doubles.checkIfGameEnded,
      './handleFlags': doubles.handleFlags,
      './handleRevealTiles': doubles.handleRevealTiles,
      './handleGenerateMinefield': doubles.handleGenerateMinefield,
      './requestEndGameCheck': doubles.requestEndGameCheck,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should call "applyMiddleware", from redux, once', function () {
    assert.strictEqual(doubles.redux.applyMiddleware.callCount, 1);
  });
  
  it('should call "applyMiddleware", from redux, with 6 arguments', function () {
    assert.strictEqual(doubles.redux.applyMiddleware.args[0].length, 6);
  });

  describe('1st argument passed to "applyMiddleware", from redux', function () {
    it('should be the "gameEndedBlocker" exported function from the "gameEndedBlocker" middleware module', function () {
      assert.strictEqual(doubles.redux.applyMiddleware.args[0][0], doubles.gameEndedBlocker.gameEndedBlocker);
    });
  });

  describe('2nd argument passed to "applyMiddleware", from redux', function () {
    it('should be the "checkIfGameEnded" exported function from the "checkIfGameEnded" middleware module', function () {
      assert.strictEqual(doubles.redux.applyMiddleware.args[0][1], doubles.checkIfGameEnded.checkIfGameEnded);
    });
  });
  
  describe('3rd argument passed to "applyMiddleware", from redux', function () {
    it('should be the "handleGenerateMinefield" exported function from the "handleGenerateMinefield" middleware module', function () {
      assert.strictEqual(doubles.redux.applyMiddleware.args[0][2], doubles.handleGenerateMinefield.handleGenerateMinefield);
    });
  });
  
  describe('4th argument passed to "applyMiddleware", from redux', function () {
    it('should be the "handleFlags" exported function from the "handleFlags" middleware module', function () {
      assert.strictEqual(doubles.redux.applyMiddleware.args[0][3], doubles.handleFlags.handleFlags);
    });
  });
  
  describe('5th argument passed to "applyMiddleware", from redux', function () {
    it('should be the "handleRevealTiles" exported function from the "handleRevealTiles" middleware module', function () {
      assert.strictEqual(doubles.redux.applyMiddleware.args[0][4], doubles.handleRevealTiles.handleRevealTiles);
    });
  });

  describe('6th argument passed to "applyMiddleware", from redux', function () {
    it('should be the "requestEndGameCheck" exported function from the "requestEndGameCheck" middleware module', function () {
      assert.strictEqual(doubles.redux.applyMiddleware.args[0][5], doubles.requestEndGameCheck.requestEndGameCheck);
    });
  });

  it('should expose the return value of "applyMiddleware", from redux, under the name "middleware"', function () {
    assert.strictEqual(proxyMiddleware.middleware, applyMiddlewareReturn);
  });
});