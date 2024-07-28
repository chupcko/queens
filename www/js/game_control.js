import { Config } from 'config';
import { Field } from 'field';
import { Game } from 'game';
import { Problems } from 'problems';

class Game_control {

  static WIDTH_WALL_ADD = 1;
  static WIDTH_GRID = 2;
  static WIDTH_FIELD = 25;
  static WIDTH_WALL = 2*Game_control.WIDTH_WALL_ADD+Game_control.WIDTH_GRID;
  static LENGTH_MARK_TAKEN = 3;
  static LENGTH_MARK_QUEEN = 5.5;
  static WIDTH_MARK_TAKEN = 1.5;
  static WIDTH_MARK_QUEEN = 2;
  static COLOR_GRID = 'rgb(70%, 70%, 70%)';
  static COLOR_WALL = 'rgb(0%, 0%, 0%)';
  static COLOR_GROUND = 'rgb(90%, 90%, 90%)';
  static COLOR_COLOR = 'rgb(100%, 80%, 80%)';
  static COLOR_MARK_TAKEN = 'rgb(10%, 10%, 90%)';
  static COLOR_MARK_QUEEN = 'rgb(0%, 0%, 100%)';
  static COLOR_MARK_QUEEN_BAD = 'rgb(100%, 0%, 0%)';
  static COLOR_MARK_QUEEN_SOLVED = 'rgb(0%, 100%, 0%)';

  constructor(config, location, root_id) {
    this.config = config;
    this.config_data = this.config.get();
    this.location = location;
    this.root_element = document.getElementById(root_id);
    this.game = new Game();
    this.game.auto_set_takens = this.config_data.auto_set_takens;
    this.show_color = this.config_data.show_color;
    let problem_index = this.location.load();
    if(problem_index !== false) {
      this.config_data.problem_index = (problem_index+Problems.length)%Problems.length;
      this.config.save();
    }
    this.last_over = false;
    this.new();
  }

  problem_begin() {
    this.config_data.problem_index = 0;
    this.config.save();
    this.new();
  }

  problem_end() {
    this.config_data.problem_index = Problems.length-1;
    this.config.save();
    this.new();
  }

  problem_random() {
    this.config_data.problem_index = Math.floor(Math.random()*Problems.length);
    this.config.save();
    this.new();
  }

  problem_up() {
    this.config_data.problem_index = (this.config_data.problem_index+1)%Problems.length;
    this.config.save();
    this.new();
  }

  problem_down() {
    this.config_data.problem_index = (this.config_data.problem_index+Problems.length-1)%Problems.length;
    this.config.save();
    this.new();
  }

