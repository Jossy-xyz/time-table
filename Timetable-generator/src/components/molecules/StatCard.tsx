import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../atoms/Card";
import { cn } from "../../lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
  onClick,
}) => {
  return (
    <Card
      className={cn(
        "group cursor-pointer hover:border-gold/50 hover:translate-y-[-2px] transition-all",
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-institutional-muted">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-brick/10 flex items-center justify-center text-brick group-hover:bg-gold group-hover:text-brick-deep transition-colors">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-institutional-primary">
          {value}
        </div>
        {trend && (
          <p className="text-[10px] uppercase tracking-widest mt-1 text-institutional-muted">
            <span
              className={cn(
                "font-bold",
                trend.value > 0 ? "text-status-success" : "text-status-error",
              )}
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>{" "}
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
