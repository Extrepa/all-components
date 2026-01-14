/**
 * Type definitions for Theme Lab
 */

export interface Theme {
  id: string;
  label: string;
}

export interface ThemeTokens {
  bg: string;
  'bg-alt': string;
  surface: string;
  'surface-alt': string;
  border: string;
  'border-soft': string;
  'border-gradient-from': string;
  'border-gradient-to': string;
  accent: string;
  'accent-soft': string;
  'accent-alt': string;
  'accent-boost': string;
  danger: string;
  success: string;
  text: string;
  muted: string;
}

export interface ThemeData {
  id: string;
  label: string;
  tokens: ThemeTokens;
}

export interface LayoutState {
  density: 'compact' | 'cozy' | 'spacious';
  borders: 'on' | 'off';
  shadows: 'on' | 'off';
  'sidebar-bg': 'gradient' | 'solid';
  header: 'show' | 'hide';
}

export interface Preset {
  id: string;
  name: string;
  themeId: string;
  layout: LayoutState;
  createdAt: string;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  fix: string;
}

export interface ValidationResults {
  themeId: string;
  themeLabel: string;
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
  passed: boolean;
  score: 'AAA' | 'AA' | 'Fail';
  scorePercentage?: number;
  totalChecks?: number;
}

export interface ShareData {
  theme: string;
  layout: LayoutState;
  timestamp: number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type CodeSnippetFormat = 'react' | 'tailwind' | 'styled-components' | 'emotion' | 'typescript';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface TokenControl {
  name: string;
  token: string;
  type: 'range' | 'color';
  min?: number;
  max?: number;
  step?: number;
  default: string | number;
  unit?: string;
  category: string;
}

