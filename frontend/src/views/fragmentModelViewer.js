import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

const LOAD_TIMEOUT_MS = 25000;

export function resolveFragmentAsset(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  const source = value.trim();
  if (/^(?:https?:|data:|blob:)/i.test(source)) return source;
  const base = window.__BASE_PATH__ || import.meta.env?.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  if (normalizedBase === "/" && source.startsWith("/")) return source;
  if (normalizedBase !== "/" && source.startsWith(normalizedBase)) return source;
  return `${normalizedBase}${source.replace(/^\//, "")}`;
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
    this.loadAttempt = 0;
    this.controller = new AbortController();
  }

  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.setupFallback();
    this.setupStatus();
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

  setupStatus() {
    let status = this.querySelector(".archive-fragment-model__status");
    if (!status) {
      status = document.createElement("span");
      status.className = "archive-fragment-model__status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      this.appendChild(status);
    }
    status.textContent = "正在加载三维碎片……";
    this.statusElement = status;

    let retry = this.querySelector(".archive-fragment-model__retry");
    if (!retry) {
      retry = document.createElement("button");
      retry.className = "archive-fragment-model__retry";
      retry.type = "button";
      retry.textContent = "重新加载3D";
      retry.hidden = true;
      this.appendChild(retry);
      retry.addEventListener("click", () => this.retry(), { signal: this.controller.signal });
    }
    this.retryButton = retry;
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
    const attempt = ++this.loadAttempt;
    const source = resolveFragmentAsset(this.getAttribute("model"));
    this.classList.remove("is-loaded", "is-fallback");
    this.classList.add("is-loading");
    this.retryButton.hidden = true;
    this.statusElement.textContent = "正在加载三维碎片……";
    if (!source) {
      this.useFallback("模型地址不可用", attempt);
      return;
    }
    if (!supportsWebGL()) {
      this.useFallback("当前设备不支持3D显示", attempt);
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
      this.loadTimer = window.setTimeout(() => this.useFallback("三维模型加载超时", attempt), LOAD_TIMEOUT_MS);
      loader.load(
        source,
        (gltf) => this.onLoaded(gltf.scene, attempt),
        (event) => this.onProgress(event, attempt),
        () => this.useFallback("三维模型加载失败", attempt)
      );
    } catch (error) {
      console.warn("[fragment-viewer] 初始化失败", error);
      this.useFallback("三维查看器初始化失败", attempt);
    }
  }

  onProgress(event, attempt) {
    if (attempt !== this.loadAttempt || !this.statusElement) return;
    if (event?.total > 0) {
      const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
      this.statusElement.textContent = `正在加载三维碎片 ${percent}%`;
    }
  }

  onLoaded(model, attempt) {
    if (attempt !== this.loadAttempt || !this.isConnected || this.classList.contains("is-fallback")) {
      disposeObject(model);
      return;
    }
    if (this.loadTimer) window.clearTimeout(this.loadTimer);
    this.model = model;
    this.scene.add(model);
    frameModel(model, this.camera);
    this.resize();
    this.bindPointerRotation();
    this.classList.remove("is-loading", "is-fallback");
    this.classList.add("is-loaded");
    this.statusElement.textContent = "三维碎片加载完成，可拖动旋转";
    this.retryButton.hidden = true;
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

  retry() {
    if (this.loadTimer) window.clearTimeout(this.loadTimer);
    this.renderer?.domElement.remove();
    this.renderer?.dispose();
    this.renderer = null;
    if (this.model) disposeObject(this.model);
    this.model = null;
    this.load();
  }

  useFallback(reason = "三维模型暂不可用", attempt = this.loadAttempt) {
    if (attempt !== this.loadAttempt) return;
    if (this.loadTimer) window.clearTimeout(this.loadTimer);
    this.classList.remove("is-loaded", "is-loading");
    this.classList.add("is-fallback");
    this.dataset.fallbackReason = reason;
    if (this.statusElement) this.statusElement.textContent = `${reason}，已切换平面展示`;
    if (this.retryButton) this.retryButton.hidden = false;
    this.renderer?.domElement.remove();
    this.renderer?.dispose();
    this.renderer = null;
  }
}

function disposeObject(object) {
  object?.traverse?.((node) => {
    node.geometry?.dispose?.();
    if (Array.isArray(node.material)) node.material.forEach(disposeMaterial);
    else disposeMaterial(node.material);
  });
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
