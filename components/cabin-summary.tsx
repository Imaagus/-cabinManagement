import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Booking } from "@/hooks/useBookings"
import { startOfMonth, endOfMonth, isWithinInterval, differenceInDays, subMonths } from "date-fns"
import { CabinCard } from "./cabin-card"
import { StatsCard } from "./stats-card"
import { formatCurrency } from "@/lib/utils"

interface CabinSummaryProps {
  cabinNames: string[]
  bookings: Booking[]
}

export function CabinSummary({ cabinNames, bookings }: CabinSummaryProps) {
  const currentMonth = new Date()
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  // Previous month for comparison
  const prevMonth = subMonths(currentMonth, 1)
  const prevMonthStart = startOfMonth(prevMonth)
  const prevMonthEnd = endOfMonth(prevMonth)

  // Calculate days in current month
  const daysInMonth = differenceInDays(monthEnd, monthStart) + 1

  // Current month bookings
  const currentMonthBookings = bookings.filter(
    (booking) => booking.dateFrom && isWithinInterval(new Date(booking.dateFrom), { start: monthStart, end: monthEnd }),
  )

  // Previous month bookings
  const prevMonthBookings = bookings.filter(
    (booking) =>
      booking.dateFrom && isWithinInterval(new Date(booking.dateFrom), { start: prevMonthStart, end: prevMonthEnd }),
  )

  // Calculate total revenue for current month
  const totalRevenue = currentMonthBookings.reduce((sum, booking) => sum + (booking.payment || 0), 0)

  // Calculate total revenue for previous month
  const prevTotalRevenue = prevMonthBookings.reduce((sum, booking) => sum + (booking.payment || 0), 0)

  // Calculate revenue change percentage
  const revenueChange =
    prevTotalRevenue === 0 ? 100 : Math.round(((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100)

  // Calculate total bookings
  const totalBookings = currentMonthBookings.length

  // Calculate average booking value
  const avgBookingValue = totalBookings === 0 ? 0 : totalRevenue / totalBookings

  // Calculate occupancy rate across all cabins
  const totalPossibleDays = cabinNames.length * daysInMonth
  const totalBookedDays = currentMonthBookings.reduce((sum, booking) => {
    if (!booking.dateFrom || !booking.dateTo) return sum

    const from = new Date(booking.dateFrom) < monthStart ? monthStart : new Date(booking.dateFrom)
    const to = new Date(booking.dateTo) > monthEnd ? monthEnd : new Date(booking.dateTo)

    return sum + differenceInDays(to, from) + 1
  }, 0)

  const occupancyRate = Math.round((totalBookedDays / totalPossibleDays) * 100)

  const cabinTotals = cabinNames.map((cabinName) => {
    const cabinBookings = bookings.filter(
      (booking) =>
        booking.cabinId === cabinName &&
        booking.dateFrom &&
        isWithinInterval(new Date(booking.dateFrom), { start: monthStart, end: monthEnd }),
    )

    const totalGenerated = cabinBookings.reduce((sum, booking) => sum + (booking.payment || 0), 0)

    // Calculate occupancy rate
    const totalBookedDays = cabinBookings.reduce((sum, booking) => {
      if (!booking.dateFrom || !booking.dateTo) return sum

      const from = new Date(booking.dateFrom) < monthStart ? monthStart : new Date(booking.dateFrom)
      const to = new Date(booking.dateTo) > monthEnd ? monthEnd : new Date(booking.dateTo)

      return sum + differenceInDays(to, from) + 1
    }, 0)

    const occupancyRate = Math.round((totalBookedDays / daysInMonth) * 100)

    return {
      cabinName,
      totalGenerated,
      bookingsCount: cabinBookings.length,
      occupancyRate,
    }
  })

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Ingresos Totales" value={formatCurrency(totalRevenue)} icon="chart" change={revenueChange} />
        <StatsCard title="Reservas" value={totalBookings} description="Reservas este mes" icon="calendar" />
        <StatsCard
          title="Valor Promedio"
          value={formatCurrency(Math.round(avgBookingValue))}
          description="Por reserva"
          icon="trend"
        />
        <StatsCard
          title="Tasa de Ocupación"
          value={`${occupancyRate}%`}
          description="De todas las cabañas"
          icon="users"
        />
      </div>

      <Card className="border border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle>Resumen de Cabañas - Mes Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cabinTotals.map(({ cabinName, totalGenerated, bookingsCount, occupancyRate }) => (
              <CabinCard
                key={cabinName}
                name={cabinName}
                totalGenerated={totalGenerated}
                bookingsCount={bookingsCount}
                occupancyRate={occupancyRate}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

