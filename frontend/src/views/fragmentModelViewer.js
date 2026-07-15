import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const LOAD_TIMEOUT_MS = 6500;

export function resolveFragmentAsset(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  const source = value.trim();
  if (/^(?:https?:|data:|blob:)/i.test(source)) return source;
  const base = window.__BASE_PATH__ || import.meta.env?.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}/${source.replace(/^\//, "")}`;
}

const FragmentElementBase = typeof HTMLElement === "undefined" ? class {} : HTMLElement;

class ArchiveFragmentModelElement extends FragmentElementBase {
  constructor() {
    super();
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.model = null;
    this.frameId = null;
    this.loadTimer = null;
    this.visible = true;
    this.dragging = false;
    this.lastPointerX = 0;
    this.rotationOffset = 0;
    this.controller = new AbortController();
  }

  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.setupFallback();
    this.setupVisibility();
    this.load();
  }

  disconnectedCallback() {
    this.controller.abort();
    if (this.frameId) window.cancelAnimationFrame(this.frameId);
    if (this.loadTimer) window.clearTimeout(this.loadTimer);
    this.renderer?.dispose();
    this.scene?.traverse((node) => {
      node.geometry?.dispose?.();
      if (Array.isArray(node.material)) node.material.forEach(disposeMaterial);
      else disposeMaterial(node.material);
    });
  }

  setupFallback() {
    const fallback = resolveFragmentAsset(this.getAttribute("fallback"));
    let image = this.querySelector("img");
    if (!image && fallback) {
      image = document.createElement("img");
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      this.appendChild(image);
    }
    if (image && fallback) image.src = fallback;
  }

  setupVisibility() {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      this.visible = entry?.isIntersecting !== false;
    }, { rootMargin: "80px" });
    observer.observe(this);
    this.controller.signal.addEventListener("abort", () => observer.disconnect(), { once: true });
  }

  load() {
    const source = resolveFragmentAsset(this.getAttribute("model"));
    if (!source || !supportsWebGL()) {
      this.useFallback();
      return;
    }

    try {
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.08;
      this.renderer.domElement.setAttribute("aria-hidden", "true");
      this.appendChild(this.renderer.domElement);

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
      this.scene.add(new THREE.HemisphereLight(0xfff1d1, 0x23170f, 2.5));
      const key = new THREE.DirectionalLight(0xffdfa1, 3.8);
      key.position.set(3, 5, 4);
      this.scene.add(key);
      const rim = new THREE.DirectionalLight(0xa8bddb, 1.8);
      rim.position.set(-4, 2, -3);
      this.scene.add(rim);

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      this.loadTimer = window.setTimeout(() => this.useFallback(), LOAD_TIMEOUT_MS);
      loader.load(source, (gltf) => this.onLoaded(gltf.scene), undefined, () => this.useFallback());
    } catch {
      this.useFallback();
    }
  }

  onLoaded(model) {
    if (!this.isConnected || this.classList.contains("is-fallback")) return;
    if (this.loadTimer) window.clearTimeout(this.loadTimer);
    this.model = model;
    this.scene.add(model);
    frameModel(model, this.camera);
    this.resize();
    this.bindPointerRotation();
    this.classList.add("is-loaded");
    this.render();

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(() => this.resize());
      resizeObserver.observe(this);
      this.controller.signal.addEventListener("abort", () => resizeObserver.disconnect(), { once: true });
    }
  }

  bindPointerRotation() {
    const canvas = this.renderer.domElement;
    canvas.addEventListener("pointerdown", (event) => {
      this.dragging = true;
      this.lastPointerX = event.clientX;
      canvas.setPointerCapture?.(event.pointerId);
    }, { signal: this.controller.signal });
    canvas.addEventListener("pointermove", (event) => {
      if (!this.dragging) return;
      this.rotationOffset += (event.clientX - this.lastPointerX) * 0.012;
      this.lastPointerX = event.clientX;
    }, { signal: this.controller.signal });
    const stop = () => { this.dragging = false; };
    canvas.addEventListener("pointerup", stop, { signal: this.controller.signal });
    canvas.addEventListener("pointercancel", stop, { signal: this.controller.signal });
  }

  resize() {
    if (!this.renderer || !this.camera) return;
    const width = Math.max(this.clientWidth, 1);
    const height = Math.max(this.clientHeight, 1);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  render() {
    if (!this.isConnected || !this.renderer || !this.model) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (this.visible) {
      if (!this.dragging && !reduceMotion) this.rotationOffset += 0.004;
      this.model.rotation.y = this.rotationOffset;
      this.renderer.render(this.scene, this.camera);
    }
    this.frameId = window.requestAnimationFrame(() => this.render());
  }

  useFallback() {
    if (this.loadTimer) window.clearTimeout(this.loadTimer);
    this.classList.remove("is-loaded");
    this.classList.add("is-fallback");
    this.renderer?.domElement.remove();
    this.renderer?.dispose();
    this.renderer = null;
  }
}

function frameModel(model, camera) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const dimensions = box.getSize(new THREE.Vector3());
  const radius = Math.max(dimensions.x, dimensions.y, dimensions.z) * 0.5;
  model.position.sub(center);
  const distance = Math.max(radius / Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)), 1) * 1.3;
  camera.position.set(distance * 0.78, distance * 0.45, distance);
  camera.near = Math.max(distance / 100, 0.01);
  camera.far = distance * 20;
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGL2RenderingContext && canvas.getContext("webgl2"))
      || Boolean(canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function disposeMaterial(material) {
  if (!material) return;
  for (const value of Object.values(material)) value?.isTexture && value.dispose();
  material.dispose?.();
}

if (typeof customElements !== "undefined" && !customElements.get("archive-fragment-model")) {
  customElements.define("archive-fragment-model", ArchiveFragmentModelElement);
}
