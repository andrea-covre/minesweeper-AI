/**
 * @class AI1
 * @classdesc AI that can play minesweeper based on risk, knowledge and knowledge gain mappings
 * @fileoverview class's constructor and necessary functions
 * @author Andrea Covre <andrea.covre@icloud.com>
 * @version 1.0
 * Date: April 16th, 2021
 */

 class AI2 {

    /**
     * Create an instance of AI1 with only the allowable data and initialize the maps 
     * @param {int}     rows        of the board
     * @param {int}     cols        of the board
     * @param {Array}   safe        coordinates of the first safe square
     * @param {int}     numBombs    number of bombs present in the board
     */

    constructor (rows, cols, safe, numBombs) {
        this.rows = rows;
        this.cols = cols;
        this.safe = safe;
        this.numBombs = numBombs;
        this.bombsLocation = [];
        this.knowledge = [];
        //this.riskKnowledgeGain = [];
        this.untaintedKnowledge = [];
        this.explorativeKnowledgeGain = [];
        this.maxValue = 8;
        this.gridOrder = [];
        this.nextGridOrderOptions = [];
        this.nextRiskOptions = [];
        this.nextMove = [this.safe[1], this.safe[0]];
        this.isActive = true;
        this.isLooping = false;
        this.printLogs = false;
        this.display = true;
        this.bombsHit = 0;
        this.generateGridOrder();
        
        for (let i = 0; i < this.rows; i++) {
            let row = [];
            let rowExpGain = [];
            let rowUntainted = [];
            for (let j = 0; j < this.cols; j++) {
                if (j == this.safe[0] && i == this.safe[1]) {
                    row.push([0, "S"]);
                } else {
                    row.push([0, "U"]);
                }
                rowUntainted.push(0);
                rowExpGain.push(0);
            }
            this.untaintedKnowledge.push(rowUntainted);
            this.knowledge.push(row);
            this.explorativeKnowledgeGain.push(rowExpGain);
          }
    }


    /**
     * This function generates a list of cells that orderly spaced on the grid 
     * as to decrease the number of isolated unmined squares 
     */
    

    generateGridOrder() {
        for (let i = 1; i < this.rows; i = i + 3) {
            for (let j = 1; j < this.cols; j = j + 3) {
                if (i < this.rows && j < this.cols) {
                    this.gridOrder.push([i, j]);
                }
            }
        }
    }


    //At each mine updated the knowledge
    /**
        @----: when deciding what sqaure to mine based on knowledge add +1 for each U square + the U square value
        @TODO: always preferr to mine safe saqures
                    - choose highest knowledge sum
                    - if tie: choses highest explorative knoledge

                    or

                    - prefer risk knowledge (when tie EK) and when risk > (&=? : prolly) explorativeK -> bomb


        @TODO: know when a x-U square is a bomb when x > than the # of unmined saqures around
    **/


    /**
     * Function called whenever a new square is mined that integrates the new knowledge given by the board
     * after mining a square, start the procedures needed to update all the knowledge maps and compute the next move.
     * @param {int} x       coordinate of the square mined
     * @param {int} y       coordinate of the square mined
     * @param {int} mined   value of the mined square
     */

    update(x, y, mined) {
        if (mined == "Bomb!") {
            mined  = "X";
            this.bombsLocation.push([y, x]);
            if (board.endGameOnBomb) {
                this.isActive = false;
            } else {
                this.knowledge[y][x][0] = 9;
                this.knowledge[y][x][1] = "X";  //marking the cell as a bomb
                this.bombsHit++;
            }
        } else {
            this.untaintedKnowledge[y][x] = mined;
            this.knowledge[y][x][0] = mined;
            this.knowledge[y][x][1] = "M";     //marking the cell as mined
        }

        this.updateProcedure();
    }

    /**
     * Execute the update steps needed
     * The update routine is:
     *              - offset the mined values           -> offsetMinedValues()
     *              - update knowledge                  -> updateKnowledge()
     *              - update knowledge gain maps        -> updateKnowledgeGain()
     *              - compute the next move             -> getNextMove()
     */

    updateProcedure() {
        this.offsetMinedValues();
        this.updateKnowledge();
        this.updateKnowledgeGain();
        this.getNextMove();
    }


    /**
     * Offest mined squares based on the mines already identified
     */

    offsetMinedValues() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if  (this.knowledge[i][j][1] == "M") {
                    let i_T;
                    let j_T;

                    this.knowledge[i][j][0] = this.untaintedKnowledge[i][j];

                    //Loop for a 3x3 moving kernel
                    for (let k = -1; k <= 1; k++) {
                        for (let w = -1; w <= 1; w++) {
                            i_T = i + k;
                            j_T = j + w;

                            //Guarding the boundaries, don't compute the kernel cells that are outside the board
                            if (i_T >= 0 && i_T < this.rows && j_T >= 0 && j_T < this.cols) { 

                                //If the current square was mined and the square we are checking is a bomb, then decrease
                                //the mined value of the current square
                                if (this.knowledge[i_T][j_T][1] == "X" || this.knowledge[i_T][j_T][1] == "H") {
                                    this.knowledge[i][j][0]--;
                                }

                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Update the knowledge maps related to the square flags and risk scores
     */

    updateKnowledge() {
        let newKnowledge = JSON.parse(JSON.stringify(this.knowledge));


        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {

                if  (this.knowledge[i][j][1] != "M") {

                    let i_T;
                    let j_T;

                    if  (this.knowledge[i][j][1] == "U") {
                        newKnowledge[i][j][0] = 0;
                    }

                    for (let k = -1; k <= 1; k++) {
                        for (let w = -1; w <= 1; w++) {
                            i_T = i + k;
                            j_T = j + w;

                            if (i_T >= 0 && i_T < this.rows && j_T >= 0 && j_T < this.cols) {

                                //If the this nearby square is == 0, then the current square is safe and flag it with 'S'
                                if (this.knowledge[i_T][j_T][1] == "M") {
                                    if (this.knowledge[i_T][j_T][0] == 0 && newKnowledge[i][j][1] == "U") {
                                        newKnowledge[i][j][1] = "S";
                                    }
                                }

                                //Increase the risk score of the current square based on the mined value of this nearby square 
                                if (this.knowledge[i_T][j_T][0] != 0 && newKnowledge[i][j][1] == "U" && this.knowledge[i_T][j_T][1] == "M") {
                                    newKnowledge[i][j][0] += this.knowledge[i_T][j_T][0];
                                }

                            }
                        }
                    }
                }
            }
        }
        this.knowledge = JSON.parse(JSON.stringify(newKnowledge));
        if (this.printLogs)
            print("     AI-1 > Knowledge Updated");
    }


    /**
     * This function follows the same procedures as update(), but updates the knowledge gain map
     * which can only be updated once the knowledge map has been updated from the lates mining 
     */

    updateKnowledgeGain() {

        //Reset the arrays of next moves
        this.nextRiskOptions = [];

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {

                this.explorativeKnowledgeGain[i][j] = 0;

                if  (this.knowledge[i][j][1] != "M") {

                    let i_T;
                    let j_T;

                    for (let k = -1; k <= 1; k++) {
                        for (let w = -1; w <= 1; w++) {
                            i_T = i + k;
                            j_T = j + w;
                            if (i_T >= 0 && i_T < this.rows && j_T >= 0 && j_T < this.cols) { //&& !(i_T == 0 && j_T == 0)) {

                                //Increase explorative knowledge gain based on how many non-mined squares are around
                                if (this.knowledge[i_T][j_T][1] == "U") {
                                    this.explorativeKnowledgeGain[i][j]++;
                                }

                            }
                        }
                    }
                }

                //Consider only the unsafe squares
                if (this.knowledge[i][j][1] == "U") {

                    //If no option yet, then add the current square to the list
                    if (this.nextRiskOptions.length == 0) {
                        this.nextRiskOptions = [[i, j]];

                    } else {
                        
                        
                        //If the current square has the highest risk knowledge gain so far then make it the new record
                        if (this.knowledge[i][j][0] > this.knowledge[this.nextRiskOptions[0][0]][this.nextRiskOptions[0][1]][0]) {
                            this.nextRiskOptions = [[i, j]];

                        //If the current square has the same record high risk then check explorative knowledge gain
                        } else if (this.knowledge[i][j][0] == this.knowledge[this.nextRiskOptions[0][0]][this.nextRiskOptions[0][1]][0]) {

                            //If the current square has the highest explorative knowledge gain then make it the new record
                            if (this.explorativeKnowledgeGain[i][j] > this.explorativeKnowledgeGain[this.nextRiskOptions[0][0]][this.nextRiskOptions[0][1]]) {
                                this.nextRiskOptions = [[i, j]];

                            //If the current square has the same record high risk and explorative knowledge gain then add it to the other records
                            } else if (this.explorativeKnowledgeGain[i][j] == this.explorativeKnowledgeGain[this.nextRiskOptions[0][0]][this.nextRiskOptions[0][1]]) {
                                this.nextRiskOptions.push([i, j]);
                            }
                        }
                    
                        

                        // //If the current square has the highest explorative knowledge gain then make it the new record
                        // if (this.explorativeKnowledgeGain[i][j] > this.explorativeKnowledgeGain[this.nextRiskOptions[0][0]][this.nextRiskOptions[0][1]]) {
                        //     this.nextRiskOptions = [[i, j]];

                        // //If the current square has the same record high risk and explorative knowledge gain then add it to the other records
                        // } else if (this.explorativeKnowledgeGain[i][j] == this.explorativeKnowledgeGain[this.nextRiskOptions[0][0]][this.nextRiskOptions[0][1]]) {
                        
                        //     //If the current square has the highest risk knowledge gain so far then make it the new record
                        //     if (this.knowledge[i][j][0] > this.knowledge[this.nextRiskOptions[0][0]][this.nextRiskOptions[0][1]][0]) {
                        //         this.nextRiskOptions = [[i, j]];
    
                        //     //If the current square has the same record high risk then check explorative knowledge gain
                        //     } else if (this.knowledge[i][j][0] == this.knowledge[this.nextRiskOptions[0][0]][this.nextRiskOptions[0][1]][0]) {
                        //         this.nextRiskOptions.push([i, j]);

                        //     }
                        // }




                    }
                }
            }
        }
        if (this.printLogs)
            print("     AI-2 > Knowledge gain map updated");
    }



    /**
     * Gets the next move prioritizing risk, and then explorative gain
     */

    getNextMove() {

        //if all bombs have been found or if there is not other smart move then close the game
        if (this.bombsHit == this.numBombs || this.nextRiskOptions.length == 0) {
            this.isActive = false;
            this.isLooping = false;
            gameOver = true;
            board.won = true;
            board.correctBombLocations = this.bombsHit;
            return;
        }

        //updating the next best grid order option including all the grid order options with max explorative gain 
        this.nextGridOrderOptions = [];
        for (let i = 0; i < this.gridOrder.length; i++) {
            if (this.explorativeKnowledgeGain[this.gridOrder[i][0]][this.gridOrder[i][1]] == 9) {
                this.nextGridOrderOptions.push(this.gridOrder[i]);
            }
        }

        //this.nextGridOrderOptions = [];  //uncomment to deactivate nextGridOrder

        //If there is no next risk option available with positve risk then pick an option from the grid order
        if (this.knowledge[this.nextRiskOptions[0][0]][this.nextRiskOptions[0][1]][0] == 0 &&
            this.nextGridOrderOptions.length != 0) {
        
            //this.nextMove = this.nextUnsafeOptions[Math.floor(Math.random() * this.nextUnsafeOptions.length)];
            this.nextMove = this.nextGridOrderOptions[0];


        //otherwise pick randomly one of the highest risk score squares (and then highest explorative gain)
        } else {
            this.nextMove = this.nextRiskOptions[Math.floor(Math.random() * this.nextRiskOptions.length)];
        }

        if (this.printLogs)
            print("     AI-2 > Next move: " + "(" + this.nextMove[1] + "|" + this.nextMove[0] + ")");

    }


    /**
     * This function draws the AI's point of view, therefore:
     *      - Heat map of the risk and safe squares
     *          - Gray      -> mined
     *          - Green     -> safe square
     *          - Yellow    -> risky square
     *          - Red       -> very risky square, or sqaure  with no knowledge available about it  
     *          - Violet    -> square where a bomb has been identified 
     * 
     *      - Squares data in format: [square risk value]-[flag]
     *                                [risk knowledge gain]-[explorative knowledge gain]
     *          - [square risk value] is either the mined value or the sum of the mined values around
     *          - [flag]:
     *              - S -> safe
     *              - M -> mined
     *              - U -> unknown (no knowledge available)
     *              - X -> bomb
     *          - [risk knowledge gain] is the amount of knowledge about risk that the AI will gain by mining this square
     *          - [explorative knowledge gain] is amount of nearby-non-mined squares 
     *              these values are used to chose the next square to mine, chose where to investigate mines and how to 
     *              and when identify a bomb
     */

    show() {
        if (this.display) {
            drawAxis(offset, this.rows * spacing + tableSpacingFactor * offset);
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    setGradiant(this.knowledge[i][j], this.maxValue);
                    strokeWeight(1);
                    stroke(0);
                
                    textSize(spacing * 0.3);
                    
                    let stringText;
                    if  (this.knowledge[i][j][1] ==  "X") {
                        fill(0);
                        rect(offset + j * spacing, this.rows * spacing + tableSpacingFactor * offset + i * spacing, spacing, spacing);

                        fill(255, 0, 0);
                        strokeWeight(2);
                        //textSize(spacing * 0.8);                                       --> deactivated for debugging porupsase
                        //stroke(255, 0, 0);
                        stringText = this.knowledge[i][j][0] + " " + this.knowledge[i][j][1] + 
                        "\n" + this.explorativeKnowledgeGain[i][j];
                        //stringText = "X";                                             --> deactivated for debugging porupsase

                    } else {
                        rect(offset + j * spacing, this.rows * spacing + tableSpacingFactor * offset + i * spacing, spacing, spacing);
                        fill(0);
                        strokeWeight(0);

                        stringText = this.knowledge[i][j][0] + " " + this.knowledge[i][j][1] + 
                        "\n" + this.explorativeKnowledgeGain[i][j];
                    }

                    textAlign(CENTER, CENTER);
                    text(stringText, (offset + j * spacing) + spacing * 0.5, 
                                    (this.rows * spacing + tableSpacingFactor * offset + i * spacing)  + spacing * 0.55);
    
                }
            }
        }
    }

    /**
     * Automatically play the next move if "Play Game" was selected
     * @param {boolean} isLooping indicates if AI1 is playing the game
     */

    playNext(isLooping) {
        if (isLooping) {
            board.mine(ai1.nextMove[1], ai1.nextMove[0]);
        }

    }
}