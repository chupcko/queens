class Config {

  static KEY = 'queens';

  static default_data = {
    auto_set_takens: false,
    show_color: false,
    problem_index: 0,
  };

  constructor() {
    if(Config.instance !== undefined) {
      return Config.instance;
    }
    Config.instance = this;
    this.load();
  }

  get() {
    return this.data;
  }

  reset() {
    this.data = { ...Config.default_data };
    this.save();
  }

  set(data) {
    this.data = { ...Config.default_data, ...data };
    this.save();
  }

  load() {
    let data = localStorage.getItem(Config.KEY);
    if(data === null) {
      this.reset();
    } else {
      this.set(JSON.parse(data));
    }
  }

  save() {
    localStorage.setItem(Config.KEY, JSON.stringify(this.data));
  }

}

export {
  Config
};
