import { Download } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLElement | null>;
  filename?: string;
}

export function ExportButton({
  targetRef,
  filename = "investment-result",
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    const el = targetRef.current;
    if (!el) return;

    setExporting(true);
    try {
      // Dynamically import html2canvas
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null,
      });

      const link = document.createElement("a");
      link.download = `${filename}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("Result exported!", {
        description: "Your calculation result has been downloaded as PNG.",
      });
    } catch {
      toast.error("Export failed", {
        description: "Could not capture the result. Try again.",
      });
    } finally {
      setExporting(false);
    }
  }, [targetRef, filename]);

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
      title="Export as PNG"
    >
      <Download className={`h-3.5 w-3.5 ${exporting ? "animate-bounce" : ""}`} />
      {exporting ? "Exporting…" : "Export"}
    </button>
  );
}
