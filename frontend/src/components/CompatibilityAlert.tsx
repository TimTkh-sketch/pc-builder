import { AlertTriangle, CheckCircle } from "lucide-react";

interface Props {
  issues: string[];
}

export default function CompatibilityAlert({ issues }: Props) {
  if (issues.length === 0) {
    return (
      <div className="flex items-center gap-2 bg-green-900/30 border border-green-700 rounded-lg p-3 text-green-400 text-sm">
        <CheckCircle size={16} />
        Все компоненты совместимы
      </div>
    );
  }

  return (
    <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
      <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
        <AlertTriangle size={16} />
        Проблемы совместимости ({issues.length})
      </div>
      <ul className="space-y-1">
        {issues.map((issue, i) => (
          <li key={i} className="text-sm text-red-300 flex gap-2">
            <span className="text-red-500 mt-0.5 shrink-0">•</span>
            {issue}
          </li>
        ))}
      </ul>
    </div>
  );
}
