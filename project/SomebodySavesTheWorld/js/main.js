"use strict";

var cameraPositionMain = m4.identity()
let viewMatrixMain;
let projection;

let frontLightX = 1;
let frontLightY = 1;
let frontLightZ = -1;

let bumped = false;

let rocketSpeed = 0.2

var u_world_rocket = m4.identity();

var earthCenter = [0, 0, -20];

var meteorites = [];
var level = 0;

var model_portrait;


async function main() {
  // compiles and links the shaders, looks up attribute and uniform locations
  const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);

  const objHref_rocket = 'rocket/rocket.obj';
  var model_rocket = await loadModel(gl, objHref_rocket);

  const objHref_earth = 'earth/earth.obj';
  var model_earth = await loadModel(gl, objHref_earth);

  const objHref_meteorite = 'meteorite/meteorite.obj';
  var model_meteorite = await loadModel(gl, objHref_meteorite);

  const objHref_portrait = 'portrait/portrait.obj';
  model_portrait = await loadModel(gl, objHref_portrait);

  // Set zNear and zFar to something hopefully appropriate
  // for the size of this object.
  const zNear = 0.1;
  const zFar = 2000;

  var modelXRotationRadians1 = degToRad(0);
  var modelYRotationRadians1 = degToRad(0);

  var modelXRotationRadians2 = degToRad(0);
  var modelYRotationRadians2 = degToRad(0);

  // Get the starting time.
  var then = 0;

  function render(time) {
    time *= 0.001;  // convert to seconds
    // Subtract the previous time from the current time
    var deltaTime = time - then;
    // Remember the current time for the next frame.
    then = time;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);

    const fieldOfViewRadians = degToRad(60);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    // Animate the rotation
    modelYRotationRadians1 += 0.7 * deltaTime;
    modelXRotationRadians1 += 0.4 * (1 * deltaTime);

    // compute the world matrix
    let u_world = m4.identity();
    u_world = m4.translate(u_world_rocket, ...model_rocket.objOffset);
    u_world = rotateObject([-90, 0, 0], u_world)
    u_world = moveObject([0, -1, -5], u_world);
    u_world = m4.yRotate(u_world, modelXRotationRadians1);

    var sharedUniforms;
    viewMatrixMain = m4.inverse(u_world);

    viewMatrixMain = m4.inverse(cameraPositionMain);

    sharedUniforms = {
      u_lightDirection: m4.normalize([frontLightX, frontLightY, frontLightZ]), // light direction vector
      u_bumpMapping: bumped ? 1 : 0,
      u_view: viewMatrixMain,
      u_viewWorldPosition: [0.0, 0.0, 1.0],
      u_projection: projection,
      diffuse: [1.0, 1.0, 1.0],
      ambient: [1.0, 1.0, 1.0],
      emissive: [1.0, 1.0, 1.0],
      specular: [1.0, 1.0, 1.0],
      u_ambientLight: [0.03, 0.03, 0.03]
    };
    

    // Extract rocket position from u_world matrix
    let rocketPosition = {
      x: u_world[12], 
      y: u_world[13],
      z: u_world[14]};

    gl.useProgram(meshProgramInfo.program);

    // calls gl.uniform
    webglUtils.setUniforms(meshProgramInfo, sharedUniforms);

    renderGenericModel(u_world, model_rocket, meshProgramInfo);

    // Animate the rotation
    modelYRotationRadians2 += -0.7 * deltaTime;
    modelXRotationRadians2 += -0.4 * deltaTime;

    // Set the world matrix to identity
    u_world = m4.identity();
    u_world = m4.translate(u_world, 0, 0, -20);
    u_world = m4.xRotate(u_world, modelXRotationRadians2);
    u_world = m4.yRotate(u_world, modelYRotationRadians2);
    u_world = m4.translate(u_world, ...model_earth.objOffset);

    renderGenericModel(u_world, model_earth, meshProgramInfo);

    u_world = m4.identity();
    u_world = m4.translate(u_world, 0, -5, -20);
    u_world = m4.translate(u_world, ...model_portrait.objOffset);
    renderGenericModel(u_world, model_portrait, meshProgramInfo)

    // Call the method to render metheorites
    renderMeteorites(u_world, model_meteorite, meshProgramInfo, deltaTime, rocketPosition);
    requestAnimationFrame(render);
    updateCameraPosition();
  }
  requestAnimationFrame(render);
}

