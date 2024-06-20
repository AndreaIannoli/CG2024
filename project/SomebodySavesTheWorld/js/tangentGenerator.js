// Constructs an iterator to go through an array of indices.
function createIndexIterator(indices) {
    let currentIndex = 0; // Tracks the current index in the array.
    
    // Returns the current index and advances to the next one.
    const iterator = () => indices[currentIndex++];
    
    // Resets the currentIndex to the start.
    iterator.reset = () => { currentIndex = 0; };
    
    // Provides the total count of indices.
    iterator.numElements = indices.length;
    
    return iterator; // Outputs the iterator function.
}
  
// Constructs an iterator to traverse positions without indices.
function createUnindexedIterator(positions) {
    let currentIndex = 0; // Tracks the current position.
    
    // Returns the current index and advances to the next one.
    const iterator = () => currentIndex++;
    
    // Resets the currentIndex to the start.
    iterator.reset = () => { currentIndex = 0; };
    
    // Provides the count of 3D position vectors.
    iterator.numElements = positions.length / 3;
    
    return iterator; // Outputs the iterator function.
}
  
// Subtracts two 2D vectors.
const subtract2DVector = (a, b) => a.map((v, index) => v - b[index]);
  
// Main function to generate tangent vectors.
function generateTangents(positions, texcoords, indices) {
    // Selects an index iterator based on the presence of indices.
    const nextIndex = indices ? createIndexIterator(indices) : createUnindexedIterator(positions);
    
    const totalVerts = nextIndex.numElements; // Total number of vertices.
    const totalFaces = totalVerts / 3; // Total number of triangular faces.
  
    const tangents = []; // Array to store tangents.
    
    for (let i = 0; i < totalFaces; ++i) {
        // Retrieve the indices of the vertices for the current triangle.
        const i1 = nextIndex();
        const i2 = nextIndex();
        const i3 = nextIndex();
  
        // Get the positions of the triangle vertices.
        const pos1 = positions.slice(i1 * 3, i1 * 3 + 3);
        const pos2 = positions.slice(i2 * 3, i2 * 3 + 3);
        const pos3 = positions.slice(i3 * 3, i3 * 3 + 3);
  
        // Get the texture coordinates of the triangle vertices.
        const uv1 = texcoords.slice(i1 * 2, i1 * 2 + 2);
        const uv2 = texcoords.slice(i2 * 2, i2 * 2 + 2);
        const uv3 = texcoords.slice(i3 * 2, i3 * 2 + 2);
  
        // Calculate position difference vectors.
        const deltaPos1 = m4.subtractVectors(pos2, pos1);
        const deltaPos2 = m4.subtractVectors(pos3, pos1);
  
        // Calculate texture coordinate difference vectors.
        const deltaUV1 = subtract2DVector(uv2, uv1);
        const deltaUV2 = subtract2DVector(uv3, uv1);
  
        // Compute the inverse determinant factor.
        const invDet = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV2[0] * deltaUV1[1]);
        
        // Calculate the tangent vector if the factor is finite.
        const tangent = Number.isFinite(invDet)
            ? m4.normalize(m4.scaleVector(m4.subtractVectors(
                m4.scaleVector(deltaPos1, deltaUV2[1]),
                m4.scaleVector(deltaPos2, deltaUV1[1]),
            ), invDet))
            : [1, 0, 0]; // Default tangent vector if factor is not finite.
  
        // Add the tangent vector three times, once for each vertex.
        tangents.push(...tangent, ...tangent, ...tangent);
    }
  
    return tangents; // Return the array of tangents.
}
