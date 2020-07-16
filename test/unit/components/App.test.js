'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const react = require("react");
const menuComponent = require('../../../src/js/components/App/Menu.js');
const setupComponent = require('../../../src/js/components/Setup.js');
const gameComponent = require('../../../src/js/components/Game.js');

describe('App Component', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyApp;

  beforeEach(function () {
    sandbox.useFakeTimers();
    doubles = {};
    doubles.createElementStub = sandbox.stub(react, 'createElement');
    doubles.menuStub = sandbox.stub(menuComponent);
    doubles.setupStub = sandbox.stub(setupComponent);
    doubles.gameStub = sandbox.stub(gameComponent);
    proxyApp = proxyquire('../../../src/js/components/App.js', {
      'react': react,
      './App/Menu': doubles.menuStub,
      './Setup': doubles.setupStub,
      './Game': doubles.gameStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('handleNewGame()', function () {
    let testProps = {};
    let app = null;
    
    beforeEach(function () {
      testProps = { newGame: sandbox.stub() };

      app = new proxyApp.App(testProps);
    });

    it('should return void', function () {
      assert.isUndefined(app.handleNewGame());
    });

    it('should call the newGame() prop once', function () {
      app.handleNewGame();
      assert.strictEqual(testProps.newGame.callCount, 1);
    });

    it('should call the newGame() prop with the correct arguments', function () {
      app.handleNewGame();
      assert.deepEqual(testProps.newGame.args[0], []);
    });
  });

  describe('handleStart()', function () {
    let testProps = {};
    let app = null;

    beforeEach(function () {
      testProps = { startGame: sandbox.stub() };

      app = new proxyApp.App(testProps);
    });

    it('should return void', function () {
      const testConfig = {
        numMines: 1,
        dimensions: { rows: 2, cols: 3 },
        flagsEnabled: true,
        numLives: 4,
      };
      assert.isUndefined(app.handleStart(testConfig));
    });

    it('should call the startGame() prop once', function () {
      const testConfig = {
        numMines: 10,
        dimensions: { rows: 20, cols: 11 },
        flagsEnabled: false,
        numLives: 1,
      };
      app.handleStart(testConfig);
      assert.isTrue(testProps.startGame.calledOnce);
    });

    it('should call the startGame() prop with the correct arguments', function () {
      const testConfig = {
        numMines: 14,
        dimensions: { rows: 1, cols: 1 },
        flagsEnabled: true,
        numLives: 42,
      };
      app.handleStart(testConfig);
      assert.deepEqual(testProps.startGame.args[0], [ testConfig ]);
    });
  });

  describe('render()', function () {
    describe('if a game has not yet started', function () {
      let app = null;

      beforeEach(function () {
        app = new proxyApp.App({ gameStarted: false });

        doubles.createElementStub.onCall(0).returns('Setup component.');
        doubles.createElementStub.onCall(1).returns('App component.');
      });

      it('should return the result of React createElement() for the "div" element', function () {
        assert.strictEqual(app.render(), 'App component.');
      });

      it('should call React createElement() twice', function () {
        app.render();
        assert.strictEqual(doubles.createElementStub.callCount, 2);
      });
      
      it('should call React createElement() with the correct arguments for the Setup Component', function () {
        app.render();
        assert.deepEqual(
          doubles.createElementStub.args[0],
          [doubles.setupStub.Setup, { key: 'setup', onStart: app.handleStart }]
        );
      });
      
      it('should call React createElement() with the correct arguments for the "div" element', function () {
        app.render();
        assert.deepEqual(
          doubles.createElementStub.args[1],
          ['div', { id: 'app' }, ['Setup component.']]
        );
      });
    });

    describe('if the viewport dimensions have not been calculated', function () {
      let app = null;

      beforeEach(function () {
        app = new proxyApp.App({ gameStarted: false });
        app.state = { viewport: null };

        doubles.createElementStub.onCall(0).returns('Setup component.');
        doubles.createElementStub.onCall(1).returns('App component.');
      });

      it('should return the result of React createElement() for the "div" element', function () {
        assert.strictEqual(app.render(), 'App component.');
      });

      it('should call React createElement() twice', function () {
        app.render();
        assert.strictEqual(doubles.createElementStub.callCount, 2);
      });
      
      it('should call React createElement() with the correct arguments for the Setup Component', function () {
        app.render();
        assert.deepEqual(
          doubles.createElementStub.args[0],
          [doubles.setupStub.Setup, { key: 'setup', onStart: app.handleStart }]
        );
      });
      
      it('should call React createElement() with the correct arguments for the "div" element', function () {
        app.render();
        assert.deepEqual(
          doubles.createElementStub.args[1],
          ['div', { id: 'app' }, ['Setup component.']]
        );
      });
    });
    
    describe('if a game has started', function () {
      let testProps;
      let app = null;

      beforeEach(function () {
        testProps = {
          gameStarted: true,
          resetGame: sandbox.stub(),
          gameWon: sandbox.stub(),
        };

        doubles.createElementStub.onCall(0).returns('Menu component.');
        doubles.createElementStub.onCall(1).returns('Game component.');
        doubles.createElementStub.onCall(2).returns('App component.');

        app = new proxyApp.App(testProps);
      });

      it('should return the result of React createElement() for the "div" element', function () {
        assert.strictEqual(app.render(), 'App component.');
      });

      it('should call React createElement() three times', function () {
        app.render();
        assert.strictEqual(doubles.createElementStub.callCount, 3);
      });
      
      it('should call React createElement() with the correct arguments for the Menu Component', function () {
        app.render();
        assert.deepEqual(
          doubles.createElementStub.args[0],
          [doubles.menuStub.Menu, { key: 'menu', onNewGame: app.handleNewGame, onResetGame: testProps.resetGame }]
        );
      });
      
      it('should call React createElement() with the correct arguments for the Game Component', function () {
        app.render();
        assert.deepEqual(
          doubles.createElementStub.args[1],
          [doubles.gameStub.Game, { key: 'game', gameWon: testProps.gameWon }]
        );
      });
      
      it('should call React createElement() with the correct arguments for the "div" element', function () {
        app.render();
        assert.deepEqual(
          doubles.createElementStub.args[2],
          ['div', { id: 'app' }, ['Menu component.', 'Game component.']]
        );
      });
    });
  });
});