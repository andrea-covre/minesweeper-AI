/**
 * @fileoverview Game engine for Minesweeper
 * @author Andrea Covre <andrea.covre@icloud.com>
 * @version 1.0
 * Date: April 16th, 2021
 */


let boardFile = 'tests/test3.json';
let gameOver = false;

/**
 * Preload all the necessary files
 */

function preload() {
  data = loadJSON(boardFile);
}


/**
 * Initialize the game engine by creating the necessary objects and instances of
 * the board and AIs  
 */

function setup() {
  createCanvas(2000, 2000);
  reset();
  dispalyAIControls();
}

/**
 * Loop continusly while updating the in-canvas graphics
 */

function draw() {
  background(255);
  ai1.playNext(ai1.isLooping);
  ai1.show();
  board.show();


  //Endgame
  if (!board.isActive && !gameOver) {
    if(board.won) {
      gameOver = true;
      print("WIN!" +  
            "\n - Squares mined: " + board.accesses +
            "\n - Correct bombs found: " + board.correctBombLocations + "/" + board.numBombs);
    } else {
      gameOver = true;
      print("GAME OVER!" +  
            "\n - Squares mined: " + board.accesses +
            "\n - Correct bombs found: " + board.correctBombLocations + "/" + board.numBombs);
    }
  }
}


/**
 * Resets the game
 */
function reset() {
  board = new Board(data);
  ai1 = new AI1(board.rows, board.cols, board.safe, board.numBombs);
  board.setup();
  gameOver = false;
}



