export class Receiver {
  static matches = (condition, object) => (typeof condition === 'function' && !!condition(object));
  static counter = 0;

  constructor (condition, action) {
    this.condition = condition;
    this.action = action;
    Receiver.counter += 1;
    this.id = Receiver.counter;
  }
}

export default Receiver;
