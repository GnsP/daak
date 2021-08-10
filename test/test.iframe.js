var expect = chai.expect;
var timer = function (t) {
  return new Promise(function (resolve, reject) {
    window.setTimeout(resolve, t);
  });
}

describe('Iframe window', function() {

  describe('receive', function() {
    it('should receive a post message from main', function() {
      return window.daak.receive((msg) => true).then((msg) => {
        console.log(msg);

        expect(msg).to.have.property('ref');
        expect(msg).to.have.property('messageId');
        expect(msg).to.have.property('origin');
        expect(msg).to.have.property('timeStamp');
        expect(msg).to.have.property('lamportTime');
        expect(msg).to.have.property('data');

        // expect(msg).to.have.keys([
        //   'ref',
        //   'messageId',
        //   'origin',
        //   'timeStamp',
        //   'lamportTime',
        //   'data',
        // ]);

        expect(msg.messageId).to.be.a('number');
        expect(msg.origin).to.equal(window.parent.origin);
        expect(msg.data).to.equal('hello');
      });
    });
  });

});
