/** Elemnexa's orbital E. Decorative; the adjacent wordmark supplies its name. */
export default function BrandMark({ className = "" }) {
  return <svg className={className} width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <rect width="48" height="48" rx="15" fill="currentColor" />
    <path d="M31 14H18v20h13M18 24h10" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="24" cy="24" rx="20" ry="9" transform="rotate(-40 24 24)" stroke="#b6f3de" strokeWidth="1.5" />
    <circle cx="39" cy="12" r="3" fill="#c5b7ff" />
  </svg>;
}
