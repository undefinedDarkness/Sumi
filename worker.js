// worker.js
let canvas;
let ctx;

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
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(x, y);
            ctx.stroke();
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
}

// Helper functions
const fori = (init, stop, inc, fn) => {
    for (let i = init; i < stop; i += inc) {
        fn(i);
    }
};

const repeat = (times, fn) => {
    for (let i = 0; i < times; i++) {
        fn(i);
    }
};

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

// Create the drawing context with all needed methods
function createContext() {
    const context = {
        width: canvas.width,
        height: canvas.height,
        beginPath: () => ctx.beginPath(),
        moveTo: (x, y) => ctx.moveTo(x, y),
        lineTo: (x, y) => ctx.lineTo(x, y),
        stroke: () => ctx.stroke(),
        fill: (path) => {
            if (path) {
                ctx.fill(path);
            } else {
                ctx.fill();
            }
        },
        circle: (x, y, r) => {
            const path = new Path2D();
            path.arc(x, y, r, 0, Math.PI * 2);
            return path;
        },
        color: (fillC, strokeC) => {
            if (fillC) ctx.fillStyle = fillC;
            if (strokeC) ctx.strokeStyle = strokeC;
        },
        sin: (deg) => Math.sin(deg * Math.PI / 180),
        cos: (deg) => Math.cos(deg * Math.PI / 180),
        tan: (deg) => Math.tan(deg * Math.PI / 180),
        turtle: (x, y) => {
            x = x ?? canvas.width / 2;
            y = y ?? canvas.height / 2;
            return new Turtle(x, y);
        },
        clear: () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
    return context;
}

// Handle messages from main thread
self.onmessage = async (e) => {
    const { type, code, width, height, sliderValues, canvasBuffer } = e.data;
    
    if (type === 'init') {
        canvas = new OffscreenCanvas(width, height);
        ctx = canvas.getContext('2d');
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'black';
    }
    
    if (type === 'execute') {
        try {
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Create execution context
            const _ = createContext();
            const executionContext = {
                _, fori, repeat, random,
                slider: (name, min, max, value, step) => {
                    return sliderValues[name] || value;
                }
            };
            
            // Execute the code
            const fn = new Function(...Object.keys(executionContext), code);
            fn(...Object.values(executionContext));
            
            // Transfer the final image back to main thread
            const bitmap = canvas.transferToImageBitmap();
            self.postMessage({
                type: 'drawingComplete',
                bitmap,
                error: null
            }, [bitmap]);
            
        } catch (error) {
            self.postMessage({
                type: 'drawingComplete',
                error: error.message
            });
        }
    }
};