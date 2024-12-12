import React, { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { useBookings } from '@/hooks/useBookings'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const CabinCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedCabin, setSelectedCabin] = useState('all')
  const { bookings, isLoading, error } = useBookings()

  if (isLoading) return <div>Cargando reservas...</div>

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      booking.dateFrom && booking.dateTo &&
      date >= new Date(booking.dateFrom) &&
      date <= new Date(booking.dateTo) &&
      (selectedCabin === 'all' || booking.cabinId === selectedCabin)
    )
  }



  const nextMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1))
  }

  const uniqueCabinIds = Array.from(new Set(bookings.map(booking => booking.cabinId)))

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={prevMonth} variant="outline" size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <Button onClick={nextMonth} variant="outline" size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="mb-4">
        <Select onValueChange={setSelectedCabin} defaultValue={selectedCabin}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar cabaña" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las cabañas</SelectItem>
            {uniqueCabinIds.map((cabinId) => (
              <SelectItem key={cabinId} value={cabinId}>
                Cabaña {cabinId}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-center font-bold">
            {day}
          </div>
        ))}
        {monthDays.map(day => {
          const dayBookings = getBookingsForDate(day)
          const isBooked = dayBookings.length > 0
          return (
            <Popover key={day.toString()}>
              <PopoverTrigger asChild>
                <button
                  className={`p-2 w-full h-full border rounded-md ${
                    isBooked ? 'bg-red-200 hover:bg-red-300' : 'hover:bg-gray-100'
                  } ${!isSameMonth(day, currentMonth) ? 'text-gray-400' : ''}`}
                >
                  {format(day, 'd')}
                </button>
              </PopoverTrigger>
              {isBooked && (
                <PopoverContent className="w-64 p-2">
                  <h3 className="font-bold mb-2">
                    Reservas para el {format(day, 'dd/MM/yyyy')}
                  </h3>
                  {dayBookings.map((booking, index) => (
                    <div key={index} className="text-sm mb-1">
                      <span className="font-medium">Cabaña {booking.cabinId}:</span>{" "}
                      {booking.tenantName}
                    </div>
                  ))}
                </PopoverContent>
              )}
            </Popover>
          )
        })}
      </div>
    </div>
  )
}

