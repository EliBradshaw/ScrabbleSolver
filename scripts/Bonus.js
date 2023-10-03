export default class Bonus {
    static letterAdv = {
        t: 3,
        T: 1,
        d: 2,
        D: 1,
        '-': 1
    }
    static wordAdv = {
        t: 1,
        T: 3,
        d: 1,
        D: 2,
        '-': 1
    }
    static colors = {
        t: 'teal',
        T: 'orange',
        d: 'lightblue',
        D: 'brown',
        '-': null
    }
    constructor(letter) {
        this.letter = letter;
        this.isBonus = letter != '-';
        this.letterAdv = Bonus.letterAdv[letter];
        this.wordAdv = Bonus.wordAdv[letter];
    }
}