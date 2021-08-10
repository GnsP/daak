import Daak from './daak';

export class Message {
  constructor (e) {
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

  reply (message) {
    Daak.getInstance()._send(this.ref.source, message, this.origin, null, this.id);
  }

  expectReply (message, timeout) {
    Daak.getInstance()._expectReply(this.ref.source, message, this.origin, null, this.id, timeout);
  }
}

export default Message;
