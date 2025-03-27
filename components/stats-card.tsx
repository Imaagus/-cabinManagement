import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: "chart" | "trend" | "users" | "calendar"
  change?: number
}

export function StatsCard({ title, value, description, icon, change }: StatsCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "chart":
        return <BarChart3 className="h-4 w-4" />
      case "trend":
        return <TrendingUp className="h-4 w-4" />
      case "users":
        return <Users className="h-4 w-4" />
      case "calendar":
        return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <Card className="border border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {getIcon()}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {change !== undefined && (
          <div className={`flex items-center mt-2 text-xs ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
            {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
            <span className="text-muted-foreground ml-1">desde el mes pasado</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