  new() {
    this.location.save(this.config_data.problem_index);
    this.game.new(Problems[this.config.data.problem_index]);

    this.root_element.innerHTML = '';

    let auto_set_takens_element = document.createElement('input');
    auto_set_takens_element.type = 'checkbox';
    auto_set_takens_element.checked = this.game.auto_set_takens;
    auto_set_takens_element.addEventListener(
      'change',
      (event) => {
        this.game.auto_set_takens = event.target.checked;
        this.config_data.auto_set_takens = this.game.auto_set_takens;
        this.config.save();
      }
    );
    this.root_element.appendChild(auto_set_takens_element);

    let show_color_element = document.createElement('input');
    show_color_element.type = 'checkbox';
    show_color_element.checked = this.show_element;
    show_color_element.addEventListener(
      'change',
      (event) => {
        this.show_color = event.target.checked;
        this.config_data.show_color = this.show_color;
        this.config.save();
      }
    );
    this.root_element.appendChild(show_color_element);

    let begin_element = document.createElement('button');
    begin_element.innerHTML = '<';
    begin_element.addEventListener(
      'click',
      () => {
        this.problem_begin();
        return false;
      }
    );
    this.root_element.appendChild(begin_element);

    let down_element = document.createElement('button');
    down_element.innerHTML = '-';
    down_element.addEventListener(
      'click',
      () => {
        this.problem_down();
        return false;
      }
    );
    this.root_element.appendChild(down_element);

    let random_element = document.createElement('button');
    random_element.innerHTML = 'RND';
    random_element.addEventListener(
      'click',
      () => {
        this.problem_random();
        return false;
      }
    );
    this.root_element.appendChild(random_element);

    let up_element = document.createElement('button');
    up_element.innerHTML = '+';
    up_element.addEventListener(
      'click',
      () => {
        this.problem_up();
        return false;
      }
    );
    this.root_element.appendChild(up_element);

    let end_element = document.createElement('button');
    end_element.innerHTML = '>';
    end_element.addEventListener(
      'click',
      () => {
        this.problem_end();
        return false;
      }
    );
    this.root_element.appendChild(end_element);

    let reset_element = document.createElement('button');
    reset_element.innerHTML = 'RESET';
    reset_element.addEventListener(
      'click',
      () => {
        this.game.reset();
        this.draw_board();
        return false;
      }
    );
    this.root_element.appendChild(reset_element);

    this.state_element = document.createElement('span');
    this.state_element.innerHTML = '';
    this.root_element.appendChild(this.state_element);

    this.width = Game_control.WIDTH_WALL+this.game.size*(Game_control.WIDTH_FIELD+Game_control.WIDTH_WALL);
    let div_element = document.createElement('div');
    div_element.style.width = this.width+'px';
    div_element.style.height = this.width+'px';

    this.ground_element = document.createElement('canvas');
    this.ground_element.style.position = 'absolute';
    this.ground_element.style.zIndex = 0;
    this.ground_element.width = this.width;
    this.ground_element.height = this.width;
    div_element.appendChild(this.ground_element);
    this.ground_context = this.ground_element.getContext('2d');
    this.draw_ground();

    this.walls_element = document.createElement('canvas');
    this.walls_element.style.position = 'absolute';
    this.walls_element.style.zIndex = 0;
    this.walls_element.width = this.width;
    this.walls_element.height = this.width;
    div_element.appendChild(this.walls_element);
    this.walls_context = this.walls_element.getContext('2d');
    this.draw_walls();

    this.board_element = document.createElement('canvas');
    this.board_element.style.position = 'absolute';
    this.board_element.style.zIndex = 1;
    this.board_element.width = this.width;
    this.board_element.height = this.width;
    div_element.appendChild(this.board_element);
    this.board_element.addEventListener
    (
      'click',
      (event) => {
        let field = this.get_field(event);
        if(field !== false) {
          this.game.click(field.x, field.y);
          this.draw_board();
        }
        return false;
      }
    );
    this.board_element.addEventListener
    (
      'mousemove',
      (event) => {
        if(!this.show_color) {
          return false;
        }
        let field = this.get_field(event);
        if(
          (
            field === false &&
            this.last_over !== false
          ) ||
          (
            field !== false &&
            (
              this.last_over === false ||
              (
                this.last_over !== false &&
                field.neq(this.last_over)
              )
            )
          )
        ) {
          this.last_over = field;
          this.draw_ground();
        }
        return false;
      }
    );
    this.board_context = this.board_element.getContext('2d');
    this.draw_board();

    this.root_element.appendChild(div_element);
  }

  get_field(event) {
    let rect = this.board_element.getBoundingClientRect();
    let x = Math.round(event.clientX-rect.left)-Game_control.WIDTH_WALL;
    let y = Math.round(event.clientY-rect.top)-Game_control.WIDTH_WALL;
    let periodic = Game_control.WIDTH_WALL+Game_control.WIDTH_FIELD;
    if(
      x >= 0 &&
      y >= 0 &&
      x%periodic < Game_control.WIDTH_FIELD &&
      y%periodic < Game_control.WIDTH_FIELD
    )
    {
      x = Math.floor(x/periodic);
      y = Math.floor(y/periodic);
      return new Field(x, y);
    }
    return false;
  }

