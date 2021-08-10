import Receiver from './receiver';
import Message from './message';

export class Daak {
  static instance = null;
  static defaultWaitingTime = 1000;

  static init () {
    if (!Daak.instance) Daak.instance = new Daak();
  }

  static getInstance() {
    Daak.init();
    return Daak.instance;
  }

  constructor (origin, maxWaitingTime) {
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

  _addReceiver (receiver) {
    this.receivers.push(receiver);
    this.ridToIndex[receiver.id] = this.receivers.length - 1;
    return receiver.id;
  }

  unlisten (rid) {
    const index = this.ridToIndex[rid];
    if (index !== undefined) this.receivers.splice(index, 1);
    delete this.ridToIndex[rid];
  }

  listen (condition, action) {
    return this._addReceiver(new Receiver(condition, action));
  }

  receive (condition) {
    let action;
    const receivedPromise = new Promise((resolve, reject) => {
      action = (msg) => resolve(msg);
    });

    const rid = this.listen(condition, action);
    return receivedPromise.then((msg) => {
      this.unlisten(rid);
      return msg;
    });
  }

  _handler (e) {
    const { lamportTime } = e.data;
    this.lamportTime = Math.max(this.lamportTime, lamportTime) + 1;

    const msg = new Message(e);
    for (let receiver of this.receivers) {
      if (Receiver.matches(receiver.condition, msg)) {
        receiver.action(msg);
      }
    }
  }

  _getNextMessageId () {
    this._messageId += 1;
    return this._messageId;
  }

  _send (targetWindow, message, targetOrigin, transfer, replyFor, mid, isExpectingReply=false, replyTimeout=this.timeout) {
    this.lamportTime += 1;
    const messageId = mid || this._getNextMessageId();
    const { lamportTime } = this;

    targetWindow.postMessage({
      lamportTime,
      messageId,
      replyFor,
      isExpectingReply,
      replyTimeout,
      message,
    }, targetOrigin || targetWindow.origin || '*', transfer);
    return messageId;
  }


  // iframeWindow.postMessage(data, '*', );
  // daak.send(iframeWindow, data, '*');

  send (targetWindow, message, targetOrigin, transfer) {
    return this._send(targetWindow, message, targetOrigin, transfer);
  }

  _expectReply (targetWindow, message, targetOrigin, transfer, replyFor, timeout=this.timeout) {
    return new Promise((resolve, reject) => {
      let rejected = false;
      const mid = this._getNextMessageId();

      this.receive((e) => (e.origin === targetOrigin && e.replyFor === mid))
        .then((msg) => (!rejected && resolve(msg)));

      if (timeout) {
        window.setTimeout(() => {
          rejected = true;
          return reject('timeout');
        }, timeout);
      }
      this._send(targetWindow, message, targetOrigin, transfer, replyFor, mid, true, timeout);
    });
  }

  expectReply (targetWindow, message, targetOrigin, transfer, timeout) {
    return this._expectReply(targetWindow, message, targetOrigin, transfer, null, timeout);
  }
}

export default Daak;
