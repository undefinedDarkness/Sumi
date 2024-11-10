const tcanvas = document.querySelector('#tools')
const tctx = tcanvas.getContext('2d');

let isDrawingCircle = false;
let startX, startY;
let currentCircle = null;
let tooltip = null;

// Function to create/update tooltip
function updateTooltip(x, y, circle) {
    $('#circle-coords').textContent = `CX ${circle.x.toFixed(2)} CY ${circle.y.toFixed(2)} CR ${circle.radius.toFixed(2)}`;
}

function removeTooltip() {
    $('#circle-coords').textContent = '';
}

// Function to draw a circle
function drawCircle(x, y, radius) {
    const f = ctx.strokeStyle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#c8c8c8';
    ctx.stroke();
    ctx.strokeStyle = f
}

// Function to clear the tcanvas and redraw
function clearAndRedraw() {
    ctx.clearRect(0, 0, tcanvas.width, tcanvas.height);
    if (currentCircle) {
        drawCircle(currentCircle.x, currentCircle.y, currentCircle.radius);
    }
}

// Calculate radius between two points
function getRadius(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Key press event listener
document.addEventListener('keydown', (e) => {
    if (e.key === 'c' || e.key === 'C') {
        isDrawingCircle = true;
        currentCircle = null;
        removeTooltip();
    }
});

// Mouse down event listener
tcanvas.addEventListener('mousedown', (e) => {
    if (isDrawingCircle) {
        const rect = tcanvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        
        if (!currentCircle) {
            // Start new circle
            currentCircle = {
                x: startX,
                y: startY,
                radius: 0
            };
            // Show initial tooltip
            updateTooltip(e.clientX, e.clientY, currentCircle);
        } else {
            // Final tooltip update
            updateTooltip(e.clientX, e.clientY, currentCircle);
            
            // Clear the circle
            ctx.clearRect(0, 0, tcanvas.width, tcanvas.height);
            
            // Remove tooltip after 3 seconds
            setTimeout(removeTooltip, 3000);
            
            // Reset drawing state
            window.appendToEditor(`_.stroke(_.circle(${currentCircle.x.toFixed(2)}, ${currentCircle.y.toFixed(2)}, ${currentCircle.radius.toFixed(2)}));`)
            isDrawingCircle = false;
            currentCircle = null;

            console.log(`Finished Circle`)
            
        }
    }
});

// Mouse move event listener
tcanvas.addEventListener('mousemove', (e) => {
    if (isDrawingCircle && currentCircle) {
        const rect = tcanvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        currentCircle.radius = getRadius(startX, startY, currentX, currentY);
        clearAndRedraw();
        
        // Update tooltip during drawing
        updateTooltip(e.clientX, e.clientY, currentCircle);
    }
});

// Clean up tooltip when mouse leaves tcanvas
tcanvas.addEventListener('mouseleave', () => {
    if (isDrawingCircle && !currentCircle) {
        removeTooltip();
    }
});