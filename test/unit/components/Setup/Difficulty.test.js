'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const react = require("react");

describe('Difficulty', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyDifficulty;

  beforeEach(function () {
    doubles = {};
    doubles.createElementStub = sandbox.stub(react, 'createElement');
    doubles.setStateStub = sandbox.stub();
    proxyDifficulty = proxyquire('../../../../src/js/components/Setup/Difficulty.js', {
      'react': react,
      '../../data': {
        difficulties: [
          { name: 'Beginner', rows: 9, cols: 9, mines: 10 },
          { name: 'Intermediate', rows: 16, cols: 16, mines: 40 },
          { name: 'Expert', rows: 30, cols: 16, mines: 99 },
        ],
      },
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('render()', function () {
    let props;
    let difficulty = null;

    beforeEach(function () {
      doubles.createElementStub.onCall(0).returns('difficulty option 0');
      doubles.createElementStub.onCall(1).returns('difficulty option 1');
      doubles.createElementStub.onCall(2).returns('difficulty option 2');
      doubles.createElementStub.onCall(3).returns('Difficulty select element.');
      doubles.createElementStub.onCall(4).returns('Difficulty <p>');

      props = {
        value: 100,
        onChange: sandbox.stub(),
      };
      difficulty = new proxyDifficulty.Difficulty(props);
    });

    it('should call React createElement() with an option tag with the first difficulty setting values', function () {
      difficulty.render();
      assert.deepEqual(
        doubles.createElementStub.args[0],
        ['option', { key: 0, value: 0 }, 'Beginner (9x9 - 10 mines)']
      );
    });
    
    it('should call React createElement() with an option tag with the second difficulty setting values', function () {
      difficulty.render();
      assert.deepEqual(
        doubles.createElementStub.args[1],
        ['option', { key: 1, value: 1 }, 'Intermediate (16x16 - 40 mines)']
      );
    });
    
    it('should call React createElement() with an option tag with the third difficulty setting values', function () {
      difficulty.render();
      assert.deepEqual(
        doubles.createElementStub.args[2],
        ['option', { key: 2, value: 2 }, 'Expert (30x16 - 99 mines)']
      );
    });
    
    it('should call React createElement() with a select tag with the difficulty setting values', function () {
      difficulty.render();
      assert.deepEqual(
        doubles.createElementStub.args[3],
        [
          'select',
          { id: 'difficulty', value: props.value, onChange: props.onChange },
          ['difficulty option 0', 'difficulty option 1', 'difficulty option 2']
        ]
      );
    });

    it('should call React createElement() with a p tag with select element', function () {
      difficulty.render();
      assert.deepEqual(
        doubles.createElementStub.args[4],
        ['p', { key: 'difficulty' }, 'Difficulty:', 'Difficulty select element.']
      );
    });

    it('should return a p HTML element', function () {
      assert.strictEqual(difficulty.render(), 'Difficulty <p>');
    });
  });
});