import Board from "./Board.js";
import Bonus from "./Bonus.js";
import Engine from "./Engine.js";
import LetterValue from "./LetterValue.js";

let HTMLWidth = 400;
let HTMLHeight = 400;
let border = 1;
Engine.init();
let board = new Board();
Engine.hookChild("div", set => {
    set.innerHTML = "";
    set.style.fontSize = "200%";
    let fstMde = document.createElement("button");
    fstMde.style.fontSize = "80%";
    fstMde.innerText = "FastMode: " + (Board.fastMode ? "On" : "Off");
    fstMde.onclick = event => {
        Board.fastMode = !Board.fastMode;
        Engine.draw();
    }
    set.appendChild(fstMde);
})
Engine.hookChild("div", elm => {
    elm.innerHTML = "";
    elm.style.width = HTMLWidth + "px";
    elm.style.height = HTMLHeight + "px";
    elm.style.display = "flex";
    elm.style.flexFlow = "row wrap";
    for (let i = 0; i < Board.SIZE; i++) {
        for (let j = 0; j < Board.SIZE; j++) {
            let div = document.createElement("div");
            let subScript = document.createElement("sub");
            div.innerText = board[i][j];
            div.style.border = border + "px solid black";
            if (board[i][j])
                div.style.backgroundColor = "darkgray"
            else if (Board.EXTRAS[i][j].isBonus)
                div.style.backgroundColor = Bonus.colors[Board.EXTRAS[i][j].letter];
            else
                div.style.backgroundColor = "var(--background-color)"
            div.style.width = HTMLWidth / Board.SIZE - border*2 + "px";
            div.style.height = HTMLHeight / Board.SIZE - border*2 + "px";
            div.classList.add("tile");
            subScript.innerText = board[i][j] && LetterValue[board[i][j]]
            subScript.classList.add("tile-value");
            div.appendChild(subScript);
            elm.appendChild(div);
            div.onclick = () => {
                let prm = prompt("Input letter");
                board[i][j] = null;
                if (prm) {
                    board[i][j] = prm[0].toUpperCase();
                }
                Engine.draw();
            };
        }
    }
});
Engine.hookChild("input", inp => {
    inp.oninput= () => setTimeout(event => {
        inp.value = inp.value.toUpperCase().replace(' ', '');
    }, 0);
    inp.id = "letters";
    inp.maxLength = 7;
    inp.style.fontSize = "300%";
    inp.style.width = HTMLWidth * 0.65 + "px";
    inp.style.textAlign = "center";
});
Engine.hookChild("button", btn => {
    btn.innerText = "Solve";
    btn.style.fontSize = "200%";
    btn.style.textAlign = "center";
    btn.onclick = () => {
        targetY = window.innerHeight/2;
        Engine.draw();
        setTimeout(()=>
        board.searchAllSquares().then(best => {
            if (!best.com)
                return;
            board.playCombination(best);
            board.scoreCombination(best);
        }), 1200);
    }
});
// Make a drop down menu
const SIZE = 400;
let y = -SIZE*5 - 10;
let targetY = -SIZE*5 - 10;
Engine.hookChild("div", (div, canvas, task) => {
    const SPEED = 1;
    div.style.width =
    div.style.height = SIZE + "px";
    div.classList.add("drop-down");
    div.innerHTML = "";

    let percentage = document.createElement("div");
    let innerPercentage = document.createElement("div");
    innerPercentage.style.width = "0";
    percentage.style.width = 0.8 * SIZE + "px";
    innerPercentage.style.height =
    percentage.style.height = "20px";
    innerPercentage.style.backgroundColor = "green";
    percentage.style.border = "1px solid black";
    innerPercentage.id = "innerPercentage"
    innerPercentage.style.textAlign = "end";
    percentage.appendChild(innerPercentage);
    div.appendChild(percentage);

    let word = document.createElement("div");
    word.innerText = "No word found yet.";
    word.id = "word";
    div.appendChild(word);

    let time = document.createElement("div");
    time.innerText = "Est. time remaining 0m 0s";
    time.id = "time";
    div.appendChild(time);

    let ok = document.createElement("button");
    ok.innerText = "Ok";
    ok.id = "ok";
    ok.onclick = () => {
        targetY = -SIZE*5 - 10;
        velocityY = 0;
        let thing;
        setTimeout(thing = () => {
            y += velocityY;
            velocityY += (y < -SIZE*5-10) ? 2 : -0.1;
            div.style.top = y + "px";
            if (velocityY < 0)
                setTimeout(thing, SPEED);
        }, SPEED);
        Engine.draw();
    }
    div.appendChild(ok);
    let velocityY = 0;
    let thing;
    setTimeout(thing = () => {
        y += velocityY;
        velocityY += (y < targetY/4) ? 0.1 : -2;
        div.style.top = y + "px";
        if (velocityY > 0)
            setTimeout(thing, SPEED);
    }, SPEED);
});