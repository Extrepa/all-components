// Sandbox snippet generation
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;

  const Sandbox = {
    getCurrentSandboxHtml() {
      if (!App.state.currentSvgUrl) {
        return "<!-- Upload an SVG first -->";
      }
      const svgData = new XMLSerializer().serializeToString(App.state.currentSvg);
      const htmlFx = App.state.htmlFxConfig;
      const filterStr = `blur(${htmlFx.blur}px) contrast(${htmlFx.contrast}%) hue-rotate(${htmlFx.hue}deg) saturate(${htmlFx.saturate}%) brightness(${htmlFx.brightness}%)`;
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Errl FX Sandbox</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: #02070a;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: system-ui, sans-serif;
    }
    .errl-container {
      max-width: 420px;
      max-height: 420px;
    }
    .errl-svg {
      width: 100%;
      height: 100%;
      filter: ${filterStr};
    }
  </style>
</head>
<body>
  <div class="errl-container">
    ${svgData}
  </div>
</body>
</html>`;
    },

    updateSandboxSnippet() {
      if (App.dom.sandboxHtmlOutput) {
        App.dom.sandboxHtmlOutput.value = this.getCurrentSandboxHtml();
      }
    }
  };

  window.ErrlFX.Sandbox = Sandbox;
})(window);

