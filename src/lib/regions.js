export const REGIONS = [
  'IN', 'US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'SE', 'NO', 'DK',
  'FI', 'PL', 'PT', 'CH', 'AT', 'BR', 'MX', 'AR', 'CL', 'CO', 'JP', 'KR', 'HK', 'TW', 'SG', 'MY',
  'ID', 'PH', 'TH', 'VN', 'AE', 'SA', 'TR', 'ZA', 'NG', 'EG', 'PK', 'BD', 'LK',
];

export function detectRegion() {
  try {
    const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (const l of langs) {
      const m = /-([A-Za-z]{2})$/.exec(l || '');
      if (m) return m[1].toUpperCase();
    }
  } catch (e) {
    /* ignore */
  }
  return 'US';
}
