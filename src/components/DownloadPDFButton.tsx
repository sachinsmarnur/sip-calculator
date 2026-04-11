import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";

interface DownloadPDFButtonProps {
  onExport: () => void | Promise<void>;
  label?: string;
  className?: string;
}

export function DownloadPDFButton({
  onExport,
  label = "Download PDF",
  className = "",
}: DownloadPDFButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onExport();
    } finally {
      // brief delay so user sees the spinner
      setTimeout(() => setLoading(false), 600);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200
        bg-primary/10 text-primary hover:bg-primary/20 active:scale-95
        disabled:opacity-60 disabled:cursor-not-allowed
        border border-primary/20 hover:border-primary/40
        shadow-sm hover:shadow-md
        ${className}`}
      aria-label="Download PDF report"
      title="Download a detailed PDF report"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileDown className="h-3.5 w-3.5" />
      )}
      {label}
    </button>
  );
}
