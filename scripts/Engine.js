import Task from "./Task.js";

export default class Engine {

    /** @type {Task[]} **/
    static _tasks = [];
    static _delta =  Engine.MSPF;
    static _lastTime = 0;
    static _canvas = null;
    static _keys = { };

    static async init() {
        document.addEventListener("keydown", ({key}) => Engine._keys[key.toLowerCase()] = true);
        document.addEventListener("keyup", ({key}) => Engine._keys[key.toLowerCase()] = false);
        await Engine.linkCanvas();
        Engine.draw();
    }

    static keyDown(key) {
        return Engine._keys[key];
    }

    /** @type {function(): Promise<HTMLElement>} */
    static linkCanvas() {
        let res = function(resolve) {
            let canvas = document.getElementById("canvas");
            if (canvas) {
                Engine._canvas = canvas;
                resolve();
                return;
            }
            setTimeout(res, 1, resolve);
        }
        return new Promise(res);
    }

    /** @type {function(function(HTMLElement))} */
    static hook(task) {
        Engine._tasks.push(new Task(task));
    }

    /** @type {function(Int)} */
    static unhook(taskId) {
        Engine._tasks = Engine._tasks.filter(a => a.id != taskId);
    }

    /** 
     * Hook a child to the canvas
     * 
     * @param {String} childType
     * @param {function(HTMLElement, HTMLElement, Task)} childTask
     * @param {{}} events
     * @param {{}} style
     * @returns {void}
    */
    static hookChild(childType, childTask, events = {}, style = {}) {
        let child = document.createElement(childType);
        for (let event in events)
            child.addEventListener(event, events[event]);
        child.dispatchEvent(new Event("load"));
        Engine.hook((canvas, task) => {
            childTask(child, canvas, task);
        });
        for (let sty in style) // I'm not doing child.style = style; because I'm worried about unforseen consequences
            child.style[sty] = style[sty];
        canvas.appendChild(child);
    }

    static clear() {
        while (Engine._canvas.firstChild)
            Engine._canvas.firstChild.remove();
    }

    static draw() {
        for (let task of Engine._tasks)
            task.run(Engine._canvas, task);
    }
}