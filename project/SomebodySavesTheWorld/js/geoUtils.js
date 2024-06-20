function resizeObject(resizeObj, u_world) {
    const scaleMatrix = m4.scaling(resizeObj, resizeObj, resizeObj);
    return m4.multiply(u_world, scaleMatrix);
}

function moveObject(positionObj, u_world) {
    const translationMatrix = m4.translation(positionObj[0], positionObj[1], positionObj[2]);

    return m4.multiply(translationMatrix, u_world);
}

function rotateObject(rotatePosition, u_world) {
    const xRotationMatrix = m4.xRotation(degToRad(rotatePosition[0]));
    const yRotationMatrix = m4.yRotation(degToRad(rotatePosition[1]));
    const zRotationMatrix = m4.zRotation(degToRad(rotatePosition[2]));

    return m4.multiply(m4.multiply(m4.multiply(u_world, xRotationMatrix), yRotationMatrix), zRotationMatrix);
}

function getExtents(positions) {
    const min = positions.slice(0, 3);
    const max = positions.slice(0, 3);
    for (let i = 3; i < positions.length; i += 3) {
      for (let j = 0; j < 3; ++j) {
        const v = positions[i + j];
        min[j] = Math.min(v, min[j]);
        max[j] = Math.max(v, max[j]);
      }
    }
    return {min, max};
}
  
function getGeometriesExtents(geometries) {
    return geometries.reduce(({min, max}, {data}) => {
      const minMax = getExtents(data.position);
      return {
        min: min.map((min, ndx) => Math.min(minMax.min[ndx], min)),
        max: max.map((max, ndx) => Math.max(minMax.max[ndx], max)),
      };
    }, {
      min: Array(3).fill(Number.POSITIVE_INFINITY),
      max: Array(3).fill(Number.NEGATIVE_INFINITY),
    });
}