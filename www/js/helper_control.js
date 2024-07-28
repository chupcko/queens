import { Field, Fields } from 'field';

class Helper_control {

  static SIZE = 12;
  static WIDTH_GRID = 2;
  static WIDTH_FIELD = 25;
  static LENGTH_TAKEN = 3;
  static WIDTH_TAKEN = 1.5;
  static COLOR_GRID = 'rgb(70%, 70%, 70%)';
  static COLOR_GROUND = 'rgb(90%, 90%, 90%)';
  static COLOR_SHAPE = 'rgb(10%, 10%, 10%)';
  static COLOR_TAKEN = 'rgb(10%, 10%, 90%)';

  static Field_state = {
    FREE: 0,
    SHAPE: 1,
    TAKEN: 2
  };

  constructor(root_id) {
    this.root_element = document.getElementById(root_id);

    this.board = [];
    for(let x = 0; x < Helper_control.SIZE; x++) {
      this.board[x] = [];
      for(let y = 0; y < Helper_control.SIZE; y++) {
        this.board[x][y] = Helper_control.Field_state.FREE;
      }
    }

    this.new();
  }

  reset() {
    for(let x = 0; x < Helper_control.SIZE; x++) {
      for(let y = 0; y < Helper_control.SIZE; y++) {
        this.board[x][y] = Helper_control.Field_state.FREE;
      }
    }
  }

  new() {
    this.root_element.innerHTML = '';

    let reset_element = document.createElement('button');
    reset_element.innerHTML = 'RESET';
    reset_element.addEventListener(
      'click',
      () => {
        this.reset();
        this.draw();
        return false;
      }
    );
    this.root_element.appendChild(reset_element);

    this.width = Helper_control.WIDTH_GRID+Helper_control.SIZE*(Helper_control.WIDTH_FIELD+Helper_control.WIDTH_GRID);
    let div_element = document.createElement('div');
    div_element.style.width = this.width+'px';
    div_element.style.height = this.width+'px';

    this.board_element = document.createElement('canvas');
    this.board_element.width = this.width;
    this.board_element.height = this.width;
    div_element.appendChild(this.board_element);
    this.board_element.addEventListener
    (
      'click',
      (event) => {
        this.get_point(event);
        return false;
      }
    );
    this.board_context = this.board_element.getContext('2d');
    this.draw();

    this.root_element.appendChild(div_element);
  }

  get_point(event) {
    let rect = this.board_element.getBoundingClientRect();
    let x = Math.round(event.clientX-rect.left)-Helper_control.WIDTH_GRID;
    let y = Math.round(event.clientY-rect.top)-Helper_control.WIDTH_GRID;
    let periodic = Helper_control.WIDTH_GRID+Helper_control.WIDTH_FIELD;
    if(
      x >= 0 &&
      y >= 0 &&
      x%periodic < Helper_control.WIDTH_FIELD &&
      y%periodic < Helper_control.WIDTH_FIELD
    )
    {
      x = Math.floor(x/periodic);
      y = Math.floor(y/periodic);
      this.toggle(x, y);
    }
  }

  toggle(x, y) {
    switch(this.board[x][y]) {
      case Helper_control.Field_state.FREE:
      case Helper_control.Field_state.TAKEN: {
        this.board[x][y] = Helper_control.Field_state.SHAPE;
        break;
      }
      case Helper_control.Field_state.SHAPE: {
        this.board[x][y] = Helper_control.Field_state.FREE;
        break;
      }
    };
    this.calculate_takens();
    this.draw();
  }

  all_takens(x, y) {
    let fields = new Fields();
    for(let xy = 0; xy < Helper_control.SIZE; xy++) {
      fields.add(new Field(x, xy));
      fields.add(new Field(xy, y));
    }
    if(x > 0 && y > 0) {
      fields.add(new Field(x-1, y-1));
    }
    if(x > 0 && y < Helper_control.SIZE-1) {
      fields.add(new Field(x-1, y+1));
    }
    if(x < Helper_control.SIZE-1 && y > 0) {
      fields.add(new Field(x+1, y-1));
    }
    if(x < Helper_control.SIZE-1 && y < Helper_control.SIZE-1) {
      fields.add(new Field(x+1, y+1));
    }
    return fields;
  }

