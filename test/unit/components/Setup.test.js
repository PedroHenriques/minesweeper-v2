'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const react = require("react");
const difficulty = require('../../../src/js/components/Setup/Difficulty.js');
const flagsEnabled = require('../../../src/js/components/Setup/FlagsEnabled.js');
const numberLives = require('../../../src/js/components/Setup/NumberLives.js');
const gameSeed = require('../../../src/js/components/Setup/GameSeed.js');
const stylishButton = require('../../../src/js/components/StylishButton.js');
const setupUtils = require('../../../src/js/utils/SetupUtils.js');

describe('Setup', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxySetup;
  let testData;

  beforeEach(function () {
    testData = {};
    doubles = {};
    doubles.createElementStub = sandbox.stub(react, 'createElement');
    doubles.setStateStub = sandbox.stub();
    doubles.difficultyStub = sandbox.stub(difficulty);
    doubles.flagsEnabledStub = sandbox.stub(flagsEnabled);
    doubles.numberLivesStub = sandbox.stub(numberLives);
    doubles.gameSeedStub = sandbox.stub(gameSeed);
    doubles.stylishButtonStub = sandbox.stub(stylishButton);
    doubles.setupUtilsStub = sandbox.stub(setupUtils);
    proxySetup = proxyquire('../../../src/js/components/Setup.js', {
      'react': react,
      './Setup/Difficulty': doubles.difficultyStub,
      './Setup/FlagsEnabled': doubles.flagsEnabledStub,
      './Setup/NumberLives': doubles.numberLivesStub,
      './Setup/GameSeed': doubles.gameSeedStub,
      './StylishButton': doubles.stylishButtonStub,
      '../data': testData,
      '../utils/SetupUtils': doubles.setupUtilsStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('constructor()', function () {
    let setup = null;

    beforeEach(function () {
      setup = new proxySetup.Setup({});
    });

    it('should set the initial value for the "difficulty" state property', function () {
      assert.strictEqual(setup.state.difficulty, 0);
    });
    
    it('should set the initial value for the "flagsEnabled" state property', function () {
      assert.strictEqual(setup.state.flagsEnabled, true);
    });

    it('should set the initial value for the "numLives" state property', function () {
      assert.strictEqual(setup.state.numLives, 1);
    });

    it('should set the initial value for the "gameMode" state property', function () {
      assert.strictEqual(setup.state.gameMode, 'classic');
    });

    describe('"gameSeed" state property', function () {
      beforeEach(function () {
        doubles.setupUtilsStub.generateSeed.resetHistory();
        doubles.setupUtilsStub.generateSeed.returns('game seed');

        setup = new proxySetup.Setup({});
      });

      it('should call SetupUtils generateSeed() once', function () {
        assert.isTrue(doubles.setupUtilsStub.generateSeed.calledOnce);
      });

      it('should call SetupUtils generateSeed() with the correct arguments', function () {
        assert.deepEqual(doubles.setupUtilsStub.generateSeed.args[0], []);
      });

      it('should set the initial value for the "gameSeed" state property', function () {
        assert.strictEqual(setup.state.gameSeed, 'game seed');
      });
    });
  });

  describe('handleChange()', function () {
    let setup = null;

    beforeEach(function () {
      setup = new proxySetup.Setup({});
      setup.setState = doubles.setStateStub;
    });

    it('should return void', function () {
      assert.isUndefined(setup.handleChange({ target: { id: 'irrelevant id' } }));
    });

    describe('if the event target element has ID "difficulty"', function () {
      const event = {};

      beforeEach(function () {
        event.target = {
          id: 'difficulty',
        };

        testData.difficulties = [{}, {}];
      });

      it('should call setState() once', function () {
        event.target.selectedIndex = 0;
        setup.handleChange(event);
        assert.isTrue(doubles.setStateStub.calledOnce);
      });
      
      it('should call setState() with the correct arguments', function () {
        event.target.selectedIndex = 1;
        setup.handleChange(event);
        assert.deepEqual(doubles.setStateStub.args[0], [{ difficulty: 1 }]);
      });

      describe('if the event target element does not have a "selectedIndex" property', function () {
        beforeEach(function () {
          delete event.target.selectedIndex;
        });

        it('should return void', function () {
          assert.isUndefined(setup.handleChange(event));
        });
      });

      describe('if the event target element does not have a "selectedIndex" property', function () {
        beforeEach(function () {
          event.target.selectedIndex = 200;
          testData.difficulties = [];
        });

        it('should return void', function () {
          assert.isUndefined(setup.handleChange(event));
        });
      });
    });

    describe('if the event target element has ID "flags-enabled"', function () {
      const event = {};

      beforeEach(function () {
        event.target = {
          id: 'flags-enabled',
        };
      });

      it('should call setState() once', function () {
        event.target.checked = true;
        setup.handleChange(event);
        assert.isTrue(doubles.setStateStub.calledOnce);
      });
      
      it('should call setState() with the correct arguments', function () {
        event.target.checked = false;
        setup.handleChange(event);
        assert.deepEqual(doubles.setStateStub.args[0], [{ flagsEnabled: false }]);
      });

      describe('if the event target element does not have a "checked" property', function () {
        beforeEach(function () {
          delete event.target.checked;
        });

        it('should return void', function () {
          assert.isUndefined(setup.handleChange(event));
        });
      });
    });

    describe('if the event target element has ID "number-lives"', function () {
      const event = {};

      beforeEach(function () {
        event.target = {
          id: 'number-lives',
        };
      });

      it('should call setState() once', function () {
        event.target.type = 'number';
        event.target.value = '1';
        setup.handleChange(event);
        assert.isTrue(doubles.setStateStub.calledOnce);
      });
      
      it('should call setState() with the correct arguments', function () {
        event.target.type = 'text';
        event.target.value = '7';
        setup.handleChange(event);
        assert.deepEqual(doubles.setStateStub.args[0], [{ numLives: 7 }]);
      });

      describe('if the event target element does not have a "type" property', function () {
        beforeEach(function () {
          delete event.target.type;
        });

        it('should return void', function () {
          assert.isUndefined(setup.handleChange(event));
        });

        it('should not call setState()', function () {
          assert.isTrue(doubles.setStateStub.notCalled);
        });
      });

      describe('if the event target element "type" property is not equal to "number" or "text"', function () {
        beforeEach(function () {
          event.target.type = 'checkbox';
          event.target.checked = true;
        });

        it('should return void', function () {
          assert.isUndefined(setup.handleChange(event));
        });

        it('should not call setState()', function () {
          assert.isTrue(doubles.setStateStub.notCalled);
        });
      });

      describe('if the event target element "value" property casts to an integer lower than one', function () {
        beforeEach(function () {
          event.target.value = '0';
        });

        it('should return void', function () {
          assert.isUndefined(setup.handleChange(event));
        });

        it('should not call setState()', function () {
          assert.isTrue(doubles.setStateStub.notCalled);
        });
      });
    });

    describe('if the event target element has ID "game-seed"', function () {
      const event = {};

      beforeEach(function () {
        event.target = {
          id: 'game-seed',
          type: 'text',
          value: '',
        };
      });

      it('should call setState() once', function () {
        setup.handleChange(event);
        assert.isTrue(doubles.setStateStub.calledOnce);
      });
      
      it('should call setState() with the correct arguments', function () {
        event.target.value = 'test seed';
        setup.handleChange(event);
        assert.deepEqual(doubles.setStateStub.args[0], [{ gameSeed: 'test seed' }]);
      });

      describe('if the event target element is not of the type "text"', function () {
        beforeEach(function () {
          event.target.type = 'number';
          event.target.value = '5';
        });

        it('should return void', function () {
          assert.isUndefined(setup.handleChange(event));
        });

        it('should not call setState()', function () {
          assert.isTrue(doubles.setStateStub.notCalled);
        });
      });
    });
  });

  describe('handleStart()', function () {
    const props = {};
    let setup = null;

    beforeEach(function () {
      testData.difficulties = [
        { name: 'Beginner', rows: 9, cols: 9, mines: 10 },
        { name: 'Intermediate', rows: 16, cols: 16, mines: 40 },
      ];

      props.onStart = sandbox.stub();
      setup = new proxySetup.Setup(props);
      setup.state = {
        difficulty: 1,
        flagsEnabled: true,
        numLives: 2,
        gameSeed: 'game seed',
        gameMode: 'game mode',
      };
    });

    it('should return void', function () {
      assert.isUndefined(setup.handleStart());
    });

    it('should call onStart() props callback once', function () {
      setup.handleStart();
      assert.isTrue(props.onStart.calledOnce);
    });

    it('should call onStart() props callback with the correct arguments', function () {
      setup.handleStart();
      assert.deepEqual(props.onStart.args[0], [{
        numMines: 40,
        dimensions: { rows: 16, cols: 16 },
        flagsEnabled: true,
        numLives: 2,
        gameSeed: 'game seed',
        gameMode: 'game mode',
      }]);
    });
  });

  describe('handleGenerateSeed()', function () {
    let setup = null;

    beforeEach(function () {
      doubles.setupUtilsStub.generateSeed.returns('initial seed');

      setup = new proxySetup.Setup({ onStart: sandbox.stub() });
      setup.setState = doubles.setStateStub;

      doubles.setupUtilsStub.generateSeed.resetHistory();
      doubles.setupUtilsStub.generateSeed.returns('new random seed');
    });

    it('should return void', function () {
      assert.isUndefined(setup.handleGenerateSeed());
    });

    it('should call setState() once', function () {
      setup.handleGenerateSeed();
      assert.isTrue(doubles.setStateStub.calledOnce);
    });

    it('should call setState() with the correct arguments', function () {
      setup.handleGenerateSeed();
      assert.deepEqual(doubles.setStateStub.args[0], [{ gameSeed: 'new random seed' }]);
    });

    it('should call SetupUtils generateSeed() once', function () {
      setup.handleGenerateSeed();
      assert.isTrue(doubles.setupUtilsStub.generateSeed.calledOnce);
    });

    it('should call SetupUtils generateSeed() with the correct arguments', function () {
      setup.handleGenerateSeed();
      assert.deepEqual(doubles.setupUtilsStub.generateSeed.args[0], []);
    });
  });

  describe('render()', function () {
    let setup = null;

    beforeEach(function () {
      doubles.createElementStub.onCall(0).returns('Difficulty component.');
      doubles.createElementStub.onCall(1).returns('Flags component.');
      doubles.createElementStub.onCall(2).returns('Lives component.');
      doubles.createElementStub.onCall(3).returns('Seed component.');
      doubles.createElementStub.onCall(4).returns('Start component.');
      doubles.createElementStub.onCall(5).returns('Setup component.');

      setup = new proxySetup.Setup({});
    });

    describe('the wrapper element', function () {
      it('should call React createElement() with a "div" tag with its properties and children', function () {
        setup.render();
        assert.deepEqual(
          doubles.createElementStub.args[5],
          [
            'div', { id: 'setup' }, 'Difficulty component.', 'Flags component.',
            'Lives component.', 'Seed component.', 'Start component.'
          ]
        );
      });
    });

    describe('the Difficulty Component', function () {
      beforeEach(function () {
        setup.state = { difficulty: 8 };
      });

      it('should call React createElement() with a "Difficulty" tag with its properties', function () {
        setup.render();
        assert.deepEqual(
          doubles.createElementStub.args[0],
          [doubles.difficultyStub.Difficulty, { value: 8, onChange: setup.handleChange }]
        );
      });
    });

    describe('the FlagsEnabled Component', function () {
      beforeEach(function () {
        setup.state = { flagsEnabled: true };
      });

      it('should call React createElement() with a "FlagsEnabled" tag with its properties', function () {
        setup.render();
        assert.deepEqual(
          doubles.createElementStub.args[1],
          [doubles.flagsEnabledStub.FlagsEnabled, { checked: true, onChange: setup.handleChange }]
        );
      });
      
      describe('if the Setup component "flagsEnabled" state property is FALSE', function () {
        beforeEach(function () {
          setup.state.flagsEnabled = false;
        });

        it('should call React createElement() with the "checked" prop property as FALSE', function () {
          setup.render();
          assert.deepEqual(
            doubles.createElementStub.args[1],
            [doubles.flagsEnabledStub.FlagsEnabled, { checked: false, onChange: setup.handleChange }]
          );
        });
      });
    });

    describe('the NumberLives Component', function () {
      beforeEach(function () {
        setup.state = { numLives: 5 };
      });

      it('should call React createElement() with a "NumberLives" tag with its properties', function () {
        setup.render();
        assert.deepEqual(
          doubles.createElementStub.args[2],
          [doubles.numberLivesStub.NumberLives, { value: 5, onChange: setup.handleChange }]
        );
      });
    });

    describe('the GameSeed Component', function () {
      beforeEach(function () {
        setup.state = { gameSeed: 'game seed' };
      });

      it('should call React createElement() with a "GameSeed" tag with its properties', function () {
        setup.render();
        assert.deepEqual(
          doubles.createElementStub.args[3],
          [doubles.gameSeedStub.GameSeed, { value: 'game seed', onChange: setup.handleChange, onGenerate: setup.handleGenerateSeed }]
        );
      });
    });

    describe('the StylishButton Component', function () {
      beforeEach(function () {
        setup.state = { gameSeed: 'game seed' };
      });

      it('should call React createElement() with a "StylishButton" tag with its properties', function () {
        setup.render();
        assert.deepEqual(
          doubles.createElementStub.args[4],
          [
            doubles.stylishButtonStub.StylishButton,
            { id: 'start-button', text: 'Start Game', events: { onClick: setup.handleStart } }
          ]
        );
      });
    });
  });
});