/**
 * @class AI1
 * @classdesc AI that can play minesweeper based on risk, knowledge and knowledge gain mappings
 * @fileoverview class's constructor and necessary functions
 * @author Andrea Covre <andrea.covre@icloud.com>
 * @version 1.0
 * Date: April 16th, 2021
 */

class AI1 {

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
        this.bombsFound = 0;
        this.bombsLocation = [];
        this.untaintedKnowledge = []
        this.knowledge = [];
        this.riskKnowledgeGain = [];
        this.explorativeKnowledgeGain = [];
        this.maxValue = 8;
        this.nextOptions = [];
        this.nextUnsafeOptions = [];
        this.nextMove = [this.safe[1], this.safe[0]];
        this.isActive = true;
        this.isLooping = false;
        this.printLogs = false;
        this.display = true;
        this.bombsHit = 0;
        
        for (let i = 0; i < this.rows; i++) {
            let row = [];
            let rowUntainted = [];
            let rowRiskGain = [];
            let rowExpGain = [];
            for (let j = 0; j < this.cols; j++) {
                if (j == this.safe[0] && i == this.safe[1]) {
                    row.push([0, "S"]);
                } else {
                    row.push([0, "U"]);
                }
                rowUntainted.push(0);
                rowRiskGain.push(0);
                rowExpGain.push(0);
            }
            this.untaintedKnowledge.push(rowUntainted);
            this.knowledge.push(row);
            this.riskKnowledgeGain.push(rowRiskGain);
            this.explorativeKnowledgeGain.push(rowExpGain);
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
     * The updated routine is:
     *              - offset the mined values           -> 
     *              - update knowledge                  -> updateKnowledge()
     *              - update knowledge gain maps        -> updateKnowledgeGain()
     *              - check for bombs                   -> lookForBombs() 
     *              - compute the next move;
     * @param {int} x       coordinate of the square mined
     * @param {int} y       coordinate of the square mined
     * @param {int} mined   value of the mined square
     */

    update(x, y, mined) {
        if (mined == "Bomb!") {
            mined  = "X";
            if (board.endGameOnBomb) {
                this.isActive = false;
            } else {
                this.knowledge[y][x][0] = 9;
                this.knowledge[y][x][1] = "H"; 
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
     */

    updateProcedure() {
        this.offsetMinedValues();
        this.updateKnowledge();
        this.updateKnowledgeGain();
        this.lookForBombs();
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
                if (newKnowledge[i][j][1] == "U") {
                    newKnowledge[i][j][0] = 0;
                }

                if  (this.knowledge[i][j][1] != "M") {

                    let i_T;
                    let j_T;

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
        this.nextOptions =  [];
        this.nextUnsafeOptions = [];

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {

                this.riskKnowledgeGain[i][j] = 0;
                this.explorativeKnowledgeGain[i][j] = 0;

                if  (this.knowledge[i][j][1] != "M") {

                    let i_T;
                    let j_T;

                    for (let k = -1; k <= 1; k++) {
                        for (let w = -1; w <= 1; w++) {
                            i_T = i + k;
                            j_T = j + w;
                            if (i_T >= 0 && i_T < this.rows && j_T >= 0 && j_T < this.cols) { //&& !(i_T == 0 && j_T == 0)) {
                                

                                //Checking if this nearby square wasn't mined, if so increase the value of gainable knolwdge by mining 
                                //the current square.
                                if (this.knowledge[i_T][j_T][1] == "U") {
                                    this.riskKnowledgeGain[i][j] += this.knowledge[i_T][j_T][0];   // <=========K sqaures near bombs are more intrestng 
                                }


                                //Increase explorative knowledge gain based on how many non-mined squares are around
                                if (this.knowledge[i_T][j_T][1] == "U") {
                                    this.explorativeKnowledgeGain[i][j]++;
                                }

                            }
                        }
                    }
                }

                //Collecting the next possible moves by only considering safe squares
                if (this.knowledge[i][j][1] == "S") {

                    //If no next moves so far, then save the first available safe square
                    if (this.nextOptions.length == 0) {
                        this.nextOptions = [[i, j]];

                    } else  {

                        //If the current square has the highest risk knowledge gain so far then make it the new record
                        if (this.riskKnowledgeGain[i][j] > this.riskKnowledgeGain[this.nextOptions[0][0]][this.nextOptions[0][1]]) {
                            this.nextOptions = [[i, j]];
                
                        //If the current square has the same record high risk knowledge gain then check explorative knowledge
                        } else if (this.riskKnowledgeGain[i][j] == this.riskKnowledgeGain[this.nextOptions[0][0]][this.nextOptions[0][1]]) {

                            //If the current square has the highest explorative knowledge gain then make it the new record
                            if (this.explorativeKnowledgeGain[i][j] > this.explorativeKnowledgeGain[this.nextOptions[0][0]][this.nextOptions[0][1]]) {
                                this.nextOptions = [[i, j]];

                            //If the current square has the same record high risk and explorative knowledge gain then add it to the other records
                            } else if (this.explorativeKnowledgeGain[i][j] == this.explorativeKnowledgeGain[this.nextOptions[0][0]][this.nextOptions[0][1]]) {
                                this.nextOptions.push([i, j]);
                            }
                        }
                    }
                
                //Collecting the next possible moves by only considering unsafe squares in case no safe move is possible
                } else if (this.knowledge[i][j][1] == "U") {

                    //If no next moves so far, then save the first available safe square
                    if (this.nextUnsafeOptions.length == 0) {
                        this.nextUnsafeOptions = [[i, j]];

                    } else  {

                        //If the current square has a lower risk score than the record than make it the next option
                        if (this.knowledge[i][j][0] - this.explorativeKnowledgeGain[i][j] < 
                            this.knowledge[this.nextUnsafeOptions[0][0]][this.nextUnsafeOptions[0][1]][0] - 
                            this.explorativeKnowledgeGain[this.nextUnsafeOptions[0][0]][this.nextUnsafeOptions[0][1]]) {

                            this.nextUnsafeOptions = [[i, j]];

                        //If the current square has a risk score equal to the record than add it to the next options
                        } else if (this.knowledge[i][j][0] - this.explorativeKnowledgeGain[i][j] == 
                            this.knowledge[this.nextUnsafeOptions[0][0]][this.nextUnsafeOptions[0][1]][0] - 
                            this.explorativeKnowledgeGain[this.nextUnsafeOptions[0][0]][this.nextUnsafeOptions[0][1]]) {

                            this.nextUnsafeOptions.push([i, j]);
                        }
                    }
                }
            }
        }
        if (this.printLogs)
            print("     AI-1 > Knowledge gain map updated");
    }

    /**
     * This function checks each 'U' square, if the risk value >= explorative knowledge gain then the square is a bomb
     */

    lookForBombs() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.knowledge[i][j][1] == "U" && 
                    this.knowledge[i][j][0] > this.explorativeKnowledgeGain[i][j] &&  // >= (most accurate) | >  (the safest)
                    this.knowledge[i][j][0] > 0 ) {

                    this.knowledge[i][j][1] = "X";
                    this.bombsLocation.push([i, j]);
                    if (this.printLogs)
                        print("     AI-1 > Mine found at: (" + j + "|" + i + ")");

                    if (this.bombsLocation.length + this.bombsHit == this.numBombs) {
                        if (this.printLogs)
                            print("     AI-1 > All bombs found!!!");
                        this.isActive = false;
                        board.verify(this.bombsLocation);

                    } else {
                        if (this.printLogs)
                            print("     AI-1 > Updating Knowledge Again");
                        //Restart the update procedure since a bomb has been identified 
                        this.updateProcedure();
                    }
                }
            }
        }
    }