  calculate_takens() {
    let takens_from_shapes = [];
    for(let x = 0; x < Helper_control.SIZE; x++) {
      for(let y = 0; y < Helper_control.SIZE; y++) {
        switch(this.board[x][y]) {
          case Helper_control.Field_state.TAKEN: {
            this.board[x][y] = Helper_control.Field_state.FREE;
            break;
          }
          case Helper_control.Field_state.SHAPE: {
            takens_from_shapes.push(this.all_takens(x, y));
            break;
          }
        }
      }
    }
    if(takens_from_shapes.length > 0) {
      let intersection = new Fields(takens_from_shapes[0]);
      for(let i = 1; i < takens_from_shapes.length; i++) {
        intersection = intersection.intersect(takens_from_shapes[i]);
      }
      for(let field of intersection) {
        if(this.board[field.x][field.y] == Helper_control.Field_state.FREE) {
          this.board[field.x][field.y] = Helper_control.Field_state.TAKEN;
        }
      }
    }
  }

  draw() {
    this.board_context.fillStyle = Helper_control.COLOR_GROUND;
    this.board_context.fillRect(0, 0, this.width, this.width);
    this.board_context.fillStyle = Helper_control.COLOR_GRID;
    for(let xy = 0; xy < Helper_control.SIZE+1; xy++) {
      this.board_context.fillRect
      (
        0,
        xy*(Helper_control.WIDTH_GRID+Helper_control.WIDTH_FIELD),
        this.width,
        Helper_control.WIDTH_GRID
      );
      this.board_context.fillRect
      (
        xy*(Helper_control.WIDTH_GRID+Helper_control.WIDTH_FIELD),
        0,
        Helper_control.WIDTH_GRID,
        this.width
      );
    }
    for(let x = 0; x < Helper_control.SIZE; x++) {
      for(let y = 0; y < Helper_control.SIZE; y++) {
        switch(this.board[x][y]) {
          case Helper_control.Field_state.SHAPE: {
            this.board_context.fillStyle = Helper_control.COLOR_SHAPE;
            this.board_context.fillRect
            (
              2*Helper_control.WIDTH_GRID+x*(Helper_control.WIDTH_FIELD+Helper_control.WIDTH_GRID),
              2*Helper_control.WIDTH_GRID+y*(Helper_control.WIDTH_FIELD+Helper_control.WIDTH_GRID),
              Helper_control.WIDTH_FIELD-2*Helper_control.WIDTH_GRID,
              Helper_control.WIDTH_FIELD-2*Helper_control.WIDTH_GRID
            );
            break;
          }
          case Helper_control.Field_state.TAKEN: {
            let center_x = Helper_control.WIDTH_GRID+x*(Helper_control.WIDTH_FIELD+Helper_control.WIDTH_GRID)+Math.floor(Helper_control.WIDTH_FIELD/2)+1;
            let center_y = Helper_control.WIDTH_GRID+y*(Helper_control.WIDTH_FIELD+Helper_control.WIDTH_GRID)+Math.floor(Helper_control.WIDTH_FIELD/2)+1;
            this.board_context.strokeStyle = Helper_control.COLOR_TAKEN;
            this.board_context.lineWidth = Helper_control.WIDTH_TAKEN;
            this.board_context.beginPath();
            this.board_context.moveTo(center_x-Helper_control.LENGTH_TAKEN, center_y-Helper_control.LENGTH_TAKEN);
            this.board_context.lineTo(center_x+Helper_control.LENGTH_TAKEN, center_y+Helper_control.LENGTH_TAKEN);
            this.board_context.stroke();
            this.board_context.beginPath();
            this.board_context.moveTo(center_x-Helper_control.LENGTH_TAKEN, center_y+Helper_control.LENGTH_TAKEN);
            this.board_context.lineTo(center_x+Helper_control.LENGTH_TAKEN, center_y-Helper_control.LENGTH_TAKEN);
            this.board_context.stroke();
            break;
          }
        }
      }
    }
  }

}

export {
  Helper_control
};
