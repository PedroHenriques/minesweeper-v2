'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const react = require("react");
const headerContainer = require('../../../src/js/containers/Header.js');
const minefieldContainer = require('../../../src/js/containers/Minefield.js');
const notificationComponent = require('../../../src/js/components/Notification.js');

describe('Game', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyGame;

  beforeEach(function () {
    doubles = {};
    doubles.createElementStub = sandbox.stub(react, 'createElement');
    doubles.headerStub = sandbox.stub(headerContainer, 'Header');
    doubles.minefieldStub = sandbox.stub(minefieldContainer, 'Minefield');
    doubles.notificationStub = sandbox.stub(notificationComponent);
    proxyGame = proxyquire('../../../src/js/components/Game.js', {
      'react': react,
      '../containers/Header': doubles.headerStub,
      '../containers/Minefield': doubles.minefieldStub,
      './Notification': doubles.notificationStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('render()', function () {
    const props = {};
    let game = null;

    beforeEach(function () {
      game = new proxyGame.Game(props);
    });

    describe('if the game has not yet ended', function () {
      beforeEach(function () {
        doubles.createElementStub.onCall(0).returns('Header component.');
        doubles.createElementStub.onCall(1).returns('Minefield component.');
        doubles.createElementStub.onCall(2).returns('Game component.');

        props.gameWon = undefined;
      });

      it('should call React createElement() with a "Header" tag with its props', function () {
        game.render();

        assert.deepEqual(
          doubles.createElementStub.args[0],
          [doubles.headerStub.Header, { gameEnded: false }]
        );
      });
      
      it('should call React createElement() with a "Minefield" tag with its props', function () {
        game.render();

        assert.deepEqual(
          doubles.createElementStub.args[1],
          [doubles.minefieldStub.Minefield, null]
        );
      });
      
      it('should call React createElement() with a "div" tag with its properties and children', function () {
        game.render();

        assert.deepEqual(
          doubles.createElementStub.args[2],
          ['div', { id: 'game' }, '', 'Header component.', 'Minefield component.']
        );
      });

      it('should return the "div" HTML element', function () {
        assert.strictEqual(game.render(), 'Game component.');
      });
    });

    describe('if the game has ended', function () {
      beforeEach(function () {
        doubles.createElementStub.onCall(0).returns('Notification component.');
        doubles.createElementStub.onCall(1).returns('Header component.');
        doubles.createElementStub.onCall(2).returns('Minefield component.');
        doubles.createElementStub.onCall(3).returns('Game component.');

        props.gameWon = true;
      });

      describe('if the game ended in a win', function () {
        beforeEach(function () {
          props.gameWon = true;
        });

        it('should call React createElement() with a "Notification" tag with its props, including the win message', function () {
          game.render();

          assert.deepEqual(
            doubles.createElementStub.args[0],
            [doubles.notificationStub.Notification, { id: 'game-notifs', notifText: 'Congratulations!' }]
          );
        });
      });
      
      describe('if the game ended in a loss', function () {
        beforeEach(function () {
          props.gameWon = false;
        });

        it('should call React createElement() with a "Notification" tag with its props, including the loss message', function () {
          game.render();

          assert.deepEqual(
            doubles.createElementStub.args[0],
            [doubles.notificationStub.Notification, { id: 'game-notifs', notifText: 'Game Over!' }]
          );
        });
      });

      it('should call React createElement() with a "Header" tag with its props', function () {
        game.render();

        assert.deepEqual(
          doubles.createElementStub.args[1],
          [doubles.headerStub.Header, { gameEnded: true }]
        );
      });
      
      it('should call React createElement() with a "Minefield" tag with its props', function () {
        game.render();

        assert.deepEqual(
          doubles.createElementStub.args[2],
          [doubles.minefieldStub.Minefield, null]
        );
      });
      
      it('should call React createElement() with a "div" tag with its props and children', function () {
        game.render();

        assert.deepEqual(
          doubles.createElementStub.args[3],
          ['div', { id: 'game' }, 'Notification component.', 'Header component.', 'Minefield component.']
        );
      });

      it('should return the "div" HTML element', function () {
        assert.strictEqual(game.render(), 'Game component.');
      });
    });
  });
});