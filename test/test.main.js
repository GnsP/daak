var expect = chai.expect;
var frame = document.getElementById('frame').contentWindow;
var timer = function (t) {
  return new Promise(function (resolve, reject) {
    window.setTimeout(resolve, t);
  });
}

describe('Main window', function() {

  describe('send', function() {
    it('should send a post message to iframe', async function() {
      await timer(200);
      function f() {
        window.daak.send(frame, 'hello');
      }
      f();
      expect(f).to.not.throw;
      return;
    });
  });

});
