import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── Brand colors ──────────────────────────────────────────────────────────────
const BRAND_GREEN  = [45, 179, 138]   as [number, number, number];
const BRAND_AMBER  = [240, 168, 67]   as [number, number, number];
const BRAND_PURPLE = [139, 92, 246]   as [number, number, number];
const BRAND_INDIGO = [124, 106, 240]  as [number, number, number];
const BRAND_ORANGE = [249, 115, 22]   as [number, number, number];
const LIGHT_GRAY   = [248, 249, 250]  as [number, number, number];
const MID_GRAY     = [107, 114, 128]  as [number, number, number];
const DARK         = [17, 24, 39]     as [number, number, number];
const WHITE        = [255, 255, 255]  as [number, number, number];

// ── Fix 1: Unicode → Latin-1 sanitisation ────────────────────────────────────
// jsPDF's built-in Helvetica font only covers Latin-1 (ISO-8859-1).
// The ₹ glyph (U+20B9) and any other non-Latin-1 character renders as
// garbled text in desktop PDF viewers (Adobe, Windows PDF, etc.).
// We replace known symbols with ASCII equivalents before writing text.
function sanitizePdfText(text: string): string {
  return text
    .replace(/₹/g, "Rs.")   // Indian Rupee sign
    .replace(/€/g, "EUR")   // Euro
    .replace(/£/g, "GBP")   // Pound
    .replace(/\$/g, "$")    // Dollar (already ASCII, just keep)
    .replace(/—/g, "-")     // em-dash
    .replace(/–/g, "-")     // en-dash
    .replace(/'/g, "'")     // curly apostrophe
    .replace(/'/g, "'")
    .replace(/"/g, '"')     // curly quotes
    .replace(/"/g, '"')
    .replace(/…/g, "...")   // ellipsis
    .replace(/×/g, "x")    // multiplication sign
    .replace(/[^\x00-\xFF]/g, "?"); // catch-all for any remaining non-Latin-1
}

// ── Fix 2: Favicon loading ────────────────────────────────────────────────────
// We fetch the favicon.png at runtime and return a base64 data URI so
// jsPDF can embed it as a proper image instead of the "IC" text placeholder.
async function loadFaviconBase64(): Promise<string | null> {
  try {
    const response = await fetch("/favicon.png");
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ── Header ────────────────────────────────────────────────────────────────────
async function addPageHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  accentColor: [number, number, number],
) {
  const pageW = doc.internal.pageSize.getWidth();

  // Coloured background band
  doc.setFillColor(...accentColor);
  doc.rect(0, 0, pageW, 42, "F");

  // Logo box (rounded rectangle)
  doc.setFillColor(0, 0, 0);
  doc.roundedRect(12, 6, 28, 28, 4, 4, "F");

  // Try to embed the real favicon; fall back to "IC" text if unavailable
  const faviconB64 = await loadFaviconBase64();
  if (faviconB64) {
    // Render the favicon image centred inside the rounded box
    doc.addImage(faviconB64, "PNG", 14, 8, 24, 24);
  } else {
    // Fallback text logo
    doc.setTextColor(...WHITE);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("IC", 26, 23, { align: "center" });
  }

  // Calculator title
  doc.setTextColor(...WHITE);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(sanitizePdfText(title), 46, 19);

  // Subtitle
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text(sanitizePdfText(subtitle), 46, 27);

  // Generated date (top-right)
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
  doc.setFontSize(8);
  doc.text(`Generated: ${dateStr}`, pageW - 14, 27, { align: "right" });

  // Thin separator below the band
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.5);
  doc.line(14, 46, pageW - 14, 46);
}

// ── Summary stat box ──────────────────────────────────────────────────────────
function addSummaryBox(
  doc: jsPDF,
  stats: { label: string; value: string; highlight?: boolean }[],
  accentColor: [number, number, number],
  startY: number,
): number {
  const pageW  = doc.internal.pageSize.getWidth();
  const margin = 14;
  const statW  = (pageW - margin * 2) / stats.length;

  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(margin, startY, pageW - margin * 2, 26, 3, 3, "F");

  stats.forEach((stat, i) => {
    const x = margin + i * statW + statW / 2;

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MID_GRAY);
    doc.text(sanitizePdfText(stat.label.toUpperCase()), x, startY + 9, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(
      stat.highlight ? accentColor[0] : DARK[0],
      stat.highlight ? accentColor[1] : DARK[1],
      stat.highlight ? accentColor[2] : DARK[2],
    );
    doc.text(sanitizePdfText(stat.value), x, startY + 19, { align: "center" });

    if (i < stats.length - 1) {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin + (i + 1) * statW, startY + 5, margin + (i + 1) * statW, startY + 21);
    }
  });

  return startY + 32;
}

// ── Section title ─────────────────────────────────────────────────────────────
function addSectionTitle(
  doc: jsPDF,
  text: string,
  y: number,
  accentColor: [number, number, number],
): number {
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text(sanitizePdfText(text), 14, y);
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.3);
  doc.line(14, y + 2, 50, y + 2);
  return y + 8;
}

// ── Footer (added after all content) ─────────────────────────────────────────
function addFooter(doc: jsPDF) {
  const pageH     = doc.internal.pageSize.getHeight();
  const pageW     = doc.internal.pageSize.getWidth();
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...LIGHT_GRAY);
    doc.rect(0, pageH - 14, pageW, 14, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MID_GRAY);
    doc.text(
      "Calculations are for illustrative purposes only. Not financial advice. Please read all investment documents carefully before investing.",
      pageW / 2, pageH - 6, { align: "center" },
    );
    doc.text(`Page ${i} of ${totalPages}`, pageW - 14, pageH - 6, { align: "right" });
    doc.text("investcalc.app", 14, pageH - 6);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Public export functions (all now async because the header await the favicon)
// ═══════════════════════════════════════════════════════════════════════════════

// ── SIP PDF ───────────────────────────────────────────────────────────────────
export interface SIPPDFData {
  monthly: number;
  returnRate: number;
  years: number;
  totalInvested: number;
  estimatedReturns: number;
  maturityValue: number;
  inflationRate?: number | null;
  inflationAdjustedMaturity?: number | null;
  yearlyBreakdown: { year: number; invested: number; returns: number; total: number }[];
  currencySymbol: string;
  formatCurrency: (v: number, compact?: boolean) => string;
}

export async function exportSIPPDF(data: SIPPDFData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { formatCurrency, currencySymbol } = data;
  const sym = sanitizePdfText(currencySymbol);

  await addPageHeader(doc, "SIP Calculator Report", "Systematic Investment Plan - Monthly investing for long-term wealth", BRAND_GREEN);

  let y = 54;

  y = addSectionTitle(doc, "INPUT PARAMETERS", y, BRAND_GREEN);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(sanitizePdfText(`Monthly Investment: ${sym}${data.monthly.toLocaleString("en-IN")}`), 14, y); y += 6;
  doc.text(`Expected Annual Return: ${data.returnRate}%   Time Period: ${data.years} Years`, 14, y); y += 6;
  if (data.inflationRate) { doc.text(`Inflation Adjustment: ${data.inflationRate}%`, 14, y); y += 6; }
  y += 4;

  const stats: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Total Invested",  value: sanitizePdfText(formatCurrency(data.totalInvested, true)) },
    { label: "Est. Returns",    value: sanitizePdfText(formatCurrency(data.estimatedReturns, true)) },
    { label: "Maturity Value",  value: sanitizePdfText(formatCurrency(data.maturityValue, true)), highlight: true },
  ];
  if (data.inflationAdjustedMaturity) {
    stats.push({ label: "Inflation Adj. Value", value: sanitizePdfText(formatCurrency(data.inflationAdjustedMaturity, true)) });
  }
  y = addSummaryBox(doc, stats, BRAND_GREEN, y);

  const wealthRatio = (data.maturityValue / data.totalInvested).toFixed(2);
  const returnPct   = ((data.estimatedReturns / data.totalInvested) * 100).toFixed(1);
  doc.setFontSize(8);
  doc.setTextColor(...MID_GRAY);
  doc.text(`Wealth Ratio: ${wealthRatio}x   |   Return on Investment: ${returnPct}%   |   Monthly Rate: ${(data.returnRate / 12 / 100).toFixed(5)}`, 14, y);
  y += 10;

  y = addSectionTitle(doc, "YEAR-BY-YEAR BREAKDOWN", y, BRAND_GREEN);

  autoTable(doc, {
    startY: y,
    head: [["Year", "Amount Invested", "Est. Returns", "Total Value"]],
    body: data.yearlyBreakdown.map(row => [
      `Year ${row.year}`,
      sanitizePdfText(formatCurrency(row.invested, true)),
      sanitizePdfText(formatCurrency(row.returns, true)),
      sanitizePdfText(formatCurrency(row.total, true)),
    ]),
    styles:            { fontSize: 8,  cellPadding: 3, textColor: DARK },
    headStyles:        { fillColor: BRAND_GREEN, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles:{ fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { textColor: MID_GRAY as any },
      2: { textColor: [45, 179, 138] as any },
      3: { fontStyle: "bold", textColor: DARK },
    },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`SIP_Report_${data.years}yr_${data.returnRate}pct.pdf`);
}

// ── Step-Up SIP PDF ───────────────────────────────────────────────────────────
export interface StepUpPDFData {
  monthly: number;
  stepUp: number;
  returnRate: number;
  years: number;
  totalInvested: number;
  estimatedReturns: number;
  maturityValue: number;
  inflationRate?: number | null;
  inflationAdjustedMaturity?: number | null;
  finalYearSIP: number;
  yearlyBreakdown: { year: number; sipAmount: number; invested: number; returns: number; total: number }[];
  currencySymbol: string;
  formatCurrency: (v: number, compact?: boolean) => string;
}

export async function exportStepUpPDF(data: StepUpPDFData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { formatCurrency, currencySymbol } = data;
  const sym = sanitizePdfText(currencySymbol);

  await addPageHeader(doc, "SIP Step-Up Calculator Report", "Accelerated compounding through annual SIP increases", BRAND_PURPLE);

  let y = 54;

  y = addSectionTitle(doc, "INPUT PARAMETERS", y, BRAND_PURPLE);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(`Starting Monthly SIP: ${sym}${data.monthly.toLocaleString("en-IN")}   Annual Step-Up: ${data.stepUp}%`, 14, y); y += 6;
  doc.text(`Expected Annual Return: ${data.returnRate}%   Time Period: ${data.years} Years`, 14, y); y += 6;
  doc.text(`Final Year SIP: ${sym}${data.finalYearSIP.toLocaleString("en-IN")}/month   SIP Growth: ${((data.finalYearSIP / data.monthly - 1) * 100).toFixed(0)}%`, 14, y); y += 6;
  if (data.inflationRate) { doc.text(`Inflation Adjustment: ${data.inflationRate}%`, 14, y); y += 6; }
  y += 4;

  const stats: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Total Invested", value: sanitizePdfText(formatCurrency(data.totalInvested, true)) },
    { label: "Est. Returns",   value: sanitizePdfText(formatCurrency(data.estimatedReturns, true)) },
    { label: "Maturity Value", value: sanitizePdfText(formatCurrency(data.maturityValue, true)), highlight: true },
    { label: "Wealth Ratio",   value: `${(data.maturityValue / data.totalInvested).toFixed(2)}x` },
  ];
  y = addSummaryBox(doc, stats, BRAND_PURPLE, y);
  if (data.inflationAdjustedMaturity) {
    doc.setFontSize(8);
    doc.setTextColor(...MID_GRAY);
    doc.text(sanitizePdfText(`Inflation-Adjusted Maturity: ${formatCurrency(data.inflationAdjustedMaturity, true)}`), 14, y); y += 4;
  }
  y += 6;

  y = addSectionTitle(doc, "YEAR-BY-YEAR STEP-UP BREAKDOWN", y, BRAND_PURPLE);

  autoTable(doc, {
    startY: y,
    head: [["Year", "Monthly SIP", "Cum. Invested", "Cum. Returns", "Total Value"]],
    body: data.yearlyBreakdown.map(row => [
      `Year ${row.year}`,
      `${sym}${row.sipAmount.toLocaleString("en-IN")}`,
      sanitizePdfText(formatCurrency(row.invested, true)),
      sanitizePdfText(formatCurrency(row.returns, true)),
      sanitizePdfText(formatCurrency(row.total, true)),
    ]),
    styles:            { fontSize: 7.5, cellPadding: 2.5, textColor: DARK },
    headStyles:        { fillColor: BRAND_PURPLE, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles:{ fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { textColor: [139, 92, 246] as any },
      2: { textColor: MID_GRAY as any },
      3: { textColor: [45, 179, 138] as any },
      4: { fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`StepUp_SIP_Report_${data.years}yr_${data.stepUp}pct_stepup.pdf`);
}

// ── Lump Sum PDF ──────────────────────────────────────────────────────────────
export interface LumpSumPDFData {
  amount: number;
  returnRate: number;
  years: number;
  principal: number;
  estimatedReturns: number;
  maturityValue: number;
  inflationRate?: number | null;
  inflationAdjustedMaturity?: number | null;
  yearlyGrowth: { year: number; invested: number; returns: number; total: number }[];
  currencySymbol: string;
  formatCurrency: (v: number, compact?: boolean) => string;
}

export async function exportLumpSumPDF(data: LumpSumPDFData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { formatCurrency, currencySymbol } = data;
  const sym = sanitizePdfText(currencySymbol);

  await addPageHeader(doc, "Lump Sum Calculator Report", "One-time investment growth with compound interest", BRAND_AMBER);

  let y = 54;

  y = addSectionTitle(doc, "INPUT PARAMETERS", y, BRAND_AMBER);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(`Investment Amount: ${sym}${data.amount.toLocaleString("en-IN")}`, 14, y); y += 6;
  doc.text(`Expected Annual Return (CAGR): ${data.returnRate}%   Time Period: ${data.years} Years`, 14, y); y += 6;
  doc.text("Formula: FV = PV x (1 + r/100)^n", 14, y); y += 6;
  if (data.inflationRate) { doc.text(`Inflation Adjustment: ${data.inflationRate}%`, 14, y); y += 6; }
  y += 4;

  const stats: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Principal",       value: sanitizePdfText(formatCurrency(data.principal, true)) },
    { label: "Est. Returns",    value: sanitizePdfText(formatCurrency(data.estimatedReturns, true)) },
    { label: "Maturity Value",  value: sanitizePdfText(formatCurrency(data.maturityValue, true)), highlight: true },
    { label: "Money Multiplied",value: `${(data.maturityValue / data.principal).toFixed(2)}x` },
  ];
  y = addSummaryBox(doc, stats, BRAND_AMBER, y);
  if (data.inflationAdjustedMaturity) {
    doc.setFontSize(8);
    doc.setTextColor(...MID_GRAY);
    doc.text(sanitizePdfText(`Inflation-Adjusted Maturity: ${formatCurrency(data.inflationAdjustedMaturity, true)}`), 14, y); y += 4;
  }
  y += 6;

  y = addSectionTitle(doc, "YEAR-BY-YEAR GROWTH", y, BRAND_AMBER);

  autoTable(doc, {
    startY: y,
    head: [["Year", "Principal", "Returns Earned", "Total Value"]],
    body: data.yearlyGrowth.map(row => [
      `Year ${row.year}`,
      sanitizePdfText(formatCurrency(row.invested, true)),
      sanitizePdfText(formatCurrency(row.returns, true)),
      sanitizePdfText(formatCurrency(row.total, true)),
    ]),
    styles:            { fontSize: 8, cellPadding: 3, textColor: DARK },
    headStyles:        { fillColor: BRAND_AMBER, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles:{ fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { textColor: MID_GRAY as any },
      2: { textColor: [240, 168, 67] as any },
      3: { fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`LumpSum_Report_${sym}${data.amount}_${data.years}yr.pdf`);
}

// ── Goal Planner PDF ──────────────────────────────────────────────────────────
export interface GoalPDFData {
  targetAmount: number;
  returnRate: number;
  years: number;
  requiredMonthlySIP: number;
  totalInvested: number;
  estimatedReturns: number;
  inflationRate?: number | null;
  inflationAdjustedTarget?: number | null;
  milestones: { percent: number; month: number }[];
  currencySymbol: string;
  formatCurrency: (v: number, compact?: boolean) => string;
  formatMonths: (m: number) => string;
}

export async function exportGoalPDF(data: GoalPDFData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { formatCurrency } = data;
  const effectiveTarget = data.inflationAdjustedTarget ?? data.targetAmount;

  await addPageHeader(doc, "Goal-Based SIP Planner Report", "Reverse calculator - find required monthly SIP for your goal", BRAND_ORANGE);

  let y = 54;

  y = addSectionTitle(doc, "GOAL PARAMETERS", y, BRAND_ORANGE);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(sanitizePdfText(`Target Amount: ${formatCurrency(data.targetAmount, true)}`), 14, y); y += 6;
  if (data.inflationAdjustedTarget) {
    doc.text(sanitizePdfText(`Inflation-Adjusted Target: ${formatCurrency(data.inflationAdjustedTarget, true)} (at ${data.inflationRate}% p.a.)`), 14, y); y += 6;
  }
  doc.text(`Expected Annual Return: ${data.returnRate}%   Time to Goal: ${data.years} Years`, 14, y); y += 6;
  y += 4;

  const stats: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Required Monthly SIP", value: sanitizePdfText(formatCurrency(data.requiredMonthlySIP)), highlight: true },
    { label: "Total You Invest",     value: sanitizePdfText(formatCurrency(data.totalInvested, true)) },
    { label: "Market Returns",       value: sanitizePdfText(formatCurrency(data.estimatedReturns, true)) },
    { label: "Goal Amount",          value: sanitizePdfText(formatCurrency(effectiveTarget, true)) },
  ];
  y = addSummaryBox(doc, stats, BRAND_ORANGE, y);
  y += 6;

  if (data.milestones.length > 0) {
    y = addSectionTitle(doc, "GOAL MILESTONES", y, BRAND_ORANGE);
    autoTable(doc, {
      startY: y,
      head: [["Milestone", "Time to Reach", "Amount"]],
      body: [25, 50, 75, 100].map(pct => {
        const m = data.milestones.find(ms => ms.percent === pct);
        return [
          `${pct}% of Goal`,
          m ? data.formatMonths(m.month) : "-",
          sanitizePdfText(formatCurrency((effectiveTarget * pct) / 100, true)),
        ];
      }),
      styles:            { fontSize: 8.5, cellPadding: 3.5, textColor: DARK },
      headStyles:        { fillColor: BRAND_ORANGE, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
      alternateRowStyles:{ fillColor: LIGHT_GRAY },
      columnStyles: { 0: { fontStyle: "bold" } },
      margin: { left: 14, right: 14 },
    });
  }

  addFooter(doc);
  doc.save(`Goal_SIP_Plan_${data.years}yr.pdf`);
}

// ── SWP PDF ───────────────────────────────────────────────────────────────────
export interface SWPPDFData {
  corpus: number;
  withdrawal: number;
  returnRate: number;
  years: number;
  totalWithdrawn: number;
  remainingCorpus: number;
  corpusExhaustedMonth: number | null;
  monthlyBreakdown: { year: number; month: number; closingBalance: number }[];
  currencySymbol: string;
  formatCurrency: (v: number, compact?: boolean) => string;
  formatMonths: (m: number) => string;
}

export async function exportSWPPDF(data: SWPPDFData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { formatCurrency, currencySymbol } = data;
  const sym = sanitizePdfText(currencySymbol);
  const isExhausted = data.corpusExhaustedMonth !== null;

  await addPageHeader(doc, "SWP Calculator Report", "Systematic Withdrawal Plan - Post-retirement income planner", BRAND_INDIGO);

  let y = 54;

  y = addSectionTitle(doc, "WITHDRAWAL PARAMETERS", y, BRAND_INDIGO);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(`Total Corpus: ${sym}${data.corpus.toLocaleString("en-IN")}`, 14, y); y += 6;
  doc.text(`Monthly Withdrawal: ${sym}${data.withdrawal.toLocaleString("en-IN")}   Expected Return: ${data.returnRate}%   Period: ${data.years} years`, 14, y); y += 6;
  const monthlyReturn = (data.corpus * data.returnRate) / 12 / 100;
  doc.text(sanitizePdfText(`Monthly Return on Corpus: ${formatCurrency(monthlyReturn, true)}   Net Monthly Drawdown: ${formatCurrency(Math.max(0, data.withdrawal - monthlyReturn), true)}`), 14, y); y += 6;
  y += 4;

  // Status banner — use only ASCII characters in status text
  doc.setFillColor(isExhausted ? 254 : 240, isExhausted ? 226 : 253, isExhausted ? 226 : 244);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 14, 2, 2, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(isExhausted ? 185 : 22, isExhausted ? 28 : 163, isExhausted ? 28 : 74);
  const statusText = isExhausted
    ? `[!] Corpus will be exhausted in ${data.formatMonths(data.corpusExhaustedMonth!)}`
    : `[OK] Corpus survives the full ${data.years}-year period`;
  doc.text(statusText, doc.internal.pageSize.getWidth() / 2, y + 9, { align: "center" });
  y += 20;

  const stats: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Initial Corpus",  value: sanitizePdfText(formatCurrency(data.corpus, true)) },
    { label: "Total Withdrawn", value: sanitizePdfText(formatCurrency(data.totalWithdrawn, true)) },
    {
      label: "Remaining",
      value: isExhausted ? `${sym}0` : sanitizePdfText(formatCurrency(data.remainingCorpus, true)),
      highlight: !isExhausted,
    },
    {
      label: isExhausted ? "Corpus Lasts" : "Full Period",
      value: isExhausted ? data.formatMonths(data.corpusExhaustedMonth!) : `${data.years} years`,
    },
  ];
  y = addSummaryBox(doc, stats, BRAND_INDIGO, y);
  y += 6;

  // Build yearly snapshot from monthly data
  const byYear = new Map<number, number>();
  for (const m of data.monthlyBreakdown) {
    byYear.set(m.year, m.closingBalance);
  }
  const yearlyRows: [string, string][] = [];
  for (let yr = 1; yr <= data.years; yr++) {
    const val = byYear.get(yr);
    yearlyRows.push([
      `Year ${yr}`,
      val !== undefined
        ? sanitizePdfText(formatCurrency(Math.max(0, val), true))
        : `${sym}0`,
    ]);
  }

  y = addSectionTitle(doc, "CORPUS BALANCE - YEAR-END SNAPSHOT", y, BRAND_INDIGO);

  autoTable(doc, {
    startY: y,
    head: [["Year", "Corpus Balance at Year-End"]],
    body: yearlyRows,
    styles:            { fontSize: 8.5, cellPadding: 3.5, textColor: DARK },
    headStyles:        { fillColor: BRAND_INDIGO, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    alternateRowStyles:{ fillColor: LIGHT_GRAY },
    columnStyles: { 0: { fontStyle: "bold" }, 1: { textColor: BRAND_INDIGO as any } },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`SWP_Report_${data.years}yr_${data.returnRate}pct.pdf`);
}
