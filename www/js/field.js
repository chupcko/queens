class Field {

  constructor(fx, y) {
    if(fx instanceof Field) {
      this.x = fx.x;
      this.y = fx.y;
      return;
    }
    this.x = fx;
    this.y = y;
  }

  static from_primitive(input) {
    let field = input.split('-');
    return new Field(parseInt(field[0]), parseInt(field[1]));
  }

  to_primitive() {
    return `${ this.x }-${ this.y }`;
  }

  eq(fx, y) {
    if(fx instanceof Field) {
      return fx.x == this.x && fx.y == this.y;
    }
    return fx == this.x && y == this.y;
  }

  neq(fx, y) {
    if(fx instanceof Field) {
      return fx.x != this.x || fx.y != this.y;
    }
    return fx != this.x || y != this.y;
  }

}

class Fields {

  constructor(fields) {
    if(fields instanceof Fields) {
      this.set = new Set([ ...fields.set ]);
      return;
    }
    this.set = new Set();
  }

  size() {
    return this.set.size;
  }

  clear() {
    this.set.clear();
  }

  add(field) {
    this.set.add(field.to_primitive());
  }

  delete(field) {
    this.set.delete(field.to_primitive());
  }

  has(field) {
    return this.set.has(field.to_primitive());
  }

  intersect(fields) {
    let intersection = new Fields();
    for(let field of fields) {
      if(this.has(field)) {
        intersection.add(field);
      }
    }
    return intersection;
  }

  *[Symbol.iterator]() {
    for(let primitive of this.set) {
      yield Field.from_primitive(primitive);
    }
  }

}

export {
  Field,
  Fields
};
