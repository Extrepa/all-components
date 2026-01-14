import React, { useState, useRef, useEffect } from "react";
import { Save, FolderOpen, FilePlus, Undo, Redo, HelpCircle, Download, FileText, ChevronDown, X, RotateCcw, Settings, MousePointer2, Minus, Square, Circle, Star, Hexagon, Shapes, Sparkles, Type, Image, Upload } from "lucide-react";
import { CanvasSettings } from "./CanvasSettings";
import { ThemeControls } from "@errl-design-system";

type ToolType = "select" | "line" | "rectangle" | "circle" | "star" | "hexagon" | "shape-group" | "magic" | "text" | "image" | "upload";

interface TopToolbarProps {
  onSave?: () => void;
  onLoad?: () => void;
  onNew?: () => void;
  onClear?: () => void;
  onReset?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onHelp?: () => void;
  onExportPNG?: () => void;
  onExportSVG?: () => void;
  onExportPreset?: (preset: { id: string; width: number; height: number; transparentBg?: boolean }) => void;
  snapToGrid?: boolean;
  gridSize?: number;
  showGridOverlay?: boolean;
  onToggleSnap?: () => void;
  onGridSizeChange?: (size: number) => void;
  onToggleGridOverlay?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  selectedTool?: ToolType;
  onToolChange?: (tool: ToolType) => void;
}

const EXPORT_PRESETS = [
  { id: "PNG", label: "PNG (Current Size)", width: 0, height: 0 },
  { id: "SVG", label: "SVG (Current Size)", width: 0, height: 0 },
  { id: "SCREEN", label: "Screen 1920x1080", width: 1920, height: 1080 },
  { id: "STICKER", label: "Sticker 4x6 @300dpi (1200x1800)", width: 1200, height: 1800, transparentBg: true },
  { id: "CARD", label: "Card 2.5x3.5 @300dpi (750x1050)", width: 750, height: 1050, transparentBg: true },
];

const DropdownMenu: React.FC<{
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}> = ({ label, icon: Icon, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={`top-toolbar-dropdown ${className || ""}`} ref={dropdownRef}>
      <button
        className="top-toolbar-button"
        onClick={() => setIsOpen(!isOpen)}
        title={label}
      >
        {Icon && <Icon className="top-toolbar-icon" />}
        <span>{label}</span>
        <ChevronDown className="top-toolbar-icon" style={{ width: "10px", height: "10px", marginLeft: "2px" }} />
      </button>
      {isOpen && (
        <div className="top-toolbar-dropdown-menu">
          {children}
        </div>
      )}
    </div>
  );
};

