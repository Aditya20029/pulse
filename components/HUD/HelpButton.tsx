"use client";

export function HelpButton() {
  return (
    <button
      type="button"
      onClick={() => {
        const event = new KeyboardEvent("keydown", { key: "?" });
        window.dispatchEvent(event);
      }}
      data-screenshot-hide="true"
      title="Keyboard shortcuts (?)"
      aria-label="Keyboard shortcuts"
      className="flex h-7 w-7 items-center justify-center rounded border border-cyan-400/25 bg-cyan-400/5 font-mono text-[12px] text-cyan-200 hover:border-cyan-300/50 hover:bg-cyan-400/15"
    >
      ?
    </button>
  );
}
