import { Field, Fields } from 'field';

class Game {

  static State = {
    OK: 0,
    CLASH: 1,
    SOLVED: 2
  };

  static Field_state = {
    FREE: 0,
    TAKEN: 1,
    QUEEN: 2
   };

  auto_set_takens = false;

  new(input) {
    let lines = input.split('@');
    this.size = lines.length;
    this.board = [];
    this.colors = {};
    for(let x = 0; x < this.size; x++) {
      this.board[x] = [];
    }
    for(let y = 0; y < this.size; y++) {
      if(lines[y].length != this.size) {
        console.log('ERROR');
      }
      for(let x = 0; x < lines[y].length; x++) {
        let color = lines[y][x];
        this.board[x][y] = {
          color: color,
          state: Game.Field_state.FREE,
          all_takens_by_queen: false,
          auto_taken_by_queen: false
        };
        if(!this.colors.hasOwnProperty(color)) {
          this.colors[color] = new Fields();
        }
        this.colors[color].add(new Field(x, y));
      }
    }
    this.queens = new Fields();
    this.bad_queens = new Fields();
    this.state = Game.State.OK;
  }

  reset() {
    for(let x = 0; x < this.size; x++) {
      for(let y = 0; y < this.size; y++) {
        this.board[x][y].state = Game.Field_state.FREE;
        this.all_taksen_by_queen = false;
        this.auto_taken_by_queen = false;
      }
    }
    this.queens.clear();
    this.bad_queens.clear();
    this.state = Game.State.OK;
  }

  has_right_wall(x, y) {
    return this.board[x][y].color != this.board[x+1][y].color;
  }

  has_bottom_wall(x, y) {
    return this.board[x][y].color != this.board[x][y+1].color;
  }

  is_free(x, y) {
    return this.board[x][y].state == Game.Field_state.FREE;
  }

  is_taken(x, y) {
    return this.board[x][y].state == Game.Field_state.TAKEN;
  }

  is_auto_taken_by_queen(x, y, q_x, q_y) {
    return (
      this.board[x][y].state == Game.Field_state.TAKEN &&
      this.board[x][y].auto_taken_by_queen instanceof Field &&
      this.board[x][y].auto_taken_by_queen.eq(q_x, q_y)
    );
  }

  is_queen(x, y) {
    return this.board[x][y].state == Game.Field_state.QUEEN;
  }

  is_bad_queen(x, y) {
    return this.bad_queens.has(new Field(x, y));
  }

  all_takens(x, y) {
    let fields = new Fields(this.colors[this.board[x][y].color]);
    for(let xy = 0; xy < this.size; xy++) {
      fields.add(new Field(x, xy));
      fields.add(new Field(xy, y));
    }
    if(x > 0 && y > 0) {
      fields.add(new Field(x-1, y-1));
    }
    if(x > 0 && y < this.size-1) {
      fields.add(new Field(x-1, y+1));
    }
    if(x < this.size-1 && y > 0) {
      fields.add(new Field(x+1, y-1));
    }
    if(x < this.size-1 && y < this.size-1) {
      fields.add(new Field(x+1, y+1));
    }
    fields.delete(new Field(x, y));
    return fields;
  }

  click(x, y) {
    switch(this.board[x][y].state) {
      case Game.Field_state.FREE: {
        this.board[x][y].state = Game.Field_state.TAKEN;
        if(this.auto_set_takens) {
          this.board[x][y].auto_taken_by_queen = false;
        }
        break;
      }
      case Game.Field_state.TAKEN: {
        this.board[x][y].state = Game.Field_state.QUEEN;
        this.board[x][y].all_takens_by_queen = this.all_takens(x, y)
        let queen = new Field(x, y);
        if(this.auto_set_takens) {
          for(let field of this.board[x][y].all_takens_by_queen) {
            if(this.is_free(field.x, field.y)) {
              this.board[field.x][field.y].state = Game.Field_state.TAKEN;
              this.board[field.x][field.y].auto_taken_by_queen = queen;
            }
          }
        }
        this.queens.add(queen);
        break;
      }
      case Game.Field_state.QUEEN: {
        this.board[x][y].state = Game.Field_state.FREE;
        if(this.auto_set_takens) {
          for(let field of this.board[x][y].all_takens_by_queen) {
            if(this.is_auto_taken_by_queen(field.x, field.y, x, y)) {
              this.board[field.x][field.y].state = Game.Field_state.FREE;
              this.board[field.x][field.y].auto_taken_by_queen = false;
            }
          }
        }
        this.board[x][y].all_takens_by_queen = false;
        this.queens.delete(new Field(x, y));
        break;
      }
    }
    this.check();
  }

  check() {
    this.bad_queens.clear();
    this.state = Game.State.OK;
    for(let queen_1 of this.queens) {
      for(let queen_2 of this.queens) {
        if(queen_1.neq(queen_2)) {
          if(this.board[queen_1.x][queen_1.y].all_takens_by_queen.has(queen_2)) {
            this.bad_queens.add(queen_2);
          }
        }
      }
    }
    if(this.bad_queens.size() > 0) {
      this.state = Game.State.CLASH;
    } else if(this.queens.size() == this.size) {
      this.state = Game.State.SOLVED;
    }
  }

  eq_color(x1, y1, x2, y2) {
    return this.board[x1][y1].color === this.board[x2][y2].color;
  }

}

export {
  Game
};
