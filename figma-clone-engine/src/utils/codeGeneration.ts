import { SceneNode, FrameNode, TextNode } from '../types';
import { colorToCss } from './helpers';

/**
 * Generate CSS code for a node
 */
export const generateCSS = (node: SceneNode): string => {
  let css = `/* ${node.name} */\n`;
  
  if ((node.type === 'FRAME' || node.type === 'COMPONENT') && (node as FrameNode).layoutMode !== 'NONE') {
    const f = node as FrameNode;
    css += `display: flex;\n`;
    css += `flex-direction: ${f.layoutMode === 'HORIZONTAL' ? 'row' : 'column'};\n`;
    css += `gap: ${f.itemSpacing}px;\n`;
    css += `padding: ${f.padding}px;\n`;
    
    // Layout extensions
    if (f.alignItems) {
      const alignMap: Record<string, string> = { start: 'flex-start', end: 'flex-end', center: 'center', stretch: 'stretch' };
      css += `align-items: ${alignMap[f.alignItems] || f.alignItems};\n`;
    }
    if (f.justifyContent) {
      const justifyMap: Record<string, string> = { 
        start: 'flex-start', 
        end: 'flex-end', 
        center: 'center',
        'space-between': 'space-between',
        'space-around': 'space-around',
        'space-evenly': 'space-evenly'
      };
      css += `justify-content: ${justifyMap[f.justifyContent] || f.justifyContent};\n`;
    }
    if (f.flexWrap) {
      css += `flex-wrap: ${f.flexWrap};\n`;
    }
    
    css += `width: fit-content;\n`;
    css += `height: fit-content;\n`;
    
    // Margin
    if (f.margin !== undefined) {
      if (typeof f.margin === 'number') {
        css += `margin: ${f.margin}px;\n`;
      } else {
        css += `margin: ${f.margin.top}px ${f.margin.right}px ${f.margin.bottom}px ${f.margin.left}px;\n`;
      }
    }
  } else {
    css += `position: absolute;\n`;
    css += `width: ${Math.round((node as any).width)}px;\n`;
    css += `height: ${Math.round((node as any).height)}px;\n`;
    css += `left: ${Math.round(node.x)}px;\n`;
    css += `top: ${Math.round(node.y)}px;\n`;
  }

  // Corner radius / Border radius
  if ((node as any).cornerRadius) {
    css += `border-radius: ${(node as any).cornerRadius}px;\n`;
  }

  // Fill / Background
  if ((node as any).fill) {
    const c = (node as any).fill;
    css += `background-color: ${colorToCss(c)};\n`;
  }
  
  // Background extensions
  if ((node as any).backgroundGradient) {
    css += `background: ${(node as any).backgroundGradient};\n`;
  }
  if ((node as any).backgroundImage) {
    css += `background-image: url(${(node as any).backgroundImage});\n`;
  }
  
  // Border
  const borderWidth = (node as any).borderWidth;
  const borderColor = (node as any).borderColor;
  const borderStyle = (node as any).borderStyle;
  
  if (borderWidth && borderColor && borderStyle && borderStyle !== 'none') {
    if (typeof borderWidth === 'number') {
      css += `border: ${borderWidth}px ${borderStyle} ${colorToCss(borderColor)};\n`;
    } else {
      css += `border-top: ${borderWidth.top}px ${borderStyle} ${colorToCss(borderColor)};\n`;
      css += `border-right: ${borderWidth.right}px ${borderStyle} ${colorToCss(borderColor)};\n`;
      css += `border-bottom: ${borderWidth.bottom}px ${borderStyle} ${colorToCss(borderColor)};\n`;
      css += `border-left: ${borderWidth.left}px ${borderStyle} ${colorToCss(borderColor)};\n`;
    }
  }
  
  // Box shadow
  if ((node as any).boxShadow) {
    css += `box-shadow: ${(node as any).boxShadow};\n`;
  }
  
  // Opacity
  if ((node as any).opacity !== undefined && (node as any).opacity !== 1) {
    css += `opacity: ${(node as any).opacity};\n`;
  }
  
  // Typography (for TEXT nodes)
  if (node.type === 'TEXT') {
    const t = node as TextNode;
    css += `font-family: ${t.fontFamily || 'Inter, sans-serif'};\n`;
    css += `font-size: ${t.fontSize}px;\n`;
    css += `color: ${colorToCss(t.fill)};\n`;
    
    if (t.fontWeight) {
      css += `font-weight: ${t.fontWeight};\n`;
    }
    if (t.lineHeight !== undefined) {
      css += `line-height: ${typeof t.lineHeight === 'number' ? `${t.lineHeight}px` : t.lineHeight};\n`;
    }
    if (t.letterSpacing !== undefined) {
      css += `letter-spacing: ${t.letterSpacing}px;\n`;
    }
    if (t.textAlign) {
      css += `text-align: ${t.textAlign};\n`;
    }
    if (t.textDecoration && t.textDecoration !== 'none') {
      css += `text-decoration: ${t.textDecoration};\n`;
    }
  }
  
  return css;
};

/**
 * Generate React/JSX code for a node
 */
