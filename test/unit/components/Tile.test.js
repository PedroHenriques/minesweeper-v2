'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const react = require("react");

describe('Tile', function () {
  const sandbox = sinon.createSandbox();
  let fakeClock;
  let doubles;
  let proxyTile;

  beforeEach(function () {
    fakeClock = sinon.useFakeTimers();
    doubles = {};
    doubles.createElementStub = sandbox.stub(react, 'createElement');
    proxyTile = proxyquire('../../../src/js/components/Tile.js', {
      'react': react,
    });
  });

  afterEach(function () {
    sandbox.restore();
    fakeClock.restore();
  });

  describe('onMouseUp()', function () {
    const props = {};
    let tile = null;

    beforeEach(function () {
      props.id = 1;
      props.clickHandlers = {
          handleLeftClick: sandbox.stub(),
          handleRightClick: sandbox.stub(),
          handleBothClick: sandbox.stub(),
      };
      tile = new proxyTile.Tile(props);
    });

    it('should return void', function () {
      assert.isUndefined(tile.onMouseUp(-1, -1));
    });

    it('should not call the handleLeftClick() prop callback', function () {
      assert.isTrue(props.clickHandlers.handleLeftClick.notCalled);
    });
    
    it('should not call the handleRightClick() prop callback', function () {
      assert.isTrue(props.clickHandlers.handleRightClick.notCalled);
    });

    it('should not call the handleBothClick() prop callback', function () {
      assert.isTrue(props.clickHandlers.handleBothClick.notCalled);
    });

    describe('if the released button is the LMB', function () {
      describe('if there are no other mouse buttons being held down', function () {
        describe('if there is no pending timeout', function () {
          it('should return void', function () {
            assert.isUndefined(tile.onMouseUp(0, 0));
          });

          it('should call the handleLeftClick() prop callback once', function () {
            tile.onMouseUp(0, 0);
            assert.isTrue(props.clickHandlers.handleLeftClick.calledOnce);
          });

          it('should call the handleLeftClick() prop callback with the correct arguments', function () {
            tile.onMouseUp(0, 0);
            assert.deepEqual(props.clickHandlers.handleLeftClick.args[0], [props.id]);
          });

          it('should not call the handleRightClick() prop callback', function () {
            tile.onMouseUp(0, 0);
            assert.isTrue(props.clickHandlers.handleRightClick.notCalled);
          });
          
          it('should not call the handleBothClick() prop callback', function () {
            tile.onMouseUp(0, 0);
            assert.isTrue(props.clickHandlers.handleBothClick.notCalled);
          });
        });

        describe('if there is a pending timeout', function () {
          beforeEach(function () {
            tile.timeoutId = global.setTimeout(sinon.stub(), 1000);
          });

          it('should return void', function () {
            assert.isUndefined(tile.onMouseUp(0, 0));
          });

          it('should clear the pending timeout', function () {
            assert.strictEqual(Object.getOwnPropertyNames(fakeClock.timers).length, 1);
            tile.onMouseUp(0, 0);
            assert.strictEqual(Object.getOwnPropertyNames(fakeClock.timers).length, 0);
          });

          it('should call the handleBothClick() prop callback once', function () {
            tile.onMouseUp(0, 0);
            assert.isTrue(props.clickHandlers.handleBothClick.calledOnce);
          });

          it('should call the handleBothClick() prop callback with the correct arguments', function () {
            tile.onMouseUp(0, 0);
            assert.deepEqual(props.clickHandlers.handleBothClick.args[0], [props.id]);
          });

          it('should not call the handleLeftClick() prop callback', function () {
            tile.onMouseUp(0, 0);
            assert.isTrue(props.clickHandlers.handleLeftClick.notCalled);
          });

          it('should not call the handleRightClick() prop callback', function () {
            tile.onMouseUp(0, 0);
            assert.isTrue(props.clickHandlers.handleRightClick.notCalled);
          });
        });
      });

      describe('if RMB is being held down', function () {
        it('should return void', function () {
          assert.isUndefined(tile.onMouseUp(0, 2));
        });

        it('should register a timer', function () {
          assert.strictEqual(fakeClock.timers, undefined);
          tile.onMouseUp(0, 2);
          assert.strictEqual(Object.getOwnPropertyNames(fakeClock.timers).length, 1);
        });

        it('should register a timeout', function () {
          tile.onMouseUp(0, 2);
          const timerIds = Object.getOwnPropertyNames(fakeClock.timers);
          assert.strictEqual(fakeClock.timers[timerIds[0]].type, 'Timeout');
        });

        it('should register a timeout with 500ms delay', function () {
          tile.onMouseUp(0, 2);
          const timerIds = Object.getOwnPropertyNames(fakeClock.timers);
          assert.strictEqual(fakeClock.timers[timerIds[0]].delay, 500);
        });

        it('should register a timeout with the correct arguments', function () {
          tile.onMouseUp(0, 2);
          const timerIds = Object.getOwnPropertyNames(fakeClock.timers);
          assert.deepEqual(fakeClock.timers[timerIds[0]].args, []);
        });

        describe('timeout callback', function () {
          it('should set the timeoutId property to null', function () {
            tile.onMouseUp(0, 2);
            const timerIds = Object.getOwnPropertyNames(fakeClock.timers);
            fakeClock.timers[timerIds[0]].func();
            assert.isNull(tile.timeoutId);
          });

          it('should call the handleLeftClick() prop callback once', function () {
            tile.onMouseUp(0, 2);
            const timerIds = Object.getOwnPropertyNames(fakeClock.timers);
            fakeClock.timers[timerIds[0]].func();
            assert.isTrue(props.clickHandlers.handleLeftClick.calledOnce);
          });
          
          it('should call the handleLeftClick() prop callback with the correct arguments', function () {
            tile.onMouseUp(0, 2);
            const timerIds = Object.getOwnPropertyNames(fakeClock.timers);
            fakeClock.timers[timerIds[0]].func();
            assert.deepEqual(props.clickHandlers.handleLeftClick.args[0], [props.id]);
          });
        });
      });
    });

    describe('if the released button is the RMB', function () {
      describe('if there are no other mouse buttons being held down', function () {
        describe('if there is no pending timeout', function () {
          it('should return void', function () {
            assert.isUndefined(tile.onMouseUp(2, 0));
          });

          it('should call the handleRightClick() prop callback once', function () {
            tile.onMouseUp(2, 0);
            assert.isTrue(props.clickHandlers.handleRightClick.calledOnce);
          });

          it('should call the handleRightClick() prop callback with the correct arguments', function () {
            tile.onMouseUp(2, 0);
            assert.deepEqual(props.clickHandlers.handleRightClick.args[0], [props.id]);
          });
        });

        describe('if there is a pending timeout', function () {
          beforeEach(function () {
            tile.timeoutId = global.setTimeout(sinon.stub(), 1000);
          });

          it('should return void', function () {
            assert.isUndefined(tile.onMouseUp(2, 0));
          });

          it('should clear the pending timeout', function () {
            assert.strictEqual(Object.getOwnPropertyNames(fakeClock.timers).length, 1);
            tile.onMouseUp(2, 0);
            assert.strictEqual(Object.getOwnPropertyNames(fakeClock.timers).length, 0);
          });

          it('should call the handleBothClick() prop callback once', function () {
            tile.onMouseUp(2, 0);
            assert.isTrue(props.clickHandlers.handleBothClick.calledOnce);
          });

          it('should call the handleBothClick() prop callback with the correct arguments', function () {
            tile.onMouseUp(2, 0);
            assert.deepEqual(props.clickHandlers.handleBothClick.args[0], [props.id]);
          });

          it('should not call the handleLeftClick() prop callback', function () {
            tile.onMouseUp(2, 0);
            assert.isTrue(props.clickHandlers.handleLeftClick.notCalled);
          });

          it('should not call the handleRightClick() prop callback', function () {
            tile.onMouseUp(2, 0);
            assert.isTrue(props.clickHandlers.handleRightClick.notCalled);
          });
        });
      });

      describe('if RMB is being held down', function () {
        it('should return void', function () {
          assert.isUndefined(tile.onMouseUp(2, 1));
        });

        it('should register a timer', function () {
          assert.strictEqual(fakeClock.timers, undefined);
          tile.onMouseUp(2, 1);
          assert.strictEqual(Object.getOwnPropertyNames(fakeClock.timers).length, 1);
        });

        it('should register a timeout', function () {
          tile.onMouseUp(2, 1);
          const timerIds = Object.getOwnPropertyNames(fakeClock.timers);
          assert.strictEqual(fakeClock.timers[timerIds[0]].type, 'Timeout');
        });

        it('should register a timeout with 500ms delay', function () {
          tile.onMouseUp(2, 1);
          const timerIds = Object.getOwnPropertyNames(fakeClock.timers);
          assert.strictEqual(fakeClock.timers[timerIds[0]].delay, 500);
        });

        it('should register a timeout with the correct arguments', function () {
          tile.onMouseUp(2, 1);
          const timerIds = Object.getOwnPropertyNames(fakeClock.timers);
          assert.deepEqual(fakeClock.timers[timerIds[0]].args, []);
        });

        describe('timeout callback', function () {
          it('should set the timeoutId property to null', function () {
            tile.onMouseUp(2, 1);
            const timerIds = Object.getOwnPropertyNames(fakeClock.timers);
            fakeClock.timers[timerIds[0]].func();
            assert.isNull(tile.timeoutId);
          });

          it('should call the handleRightClick() prop callback once', function () {
            tile.onMouseUp(2, 1);
            const timerIds = Object.getOwnPropertyNames(fakeClock.timers);
            fakeClock.timers[timerIds[0]].func();
            assert.isTrue(props.clickHandlers.handleRightClick.calledOnce);
          });
          
          it('should call the handleRightClick() prop callback with the correct arguments', function () {
            tile.onMouseUp(2, 1);
            const timerIds = Object.getOwnPropertyNames(fakeClock.timers);
            fakeClock.timers[timerIds[0]].func();
            assert.deepEqual(props.clickHandlers.handleRightClick.args[0], [props.id]);
          });
        });
      });
    });
  });

  describe('componentWillUnmount()', function () {
    describe('happy path', function () {
      let tile = null;

      beforeEach(function () {
        tile = new proxyTile.Tile({});
        tile.timeoutId = global.setTimeout(sandbox.stub(), 1000);
      });

      it('should return void', function () {
        assert.isUndefined(tile.componentWillUnmount());
      });

      it('should clear the pending timeout', function () {
        assert.strictEqual(Object.getOwnPropertyNames(fakeClock.timers).length, 1);
        tile.componentWillUnmount();
        assert.strictEqual(Object.getOwnPropertyNames(fakeClock.timers).length, 0);
      });
    });

    describe('if there is no pending timeout', function () {
      let tile = null;

      beforeEach(function () {
        tile = new proxyTile.Tile({});
        global.setTimeout(sandbox.stub(), 1000);
      });

      it('should return void', function () {
        assert.isUndefined(tile.componentWillUnmount());
      });

      it('should not clear the timeout', function () {
        assert.strictEqual(Object.getOwnPropertyNames(fakeClock.timers).length, 1);
        tile.componentWillUnmount();
        assert.strictEqual(Object.getOwnPropertyNames(fakeClock.timers).length, 1);
      });
    });
  });

  describe('render()', function () {
    const props = {};
    let tile = null;

    beforeEach(function () {
      props.id =  9;
      props.revealed =  false;
      props.hasMine =  false;
      props.hasFlag =  false;
      props.numAdjacentMines =  0;
      props.lastInRow =  false;
      props.styles =  {};
      props.clickHandlers = {};
      
      tile = new proxyTile.Tile(props);
    });

    describe('happy path', function () {
      it('should call React createElement() once', function () {
        tile.render();
        assert.strictEqual(doubles.createElementStub.callCount, 1);
      });
  
      it('should return the value of React createElement()', function () {
        doubles.createElementStub.returns('return value');
        assert.strictEqual(tile.render(), 'return value');
      });

      it('should call React createElement() with a "div" tag', function () {
        tile.render();
        assert.strictEqual(doubles.createElementStub.args[0][0], 'div');
      });
      
      describe('the "div" element', function () {
        it('should have an "id" property of "tile-" with the tile\'s ID', function () {
          props.id = 4;
          tile.render();
          assert.strictEqual(doubles.createElementStub.args[0][1].id, 'tile-4');
        });

        it('should have a "className" property of "tile"', function () {
          tile.render();
          assert.strictEqual(doubles.createElementStub.args[0][1].className, 'tile');
        });
        
        it('should have a "onMouseUp" property with a callback function', function () {
          tile.render();
          assert.typeOf(doubles.createElementStub.args[0][1].onMouseUp, 'function');
        });

        describe('the "onMouseUp" callback function', function () {
          beforeEach(function () {
            tile.onMouseUp = sandbox.stub();
            tile.render();
          });

          it('should call the class method "onMouseUp" once', function () {
            doubles.createElementStub.args[0][1].onMouseUp({ button: 8, buttons: 0 });
            assert.strictEqual(tile.onMouseUp.callCount, 1);
          });
          
          it('should call the class method "onMouseUp" with the correct arguments', function () {
            doubles.createElementStub.args[0][1].onMouseUp({ button: 3, buttons: 1 });
            assert.deepEqual(tile.onMouseUp.args[0], [ 3, 1 ]);
          });
        });

        it('should have a "onContextMenu" property with a callback function', function () {
          tile.render();
          assert.typeOf(doubles.createElementStub.args[0][1].onContextMenu, 'function');
        });

        describe('the "onContextMenu" callback function', function () {
          let preventDefaultStub = null;

          beforeEach(function () {
            preventDefaultStub = sandbox.stub();

            tile.render();
          });

          it('should call the preventDefault() on the provided event object once', function () {
            doubles.createElementStub.args[0][1].onContextMenu({ preventDefault: preventDefaultStub });
            assert.strictEqual(preventDefaultStub.callCount, 1);
          });

          it('should call the preventDefault() on the provided event object with the correct arguments', function () {
            doubles.createElementStub.args[0][1].onContextMenu({ preventDefault: preventDefaultStub });
            assert.deepEqual(preventDefaultStub.args[0], []);
          });
        });

        it('should have a "style" property with the value of props.styles', function () {
          props.styles = { testStyle: 'style 1', anotherStyle: 'style 2' };
          tile.render();
          assert.deepEqual(doubles.createElementStub.args[0][1].style, { testStyle: 'style 1', anotherStyle: 'style 2' });
        });

        it('should have no children', function () {
          tile.render();
          assert.strictEqual(doubles.createElementStub.args[0][2], '');
        });
      });
    });

    describe('if the tile is revealed', function () {
      beforeEach(function () {
        props.revealed = true;
      });

      it('should call React createElement() once', function () {
        tile.render();
        assert.strictEqual(doubles.createElementStub.callCount, 1);
      });
  
      it('should return the value of React createElement()', function () {
        doubles.createElementStub.returns('return value');
        assert.strictEqual(tile.render(), 'return value');
      });

      it('should call React createElement() with a "div" tag', function () {
        tile.render();
        assert.strictEqual(doubles.createElementStub.args[0][0], 'div');
      });
      
      describe('the "div" element', function () {
        it('should have an "id" property of "tile-" with the tile\'s ID', function () {
          props.id = 1;
          tile.render();
          assert.strictEqual(doubles.createElementStub.args[0][1].id, 'tile-1');
        });

        it('should have a "className" property of "tile revealed"', function () {
          tile.render();
          assert.strictEqual(doubles.createElementStub.args[0][1].className, 'tile revealed');
        });
        
        it('should have a "onMouseUp" property with a callback function', function () {
          tile.render();
          assert.typeOf(doubles.createElementStub.args[0][1].onMouseUp, 'function');
        });

        describe('the "onMouseUp" callback function', function () {
          beforeEach(function () {
            tile.onMouseUp = sandbox.stub();
            tile.render();
          });

          it('should call the class method "onMouseUp" once', function () {
            doubles.createElementStub.args[0][1].onMouseUp({ button: 8, buttons: 0 });
            assert.strictEqual(tile.onMouseUp.callCount, 1);
          });
          
          it('should call the class method "onMouseUp" with the correct arguments', function () {
            doubles.createElementStub.args[0][1].onMouseUp({ button: 3, buttons: 1 });
            assert.deepEqual(tile.onMouseUp.args[0], [ 3, 1 ]);
          });
        });

        it('should have a "onContextMenu" property with a callback function', function () {
          tile.render();
          assert.typeOf(doubles.createElementStub.args[0][1].onContextMenu, 'function');
        });

        describe('the "onContextMenu" callback function', function () {
          let preventDefaultStub = null;

          beforeEach(function () {
            preventDefaultStub = sandbox.stub();

            tile.render();
          });

          it('should call the preventDefault() on the provided event object once', function () {
            doubles.createElementStub.args[0][1].onContextMenu({ preventDefault: preventDefaultStub });
            assert.strictEqual(preventDefaultStub.callCount, 1);
          });

          it('should call the preventDefault() on the provided event object with the correct arguments', function () {
            doubles.createElementStub.args[0][1].onContextMenu({ preventDefault: preventDefaultStub });
            assert.deepEqual(preventDefaultStub.args[0], []);
          });
        });

        it('should have a "style" property with the value of props.styles', function () {
          props.styles = { testStyle: 'style 1', anotherStyle: 'style 2' };
          tile.render();
          assert.deepEqual(doubles.createElementStub.args[0][1].style, { testStyle: 'style 1', anotherStyle: 'style 2' });
        });

        it('should have no children', function () {
          tile.render();
          assert.strictEqual(doubles.createElementStub.args[0][2], '');
        });
      });
    });

    describe('if the tile is revealed and last in row', function () {
      beforeEach(function () {
        props.revealed = true;
        props.lastInRow = true;
      });

      it('should call React createElement() once', function () {
        tile.render();
        assert.strictEqual(doubles.createElementStub.callCount, 1);
      });
  
      it('should return the value of React createElement()', function () {
        doubles.createElementStub.returns('return value');
        assert.strictEqual(tile.render(), 'return value');
      });

      it('should call React createElement() with a "div" tag', function () {
        tile.render();
        assert.strictEqual(doubles.createElementStub.args[0][0], 'div');
      });
      
      describe('the "div" element', function () {
        it('should have an "id" property of "tile-" with the tile\'s ID', function () {
          props.id = 2;
          tile.render();
          assert.strictEqual(doubles.createElementStub.args[0][1].id, 'tile-2');
        });

        it('should have a "className" property of "tile revealed last-in-row"', function () {
          tile.render();
          assert.strictEqual(doubles.createElementStub.args[0][1].className, 'tile revealed last-in-row');
        });
        
        it('should have a "onMouseUp" property with a callback function', function () {
          tile.render();
          assert.typeOf(doubles.createElementStub.args[0][1].onMouseUp, 'function');
        });

        describe('the "onMouseUp" callback function', function () {
          beforeEach(function () {
            tile.onMouseUp = sandbox.stub();
            tile.render();
          });

          it('should call the class method "onMouseUp" once', function () {
            doubles.createElementStub.args[0][1].onMouseUp({ button: 8, buttons: 0 });
            assert.strictEqual(tile.onMouseUp.callCount, 1);
          });
          
          it('should call the class method "onMouseUp" with the correct arguments', function () {
            doubles.createElementStub.args[0][1].onMouseUp({ button: 3, buttons: 1 });
            assert.deepEqual(tile.onMouseUp.args[0], [ 3, 1 ]);
          });
        });

        it('should have a "onContextMenu" property with a callback function', function () {
          tile.render();
          assert.typeOf(doubles.createElementStub.args[0][1].onContextMenu, 'function');
        });

        describe('the "onContextMenu" callback function', function () {
          let preventDefaultStub = null;

          beforeEach(function () {
            preventDefaultStub = sandbox.stub();

            tile.render();
          });

          it('should call the preventDefault() on the provided event object once', function () {
            doubles.createElementStub.args[0][1].onContextMenu({ preventDefault: preventDefaultStub });
            assert.strictEqual(preventDefaultStub.callCount, 1);
          });

          it('should call the preventDefault() on the provided event object with the correct arguments', function () {
            doubles.createElementStub.args[0][1].onContextMenu({ preventDefault: preventDefaultStub });
            assert.deepEqual(preventDefaultStub.args[0], []);
          });
        });

        it('should have a "style" property with the value of props.styles', function () {
          props.styles = { testStyle: 'style 1', anotherStyle: 'style 2' };
          tile.render();
          assert.deepEqual(doubles.createElementStub.args[0][1].style, { testStyle: 'style 1', anotherStyle: 'style 2' });
        });

        it('should have no children', function () {
          tile.render();
          assert.strictEqual(doubles.createElementStub.args[0][2], '');
        });
      });
    });
  });
});