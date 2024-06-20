const vs = `
// Attribute variables are input per vertex from the vertex buffer
attribute vec4 a_position; // Position of the vertex
attribute vec3 a_normal; // Normal vector of the vertex
attribute vec2 a_texcoord; // Texture coordinates of the vertex
attribute vec3 a_tangent; // Tangent vector of the vertex
attribute vec4 a_color; // Color of the vertex

// Uniform variables are the same for all vertices in a single draw call
uniform mat4 u_projection; // Projection matrix
uniform mat4 u_view; // View matrix
uniform mat4 u_world; // World transformation matrix
uniform vec3 u_viewWorldPosition; // Position of the camera in world space

// Varying variables are passed to the fragment shader
varying vec3 v_normal; // Normal vector in world space
varying vec3 v_surfaceToView; // Vector from surface to view position
varying vec3 v_tangent; // Tangent vector in world space
varying vec2 v_texcoord; // Texture coordinates
varying vec4 v_color; // Color of the vertex

void main() {
  // Transform the position to world space
  vec4 worldPosition = u_world * a_position;

  // Transform the position to clip space and assign to gl_Position
  gl_Position = u_projection * u_view * worldPosition;

  // Compute the vector from the surface to the view position in world space
  v_surfaceToView = u_viewWorldPosition - worldPosition.xyz;

  // Transform the normal to world space and normalize it
  v_normal = normalize(mat3(u_world) * a_normal);

  // Pass the texture coordinates to the fragment shader
  v_texcoord = a_texcoord;

  // Transform the tangent to world space and normalize it
  v_tangent = normalize(mat3(u_world) * a_tangent);

  // Pass the color to the fragment shader
  v_color = a_color;
}
`;

const fs = `
// Specifies the precision for floating point variables
precision highp float;

// Varying variables received from the vertex shader
varying vec3 v_normal; // Normal vector in world space
varying vec3 v_surfaceToView; // Vector from surface to view position
varying vec3 v_tangent; // Tangent vector in world space
varying vec2 v_texcoord; // Texture coordinates
varying vec4 v_color; // Color of the vertex

// Uniform variables are the same for all fragments in a single draw call
uniform vec3 diffuse; // Diffuse color
uniform sampler2D diffuseMap; // Diffuse texture map
uniform vec3 ambient; // Ambient color
uniform vec3 emissive; // Emissive color
uniform vec3 specular; // Specular color
uniform float shininess; // Shininess coefficient for specular highlights
uniform float opacity; // Opacity of the material
uniform vec3 u_lightDirection; // Direction of the light source
uniform vec3 u_ambientLight; // Ambient light color
uniform int u_bumpMapping; // Flag to indicate if bump mapping is enabled
uniform sampler2D normalMap; // Normal map for bump mapping

void main () {
  // Normalize the normal vector and adjust based on the fragment facing
  vec3 normal = normalize(v_normal) * ( float( gl_FrontFacing ) * 2.0 - 1.0 );

  // If bump mapping is enabled, modify the normal vector using the normal map
  if (u_bumpMapping == 1) {
    // Normalize the tangent vector and adjust based on the fragment facing
    vec3 tangent = normalize(v_tangent) * ( float( gl_FrontFacing ) * 2.0 - 1.0 );

    // Compute the bitangent vector
    vec3 bitangent = normalize(cross(normal, tangent)); 

    // Construct the TBN matrix (tangent, bitangent, normal)
    mat3 tbn = mat3(tangent, bitangent, normal);

    // Sample the normal map and convert from [0, 1] to [-1, 1]
    normal = texture2D(normalMap, v_texcoord).rgb * 2. - 1.;

    // Transform the sampled normal using the TBN matrix
    normal = normalize(tbn * normal);
  }

  // Compute the direction from the surface to the view position
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);

  // Compute the half vector for specular reflection
  vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);

  // Compute a simple diffuse lighting term
  float fakeLight = dot(u_lightDirection, normal) * .5 + .5;

  // Compute the specular lighting term
  float specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);

  // Sample the diffuse color from the texture map
  vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord);

  // Compute the effective diffuse color
  vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb;

  // Compute the effective opacity
  float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a;

  // Compute the final color and assign to gl_FragColor
  gl_FragColor = vec4(
      emissive + // Emissive term
      ambient * u_ambientLight + // Ambient term
      effectiveDiffuse * fakeLight + // Diffuse term
      specular * pow(specularLight, shininess), // Specular term
      effectiveOpacity); // Final opacity
}
`;