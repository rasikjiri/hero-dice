type MenuItem = {
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
};

type AppMenuProps = {
  isOpen: boolean;
  onToggle: () => void;
  items: MenuItem[];
  label?: string;
  className?: string;
};

export default function AppMenu({
  isOpen,
  onToggle,
  items,
  label = "MENU",
  className = "",
}: AppMenuProps) {
  return (
    <div
      className={`relative ${className}`.trim()}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        onClick={onToggle}
        className="group relative overflow-hidden rounded-2xl border border-zinc-600 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black px-6 py-3 text-lg font-black tracking-[0.1em] text-zinc-100 shadow-[0_10px_22px_rgba(0,0,0,0.45)] transition duration-200 hover:border-yellow-400/70 hover:text-yellow-300 hover:from-zinc-700 hover:via-zinc-800 hover:to-black hover:shadow-[0_0_18px_rgba(250,204,21,0.25)]"
      >
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        <span className="relative">{label}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-700 bg-black/95 shadow-[0_18px_34px_rgba(0,0,0,0.55)] backdrop-blur-sm">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full border-b border-zinc-800/80 px-5 py-4 text-left font-bold tracking-[0.04em] transition last:border-b-0 hover:bg-zinc-800/70 ${
                item.tone === "danger"
                  ? "text-red-300 hover:text-red-200 hover:shadow-[inset_0_0_0_1px_rgba(248,113,113,0.25)]"
                  : "text-zinc-100 hover:text-yellow-300 hover:shadow-[inset_0_0_0_1px_rgba(250,204,21,0.2)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
