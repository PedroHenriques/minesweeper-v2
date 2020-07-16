'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const react = require('react');
const stylishButton = require('../../../../src/js/components/StylishButton');

describe('Menu', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyMenu;

  beforeEach(function () {
    doubles = {};
    doubles.createElementStub = sandbox.stub(react, 'createElement');
    doubles.setStateStub = sandbox.stub();
    doubles.stylishButtonStub = sandbox.stub(stylishButton);
    proxyMenu = proxyquire('../../../../src/js/components/App/Menu.js', {
      'react': react,
      '../StylishButton': doubles.stylishButtonStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('render()', function () {
    const props = {};
    let menu = null;

    beforeEach(function () {
      doubles.createElementStub.onCall(0).returns('new game button.');
      doubles.createElementStub.onCall(1).returns('reset button.');
      doubles.createElementStub.onCall(2).returns('github link.');
      doubles.createElementStub.onCall(3).returns('Menu component.');

      props.onNewGame = sandbox.stub();
      props.onResetGame = sandbox.stub();
      menu = new proxyMenu.Menu(props);
    });

    it('should call React createElement() with a "StylishButton" tag with its props, for the new game button', function () {
      menu.render();

      assert.deepEqual(
        doubles.createElementStub.args[0],
        [doubles.stylishButtonStub.StylishButton, { id: 'new-game-button', text: 'New Game', events: { onClick: props.onNewGame } }]
      );
    });
    
    it('should call React createElement() with a "StylishButton" tag with its props, for the reset game button', function () {
      menu.render();

      assert.deepEqual(
        doubles.createElementStub.args[1],
        [doubles.stylishButtonStub.StylishButton, { id: 'reset-game-button', text: 'Reset Game', events: { onClick: props.onResetGame } }]
      );
    });
    
    it('should call React createElement() with an "a" tag with its properties and children', function () {
      menu.render();

      assert.deepEqual(
        doubles.createElementStub.args[2],
        ['a', { href: 'https://github.com/PedroHenriques/minesweeper-v2', target: '_blank', className: 'github-link' }, 'Source Code']
      );
    });
    
    it('should call React createElement() with a "div" tag with its properties and children', function () {
      menu.render();

      assert.deepEqual(
        doubles.createElementStub.args[3],
        ['div', { id: 'menu' }, 'new game button.', 'reset button.', 'github link.']
      );
    });

    it('should return the "div" HTML element', function () {
      assert.strictEqual(menu.render(), 'Menu component.');
    });
  });
});