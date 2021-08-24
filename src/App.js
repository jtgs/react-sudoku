import './App.css';
import React from 'react';

function Square(props) {
  let classname = "square";

  if (props.complete) {
    classname += " complete";
  } else if (props.cell.selected) {
    classname += " selected";
  } else if (props.cell.highlighted) {
    classname += " highlighted";
  }

  if (props.cell.wrong) {
    classname += " wrong";
  } else if (props.cell.fixed) {
    classname += " fixed";
  }

  if (props.cell.value === 0 && props.cell.notes !== '') {
    classname += " notes";
  }

  return (
    <td 
      className={classname} 
      onClick={props.onClick} 
      onKeyDown={(e) => props.onKeyDown(e)}
      // tabIndex ensures onKeyDown works
      tabIndex="0"
      id={"cell" + props.cell.index} 
    >
      {props.cell.value !== 0 ? props.cell.value : props.cell.notes !== '' ? props.cell.notes : ''}
    </td>
  );
}

function Cell(index, value) {
  this.index = index;
  this.value = value;
  this.notes = '';
  this.selected = false;
  this.highlighted = false;
  this.fixed = false;
  this.wrong = false;
}

const puzzle = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

function puzzleToBoard(puzzle) {
  let board = [];
  let index = 0;

  for (let row of puzzle) {
    let newRow = [];
    for (let col of row) {
      let cell = new Cell(index++, col);
      if (col !== 0) {
        cell.fixed = true;
      }
      newRow.push(cell);
    }
    board.push(newRow);
  }

  console.log(board);
  return board;
}

// Returns true if n could possibly go in the cell at row/col.
function possible(puzzle, row, col, n) {
  // Check the row
  for (let i = 0; i < 9; i++) {
    if (puzzle[row][i] === n) return false;
  }

  // Check the column
  for (let j = 0; j < 9; j++) {
    if (puzzle[j][col] === n) return false;
  }

  // Define top-left of the 3x3 box
  let y0 = Math.floor(row / 3) * 3;
  let x0 = Math.floor(col / 3) * 3;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (puzzle[y0 + i][x0 + j] === n) return false;
    }
  }

  return true;
}

function solve(puzzle) {
  let thePuzzle = puzzle.slice();

  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (thePuzzle[y][x] === 0) {
        for (let n = 1; n < 10; n++) {
          if (possible(thePuzzle, y, x, n)) {
            thePuzzle[y][x] = n;
            if (solve(thePuzzle)) return thePuzzle;
            thePuzzle[y][x] = 0;
          }
        }
        return false;
      }
    }
  }
  return thePuzzle;
}

function setNotes(cell, digit) {
  let digitstr = String(digit);

  if (digit === 0) {
    // Entering 0 in notes mode should clear the notes
    cell.notes = '';
    return;
  } 

  if (cell.notes.includes(digitstr)) {
    // Remove
    cell.notes = cell.notes.replace(digitstr, '');
  } else {
    // Add
    cell.notes += digitstr;
    cell.notes = cell.notes.split('').sort().join('');
  }
}

class SudokuApp extends React.Component {
  setupGame() {
    const board = puzzleToBoard(puzzle);
    this.setState({ notesMode: false, complete:false });
    this.setState({ board });

    const solved = solve(puzzle);
    this.solution = solved;
  }

  componentDidMount() {
    this.setupGame();
  }

  checkCell(index) {
    let board = this.state.board.slice();
    let theRow = Math.floor(index / 9);
    let theCol = index % 9;
    let cell = board[theRow][theCol];

    console.log(cell);

    if (cell.value !== 0 && cell.value !== this.solution[theRow][theCol]) {
      cell.wrong = true;
    }

    this.setState({ board });

    this.checkBoard();
  }

  checkBoard() {
    let board = this.state.board.slice();

    for (let row of board) {
      for (let cell of row) {
        if (cell.value === 0) return;
        if (cell.wrong) return;
      }
    }

    this.setState({ complete: true });
  }