function generateRandomMeteorite(number) {
  for(let i = 0; i < number; i++) {
    let minX = -40 + earthCenter[0];
    let maxX = 40 + earthCenter[0];
    let minY = -40 + earthCenter[1];
    let maxY = 40 + earthCenter[1];
    let minZ = -40 + earthCenter[2];
    let maxZ = 40 + earthCenter[2];
    let exclusionRange = 20;

    let x = getRandomExcludingMidRange(minX, maxX, exclusionRange);
    let y = getRandomExcludingMidRange(minY, maxY, exclusionRange);
    let z = getRandomExcludingMidRange(minZ, maxZ, exclusionRange);
    let xRotationCoef = Math.random();
    let yRotationCoef = Math.random();
    let xRotationRadians = degToRad(0);
    let yRotationRadians = degToRad(0);
    let meteorite = {position: [x, y, z], rotation: [xRotationCoef, yRotationCoef, xRotationRadians, yRotationRadians]};
    meteorites.push(meteorite);
  }
}

function renderGenericModel(u_world, model, meshProgramInfo) {
  for (const {bufferInfo, material} of model.parts) {
    // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
    webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
    // calls gl.uniform
    webglUtils.setUniforms(meshProgramInfo, {
      u_world,
    }, material);
    // calls gl.drawArrays or gl.drawElements
    webglUtils.drawBufferInfo(gl, bufferInfo);
  }
}

function renderMeteorites(u_world, model_meteorite, meshProgramInfo, deltaTime, rocketPosition) {
  for(let i = 0; i < meteorites.length; i++) {
    // Assign a consistent speed for each meteorite
    let speed = 0.08; // Adjust this value for a consistent speed

      // Calculate the direction vector to the earth center
    let directionToRocket = {
        x: rocketPosition.x - meteorites[i].position[0],
        y: rocketPosition.y - meteorites[i].position[1],
        z: rocketPosition.z - meteorites[i].position[2]
    };

    // Calculate the current distance to the earth center
    let currentDistanceFromRocket = Math.sqrt(
        Math.pow(directionToRocket.x, 2) +
        Math.pow(directionToRocket.y, 2) +
        Math.pow(directionToRocket.z, 2)
    );

    if(currentDistanceFromRocket < 2) {
      document.getElementById("meteorite-explosion").play();
      meteorites.splice(i, 1);
      if(meteorites.length <= 0) {
        nextLevel();
      } else {
        updateMetoritesLeft();
      }
      continue;
    }
  
    // Calculate the direction vector to the earth center
    let directionToEarth = {
        x: earthCenter[0] - meteorites[i].position[0],
        y: earthCenter[1] - meteorites[i].position[1],
        z: earthCenter[2] - meteorites[i].position[2]
    };

    // Calculate the current distance to the earth center
    let currentDistanceFromEarth = Math.sqrt(
        Math.pow(directionToEarth.x, 2) +
        Math.pow(directionToEarth.y, 2) +
        Math.pow(directionToEarth.z, 2)
    );

    if(currentDistanceFromEarth < 1) {
      gameover(level, meteorites.length);
      meteorites = [];
      continue;
    }

    u_world = m4.identity();
    u_world = m4.translate(u_world, ...model_meteorite.objOffset);
    meteorites[i].rotation[3] += -meteorites[i].rotation[1] * deltaTime;
    meteorites[i].rotation[2] += -meteorites[i].rotation[0] * deltaTime;
    u_world = m4.xRotate(u_world, meteorites[i].rotation[2]);
    u_world = m4.yRotate(u_world, meteorites[i].rotation[3]);

    // Normalize the direction vector
    directionToEarth.x /= currentDistanceFromEarth;
    directionToEarth.y /= currentDistanceFromEarth;
    directionToEarth.z /= currentDistanceFromEarth;

    // Move the meteorite towards the earth center by its speed
    meteorites[i].position[0] += directionToEarth.x * speed;
    meteorites[i].position[1] += directionToEarth.y * speed;
    meteorites[i].position[2] += directionToEarth.z * speed;
    
    u_world = moveObject([meteorites[i].position[0], meteorites[i].position[1], meteorites[i].position[2]], u_world);

    u_world = resizeObject(0.5, u_world);
    
    for (const {bufferInfo, material} of model_meteorite.parts) {
      // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
      webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
      // calls gl.uniform
      webglUtils.setUniforms(meshProgramInfo, {
        u_world,
      }, material);
      // calls gl.drawArrays or gl.drawElements
      webglUtils.drawBufferInfo(gl, bufferInfo);
    }
  }
}