    /**
     * Gets the next move
     */

    getNextMove() {
        if (this.nextOptions.length == 0 || 
            (this.riskKnowledgeGain[this.nextOptions[0][0]][this.nextOptions[0][1]] == 0 &&
            this.explorativeKnowledgeGain[this.nextOptions[0][0]][this.nextOptions[0][1]] == 0)) {
        
            //if no safe move is available pick an unsafe one
            this.nextMove = this.nextUnsafeOptions[Math.floor(Math.random() * this.nextUnsafeOptions.length)];

        } else {
            this.nextMove = this.nextOptions[Math.floor(Math.random() * this.nextOptions.length)];
        }

        if (this.printLogs)
            print("     AI-1 > Next move: " + "(" + this.nextMove[1] + "|" + this.nextMove[0] + ")");

        if (this.nextMove == undefined) {
            this.isActive = false;
            this.isLooping = false;
            board.verify(this.bombsLocation);
        }
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
                        "\n" + this.riskKnowledgeGain[i][j] + " " + this.explorativeKnowledgeGain[i][j];
                        //stringText = "X";                                             --> deactivated for debugging porupsase

                    } else {
                        rect(offset + j * spacing, this.rows * spacing + tableSpacingFactor * offset + i * spacing, spacing, spacing);
                        fill(0);
                        strokeWeight(0);

                        stringText = this.knowledge[i][j][0] + " " + this.knowledge[i][j][1] + 
                        "\n" + this.riskKnowledgeGain[i][j] + " " + this.explorativeKnowledgeGain[i][j];
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