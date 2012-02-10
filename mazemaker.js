
Array.prototype.shuffle = function () {
  var i, j, tempi, tempj;
  i = this.length;
  if ( i === 0 ) {
    return false;
  }
  while ( --i ) {
    j = Math.floor( Math.random() * ( i + 1 ) );
    tempi = this[i];
    tempj = this[j];
    this[i] = tempj;
    this[j] = tempi;
  }
};

Number.prototype.times = function (fn) {
  for (var i = 0; i < this; i += 1) {
    fn(i);
  }
};

var Maze;

(function () {
  
  function get_root(node) {
    if (node.parent) {
      return get_root(node.parent);
    }
    return node;
  }

  function check_wall(first, second) {
    var first_root, second_root;
    first_root = get_root(first);
    second_root = get_root(second);
    if (first_root === second_root) {
      return true;
    }
    first_root.parent = second_root;
    return false;
  }

  Maze = function (width, height) {
    var sets = [];
    var order = [];
    for (var i = 0; i < width * height; i += 1) {
      sets.push({});
      order.push(i * 2);
      order.push(i * 2 + 1);
    }
    order.shuffle();

    order.forEach(function (i) {
      var first, second;
      if (i >= sets.length) {
        // Right Wall
        first = sets[i - sets.length];
        if (i % width === width - 1) {
          first.right = true;
          // Skip right wall for last column of cells
          return;
        }
        second = sets[i - sets.length + 1];
        first.right = check_wall(first, second);
      } else {
        // Bottom Wall
        first = sets[i];
        if (Math.floor(i / width) === height - 1) {
          first.bottom = true;
          // Skip bottom wall for last row of cells
          return;
        }
        second = sets[i + width];
        first.bottom = check_wall(first, second);
      }
    });

    this.width = width;
    this.height = height;
    this.sets = sets;
  }
  
  Maze.prototype.toGrid = function () {
    var h = this.height * 2 + 1;
    var w = this.width * 2 + 1;

    // Fill out grid and put in walls
    var grid = new Array(h);
    for (var i = 0; i < h; i++) {
      grid[i] = new Array(w);
      grid[i][0] = 1;
      grid[i][w - 1] = 1;
    }
    for (var i = 1; i < w - 1; i++) {
      grid[0][i] = 1;
      grid[h - 1][i] = 1;
    }

    // Fill in the map
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var item = this.sets[y * this.width + x];
        var itemr = this.sets[y * this.width + (x + 1)];
        var itemb = this.sets[(y + 1) * this.width + x];
        grid[y*2+1][x*2+1] = 0;
        grid[y*2+1][x*2+2] = item.right ? 1 : 0;
        grid[y*2+2][x*2+1] = item.bottom ? 1 : 0;
        grid[y*2+2][x*2+2] = item.right || item.bottom || itemr.bottom || itemb.right ? 1 : 0;
      }
    }
    return grid;
  }

}());

var sizes = process.stdout.getWindowSize();
var width = (sizes[0] - 2) >> 2;
var height = (sizes[1] - 1) >> 1;
//width = 10;
//height = 10;
var maze = new Maze(width, height);
var grid = maze.toGrid();


var ansi = require('ansi');
var cursor = ansi(process.stdout);
grid.forEach(function (line, y) {
  line.forEach(function (cell, x) {
    if (cell) {
      var color = (Math.random() * 0x1000000 << 0) | 0x808080
      cursor.bg.hex(color.toString(16));
    } else {
      cursor.bg.reset();
    }
    process.stdout.write("  ");
  });
  cursor.bg.reset();
  process.stdout.write("\n");
});

// Sample output for a 5x5 maze
// ██████████████████████
// ██  ██              ██
// ██  ██████  ██  ██████
// ██          ██      ██
// ██  ██████  ██  ██████
// ██      ██  ██      ██
// ██  ██████████████  ██
// ██      ██          ██
// ██  ██████  ██████  ██
// ██      ██      ██  ██
// ██████████████████████
