"use client";

interface Props {
  on: boolean;
  onChange: (next: boolean) => void;
  color?: string;
  label?: string;
}

export function Toggle({ on, onChange, color = "#a3e635", label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full border transition-colors ${
        on
          ? "border-transparent"
          : "border-zinc-700/60 bg-zinc-800/60"
      }`}
      style={{
        background: on ? color : undefined,
      }}
    >
      <span
        className={`block h-3 w-3 rounded-full bg-zinc-950 shadow transition-transform ${
          on ? "translate-x-3.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
