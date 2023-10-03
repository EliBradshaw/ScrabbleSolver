export default class Task {
    static _idStack = 0;

    constructor(fun) {
        this.id = Task._idStack++;
        this.run = fun;
    }

    set(ref, val) {
        this[ref] = val;
    }

    get(ref) {
        return this[ref];
    }
}