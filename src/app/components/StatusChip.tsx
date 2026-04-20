interface StatusChipProps {
  status:
    | 'active'
    | 'pending'
    | 'rejected'
    | 'suspended'
    | 'completed'
    | 'in-progress'
    | 'high'
    | 'medium'
    | 'low'
    | 'approved';
  children: React.ReactNode;
}

const statusStyles: Record<StatusChipProps['status'], string> = {
  active: 'bg-[#10B981]/10 text-[#10B981]',
  approved: 'bg-[#ECFDF5] text-[#10B981]',
  pending: 'bg-[#FFFBEB] text-[#F59E0B]',
  rejected: 'bg-[#FEF2F2] text-[#EF4444]',
  suspended: 'bg-[#F3F4F6] text-[#9CA3AF]',
  completed: 'bg-[#EEF2FF] text-[#6366F1]',
  'in-progress': 'bg-[#FFFBEB] text-[#F59E0B]',
  high: 'bg-[#FEE2E2] text-[#B91C1C]',
  medium: 'bg-[#FEF3C7] text-[#92400E]',
  low: 'bg-[#F3F4F6] text-[#6B7280]',
};

export function StatusChip({ status, children }: StatusChipProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {children}
    </span>
  );
}
