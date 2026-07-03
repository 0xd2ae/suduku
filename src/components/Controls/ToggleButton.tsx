import clsx from "clsx";

type ToggleButtonProps = {
  pressed: boolean;
  children: string;
  onClick: () => void;
  disabled?: boolean;
};

export function ToggleButton({ pressed, children, onClick, disabled = false }: ToggleButtonProps) {
  return (
    <button
      className={clsx(
        "min-h-9 rounded-md border px-2 py-1 text-xs font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 lg:min-h-11 lg:px-3 lg:py-2 lg:text-sm",
        pressed
          ? "border-teal-600 bg-teal-600 text-white"
          : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200",
      )}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
    >
      {children}
    </button>
  );
}
