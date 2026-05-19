interface DataStateProps {
  type: "loading" | "error" | "empty";
  message: string;
}

export function DataState({ type, message }: DataStateProps) {
  const styles = {
    loading: "bg-blue-50 text-blue-700",
    error: "bg-red-50 text-red-700",
    empty: "bg-slate-50 text-slate-600",
  };

  return (
    <div className={`rounded-2xl p-5 text-sm font-medium ${styles[type]}`}>
      {message}
    </div>
  );
}
