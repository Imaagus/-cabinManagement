'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useBookings, Booking } from '../hooks/useBookings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { CabinCalendar } from './calendar-component'
import { BookingForm } from './bookings'
import { BookingSummary } from './booking-summary'


const cabinNames = ["Orquideas 1", "Orquideas 2", "Orquideas 3", "Capri 1", "Capri 2","Capri 3",  ]


export default function CabinManagement() {
  const { bookings, isLoading, error, addBooking, isDateBooked } = useBookings()

  const handleSubmit = async (booking: {
    cabinId: string
    tenantName: string
    dateFrom: Date
    dateTo: Date
    payment: number
  }) => {
    try {
      console.log('Submitting booking:', booking)
      await addBooking(booking)
      toast({
        title: "Reserva exitosa",
        description: "Su reserva ha sido agregada con éxito.",
      })
    } catch (error) {
      console.error('Error adding booking:', error)
      toast({
        title: "Error en la reserva",
        description: error instanceof Error ? error.message : "Ocurrió un error al hacer la reserva.",
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
              <BookingForm cabinNames={cabinNames} onSubmit={handleSubmit} isDateBooked={isDateBooked} />
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
            <div className="flex gap-4 justify-center flex-wrap">
                {bookings.map((booking: Booking) => (
                  <BookingSummary key={booking.id} booking={booking} />
                ))}
            </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

