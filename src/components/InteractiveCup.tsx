"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function InteractiveCup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const isRotatingRef = useRef(true);
  const targetRotYRef = useRef(0);
  const targetRotXRef = useRef(0.04);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 540;
    const height = container.clientHeight || 640;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera: Positioned with ample breathing room so hat & straw are 100% visible
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(0, 0.18, 13.5);

    // 3. High Dynamic Range Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 4. Studio Environment Lighting (HDR reflections on crystal lid & glass)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envScene = new THREE.Scene();

    // Bright softbox key light for crystal lid highlights
    const softboxKey = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    softboxKey.position.set(6, 8, 8);
    softboxKey.lookAt(0, 0, 0);
    envScene.add(softboxKey);

    // Warm golden amber rim softbox
    const softboxRim = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 18),
      new THREE.MeshBasicMaterial({ color: 0xe6a147 })
    );
    softboxRim.position.set(-8, 4, -6);
    softboxRim.lookAt(0, 0, 0);
    envScene.add(softboxRim);

    // Overhead dome light to illuminate lid top
    const softboxTop = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 18),
      new THREE.MeshBasicMaterial({ color: 0xfff0dd })
    );
    softboxTop.position.set(0, 14, 2);
    softboxTop.lookAt(0, 0, 0);
    envScene.add(softboxTop);

    const envRenderTarget = pmremGenerator.fromScene(envScene);
    scene.environment = envRenderTarget.texture;
    pmremGenerator.dispose();

    // 5. Directional Lights
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    keyLight.position.set(5, 8, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Top crisp light dedicated to highlighting straw tip and dome lid
    const topKeyLight = new THREE.DirectionalLight(0xfff5e6, 2.6);
    topKeyLight.position.set(3, 9, 5);
    scene.add(topKeyLight);

    // Back rim light to outline straw and dome against dark background
    const topBackLight = new THREE.DirectionalLight(0xffdfa8, 3.4);
    topBackLight.position.set(-3, 8, -5);
    scene.add(topBackLight);

    // Golden rim light behind tea
    const goldRimLight = new THREE.DirectionalLight(0xd4903a, 3.6);
    goldRimLight.position.set(-6, 3, -5);
    scene.add(goldRimLight);

    const fillPoint = new THREE.PointLight(0xffedd5, 1.2, 14);
    fillPoint.position.set(0, -2, 6);
    scene.add(fillPoint);

    // 6. Master Cup Group - Lowered so dome lid and straw have generous headspace
    const cupGroup = new THREE.Group();
    cupGroup.position.y = -0.85;
    scene.add(cupGroup);

    const cupHeight = 4.4;
    const radiusTop = 1.52;
    const radiusBottom = 1.08;

    // ── 7. Generate High-Res Caramel Tiger Syrup Texture ──
    const canvasTea = document.createElement("canvas");
    canvasTea.width = 1024;
    canvasTea.height = 1024;
    const ctx = canvasTea.getContext("2d");
    if (ctx) {
      // Base: Assam Milk Tea with warm gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1024);
      bgGrad.addColorStop(0, "#C78C56"); // top creamy milk swirl
      bgGrad.addColorStop(0.2, "#D9A876"); // light creamy layer
      bgGrad.addColorStop(0.5, "#B87642"); // rich tea body
      bgGrad.addColorStop(0.75, "#8C4A1C"); // darkening tea
      bgGrad.addColorStop(0.9, "#482008"); // caramelized transition
      bgGrad.addColorStop(1, "#200902"); // dark molasses base
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1024, 1024);

      // Organic Caramel Tiger Drips (sharp with soft inner glow)
      for (let x = 20; x < 1024; x += 64) {
        ctx.fillStyle = "rgba(48, 18, 4, 0.92)";
        ctx.beginPath();
        ctx.moveTo(x - 22, 1024);
        const dripTop = 220 + Math.sin(x * 0.045) * 140 + ((x * 17) % 80);
        ctx.bezierCurveTo(
          x - 12 + Math.sin(x * 0.06) * 25, 760,
          x + 22 + Math.cos(x * 0.04) * 30, 480,
          x + 4, dripTop
        );
        ctx.bezierCurveTo(
          x + 32, dripTop + 45,
          x + 22 + Math.sin(x * 0.06) * 18, 800,
          x + 42, 1024
        );
        ctx.closePath();
        ctx.fill();

        // Secondary soft amber caramel highlight beside the drip
        ctx.fillStyle = "rgba(225, 150, 55, 0.35)";
        ctx.beginPath();
        ctx.ellipse(x + 10, 580 + Math.sin(x) * 60, 25, 110, 0.15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Deep Dark Molasses Layer at Bottom
      const btmGrad = ctx.createLinearGradient(0, 780, 0, 1024);
      btmGrad.addColorStop(0, "rgba(35, 12, 2, 0)");
      btmGrad.addColorStop(0.4, "rgba(28, 9, 2, 0.88)");
      btmGrad.addColorStop(1, "rgba(16, 4, 1, 1)");
      ctx.fillStyle = btmGrad;
      ctx.fillRect(0, 780, 1024, 244);
    }

    const teaTexture = new THREE.CanvasTexture(canvasTea);
    teaTexture.wrapS = THREE.RepeatWrapping;
    teaTexture.wrapT = THREE.ClampToEdgeWrapping;

    // ── Generate Crisp Black Mitea Brand Logo ──
    const canvasSeal = document.createElement("canvas");
    canvasSeal.width = 1024;
    canvasSeal.height = 1024;
    const ctxSeal = canvasSeal.getContext("2d");
    if (ctxSeal) {
      ctxSeal.clearRect(0, 0, 1024, 1024);

      // Deep solid luxury black
      const blackColor = "#111111";

      // 1. Outer bold circular seal border
      ctxSeal.strokeStyle = blackColor;
      ctxSeal.lineWidth = 14;
      ctxSeal.beginPath();
      ctxSeal.arc(512, 512, 420, 0, Math.PI * 2);
      ctxSeal.stroke();

      // 2. Inner refined accent ring
      ctxSeal.lineWidth = 4;
      ctxSeal.beginPath();
      ctxSeal.arc(512, 512, 385, 0, Math.PI * 2);
      ctxSeal.stroke();

      // 3. Four subtle cardinal accent dots on the inner ring
      [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].forEach((ang) => {
        const dx = 512 + Math.cos(ang) * 385;
        const dy = 512 + Math.sin(ang) * 385;
        ctxSeal.fillStyle = blackColor;
        ctxSeal.beginPath();
        ctxSeal.arc(dx, dy, 11, 0, Math.PI * 2);
        ctxSeal.fill();
      });

      // 4. Elegant Minimalist Tea Leaf Sprout Motif on top
      ctxSeal.fillStyle = blackColor;
      ctxSeal.beginPath();
      ctxSeal.moveTo(512, 230);
      ctxSeal.bezierCurveTo(460, 270, 450, 340, 512, 390);
      ctxSeal.bezierCurveTo(574, 340, 564, 270, 512, 230);
      ctxSeal.fill();

      // Delicate leaf stem cut
      ctxSeal.save();
      ctxSeal.globalCompositeOperation = "destination-out";
      ctxSeal.lineWidth = 5;
      ctxSeal.beginPath();
      ctxSeal.moveTo(512, 260);
      ctxSeal.lineTo(512, 380);
      ctxSeal.stroke();
      ctxSeal.restore();

      // Droplet above leaf
      ctxSeal.fillStyle = blackColor;
      ctxSeal.beginPath();
      ctxSeal.arc(512, 200, 14, 0, Math.PI * 2);
      ctxSeal.fill();

      // 5. Bold "Mitea" Brand Name
      ctxSeal.fillStyle = blackColor;
      ctxSeal.font = "bold 110px 'Georgia', 'Times New Roman', serif";
      ctxSeal.textAlign = "center";
      ctxSeal.textBaseline = "middle";
      ctxSeal.fillText("Mitea", 512, 490);

      // 6. Subtitle & Details
      ctxSeal.font = "bold 26px sans-serif";
      ctxSeal.fillText("ARTISAN TEA HOUSE", 512, 575);

      ctxSeal.font = "bold 19px monospace, sans-serif";
      ctxSeal.fillText("EST. 2019", 512, 625);

      // Subtle decorative underline bar
      ctxSeal.lineWidth = 3;
      ctxSeal.strokeStyle = blackColor;
      ctxSeal.beginPath();
      ctxSeal.moveTo(420, 655);
      ctxSeal.lineTo(604, 655);
      ctxSeal.stroke();
    }
    const sealTexture = new THREE.CanvasTexture(canvasSeal);

    // ── 8. Inner Liquid Mesh ──
    const liquidHeight = cupHeight * 0.82;
    const liquidRadTop = radiusTop * 0.94;
    const liquidRadBottom = radiusBottom * 0.95;

    const liquidGeo = new THREE.CylinderGeometry(
      liquidRadTop,
      liquidRadBottom,
      liquidHeight,
      64
    );
    const liquidMat = new THREE.MeshStandardMaterial({
      map: teaTexture,
      roughness: 0.22,
      metalness: 0.08,
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.y = -cupHeight / 2 + liquidHeight / 2 + 0.08;
    cupGroup.add(liquidMesh);

    // Cream foam surface layer on top of tea
    const foamGeo = new THREE.CylinderGeometry(
      liquidRadTop + 0.01,
      liquidRadTop,
      0.15,
      64
    );
    const foamMat = new THREE.MeshStandardMaterial({
      color: 0xedd6be, // Velvety sweet cream foam
      roughness: 0.35,
      metalness: 0.05,
    });
    const foamMesh = new THREE.Mesh(foamGeo, foamMat);
    foamMesh.position.y = -cupHeight / 2 + liquidHeight + 0.07;
    cupGroup.add(foamMesh);

    // ── 9. Real 3D Glossy Boba Pearls (Clustered at bottom) ──
    const bobaMat = new THREE.MeshStandardMaterial({
      color: 0x110401,
      roughness: 0.1,
      metalness: 0.35,
    });
    const bobaSphereGeo = new THREE.SphereGeometry(0.19, 16, 16);
    const bobaCount = 48;

    for (let i = 0; i < bobaCount; i++) {
      const pearl = new THREE.Mesh(bobaSphereGeo, bobaMat);
      const layer = Math.floor(i / 16);
      const angle = (i % 16) * ((Math.PI * 2) / 16) + layer * 0.45;
      const radiusDist = 0.12 + Math.random() * (liquidRadBottom * 0.84);
      const py = -cupHeight / 2 + 0.18 + layer * 0.22 + Math.random() * 0.06;

      pearl.position.set(
        Math.cos(angle) * radiusDist,
        py,
        Math.sin(angle) * radiusDist
      );
      pearl.scale.setScalar(0.92 + Math.random() * 0.26);
      cupGroup.add(pearl);
    }

    // ── 10. Real 3D Translucent Ice Cubes Breaking Surface at Top ──
    const iceMat = new THREE.MeshPhysicalMaterial({
      color: 0xf5faff,
      transparent: true,
      opacity: 0.75,
      roughness: 0.04,
      metalness: 0.02,
      transmission: 0.9,
      ior: 1.31,
    });
    const iceGeo = new THREE.BoxGeometry(0.52, 0.52, 0.52);
    const icePositions = [
      { x: 0.35, y: 1.02, z: 0.22, rx: 0.35, ry: 0.4 },
      { x: -0.42, y: 1.1, z: -0.18, rx: -0.5, ry: 0.25 },
      { x: 0.12, y: 1.22, z: -0.38, rx: 0.2, ry: -0.6 },
      { x: -0.22, y: 0.88, z: 0.42, rx: 0.6, ry: 0.3 },
      { x: 0.38, y: 1.15, z: -0.15, rx: -0.2, ry: 0.5 },
    ];
    icePositions.forEach((pos) => {
      const cube = new THREE.Mesh(iceGeo, iceMat);
      cube.position.set(pos.x, pos.y, pos.z);
      cube.rotation.set(pos.rx, pos.ry, 0.2);
      cupGroup.add(cube);
    });

    // ── 11. Outer Crystal Glass Cup Wall ──
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.28,
      roughness: 0.03,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      transmission: 0.92,
      ior: 1.5,
      depthWrite: false,
    });

    const cupWallGeo = new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      cupHeight,
      64,
      1,
      true
    );
    const cupWallMesh = new THREE.Mesh(cupWallGeo, glassMat);
    cupWallMesh.castShadow = true;
    cupWallMesh.renderOrder = 8;
    cupGroup.add(cupWallMesh);

    // Cup Top Lip Rolled Rim
    const lipGeo = new THREE.TorusGeometry(radiusTop, 0.065, 16, 64);
    lipGeo.rotateX(Math.PI / 2);
    const lipMesh = new THREE.Mesh(lipGeo, glassMat);
    lipMesh.position.y = cupHeight / 2;
    lipMesh.renderOrder = 8;
    cupGroup.add(lipMesh);

    // Cup Solid Base Disc
    const baseGeo = new THREE.CylinderGeometry(radiusBottom, radiusBottom, 0.12, 64);
    const baseMesh = new THREE.Mesh(baseGeo, glassMat);
    baseMesh.position.y = -cupHeight / 2;
    baseMesh.renderOrder = 8;
    cupGroup.add(baseMesh);

    // ── 12. ELEVATED CRYSTAL DOME LID / "HAT" (Always visible, non-occluding) ──
    const lidGroup = new THREE.Group();
    lidGroup.renderOrder = 10;

    // Semi-translucent crystal acrylic material with high reflectivity & no depthWrite clipping
    const lidDomeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.48,
      roughness: 0.05,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      transmission: 0.62,
      ior: 1.48,
      side: THREE.FrontSide,
      depthWrite: false,
    });

    // Bright glossy highlight material for ridges, snap collar, and straw rim
    const lidRidgeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffeedd,
      transparent: true,
      opacity: 0.8,
      roughness: 0.08,
      metalness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      depthWrite: false,
    });

    // A) Snap collar flange ring that sits firmly on the cup rim
    const collarGeo = new THREE.TorusGeometry(radiusTop + 0.05, 0.075, 16, 64);
    collarGeo.rotateX(Math.PI / 2);
    const collarMesh = new THREE.Mesh(collarGeo, lidRidgeMat);
    collarMesh.position.y = cupHeight / 2 + 0.02;
    collarMesh.renderOrder = 10;
    lidGroup.add(collarMesh);

    // B) Vertical snap lip skirt ring
    const skirtGeo = new THREE.CylinderGeometry(
      radiusTop + 0.055,
      radiusTop + 0.045,
      0.16,
      64,
      1,
      true
    );
    const skirtMesh = new THREE.Mesh(skirtGeo, lidRidgeMat);
    skirtMesh.position.y = cupHeight / 2 + 0.08;
    skirtMesh.renderOrder = 10;
    lidGroup.add(skirtMesh);

    // C) Main curved dome with top aperture opening for the straw
    const domeRadius = 1.54;
    // thetaStart = 0.22 leaves a top circular hole of radius ~ 0.34
    // thetaLength = 0.5*PI - 0.22 brings it smoothly down to the rim
    const domeGeo = new THREE.SphereGeometry(
      domeRadius,
      64,
      32,
      0,
      Math.PI * 2,
      0.22,
      Math.PI * 0.5 - 0.22
    );
    const domeMesh = new THREE.Mesh(domeGeo, lidDomeMat);
    domeMesh.position.y = cupHeight / 2;
    domeMesh.renderOrder = 10;
    lidGroup.add(domeMesh);

    // D) Straw aperture port ring at the top opening
    const topHoleY = cupHeight / 2 + domeRadius * Math.cos(0.22);
    const portGeo = new THREE.TorusGeometry(0.34, 0.048, 16, 48);
    portGeo.rotateX(Math.PI / 2);
    const portMesh = new THREE.Mesh(portGeo, lidRidgeMat);
    portMesh.position.y = topHoleY;
    portMesh.renderOrder = 10;
    lidGroup.add(portMesh);

    // E) Intermediate embossed mold ridge around the upper dome
    const upperRidgeY = cupHeight / 2 + domeRadius * Math.cos(0.5);
    const upperRidgeR = domeRadius * Math.sin(0.5);
    const upperRidgeGeo = new THREE.TorusGeometry(upperRidgeR, 0.035, 14, 48);
    upperRidgeGeo.rotateX(Math.PI / 2);
    const upperRidgeMesh = new THREE.Mesh(upperRidgeGeo, lidRidgeMat);
    upperRidgeMesh.position.y = upperRidgeY;
    upperRidgeMesh.renderOrder = 10;
    lidGroup.add(upperRidgeMesh);

    // F) Lower stepped contour ring
    const lowerRidgeY = cupHeight / 2 + domeRadius * Math.cos(0.9);
    const lowerRidgeR = domeRadius * Math.sin(0.9);
    const lowerRidgeGeo = new THREE.TorusGeometry(lowerRidgeR, 0.035, 14, 48);
    lowerRidgeGeo.rotateX(Math.PI / 2);
    const lowerRidgeMesh = new THREE.Mesh(lowerRidgeGeo, lidRidgeMat);
    lowerRidgeMesh.position.y = lowerRidgeY;
    lowerRidgeMesh.renderOrder = 10;
    lidGroup.add(lowerRidgeMesh);

    cupGroup.add(lidGroup);

    // ── 13. ELEVATED ARTISAN BOBA STRAW / "SHLEMO" (Centered & Always Visible In All Rotations) ──
    const strawGroup = new THREE.Group();
    strawGroup.position.set(0, 1.05, 0);
    strawGroup.rotation.set(0, 0, 0);
    strawGroup.renderOrder = 2;

    // Luxurious solid golden honey amber straw material (Opaque so it is never clipped or occluded by transmission/dome)
    const strawMat = new THREE.MeshPhysicalMaterial({
      color: 0xf5a623, // Vibrant warm golden amber
      emissive: 0x4a2402, // Rich internal amber warmth
      roughness: 0.15,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      transparent: false,
    });

    const strawTipMat = new THREE.MeshPhysicalMaterial({
      color: 0xdf941c,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.9,
      transparent: false,
    });

    // Main straw cylinder extending deep down to boba and high above the dome
    const strawRadius = 0.185;
    const strawHeight = 6.4;
    const strawGeo = new THREE.CylinderGeometry(strawRadius, strawRadius, strawHeight, 32);
    const strawBodyMesh = new THREE.Mesh(strawGeo, strawMat);
    strawBodyMesh.renderOrder = 2;
    strawGroup.add(strawBodyMesh);

    // Iconic 45° diagonal angled bevel slice at the top (authentic boba puncture tip)
    const tipGeo = new THREE.CircleGeometry(strawRadius, 32);
    tipGeo.rotateX(-Math.PI / 3); // 60° sharp puncture slice
    const tipMesh = new THREE.Mesh(tipGeo, strawTipMat);
    tipMesh.position.y = strawHeight / 2;
    tipMesh.renderOrder = 2;
    strawGroup.add(tipMesh);

    // Dark inner hollow hole at the tip
    const lumenGeo = new THREE.CircleGeometry(strawRadius * 0.82, 32);
    lumenGeo.rotateX(-Math.PI / 3);
    const lumenMat = new THREE.MeshBasicMaterial({ color: 0x1f0b02 });
    const lumenMesh = new THREE.Mesh(lumenGeo, lumenMat);
    lumenMesh.position.set(0, strawHeight / 2 + 0.005, 0.002);
    lumenMesh.renderOrder = 3;
    strawGroup.add(lumenMesh);

    cupGroup.add(strawGroup);

    // ── 14. Luxury Black Brand Seal on Front (Fully Visible, Zero Clipping) ──
    const sealHeight = 1.35;
    const sealTheta = 1.05;
    const sealY = 0.22;
    const yTopSeal = sealY + sealHeight / 2;
    const yBtmSeal = sealY - sealHeight / 2;
    const tSealTop = (yTopSeal - (-cupHeight / 2)) / cupHeight;
    const tSealBtm = (yBtmSeal - (-cupHeight / 2)) / cupHeight;
    // Positioned smoothly on the cup front, completely outside the liquid mesh
    const rTopSeal = (radiusBottom + (radiusTop - radiusBottom) * tSealTop) * 0.992;
    const rBtmSeal = (radiusBottom + (radiusTop - radiusBottom) * tSealBtm) * 0.992;

    const sealGeo = new THREE.CylinderGeometry(
      rTopSeal,
      rBtmSeal,
      sealHeight,
      32,
      1,
      true,
      Math.PI / 2 - sealTheta / 2,
      sealTheta
    );
    const sealMat = new THREE.MeshBasicMaterial({
      map: sealTexture,
      transparent: true,
      opacity: 0.98,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
      side: THREE.FrontSide,
    });
    const sealMesh = new THREE.Mesh(sealGeo, sealMat);
    sealMesh.position.set(0, sealY, 0);
    sealMesh.renderOrder = 7;
    cupGroup.add(sealMesh);

    // ── 15. Realistic Soft Contact Shadow on Studio Table ──
    const shadowGeo = new THREE.PlaneGeometry(4.4, 4.4);
    const canvasShadow = document.createElement("canvas");
    canvasShadow.width = 512;
    canvasShadow.height = 512;
    const ctxShadow = canvasShadow.getContext("2d");
    if (ctxShadow) {
      const grad = ctxShadow.createRadialGradient(256, 256, 20, 256, 256, 240);
      grad.addColorStop(0, "rgba(0,0,0,0.88)");
      grad.addColorStop(0.35, "rgba(0,0,0,0.48)");
      grad.addColorStop(0.7, "rgba(0,0,0,0.12)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctxShadow.fillStyle = grad;
      ctxShadow.fillRect(0, 0, 512, 512);
    }
    const shadowTexture = new THREE.CanvasTexture(canvasShadow);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -cupHeight / 2 - 0.05;
    cupGroup.add(shadowMesh);

    // ── 16. Smooth 360° Mouse / Touch Drag Tracking with Inertia ──
    let prevX = 0;
    let prevY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
      const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
      prevX = cx;
      prevY = cy;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
      const cy = "touches" in e ? e.touches[0].clientY : e.clientY;

      const dx = cx - prevX;
      const dy = cy - prevY;

      targetRotYRef.current += dx * 0.012;
      targetRotXRef.current = Math.max(-0.25, Math.min(0.35, targetRotXRef.current + dy * 0.008));

      prevX = cx;
      prevY = cy;
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    domEl.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // ── 17. Animation Loop ──
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      // Gentle auto-rotation when idle
      if (isRotatingRef.current && !isDraggingRef.current) {
        targetRotYRef.current += 0.005;
      }

      // Smooth hover bobbing
      cupGroup.position.y = -0.85 + Math.sin(elapsed * 1.5) * 0.05;

      // Inertia rotation smoothing
      cupGroup.rotation.y += (targetRotYRef.current - cupGroup.rotation.y) * 0.08;
      cupGroup.rotation.x += (targetRotXRef.current - cupGroup.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    // ── 18. Resize Handler ──
    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", handleResize);

    // ── 19. Cleanup ──
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      domEl.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      domEl.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);

      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
      renderer.dispose();
      envRenderTarget.dispose();
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[620px] select-none">
      {/* ═══ 3D WEBGL CANVAS STAGE ═══ */}
      <div
        ref={containerRef}
        className="w-full h-[520px] sm:h-[620px] lg:h-[680px] relative cursor-grab active:cursor-grabbing flex items-center justify-center overflow-visible"
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-accent-amber border-t-transparent animate-spin" />
            <span className="text-[11px] text-warm-300 font-mono tracking-widest uppercase">
              Loading 3D Model...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
