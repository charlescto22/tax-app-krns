interface BrandMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BrandMark({ size = "sm", className = "" }: BrandMarkProps) {
  return (
    <div
      className={`brand-mark brand-mark--${size} ${className}`.trim()}
      aria-hidden="true"
    >
      IEC
    </div>
  );
}
