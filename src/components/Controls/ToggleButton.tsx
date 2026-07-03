import clsx from "clsx";

type ToggleButtonProps = {
  pressed: boolean;
  children: string;
  onClick: () => void;
};

export function ToggleButton({ pressed, children, onClick }: ToggleButtonProps) {
  return (
    <button
      className={clsx(
        "min-h-11 rounded-md border px-3 py-2 text-sm font-semibold transition active:scale-95",
        pressed
          ? "border-teal-600 bg-teal-600 text-white"
          : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200",
      )}
      onClick={onClick}
      aria-pressed={pressed}
    >
      {children}
    </button>
  );
}
