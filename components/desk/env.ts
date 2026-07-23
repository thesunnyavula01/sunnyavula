import * as THREE from "three";

// A 64×32 equirectangular canvas standing in for drei's <Environment> +
// <Lightformer>s.
//
// drei's Environment is expensive twice over: it drags three-stdlib's
// RGBELoader/EXRLoader/GroundProjectedEnv and @monogrid/gainmap-js into the
// home-page bundle (~25 kB gzip of loaders we never call, since we only used
// local Lightformers), and at startup it allocates a WebGLCubeRenderTarget and
// renders the lightformer scene into all six faces before the first frame.
//
// All the scene actually needs from it is a soft warm/cool gradient for the
// metals (silver laptop, brass gavel bands, the paperclip) to reflect. three
// PMREM-filters an equirect `scene.environment` on first use, so a 64×32
// canvas gives the same sheen for ~0 bytes of bundle and well under a
// millisecond of work.
//
// Colours mirror the Lightformers this replaced: a warm ceiling wash, a warm
// lamp side (−X, where <Lamp/> stands), a cool rim on the opposite side.
export function makeStudioEnv(): THREE.Texture {
  const W = 64;
  const H = 32;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  // ceiling → horizon → floor
  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, "#4a4336");
  base.addColorStop(0.45, "#242a3d");
  base.addColorStop(1, "#0d0f16");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // broad warm wash across the ceiling (was the top Lightformer)
  const ceil = ctx.createLinearGradient(0, 0, 0, H * 0.34);
  ceil.addColorStop(0, "rgba(255,243,221,0.55)");
  ceil.addColorStop(1, "rgba(255,243,221,0)");
  ctx.fillStyle = ceil;
  ctx.fillRect(0, 0, W, H * 0.34);

  // warm lamp side
  const warm = ctx.createRadialGradient(
    W * 0.75,
    H * 0.44,
    0,
    W * 0.75,
    H * 0.44,
    W * 0.3
  );
  warm.addColorStop(0, "rgba(255,207,148,0.8)");
  warm.addColorStop(1, "rgba(255,207,148,0)");
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, W, H);

  // cool rim opposite it
  const cool = ctx.createRadialGradient(
    W * 0.25,
    H * 0.5,
    0,
    W * 0.25,
    H * 0.5,
    W * 0.26
  );
  cool.addColorStop(0, "rgba(143,162,255,0.55)");
  cool.addColorStop(1, "rgba(143,162,255,0)");
  ctx.fillStyle = cool;
  ctx.fillRect(0, 0, W, H);

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
