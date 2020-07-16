'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const react = require("react");
const tileComponent = require('../../../src/js/components/Tile.js');

describe('Minefield Component', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyMinefield;

  beforeEach(function () {
    doubles = {
      createElementStub: sandbox.stub(react, 'createElement'),
      setStateStub: sandbox.stub(),
      tileStub: sandbox.stub(tileComponent),
      addEventListener: sandbox.stub(),
      removeEventListener: sandbox.stub(),
    };
    global.window = {
      addEventListener: doubles.addEventListener,
      removeEventListener: doubles.removeEventListener,
    };
    proxyMinefield = proxyquire('../../../src/js/components/Minefield.js', {
      'react': react,
      './Tile': doubles.tileStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
    delete global.window;
  });

  describe('constructor()', function () {
    it('should set the initial value for state.smallestViewportDimension to "height"', function () {
      const component = new proxyMinefield.Minefield({});
      assert.deepEqual(component.state, { smallestViewportDimension: 'height' });
    });
  });

  describe('componentDidMount()', function () {
    let component;

    beforeEach(function () {
      component = new proxyMinefield.Minefield({});
      component.setState = doubles.setStateStub;

      component.componentDidMount();
    });

    it('should call "addEventListener", on the window object, once', function () {
      assert.strictEqual(doubles.addEventListener.callCount, 1);
    });

    it('should call "addEventListener", on the window object, 2 arguments', function () {
      assert.strictEqual(doubles.addEventListener.args[0].length, 2);
    });

    describe('1st argument provided to "addEventListener", on the window object', function () {
      it('should be the string "resize"', function () {
        assert.strictEqual(doubles.addEventListener.args[0][0], 'resize');
      });
    });

    describe('2nd argument provided to "addEventListener", on the window object', function () {
      it('should be a function', function () {
        assert.typeOf(doubles.addEventListener.args[0][1], 'function');
      });

      describe('executing the argument', function () {
        it('should return void', function () {
          assert.isUndefined(doubles.addEventListener.args[0][1]());
        });

        it('should not call the component\'s setState()', function () {
          doubles.addEventListener.args[0][1]();
          assert.strictEqual(doubles.setStateStub.callCount, 0);
        });

        describe('if the viewport\'s smallest dimentsion is the "width"', function () {
          beforeEach(function () {
            global.window.innerWidth = 50;
            global.window.innerHeight = 51;
          });

          describe('if the component\'s state has "width" as the smallest dimension', function () {
            it('should not call the component\'s setState()', function () {
              component.state.smallestViewportDimension = 'width';

              doubles.addEventListener.args[0][1]();
              assert.strictEqual(doubles.setStateStub.callCount, 0);
            });
          });
          
          describe('if the component\'s state has "height" as the smallest dimension', function () {
            it('should call the component\'s setState() once', function () {
              component.state.smallestViewportDimension = 'height';

              doubles.addEventListener.args[0][1]();
              assert.strictEqual(doubles.setStateStub.callCount, 1);
            });
            
            it('should call the component\'s setState() with 1 argument', function () {
              component.state.smallestViewportDimension = 'height';

              doubles.addEventListener.args[0][1]();
              assert.strictEqual(doubles.setStateStub.args[0].length, 1);
            });

            describe('1st argument provided to setState()', function () {
              it('should be an object with the "smallestViewportDimension" property set to "width"', function () {
                component.state.smallestViewportDimension = 'height';
  
                doubles.addEventListener.args[0][1]();
                assert.deepEqual(
                  doubles.setStateStub.args[0][0],
                  { smallestViewportDimension: 'width' }
                );
              });
            });
          });
        });

        describe('if the viewport\'s smallest dimentsion is the "height"', function () {
          beforeEach(function () {
            global.window.innerWidth = 150;
            global.window.innerHeight = 140;
          });

          describe('if the component\'s state has "height" as the smallest dimension', function () {
            it('should not call the component\'s setState()', function () {
              component.state.smallestViewportDimension = 'height';

              doubles.addEventListener.args[0][1]();
              assert.strictEqual(doubles.setStateStub.callCount, 0);
            });
          });
          
          describe('if the component\'s state has "width" as the smallest dimension', function () {
            it('should call the component\'s setState() once', function () {
              component.state.smallestViewportDimension = 'width';

              doubles.addEventListener.args[0][1]();
              assert.strictEqual(doubles.setStateStub.callCount, 1);
            });
            
            it('should call the component\'s setState() with 1 argument', function () {
              component.state.smallestViewportDimension = 'width';

              doubles.addEventListener.args[0][1]();
              assert.strictEqual(doubles.setStateStub.args[0].length, 1);
            });

            describe('1st argument provided to setState()', function () {
              it('should be an object with the "smallestViewportDimension" property set to "height"', function () {
                component.state.smallestViewportDimension = 'width';
  
                doubles.addEventListener.args[0][1]();
                assert.deepEqual(
                  doubles.setStateStub.args[0][0],
                  { smallestViewportDimension: 'height' }
                );
              });
            });
          });
        });
      });
    });
  });

  describe('componentWillUnmount()', function () {
    let component;

    beforeEach(function () {
      component = new proxyMinefield.Minefield({});
      component.setState = doubles.setStateStub;

      component.componentWillUnmount();
    });

    it('should call "removeEventListener", on the window object, once', function () {
      assert.strictEqual(doubles.removeEventListener.callCount, 1);
    });

    it('should call "removeEventListener", on the window object, 2 arguments', function () {
      assert.strictEqual(doubles.removeEventListener.args[0].length, 2);
    });

    describe('1st argument provided to "removeEventListener", on the window object', function () {
      it('should be the string "resize"', function () {
        assert.strictEqual(doubles.removeEventListener.args[0][0], 'resize');
      });
    });
    
    describe('2nd argument provided to "removeEventListener", on the window object', function () {
      it('should be the same function provided to addEventListener(), in the componentDidMount() method', function () {
        component.componentDidMount();
        assert.strictEqual(doubles.removeEventListener.args[0][1], doubles.addEventListener.args[0][1]);
      });
    });
  });

  describe('render()', function () {
    const testProps = {};
    let component;

    beforeEach(function () {
      testProps.gameEnded = false;
      testProps.dimensions = { rows: 3, cols: 2 };
      testProps.minefield = [
        { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        { id: '1', row: 0, col: 1, revealed: true, hasMine: true, hasFlag: true, numAdjacentMines: 5 },
        { id: '2', row: 1, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        { id: '3', row: 1, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        { id: '4', row: 2, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
        { id: '5', row: 2, col: 1, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
      ];
      testProps.handleLeftClick = sandbox.stub();
      testProps.handleRightClick = sandbox.stub();
      testProps.handleBothClick = sandbox.stub();

      component = new proxyMinefield.Minefield(testProps);
    });

    it('should return the result of the last call to React.createElement()', function () {
      doubles.createElementStub.onCall(testProps.minefield.length).returns('Minefield component');
      assert.strictEqual(component.render(), 'Minefield component');
    });

    it('should return a div element', function () {
      component.render();
      assert.strictEqual(
        doubles.createElementStub.args[testProps.minefield.length][0],
        'div'
      );
    });
    
    it('should return a div element with the correct properties', function () {
      component.render();
      assert.deepEqual(
        doubles.createElementStub.args[testProps.minefield.length][1],
        {
          id: 'minefield',
          className: 'height-rf',
          style: {
            gridAutoRows: `calc(100% / ${testProps.dimensions.rows})`,
            gridAutoColumns: `calc(100% / ${testProps.dimensions.cols})`,
          },
        }
      );
    });

    describe('if the dimensions of the minefield have more columns than rows', function () {
      beforeEach(function () {
        testProps.dimensions = { rows: 2, cols: 5 };
      });

      it('should add "expert" to the className property of the returned div', function () {
        component.render();
        assert.strictEqual(
          doubles.createElementStub.args[testProps.minefield.length][1].className,
          'height-rf expert'
        );
      });
    });

    describe('returned div children elements', function () {
      beforeEach(function () {
        testProps.dimensions = { rows: 1, cols: 2 };
        testProps.minefield = [
          { id: '0', row: 0, col: 0, revealed: false, hasMine: false, hasFlag: false, numAdjacentMines: 0 },
          { id: '1', row: 0, col: 1, revealed: true, hasMine: true, hasFlag: true, numAdjacentMines: 5 },
        ];

        doubles.createElementStub.onCall(0).returns('child 1');
        doubles.createElementStub.onCall(1).returns('child 2');
      });

      it('should return the correct number of children elements', function () {
        component.render();
        assert.deepEqual(
          doubles.createElementStub.args[testProps.minefield.length][2],
          [ 'child 1', 'child 2' ]
        );
      });

      it('should create the first child element with the correct props', function () {
        component.render();
        assert.deepEqual(
          doubles.createElementStub.args[0],
          [
            doubles.tileStub.Tile,
            {
              key: '0',
              id: '0',
              revealed: false,
              hasMine: false,
              hasFlag: false,
              numAdjacentMines: 0,
              lastInRow: false,
              styles: {
                gridRow: 1,
                gridColumn: 1,
              },
              clickHandlers: {
                handleLeftClick: testProps.handleLeftClick,
                handleRightClick: testProps.handleRightClick,
                handleBothClick: testProps.handleBothClick,
              },
            }
          ]
        );
      });
      
      it('should create the second child element with the correct props', function () {
        component.render();
        assert.deepEqual(
          doubles.createElementStub.args[1],
          [
            doubles.tileStub.Tile,
            {
              key: '1',
              id: '1',
              revealed: true,
              hasMine: true,
              hasFlag: true,
              numAdjacentMines: 5,
              lastInRow: true,
              styles: {
                gridRow: 1,
                gridColumn: 2,
              },
              clickHandlers: {
                handleLeftClick: testProps.handleLeftClick,
                handleRightClick: testProps.handleRightClick,
                handleBothClick: testProps.handleBothClick,
              },
            }
          ]
        );
      });

      describe('if the game has ended', function () {
        beforeEach(function () {
          testProps.gameEnded = true;
        });

        it('should set the "revealed" property of the first child element to "true"', function () {
          component.render();
          assert.strictEqual(doubles.createElementStub.args[0][1].revealed, true);
        });
        
        it('should set the "revealed" property of the second child element to "true"', function () {
          component.render();
          assert.strictEqual(doubles.createElementStub.args[1][1].revealed, true);
        });
      });
    });
  });
});