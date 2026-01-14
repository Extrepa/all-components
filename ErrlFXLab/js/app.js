// Core app initialization, DOM refs, and global state
"use strict";

(function(window) {
  const App = {
    // Constants
    VERSION: "Complete Edition v1.0",
    STORAGE_KEYS: {
      FX_PRESETS: "errlFxPresets",
      HTML_FX_PRESET: "errlHtmlFxPreset",
      ACTIVE_TAB: "errlActiveTab",
      THREE_MODE: "errlThreeMode"
    },
    PROJECTS_STORAGE_KEY: "errlProjects",

    // Global state
    state: {
      currentMode: "lab",
      currentSvg: null,
      currentSvgUrl: null,
      p5Instance: null,
      p5Config: { wobbleAmplitude: 10, wobbleSpeed: 2.0, rotationIntensity: 0.07, bgHue: 210, glowStrength: 0 },
      p5Presets: {
        wobbleChill: { wobbleAmplitude: 10, wobbleSpeed: 2.0, rotationIntensity: 0.07, bgHue: 210, glowStrength: 0 },
        hyperBounce: { wobbleAmplitude: 25, wobbleSpeed: 4.5, rotationIntensity: 0.15, bgHue: 320, glowStrength: 0.3 },
        lowOrbit: { wobbleAmplitude: 8, wobbleSpeed: 1.2, rotationIntensity: 0.05, bgHue: 180, glowStrength: 0.1 }
      },
      htmlFxConfig: { blur: 0, contrast: 100, hue: 0, saturate: 100, brightness: 100 },
      htmlFxPresets: {
        clean: { blur: 0, contrast: 100, hue: 0, saturate: 100, brightness: 100 },
        oilSlick: { blur: 2, contrast: 130, hue: 45, saturate: 150, brightness: 90 },
        neonBloom: { blur: 4, contrast: 180, hue: 200, saturate: 200, brightness: 120 },
        ghostFade: { blur: 8, contrast: 80, hue: 0, saturate: 50, brightness: 70 }
      },
      fxPresets: [],
      capturedFrames: [],
      vsLeftFrame: null,
      vsRightFrame: null,
      isBatchRunning: false,
      voxelImg: null,
      threeRenderer: null,
      threeScene: null,
      threeCamera: null,
      threeMesh: null,
      threeFrameId: null,
      threeMode: "wire",
      audioCtxReactive: null,
      audioSourceNode: null,
      audioAnalyser: null,
      audioDataArray: null,
      audioReactiveValue: 0,
      audioAnimationId: null,
      audioReactiveEnabled: false,
      timelineFrames: [],
      timelineIsPlaying: false,
      timelineAnimId: null,
      timelineLastTime: null,
      timelineAccum: 0,
      lastSpritesheetManifest: null,
      lastTimelineSnapshot: null,
      lastAnimationPack: null,
      commandPaletteVisible: false,
      commandPaletteFiltered: [],
      commandPaletteActiveIndex: 0,
      currentProjectId: null,
      p5FrameCounter: 0,
      p5LastFpsSampleTime: performance.now(),
      p5ApproxFps: 0,
      threeFrameCounter: 0,
      threeLastFpsSampleTime: performance.now(),
      threeApproxFps: 0,
      timelineFrameCounter: 0,
      timelineLastFpsSampleTime: performance.now(),
      timelineApproxFps: 0
    },

    // DOM references (will be populated on init)
    dom: {},

    init() {
      // Populate DOM refs
      this.dom.statusText = document.getElementById("status-text");
      this.dom.modeLabel = document.getElementById("modeLabel");
      this.dom.hintLabel = document.getElementById("hintLabel");
      this.dom.svgFileInput = document.getElementById("svgFileInput");
      this.dom.dropzone = document.getElementById("dropzone");
      this.dom.pathCountEl = document.getElementById("pathCount");
      this.dom.groupCountEl = document.getElementById("groupCount");
      this.dom.viewBoxInfoEl = document.getElementById("viewBoxInfo");
      this.dom.inspectorEl = document.getElementById("inspector");
      this.dom.svgPreview = document.getElementById("svgPreview");
      this.dom.svgPreviewPlaceholder = document.getElementById("svgPreviewPlaceholder");
      this.dom.currentFileName = document.getElementById("currentFileName");
      this.dom.clearBtn = document.getElementById("clearBtn");
      this.dom.tabButtons = document.querySelectorAll(".preview-tab");
      this.dom.previewPanels = document.querySelectorAll(".preview-panel");
      this.dom.p5StatusEl = document.getElementById("p5Status");
      this.dom.p5CanvasHost = document.getElementById("p5CanvasHost");
      this.dom.captureFrameBtn = document.getElementById("captureFrameBtn");
      this.dom.thumbGallery = document.getElementById("thumbGallery");
      this.dom.thumbCountEl = document.getElementById("thumbCount");
      this.dom.presetSelect = document.getElementById("presetSelect");
      this.dom.htmlFxImage = document.getElementById("htmlFxImage");
      this.dom.htmlFxStatus = document.getElementById("htmlFxStatus");
      this.dom.htmlFxPresetSelect = document.getElementById("htmlFxPresetSelect");
      this.dom.copyCssFilterBtn = document.getElementById("copyCssFilterBtn");
      this.dom.presetNameInput = document.getElementById("presetNameInput");
      this.dom.savePresetBtn = document.getElementById("savePresetBtn");
      this.dom.exportPresetsBtn = document.getElementById("exportPresetsBtn");
      this.dom.importPresetsInput = document.getElementById("importPresetsInput");
      this.dom.presetList = document.getElementById("presetList");
      this.dom.batchCaptureBtn = document.getElementById("batchCaptureBtn");
      this.dom.sliderAmp = document.getElementById("sliderAmp");
      this.dom.sliderFreq = document.getElementById("sliderFreq");
      this.dom.sliderRot = document.getElementById("sliderRot");
      this.dom.sliderHue = document.getElementById("sliderHue");
      this.dom.labelAmp = document.getElementById("labelAmp");
      this.dom.labelFreq = document.getElementById("labelFreq");
      this.dom.labelRot = document.getElementById("labelRot");
      this.dom.labelHue = document.getElementById("labelHue");
      this.dom.sliderHtmlBlur = document.getElementById("sliderHtmlBlur");
      this.dom.sliderHtmlContrast = document.getElementById("sliderHtmlContrast");
      this.dom.sliderHtmlHue = document.getElementById("sliderHtmlHue");
      this.dom.sliderHtmlSat = document.getElementById("sliderHtmlSat");
      this.dom.sliderHtmlBright = document.getElementById("sliderHtmlBright");
      this.dom.labelHtmlBlur = document.getElementById("labelHtmlBlur");
      this.dom.labelHtmlContrast = document.getElementById("labelHtmlContrast");
      this.dom.labelHtmlHue = document.getElementById("labelHtmlHue");
      this.dom.labelHtmlSat = document.getElementById("labelHtmlSat");
      this.dom.labelHtmlBright = document.getElementById("labelHtmlBright");
      this.dom.wire3dCanvasHost = document.getElementById("wire3dCanvasHost");
      this.dom.wire3dStatusEl = document.getElementById("wire3dStatus");
      this.dom.wire3dModeWireBtn = document.getElementById("wire3dModeWireBtn");
      this.dom.wire3dModeVoxel3dBtn = document.getElementById("wire3dModeVoxel3dBtn");
      this.dom.voxelCanvas = document.getElementById("voxelCanvas");
      this.dom.voxelStatusEl = document.getElementById("voxelStatus");
      this.dom.capturedFramesSection = document.getElementById("capturedFramesSection");
      this.dom.vsSection = document.getElementById("vsSection");
      this.dom.navGalleryBtn = document.getElementById("navGalleryBtn");
      this.dom.navFavoritesBtn = document.getElementById("navFavoritesBtn");
      this.dom.navVsBtn = document.getElementById("navVsBtn");
      this.dom.vsStatusEl = document.getElementById("vsStatus");
      this.dom.vsLeftSlot = document.getElementById("vsLeftSlot");
      this.dom.vsRightSlot = document.getElementById("vsRightSlot");
      this.dom.vsLeftImg = document.getElementById("vsLeftImg");
      this.dom.vsRightImg = document.getElementById("vsRightImg");
      this.dom.vsUseFavoritesBtn = document.getElementById("vsUseFavoritesBtn");
      this.dom.vsClearBtn = document.getElementById("vsClearBtn");
      this.dom.vsDownloadBtn = document.getElementById("vsDownloadBtn");
      this.dom.sandboxHtmlOutput = document.getElementById("sandboxHtmlOutput");
      this.dom.copySandboxBtn = document.getElementById("copySandboxBtn");
      this.dom.downloadSandboxBtn = document.getElementById("downloadSandboxBtn");
      this.dom.sessionJsonOutput = document.getElementById("sessionJsonOutput");
      this.dom.copySessionJsonBtn = document.getElementById("copySessionJsonBtn");
      this.dom.downloadSessionJsonBtn = document.getElementById("downloadSessionJsonBtn");
      this.dom.loadSessionJsonBtn = document.getElementById("loadSessionJsonBtn");
      this.dom.loadSessionJsonInput = document.getElementById("loadSessionJsonInput");
      this.dom.applySessionJsonFromTextareaBtn = document.getElementById("applySessionJsonFromTextareaBtn");
      this.dom.audioStatusEl = document.getElementById("audioStatus");
      this.dom.audioLoadBtn = document.getElementById("audioLoadBtn");
      this.dom.audioFileInput = document.getElementById("audioFileInput");
      this.dom.audioToggleBtn = document.getElementById("audioToggleBtn");
      this.dom.audioSpectrumCanvas = document.getElementById("audioSpectrumCanvas");
      this.dom.helpOverlayBtn = document.getElementById("helpOverlayBtn");
      this.dom.helpOverlay = document.getElementById("helpOverlay");
      this.dom.helpOverlayCloseBtn = document.getElementById("helpOverlayCloseBtn");
      this.dom.quickStartBtn = document.getElementById("quickStartBtn");
      this.dom.quickStartOverlay = document.getElementById("quickStartOverlay");
      this.dom.quickStartCloseBtn = document.getElementById("quickStartCloseBtn");
      this.dom.fxDiceStatusEl = document.getElementById("fxDiceStatus");
      this.dom.lockBgHueEl = document.getElementById("lockBgHue");
      this.dom.lockZoomEl = document.getElementById("lockZoom");
      this.dom.lockGlowEl = document.getElementById("lockGlow");
      this.dom.fxDiceSoftBtn = document.getElementById("fxDiceSoftBtn");
      this.dom.fxDiceWildBtn = document.getElementById("fxDiceWildBtn");
      this.dom.spritesheetStatus = document.getElementById("spritesheetStatus");
      this.dom.spritesheetSourceAll = document.getElementById("spritesheetSourceAll");
      this.dom.spritesheetSourceFavorites = document.getElementById("spritesheetSourceFavorites");
      this.dom.spritesheetTagFilter = document.getElementById("spritesheetTagFilter");
      this.dom.spritesheetMaxCols = document.getElementById("spritesheetMaxCols");
      this.dom.exportSpritesheetBtn = document.getElementById("exportSpritesheetBtn");
      this.dom.copySpritesheetManifestBtn = document.getElementById("copySpritesheetManifestBtn");
      this.dom.spritesheetManifestOutput = document.getElementById("spritesheetManifestOutput");
      this.dom.timelineStatusEl = document.getElementById("timelineStatus");
      this.dom.timelineUseFavoritesEl = document.getElementById("timelineUseFavorites");
      this.dom.timelineTagFilterEl = document.getElementById("timelineTagFilter");
      this.dom.timelineFpsInput = document.getElementById("timelineFps");
      this.dom.timelineBuildBtn = document.getElementById("timelineBuildBtn");
      this.dom.timelinePlayPauseBtn = document.getElementById("timelinePlayPauseBtn");
      this.dom.timelineExportJsonBtn = document.getElementById("timelineExportJsonBtn");
      this.dom.timelinePreviewCanvas = document.getElementById("timelinePreviewCanvas");
      this.dom.timelineJsonOutput = document.getElementById("timelineJsonOutput");
      this.dom.animPackStatusEl = document.getElementById("animPackStatus");
      this.dom.animPackSheetNameInput = document.getElementById("animPackSheetName");
      this.dom.animPackTagsInput = document.getElementById("animPackTagsInput");
      this.dom.animPackBuildBtn = document.getElementById("animPackBuildBtn");
      this.dom.animPackCopyBtn = document.getElementById("animPackCopyBtn");
      this.dom.animPackOutput = document.getElementById("animPackOutput");
      this.dom.projectsStatusEl = document.getElementById("projectsStatus");
      this.dom.projectNameInput = document.getElementById("projectNameInput");
      this.dom.projectSaveBtn = document.getElementById("projectSaveBtn");
      this.dom.projectsRefreshBtn = document.getElementById("projectsRefreshBtn");
      this.dom.projectsListEl = document.getElementById("projectsList");
      this.dom.aiHandoffStatusEl = document.getElementById("aiHandoffStatus");
      this.dom.aiHandoffTargetEl = document.getElementById("aiHandoffTarget");
      this.dom.aiHandoffGoalEl = document.getElementById("aiHandoffGoal");
      this.dom.aiHandoffBuildBtn = document.getElementById("aiHandoffBuildBtn");
      this.dom.aiHandoffCopyBtn = document.getElementById("aiHandoffCopyBtn");
      this.dom.aiHandoffOutput = document.getElementById("aiHandoffOutput");
      this.dom.commandPalette = document.getElementById("commandPalette");
      this.dom.commandPaletteInput = document.getElementById("commandPaletteInput");
      this.dom.commandPaletteList = document.getElementById("commandPaletteList");
      this.dom.diagStatusEl = document.getElementById("diagStatus");
      this.dom.diagFpsP5El = document.getElementById("diagFpsP5");
      this.dom.diagFps3DEl = document.getElementById("diagFps3D");
      this.dom.diagFpsTimelineEl = document.getElementById("diagFpsTimeline");
      this.dom.diagFrameCountsEl = document.getElementById("diagFrameCounts");
      this.dom.diagTagSummaryEl = document.getElementById("diagTagSummary");
      this.dom.diagMemoryEl = document.getElementById("diagMemory");
      this.dom.diagRefreshBtn = document.getElementById("diagRefreshBtn");

      // Initialize canvas sizes
      if (this.dom.voxelCanvas) {
        const host = this.dom.voxelCanvas.parentElement;
        if (host) {
          this.dom.voxelCanvas.width = host.clientWidth || 400;
          this.dom.voxelCanvas.height = host.clientHeight || 400;
        }
      }
      if (this.dom.timelinePreviewCanvas) {
        this.dom.timelinePreviewCanvas.width = 96;
        this.dom.timelinePreviewCanvas.height = 96;
      }
      if (this.dom.audioSpectrumCanvas) {
        this.dom.audioSpectrumCanvas.width = this.dom.audioSpectrumCanvas.clientWidth || 400;
        this.dom.audioSpectrumCanvas.height = this.dom.audioSpectrumCanvas.clientHeight || 40;
      }

      // Load state from localStorage
      if (window.ErrlFX && window.ErrlFX.Storage) {
        window.ErrlFX.Storage.loadStateFromStorage();
      }
    },

    getActivePreviewTabName() {
      const active = Array.from(this.dom.tabButtons).find((b) => b.classList.contains("bg-slate-800/80"));
      return active ? active.dataset.tab : "svg";
    },

    activatePreviewTab(tabName) {
      const btn = Array.from(this.dom.tabButtons).find((b) => b.dataset.tab === tabName);
      if (btn) {
        btn.click();
      }
    }
  };

  window.ErrlFX = window.ErrlFX || {};
  window.ErrlFX.App = App;

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => App.init());
  } else {
    App.init();
  }
})(window);