export const generateReact = (node: SceneNode): string => {
  const isFlex = (node.type === 'FRAME' || node.type === 'COMPONENT') && (node as FrameNode).layoutMode !== 'NONE';
  let style = `{{ `;
  const styleProps: string[] = [];
  
  if (isFlex) {
    const f = node as FrameNode;
    styleProps.push(`display: 'flex'`);
    styleProps.push(`flexDirection: '${f.layoutMode.toLowerCase() === 'horizontal' ? 'row' : 'column'}'`);
    styleProps.push(`gap: ${f.itemSpacing}`);
    styleProps.push(`padding: ${f.padding}`);
    
    if (f.alignItems) {
      const alignMap: Record<string, string> = { start: 'flex-start', end: 'flex-end', center: 'center', stretch: 'stretch' };
      styleProps.push(`alignItems: '${alignMap[f.alignItems] || f.alignItems}'`);
    }
    if (f.justifyContent) {
      const justifyMap: Record<string, string> = { 
        start: 'flex-start', 
        end: 'flex-end', 
        center: 'center',
        'space-between': 'space-between',
        'space-around': 'space-around',
        'space-evenly': 'space-evenly'
      };
      styleProps.push(`justifyContent: '${justifyMap[f.justifyContent] || f.justifyContent}'`);
    }
    if (f.flexWrap) {
      styleProps.push(`flexWrap: '${f.flexWrap}'`);
    }
    
    if (f.margin !== undefined) {
      if (typeof f.margin === 'number') {
        styleProps.push(`margin: ${f.margin}`);
      } else {
        styleProps.push(`margin: '${f.margin.top}px ${f.margin.right}px ${f.margin.bottom}px ${f.margin.left}px'`);
      }
    }
  } else {
    styleProps.push(`width: ${Math.round((node as any).width)}`);
    styleProps.push(`height: ${Math.round((node as any).height)}`);
    styleProps.push(`position: 'absolute'`);
    styleProps.push(`left: ${Math.round(node.x)}`);
    styleProps.push(`top: ${Math.round(node.y)}`);
  }
  
  if ((node as any).cornerRadius) {
    styleProps.push(`borderRadius: ${(node as any).cornerRadius}`);
  }
  
  if ((node as any).fill) {
    const c = (node as any).fill;
    styleProps.push(`backgroundColor: '${colorToCss(c)}'`);
  }
  
  if ((node as any).backgroundGradient) {
    styleProps.push(`background: '${(node as any).backgroundGradient}'`);
  }
  if ((node as any).backgroundImage) {
    styleProps.push(`backgroundImage: 'url(${(node as any).backgroundImage})'`);
  }
  
  const borderWidth = (node as any).borderWidth;
  const borderColor = (node as any).borderColor;
  const borderStyle = (node as any).borderStyle;
  
  if (borderWidth && borderColor && borderStyle && borderStyle !== 'none') {
    if (typeof borderWidth === 'number') {
      styleProps.push(`border: '${borderWidth}px ${borderStyle} ${colorToCss(borderColor)}'`);
    } else {
      styleProps.push(`borderTop: '${borderWidth.top}px ${borderStyle} ${colorToCss(borderColor)}'`);
      styleProps.push(`borderRight: '${borderWidth.right}px ${borderStyle} ${colorToCss(borderColor)}'`);
      styleProps.push(`borderBottom: '${borderWidth.bottom}px ${borderStyle} ${colorToCss(borderColor)}'`);
      styleProps.push(`borderLeft: '${borderWidth.left}px ${borderStyle} ${colorToCss(borderColor)}'`);
    }
  }
  
  if ((node as any).boxShadow) {
    styleProps.push(`boxShadow: '${(node as any).boxShadow}'`);
  }
  
  if ((node as any).opacity !== undefined && (node as any).opacity !== 1) {
    styleProps.push(`opacity: ${(node as any).opacity}`);
  }
  
  style = `{{ ${styleProps.join(', ')} }}`;

  if (node.type === 'RECTANGLE' || node.type === 'FRAME') {
    return `<div style=${style} className="${node.name.toLowerCase().replace(/\s/g, '-')}">\n  {/* Children */}\n</div>`;
  }
  if (node.type === 'TEXT') {
    const t = node as TextNode;
    const textStyleProps: string[] = [];
    textStyleProps.push(`fontSize: ${t.fontSize}`);
    if (t.fontFamily) textStyleProps.push(`fontFamily: '${t.fontFamily}'`);
    if (t.fontWeight) textStyleProps.push(`fontWeight: '${t.fontWeight}'`);
    if (t.lineHeight !== undefined) {
      textStyleProps.push(`lineHeight: ${typeof t.lineHeight === 'number' ? t.lineHeight : `'${t.lineHeight}'`}`);
    }
    if (t.letterSpacing !== undefined) textStyleProps.push(`letterSpacing: ${t.letterSpacing}`);
    if (t.textAlign) textStyleProps.push(`textAlign: '${t.textAlign}'`);
    if (t.textDecoration && t.textDecoration !== 'none') textStyleProps.push(`textDecoration: '${t.textDecoration}'`);
    if (t.fill) textStyleProps.push(`color: '${colorToCss(t.fill)}'`);
    if (t.opacity !== undefined && t.opacity !== 1) textStyleProps.push(`opacity: ${t.opacity}`);
    
    const textStyle = `{{ ${textStyleProps.join(', ')} }}`;
    return `<p style=${textStyle}>${t.content}</p>`;
  }
  return `<!-- Component type ${node.type} -->`;
};

