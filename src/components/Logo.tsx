/** The Kerbside mark: a bus-stop flag on its pole. */
export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#0a4d8c" />
      <rect x="7" y="4.5" width="10" height="7.5" rx="1.2" fill="#ffffff" />
      <path d="M9.5 7.2h5M9.5 9.4h3.4" stroke="#0a4d8c" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12 12v8" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