  draw_ground() {
    this.ground_context.fillStyle = Game_control.COLOR_GROUND;
    this.ground_context.fillRect(0, 0, this.width, this.width);
    if(this.last_over !== false) {
      for(let x = 0; x < this.game.size; x++) {
        for(let y = 0; y < this.game.size; y++) {
          if(this.game.eq_color(x, y, this.last_over.x, this.last_over.y)) {
            this.draw_color(x, y);
          }
        }
      }
    }
  }

  draw_color(x, y) {
    this.ground_context.fillStyle = Game_control.COLOR_COLOR;
    this.ground_context.fillRect(
      2*Game_control.WIDTH_WALL+x*(Game_control.WIDTH_FIELD+Game_control.WIDTH_WALL),
      2*Game_control.WIDTH_WALL+y*(Game_control.WIDTH_FIELD+Game_control.WIDTH_WALL),
      Game_control.WIDTH_FIELD-2*Game_control.WIDTH_WALL,
      Game_control.WIDTH_FIELD-2*Game_control.WIDTH_WALL
    );
  }

  draw_walls() {
    this.walls_context.fillStyle = Game_control.COLOR_WALL;
    this.walls_context.fillRect(0, 0, this.width, Game_control.WIDTH_WALL);
    this.walls_context.fillRect(0, 0, Game_control.WIDTH_WALL, this.width);
    this.walls_context.fillRect(this.width, this.width, -this.width, -Game_control.WIDTH_WALL);
    this.walls_context.fillRect(this.width, this.width, -Game_control.WIDTH_WALL, -this.width);
    this.walls_context.fillStyle = Game_control.COLOR_GRID;
    for(let xy = 0; xy < this.game.size-1; xy++) {
      this.walls_context.fillRect
      (
        Game_control.WIDTH_WALL,
        Game_control.WIDTH_WALL+xy*(Game_control.WIDTH_FIELD+Game_control.WIDTH_WALL)+Game_control.WIDTH_FIELD+Game_control.WIDTH_WALL_ADD,
        this.width-2*Game_control.WIDTH_WALL,
        Game_control.WIDTH_GRID
      );
      this.walls_context.fillRect
      (
        Game_control.WIDTH_WALL+xy*(Game_control.WIDTH_FIELD+Game_control.WIDTH_WALL)+Game_control.WIDTH_FIELD+Game_control.WIDTH_WALL_ADD,
        Game_control.WIDTH_WALL,
        Game_control.WIDTH_GRID,
        this.width-2*Game_control.WIDTH_WALL
      );
    }
    this.walls_context.fillStyle = Game_control.COLOR_WALL;
    for(let x = 0; x < this.game.size; x++) {
      for(let y = 0; y < this.game.size; y++) {
        if(x != this.game.size-1 && this.game.has_right_wall(x, y)) {
          this.walls_context.fillRect
          (
            Game_control.WIDTH_WALL+x*(Game_control.WIDTH_FIELD+Game_control.WIDTH_WALL)+Game_control.WIDTH_FIELD,
            y*(Game_control.WIDTH_FIELD+Game_control.WIDTH_WALL),
            Game_control.WIDTH_WALL,
            2*Game_control.WIDTH_WALL+Game_control.WIDTH_FIELD
          );
        }
        if(y != this.game.size-1 && this.game.has_bottom_wall(x, y)) {
          this.walls_context.fillRect
          (
            x*(Game_control.WIDTH_FIELD+Game_control.WIDTH_WALL),
            Game_control.WIDTH_WALL+y*(Game_control.WIDTH_FIELD+Game_control.WIDTH_WALL)+Game_control.WIDTH_FIELD,
            2*Game_control.WIDTH_WALL+Game_control.WIDTH_FIELD,
            Game_control.WIDTH_WALL
          );
        }
      }
    }
  }

  draw_board() {
    this.board_context.clearRect(0, 0, this.width, this.width);
    for(let x = 0; x < this.game.size; x++) {
      for(let y = 0; y < this.game.size; y++) {
        this.draw_field(x, y);
      }
    }
  }

