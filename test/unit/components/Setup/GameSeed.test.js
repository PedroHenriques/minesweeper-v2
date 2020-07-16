'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const react = require("react");

describe('GameSeed', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyGameSeed;

  beforeEach(function () {
    global.BASE_URL = '/';
    doubles = {
      createElementStub: sandbox.stub(react, 'createElement'),
      setStateStub: sandbox.stub(),
    };
    proxyGameSeed = proxyquire('../../../../src/js/components/Setup/GameSeed.js', {
      'react': react,
    });
  });

  afterEach(function () {
    sandbox.restore();
    delete global.BASE_URL;
  });

  describe('render()', function () {
    let props = {};
    let gameSeed = null;

    beforeEach(function () {
      doubles.createElementStub.onCall(0).returns('Seed text element.');
      doubles.createElementStub.onCall(1).returns('Generate button.');
      doubles.createElementStub.onCall(2).returns('Seed <p>');

      props = {
        onChange: sandbox.stub(),
        onGenerate: sandbox.stub(),
      };
      gameSeed = new proxyGameSeed.GameSeed(props);
    });

    it('should call React createElement() with an "input" tag with its properties', function () {
      props.value = 'game seed';
      gameSeed.render();

      assert.deepEqual(
        doubles.createElementStub.args[0],
        ['input', { id: 'game-seed', type: 'text', value: 'game seed', onChange: props.onChange }]
      );
    });
    
    it('should call React createElement() with an "img" tag with its properties', function () {
      gameSeed.render();

      assert.deepEqual(
        doubles.createElementStub.args[1],
        ['img', { src: '/img/dice.png', title: 'Generate new seed!', alt: 'generate new seed', onClick: props.onGenerate }]
      );
    });
    
    it('should call React createElement() with a "p" tag with its properties and children', function () {
      props.value = 'another game seed';
      gameSeed.render();

      assert.deepEqual(
        doubles.createElementStub.args[2],
        ['p', { key: 'game-seed' }, 'Seed:', 'Seed text element.', 'Generate button.']
      );
    });
    
    it('should return the "p" HTML element', function () {
      assert.strictEqual(gameSeed.render(), 'Seed <p>');
    });
  });
});