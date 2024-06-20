// Initialize an object to keep track of the pressed state of various keys
var keys;

// Function to handle keydown events
function handleKeyDown(event) {
    if(keys != undefined) {
      const key = event.key.toLowerCase(); // Get the key pressed and convert it to lowercase
      keys[key] = true; // Set the corresponding key in the keys object to true
      updateCameraPosition(); // Update the camera position based on the current keys pressed
    }
}

// Function to handle keyup events
function handleKeyUp(event) {
  if(keys != undefined) {
    const key = event.key.toLowerCase(); // Get the key released and convert it to lowercase
    keys[key] = false; // Set the corresponding key in the keys object to false
    updateCameraPosition(); // Update the camera position based on the current keys pressed
  }
}

// Add event listeners to all elements with the class "arrow-key"
document.querySelectorAll(".arrow-key").forEach(function(button) {
    const keyCode = button.getAttribute("data-key"); // Get the key associated with the button

    // Add event listener for mousedown event
    button.addEventListener("mousedown", function(e) {
        keys[keyCode] = true; // Set the corresponding key in the keys object to true
        updateCameraPosition(); // Update the camera position based on the current keys pressed
    });

    // Add event listener for mouseup event
    button.addEventListener("mouseup", function(e) {
        keys[keyCode] = false; // Set the corresponding key in the keys object to false
        updateCameraPosition(); // Update the camera position based on the current keys pressed
    });

    // Add event listener for mouseout event
    button.addEventListener("mouseout", function(e) {
        keys[keyCode] = false; // Set the corresponding key in the keys object to false
        updateCameraPosition(); // Update the camera position based on the current keys pressed
    });
});

// Add event listeners for keydown and keyup events on the window
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

// Function to update the camera position based on the current keys pressed
function updateCameraPosition() {
    if(keys != undefined){
      if (keys['w']) {
        m4.translate(cameraPositionMain, 0, 0, -rocketSpeed, cameraPositionMain);
        m4.translate(u_world_rocket, 0, 0, -rocketSpeed, u_world_rocket);
      }
      if (keys['a']) {
        m4.translate(cameraPositionMain, -rocketSpeed, 0, 0, cameraPositionMain);
        m4.translate(u_world_rocket, -rocketSpeed, 0, 0, u_world_rocket);
      }
      if (keys['s']) {
        m4.translate(cameraPositionMain, 0, 0, rocketSpeed, cameraPositionMain);
        m4.translate(u_world_rocket, 0, 0, rocketSpeed, u_world_rocket);
      }
      if (keys['d']) {
        m4.translate(cameraPositionMain, rocketSpeed, 0, 0, cameraPositionMain);
        m4.translate(u_world_rocket, rocketSpeed, 0, 0, u_world_rocket);
      }
      if (keys['ArrowUp']) {
          m4.translate(cameraPositionMain, 0, rocketSpeed, 0, cameraPositionMain);
          m4.translate(u_world_rocket, 0, rocketSpeed, 0, u_world_rocket);
      }
      if (keys['ArrowDown']) {
          m4.translate(cameraPositionMain, 0, -rocketSpeed, 0, cameraPositionMain);
          m4.translate(u_world_rocket, 0, -rocketSpeed, 0, u_world_rocket);
      }
      if (keys['ArrowLeft']) {
          m4.yRotate(cameraPositionMain, degToRad(0.3), cameraPositionMain);
          m4.yRotate(u_world_rocket, degToRad(0.3), u_world_rocket);
          m4.translate(cameraPositionMain, 0.027, 0, 0, cameraPositionMain);
      }
      if (keys['ArrowRight']) {
          m4.yRotate(cameraPositionMain, degToRad(-0.3), cameraPositionMain);
          m4.yRotate(u_world_rocket, degToRad(-0.3), u_world_rocket);
          m4.translate(cameraPositionMain, -0.027, 0, 0, cameraPositionMain);
      }
      if (keys['arrowup']) {
        m4.translate(cameraPositionMain, 0, rocketSpeed, 0, cameraPositionMain);
        m4.translate(u_world_rocket, 0, rocketSpeed, 0, u_world_rocket);
      }
      if (keys['arrowdown']) {
        m4.translate(cameraPositionMain, 0, -rocketSpeed, 0, cameraPositionMain);
        m4.translate(u_world_rocket, 0, -rocketSpeed, 0, u_world_rocket);
      }
      if (keys['arrowleft']) {
        m4.yRotate(cameraPositionMain, degToRad(0.3), cameraPositionMain);
        m4.yRotate(u_world_rocket, degToRad(0.3), u_world_rocket);
        m4.translate(cameraPositionMain, 0.027, 0, 0, cameraPositionMain);
      }
      if (keys['arrowright']) {
        m4.yRotate(cameraPositionMain, degToRad(-0.3), cameraPositionMain);
        m4.yRotate(u_world_rocket, degToRad(-0.3), u_world_rocket);
        m4.translate(cameraPositionMain, -0.027, 0, 0, cameraPositionMain);
      }
    }
}

// Query to set up listeners for the on screen buttons on mobile
document.querySelectorAll(".command-btn").forEach(function(button) {
    const key = button.getAttribute("data-key"); // Get the key associated with the button

    // Add event listeners for mousedown, mouseup, touchstart, and touchend events
    button.addEventListener('mousedown', () => {handlePress(key)});
    button.addEventListener('mouseup', () => {handleRelease(key)});
    button.addEventListener('touchstart', () => {handlePress(key)});
    button.addEventListener('touchend', () => {handleRelease(key)});
});

// Function to handle button press events
function handlePress(key) {
    keys[key] = true; // Set the corresponding key in the keys object to true
    updateCameraPosition(); // Update the camera position based on the current keys pressed
}

// Function to handle button release events
function handleRelease(key) {
    keys[key] = false; // Set the corresponding key in the keys object to false
    updateCameraPosition(); // Update the camera position based on the current keys pressed
}
