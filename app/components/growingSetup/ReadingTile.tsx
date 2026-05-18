function ReadingTile({
                     icon,
                     label,
                     value,
                     unit,
                     tone = "leaf",
                 }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    unit: string;
    tone?: "leaf" | "water" | "sun";
}) {
    const toneColor =
        tone === "water" ? "text-mf-water" : tone === "sun" ? "text-mf-clay" : "text-mf-forest";
    return (
        <div className="flex flex-col gap-1 py-3 px-3 first:pl-0 last:pr-0">
            <div className={`flex items-center gap-1.5 ${toneColor}`}>
                {icon}
                <span className="text-[10px] uppercase tracking-[.10em] font-medium text-mf-ink-3">
          {label}
        </span>
            </div>
            <div className="font-serif text-2xl text-mf-ink tracking-tight">
                {value}
                <span className="text-sm text-mf-ink-3 ml-0.5">{unit}</span>
            </div>
        </div>
    );
}

export default ReadingTile;