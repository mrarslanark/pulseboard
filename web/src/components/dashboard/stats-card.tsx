import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "error" | "success";
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
}: Props) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        <Icon
          className={cn(
            "w-4 h-4",
            variant === "error" && "text-red-400",
            variant === "success" && "text-emerald-400",
            variant === "default" && "text-slate-400",
          )}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {trend && <p className="text-xs text-slate-500 mt-1">{trend}</p>}
      </CardContent>
    </Card>
  );
}
