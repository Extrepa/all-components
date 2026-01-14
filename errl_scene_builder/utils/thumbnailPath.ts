/**
 * Utility functions for converting SVG file paths to thumbnail PNG paths
 */

/**
 * Converts an SVG file path to its corresponding thumbnail PNG path
 * 
 * @param svgPath - The SVG file path (e.g., "/svgs/Errl_AndOrbs/errl-30-dynamic-individual-transparent/errl-01.svg")
 * @returns The thumbnail PNG path (e.g., "/svgs/thumbnails/errl-30-dynamic-individual-transparent/errl-01.png")
 */
export function getThumbnailPath(svgPath: string): string {
  // Remove leading slash if present and convert to relative path
  const relativePath = svgPath.startsWith('/') ? svgPath.slice(1) : svgPath;
  
  // Check if this is a variant asset (in Errl_AndOrbs or ErrlOnly folders)
  if (relativePath.includes('Errl_AndOrbs/') || relativePath.includes('ErrlOnly/')) {
    // Extract the folder name and filename
    const parts = relativePath.split('/');
    const folderIndex = parts.findIndex(p => p === 'Errl_AndOrbs' || p === 'ErrlOnly');
    
    if (folderIndex >= 0 && folderIndex < parts.length - 1) {
      // Get the variant folder name (e.g., "errl-30-dynamic-individual-transparent")
      const variantFolder = parts[folderIndex + 1];
      const filename = parts[parts.length - 1];
      
      // Replace .svg with .png
      const pngFilename = filename.replace(/\.svg$/, '.png');
      
      // Construct thumbnail path
      return `/svgs/thumbnails/${variantFolder}/${pngFilename}`;
    }
  }
  
  // For non-variant assets, return the original SVG path (no thumbnail available)
  return svgPath;
}

/**
 * Checks if a thumbnail exists for the given SVG path
 * This is a simple check - in a real scenario, you might want to verify the file exists
 */
export function hasThumbnail(svgPath: string): boolean {
  const relativePath = svgPath.startsWith('/') ? svgPath.slice(1) : svgPath;
  return relativePath.includes('Errl_AndOrbs/') || relativePath.includes('ErrlOnly/');
}

