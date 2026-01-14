/**
 * MouseEventHandlers - Handles mouse input for camera controls
 *
 * Extracted from main.js for better organization.
 */

/**
 * Setup mouse event handlers for camera controls
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} cameraController - Camera controller instance
 * @returns {Function} Cleanup function to remove event listeners
 */
export function setupMouseHandlers(canvas, cameraController) {
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseDown = (event) => {
        isMouseDown = true;
        mouseX = event.clientX;
        mouseY = event.clientY;
        if (cameraController) {
            cameraController.state.isDragging = true;
        }
    };

    const handleMouseMove = (event) => {
        if (isMouseDown) {
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;

            // Use camera controller for mouse drag
            if (cameraController && cameraController.mode === 'follow') {
                cameraController.handleMouseDrag(deltaX, deltaY);
            }

            mouseX = event.clientX;
            mouseY = event.clientY;
        }
    };

    const handleMouseUp = () => {
        isMouseDown = false;
        if (cameraController) {
            cameraController.state.isDragging = false;
        }
    };

    const handleMouseLeave = () => {
        isMouseDown = false;
        if (cameraController) {
            cameraController.state.isDragging = false;
        }
    };

    const handleWheel = (event) => {
        event.preventDefault();
        if (cameraController) {
            cameraController.handleZoom(event.deltaY);
        }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('wheel', handleWheel);

    // Return cleanup function
    return () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('wheel', handleWheel);
    };
}
