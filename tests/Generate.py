import json
import random
import time
str_index = 0

bomb_count = 5
class Generator():

    def __init__(self, bomb_count, height, width):
        self.bomb_count = bomb_count
        self.height = height
        self.width = width
        self.board = [[0 for i in range(width)] for j in range(height)]
        for i in range(bomb_count):
            while True:
                loc = (random.randint(0, len(self.board)-1),random.randint(0, len(self.board[0])-1))
                if self.board[loc[0]][loc[1]] != 9:
                    self.board[loc[0]][loc[1]] = 9
                    break
        self.display_board()
        self.numerize()
        self.display_board()


    def numerize(self):
        for y in range(len(self.board)):
            for x in range(len(self.board[0])):
                self.assign_number(y, x)


    def assign_number(self, Ys, Xs):
        if self.board[Ys][Xs] == 9:
            return
        num = 0
        startX = max(0,Xs-1)
        startY = max(0,Ys-1)
        endX = min(len(self.board[0])-1, Xs+1)
        endY = min(len(self.board)-1, Ys+1)
        for y in range(startY, endY+1):
            for x in range(startX, endX+1):
                if self.board[y][x] == 9:
                    num += 1
        self.board[Ys][Xs] = num

    def display_board(self):
        for i in range(len(self.board)):
            print('')
            for j in range(len(self.board[0])):
                print(self.board[i][j], end=" ")
        print(" ")

    def getSafeSq(self):
        """
        returns coordinates of a safe square of form: (x,y)
        """
        best = 0
        x = y = 0

        for i in range(len(self.board)):
            for j in range(len(self.board[0])):
                if best < self.board[i][j] < 9:
                    best = self.board[i][j]
                    y, x = i, j
        
        return (x, y)
    
    def stringify(self):
        """return 1d string representation of generated board"""
        ret = ""
        for y in range(len(self.board)):
            for x in range(len(self.board[0])):
                ret += str(self.board[y][x])
        return ret
       
    def writeToJson(self, jsonFile):
        data = {}
        data["dim"] = str(self.width) +"," +str(self.height)
        data["bombs"] = str(self.bomb_count)
        loc = self.getSafeSq()
        data["safe"] = str(loc[0]) + "," + str(loc[1])
        data["board"] = self.stringify()
        with open(jsonFile, 'w') as output:
            json.dump(data, output)

G = Generator(10, 10, 10)
G.writeToJson("test3.json")