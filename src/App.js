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
      onKeyPress={(e) => props.onKeyPress(e)}
      // tabIndex ensures onKeyPress works
      tabIndex="0"
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

  handleKeyPress(event, index) {
    console.log("cell #" + index + ", keycode " + event.charCode);

    let board = this.state.board.slice();
    let theRow = Math.floor(index / 9);
    let theCol = index % 9;
    let cell = board[theRow][theCol];

    if (cell.fixed) {
      return;
    }

    // charcodes: 0-9 is 48-57
    let charcode = event.charCode;
    if (charcode > 57 || charcode < 48) {
      return;
    }

    let digit = charcode - 48; 
    cell.value = digit;

    this.setState({ board });
  }

  renderSquare(cell) {
    return <Square key={cell.index} cell={cell} onClick={() => this.handleClick(cell.index)} onKeyPress={(e) => this.handleKeyPress(e, cell.index)} />;
  }

  render(){
    console.log(this.state);
    if (this.state && this.state.board) {
      return (
        <div className="SudokuApp">
          <table><tbody>
            {
              this.state.board.map((row) => {
                return (
                  <tr>
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
