import { Star } from "lucide-react";

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(value)
              ? "fill-clay-400 text-clay-400"
              : "fill-cream-200 text-cream-200"
          }
        />
      ))}
    </div>
  );
}

export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110"
          aria-label={`${i} stars`}
        >
          <Star
            size={28}
            className={
              i <= value
                ? "fill-clay-400 text-clay-400"
                : "fill-cream-100 text-sage-300"
            }
          />
        </button>
      ))}
    </div>
  );
}
