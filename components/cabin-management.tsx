'use client'

import { useState } from 'react'

import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useBookings, Booking } from '../hooks/useBookings'
import { DateRange } from 'react-day-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { CabinCalendar } from './calendar-component'


const cabinNames = ["Orquideas 1", "Orquideas 2", "Orquideas 3", "Capri 1", "Capri 2","Capri 3",  ]


export default function CabinManagement() {
  const { bookings, isLoading, error, addBooking, getTotalRevenue, getBookingInfo, isDateBooked } = useBookings()
  const [selectedCabin, setSelectedCabin] = useState('1')
  const [selectedCalendarCabin, setSelectedCalendarCabin] = useState('1')
  const [tenantName, setTenantName] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [payment, setPayment] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (dateRange?.from && dateRange?.to && selectedCabin && tenantName && payment) {
      try {
        console.log('Submitting booking:', {
          cabinId: selectedCabin,
          tenantName,
          dateFrom: dateRange.from,
          dateTo: dateRange.to,
          payment: parseFloat(payment)
        })
        await addBooking({
          cabinId: selectedCabin,
          tenantName,
          dateFrom: dateRange.from,
          dateTo: dateRange.to,
          payment: parseFloat(payment)
        })
        toast({
          title: "Reserva exitosa",
          description: "Su reserva ha sido agregada con éxito.",
        })
        // Reset form
        setSelectedCabin('')
        setTenantName('')
        setDateRange(undefined)
        setPayment('')
      } catch (error) {
        console.error('Error adding booking:', error)
        toast({
          title: "Error en la reserva",
          description: error instanceof Error ? error.message : "Ocurrió un error al hacer la reserva.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Error en la reserva",
        description: "Por favor, complete todos los campos requeridos.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">Error: {error}</div>
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
  
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center">Gestion de cabañas</h1>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings">Nueva reserva</TabsTrigger>
          <TabsTrigger value="calendar">Disponibilidad</TabsTrigger>
          <TabsTrigger value="summary">Resumen de cabañas</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Nueva reserva</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cabin">Cabaña</Label>
                    <Select onValueChange={setSelectedCabin} value={selectedCabin}>
                      <SelectTrigger id="cabin">
                        <SelectValue placeholder="Seleccione una cabaña" />
                      </SelectTrigger>
                      <SelectContent>
                        {cabinNames.map((cabinName) => (
                          <SelectItem key={cabinName} value={cabinName}>
                            {cabinName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenantName">Nombre de inquilino</Label>
                    <Input
                      id="tenantName"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fecha de reserva</Label>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="rounded-md border"
                    disabled={(date) => isDateBooked(date, selectedCabin)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment">Pago</Label>
                  <Input
                    id="payment"
                    type="number"
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Agregar reserva</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Cabin Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <CabinCalendar />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="summary" >
          <Card className="mt-4 p-4 border rounded shadow-sm ">
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className=" flex justify-between flex-wrap">
                {bookings.map((booking: Booking) => (
                  <div key={booking.id} className="p-6 mb-4 border rounded mt-0">
                    <div>
                    <p><strong>Cabaña:</strong> {booking.cabinId}</p>
                    <p><strong>Inquilino:</strong> {booking.tenantName}</p>
                    <p>
                      <strong>Fecha de entrada:</strong> {booking.dateFrom?.toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Fecha de salida:</strong> {booking.dateTo?.toLocaleDateString()}
                    </p>
                    <p><strong>Pago:</strong> ${booking.payment}</p>
                    </div>
                    <div  >
                    <Calendar
                      mode="single"
                      modifiers={{
                        reserved: booking.dateFrom && booking.dateTo
                          ? getReservedDates(booking.dateFrom, booking.dateTo)
                          : [],
                      }}
                      modifiersClassNames={{
                        reserved: 'bg-red-500 text-white',
                      }}
                    />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

