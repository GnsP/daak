function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function () {
  'use strict';

  var Receiver = function Receiver(condition, action) {
    _classCallCheck(this, Receiver);

    this.condition = condition;
    this.action = action;
    Receiver.counter += 1;
    this.id = Receiver.counter;
  };

  _defineProperty(Receiver, "matches", function (condition, object) {
    return typeof condition === 'function' && !!condition(object);
  });

  _defineProperty(Receiver, "counter", 0);

  var Message = /*#__PURE__*/function () {
    function Message(e) {
      _classCallCheck(this, Message);

      this.ref = e;
      this.messageId = this.ref.data.messageId;
      this.replyFor = this.ref.data.replyFor;
      this.origin = this.ref.origin;
      this.timeStamp = this.ref.timeStamp;
      this.lamportTime = this.ref.data.lamportTime;
      this.isExpectingReply = this.ref.data.isExpectingReply;
      this.replyTimeout = this.ref.data.replyTimeout;
      this.data = this.ref.data.message;
    }

    _createClass(Message, [{
      key: "reply",
      value: function reply(message) {
        Daak.getInstance()._send(this.ref.source, message, this.origin, null, this.id);
      }
    }, {
      key: "expectReply",
      value: function expectReply(message, timeout) {
        Daak.getInstance()._expectReply(this.ref.source, message, this.origin, null, this.id, timeout);
      }
    }]);

    return Message;
  }();

  var Daak = /*#__PURE__*/function () {
    function Daak(origin, maxWaitingTime) {
      _classCallCheck(this, Daak);

      if (Daak.instance) return Daak.instance;
      this.origin = origin || window.location.origin;
      this.host = new URL(this.origin).hostname;
      this.receivers = [];
      this.ridToIndex = {};
      this.lamportTime = 0;
      this._messageId = 0;
      this.timeout = maxWaitingTime || Daak.defaultWaitingTime;
      window.addEventListener('message', this._handler.bind(this));
      Daak.instance = this;
    }

    _createClass(Daak, [{
      key: "_addReceiver",
      value: function _addReceiver(receiver) {
        this.receivers.push(receiver);
        this.ridToIndex[receiver.id] = this.receivers.length - 1;
        return receiver.id;
      }
    }, {
      key: "unlisten",
      value: function unlisten(rid) {
        var index = this.ridToIndex[rid];
        if (index !== undefined) this.receivers.splice(index, 1);
        delete this.ridToIndex[rid];
      }
    }, {
      key: "listen",
      value: function listen(condition, action) {
        return this._addReceiver(new Receiver(condition, action));
      }
    }, {
      key: "receive",
      value: function receive(condition) {
        var _this = this;

        var action;
        var receivedPromise = new Promise(function (resolve, reject) {
          action = function action(msg) {
            return resolve(msg);
          };
        });
        var rid = this.listen(condition, action);
        return receivedPromise.then(function (msg) {
          _this.unlisten(rid);

          return msg;
        });
      }
    }, {
      key: "_handler",
      value: function _handler(e) {
        var lamportTime = e.data.lamportTime;
        this.lamportTime = Math.max(this.lamportTime, lamportTime) + 1;
        var msg = new Message(e);

        var _iterator = _createForOfIteratorHelper(this.receivers),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var receiver = _step.value;

            if (Receiver.matches(receiver.condition, msg)) {
              receiver.action(msg);
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    }, {
      key: "_getNextMessageId",
      value: function _getNextMessageId() {
        this._messageId += 1;
        return this._messageId;
      }
    }, {
      key: "_send",
      value: function _send(targetWindow, message, targetOrigin, transfer, replyFor, mid) {
        var isExpectingReply = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
        var replyTimeout = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : this.timeout;
        this.lamportTime += 1;

        var messageId = mid || this._getNextMessageId();

        var lamportTime = this.lamportTime;
        targetWindow.postMessage({
          lamportTime: lamportTime,
          messageId: messageId,
          replyFor: replyFor,
          isExpectingReply: isExpectingReply,
          replyTimeout: replyTimeout,
          message: message
        }, targetOrigin || targetWindow.origin || '*', transfer);
        return messageId;
      }
    }, {
      key: "send",
      value: function send(targetWindow, message, targetOrigin, transfer) {
        return this._send(targetWindow, message, targetOrigin, transfer);
      }
    }, {
      key: "_expectReply",
      value: function _expectReply(targetWindow, message, targetOrigin, transfer, replyFor) {
        var _this2 = this;

        var timeout = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : this.timeout;
        return new Promise(function (resolve, reject) {
          var rejected = false;

          var mid = _this2._getNextMessageId();

          _this2.receive(function (e) {
            return e.origin === targetOrigin && e.replyFor === mid;
          }).then(function (msg) {
            return !rejected && resolve(msg);
          });

          if (timeout) {
            window.setTimeout(function () {
              rejected = true;
              return reject('timeout');
            }, timeout);
          }

          _this2._send(targetWindow, message, targetOrigin, transfer, replyFor, mid, true, timeout);
        });
      }
    }, {
      key: "expectReply",
      value: function expectReply(targetWindow, message, targetOrigin, transfer, timeout) {
        return this._expectReply(targetWindow, message, targetOrigin, transfer, null, timeout);
      }
    }], [{
      key: "init",
      value: function init() {
        if (!Daak.instance) Daak.instance = new Daak();
      }
    }, {
      key: "getInstance",
      value: function getInstance() {
        Daak.init();
        return Daak.instance;
      }
    }]);

    return Daak;
  }();

  _defineProperty(Daak, "instance", null);

  _defineProperty(Daak, "defaultWaitingTime", 1000);

  window.Daak = Daak;
  window.daak = Daak.getInstance();
})();
