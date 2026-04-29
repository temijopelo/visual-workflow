import { useEffect } from "react";
import type { ToastProps } from "../../types";

export default function Toast({
  message,
  type = "info",
  onDismiss,
}: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === "error" ? "✕" : type === "success" ? "✓" : "ℹ"}
      </span>
      {message}
    </div>
  );
}
