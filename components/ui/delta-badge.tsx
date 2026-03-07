import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DeltaBadgeProps {
    value?: number;
    label?: string;
    inverse?: boolean;
}

export function DeltaBadge({ value = 0, label, inverse = false }: DeltaBadgeProps) {
    const isPositive = value >= 0;

    // For metrics where lower is better (inverse logic)
    const isGood = inverse ? !isPositive : isPositive;

    const colorClasses = isGood
        ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
        : "bg-red-500/10 text-red-500 hover:bg-red-500/20";

    return (
        <div className="flex items-center gap-2">
            <Badge
                variant="secondary"
                className={`flex items-center gap-1 font-bold whitespace-nowrap transition-colors ${colorClasses}`}
            >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>
                    {isPositive ? "+" : ""}
                    {value}%
                </span>
            </Badge>
            {label && <span className="text-[10px] uppercase font-bold text-muted-foreground">{label}</span>}
        </div>
    );
}
