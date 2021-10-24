# AI for Minesweeper

## Description

This algorithm plays Minesweeper through two kinds of behaviors. The first one is investigative and it
is actuated when the algorithms has already some information on where the bombs might be,
therefore it investigates those squares until the bomb's position is inferred with a certain degree of confidence. The second behavior is
explorative, and it is actuated when the algorithm has absolutely no clue of where the bombs
might be, so it probes the board to find clues by only opening squares that are guaranteed to be safe, if there is no safe square to open, then the AI will select the square with the lowest risk score and the highest knowledge gain. 

The algorithm maintains three different mappings of the board, the first one is an untainted map
of the values returned by the board when mined. The second one is a knowledge map that
contains the flag assigned to each square (S = safe, M = mined, U = unknown/not mined, X =
bomb, H = hit a bomb) and its risk score (the sum of the mined value of all the surrounding mined squares) if the
flag is U or the mined value if the flag is M. The third map is a knowledge gain map which
contains the amount of knowledge that would be gained by mining a specific square. If we mine
an isolated square with 8 not-mined squares around it, then we would gain knowledge
about 9 squares, the one mined plus the 8 neighbors, however if we mine a similar square that
has instead 3 square that we are already certain that they are safe, then the knowledge gained
from mining such square would only be 6.

This algorithm is the precursor of AI-0 in [minesweeper-mine-search-AI](https://github.com/andrea-covre/minesweeper-mine-search-AI).

The first square mined is always the “safe” square, and the value returned by the board is then
incorporated in the AI knowledge maps through an update by calling `updateProcedure()`.

``` javascript
updateProcedure() {
        this.offsetMinedValues();
        this.updateKnowledge();
        this.updateKnowledgeGain();
        this.lookForBombs();
        this.getNextMove();
    }
```

The first item in the update process is `offsetMinedValues()` which offsets the mined values in the
knowledge map if a mine was found nearby. Therefore, if a mined square tells us that there are 3
mines nearby, and we already found one, then `offsetMinedValues()` will offset that mined value
from 3 to 2 so that the knowledge map maintains risk scores that are solely based on mines that
have not been found just yet. This step requires _O(nm)_ time where _n_ is the number of rows and _m_
the number of columns.

The second item of the update procedure is `updateKnowledge()` which updates the knowledge
map risk scores and flags by integrating the newly offset mined values and the mined value
returned by the board after mining a square. This step requires _O(nm)_ time.

The third item of the update procedure is `updateKnowledgeGain()` which updates the knowledge
gain map based on how many unexplored squares are nearby and traverses the whole board to
compute lists of possible next moves. This step requires _O(nm)_ time.

At this point the board, from the AI view, would look like the following after mining the safe
square:

![AI-0 Board View](/figures/ai-board-view.jpg "AI Board View")

`lookForBombs()` will analyze all the squares risk score, knowledge gain and neighbors, to determine whether the given square 
is a bomb, if so, the square will be marked with the flag "X".

The last step of the update is then `getNextMove()` which decides what kind of behavior is best to
actuate and from there pick the next square to mine. The AI will always prefer an investigative
behavior, therefore if it has some clues on where some bombs might be, it will go hunting them
down, by selecting safe squares with the highest risk score that might give the additional knowledge needed to confirm the 
accurate position of the bomb.

If the AI has no leads to follow, it will then switch to explorative behavior and select the safe squares with the highest knowledge
gain, so to maximize the knowledge gain for the next update.


## Demo

The animation below comes from running the algorithm on a 10x10 board with 10% bomb density. The AI manages
to complete and win the game in 51 moves, opening 51% of the board's squares.

<img src="/figures/animated-ai-board-view.gif" width="650" alt="Animation of the AI playing and winning the game">

### Legend of the heat map:
  - Gray      -> mined
  - Green     -> safe square
  - Yellow    -> risky square
  - Red       -> very risky square, or square  with no knowledge available about it  
  - Violet    -> square where a bomb has been identified 


## Files

### index.html
Sets the web scene for the JavaScript elements to run and imports all the necessary libraries and files.

### GameEngine.js
This game engine manages the interactions between the User, the board and the AI, in addition to handling the end of the game and the possibility to reset the board and AI.

### Graphics.js
This file contains values and functions utilized to create and manage the graphical elements that showcase the board, the AI view of the board, stats and controls.

### Board.js
This file contains the class that represents the board. It reads and parses the board's properties from a JSON object. The class also contains functions that handle the mining of squares, keep track of the number of accesses, setup and manage the board's graphics, verify the correctness of the AI's inferred bombs position, and reveal the values of the non-mined squares (for debugging purposes).

### AI-1.js
This file contains the AI's class and relative methods. The AI object only requires the dimensions of the board,
the number of bombs present, and the initial guaranteed-safe square to mine, therefore no information about the bombs position
or square values is made available to the AI. All the interactions between the board and the AI occur through two methods: `playNext()` and `update()`

``` javascript
playNext(isPlaying) {
        if (isPlaying) {
            board.mine(ai1.nextMove[1], ai1.nextMove[0]);
        }
    }
```
`playNext()` tells the board object to mine the square that has been selected as the next best move by the AI.

<br>

``` javascript
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
            this.knowledge[y][x][1] = "M";
        }
        this.updateProcedure();
    }
```
`update()` is called by GameEngine and tells the AI what square has been mined and what is its value (the coordinates of the mined 
square are not always known by the AI and cannot be assumed to be the same as the AI selected next move since the game can be intermittently played manually). After recording the new value, the AI will proceed to update its maps by calling `updateProcedure()`. 

## Execution

The code can be run locally by installing an npm package like live server:
```
npm install -g live-server
```
and then executed from the root directory with:
```
live-server --port=8000
```
