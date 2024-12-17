import React from 'react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Booking } from '../hooks/useBookings'

interface BookingSummaryProps {
  booking: Booking
}

const getReservedDates = (dateFrom: Date, dateTo: Date): Date[] => {
  const dates: Date[] = [];
  for (
    let date = new Date(dateFrom);
    date <= dateTo;
    date.setDate(date.getDate() + 1)
  ) {
    dates.push(new Date(date)); 
  }
  return dates;
};

export function BookingSummary({ booking }: BookingSummaryProps) {
  return (
    <div className="p-6 mb-4 border rounded mt-0">
      <div>
        <p><strong>Cabaña:</strong> {booking.cabinId}</p>
        <p><strong>Inquilino:</strong> {booking.tenantName}</p>
        <p><strong>Fecha de entrada:</strong> {booking.dateFrom ? format(new Date(booking.dateFrom), 'dd/MM/yyyy') : 'N/A'}</p>
        <p><strong>Fecha de salida:</strong> {booking.dateTo ? format(new Date(booking.dateTo), 'dd/MM/yyyy') : 'N/A'}</p>        
        <p><strong>Pago:</strong> ${booking.payment}</p>
      </div>
      <div>
        <Calendar
          mode="single"
          modifiers={{
            reserved: booking.dateFrom && booking.dateTo
              ? getReservedDates(new Date(booking.dateFrom), new Date(booking.dateTo))
              : [],
          }}
          modifiersClassNames={{
            reserved: 'bg-red-500 text-white',
          }}
        />
      </div>
    </div>
  )
}

