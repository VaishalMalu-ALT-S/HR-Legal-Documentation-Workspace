// Generates the official ALT-S Corporate Seal rubber stamp as an SVG Data URL
export function getAltSCorporateStamp(): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <!-- Circular Path for Top Text -->
    <path id="circlePathTop" d="M 28,100 A 72,72 0 1,1 172,100" fill="none" />
    <!-- Circular Path for Bottom Text -->
    <path id="circlePathBottom" d="M 172,100 A 72,72 0 0,1 28,100" fill="none" />
    
    <!-- Rubber stamp ink filter for realism -->
    <filter id="stampRoughness">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>

  <g filter="url(#stampRoughness)" stroke="#1d4ed8" fill="#1d4ed8" font-family="'Arial', 'Helvetica', sans-serif" opacity="0.92">
    <!-- Outer Ring -->
    <circle cx="100" cy="100" r="92" fill="none" stroke-width="3" stroke="#1d4ed8" stroke-dasharray="1200" />
    
    <!-- Inner Ring -->
    <circle cx="100" cy="100" r="82" fill="none" stroke-width="1.8" stroke="#1d4ed8" />

    <!-- Innermost Center Ring -->
    <circle cx="100" cy="100" r="50" fill="none" stroke-width="1.2" stroke="#1d4ed8" stroke-dasharray="4,2" />

    <!-- Circular Top Text: ALT-S Technology Private -->
    <text font-size="13" font-weight="900" letter-spacing="2" text-anchor="middle" fill="#1d4ed8" stroke="none">
      <textPath href="#circlePathTop" startOffset="50%">
        ALT-S Technology Private
      </textPath>
    </text>

    <!-- Circular Bottom Text: Limited -->
    <text font-size="13" font-weight="900" letter-spacing="4" text-anchor="middle" fill="#1d4ed8" stroke="none">
      <textPath href="#circlePathBottom" startOffset="50%">
        Limited
      </textPath>
    </text>

    <!-- Side Decorative Stars -->
    <polygon points="100,168 103,176 111,176 104,181 107,189 100,184 93,189 96,181 89,176 97,176" fill="#1d4ed8" stroke="none" transform="scale(0.8) translate(25, -45)" />

    <!-- Center Text: Chennai -->
    <text x="100" y="97" font-size="16" font-weight="bold" letter-spacing="1.5" text-anchor="middle" fill="#1d4ed8" stroke="none">
      Chennai
    </text>
    
    <!-- Small star under Chennai -->
    <polygon points="100,110 102,115 107,115 103,118 105,123 100,120 95,123 97,118 93,115 98,115" fill="#1d4ed8" stroke="none" />
  </g>
</svg>
`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
