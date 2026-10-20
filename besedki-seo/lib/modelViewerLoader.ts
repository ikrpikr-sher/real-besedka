/** Единая загрузка @google/model-viewer + meshopt-декодер для сжатых GLB. */
let loadPromise: Promise<void> | null = null;

const MESHOPT_DECODER = '/meshopt_decoder.js';

export function loadModelViewer(): Promise<void> {
  if (!loadPromise) {
    loadPromise = import('@google/model-viewer').then((mod) => {
      if (!mod.ModelViewerElement.meshoptDecoderLocation) {
        mod.ModelViewerElement.meshoptDecoderLocation = MESHOPT_DECODER;
      }
    });
  }
  return loadPromise;
}
