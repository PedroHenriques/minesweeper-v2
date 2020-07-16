'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const react = require("react");

describe('NumberLives', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyNumberLives;

  beforeEach(function () {
    doubles = {};
    doubles.createElementStub = sandbox.stub(react, 'createElement');
    doubles.setStateStub = sandbox.stub();
    proxyNumberLives = proxyquire('../../../../src/js/components/Setup/NumberLives.js', {
      'react': react,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('render()', function () {
    const props = {};
    let numberLives = null;

    beforeEach(function () {
      doubles.createElementStub.onCall(0).returns('Lives text element.');
      doubles.createElementStub.onCall(1).returns('Lives <p>');

      props.onChange = sandbox.stub();
      numberLives = new proxyNumberLives.NumberLives(props);
    });

    it('should call React createElement() with an "input" tag with its properties', function () {
      props.value = 23;
      numberLives.render()

      assert.deepEqual(
        doubles.createElementStub.args[0],
        ['input', { id: 'number-lives', type: 'number', value: 23, onChange: props.onChange }]
      );
    });
    
    it('should call React createElement() with an "p" tag with its properties and children', function () {
      numberLives.render()

      assert.deepEqual(
        doubles.createElementStub.args[1],
        ['p', { key: 'number-lives' }, 'Number of lives:', 'Lives text element.']
      );
    });

    it('should return the "p" HTML element', function () {
      props.value = 2;
      
      assert.strictEqual(numberLives.render(), 'Lives <p>');
    });
  });
});