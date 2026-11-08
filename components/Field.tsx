// Labelled text field with its hint or error, shared by the sign-up and log-in forms (story 9).
export function Field({
  name,
  label,
  type = "text",
  autoComplete,
  defaultValue,
  hint,
  error,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete: string;
  defaultValue?: string;
  hint?: string;
  error?: string;
}) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;
  return (
    <div>
      <label htmlFor={name} className="block font-medium">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`mt-1 min-h-12 w-full rounded-2xl border bg-white/70 px-4 ${error ? "border-red-700" : "border-line"}`}
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-sm font-medium text-red-800">{error}</p>
      ) : hint ? (
        <p id={`${name}-hint`} className="mt-1 text-sm text-navy/70">{hint}</p>
      ) : null}
    </div>
  );
}
