'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const react = require("react");

describe('Minefield', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxySetup;

  beforeEach(function () {
    doubles = {};
    doubles.createElementStub = sandbox.stub(react, 'createElement');
    doubles.setStateStub = sandbox.stub();
    proxySetup = proxyquire('../../../src/js/components/Setup', {
      'react': react,
    });
  });
  
  afterEach(function () {
    sandbox.restore();
  });

  describe('constructor()', function () {
    it('should generate a random game seed correctly', function () {
      const setup = new proxySetup.Setup({});

      assert.match(setup.state.gameSeed, /[\u0021-\u007E]{3,10}/i);
    });
  });
  
  describe('handleGenerateSeed()', function () {
    it('should generate a random game seed correctly', function () {
      const setup = new proxySetup.Setup({});
      setup.setState = doubles.setStateStub;

      setup.handleGenerateSeed();
      assert.match(doubles.setStateStub.args[0][0].gameSeed, /[\u0021-\u007E]{3,10}/i);
    });
  });
});