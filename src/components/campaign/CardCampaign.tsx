import type { ReactNode } from "react";
import { Card } from "antd";

export interface CardCampaignProps {
  /** Small label above the value, e.g. "Tổng chiến dịch" */
  title: ReactNode;
  /** Big highlighted value, e.g. "22", "53Bđ", "73%" */
  value: ReactNode;
  /** Muted helper text below the value */
  description?: ReactNode;
  /** Tailwind text-color class for the value, e.g. "text-green-600" */
  valueClassName?: string;
  /** Optional icon / element rendered on the right side of the title row */
  extra?: ReactNode;
  className?: string;
}

export function CardCampaign({
  title,
  value,
  description,
  valueClassName = "text-gray-800",
  extra,
  className = "",
}: CardCampaignProps) {
  return (
    <Card
      size="small"
      className={`flex-1 min-w-[220px] rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg [&_.ant-card-body]:p-5 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold tracking-wide text-gray-500">
          {title}
        </span>
        {extra}
      </div>

      <div className={`mt-1.5 text-[28px] font-bold leading-tight ${valueClassName}`}>
        {value}
      </div>

      {description && (
        <div className="mt-2 text-xs leading-relaxed text-gray-400">
          {description}
        </div>
      )}
    </Card>
  );
}

export default CardCampaign;
