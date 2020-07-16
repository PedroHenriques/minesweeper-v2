'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const react = require("react");

describe('StylishButton', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyStylishButton;

  beforeEach(function () {
    doubles = {};
    doubles.createElementStub = sandbox.stub(react, 'createElement');
    doubles.setStateStub = sandbox.stub();
    proxyStylishButton = proxyquire('../../../src/js/components/StylishButton.js', {
      'react': react,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('render()', function () {
    const props = {};
    let stylishButton;

    beforeEach(function () {
      props.id = 'button id';
      props.text = 'button text';
      props.events = {
        onClick: sandbox.stub(),
      };

      stylishButton = new proxyStylishButton.StylishButton(props);
    });

    it('should return the result of calling React.createElement()', function () {
      doubles.createElementStub.onCall(0).returns('StylishButton component.');
      assert.strictEqual(stylishButton.render(), 'StylishButton component.');
    });

    it('should return a "button" element', function () {
      stylishButton.render();
      assert.strictEqual(doubles.createElementStub.args[0][0], 'button');
    });

    it('should add the correct "id" to the returned button element', function () {
      props.id = 'button id value';
      stylishButton.render();
      assert.strictEqual(doubles.createElementStub.args[0][1].id, 'button id value');
    });

    it('should add the correct "className" to the returned button element', function () {
      stylishButton.render();
      assert.strictEqual(doubles.createElementStub.args[0][1].className, 'stylish-button');
    });

    it('should add the text passed in as a prop as a child of the returned button element', function () {
      props.text = 'this is a sample buutton text';
      stylishButton.render();
      assert.strictEqual(doubles.createElementStub.args[0][2], 'this is a sample buutton text');
    });

    describe('events on the returned button element', function () {
      beforeEach(function () {
        props.events.onMouseUp = sandbox.stub();
      });

      it('should add the "onClick" event passed in as props as a property of the returned button element', function () {
        stylishButton.render();
        assert.strictEqual(doubles.createElementStub.args[0][1].onClick, props.events.onClick);
      });
      
      it('should add the "onMouseUp" event passed in as props as a property of the returned button element', function () {
        stylishButton.render();
        assert.strictEqual(doubles.createElementStub.args[0][1].onMouseUp, props.events.onMouseUp);
      });
    });
  });
});