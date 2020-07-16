'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const react = require('react');
const stylishButton = require('../../../src/js/components/StylishButton.js');

describe('Notification', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyNotification;

  beforeEach(function () {
    doubles = {};
    doubles.createElementStub = sandbox.stub(react, 'createElement');
    doubles.setStateStub = sandbox.stub();
    doubles.stylishButtonStub = sandbox.stub(stylishButton);
    proxyNotification = proxyquire('../../../src/js/components/Notification.js', {
      'react': react,
      './StylishButton': doubles.stylishButtonStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('constructor()', function () {
    it('should set the initial state', function () {
      const notification = new proxyNotification.Notification({});

      assert.deepEqual(notification.state, { hideNotif: false });
    });
  });

  describe('handleHide()', function () {
    let notification = null;

    beforeEach(function () {
      notification = new proxyNotification.Notification({});
      notification.setState = doubles.setStateStub;
    });

    it('should return void', function () {
      assert.isUndefined(notification.handleHide());
    });

    it('should call setState() once', function () {
      notification.handleHide();
      assert.isTrue(doubles.setStateStub.calledOnce);
    });

    it('should update the hideNotif state property to true', function () {
      notification.handleHide();
      assert.deepEqual(doubles.setStateStub.args[0], [{ hideNotif: true }]);
    });
  });

  describe('render()', function () {
    const props = {};
    let notification = null;

    beforeEach(function () {
      doubles.createElementStub.onCall(0).returns('p notif text elem.');
      doubles.createElementStub.onCall(1).returns('StylishButton component.');
      doubles.createElementStub.onCall(2).returns('Notification content.');

      notification = new proxyNotification.Notification(props);
    });

    it('should call React createElement() with a "p" tag with its properties and children', function () {
      props.notifText = 'notification text.';
      notification.render();

      assert.deepEqual(
        doubles.createElementStub.args[0],
        ['p', null, 'notification text.']
      );
    });
    
    it('should call React createElement() with a "StylishButton" tag with its properties', function () {
      notification.render();

      assert.deepEqual(
        doubles.createElementStub.args[1],
        [doubles.stylishButtonStub.StylishButton, { id: 'notification-ok', text: 'Ok', events: { onClick: notification.handleHide } }]
      );
    });
    
    it('should call React createElement() with a "div" tag with its properties and children', function () {
      props.id = 'notification id.';
      notification.render();

      assert.deepEqual(
        doubles.createElementStub.args[2],
        ['div', { id: 'notification id.', className: 'notification-box' }, 'p notif text elem.', 'StylishButton component.']
      );
    });

    it('should return the wrapper "div" HTML element', function () {
      assert.strictEqual(notification.render(), 'Notification content.');
    });

    describe('if the notification is hidden', function () {
      const props = {};
      let notification = null;

      beforeEach(function () {
        notification = new proxyNotification.Notification(props);
        notification.state = { hideNotif: true };
      });

      it('should return an empty string', function () {
        assert.strictEqual(notification.render(), '');
      });
    });
  });
});