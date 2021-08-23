import './App.css';
import React from 'react';

function Square(props) {
  let classname = "square";

  if (props.cell.selected) {
    classname += " selected";
  } else if (props.cell.highlighted) {
    classname += " highlighted";
  }

  if (props.cell.fixed) {
    classname += " fixed";
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
      {props.cell.value !== 0 ? props.cell.value : ''}
    </td>
  );
}

function Cell(index, value) {
  this.index = index;
  this.value = value;
  this.selected = false;
  this.highlighted = false;
  this.fixed = false;
}

const puzzle = [
  [2, 0, 3, 0, 0, 8, 6, 0, 7],
  [1, 4, 0, 7, 2, 6, 0, 0, 9],
  [5, 0, 7, 1, 3, 9, 4, 2, 8],
  [0, 2, 5, 0, 8, 1, 9, 0, 4],
  [4, 1, 0, 9, 0, 3, 2, 0, 5],
  [0, 7, 9, 2, 0, 5, 0, 3, 6],
  [6, 0, 2, 0, 1, 0, 0, 9, 3],
  [7, 0, 0, 5, 0, 2, 0, 0, 1],
  [0, 8, 1, 3, 6, 7, 0, 4, 0]
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

class SudokuApp extends React.Component {
  setupGame() {
    const board = puzzleToBoard(puzzle);
    this.setState({ board });
  }

  componentDidMount() {
    this.setupGame();
  }

  handleClick(ii) {
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
      cell.value = digit;
      this.setState({ board });
    }
    else {
      return;
    }
  }

  renderSquare(cell) {
    return <Square key={cell.index} cell={cell} onClick={() => this.handleClick(cell.index)} onKeyDown={(e) => this.handleKeyDown(e, cell.index)} />;
  }

  render(){
    console.log(this.state);
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
                        return this.renderSquare(cell);
                      })
                    }
                  </tr>
                )
              })
            }
          </tbody></table>
        </div>
      );
    } else {
      return <div className="SudokuApp">Loading...</div>
    }
  }
}

export default SudokuApp;
