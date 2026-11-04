export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="grid justify-items-center gap-2.5 px-3 py-8 text-center">
      {Icon && (
        <span className="mb-1 grid size-14 place-items-center rounded-2xl bg-violet-tint text-violet">
          <Icon className="size-7" aria-hidden="true" />
        </span>
      )}
      <h3>{title}</h3>
      {children && <p className="max-w-[40ch] text-ink-soft">{children}</p>}
      {action}
    </div>
  );
}
