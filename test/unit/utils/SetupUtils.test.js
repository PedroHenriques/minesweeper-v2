'use strict';
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const setupUtils = require('../../../src/js/utils/SetupUtils.js');

describe('SetupUtils', function () {
  const sandbox = sinon.createSandbox();
  let doubles;

  beforeEach(function () {
    doubles = {};
    doubles.randomStub = sandbox.stub(Math, 'random');
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('generateSeed()', function () {
    describe('if the number generated, used to calculate the number of characters in the string, is zero', function () {
      it('should generate a string with 3 characters', function () {
        doubles.randomStub.withArgs().onCall(0).returns(0); // 3 chars in the string
        doubles.randomStub.withArgs().returns(0.2); // char code 51
  
        assert.strictEqual(setupUtils.generateSeed(), '333');
      });
    });
    
    describe('if the number generated, used to calculate the number of characters in the string, is 0.999', function () {
      it('should generate a string with 10 characters', function () {
        doubles.randomStub.withArgs().onCall(0).returns(0.9999); // 10 chars in the string
        doubles.randomStub.withArgs().returns(0.1); // char code 42
  
        assert.strictEqual(setupUtils.generateSeed(), '**********');
      });
    });

    describe('if a number generated, used to calculate decimal code of a characters, is zero', function () {
      it('should match the character with decimal code 33', function () {
        doubles.randomStub.withArgs().onCall(0).returns(0); // 3 chars in the string
        doubles.randomStub.withArgs().returns(0); // char code 33
  
        assert.strictEqual(setupUtils.generateSeed(), '!!!');
      });
    });
    
    describe('if a number generated, used to calculate decimal code of a characters, is 0.999', function () {
      it('should match the character with decimal code 126', function () {
        doubles.randomStub.withArgs().onCall(0).returns(0); // 3 chars in the string
        doubles.randomStub.withArgs().returns(0.999); // char code 126
  
        assert.strictEqual(setupUtils.generateSeed(), '~~~');
      });
    });
  });
});