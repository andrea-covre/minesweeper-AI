/**
 * @fileoverview Useful graphics functions and constants
 * @author Andrea Covre <andrea.covre@icloud.com>
 * @version 1.0
 * Date: April 16th, 2021 
 */

var spacing = 30;
var offset = 50;
var tableSpacingFactor = 2.4;


/**
 * Draw the x and y axes
 * @param {int} xOffset horizontal offeset of the axis origin
 * @param {int} yOffset vertical offeset of the axis origin
 */

function drawAxis(xOffset, yOffset) {
    for (let i = 0; i <= board.cols; i++) {
      fill(0);
      strokeWeight(0);
      textAlign(CENTER, CENTER);
      textSize(spacing/2);
      if (i == board.cols) {
        text("x", xOffset + i * spacing + spacing / 2, yOffset - spacing / 2);
      } else {
        text(i, xOffset + i * spacing + spacing / 2, yOffset - spacing / 2);
      }
    }
  
    for (let i = 0; i <= board.rows; i++) {
      fill(0);
      strokeWeight(0);
      textAlign(CENTER, CENTER);
      textSize(spacing/2);
      if (i == board.rows) {
        text("y", xOffset - spacing / 2, yOffset + i * spacing + spacing / 2);
      } else {
        text(i, xOffset - spacing / 2, yOffset + i * spacing + spacing / 2);
      }
    }
  }
  

  /**
   * Set the fill value based on the mapping of the value parameter 
   * @param {int} value to be mapped
   * @param {int} max   cap of the mappable value
   */

  function setGradiant(value, max) {
    if (value[1] == "M") {
        fill(80, 80, 80);
    } else if (value[1] == "S") {
        fill(0, 255, 0);  
      } else if (value[1] == "H") {
        fill(230, 0, 172);  
    } else if (value[1] == "U" && value[0] != 0 ) {
        let t = (255 / max) * value[0];
        fill(255, 255-t, 0);
    } else if (value[1] == "U" && value[0] == 0 ) {
        fill(199, 48, 48);
    } else {
        fill(255, 0, 0);
    } 
  }


  /**
   * Draw the graphical elements necessary to control the AIs
   */

  function dispalyAIControls() {
    //Buttons

    //Play next AI-1
    let AI1_playNextButton = createButton("AI: Play Next");
    if(ai1.display) {
      AI1_playNextButton.position(offset + board.rows * spacing * 0.1, (board.rows * spacing) * 2 + (tableSpacingFactor * offset) * 1.2);
    } else {
      AI1_playNextButton.position(offset + board.rows * spacing * 0.1, (board.rows * spacing) * 1 + (tableSpacingFactor * offset) * 0.5);
    }
    AI1_playNextButton.style('font-size', '14px')
    AI1_playNextButton.style('color', 'white')
    AI1_playNextButton.style('background-color', '#006bb3')
    AI1_playNextButton.mouseClicked(function () {
        board.mine(ai1.nextMove[1], ai1.nextMove[0]);
    });

    //Play Game AI-1
    let AI1_playGameButton = createButton("AI: Play Game");
    if(ai1.display) {
      AI1_playGameButton.position(offset + board.rows * spacing * 0.5, (board.rows * spacing) * 2 + (tableSpacingFactor * offset) * 1.2);
    } else {
      AI1_playGameButton.position(offset + board.rows * spacing * 0.5, (board.rows * spacing) * 1 + (tableSpacingFactor * offset) * 0.5);
    }
    AI1_playGameButton.style('font-size', '14px')
    AI1_playGameButton.style('color', 'white')
    AI1_playGameButton.style('background-color', '#006bb3')
    AI1_playGameButton.mouseClicked(function () {
      if (gameOver) {
        reset();
      }
      ai1.isLooping  =  true;
    });
  }