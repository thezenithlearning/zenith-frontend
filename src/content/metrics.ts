export interface Metric {
  /** Number to count up to; omit to show `text` instead. */
  value?: number;
  prefix?: string;
  suffix?: string;
  /** Shown as-is when there is no numeric value. */
  text?: string;
  label: string;
  note: string;
}

// Only facts already stated on the site. Add real figures here (students mentored,
// average score improvement, ...) once they can be backed up.
export const METRICS: Metric[] = [
  { text: "1:1", label: "Personalised guidance", note: "Every plan starts with a diagnostic" },
  { value: 7, suffix: "+", label: "Years teaching expertise", note: "Across international curricula" },
  { value: 6, suffix: "+", label: "Curriculum pathways", note: "IB, IGCSE, A Level, SAT, AP, JEE/NEET" },
  { value: 4, label: "Core programmes", note: "From school boards to college entry" },
  { value: 3, label: "Step Zenith Method", note: "Diagnose · Build · Apply" },
  { text: "Global", label: "Online and worldwide", note: "Live classes with progress tracking" },
];
