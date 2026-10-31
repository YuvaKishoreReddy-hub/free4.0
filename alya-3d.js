// ==========================================================================
// ⚡ ASCEND 4.0 — ALYA 3D CHARACTER ENGINE & STUDIO (Three.js)
// "Adult fictional anime-inspired female character with long flowing ice-blue hair,
//  cyan glowing eyes, futuristic sci-fi suit, and holographic accessories."
// ==========================================================================

class Alya3DCharacter {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.alyaGroup = null;
    this.pedestalGroup = null;
    this.particlesGroup = null;
    this.faceCanvas = null;
    this.faceCtx = null;
    this.faceTexture = null;

    // Camera control states
    this.isDragging = false;
    this.isPanning = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.cameraTheta = 0; // horizontal angle
    this.cameraPhi = Math.PI / 2.2; // vertical angle
    this.cameraDistance = 2.8;
    this.cameraTarget = { x: 0, y: 1.15, z: 0 };
    
    // Auto-rotate settings
    this.autoRotate = true;
    this.autoRotateSpeed = 0.8;
    this.rotationSensitivity = 1.0;
    this.zoomSensitivity = 1.0;
    this.idleTimer = null;
    this.isInteracting = false;

    // Expression & Animation States
    this.currentExpression = 'calm';
    this.isSpeaking = false;
    this.blinkProgress = 0;
    this.lastBlinkTime = 0;
    this.currentAnimation = 'idle';
    this.animationTimer = 0;

    // Customization state
    this.customization = {
      hairstyle: 'flowing_twin',
      hairColor: 'ice_blue',
      outfit: 'cyber_vanguard',
      accessory: 'holo_visor',
      eyeGlow: 'cyan_nova',
      auraEffect: 'quantum_orbit',
      backgroundTheme: 'orbital_command'
    };

    // Color Maps
    this.hairColors = {
      ice_blue: 0x50E0FF,
      cyber_cyan: 0x00E5FF,
      neon_violet: 0x9D4EDD,
      starlight_gold: 0xFFD166,
      quantum_silver: 0xE0E6ED,
      hologram_pink: 0xFF4FCB
    };

    this.outfitColors = {
      cyber_vanguard: { primary: 0x0C1222, secondary: 0x00E5FF, accent: 0x287CFF },
      nano_athletic: { primary: 0x1A2536, secondary: 0x00E676, accent: 0x00E5FF },
      stealth_ops: { primary: 0x07090E, secondary: 0x334155, accent: 0xFF1744 },
      celestial_valkyrie: { primary: 0xF0F4FF, secondary: 0xFFC857, accent: 0x865CFF },
      holo_luminary: { primary: 0x1B1838, secondary: 0xFF4FCB, accent: 0x00E5FF }
    };

