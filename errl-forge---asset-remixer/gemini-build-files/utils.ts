
export async function imageUrlToBase64(url: string): Promise<string> {
  try {
    // We add cache busting to avoid some browser caching issues with cors if needed,
    // though for data inputs usually not needed.
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove the data:image/png;base64, prefix to get raw base64
        const result = reader.result as string;
        // Handle both png and jpeg prefixes just in case
        const base64 = result.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Image conversion failed", error);
    throw error;
  }
}
