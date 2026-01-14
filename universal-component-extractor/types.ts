export interface ExtractedCode {
  html: string;
  css: string;
  scss: string;
  tsx: string;
  vanillaJs: string;
  explanation: string;
  componentName?: string;
  framework?: string;
  buildApproach?: string;
  codeSimplification?: string;
  activeCode?: string;
  howItWorks?: string;
  editableSections?: string;
  originalFiles?: UploadedFile[];
  isCompleteHtml?: boolean; // Indicates if html field contains a complete HTML document
  // Optional snapshot of the original input used for this extraction (typically textarea content)
  originalSource?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: 'html' | 'css' | 'scss' | 'ts' | 'tsx' | 'js' | 'jsx' | 'json' | '3js' | 'unknown';
  content: string;
  lastModified: number;
  size: number;
}

export type FileType = 'html' | 'css' | 'scss' | 'ts' | 'tsx' | 'js' | 'jsx' | 'json' | '3js' | 'unknown';