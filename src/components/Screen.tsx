import Contents from "./Contents";

export default function Screen() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-gradient-to-br from-sky-50 via-white to-slate-100 px-6 text-slate-900 dark:from-slate-900 dark:via-slate-950 dark:to-neutral-900 dark:text-slate-100">
      <div
        className="flex border border-border shadow-lg"
        style={{
          width: "390px",
          height: "844px",
        }}
      >
        <Contents />
      </div>
    </div>
  );
}

