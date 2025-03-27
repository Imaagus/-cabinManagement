"use client"

import type React from "react"

import { useState, useMemo } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
} from "date-fns"
import { es } from "date-fns/locale"
import { useBookings } from "@/hooks/useBookings"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, User, Calendar, Info, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency } from "@/lib/utils"

export const CabinCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedCabin, setSelectedCabin] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const { bookings, isLoading } = useBookings()

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get the day of week for the first day of the month (0 = Sunday, 6 = Saturday)
  const startDay = monthStart.getDay()

  // Create array for empty cells before the first day of the month
  const daysBeforeMonth = Array.from({ length: startDay }, (_, i) => {
    const day = new Date(monthStart)
    day.setDate(day.getDate() - (startDay - i))
    return day
  })

  // Create array for empty cells after the last day of the month to complete the grid
  const daysAfterMonth = []
  const lastDayOfWeek = monthEnd.getDay() // 0 = Sunday, 6 = Saturday
  if (lastDayOfWeek < 6) {
    const daysToAdd = 6 - lastDayOfWeek
    for (let i = 1; i <= daysToAdd; i++) {
      const day = new Date(monthEnd)
      day.setDate(day.getDate() + i)
      daysAfterMonth.push(day)
    }
  }

  // Combine all days for the calendar grid
  const calendarDays = [...daysBeforeMonth, ...monthDays, ...daysAfterMonth]

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(
      (booking) =>
        booking.dateFrom &&
        booking.dateTo &&
        date >= new Date(booking.dateFrom) &&
        date <= new Date(booking.dateTo) &&
        (selectedCabin === "all" || booking.cabinId === selectedCabin),
    )
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
    setSelectedDate(null)
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
    setSelectedDate(null)
  }

  const uniqueCabinIds = Array.from(new Set(bookings.map((booking) => booking.cabinId)))

  // Get bookings for the selected date
  const selectedDateBookings = useMemo(() => {
    if (!selectedDate) return []
    return getBookingsForDate(selectedDate)
  }, [selectedDate, bookings, selectedCabin])

  // Mock cabin names for demonstration purposes
  const cabinNames = ["Cabaña A", "Cabaña B", "Cabaña C", "Cabaña D", "Cabaña E"]

  if (isLoading)
    return (
      <div className="flex justify-center items-center p-12">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Cargando reservas...</p>
        </div>
      </div>
    )

  return (
    <div className="grid md:grid-cols-[1fr_300px] gap-6">
      <Card className="border border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={prevMonth}
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-primary/20 bg-background"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-medium capitalize">{format(currentMonth, "MMMM yyyy", { locale: es })}</h2>
              <Button
                onClick={nextMonth}
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-primary/20 bg-background"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Select onValueChange={setSelectedCabin} defaultValue={selectedCabin}>
              <SelectTrigger className="w-[200px] rounded-full border-primary/20 bg-background">
                <SelectValue placeholder="Seleccionar cabaña" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las cabañas</SelectItem>
                {uniqueCabinIds.map((cabinId) => (
                  <SelectItem key={cabinId} value={cabinId}>
                    {cabinId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div key={day} className="text-center font-medium text-xs sm:text-sm p-2">
                {day}
              </div>
            ))}

            {calendarDays.map((day, index) => {
              const dayBookings = getBookingsForDate(day)
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isTodayDate = isToday(day)
              const isBooked = dayBookings.length > 0

              // Calculate how many cabins are booked for this day
              const bookedCabinsCount = isBooked ? new Set(dayBookings.map((b) => b.cabinId)).size : 0
              const availableCabinsCount = cabinNames.length - bookedCabinsCount

              return (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSelectedDate(day)}
                        className={`
                          relative h-14 w-full rounded-md flex flex-col items-center justify-center transition-all
                          ${isCurrentMonth ? "" : "opacity-40"}
                          ${isSelected ? "ring-2 ring-primary" : ""}
                          ${isBooked ? "bg-primary/10 hover:bg-primary/20" : "hover:bg-muted"}
                          ${isTodayDate ? "border border-primary" : ""}
                        `}
                      >
                        <span className={`text-sm ${isSelected ? "font-bold" : ""}`}>{format(day, "d")}</span>

                        {isBooked && (
                          <div className="flex gap-0.5 mt-1">
                            {Array.from({ length: Math.min(3, bookedCabinsCount) }).map((_, i) => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            ))}
                            {bookedCabinsCount > 3 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary relative">
                                <span className="absolute -right-1 -top-1 text-[8px] font-bold">+</span>
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="p-0 overflow-hidden">
                      <div className="bg-primary/10 p-2 text-xs font-medium">
                        {format(day, "EEEE, d 'de' MMMM", { locale: es })}
                      </div>
                      <div className="p-2 text-xs">
                        {isBooked ? (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{bookedCabinsCount}</span> cabañas ocupadas
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Check className="h-3 w-3 text-green-500" />
                            Todas las cabañas disponibles
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>

          <div className="flex items-center justify-center mt-6 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/10"></div>
              <span>Reservado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-primary"></div>
              <span>Hoy</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar with selected date details */}
      <Card className="border border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden h-fit">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-base">
            {selectedDate ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: es }) : "Seleccione una fecha"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            selectedDateBookings.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {selectedDateBookings.map((booking, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-0">
                          {booking.cabinId}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {booking.dateFrom && booking.dateTo
                            ? `${format(new Date(booking.dateFrom), "dd/MM")} - ${format(new Date(booking.dateTo), "dd/MM")}`
                            : "Fechas no disponibles"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{booking.tenantName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{formatCurrency(booking.payment)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-lg font-medium mb-1">Día Disponible</h3>
                <p className="text-muted-foreground text-sm">No hay reservas para esta fecha</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">Seleccione una fecha</h3>
              <p className="text-muted-foreground text-sm">Haga clic en una fecha para ver detalles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

