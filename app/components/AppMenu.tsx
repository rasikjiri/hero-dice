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
        className="rounded-2xl border border-yellow-400 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black px-6 py-3 text-lg font-black tracking-[0.1em] text-yellow-400 transition duration-200 hover:scale-[1.02] hover:brightness-110 hover:text-yellow-300"
      >
        {label}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-xl">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full border-b border-zinc-800/80 px-5 py-4 text-left font-bold tracking-[0.04em] transition last:border-b-0 hover:bg-zinc-800/70 ${
                item.tone === "danger"
                  ? "text-red-300 hover:text-red-200"
                  : "text-zinc-100 hover:text-yellow-300"
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
