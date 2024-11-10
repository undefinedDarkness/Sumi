
const $ = _ => document.querySelector(_)
const $$ = _ => document.querySelectorAll(_)
let _;
const fori = (init, stop, inc, fn) => {
    for (let i = init; i < stop; i += inc) {
        fn(i);
    }
}
const repeat = (times, fn) => {
    for (let i = 0; i < times; i++) {
        fn(i);
    }
}

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

class Turtle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this._penDown = true;
    }

    forward(distance) {
        const x = this.x + distance * Math.cos(this.angle);
        const y = this.y + distance * Math.sin(this.angle);
        if (this._penDown) {
            _.beginPath();
            _.moveTo(this.x, this.y);
            _.lineTo(x, y);
            _.stroke();
        }
        this.x = x;
        this.y = y;
    }

    backward(distance) {
        this.forward(-distance);
    }

    left(angle) {
        this.angle += angle * Math.PI / 180;
    }

    right(angle) {
        this.angle -= angle * Math.PI / 180;
    }

    // penUp() {
    //     this._penDown = false;
    // }

    // penDown() {
    //     this._penDown = true;
    // }
}



function makeDraggable(element) {
    // Make an element draggable (or if it has a .window-top class, drag based on the .window-top element)
    let currentPosX = 0, currentPosY = 0, previousPosX = 0, previousPosY = 0;

    // If there is a window-top classed element, attach to that element instead of full window
    if (element.querySelector('.window-top')) {
        // If present, the window-top element is where you move the parent element from
        element.querySelector('.window-top').onmousedown = dragMouseDown;
    }
    else {
        // Otherwise, move the element itself
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        // Prevent any default action on this element (you can remove if you need this element to perform its default action)
        e.preventDefault();
        // Get the mouse cursor position and set the initial previous positions to begin
        previousPosX = e.clientX;
        previousPosY = e.clientY;
        // When the mouse is let go, call the closing event
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        // Prevent any default action on this element (you can remove if you need this element to perform its default action)
        e.preventDefault();
        // Calculate the new cursor position by using the previous x and y positions of the mouse
        currentPosX = previousPosX - e.clientX;
        currentPosY = previousPosY - e.clientY;
        // Replace the previous positions with the new x and y positions of the mouse
        previousPosX = e.clientX;
        previousPosY = e.clientY;
        // Set the element's new position
        element.style.top = (element.offsetTop - currentPosY) + 'px';
        element.style.left = (element.offsetLeft - currentPosX) + 'px';
    }

    function closeDragElement() {
        // Stop moving when mouse button is released and release events
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

window.appendToEditor = (text) => {
    $('#editor').textContent += '\n' + text + '\n';
}
let isLive = false

let sliders = {

}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

let createdSliders = [ ]
function createSlider(name, min = 0, max = 100, value = 0, step = 5) {
    if (!sliders[name]) {
        createdSliders.push(name)
        sliders[name] = document.createElement('input');
        sliders[name].type = 'range';
        sliders[name].min = min;
        sliders[name].max = max;
        sliders[name].value = value;
        sliders[name].step = step;
        sliders[name].id = name;
        sliders[name].addEventListener('input', debounce(() => {
            console.log(`Got modified`)
            // $(`#${name}value`).textContent = sliders[name].value
            onCodeEdit()
        }, 100))
    }
    return sliders[name].value
}

function resetSliders() {
    $('#sliders').innerHTML = ''
    const unusedSliders = Object.keys(sliders).filter(slider => !createdSliders.includes(slider))
    for (const slider of unusedSliders) {
        delete sliders[slider]
    }
}

function updateSliders() {
    $('#sliders').innerHTML = ''

    if (Object.keys(sliders).length === 0) {
        $('#sliders-parent').style.display = 'none'
    } else {
        $('#sliders-parent').style.display = 'block'
    }

    for (const [key, slider] of Object.entries(sliders)) {
        const lbl = document.createElement('label')
        lbl.textContent = key
        $('#sliders').appendChild(lbl)
        $('#sliders').appendChild(slider)
    }
}

const onCodeEdit = debounce(() =>{
    if (isLive) {
        resetSliders()
        runCode($('#editor').textContent)
        updateSliders()
    }
}, 250)



function runCode(code) {
    $('#errormessage').textContent = ``
    try {
        const exe = new Function(`function f() { ${code} }; f();`)
        exe()
    } catch (err) {
        $('#errormessage').textContent = `⚠ ${err.message}`
    }
}

function main() {
    makeDraggable($('#sliders-parent'))

    /** @type {HTMLCanvasElement} */
    const canvas = $('canvas');

    const parent = canvas.parentElement;
    canvas.width = parent?.clientWidth - 8 ?? canvas.width;
    canvas.height = parent?.clientHeight - 8 ?? canvas.height;

    const toolCanvas = $('#tools')
    toolCanvas.width = parent?.clientWidth - 8 ?? toolCanvas.width;
    toolCanvas.height = parent?.clientHeight - 8 ?? toolCanvas.height;

    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas not supported');


    $('#toggleLive').addEventListener('click', () => {
        isLive = !isLive
        $('#toggleLive').dataset.toggled = isLive ? "true" : "false"
    })

    const addedFns = {
        width: canvas.width,
        height: canvas.height,
        circle: (x, y, r) => {
            const path = new Path2D();
            path.arc(x, y, r, 0, Math.PI * 2);
            return path;
        },
        color: (fillC, strokeC) => {
            ctx.fillStyle = fillC ?? ctx.fillStyle;
            ctx.strokeStyle = strokeC ?? ctx.strokeStyle;
        },
        sin: (deg) => Math.sin(deg * Math.PI / 180),
        cos: (deg) => Math.cos(deg * Math.PI / 180),
        tan: (deg) => Math.tan(deg * Math.PI / 180),
        turtle: (x, y) => {
            x = x ?? _.width / 2;
            y = y ?? _.height / 2;

            return new Turtle(x, y);
        },
        clear: () => {
            ctx.clearRect(0, 0, _.width, _.height);
        },
        slider: createSlider
    };
    Object.assign(ctx, addedFns);
    _ = ctx;

    $('#run').addEventListener('click', () => {
        resetSliders()
        runCode($('#editor').textContent)
        updateSliders()
    })

    $('#runcmd').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            runCode($('#runcmd').textContent)
        }
    })

    $('#editor').textContent =
        `
// Grid
/*
_.color('gray');
fori(20, _.height, 40, j => {
    fori(20, _.width, 40, i => {
        _.fill(_.circle(i, j, 3)); 
    })
})
*/

// Turtle
/*
_.color('black');
const t = _.turtle();
fori(0, 32, 1, i => {
    repeat(i, () => {
        t.forward(i);
        t.right(358 / i);
    });
    t.backward(Math.sqrt(i));
});
*/

const t = _.turtle();
// repeat 400 [repeat 34 [fd 12 rt 10] rt 90]
repeat(400, () => {
    repeat(34, () => {
        t.forward(12);
        t.right(10);
    });
    t.right(90);
})

    `

    toolCanvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        $('#coords').textContent = `X: ${x.toFixed(0)}, Y: ${y.toFixed(0)}`;
    });
};

main();

