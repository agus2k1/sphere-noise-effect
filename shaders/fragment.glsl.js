const fragmentShader = /*glsl */ `
  uniform float uTime;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vDisplacement;
  
  void main() {
    
    gl_FragColor = vec4( 0.1, 0.3, 0.8, 1.);
  }
`;

export default fragmentShader;
