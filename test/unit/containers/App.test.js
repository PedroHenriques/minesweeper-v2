'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const reactRedux = require('react-redux');
const appComponent = require('../../../src/js/components/App.js');
const actionCreators = require('../../../src/js/actions/creators.js');
const minefieldUtils = require('../../../src/js/utils/MinefieldUtils.js');

describe('App Container', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyContainer;

  beforeEach(function () {
    doubles = {
      connectSpy: sandbox.spy(reactRedux, 'connect'),
      appComponent: sandbox.stub(appComponent),
      actionCreators: sandbox.stub(actionCreators),
      minefieldUtils: sandbox.stub(minefieldUtils),
    };
    proxyContainer = proxyquire('../../../src/js/containers/App.js', {
      'react-redux': reactRedux,
      '../components/App': doubles.appComponent,
      '../actions/creators': doubles.actionCreators,
      '../utils/MinefieldUtils': doubles.minefieldUtils,
      '../data': {
        GAME_WON: 'game won constant',
      },
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should call react-redux connect() once', function () {
    assert.strictEqual(doubles.connectSpy.callCount, 1);
  });
  
  it('should call react-redux connect() with 2 arguments', function () {
    assert.strictEqual(doubles.connectSpy.args[0].length, 2);
  });

  it('should call react-redux connect() with a function for the 1st argument', function () {
    assert.typeOf(doubles.connectSpy.args[0][0], 'function');
  });
  
  it('should call react-redux connect() with a function for the 2nd argument', function () {
    assert.typeOf(doubles.connectSpy.args[0][1], 'function');
  });

  describe('mapStateToProps', function () {
    let mapStateToProps;

    beforeEach(function () {
      mapStateToProps = doubles.connectSpy.args[0][0];
    });

    describe('if the setup property of the redux store is null', function () {
      let props;

      beforeEach(function () {
        props = mapStateToProps({ setup: null });
      });

      it('should return an object with "false" in "gameStarted"', function () {
        assert.strictEqual(props.gameStarted, false);
      });
      
      it('should return an object with "undefined" in "gameWon"', function () {
        assert.deepEqual(props.gameWon, undefined);
      });

      it('should not call minefield utils getGameState()', function () {
        assert.strictEqual(doubles.minefieldUtils.getGameState.callCount, 0);
      });
    });

    describe('if the setup property of the redux store is not null', function () {
      describe('if the "gameEndUTC" property of state.setup is null', function () {
        let props;

        beforeEach(function () {
          props = mapStateToProps({ setup: { gameEndUTC: null } });
        });

        it('should return an object with "true" in "gameStarted"', function () {
          assert.strictEqual(props.gameStarted, true);
        });
        
        it('should return an object with "undefined" in "gameWon"', function () {
          assert.deepEqual(props.gameWon, undefined);
        });

        it('should not call minefield utils getGameState()', function () {
          assert.strictEqual(doubles.minefieldUtils.getGameState.callCount, 0);
        });
      });

      describe('if the "gameEndUTC" property of state.setup is not null', function () {
        it('should call getGameState(), from the MinefieldUtils module, once', function () {
          mapStateToProps({
            setup: { gameEndUTC: 12345 },
            minefield: [],
            tiles: [],
          });
          assert.strictEqual(doubles.minefieldUtils.getGameState.callCount, 1);
        });

        it('should call getGameState(), from the MinefieldUtils module, with 2 arguments', function () {
          mapStateToProps({
            setup: { gameEndUTC: 12345 },
            minefield: [],
            tiles: [],
          });
          assert.strictEqual(doubles.minefieldUtils.getGameState.args[0].length, 2);
        });

        describe('1st argument provided to getGameState(), from the MinefieldUtils module', function () {
          it('should be an array representing the tiles with their information', function () {
            mapStateToProps({
              setup: { gameEndUTC: 12345 },
              minefield: [ '1', '3', '4' ],
              tiles: {
                1: { id: '1' },
                2: { id: '2' },
                3: { id: '3' },
                4: { id: '4' },
                5: { id: '5' },
              },
            });
            assert.deepEqual(
              doubles.minefieldUtils.getGameState.args[0][0],
              [
                { id: '1' },
                { id: '3' },
                { id: '4' },
              ]
            );
          });
        });
        
        describe('2nd argument provided to getGameState(), from the MinefieldUtils module', function () {
          it('should be the value in "state.setup.numLives"', function () {
            mapStateToProps({
              setup: { gameEndUTC: 12345, numLives: 1234567890 },
              minefield: [],
              tiles: {},
            });
            assert.strictEqual(doubles.minefieldUtils.getGameState.args[0][1], 1234567890);
          });
        });

        describe('if the call to getGameState(), from the MinefieldUtils module returns the "GAME_WON" constant', function () {
          beforeEach(function () {
            doubles.minefieldUtils.getGameState.returns('game won constant');
          });

          it('should return an object with TRUE in the "gameStarted" property', function () {
            const props = mapStateToProps({
              setup: { gameEndUTC: 12345 },
              minefield: [],
              tiles: {},
            });
            assert.strictEqual(props.gameStarted, true);
          });
          
          it('should return an object with TRUE in "gameWon" property', function () {
            const props = mapStateToProps({
              setup: { gameEndUTC: 1 },
              minefield: [],
              tiles: {},
            });
            assert.strictEqual(props.gameWon, true);
          });
        });
        
        describe('if the call to getGameState(), from the MinefieldUtils module returns a value other than the "GAME_WON" constant', function () {
          beforeEach(function () {
            doubles.minefieldUtils.getGameState.returns('some other game state value');
          });

          it('should return an object with TRUE in the "gameStarted" property', function () {
            const props = mapStateToProps({
              setup: { gameEndUTC: 12345 },
              minefield: [],
              tiles: {},
            });
            assert.strictEqual(props.gameStarted, true);
          });
          
          it('should return an object with FALSE in "gameWon" property', function () {
            const props = mapStateToProps({
              setup: { gameEndUTC: 1 },
              minefield: [],
              tiles: {},
            });
            assert.strictEqual(props.gameWon, false);
          });
        });
      });
    });
  });

  describe('mapDispatchToProps', function () {
    let mapDispatchToProps;
    let props;

    beforeEach(function () {
      mapDispatchToProps = doubles.connectSpy.args[0][1];
      props = mapDispatchToProps(sandbox.stub());
    });

    it('should return an object with 4 properties', function () {
      assert.strictEqual(Object.getOwnPropertyNames(props).length, 4);
    });

    it('should return an object with a "startGame" property', function () {
      assert.isTrue(Object.getOwnPropertyNames(props).includes('startGame'));
    });
    
    it('should return an object with a "startGame" property containing a function', function () {
      assert.typeOf(props.startGame, 'function');
    });

    it('should return an object with a "resetGame" property', function () {
      assert.isTrue(Object.getOwnPropertyNames(props).includes('resetGame'));
    });

    it('should return an object with a "resetGame" property containing a function', function () {
      assert.typeOf(props.resetGame, 'function');
    });
    
    it('should return an object with a "endGame" property', function () {
      assert.isTrue(Object.getOwnPropertyNames(props).includes('endGame'));
    });

    it('should return an object with a "endGame" property containing a function', function () {
      assert.typeOf(props.endGame, 'function');
    });
    
    it('should return an object with a "newGame" property', function () {
      assert.isTrue(Object.getOwnPropertyNames(props).includes('newGame'));
    });

    it('should return an object with a "newGame" property containing a function', function () {
      assert.typeOf(props.newGame, 'function');
    });

    describe('startGame', function () {
      let dispatchStub;
      let configObj;

      beforeEach(function () {
        dispatchStub = sandbox.stub();
        configObj = {};
        doubles.actionCreators.generateMinefield.returns('generateMinefield return value.');
      });

      it('should return void', function () {
        const props = mapDispatchToProps(dispatchStub);
        assert.strictEqual(props.startGame(configObj), undefined);
      });
      
      it('should call the generateMinefield action creator once', function () {
        const props = mapDispatchToProps(dispatchStub);
        props.startGame(configObj);
        assert.strictEqual(doubles.actionCreators.generateMinefield.callCount, 1);
      });
      
      it('should call the generateMinefield action creator with 1 argument', function () {
        const props = mapDispatchToProps(dispatchStub);
        props.startGame(configObj);
        assert.strictEqual(doubles.actionCreators.generateMinefield.args[0].length, 1);
      });
      
      it('should call the generateMinefield action creator with a clone of the provided object as the argument', function () {
        configObj.prop1 = 'val1';
        configObj.prop2 = 'val2';
        const props = mapDispatchToProps(dispatchStub);
        props.startGame(configObj);
        assert.notStrictEqual(doubles.actionCreators.generateMinefield.args[0][0], configObj);
        assert.deepEqual(doubles.actionCreators.generateMinefield.args[0][0], configObj);
      });
      
      it('should call dispatch() once', function () {
        const props = mapDispatchToProps(dispatchStub);
        props.startGame(configObj);
        assert.strictEqual(dispatchStub.callCount, 1);
      });
      
      it('should call dispatch() with 1 argument', function () {
        const props = mapDispatchToProps(dispatchStub);
        props.startGame(configObj);
        assert.strictEqual(dispatchStub.args[0].length, 1);
      });
      
      it('should call dispatch() with the return value of generateMinefield() as the argument', function () {
        doubles.actionCreators.generateMinefield.returns('generateMinefield test return value.');
        const props = mapDispatchToProps(dispatchStub);
        props.startGame(configObj);
        assert.strictEqual(dispatchStub.args[0][0], 'generateMinefield test return value.');
      });
    });

    describe('resetGame', function () {
      let dispatchStub;
      let props;

      beforeEach(function () {
        doubles.actionCreators.generateMinefield.returns('generateMinefield return value.');
        dispatchStub = sandbox.stub();
        props = mapDispatchToProps(dispatchStub);
      });

      it('should return void', function () {
        assert.strictEqual(props.resetGame(), undefined);
      });
      
      it('should call the generateMinefield() action creator once', function () {
        props.resetGame();
        assert.strictEqual(doubles.actionCreators.generateMinefield.callCount, 1);
      });
      
      it('should call the generateMinefield() action creator with 1 argument', function () {
        props.resetGame();
        assert.strictEqual(doubles.actionCreators.generateMinefield.args[0].length, 1);
      });
      
      it('should call the generateMinefield() action creator with "null" as the argument', function () {
        props.resetGame();
        assert.strictEqual(doubles.actionCreators.generateMinefield.args[0][0], null);
      });
      
      it('should call dispatch() once', function () {
        props.resetGame();
        assert.strictEqual(dispatchStub.callCount, 1);
      });
      
      it('should call dispatch() with 1 argument', function () {
        props.resetGame();
        assert.strictEqual(dispatchStub.args[0].length, 1);
      });
      
      it('should call dispatch() with the return value of generateMinefield() as the argument', function () {
        doubles.actionCreators.generateMinefield.returns('generateMinefield dummy return value.');
        props.resetGame();
        assert.strictEqual(dispatchStub.args[0][0], 'generateMinefield dummy return value.');
      });
    });

    describe('endGame', function () {
      let dispatchStub;
      let props;

      beforeEach(function () {
        doubles.actionCreators.endGame.returns('endGame return value.');
        dispatchStub = sandbox.stub();
        props = mapDispatchToProps(dispatchStub);
      });

      it('should return void', function () {
        assert.strictEqual(props.endGame(), undefined);
      });
      
      it('should call the endGame() action creator once', function () {
        props.endGame();
        assert.strictEqual(doubles.actionCreators.endGame.callCount, 1);
      });
      
      it('should call the endGame() action creator with no arguments', function () {
        props.endGame();
        assert.strictEqual(doubles.actionCreators.endGame.args[0].length, 0);
      });
      
      it('should call dispatch() once', function () {
        props.endGame();
        assert.strictEqual(dispatchStub.callCount, 1);
      });
      
      it('should call dispatch() with 1 argument', function () {
        props.endGame();
        assert.strictEqual(dispatchStub.args[0].length, 1);
      });
      
      it('should call dispatch() with the return value of endGame() as the argument', function () {
        doubles.actionCreators.endGame.returns('endGame fake return value.');
        props.endGame();
        assert.strictEqual(dispatchStub.args[0][0], 'endGame fake return value.');
      });
    });

    describe('newGame', function () {
      let dispatchStub;
      let props;

      beforeEach(function () {
        doubles.actionCreators.showNewGameSetup.returns('showNewGameSetup return value.');
        dispatchStub = sandbox.stub();
        props = mapDispatchToProps(dispatchStub);
      });

      it('should return void', function () {
        assert.strictEqual(props.newGame(), undefined);
      });
      
      it('should call the showNewGameSetup() action creator once', function () {
        props.newGame();
        assert.strictEqual(doubles.actionCreators.showNewGameSetup.callCount, 1);
      });
      
      it('should call the showNewGameSetup() action creator with no arguments', function () {
        props.newGame();
        assert.strictEqual(doubles.actionCreators.showNewGameSetup.args[0].length, 0);
      });
      
      it('should call dispatch() once', function () {
        props.newGame();
        assert.strictEqual(dispatchStub.callCount, 1);
      });
      
      it('should call dispatch() with 1 argument', function () {
        props.newGame();
        assert.strictEqual(dispatchStub.args[0].length, 1);
      });
      
      it('should call dispatch() with the return value of showNewGameSetup() as the argument', function () {
        doubles.actionCreators.showNewGameSetup.returns('showNewGameSetup fake return value.');
        props.newGame();
        assert.strictEqual(dispatchStub.args[0][0], 'showNewGameSetup fake return value.');
      });
    });
  });
});