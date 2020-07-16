'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const react = require("react");

describe('FlagsEnabled', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyFlagsEnabled;

  beforeEach(function () {
    doubles = {};
    doubles.createElementStub = sandbox.stub(react, 'createElement');
    doubles.setStateStub = sandbox.stub();
    proxyFlagsEnabled = proxyquire('../../../../src/js/components/Setup/FlagsEnabled.js', {
      'react': react,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('render()', function () {
    const props = {};
    let flagsEnabled = null;

    beforeEach(function () {
      doubles.createElementStub.onCall(0).returns('checkbox element.');
      doubles.createElementStub.onCall(1).returns('label element.');
      doubles.createElementStub.onCall(2).returns('Flags <p>');

      props.onChange = sandbox.stub();
      flagsEnabled = new proxyFlagsEnabled.FlagsEnabled(props);
    });

    describe('if props.checked is true', function () {
      beforeEach(function () {
        props.checked = true;
      });

      it('should call React createElement() with a "input" tag with the correct properties and checked', function () {
        flagsEnabled.render();
        assert.deepEqual(
          doubles.createElementStub.args[0],
          ['input', { id: 'flags-enabled', type: 'checkbox', checked: true, onChange: props.onChange }]
        );
      });
    });
    
    describe('if props.checked is false', function () {
      beforeEach(function () {
        props.checked = false;
      });

      it('should call React createElement() with a "input" tag with the correct properties and not checked', function () {
        flagsEnabled.render();
        assert.deepEqual(
          doubles.createElementStub.args[0],
          ['input', { id: 'flags-enabled', type: 'checkbox', checked: false, onChange: props.onChange }]
        );
      });
    });

    it('should call React createElement() with a "label" tag with the correct properties and children', function () {
      flagsEnabled.render();
      assert.deepEqual(
        doubles.createElementStub.args[1],
        ['label', { htmlFor: 'flags-enabled', }, 'Enable flags']
      );
    });
    
    it('should call React createElement() with a "p" tag with the correct properties and children', function () {
      flagsEnabled.render();
      assert.deepEqual(
        doubles.createElementStub.args[2],
        ['p', { key: 'flags-enabled' }, 'checkbox element.', 'label element.']
      );
    });

    it('should return the "p" HTML element', function () {
      assert.strictEqual(flagsEnabled.render(), 'Flags <p>');
    });
  });
});