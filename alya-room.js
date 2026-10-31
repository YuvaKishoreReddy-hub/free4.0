// ==========================================================================
// ⚡ ASCEND 4.0 — ALYA 3D VIRTUAL LOUNGE ROOM (Three.js)
// "3D room environment, ALYA character, furniture, cyber cat, lighting,
//  decorations, achievements display, and interactive objects."
// ==========================================================================

class AlyaVirtualRoom {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.roomGroup = null;
    this.catGroup = null;
    this.catPurrActive = false;
    this.isDragging = false;
    this.previousMouse = { x: 0, y: 0 };
    this.camAngle = 0;
    this.raycaster = null;
    this.mouse = null;

    this.init();
  }

  init() {
    if (!this.container) return;
    if (typeof THREE === 'undefined') {
      setTimeout(() => this.init(), 200);
      return;
    }

    const w = this.container.clientWidth || 800;
    const h = this.container.clientHeight || 550;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070B16, 0.08);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.set(0, 1.8, 3.8);
    this.camera.lookAt(0, 1.1, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // Raycaster for interactive object clicks
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.setupLights();
    this.buildRoom();
    this.buildSkylineWindow();
    this.buildFurniture();
    this.buildCyberCat();
    this.buildTrophyPedestal();
    this.setupInteractions();

    this.animate();
  }

  setupLights() {
    const amb = new THREE.AmbientLight(0x182440, 1.5);
    this.scene.add(amb);

    // Neon purple/cyan room mood lights
    const pLight1 = new THREE.PointLight(0x865CFF, 2.2, 8);
    pLight1.position.set(-2, 2.5, 1);
    this.scene.add(pLight1);

    const pLight2 = new THREE.PointLight(0x00E5FF, 2.0, 8);
    pLight2.position.set(2, 2.5, 0.5);
    this.scene.add(pLight2);

    // Warm ceiling spot
    const spot = new THREE.SpotLight(0xFFF0DD, 1.8);
    spot.position.set(0, 4, 1);
    spot.target.position.set(0, 0, 0);
    this.scene.add(spot);
    this.scene.add(spot.target);
  }

  buildRoom() {
    this.roomGroup = new THREE.Group();

    // Floor
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090F1E,
      roughness: 0.2,
      metalness: 0.6
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.roomGroup.add(floor);

    // Neon floor grid borders
    const gridHelper = new THREE.GridHelper(8, 16, 0x00E5FF, 0x14213A);
    gridHelper.position.y = 0.01;
    this.roomGroup.add(gridHelper);

    // Back wall
    const wallGeo = new THREE.PlaneGeometry(10, 5);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0A1020,
      roughness: 0.7
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 2.5, -4);
    this.roomGroup.add(backWall);

    this.scene.add(this.roomGroup);
  }

  buildSkylineWindow() {
    // Panoramic window frame
    const winGeo = new THREE.PlaneGeometry(7, 3.2);
    const winCanvas = document.createElement('canvas');
    winCanvas.width = 1024;
    winCanvas.height = 512;
    const ctx = winCanvas.getContext('2d');

    // Cyberpunk Skyline art
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#040714');
    grad.addColorStop(0.6, '#0B1A3D');
    grad.addColorStop(1, '#865CFF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Distant futuristic spires & holographic buildings
    const buildingColors = ['#081226', '#0C1C3B', '#10244D'];
    for (let i = 0; i < 30; i++) {
      const bx = i * 36;
      const bw = 24 + (i % 3) * 12;
      const bh = 140 + Math.sin(i * 1.5) * 120 + ((i * 7) % 100);
      ctx.fillStyle = buildingColors[i % 3];
      ctx.fillRect(bx, 512 - bh, bw, bh);

      // Lit neon windows
      ctx.fillStyle = (i % 2 === 0) ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 79, 203, 0.5)';
      for (let wy = 512 - bh + 15; wy < 500; wy += 20) {
        if (Math.random() > 0.4) {
          ctx.fillRect(bx + 4, wy, 4, 8);
          ctx.fillRect(bx + bw - 8, wy, 4, 8);
        }
      }
    }

    const winTex = new THREE.CanvasTexture(winCanvas);
    const winMat = new THREE.MeshBasicMaterial({ map: winTex });
    const winMesh = new THREE.Mesh(winGeo, winMat);
    winMesh.position.set(0, 2.4, -3.95);
    this.roomGroup.add(winMesh);

    // Window frame border
    const frameGeo = new THREE.BoxGeometry(7.2, 0.1, 0.15);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x00E5FF, emissive: 0x00E5FF, emissiveIntensity: 0.3 });
    const topFrame = new THREE.Mesh(frameGeo, frameMat);
    topFrame.position.set(0, 4.0, -3.9);
    this.roomGroup.add(topFrame);
    const botFrame = topFrame.clone();
    botFrame.position.y = 0.8;
    this.roomGroup.add(botFrame);
  }

  buildFurniture() {
    // Luxury Neo-Tokyo Couch / Sofa
    const couchGroup = new THREE.Group();
    couchGroup.position.set(0, 0, -1.2);

    const seatGeo = new THREE.BoxGeometry(2.4, 0.35, 1.0);
    const sofaMat = new THREE.MeshStandardMaterial({
      color: 0x14213A,
      roughness: 0.6,
      metalness: 0.2
    });
    const seat = new THREE.Mesh(seatGeo, sofaMat);
    seat.position.y = 0.35;
    seat.castShadow = true;
    couchGroup.add(seat);

    // Backrest
    const backGeo = new THREE.BoxGeometry(2.4, 0.6, 0.25);
    const back = new THREE.Mesh(backGeo, sofaMat);
    back.position.set(0, 0.7, -0.4);
    couchGroup.add(back);

    // Armrests
    [-1.25, 1.25].forEach((armX) => {
      const armGeo = new THREE.BoxGeometry(0.2, 0.5, 1.0);
      const arm = new THREE.Mesh(armGeo, sofaMat);
      arm.position.set(armX, 0.5, 0);
      couchGroup.add(arm);
    });

    // Glowing cyan piping under sofa
    const glowPipeGeo = new THREE.BoxGeometry(2.4, 0.04, 0.04);
    const pipeMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF });
    const pipe = new THREE.Mesh(glowPipeGeo, pipeMat);
    pipe.position.set(0, 0.18, 0.5);
    couchGroup.add(pipe);

    this.roomGroup.add(couchGroup);

    // Coffee table
    const tableGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.06, 32);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x070B16,
      roughness: 0.1,
      metalness: 0.8
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0.3, 0.5);
    this.roomGroup.add(table);

    // Cyber Plant in glowing pot
    const potGeo = new THREE.CylinderGeometry(0.18, 0.12, 0.3, 16);
    const potMat = new THREE.MeshStandardMaterial({ color: 0x1A2B4C });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.set(1.8, 0.15, -1.2);
    this.roomGroup.add(pot);

    for (let p = 0; p < 5; p++) {
      const leafGeo = new THREE.SphereGeometry(0.15, 8, 8);
      leafGeo.scale(0.3, 1.5, 0.1);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x00E676, emissive: 0x00E676, emissiveIntensity: 0.3 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(1.8 + Math.cos(p) * 0.1, 0.4 + p * 0.05, -1.2 + Math.sin(p) * 0.1);
      leaf.rotation.z = Math.cos(p) * 0.4;
      this.roomGroup.add(leaf);
    }
  }

  buildCyberCat() {
    this.catGroup = new THREE.Group();
    this.catGroup.position.set(-1.2, 0.55, -0.9); // On sofa next to ALYA

    const catMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.3, metalness: 0.2 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF });

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.16, 16, 16);
    bodyGeo.scale(1.2, 0.9, 1.0);
    const body = new THREE.Mesh(bodyGeo, catMat);
    this.catGroup.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const head = new THREE.Mesh(headGeo, catMat);
    head.position.set(0.14, 0.12, 0);
    this.catGroup.add(head);

    // Ears
    [-0.05, 0.05].forEach((zE) => {
      const earGeo = new THREE.ConeGeometry(0.04, 0.08, 4);
      const ear = new THREE.Mesh(earGeo, catMat);
      ear.position.set(0.16, 0.22, zE);
      ear.rotation.z = -0.2;
      this.catGroup.add(ear);
    });

    // Glowing LED Blue Eyes
    [-0.04, 0.04].forEach((zEye) => {
      const eyeGeo = new THREE.SphereGeometry(0.025, 8, 8);
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(0.24, 0.14, zEye);
      this.catGroup.add(eye);
    });

    // Cyber Tail
    this.catTail = new THREE.Group();
    this.catTail.position.set(-0.18, 0.05, 0);
    for (let t = 0; t < 4; t++) {
      const segGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.08, 8);
      const seg = new THREE.Mesh(segGeo, catMat);
      seg.position.set(-t * 0.06, t * 0.04, 0);
      seg.rotation.z = 0.5;
      this.catTail.add(seg);
    }
    this.catGroup.add(this.catTail);

    this.roomGroup.add(this.catGroup);
  }

  buildTrophyPedestal() {
    // Holographic Achievement Showcase Pedestal
    const pedGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.9, 24);
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x0D1629, metalness: 0.8, roughness: 0.2 });
    const ped = new THREE.Mesh(pedGeo, pedMat);
    ped.position.set(-2.0, 0.45, 0.2);
    this.roomGroup.add(ped);

    // Floating Golden Ascend Star Trophy
    const starGeo = new THREE.OctahedronGeometry(0.14, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xFFC857,
      emissive: 0xFFA000,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.1
    });
    this.trophyStar = new THREE.Mesh(starGeo, starMat);
    this.trophyStar.position.set(-2.0, 1.15, 0.2);
    this.roomGroup.add(this.trophyStar);

    // Holographic beam around trophy
    const beamGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.6, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xFFC857,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(-2.0, 1.15, 0.2);
    this.roomGroup.add(beam);
  }

  setupInteractions() {
    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = (e.clientX - this.previousMouse.x) * 0.005;
      this.camAngle -= deltaX;
      this.camera.position.x = Math.sin(this.camAngle) * 3.8;
      this.camera.position.z = Math.cos(this.camAngle) * 3.8;
      this.camera.lookAt(0, 1.1, 0);
      this.previousMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Click interactive objects
    dom.addEventListener('click', (e) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && obj.parent !== this.scene && obj.parent !== this.roomGroup) {
          obj = obj.parent;
        }

        if (obj === this.catGroup) {
          window.store.playUiSound('success');
          window.store.showToast("Cyber Pet", "The cyber robotic cat purrs and glows happily with cyan LED pulses! 🐾", "success");
          this.catPurrActive = true;
          setTimeout(() => { this.catPurrActive = false; }, 2000);
        } else if (obj === this.trophyStar) {
          window.store.playUiSound('click');
          window.store.showToast("Achievement Showcase", "S-Rank Ascendant Milestone on display! +1000 XP achieved.", "info");
        }
      }
    });

    window.addEventListener('resize', () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const t = performance.now() * 0.001;

    // Rotate Trophy
    if (this.trophyStar) {
      this.trophyStar.rotation.y += 0.02;
      this.trophyStar.position.y = 1.15 + Math.sin(t * 2) * 0.04;
    }

    // Cat breathing & tail sway
    if (this.catGroup) {
      this.catGroup.position.y = 0.55 + Math.sin(t * (this.catPurrActive ? 12.0 : 2.0)) * 0.01;
      if (this.catTail) {
        this.catTail.rotation.z = Math.sin(t * (this.catPurrActive ? 8.0 : 2.5)) * 0.25;
      }
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.AlyaVirtualRoom = AlyaVirtualRoom;
