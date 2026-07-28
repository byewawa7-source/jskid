/**
 * jMod File Format Handler
 * Packs/unpacks .jmod files (ZIP archives containing manifest.json + main.jsk)
 * Uses JSZip bundled into the userscript.
 */
(function(global) {
  "use strict";

  class JModFormat {
    constructor() {
      this.zip = global.JSZip;
    }

    async packMod(manifest, source) {
      if (!this.zip) throw new Error("JSZip not available");

      const zip = new this.zip();
      zip.file("manifest.json", JSON.stringify(manifest, null, 2));
      zip.file("main.jsk", source);

      const blob = await zip.generateAsync({ type: "blob" });
      return blob;
    }

    async unpackMod(arrayBuffer) {
      if (!this.zip) throw new Error("JSZip not available");

      const zip = await this.zip.loadAsync(arrayBuffer);
      const manifestFile = zip.file("manifest.json");
      const sourceFile = zip.file("main.jsk");

      if (!manifestFile || !sourceFile) {
        throw new Error("Invalid .jmod: missing manifest.json or main.jsk");
      }

      const manifest = JSON.parse(await manifestFile.async("string"));
      const source = await sourceFile.async("string");

      return { manifest, source };
    }

    downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    readFileAsArrayBuffer(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    }
  }

  global.JModFormat = JModFormat;
  if (!global.jskidJModFormat) {
    global.jskidJModFormat = new JModFormat();
  }
})(typeof window !== "undefined" ? window : globalThis);
