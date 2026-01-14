export class DeviceDetector {
  public static isMobile(): boolean {
    // Check user agent
    const ua = navigator.userAgent.toLowerCase();
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    
    // Check touch support
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Check screen size (optional, for tablets)
    const isSmallScreen = window.innerWidth <= 768;
    
    return mobileRegex.test(ua) || (hasTouch && isSmallScreen);
  }
  
  public static isTablet(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    return /ipad|android(?!.*mobile)|tablet/i.test(ua);
  }
  
  public static isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
}

