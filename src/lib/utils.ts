
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple hash function for pseudo-randomness from userId
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export function generateUniqueAvatarSvgDataUri(userId: string): string {
  const hash = simpleHash(userId);

  const bgColors = [
    'hsl(204, 70%, 50%)', // Blue
    'hsl(145, 63%, 42%)', // Green
    'hsl(28, 80%, 52%)',  // Orange
    'hsl(350, 78%, 58%)', // Pinkish-Red
    'hsl(260, 52%, 58%)', // Purple
    'hsl(45, 100%, 51%)', // Yellow
    'hsl(180, 50%, 45%)', // Teal
    'hsl(0, 60%, 55%)',   // Red
  ];

  const fgColors = [
    'hsl(204, 70%, 90%)', // Light Blue
    'hsl(145, 63%, 88%)', // Light Green
    'hsl(28, 80%, 88%)',  // Light Orange
    'hsl(350, 78%, 92%)', // Light Pinkish-Red
    'hsl(260, 52%, 92%)', // Light Purple
    'hsl(45, 100%, 88%)', // Light Yellow
    'hsl(180, 50%, 85%)', // Light Teal
    'hsl(0, 60%, 90%)',   // Light Red
  ];

  const bgColor = bgColors[hash % bgColors.length];
  const fgColorSeed = (Math.floor(hash / bgColors.length)) % fgColors.length;

  const numShapes = 2 + (hash % 3); // 2 to 4 inner shapes
  const svgSize = 100;
  let shapesSvg = '';

  for (let i = 0; i < numShapes; i++) {
    const shapeHash = simpleHash(userId + '-' + i); // Vary hash for each shape
    const x = (shapeHash % (svgSize / 2)) + (svgSize / 10); // Random x within bounds
    const y = (Math.floor(shapeHash / (svgSize / 2))) % (svgSize/2) + (svgSize / 10); // Random y
    const width = (svgSize / 5) + (shapeHash % (svgSize / 4)); // Random width
    const height = (svgSize / 5) + (Math.floor(shapeHash / 2) % (svgSize / 4)); // Random height
    
    // Ensure shapes are somewhat within the main box by constraining max size and position
    const constrainedWidth = Math.min(width, svgSize - x - (svgSize / 20));
    const constrainedHeight = Math.min(height, svgSize - y - (svgSize / 20));

    const fgColor = fgColors[(fgColorSeed + i*2) % fgColors.length];
    const borderRadius = 3 + (shapeHash % 5);


    shapesSvg += `<rect x="${x}" y="${y}" width="${constrainedWidth}" height="${constrainedHeight}" fill="${fgColor}" rx="${borderRadius}" ry="${borderRadius}" />`;
  }

  const svgString = `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${svgSize}" height="${svgSize}" fill="${bgColor}" />
    ${shapesSvg}
  </svg>`;

  let base64Svg = '';
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    base64Svg = window.btoa(unescape(encodeURIComponent(svgString)));
  } else if (typeof Buffer !== 'undefined') {
    base64Svg = Buffer.from(svgString).toString('base64');
  } else {
    // Fallback for unexpected environments
    const placeholderSvg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="grey"/><text x="50" y="55" font-size="12" fill="white" text-anchor="middle">Error</text></svg>`;
     if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
        base64Svg = window.btoa(unescape(encodeURIComponent(placeholderSvg)));
    } else if (typeof Buffer !== 'undefined') {
        base64Svg = Buffer.from(placeholderSvg).toString('base64');
    }
  }
  return `data:image/svg+xml;base64,${base64Svg}`;
}
