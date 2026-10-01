// The value of the "varying" variable is interpolated between values computed in the vertex shader
// The varying variable we passed from the vertex shader is identified by the 'in' classifier

uniform vec3 orbPosition;
uniform float orbRadius;

in float intensity;
in vec3 pos;

void main() {
 	// TODO: Set final rendered colour to intensity (a grey level)
	float dist = distance(pos, orbPosition);

    if (dist < orbRadius) {
        gl_FragColor = vec4(0.0, 1.0 * intensity, 1.0 * intensity, 1.0 * intensity);
    }
    else {
        gl_FragColor = vec4(vec3(intensity), 1.0);
    }
}
