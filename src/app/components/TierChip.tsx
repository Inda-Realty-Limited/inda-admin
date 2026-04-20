interface TierChipProps {
  tier: 'starter' | 'growth' | 'elite' | 'partner';
}

const tierStyles: Record<TierChipProps['tier'], string> = {
  starter: 'bg-[#E8F4F3] text-[#2E7A75]',
  growth: 'bg-[#EEF2FF] text-[#4F46E5]',
  elite: 'bg-[#FEF3C7] text-[#B45309]',
  partner: 'bg-[#0D1117] text-[#FFFFFF]',
};

const tierLabels: Record<TierChipProps['tier'], string> = {
  starter: 'Starter',
  growth: 'Growth',
  elite: 'Elite',
  partner: 'Partner',
};

export function TierChip({ tier }: TierChipProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tierStyles[tier]}`}
    >
      {tierLabels[tier]}
    </span>
  );
}
