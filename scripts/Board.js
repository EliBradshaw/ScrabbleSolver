import Bonus from "./Bonus.js";
import LetterValue from "./LetterValue.js";
import WordLookup from "./WordLookup.js";

export default class Board {
    static SIZE = 15;
    static EXTRAS = `
T--d---T---d--T
-D---t---t---D-
--D---d-d---D--
d--D---d---D--d
----D-----D----
-t---t---t---t-
--d---d-d---d--
T--d---D---d--T
--d---d-d---d--
-t---t---t---t-
----D-----D----
d--D---d---D--d
--D---d-d---D--
-D---t---t---D-
T--d---T---d--T
`.trimStart().trimEnd().split('\n').map(a=>a.split('').map(b =>
    new Bonus(b)
));
    static fastMode = true;
    constructor() {
        for (let i = 0; i < Board.SIZE; i++) {
            this[i] = new Array(Board.SIZE);
            for (let j = 0; j < Board.SIZE; j++)
                this[i][j] = null
        }
        this.scoreOne = 0;
        this.scoreTwo = 0;
        this.comCache = [];
    }

    removeQuestionMarks(word) {
        while (word[word.length - 1] == '?')
            word = word.slice(0, -1);
        return word;
    }

    canWordBePlayedHere(x, y, dx, dy, word) {
        function isCoordInWord(bx, by, dx, dy, word, cx, cy) {
            let xrow = (cx >= bx && cx <= bx + dx*word.length);
            let yrow = (cy >= by && cy <= by + dy*word.length);
            if (xrow && yrow)
                return true;
            return false;
        }
        function wordHere(x, y, ox, oy) {
            return word[x - ox || y - oy] && word[x - ox || y - oy] != '?';
        }
        let ruleTwo = false;
        // Conditions for words no being allowed here:
        // 1 Not being a word.
        // 2 Has to be played off another word. *
        // * or the center square
        // 3 Making a previously made word not a word anymore.
        // 4 No gaps.

        // Rule #1 & half of #3
        let letters = "";
        let [ox, oy] = [x, y];
        while (this[x - dx] && this[x - dx][y - dy]) {
            x -= dx;
            y -= dy;
        }
        while (word[x - ox || y - oy] || (this[x] && this[x][y])) {
            if (!this[x] || !this[x][y])
                if (word[x - ox || y - oy] == '?')
                    return false; // Rule #4
            letters += wordHere(x, y, ox, oy) ? word[x - ox || y - oy] : this[x][y];
            if (!this[x])
                break;
            if (this[x][y])
                ruleTwo = true;
            if (this[x][y] && wordHere(x, y, ox, oy))
                return false;
            if (this[x][y] == word[x - ox || y - oy])
                return false;
            x += dx;
            y += dy;
        }
        [x, y] = [ox, oy];
        if (!WordLookup.isWord(letters))
            return false;
        // Rule #2 & other half of #3
        for (let i = 0; i < word.length; i++) {
            if (word[i] == '?')
                continue;
            [ox, oy] = [x, y];
            x += dx*i;
            y += dy*i;
            // Back up on to the first letter of the crossword
            while (this[x - dy] && this[x - dy][y - dx]) {
                x -= dy;
                y -= dx;
            }
            // Check if the crossword is a word
            letters = "";
            let isc = false;
            while ((isc = isCoordInWord(ox, oy, dx, dy, word, x, y)) || (this[x] && this[x][y])) {
                // Check if should be letter from word instead
                letters += isc && word[i] != '?' ? word[i] : this[x][y];
                x += dy;
                y += dx;
            }
            [x, y] = [ox, oy];
            // Check if the crossword is just apart of the original word
            if (letters?.length > 1) {
                if (!WordLookup.isWord(letters))
                    return false;
                ruleTwo = true;
            }
        }
        let wl = word.length-1;
        let db = (Board.SIZE>>1);
        if (x + dx*wl >= db && db >= x && 
            y + dy*wl >= db && db >= y)
            ruleTwo = true;
        if (!ruleTwo)
            return false;
        return true;
    }

    copy() {
        let cpy = [];
        for (let i = 0; i < Board.SIZE; i++) {
            cpy[i] = new Array(Board.SIZE);
            for (let j = 0; j < Board.SIZE; j++)
                cpy[i][j] = this[i][j];
        }
        return {cpy, scoreOne: this.scoreOne, scoreTwo: this.scoreTwo};
    }

    restore(save) {
        for (let i = 0; i < Board.SIZE; i++)
            for (let j = 0; j < Board.SIZE; j++)
                this[i][j] = save.cpy[i][j];
    }

    decodePattern(pattern, letters) {
        return this.removeQuestionMarks(pattern.split("").map(a=>letters[Number(a)]).join(""));
    }

    addTo(previousPattern, letters) {
        let newPattern = previousPattern.split("").map(Number);
        let i = previousPattern.length - 1;
        letters = letters.split('').map((a, i) => i);
        let stop = 0;
        carryLoop:
        while (true) {
            let cur = letters.indexOf(newPattern[i]);
            let co = 1;
            let nex;
            if (stop++ > 1000 || i <= -1)
                return null;
            while (true) {
                nex = letters[cur+co];
                co++;
                if (!nex) {
                    newPattern[i] = 0;
                    i--;
                    continue carryLoop;
                }
                let loc = newPattern.indexOf(nex);
                if (nex != 0 && (loc == i || loc == -1)) 
                    break;
            }
            newPattern[i] = nex;
            break;
        }
        return newPattern.join("");
    }

