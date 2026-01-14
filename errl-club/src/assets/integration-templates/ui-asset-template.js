/**
 * UI Asset Integration Template
 *
 * Copy this template and customize for your UI asset integration
 */

/**
 * Load UI asset
 * @param {string} path - Asset path
 * @returns {Promise<HTMLImageElement|SVGElement>} Loaded asset
 */
export async function load{UIAsset_NAME}(path) {
    return new Promise((resolve, reject) => {
        if (path.endsWith('.svg')) {
            // Load SVG
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = path;
        } else {
            // Load image
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = path;
        }
    });
}

/**
 * Template Variables to Replace:
 * - {UIAsset_NAME} - UI asset name
 * - Customize loading logic based on asset type
 */