async function loadModel(gl, objHref) {
  const response = await fetch(objHref);
  const text = await response.text();
  const obj = parseOBJ(text);
  const baseHref = new URL(objHref, window.location.href);
  const matTexts = await Promise.all(obj.materialLibs.map(async filename => {
    const matHref = new URL(filename, baseHref).href;
    const response = await fetch(matHref);
    return await response.text();
  }));
  const materials = parseMTL(matTexts.join('\n'));

  // load texture for materials
  for (const material of Object.values(materials)) {
    Object.entries(material)
      .filter(([key]) => key.endsWith('Map'))
      .forEach(([key, filename]) => {
        let texture = textures[filename];
        if (!texture) {
          const textureHref = new URL(filename, baseHref).href;
          texture = createTexture(gl, textureHref);
          textures[filename] = texture;
        }
        material[key] = texture;
      });
  }

  const parts = obj.geometries.map(({material, data}) => {
    // Because data is just named arrays like this
    //
    // {
    //   position: [...],
    //   texcoord: [...],
    //   normal: [...],
    // }
    //
    // and because those names match the attributes in our vertex
    // shader we can pass it directly into `createBufferInfoFromArrays`

    if (data.color) {
      if (data.position.length === data.color.length) {
        // it's 3. The our helper library assumes 4 so we need
        // to tell it there are only 3.
        data.color = { numComponents: 3, data: data.color };
      }
    } else {
      // there are no vertex colors so just use constant white
      data.color = { value: [1, 1, 1, 1] };
    }

    // Generate tangents if data is available
    if (data.texcoord && data.normal) {
      data.tangent = generateTangents(data.position, data.texcoord);
    } else {
      data.tangent = { value: [1, 0, 0] };
    }

    if (!data.texcoord) {
      data.texcoord = { value: [0, 0] };
    }

    if (!data.normal) {
      data.normal = { value: [0, 0, 1] };
    }

    // create a buffer for each array by calling
    // gl.createBuffer, gl.bindBuffer, gl.bufferData
    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
    return {
      material: {
        ...defaultMaterial,
        ...materials[material],
      },
      bufferInfo,
    };
  });

  

  const extents = getGeometriesExtents(obj.geometries);
  const range = m4.subtractVectors(extents.max, extents.min);
  // amount to move the object so its center is at the origin
  const objOffset = m4.scaleVector(
      m4.addVectors(
        extents.min,
        m4.scaleVector(range, 0.5)),
      -1);

  return {parts, objOffset}
}

function saveFrontLight() {
  frontLightX = document.getElementById("xFrontLight").value;
  frontLightY = document.getElementById("yFrontLight").value;
  frontLightZ = document.getElementById("zFrontLight").value;
}

function setBumped() {
  bumped = document.getElementById("bumpMapCheck").checked;
  console.log(bumped);
}

function saveSettings() {
  saveFrontLight();
  setBumped();
}

function getRayFromMouse(mouseX, mouseY) {
  const rect = gl.canvas.getBoundingClientRect();
  console.log(rect.right);
  console.log(rect.left);
  const x = mouseX - rect.left;
  const y = mouseY - rect.top;
  const clipSpace = [
    (x / rect.width) * 2 - 1,
    (y / rect.height) * -2 + 1,
    -1, 1
  ];

  const inverseProjection = m4.inverse(projection);
  const inverseView = m4.inverse(viewMatrixMain);
  const invProjViewMatrix = m4.multiply(inverseProjection, inverseView);

  const rayClip = m4.transformPoint(invProjViewMatrix, clipSpace);
  let rayOrigin = [invProjViewMatrix[12], invProjViewMatrix[13], invProjViewMatrix[14]];
  let rayDirection = m4.normalize(m4.subtractVectors(rayClip, rayOrigin));

  return {
    origin: rayOrigin,
    direction: rayDirection
  };
}

gl.canvas.addEventListener('click', (event) => {
  const ray = getRayFromMouse(event.clientX, event.clientY);
  frontLightX = ray.origin[0] + ray.direction[0];
  frontLightY = ray.origin[1] + ray.direction[1];
  frontLightZ = ray.origin[2] + ray.direction[2];
});

main();