    generateComCache(letters) {
        let com = "1000000" + (Board.fastMode ? "" : "0");
        while (com) {
            this.comCache.push(com);
            com = this.addTo(com, letters);
        }
    }
      
    generateCombinations(x, y) {
        let letters = '?' + document.getElementById("letters").value;
        let workingCombinations = [];
        for (let i = 0; i < 2; i++) {
            let [dx, dy] = [i==1, i==0].map(Number);
            for (let com of this.comCache) {
                if (this.canWordBePlayedHere(x, y, dx, dy, this.decodePattern(com, letters))) {
                    workingCombinations.push({x, y, dx, dy, com: this.decodePattern(com, letters)});
                } 
            }
        }

        return workingCombinations;
    }

    scoreCombinations(x, y) {
        let combinations = this.generateCombinations(x, y);
        return combinations.map(comb => {
            let bef = this.copy();
            let suc = this.putWord(comb.x, comb.y, comb.dx, comb.dy, comb.com);
            let val = this.scoreCombination(comb, false);
            console.log(val);
            this.restore(bef);
            if (!suc)
                return [null, -1];
            return [comb, val];
        }).sort((a, b) => b[1] - a[1]);
    }

    async sleep(time) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, time);
        })
    }

    async searchAllSquares() {
        let letters = '?' + document.getElementById("letters").value;
        this.comCache = [];
        this.generateComCache(letters);
        let totalEstimations = 0;
        let accumalatedEst = 0;
        let best = {comb: {com: null}, val: -1};
        for (let i = 0; i < Board.SIZE; i++)
            for (let j = 0; j < Board.SIZE; j++) {
                let start = performance.now();
                let scc = this.scoreCombinations(i, j);
                let delta = performance.now() - start;
                totalEstimations *= accumalatedEst;
                accumalatedEst += 1;
                totalEstimations += delta;
                totalEstimations /= accumalatedEst;
                let ms = Math.floor((Board.SIZE**2-(i*Board.SIZE+j)) * totalEstimations);
                let s = Math.floor(ms/1000);
                let m = Math.floor(s/60);

                await this.sleep(0);
                let ip = document.getElementById("innerPercentage");
                ip.innerText = `${Math.round((i*Board.SIZE+j+1)/(Board.SIZE**2)*100)}%`;
                ip.style.width = `${(i*Board.SIZE+j+1)/(Board.SIZE**2)*100}%`;

                if (best.comb.com)
                    document.getElementById("word").innerText = 
                    `Word: ${best.comb.com}\nPoints: ${best.val}\nAt: row-${best.comb.x+1}, column-${best.comb.y+1}\nGoing: ${best.comb.dx ? "down" : "right"}`;
                document.getElementById("time").innerText = `Est. time remaining: ${m}m ${(Math.round((ms%60000)/100)/10)}s`;
                if (scc.length == 0)
                    continue;
                let newc = scc[0];
                if (newc[1] > best.val)
                    best = {comb: newc[0], val: newc[1]};
            }
        return best.comb;
    }

    playCombination(comb) {
        this.putWord(comb.x, comb.y, comb.dx, comb.dy, comb.com);
    }

    scoreCombination(comb, doScore = true) {
        return this.scoreWord(comb.x, comb.y, comb.dx, comb.dy, comb.com, true, doScore);
    }

    scoreWord(x, y, dx, dy, word, oneTurn, doScore = true) {
        word = this.removeQuestionMarks(word);
        let score = this.scoreWordDirection(x, y, dx, dy, word);
        if (word.split('?').join('').length == 7)
            score += 50;
        for (let i = 0; i < word.length; i++)
            if (word[i] != '?')
                score += this.scoreWordDirection(x + dx*i, y + dy*i, dy, dx, word, true);
        if (!doScore)
            return score;
        if (oneTurn)
            this.scoreOne += score;
        else
            this.scoreTwo += score;
    }

    scoreWordDirection(x, y, dx, dy, word, cross = false) {
        let mult = 1;
        let value = 0;
        let wordLength = 0;
        let [ox, oy] = [x, y];
        // makes sure it is at beginning of word
        while (this[x - dx] && this[x - dx][y - dy]) {
            x -= dx;
            y -= dy;
        }
        while (this[x] && this[x][y]) {
            let count = LetterValue[this[x][y]];
            if ((!cross && word[x - ox || y - oy]) || (cross && ox == x && oy == y)) {
                count *= Board.EXTRAS[x][y].letterAdv;
                mult *= Board.EXTRAS[x][y].wordAdv;
            }
            value += count;
            x += dx;
            y += dy;
            wordLength++;
        }
        return value * mult * (wordLength > 1);
    }

    putWord(x, y, dx, dy, word) {
        for (let i = 0; i < word.length; i++) {
            if (word[i] == '?')
                continue;
            if (x+dx*i >= Board.SIZE || y+dy*i >= Board.SIZE)
                return false;
            this[x+dx*i][y+dy*i] = word[i];
        }
        return true;
    }
}