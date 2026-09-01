export default function Raven({ label = 'Waking the ravens…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-stack-md py-stack-lg">
      <svg
        viewBox="0 0 64 64"
        className="raven-pulse h-16 w-16"
        fill="none"
        stroke="#f2ca50"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 40c6 4 14 6 20 6s14-2 20-6c-2 8-10 14-20 14S14 48 12 40Z" fill="#f2ca50" fillOpacity="0.12" />
        <path d="M20 26c0-8 6-14 12-14 4 0 7 2 9 5l7-3-3 7c2 3 3 7 3 11 0 3-1 6-3 8" />
        <path d="M20 26c-4 1-8 4-10 8 4 0 7-1 10-3" />
        <circle cx="38" cy="22" r="1.4" fill="#f2ca50" stroke="none" />
      </svg>
      <p className="font-serif text-[22px] text-dragon-gold">{label}</p>
    </div>
  );
}
