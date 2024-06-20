function getGlContext(){
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
    return;
    }
    return gl;
}

function degToRad(deg) {
    return deg * Math.PI / 180;
}

function getRandomExcludingMidRange(min, max, exclusionRange) {
    let mid = (min + max) / 2;
    let lowerBound = mid - exclusionRange / 2;
    let upperBound = mid + exclusionRange / 2;
    
    if (Math.random() < 0.5) {
        // Generate a number in the lower half excluding the exclusion range
        return Math.random() * (lowerBound - min) + min;
    } else {
        // Generate a number in the upper half excluding the exclusion range
        return Math.random() * (max - upperBound) + upperBound;
    }
}