  draw_field(x, y) {
    switch(this.game.board[x][y].state) {
      case Game.Field_state.TAKEN: {
        let center_x = Game_control.WIDTH_WALL+x*(Game_control.WIDTH_FIELD+Game_control.WIDTH_WALL)+Math.floor(Game_control.WIDTH_FIELD/2)+1;
        let center_y = Game_control.WIDTH_WALL+y*(Game_control.WIDTH_FIELD+Game_control.WIDTH_WALL)+Math.floor(Game_control.WIDTH_FIELD/2)+1;
        this.board_context.strokeStyle = Game_control.COLOR_MARK_TAKEN;
        this.board_context.lineWidth = Game_control.WIDTH_MARK_TAKEN;
        this.board_context.beginPath();
        this.board_context.moveTo(center_x-Game_control.LENGTH_MARK_TAKEN, center_y-Game_control.LENGTH_MARK_TAKEN);
        this.board_context.lineTo(center_x+Game_control.LENGTH_MARK_TAKEN, center_y+Game_control.LENGTH_MARK_TAKEN);
        this.board_context.stroke();
        this.board_context.beginPath();
        this.board_context.moveTo(center_x-Game_control.LENGTH_MARK_TAKEN, center_y+Game_control.LENGTH_MARK_TAKEN);
        this.board_context.lineTo(center_x+Game_control.LENGTH_MARK_TAKEN, center_y-Game_control.LENGTH_MARK_TAKEN);
        this.board_context.stroke();
        break;
      }
      case Game.Field_state.QUEEN: {
        let center_x = Game_control.WIDTH_WALL+x*(Game_control.WIDTH_FIELD+Game_control.WIDTH_WALL)+Math.floor(Game_control.WIDTH_FIELD/2)+1;
        let center_y = Game_control.WIDTH_WALL+y*(Game_control.WIDTH_FIELD+Game_control.WIDTH_WALL)+Math.floor(Game_control.WIDTH_FIELD/2)+1;
        if(this.game.is_bad_queen(x, y)) {
          this.board_context.strokeStyle = Game_control.COLOR_MARK_QUEEN_BAD;
        } else if(this.game.state == Game.State.SOLVED) {
          this.board_context.strokeStyle = Game_control.COLOR_MARK_QUEEN_SOLVED;
        } else {
          this.board_context.strokeStyle = Game_control.COLOR_MARK_QUEEN;
        }
        this.board_context.lineWidth = Game_control.WIDTH_MARK_QUEEN;
        this.board_context.beginPath();
        this.board_context.moveTo(center_x, center_y-Game_control.LENGTH_MARK_QUEEN);
        this.board_context.lineTo(center_x, center_y+Game_control.LENGTH_MARK_QUEEN);
        this.board_context.stroke();
        this.board_context.beginPath();
        this.board_context.moveTo(center_x-Game_control.LENGTH_MARK_QUEEN, center_y);
        this.board_context.lineTo(center_x+Game_control.LENGTH_MARK_QUEEN, center_y);
        this.board_context.stroke();
        this.board_context.beginPath();
        this.board_context.moveTo(center_x-Game_control.LENGTH_MARK_QUEEN, center_y-Game_control.LENGTH_MARK_QUEEN);
        this.board_context.lineTo(center_x+Game_control.LENGTH_MARK_QUEEN, center_y+Game_control.LENGTH_MARK_QUEEN);
        this.board_context.stroke();
        this.board_context.beginPath();
        this.board_context.moveTo(center_x-Game_control.LENGTH_MARK_QUEEN, center_y+Game_control.LENGTH_MARK_QUEEN);
        this.board_context.lineTo(center_x+Game_control.LENGTH_MARK_QUEEN, center_y-Game_control.LENGTH_MARK_QUEEN);
        this.board_context.stroke();
        break;
      }
    }
    switch(this.game.state) {
      case Game.State.OK: {
        this.state_element.innerHTML = '';
        break;
      }
      case Game.State.CLASH: {
        this.state_element.innerHTML = 'Clash';
        break;
      }
      case Game.State.SOLVED: {
        this.state_element.innerHTML = 'Solved';
        break;
      }
    }
  }

}

export {
  Game_control
};
