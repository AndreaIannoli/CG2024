"use strict";

/*
  This Skybox script was created by modifying code from WebGL Fundamentals. 
  To create a cube map, I used a panoramic image of the galaxy from the NASA website and converted it using the following website: https://jaxry.github.io/panorama-to-cubemap/. 
  This tool provided the six texture images I needed.
*/

function main() {
  // Obtain a WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // Initialize GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

  // Locate where vertex data is required.
  var positionLocation = gl.getAttribLocation(program, "a_position");

  // Locate uniforms
  var skyboxLocation = gl.getUniformLocation(program, "u_skybox");
  var viewDirectionProjectionInverseLocation =
      gl.getUniformLocation(program, "u_viewDirectionProjectionInverse");

  // Create a buffer for position data
  var positionBuffer = gl.createBuffer();
  // Bind the buffer to ARRAY_BUFFER (similar to ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Load positions into the buffer
  setGeometry(gl);

  // Create a texture
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

const faceInfos = [
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      url: '../skybox/px.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      url: '../skybox/nx.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      url: '../skybox/py.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      url: '../skybox/ny.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      url: '../skybox/pz.png',
    },
    {
      target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      url: '../skybox/nz.png',
    },
  ];

  faceInfos.forEach((faceInfo) => {
    const {target, url} = faceInfo;

    // Upload the canvas to the respective cubemap face
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1024;
    const height = 1024;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;

    // Configure each face to be immediately renderable
    gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

    // Load an image asynchronously
    const image = new Image();
    image.src = url;
    image.addEventListener('load', function() {
      // Copy the loaded image to the texture
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
      gl.texImage2D(target, level, internalFormat, format, type, image);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
  });
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

  function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var fieldOfViewRadians = degToRad(60);
  var cameraYRotationRadians = degToRad(0);

  var spinCamera = true;
  // Capture the initial time
  var then = 0;

  requestAnimationFrame(drawScene);

  // Render the scene
  function drawScene(time) {
    // Convert time to seconds
    time *= 0.001;
    // Compute the time difference from the last frame
    var deltaTime = time - then;
    // Store the current time for the next frame
    then = time;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Specify how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Clear the canvas and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Use the program (pair of shaders)
    gl.useProgram(program);

    // Enable the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Specify how to pull data out of the positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // data is 32bit floats
    var normalize = false; // do not normalize the data
    var stride = 0;        // move forward size * sizeof(type) each iteration
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // Set the camera position to circle 2 units from origin, looking at the origin
    // var cameraPosition = [Math.cos(time * .1), 0, Math.sin(time * .1)];
    var cameraPosition = cameraPositionMain
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    // Compute the camera's matrix using lookAt
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Derive a view matrix from the camera matrix
    var viewMatrix = m4.inverse(cameraMatrix);

    // Remove the translation component from the view matrix as we only care about direction
    viewMatrix[12] = 0;
    viewMatrix[13] = 0;
    viewMatrix[14] = 0;

    var viewDirectionProjectionMatrix =
        m4.multiply(projectionMatrix, viewMatrix);
    var viewDirectionProjectionInverseMatrix =
        m4.inverse(viewDirectionProjectionMatrix);

    // Set the uniform variables
    gl.uniformMatrix4fv(
        viewDirectionProjectionInverseLocation, false,
        viewDirectionProjectionInverseMatrix);

    // Instruct the shader to use texture unit 0 for u_skybox
    gl.uniform1i(skyboxLocation, 0);

    // Allow the quad to pass the depth test at 1.0
    gl.depthFunc(gl.LEQUAL);

    // Render the geometry
    gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);

    requestAnimationFrame(drawScene);
  }
}

// Fill the buffer with values defining a quad
function setGeometry(gl) {
  var positions = new Float32Array(
    [
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

main();
