// The uniform variable is set up in the javascript code and the same for all vertices
uniform vec3 orbPosition;
uniform float orbRadius;
uniform bool isPulling;
uniform vec3 grabPosition;
uniform float springAmount;


// This is a "varying" variable and interpolated between vertices and across fragments.
// The shared variable is initialized in the vertex shader and passed to the fragment shader.
out float intensity;
out vec3 pos;

void main() {
    pos = (modelMatrix * vec4(position, 1.0)).xyz;
    vec3 dir = normalize(orbPosition - pos);
    vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
    intensity = max(dot(worldNormal, dir), 0.0); 

    float dist = distance(pos, orbPosition);

    float distFromGrab = distance(pos, grabPosition);

    if (distFromGrab < orbRadius) {

      float weight = 1.0 - distFromGrab / orbRadius;
      weight = smoothstep(0.0, 1.0, weight);

      vec3 displacement = orbPosition - grabPosition;

      pos += displacement * weight * springAmount;
    }
    
    // TODO: Make changes here for part b, c, d
  	// HINT: INTENSITY IS CALCULATED BY TAKING THE DOT PRODUCT OF THE NORMAL AND LIGHT DIRECTION VECTORS

    // Multiply each vertex by the model matrix to get the world position of each vertex, 
    // then the view matrix to get the position in the camera coordinate system, 
    // and finally the projection matrix to get final vertex position
    gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
    
}
