import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface CabinCardProps {
  name: string
  totalGenerated: number
  bookingsCount: number
  occupancyRate: number
}

export function CabinCard({ name, totalGenerated, bookingsCount, occupancyRate }: CabinCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border border-primary/10 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{name}</CardTitle>
          <Badge
            variant={occupancyRate > 70 ? "default" : occupancyRate > 30 ? "secondary" : "outline"}
            className="rounded-full"
          >
            {occupancyRate}% Ocupación
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{formatCurrency(totalGenerated)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{bookingsCount} reservas</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 pt-2">
        <div className="w-full bg-secondary rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-primary/70 to-primary h-1.5 rounded-full"
            style={{ width: `${occupancyRate}%` }}
          ></div>
        </div>
      </CardFooter>
    </Card>
  )
}

