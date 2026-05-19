interface StatusBadgeProps {
  active: boolean;
  activeText?: string;
  inactiveText?: string;
}

export function StatusBadge({
  active,
  activeText = "Active",
  inactiveText = "Inactive",
}: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700",
      ].join(" ")}
    >
      {active ? activeText : inactiveText}
    </span>
  );
}
