"use client"

import { format, isBefore, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import type { Booking } from "@/hooks/useBookings"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, User, DollarSign, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface BookingSummaryProps {
  booking: Booking
  onDelete: (id: string) => void
}

const getReservedDates = (dateFrom: Date, dateTo: Date): Date[] => {
  const dates: Date[] = []
  for (let date = new Date(dateFrom); date <= dateTo; date.setDate(date.getDate() + 1)) {
    dates.push(new Date(date))
  }
  return dates
}

export function BookingSummary({ booking, onDelete }: BookingSummaryProps) {
  const today = new Date()

  // Check if the booking has already passed
  if (booking.dateTo && isBefore(new Date(booking.dateTo), today)) {
    return null // Don't render anything if the booking has passed
  }

  // Generate a consistent ID for the booking if it doesn't have one
  const bookingId = booking.id || `temp-${booking.cabinId}-${booking.dateFrom?.getTime()}-${booking.tenantName}`

  // Calculate stay duration
  const stayDuration =
    booking.dateFrom && booking.dateTo ? differenceInDays(new Date(booking.dateTo), new Date(booking.dateFrom)) + 1 : 0

  return (
    <Card className="w-full max-w-md overflow-hidden border border-primary/10 bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{booking.cabinId}</h3>
          <Badge variant="outline" className="font-normal rounded-full">
            {stayDuration} {stayDuration === 1 ? "día" : "días"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-0">
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{booking.tenantName}</span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm">
                {booking.dateFrom ? format(new Date(booking.dateFrom), "dd MMM", { locale: es }) : "N/A"} -{" "}
                {booking.dateTo ? format(new Date(booking.dateTo), "dd MMM yyyy", { locale: es }) : "N/A"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{formatCurrency(booking.payment)}</span>
          </div>
        </div>

        <div className="mt-4">
          <Calendar
            mode="single"
            modifiers={{
              reserved:
                booking.dateFrom && booking.dateTo
                  ? getReservedDates(new Date(booking.dateFrom), new Date(booking.dateTo))
                  : [],
            }}
            modifiersClassNames={{
              reserved:
                "bg-gradient-to-r from-primary/80 to-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            }}
            className="rounded-md border"
            disabled
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive rounded-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro de eliminar esta reserva?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la reserva de {booking.tenantName} para
                la cabaña {booking.cabinId}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-full"
                onClick={() => {
                  console.log("Delete button clicked for booking:", bookingId)
                  onDelete(bookingId)
                }}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}

