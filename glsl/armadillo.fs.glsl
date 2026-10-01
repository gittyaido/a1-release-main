// The value of the "varying" variable is interpolated between values computed in the vertex shader
// The varying variable we passed from the vertex shader is identified by the 'in' classifier

uniform vec3 orbPosition;
uniform float orbRadius;
uniform float maxStretch;

in float intensity;
in vec3 pos;
in float stretch;

void main() {
 	// TODO: Set final rendered colour to intensity (a grey level)
    vec4 unstretchedColor = vec4(vec3(intensity), 1.0);

	float dist = distance(pos, orbPosition);

    if (dist < orbRadius) {
        gl_FragColor = vec4(0.0, 1.0 * intensity, 1.0 * intensity, 1.0 * intensity);
    }
    else {
        gl_FragColor = unstretchedColor;
    }

    if (stretch <= 0.1) return;

    vec4 stretchedColor = vec4(1.0 * intensity / 2.0, 0.0, 0.0, 1.0);

    gl_FragColor = mix(unstretchedColor, stretchedColor, clamp(stretch / maxStretch, 0.0, 1.0));
}
