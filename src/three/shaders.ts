// Shader de Fresnel: bordas iluminadas em laranja conforme o ângulo da câmera.
export const fresnelVertex = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const fresnelFragment = /* glsl */ `
  uniform vec3 uBody;
  uniform vec3 uRim;
  uniform float uTime;
  uniform float uAlpha;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
    float scan = 0.5 + 0.5 * sin(gl_FragCoord.y * 0.09 + uTime * 1.6);
    vec3 col = uBody * (0.55 + 0.25 * scan) + uRim * f * 1.6;
    gl_FragColor = vec4(col, uAlpha * (0.35 + f * 0.65));
  }
`;