    this.init();
  }

  init() {
    if (!this.container) return;
    if (typeof THREE === 'undefined') {
      console.warn("Three.js not yet loaded, deferring init...");
      setTimeout(() => this.init(), 200);
      return;
    }

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070B16, 0.12);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.updateCameraPosition();

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    
    // Clear container and append canvas
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Lights
    this.setupLights();

    // 5. Build 3D Models
    this.buildPedestal();
    this.buildAlyaModel();
    this.buildParticleAura();

    // 6. Setup Event Handlers (Mouse, Touch, Resize)
    this.setupControls();

    // 7. Start Render Loop
    this.animate();
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0x1A2845, 1.2);
    this.scene.add(ambientLight);

    // Key Light (Cyan)
    const keyLight = new THREE.DirectionalLight(0x00E5FF, 2.0);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    // Fill Light (Purple/Blue)
    const fillLight = new THREE.DirectionalLight(0x865CFF, 1.4);
    fillLight.position.set(-3, 2, -2);
    this.scene.add(fillLight);

    // Rim/Back Light (Electric Blue)
    const rimLight = new THREE.DirectionalLight(0x287CFF, 2.5);
    rimLight.position.set(0, 3, -4);
    this.scene.add(rimLight);

    // Subtle Ground Uplight
    const upLight = new THREE.PointLight(0x00E5FF, 1.5, 4);
    upLight.position.set(0, 0.1, 0);
    this.scene.add(upLight);
  }

  buildPedestal() {
    this.pedestalGroup = new THREE.Group();

    // Base cylinder
    const baseGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.1, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0D1629,
      metalness: 0.8,
      roughness: 0.3
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.05;
    baseMesh.receiveShadow = true;
    this.pedestalGroup.add(baseMesh);

    // Holographic inner circle with neon cyan ring
    const ringGeo = new THREE.RingGeometry(0.7, 1.15, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.01;
    this.pedestalGroup.add(ringMesh);

    // Cyber concentric holographic rings
    for (let r = 0.3; r <= 1.0; r += 0.25) {
      const circGeo = new THREE.BufferGeometry();
      const points = [];
      for (let a = 0; a <= Math.PI * 2; a += 0.1) {
        points.push(new THREE.Vector3(Math.cos(a) * r, 0.02, Math.sin(a) * r));
      }
      circGeo.setFromPoints(points);
      const line = new THREE.Line(circGeo, new THREE.LineBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.4 }));
      this.pedestalGroup.add(line);
    }

    this.scene.add(this.pedestalGroup);
  }

  buildFaceTexture() {
    this.faceCanvas = document.createElement('canvas');
    this.faceCanvas.width = 512;
    this.faceCanvas.height = 512;
    this.faceCtx = this.faceCanvas.getContext('2d');
    this.updateFaceCanvas();

    this.faceTexture = new THREE.CanvasTexture(this.faceCanvas);
    return this.faceTexture;
  }

  updateFaceCanvas() {
    const ctx = this.faceCtx;
    if (!ctx) return;

    // Skin base tone
    ctx.fillStyle = '#FFEBE3';
    ctx.fillRect(0, 0, 512, 512);

    // Gentle blush
    const gradL = ctx.createRadialGradient(140, 290, 10, 140, 290, 60);
    gradL.addColorStop(0, 'rgba(255, 130, 170, 0.45)');
    gradL.addColorStop(1, 'rgba(255, 130, 170, 0)');
    ctx.fillStyle = gradL;
    ctx.beginPath();
    ctx.arc(140, 290, 60, 0, Math.PI * 2);
    ctx.fill();

    const gradR = ctx.createRadialGradient(372, 290, 10, 372, 290, 60);
    gradR.addColorStop(0, 'rgba(255, 130, 170, 0.45)');
    gradR.addColorStop(1, 'rgba(255, 130, 170, 0)');
    ctx.fillStyle = gradR;
    ctx.beginPath();
    ctx.arc(372, 290, 60, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeY = 220;
    const eyeH = 65 * (1 - this.blinkProgress);

    // Left & Right Eye Sclera & Iris
    [155, 357].forEach((eyeX, idx) => {
      ctx.save();
      // Eye whites
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, 44, Math.max(2, eyeH), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.clip();

      if (this.blinkProgress < 0.8) {
        // Iris gradient (Ice Blue / Cyan / Deep Blue)
        const irisGrad = ctx.createRadialGradient(eyeX, eyeY, 5, eyeX, eyeY, 32);
        irisGrad.addColorStop(0, '#FFFFFF');
        irisGrad.addColorStop(0.3, '#00E5FF');
        irisGrad.addColorStop(0.7, '#287CFF');
        irisGrad.addColorStop(1, '#0C1A38');
        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 32, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#060B18';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 14, 0, Math.PI * 2);
        ctx.fill();

        // Cyber glint star / highlights
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(eyeX - 10, eyeY - 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeX + 12, eyeY + 12, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Eyelash outline
      ctx.strokeStyle = '#1A2338';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY - (eyeH * 0.5), 46, Math.max(4, eyeH * 0.4), 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Eyebrow
      ctx.strokeStyle = '#4FB2D6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const browY = eyeY - 60 + (this.currentExpression === 'surprised' ? -15 : (this.currentExpression === 'thinking' ? (idx === 0 ? -10 : 5) : 0));
      ctx.moveTo(eyeX - 40, browY + 5);
      ctx.quadraticCurveTo(eyeX, browY - 5, eyeX + 40, browY + 3);
      ctx.stroke();
    });

    // Nose
    ctx.fillStyle = 'rgba(210, 140, 140, 0.4)';
    ctx.beginPath();
    ctx.arc(256, 305, 4, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#E24B70';
    ctx.fillStyle = '#FF5277';
    ctx.lineWidth = 4;
    ctx.beginPath();

    const mouthY = 360;
    if (this.isSpeaking) {
      const openAmount = 10 + Math.sin(Date.now() * 0.02) * 8;
      ctx.ellipse(256, mouthY, 20, openAmount, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (this.currentExpression === 'happy' || this.currentExpression === 'celebrating') {
      ctx.arc(256, mouthY - 10, 32, 0.2, Math.PI - 0.2, false);
      ctx.stroke();
    } else if (this.currentExpression === 'surprised') {
      ctx.ellipse(256, mouthY, 14, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Calm subtle smile
      ctx.moveTo(234, mouthY);
      ctx.quadraticCurveTo(256, mouthY + 12, 278, mouthY);
      ctx.stroke();
    }

    if (this.faceTexture) this.faceTexture.needsUpdate = true;
  }

  buildAlyaModel() {
    this.alyaGroup = new THREE.Group();

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xFFEBE3,
      roughness: 0.5,
      metalness: 0.1
    });

    const activeOutfit = this.outfitColors[this.customization.outfit] || this.outfitColors.cyber_vanguard;
    this.suitMatPrimary = new THREE.MeshStandardMaterial({
      color: activeOutfit.primary,
      metalness: 0.7,
      roughness: 0.35
    });

    this.suitMatAccent = new THREE.MeshStandardMaterial({
      color: activeOutfit.secondary,
      emissive: activeOutfit.secondary,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2
    });

    const activeHairCol = this.hairColors[this.customization.hairColor] || 0x50E0FF;
    this.hairMat = new THREE.MeshStandardMaterial({
      color: activeHairCol,
      emissive: activeHairCol,
      emissiveIntensity: 0.2,
      roughness: 0.4,
      metalness: 0.2
    });

    // 1. Head
    const headGeo = new THREE.SphereGeometry(0.24, 32, 32);
    headGeo.scale(1, 1.15, 0.95);
    const headFaceMat = new THREE.MeshStandardMaterial({
      map: this.buildFaceTexture(),
      roughness: 0.5,
      metalness: 0.1
    });
    this.headMesh = new THREE.Mesh(headGeo, headFaceMat);
    this.headMesh.position.y = 1.62;
    this.headMesh.castShadow = true;
    this.alyaGroup.add(this.headMesh);

    // 2. Hair (Bangs, Base cap, and flowing Twin Tails)
    const hairCapGeo = new THREE.SphereGeometry(0.255, 32, 32);
    const hairCap = new THREE.Mesh(hairCapGeo, this.hairMat);
    hairCap.position.set(0, 0.04, -0.02);
    this.headMesh.add(hairCap);

    // Flowing twin-tail hair ribbons
    this.hairTails = [];
    [-0.24, 0.24].forEach((xSide) => {
      const tailGroup = new THREE.Group();
      tailGroup.position.set(xSide, 0.08, -0.05);

      // Ribbon hair strand segments
      for (let i = 0; i < 5; i++) {
        const segGeo = new THREE.CylinderGeometry(0.04 - i * 0.006, 0.05 - i * 0.006, 0.25, 12);
        const seg = new THREE.Mesh(segGeo, this.hairMat);
        seg.position.y = -i * 0.22;
        seg.rotation.z = (xSide > 0 ? 0.08 : -0.08) * i;
        tailGroup.add(seg);
      }
      this.headMesh.add(tailGroup);
      this.hairTails.push(tailGroup);
    });

    // 3. Torso / Cyber Suit
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.5, 24);
    this.torsoMesh = new THREE.Mesh(torsoGeo, this.suitMatPrimary);
    this.torsoMesh.position.y = 1.25;
    this.torsoMesh.castShadow = true;
    this.alyaGroup.add(this.torsoMesh);

    // Glowing Chest Emblem ('A' for ASCEND)
    const emblemGeo = new THREE.CircleGeometry(0.06, 3);
    const emblem = new THREE.Mesh(emblemGeo, this.suitMatAccent);
    emblem.position.set(0, 0.1, 0.185);
    emblem.rotation.z = Math.PI;
    this.torsoMesh.add(emblem);

    // Belt / Pelvis
    const pelvisGeo = new THREE.CylinderGeometry(0.15, 0.17, 0.18, 24);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, this.suitMatPrimary);
    pelvisMesh.position.y = 0.95;
    this.alyaGroup.add(pelvisMesh);

    // 4. Arms
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.24, 1.45, 0);
    const armLGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.5, 16);
    const armLMesh = new THREE.Mesh(armLGeo, skinMat);
    armLMesh.position.y = -0.22;
    this.leftArm.add(armLMesh);
    this.alyaGroup.add(this.leftArm);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.24, 1.45, 0);
    const armRGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.5, 16);
    const armRMesh = new THREE.Mesh(armRGeo, skinMat);
    armRMesh.position.y = -0.22;
    this.rightArm.add(armRMesh);
    this.alyaGroup.add(this.rightArm);

    // 5. Legs & Cyber Boots
    [-0.1, 0.1].forEach((legX) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(legX, 0.88, 0);

      // Thigh
      const thighGeo = new THREE.CylinderGeometry(0.075, 0.06, 0.42, 16);
      const thighMesh = new THREE.Mesh(thighGeo, skinMat);
      thighMesh.position.y = -0.18;
      legGroup.add(thighMesh);

      // Cyber Combat Boot
      const bootGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.48, 16);
      const bootMesh = new THREE.Mesh(bootGeo, this.suitMatPrimary);
      bootMesh.position.y = -0.58;
      legGroup.add(bootMesh);

      // Glowing trim on boot
      const bootTrimGeo = new THREE.TorusGeometry(0.068, 0.008, 8, 24);
      const bootTrim = new THREE.Mesh(bootTrimGeo, this.suitMatAccent);
      bootTrim.position.y = -0.42;
      bootTrim.rotation.x = Math.PI / 2;
      legGroup.add(bootTrim);

      this.alyaGroup.add(legGroup);
    });

    // 6. Holographic Floating Visor Accessory
    this.visorGroup = new THREE.Group();
    const visorGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.06, 32, 1, true, 0, Math.PI);
    const visorMat = new THREE.MeshBasicMaterial({
      color: 0x00E5FF,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.04, 0.04);
    visorMesh.rotation.y = Math.PI / 2;
    this.visorGroup.add(visorMesh);
    this.headMesh.add(this.visorGroup);

    // 7. Holographic Stabilizer Wings (Back accessory)
    this.wingsGroup = new THREE.Group();
    this.wingsGroup.position.set(0, 1.35, -0.15);
    [-1, 1].forEach((wingSide) => {
      const wingGeo = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        0, 0, 0,
        wingSide * 0.6, 0.4, -0.1,
        wingSide * 0.45, -0.2, -0.05
      ]);
      wingGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const wingMat = new THREE.MeshBasicMaterial({
        color: 0x00E5FF,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      });
      const wing = new THREE.Mesh(wingGeo, wingMat);
      this.wingsGroup.add(wing);
    });
    this.alyaGroup.add(this.wingsGroup);

    this.scene.add(this.alyaGroup);
  }

  buildParticleAura() {
    this.particlesGroup = new THREE.Group();
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 0.5 + Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const y = Math.random() * 2.0;

      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * radius;

      colors[i * 3] = 0.0;     // R
      colors[i * 3 + 1] = 0.9; // G (Cyan)
      colors[i * 3 + 2] = 1.0; // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.auraParticles = new THREE.Points(geometry, material);
    this.particlesGroup.add(this.auraParticles);
    this.scene.add(this.particlesGroup);
  }

  // Camera & Touch Orbit Controls
  setupControls() {
    const dom = this.renderer.domElement;

    // Mouse drag
    dom.addEventListener('mousedown', (e) => {
      this.isInteracting = true;
      if (e.button === 0) this.isDragging = true;
      if (e.button === 2) this.isPanning = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging && !this.isPanning) return;
      const deltaX = (e.clientX - this.previousMousePosition.x) * 0.008 * this.rotationSensitivity;
      const deltaY = (e.clientY - this.previousMousePosition.y) * 0.008 * this.rotationSensitivity;

      if (this.isDragging) {
        this.cameraTheta -= deltaX;
        this.cameraPhi = Math.max(0.2, Math.min(Math.PI - 0.2, this.cameraPhi - deltaY));
      } else if (this.isPanning) {
        this.cameraTarget.x -= deltaX * 0.5;
        this.cameraTarget.y += deltaY * 0.5;
      }

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
      this.updateCameraPosition();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.isPanning = false;
      this.resetIdleTimer();
    });

    // Mouse Wheel Zoom
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.isInteracting = true;
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      this.cameraDistance = Math.max(0.8, Math.min(6.0, this.cameraDistance * zoomFactor * this.zoomSensitivity));
      this.updateCameraPosition();
      this.resetIdleTimer();
    }, { passive: false });

    // Double-click to Reset
    dom.addEventListener('dblclick', () => {
      this.resetCamera();
    });

    // Touch Support (1 finger rotate, 2 finger zoom/pan)
    let touchStartDist = 0;
    dom.addEventListener('touchstart', (e) => {
      this.isInteracting = true;
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.hypot(dx, dy);
      }
    });

    dom.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && this.isDragging) {
        const deltaX = (e.touches[0].clientX - this.previousMousePosition.x) * 0.008 * this.rotationSensitivity;
        const deltaY = (e.touches[0].clientY - this.previousMousePosition.y) * 0.008 * this.rotationSensitivity;
        this.cameraTheta -= deltaX;
        this.cameraPhi = Math.max(0.2, Math.min(Math.PI - 0.2, this.cameraPhi - deltaY));
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.updateCameraPosition();
      } else if (e.touches.length === 2 && touchStartDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        const factor = touchStartDist / currentDist;
        this.cameraDistance = Math.max(0.8, Math.min(6.0, this.cameraDistance * factor));
        touchStartDist = currentDist;
        this.updateCameraPosition();
      }
    }, { passive: false });

    dom.addEventListener('touchend', () => {
      this.isDragging = false;
      touchStartDist = 0;
      this.resetIdleTimer();
    });

    // Prevent context menu on right click
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    // Window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  resetIdleTimer() {
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.isInteracting = false;
    }, 2500);
  }

  updateCameraPosition() {
    if (!this.camera) return;
    const x = this.cameraTarget.x + this.cameraDistance * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
    const y = this.cameraTarget.y + this.cameraDistance * Math.cos(this.cameraPhi);
    const z = this.cameraTarget.z + this.cameraDistance * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.cameraTarget.x, this.cameraTarget.y, this.cameraTarget.z);
  }

  // Camera Presets
  setCameraPreset(preset) {
    switch (preset) {
      case 'front':
        this.cameraTheta = 0;
        this.cameraPhi = Math.PI / 2.2;
        this.cameraDistance = 2.8;
        this.cameraTarget = { x: 0, y: 1.15, z: 0 };
        break;
      case 'back':
        this.cameraTheta = Math.PI;
        this.cameraPhi = Math.PI / 2.2;
        this.cameraDistance = 2.8;
        this.cameraTarget = { x: 0, y: 1.15, z: 0 };
        break;
      case 'left':
        this.cameraTheta = -Math.PI / 2;
        this.cameraPhi = Math.PI / 2.2;
        this.cameraDistance = 2.8;
        this.cameraTarget = { x: 0, y: 1.15, z: 0 };
        break;
      case 'right':
        this.cameraTheta = Math.PI / 2;
        this.cameraPhi = Math.PI / 2.2;
        this.cameraDistance = 2.8;
        this.cameraTarget = { x: 0, y: 1.15, z: 0 };
        break;
      case 'three_quarter':
        this.cameraTheta = 0.65;
        this.cameraPhi = Math.PI / 2.3;
        this.cameraDistance = 2.6;
        this.cameraTarget = { x: 0, y: 1.15, z: 0 };
        break;
      case 'close_up':
      case 'face':
        this.cameraTheta = 0;
        this.cameraPhi = Math.PI / 2.05;
        this.cameraDistance = 0.95;
        this.cameraTarget = { x: 0, y: 1.62, z: 0 };
        break;
      case 'upper_body':
        this.cameraTheta = 0;
        this.cameraPhi = Math.PI / 2.15;
        this.cameraDistance = 1.7;
        this.cameraTarget = { x: 0, y: 1.38, z: 0 };
        break;
      case 'full_body':
        this.cameraTheta = 0;
        this.cameraPhi = Math.PI / 2.2;
        this.cameraDistance = 3.2;
        this.cameraTarget = { x: 0, y: 0.95, z: 0 };
        break;
    }
    this.updateCameraPosition();
  }

  rotateByAngle(angle) {
    this.cameraTheta += angle;
    this.updateCameraPosition();
  }

  spin360() {
    const startTheta = this.cameraTheta;
    const targetTheta = startTheta + Math.PI * 2;
    const duration = 1800; // ms
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      this.cameraTheta = startTheta + (Math.PI * 2) * ease;
      this.updateCameraPosition();

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  zoom(delta) {
    this.cameraDistance = Math.max(0.8, Math.min(6.0, this.cameraDistance + delta));
    this.updateCameraPosition();
  }

  resetCamera() {
    this.setCameraPreset('front');
  }

  setAutoRotate(enabled) {
    this.autoRotate = enabled;
  }

  // Animation triggers
  setAnimation(animName) {
    this.currentAnimation = animName;
    this.animationTimer = 0;
    this.setExpression(animName);
  }

  setExpression(expr) {
    this.currentExpression = expr;
    this.updateFaceCanvas();
  }

  setSpeaking(speaking) {
    this.isSpeaking = speaking;
    this.updateFaceCanvas();
  }

  // Customization methods
  setHairstyle(style) {
    this.customization.hairstyle = style;
  }

  setHairColor(colorKey) {
    this.customization.hairColor = colorKey;
    const hex = this.hairColors[colorKey] || 0x50E0FF;
    if (this.hairMat) {
      this.hairMat.color.setHex(hex);
      this.hairMat.emissive.setHex(hex);
    }
  }

  setOutfit(outfitKey) {
    this.customization.outfit = outfitKey;
    const cfg = this.outfitColors[outfitKey] || this.outfitColors.cyber_vanguard;
    if (this.suitMatPrimary) this.suitMatPrimary.color.setHex(cfg.primary);
    if (this.suitMatAccent) {
      this.suitMatAccent.color.setHex(cfg.secondary);
      this.suitMatAccent.emissive.setHex(cfg.secondary);
    }
  }

  setAccessory(accessoryKey) {
    this.customization.accessory = accessoryKey;
    if (this.visorGroup) {
      this.visorGroup.visible = (accessoryKey === 'holo_visor');
    }
    if (this.wingsGroup) {
      this.wingsGroup.visible = (accessoryKey === 'quantum_wings');
    }
  }

  // Render & Animation Loop
  animate() {
    requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;

    // 1. Auto Rotate when not manually dragging
    if (this.autoRotate && !this.isInteracting) {
      this.cameraTheta += 0.005 * this.autoRotateSpeed;
      this.updateCameraPosition();
    }

    // 2. Natural Blinking logic
    if (time - this.lastBlinkTime > 3.5 + Math.sin(time) * 1.5) {
      this.blinkProgress = Math.sin((time - this.lastBlinkTime - 3.5) * Math.PI * 4);
      if (this.blinkProgress <= 0) {
        this.blinkProgress = 0;
        this.lastBlinkTime = time;
      }
      this.updateFaceCanvas();
    }

    // 3. Lip-sync animation if speaking
    if (this.isSpeaking) {
      this.updateFaceCanvas();
    }

    // 4. Idle Breathing & Floating Motion
    if (this.alyaGroup) {
      const breath = Math.sin(time * 2.0) * 0.015;
      this.alyaGroup.position.y = breath;
      if (this.headMesh) {
        this.headMesh.rotation.y = Math.sin(time * 0.8) * 0.05;
        this.headMesh.rotation.x = Math.sin(time * 1.2) * 0.02;
      }
      // Hair sway
      if (this.hairTails) {
        this.hairTails.forEach((tail, idx) => {
          tail.rotation.z = Math.sin(time * 2.5 + idx) * 0.08;
          tail.rotation.x = Math.cos(time * 2.0) * 0.06;
        });
      }

      // Gestures
      if (this.currentAnimation === 'waving' && this.rightArm) {
        this.rightArm.rotation.z = 2.2 + Math.sin(time * 8.0) * 0.35;
        this.rightArm.rotation.x = 0.4;
      } else if (this.currentAnimation === 'celebrating') {
        if (this.leftArm) this.leftArm.rotation.z = -2.4 + Math.sin(time * 6.0) * 0.15;
        if (this.rightArm) this.rightArm.rotation.z = 2.4 + Math.sin(time * 6.0) * 0.15;
      } else {
        // Natural arm rest
        if (this.leftArm) this.leftArm.rotation.z = -0.15 + Math.sin(time * 1.5) * 0.02;
        if (this.rightArm) this.rightArm.rotation.z = 0.15 - Math.sin(time * 1.5) * 0.02;
      }
    }

    // 5. Holographic Pedestal rotation
    if (this.pedestalGroup) {
      this.pedestalGroup.rotation.y += 0.003;
    }

    // 6. Aura Particles movement
    if (this.particlesGroup) {
      this.particlesGroup.rotation.y += 0.008;
    }

    // 7. Render frame
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}

window.Alya3DCharacter = Alya3DCharacter;