  handleClick(ii) {
    if (this.state.complete) return;

    let theRow = Math.floor(ii / 9);
    let theCol = ii % 9;

    // Define top-left of the 3x3 box
    let y0 = Math.floor(theRow / 3) * 3;
    let x0 = Math.floor(theCol / 3) * 3;

    let board = this.state.board.slice();

    // iterate through every cell
    for (let yy = 0; yy < board.length; yy++) {
      let row = board[yy];

      for (let xx = 0; xx < row.length; xx++) {
        let col = row[xx];

        col.selected = false;
        col.highlighted = false;

        // if matching row or col, set as highlighted
        if (yy === theRow || xx === theCol) {
          col.highlighted = true;
        }
      }
    }

    // highlight the cells in the same box as the one selected
    for (let y1 = 0; y1 < 3; y1++) {
      for (let x1 = 0; x1 < 3; x1++) {
        board[y1 + y0][x1 + x0].highlighted = true;
      }
    }

    // finally, set the selected cell to be selected
    board[theRow][theCol].selected = !board[theRow][theCol].selected;

    this.setState({ board });
  }

  handleKeyDown(event, index) {
    console.log("cell #" + index + ", keycode " + event.keyCode);

    if (this.state.complete) return;

    let board = this.state.board.slice();
    let theRow = Math.floor(index / 9);
    let theCol = index % 9;
    let cell = board[theRow][theCol];

    // Switch on keycode
    let keycode = event.keyCode;
    if (keycode >= 37 && keycode <= 40) {
      // 37 - L, 38 - U, 39 - R, 40 - D
      if (keycode === 37) {
        if (theCol === 0) return;
        index -= 1;
      }
      else if (keycode === 38) {
        if (theRow === 0) return;
        index -= 9;
      }
      else if (keycode === 39) {
        if (theCol === 8) return;
        index +=1;
      }
      else {
        if (theRow === 8) return;
        index +=9;
      }

      let newCell = document.getElementById("cell" + index)
      // Need to give the next cell focus so that the keyboard continues to work
      newCell.focus();
      // Calling click() will simulate a click which will be handled as usual
      newCell.click();
    }
    else if ((keycode >= 48 && keycode <= 57) || keycode === 8 || keycode === 46) {
      // 0-9 is 48-57
      // 8: backspace; 46: delete - both should empty the current cell
      if (cell.fixed) {
        return;
      }
      
      let digit = keycode - 48; 
      if (digit < 0) digit = 0;

      if (this.state.notesMode) {
        cell = setNotes(cell, digit);
      } else {
        cell.value = digit;
        cell.wrong = false;
      }
      this.setState({ board });

      // Now check for errors
      this.checkCell(index);
    }
    else if (keycode === 78) {
      // 78: N key - toggle notes mode
      this.setState({ notesMode: !this.state.notesMode });
    }
    else {
      return;
    }
  }

  renderSquare(cell, complete) {
    return <Square key={cell.index} cell={cell} complete={complete} onClick={() => this.handleClick(cell.index)} onKeyDown={(e) => this.handleKeyDown(e, cell.index)} />;
  }

  completeBoard() {
    let board = this.state.board.slice();

    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        board[y][x].value = this.solution[y][x];
      }
    }

    this.setState({ board });
  }

  render(){
    let ix = 0;
    if (this.state && this.state.board) {
      return (
        <div className="SudokuApp">
          <table><tbody>
            {
              this.state.board.map((row) => {
                return (
                  <tr key={ix++}>
                    { 
                      row.map((cell) => {
                        return this.renderSquare(cell, this.state.complete);
                      })
                    }
                  </tr>
                )
              })
            }
          </tbody></table>
          <div>
            <span>Notes <b>{this.state.notesMode ? 'On' : 'Off'}</b> - press N to toggle</span>
          </div>
          {/* <div>
            <button onClick={() => this.completeBoard()}>Complete</button>
          </div> */}
        </div>
      );
    } else {
      return <div className="SudokuApp">Loading...</div>
    }
  }
}

export default SudokuApp;
