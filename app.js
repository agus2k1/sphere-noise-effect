import './main.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import fragment from './shaders/fragment.glsl.js';
import vertex from './shaders/vertex.glsl.js';
import vertexPars from './shaders/vertex/vertex_pars.glsl.js';
import vertexMain from './shaders/vertex/vertex_main.glsl.js';
import fragmentPars from './shaders/fragment/fragment_pars.glsl';
import fragmentMain from './shaders/fragment/fragment_main.glsl';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export default class Sketch {
  constructor() {
    this.scene = new THREE.Scene();
    this.container = document.getElementById('container');
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x050124, 1);
    this.renderer.useLegacyLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );
    this.camera.position.set(-3, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.time = 0;

    this.addMesh();
    this.addLights();
    this.setupResize();
    // this.resize();
    this.render();
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    // image cover
    this.imageAspect = 853 / 1280;
    let a1;
    let a2;
    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = this.height / this.width / this.imageAspect;
    }

    this.material.userData.shader.uniforms.value.x = this.width;
    this.material.userData.shader.uniforms.value.y = this.height;
    this.material.userData.shader.uniforms.value.z = a1;
    this.material.userData.shader.uniforms.value.w = a2;

    // optional - cover with quad
    const distance = this.camera.position.z;
    const height = 1;
    this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * distance));

    // if (w/h > 1)
    // if (this.width / this.height > 1) {
    //   this.plane.scale.x = this.camera.aspect;
    // } else {
    //   this.plane.scale.y = 1 / this.camera.aspect;
    // }

    this.camera.updateProjectionMatrix();
  }

  addLights() {
    const dirLight = new THREE.DirectionalLight('#526cff', 0.6);
    const ambientLight = new THREE.AmbientLight('#4255ff', 0.5);
    dirLight.position.set(2, 2, 2);

    this.scene.add(dirLight, ambientLight);
  }

  addMesh() {
    this.material = new THREE.MeshStandardMaterial({
      onBeforeCompile: (shader) => {
        // Reference to the shader from the material
        this.material.userData.shader = shader;

        // Uniforms
        shader.uniforms.uTime = { value: 0 };

        // Vertex shader
        const parsVertexString = /* glsl */ `#include <displacementmap_pars_vertex>`;
        shader.vertexShader = shader.vertexShader.replace(
          parsVertexString,
          parsVertexString + vertexPars
        );

        const mainVertexString = /* glsl */ `#include <displacementmap_vertex>`;
        shader.vertexShader = shader.vertexShader.replace(
          mainVertexString,
          mainVertexString + vertexMain
        );

        const parsFragmentString = /* glsl */ `#include <bumpmap_pars_fragment>`;
        shader.fragmentShader = shader.fragmentShader.replace(
          parsFragmentString,
          parsFragmentString + fragmentPars
        );

        const mainFragmentString = /* glsl */ `#include <normal_fragment_maps>`;
        shader.fragmentShader = shader.fragmentShader.replace(
          mainFragmentString,
          mainFragmentString + fragmentMain
        );
      },
    });
    this.geometry = new THREE.IcosahedronGeometry(1, 300);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);

    // postprocessing
    // addPass(
    //   new UnrealBloomPass(
    //     new THREE.Vector2(this.width, this.height),
    //     0.7,
    //     0.4,
    //     0.4
    //   )
    // );
  }

  render() {
    this.time += 0.003;
    if (this.material.userData.shader) {
      this.material.userData.shader.uniforms.uTime.value = this.time;
    }
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch();
