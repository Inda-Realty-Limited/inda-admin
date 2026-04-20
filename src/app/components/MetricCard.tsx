import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: string;
    isPositive: boolean;
  };
}

export function MetricCard({ label, value, delta }: MetricCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[10px] px-6 py-5">
      <div className="text-xs font-medium uppercase tracking-wider text-[#6B7280] mb-3">
        {label}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-[32px] font-semibold text-[#0D1117] leading-none">{value}</div>
        {delta && (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              delta.isPositive
                ? 'bg-[#10B981]/10 text-[#10B981]'
                : 'bg-[#EF4444]/10 text-[#EF4444]'
            }`}
          >
            {delta.isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span>{delta.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
