"use client"

import { useState } from "react"
import { useBookings, type Booking } from "@/hooks/useBookings"
import { toast } from "@/hooks/use-toast"
import { CabinCalendar } from "./calendar-component"
import { BookingForm } from "./bookings"
import { BookingList } from "./booking-list"
import { CabinSummary } from "./cabin-summary"
import { Header } from "./header"
import { SuccessModal } from "./success-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Home, BarChart2 } from "lucide-react"

const cabinNames = ["Orquideas 1", "Orquideas 2", "Orquideas 3", "Capri 1", "Capri 2", "Capri 3"]

export default function CabinManagement() {
  const { bookings, isLoading, error, addBooking, deleteBooking, isDateBooked } = useBookings()
  const [activeTab, setActiveTab] = useState("bookings")
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [lastBookingData, setLastBookingData] = useState<Omit<Booking, "id"> | null>(null)

  const handleSubmit = async (booking: Omit<Booking, "id">) => {
    try {
      await addBooking(booking)

      // Save booking data for the success modal
      setLastBookingData(booking)

      // Show success modal
      setSuccessModalOpen(true)

      toast({
        title: "Reserva exitosa",
        description: "Su reserva ha sido agregada con éxito.",
      })
    } catch (error) {
      console.error("Error adding booking:", error)
      toast({
        title: "Error en la reserva",
        description: error instanceof Error ? error.message : "Ocurrió un error al hacer la reserva.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    console.log("Attempting to delete booking with id:", id)
    try {
      await deleteBooking(id)
      console.log("Booking deleted successfully")
      toast({
        title: "Reserva eliminada",
        description: "La reserva ha sido eliminada con éxito.",
      })
    } catch (error) {
      console.error("Error deleting booking:", error)
      toast({
        title: "Error al eliminar la reserva",
        description: error instanceof Error ? error.message : "Ocurrió un error al eliminar la reserva.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Cargando sistema de reservas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-full max-w-md border border-destructive/20">
          <CardHeader className="bg-destructive/5">
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>No se pudo cargar el sistema de reservas</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="space-y-8">
          {/* Mobile Tabs */}
          <div className="md:hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 p-1 rounded-full bg-muted/50">
                <TabsTrigger value="bookings" className="rounded-full flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">Reservas</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="rounded-full flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">Disponibilidad</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="rounded-full flex items-center gap-1">
                  <BarChart2 className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">Resumen</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {activeTab === "bookings" && (
            <div>
              <Card className="border border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle>Nueva Reserva</CardTitle>
                  <CardDescription>Complete el formulario para crear una nueva reserva</CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingForm cabinNames={cabinNames} onSubmit={handleSubmit} isDateBooked={isDateBooked} />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "calendar" && (
            <div>
              <CabinCalendar />
            </div>
          )}

          {activeTab === "summary" && (
            <div className="space-y-8">
              <Card className="border border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle>Reservas</CardTitle>
                  <CardDescription>Gestione todas sus reservas</CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingList bookings={bookings} cabinNames={cabinNames} onDelete={handleDelete} />
                </CardContent>
              </Card>

              <CabinSummary cabinNames={cabinNames} bookings={bookings} />
            </div>
          )}
        </div>
      </main>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        bookingData={lastBookingData}
      />
    </div>
  )
}

