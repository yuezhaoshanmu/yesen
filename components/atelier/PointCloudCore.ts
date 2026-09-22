import * as T from 'three';

/** 112 points, bounded DPR; no models, textures or postprocessing. */
export function mountPointCloud(host: HTMLElement, openingElapsed: number) {
  const mount = host.querySelector<HTMLElement>('.point-cloud-mount')!;
  let renderer: T.WebGLRenderer;
  try { renderer = new T.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' }); }
  catch { return () => {}; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0); mount.append(renderer.domElement);
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(36, 1, .1, 30);
  camera.position.z = 8.4;
  const group = new T.Group(); scene.add(group);
  const count = 112, target = new Float32Array(count * 3), origin = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = 1 - (i + .5) * 2 / count, a = i * 2.399963, r = Math.sqrt(1 - y * y) * 2.28;
    target.set([Math.cos(a) * r, y * 2.28, Math.sin(a) * r], i * 3);
    origin.set([Math.sin(i * 13.1) * 5.5, Math.cos(i * 7.3) * 4.5, Math.sin(i * 3.1) * 3], i * 3);
  }
  const geometry = new T.BufferGeometry(); geometry.setAttribute('position', new T.BufferAttribute(origin.slice(), 3));
  const material = new T.PointsMaterial({ color: 0x086a60, size: .035, transparent: true, opacity: .64, depthWrite: false });
  material.onBeforeCompile = shader => { shader.fragmentShader = shader.fragmentShader.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nfloat edge = length(gl_PointCoord-vec2(.5)); if(edge>.5) discard;'); };
  group.add(new T.Points(geometry, material));
  const connections: number[] = [];
  for (let i = 0; i < count; i++) for (let j = i + 1; j < count; j++) {
    const d = Math.hypot(target[i*3]-target[j*3], target[i*3+1]-target[j*3+1], target[i*3+2]-target[j*3+2]);
    if (d < .74) connections.push(i, j);
  }
  const edges = new T.BufferGeometry(); edges.setAttribute('position', new T.BufferAttribute(new Float32Array(connections.length * 3), 3));
  const edgeMaterial = new T.LineBasicMaterial({ color: 0x175d59, transparent: true, opacity: .15 });
  group.add(new T.LineSegments(edges, edgeMaterial));
  const start = performance.now() - openingElapsed;
  let frame = 0, last = 0, visible = true, dead = false, rotation = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const render = (now: number) => {
    frame = 0;
    if (dead || !visible || document.hidden) return;
    const elapsed = now - start, progress = reduce.matches ? 1 : Math.max(0, Math.min(1, (elapsed - 200) / 300));
    // The quiet core runs at 30fps after initialization, while CSS/UI stay native refresh rate.
    if (elapsed < 1400 || now - last >= 32 || reduce.matches) {
      const dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now;
      const ease = 1 - Math.pow(1 - progress, 3), attr = geometry.attributes.position;
      for (let i = 0; i < target.length; i++) attr.array[i] = origin[i] + (target[i] - origin[i]) * ease;
      attr.needsUpdate = true;
      const edgeAttr = edges.attributes.position;
      connections.forEach((n, i) => edgeAttr.setXYZ(i, attr.getX(n), attr.getY(n), attr.getZ(n))); edgeAttr.needsUpdate = true;
      const pulse = elapsed > 1150 && elapsed < 1600 ? Math.sin((elapsed - 1150) / 450 * Math.PI) : 0;
      edgeMaterial.opacity = progress * (.18 + pulse * .12); material.opacity = progress * (.72 + pulse * .25);
      if (!reduce.matches) rotation += dt * Math.PI * 2 / 34;
      group.rotation.y = rotation; group.rotation.z = -.13;
      renderer.render(scene, camera);
      host.dataset.core = 'webgl'; host.dataset.corePoints = String(count); host.dataset.coreDpr = String(renderer.getPixelRatio());
      host.dataset.coreFrames = String(Number(host.dataset.coreFrames || 0) + 1);
    }
    if (!reduce.matches) frame = requestAnimationFrame(render);
  };
  const schedule = () => { cancelAnimationFrame(frame); last = 0; if (visible && !document.hidden && !dead) frame = requestAnimationFrame(render); };
  const resize = () => { const { width, height } = mount.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); schedule(); };
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(mount);
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; host.dataset.corePaused = String(!visible); schedule(); }); observer.observe(host);
  const contextLost = (e: Event) => { e.preventDefault(); dead = true; cancelAnimationFrame(frame); host.dataset.core = 'svg'; };
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  document.addEventListener('visibilitychange', schedule); reduce.addEventListener('change', schedule); resize();
  return () => { dead = true; cancelAnimationFrame(frame); observer.disconnect(); resizeObserver.disconnect(); document.removeEventListener('visibilitychange', schedule); reduce.removeEventListener('change', schedule); renderer.domElement.removeEventListener('webglcontextlost', contextLost); geometry.dispose(); material.dispose(); edges.dispose(); edgeMaterial.dispose(); renderer.dispose(); renderer.domElement.remove(); delete host.dataset.core; };
}
