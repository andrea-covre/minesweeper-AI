/**
 * @class Board
 * @classdesc Create Board objects that contain the game data and past interactions
 * @fileoverview Board class for managing and interacting with game data
 * @author Andrea Covre <andrea.covre@icloud.com>
 * @version 1.0
 * Date: April 16th, 2021
 */

class Board {

  /**
   * Create Board object from a parsed JSON file
   * @param {JSONObject} data parsed JSON data containing the information about the board
   */

  constructor(data) {
    let dim = data["dim"].split(",");
    this.rows = dim[0];                       // # of rows of the board
    this.cols = dim[1];                       // # of cols of the board
    this.safe = [data["safe"].split(",")[1], data["safe"].split(",")[0]];
    this.numBombs = int(data["bombs"]);       // # of bombs in the board
    this.isActive = true;                     // status of the game
    this.board = [];                          // map of the board
    this.wasVisited = [];                     // map of already mined squares

    //Performance attributes
    this.accesses = 0;                        // # of times the board was read
    this.correctBombLocations = 0;            // # of correctly indentified bombs
    this.won = false;

    this.resetButton = createButton("Reset"); // Reset button
    this.endGameOnBomb = false;                // If true mining a bomb will end the game

    for (let i = 0; i < this.rows; i++) {
      let row = [];
      let vistedRow = [];
      for (let j = 0; j < this.cols; j++) {
        row.push(int(data["board"].charAt(i * this.cols + j)));
        vistedRow.push(false);
      }
      this.board.push(row);
      this.wasVisited.push(vistedRow);
    }

  }


  /**
   * Mine the indicated square and start the necessesary update procedures
   * @param {int} x coordinate of the square to mine
   * @param {int} y coordinate of the square to mine
   * @returns the value of the square mined
   */

  mine(x, y) {
    if (this.isActive) {
      let mined = this.board[y][x];

      this.accesses++;
      this.wasVisited[y][x] = true;
  
      this.buttonGrid[y][x].remove();
      this.buttonGrid[y][x] = createButton(this.board[y][x]);
      this.buttonGrid[y][x].position(offset + x * spacing, offset + y * spacing)
      this.buttonGrid[y][x].size(spacing, spacing);
      this.buttonGrid[y][x].style('font-size', '18px')
      if (mined == 9) {
        mined = "Bomb!";
        if (this.endGameOnBomb) {
          this.isActive = false;
          this.verify(ai1.bombsLocation);
        }
        this.buttonGrid[y][x].style('background-color', 'red')
      }

      if (this.accesses == this.cols * this.rows) {
        this.isActive = false;
      }
  
      print(this.accesses + ": Mined (" + x + "|" + y + "): " + mined);
  
      ai1.update(x, y, mined);
  
      return mined;
    }
    return 0;
  }


  /**
   * Generate the grid of the playable buttons that represents the board
   */

  setup() {
    this.buttonGrid = [];
    for (let i = 0; i < this.rows; i++) {
      let buttonRow = []
      for (let j = 0; j < this.cols; j++) {
        if (j == this.safe[0] && i == this.safe[1]) {
          buttonRow.push(createButton("S"));
          buttonRow[j].style('background-color', 'lime');
        } else {
          buttonRow.push(createButton(" "));
          buttonRow[j].style('background-color', 'gray');
        }
        buttonRow[j].position(offset + j * spacing, offset + i * spacing)
        buttonRow[j].size(spacing, spacing);
        buttonRow[j].style('font-size', '18px')
        buttonRow[j].mouseClicked(function() {
          if (board.isActive) {
            board.mine(j, i);
          }
        });

      }
      this.buttonGrid.push(buttonRow);
    }

    this.resetButton.position(this.cols * spacing + tableSpacingFactor * offset * 2.6, this.rows / 2 * spacing + spacing * 8);
    this.resetButton.style('font-size', '18px');
    this.resetButton.style('background-color', 'LightSteelBlue');
    this.resetButton.mouseClicked(function() {
      reset();
    });
  }


  /**
   * Draw the graphical elements of the board that live in the canvas
   */

  show() {
    //drawAxis(offset, offset);
    textSize(spacing * 0.8); 

    text("Dimensions: " + this.rows + "x" + this.cols, this.cols * spacing + tableSpacingFactor * offset * 3, 
      this.rows / 2 * spacing + spacing * 1);

    text("Bombs #: " + this.numBombs, this.cols * spacing + tableSpacingFactor * offset * 3, 
      this.rows / 2 * spacing + spacing * 2);

    text("Bomb density: " + Math.round(this.numBombs/(this.rows*this.cols)*10000)/100 + "%", this.cols * spacing + tableSpacingFactor * offset * 3, 
      this.rows / 2 * spacing + spacing * 3);

    text("Number of moves: " + this.accesses + " (" + Math.round(this.accesses/(this.cols*this.rows)*10000)/100 + "%)",
      this.cols * spacing + tableSpacingFactor * offset * 3, 
      this.rows / 2 * spacing + spacing * 4);

    text("AI-1 estimated bomb locations: " + ai1.bombsLocation.length + "/" + ai1.numBombs, this.cols * spacing + tableSpacingFactor * offset * 3, 
      this.rows / 2 * spacing + spacing * 5);

    text("AI-1 bombs hit: " + ai1.bombsHit, this.cols * spacing + tableSpacingFactor * offset * 3, 
      this.rows / 2 * spacing + spacing * 6);
      

    let Status;
    if  (!gameOver) {
      status = "Status: In progress";
    } else {
      if (this.won) {
        fill(46, 139, 87);
        status = "Status: Won";
      } else  {
        fill(255, 0, 0);
        status = "Status: Lost";
      }
      status += " -> " + this.correctBombLocations + "/" + this.numBombs + " (" + Math.round(this.correctBombLocations/this.numBombs*10000)/100 + "%)";
    }
    text(status, this.cols * spacing + tableSpacingFactor * offset * 3, 
      this.rows / 2 * spacing + spacing * 7);

  }


  /**
   * Verify the correctness of the postion of the identified bombs and terminate the fame
   * @param {Array} answer Array containing the estimated postion of the bombs
   */

  verify(answer) {
    this.correctBombLocations = 0;
    this.isActive = false;
    for (let i = 0; i < answer.length; i++) {
       if (this.board[answer[i][0]][answer[i][1]] == 9) {
         this.correctBombLocations++;
       }
     }
    if (this.correctBombLocations == this.numBombs && answer.length == this.numBombs) {
      this.won = true;
    }
    //this.reveal();
  }


  /**
   * Reveal all the squares
   */

  reveal() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (!this.wasVisited[i][j]) {           // && this.board[i][j] == 9
          this.buttonGrid[i][j].remove();
          this.buttonGrid[i][j] = createButton(this.board[i][j]);
          this.buttonGrid[i][j].position(offset + j * spacing, offset + i * spacing)
          this.buttonGrid[i][j].size(spacing, spacing);
          this.buttonGrid[i][j].style('font-size', '18px')
            if (this.board[i][j] == 9) {
              this.buttonGrid[i][j].style('background-color', 'red')
            }
        }
      }
    }
  }
}