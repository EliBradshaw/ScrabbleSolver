import Board from "./Board.js";
import words from "./words.js";

export default class WordLookup {
    static wordMap = new Array(26 * 15);
    static init() {
        for (let word of words) {
            let index = (word.charCodeAt(0) - 65) + word.length * 26;
            WordLookup.wordMap[index] = WordLookup.wordMap[index] || {};
            WordLookup.wordMap[index][word] = true;
        }
    }
    static _doInit = WordLookup.init();
    static isWord(word) {
        if (!word)
            return false;
        word = word.toLowerCase();
        let index = (word.charCodeAt(0) - 65) + word.length * 26;
        return WordLookup.wordMap[index]?.[word] == true;
    }
}