export function NotesGrid({ notes }: { notes: Set<number> }) {
  return (
    <span className="grid h-full w-full grid-cols-3 grid-rows-3 p-0.5 text-[9px] font-semibold leading-none text-slate-500 dark:text-slate-400 sm:text-[11px]">
      {Array.from({ length: 9 }, (_, index) => {
        const digit = index + 1;
        return (
          <span key={digit} className="flex items-center justify-center">
            {notes.has(digit) ? digit : ""}
          </span>
        );
      })}
    </span>
  );
}