export const TopToolbar: React.FC<TopToolbarProps> = ({
  onSave,
  onLoad,
  onNew,
  onClear,
  onReset,
  onUndo,
  onRedo,
  onHelp,
  onExportPNG,
  onExportSVG,
  onExportPreset,
  snapToGrid = false,
  gridSize = 20,
  showGridOverlay = false,
  onToggleSnap,
  onGridSizeChange,
  onToggleGridOverlay,
  canUndo = false,
  canRedo = false,
  selectedTool = "select",
  onToolChange,
}) => {
  const tools: { id: ToolType; icon: React.ElementType; label: string }[] = [
    { id: "select", icon: MousePointer2, label: "Select" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "star", icon: Star, label: "Star" },
    { id: "hexagon", icon: Hexagon, label: "Hexagon" },
    { id: "shape-group", icon: Shapes, label: "Shape Group" },
    { id: "magic", icon: Sparkles, label: "Magic" },
    { id: "text", icon: Type, label: "Text" },
    { id: "image", icon: Image, label: "Image" },
    { id: "upload", icon: Upload, label: "Upload" },
  ];

  return (
    <div className="top-toolbar">
      {/* Tools Section */}
      <div className="top-toolbar-section top-toolbar-left" style={{ gap: "4px" }}>
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = selectedTool === tool.id;
          return (
            <button
              key={tool.id}
              className={`top-toolbar-button ${isActive ? 'active' : ''}`}
              onClick={() => onToolChange?.(tool.id)}
              title={tool.label}
              style={{
                padding: "6px 8px",
                background: isActive ? "rgba(91, 224, 255, 0.2)" : "transparent",
                border: isActive ? "1px solid rgba(91, 224, 255, 0.5)" : "1px solid transparent",
              }}
            >
              <Icon className="top-toolbar-icon" style={{ width: "16px", height: "16px" }} />
            </button>
          );
        })}
      </div>

      {/* Left Section: Title and Description */}
      <div className="top-toolbar-section top-toolbar-left">
        <div className="top-toolbar-title-group">
          <h1 className="top-toolbar-title">ERRL Scene Builder</h1>
          <p className="top-toolbar-description">Create and customize your scenes</p>
        </div>
      </div>

      {/* Center Section: Undo/Redo */}
      <div className="top-toolbar-section top-toolbar-center">
        <button
          className="top-toolbar-button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo className="top-toolbar-icon" />
          <span>Undo</span>
        </button>
        <button
          className="top-toolbar-button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo className="top-toolbar-icon" />
          <span>Redo</span>
        </button>
      </div>

      {/* Right Section: Dropdowns */}
      <div className="top-toolbar-section top-toolbar-right">
        <ThemeControls compact={true} />
        <DropdownMenu label="Export" icon={Download}>
          {EXPORT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className="top-toolbar-dropdown-item"
              onClick={() => {
                if (preset.id === "PNG" && onExportPNG) {
                  onExportPNG();
                } else if (preset.id === "SVG" && onExportSVG) {
                  onExportSVG();
                } else if (onExportPreset) {
                  onExportPreset(preset);
                }
              }}
            >
              {preset.label}
            </button>
          ))}
        </DropdownMenu>

        <DropdownMenu label="File" icon={FilePlus}>
          {onNew && (
            <button className="top-toolbar-dropdown-item" onClick={onNew}>
              <FilePlus className="top-toolbar-icon" style={{ width: "14px", height: "14px" }} />
              <span>New</span>
            </button>
          )}
          {onSave && (
            <button className="top-toolbar-dropdown-item" onClick={onSave}>
              <Save className="top-toolbar-icon" style={{ width: "14px", height: "14px" }} />
              <span>Save</span>
            </button>
          )}
          {onLoad && (
            <button className="top-toolbar-dropdown-item" onClick={onLoad}>
              <FolderOpen className="top-toolbar-icon" style={{ width: "14px", height: "14px" }} />
              <span>Load</span>
            </button>
          )}
          {onClear && (
            <button className="top-toolbar-dropdown-item" onClick={onClear}>
              <X className="top-toolbar-icon" style={{ width: "14px", height: "14px" }} />
              <span>Clear</span>
            </button>
          )}
          {onReset && (
            <button className="top-toolbar-dropdown-item" onClick={onReset}>
              <RotateCcw className="top-toolbar-icon" style={{ width: "14px", height: "14px" }} />
              <span>Reset</span>
            </button>
          )}
        </DropdownMenu>

        <DropdownMenu label="Canvas" icon={Settings} className="canvas-settings-dropdown">
          <div className="canvas-settings-dropdown-content">
            <CanvasSettings
              snapToGrid={snapToGrid}
              gridSize={gridSize}
              onToggleSnap={onToggleSnap}
              onGridSizeChange={onGridSizeChange}
            />
            {onToggleGridOverlay && (
              <div className="canvas-settings-section">
                <div className="canvas-settings-label">Grid Overlay</div>
                <div className="canvas-settings-controls">
                  <label className="canvas-settings-checkbox">
                    <input
                      type="checkbox"
                      checked={showGridOverlay}
                      onChange={onToggleGridOverlay}
                      className="canvas-settings-checkbox-input"
                    />
                    <span>Show Grid</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </DropdownMenu>

        <button
          className="top-toolbar-button"
          onClick={onHelp}
          title="Help"
        >
          <HelpCircle className="top-toolbar-icon" />
          <span>Help</span>
        </button>
      </div>
    </div>
  );
};

