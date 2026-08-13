/* Refed 3D WebGL Background Scene using Three.js */

class Refed3DScene {
  constructor() {
    this.canvas = document.getElementById('three-canvas');
    if (!this.canvas) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    this.floatingObjects = [];
    this.particles = null;

    this.init();
  }

  init() {
    // Renderer settings
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Camera position
    this.camera.position.z = 25;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00e676, 2, 50);
    pointLight1.position.set(15, 15, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00f2fe, 2, 50);
    pointLight2.position.set(-15, -10, 10);
    this.scene.add(pointLight2);

    // Create 3D Geometric Floating Objects
    this.createFloatingElements();

    // Create Neural AI Node Network Particles
    this.createParticleField();

    // Event Listeners
    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.onMouseMove(e.touches[0]);
      }
    }, { passive: true });

    // Start Animation Loop
    this.animate();
  }

  createFloatingElements() {
    // Geometries representing organic food cells / recycled nodes
    const geometries = [
      new THREE.IcosahedronGeometry(1.2, 1),
      new THREE.TorusGeometry(1.5, 0.3, 16, 32),
      new THREE.OctahedronGeometry(1.0, 0),
      new THREE.DodecahedronGeometry(1.3, 0),
      new THREE.TorusKnotGeometry(1.1, 0.25, 64, 8)
    ];

    const materials = [
      new THREE.MeshStandardMaterial({
        color: 0x00e676,
        metalness: 0.3,
        roughness: 0.2,
        wireframe: true,
        transparent: true,
        opacity: 0.45
      }),
      new THREE.MeshStandardMaterial({
        color: 0x00f2fe,
        metalness: 0.5,
        roughness: 0.1,
        transparent: true,
        opacity: 0.35
      }),
      new THREE.MeshStandardMaterial({
        color: 0xffc107,
        metalness: 0.2,
        roughness: 0.3,
        transparent: true,
        opacity: 0.4
      })
    ];

    // Spawn floating items in 3D space
    for (let i = 0; i < 24; i++) {
      const geo = geometries[Math.floor(Math.random() * geometries.length)];
      const mat = materials[Math.floor(Math.random() * materials.length)].clone();

      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.x = (Math.random() - 0.5) * 50;
      mesh.position.y = (Math.random() - 0.5) * 35;
      mesh.position.z = (Math.random() - 0.5) * 25 - 5;

      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      const scale = Math.random() * 0.8 + 0.6;
      mesh.scale.set(scale, scale, scale);

      // Custom motion data
      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.015,
        floatSpeedY: (Math.random() * 0.01) + 0.005,
        floatOffset: Math.random() * Math.PI * 2
      };

      this.scene.add(mesh);
      this.floatingObjects.push(mesh);
    }
  }

  createParticleField() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00e676);
    const color2 = new THREE.Color(0x00f2fe);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      const mixedColor = color1.clone().lerp(color2, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  onMouseMove(event) {
    this.targetMouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    this.targetMouseY = (event.clientY / window.innerHeight - 0.5) * 2;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Smooth lerp mouse parallax
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    this.camera.position.x = this.mouseX * 3;
    this.camera.position.y = -this.mouseY * 3;
    this.camera.lookAt(this.scene.position);

    // Rotate floating geometries
    const time = Date.now() * 0.001;
    this.floatingObjects.forEach(obj => {
      obj.rotation.x += obj.userData.rotSpeedX;
      obj.rotation.y += obj.userData.rotSpeedY;
      obj.position.y += Math.sin(time + obj.userData.floatOffset) * 0.005;
    });

    if (this.particles) {
      this.particles.rotation.y = time * 0.02;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof THREE !== 'undefined') {
    new Refed3DScene();
  }
});
