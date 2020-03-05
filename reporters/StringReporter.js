const map = new Map();

module.exports = function StringReporter(func) {
  this.report = (key, value) => {
    func(`METRICS ${key} : ${value}`);
  };

  this.value = (key, value) => {
    func(`METRICS ${key} : ${value}`);
  };

  this.increment = (key, value = 1) => {
    let oldValue = map.get(key) || 0;

    oldValue += value;

    map.set(key, oldValue);
    func(`METRICS ${key} : ${oldValue}`);
  };
};
