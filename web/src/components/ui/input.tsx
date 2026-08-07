import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Validation/hint message shown under the field. */
  hint?: string;
  invalid?: boolean;
}

/** Shared text input, styled to the Ember system. */
export function Input({ className, hint, invalid, ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        className={cn(
          "w-full rounded-xl border bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition-colors",
          "placeholder:text-fg-subtle focus:border-accent",
          invalid ? "border-danger" : "border-border",
          className,
        )}
        {...props}
      />
      {hint && (
        <p
          className={cn(
            "mt-1.5 text-xs",
            invalid ? "text-danger" : "text-fg-subtle",
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
