import { Card } from "antd";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  classNameDescription?: string;
}

export const StatCard = ({ title,
  value,
  icon,
  description,
  className,
  children,
  classNameDescription }: StatCardProps) => {
  return (
    <Card className={`p-4 rounded-lg shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
          {description && <p className={`text-sm ${classNameDescription || ''}`}>{description}</p>}
        </div>
        <div className="text-4xl">
          {icon}
        </div>
      </div>
      {children}
    </Card>
  );
}   