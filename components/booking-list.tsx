"use client"

import { useState, useMemo } from "react"
import { format, isAfter, isBefore } from "date-fns"
import { es } from "date-fns/locale"
import { Search, Filter, Calendar, User, DollarSign, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { formatCurrency } from "@/lib/utils"
import type { Booking } from "@/hooks/useBookings"

interface BookingListProps {
  bookings: Booking[]
  cabinNames: string[]
  onDelete: (id: string) => Promise<void>
}

export function BookingList({ bookings, cabinNames, onDelete }: BookingListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCabin, setFilterCabin] = useState("all")
  const [sortBy, setSortBy] = useState<"date" | "cabin" | "tenant" | "payment">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [activeTab, setActiveTab] = useState<"active" | "upcoming" | "all">("active")

  // Filter bookings based on search term, cabin filter, and active tab
  const filteredBookings = useMemo(() => {
    const today = new Date()

    return bookings.filter((booking) => {
      // Filter by search term (tenant name or cabin id)
      const matchesSearch =
        booking.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.cabinId.toLowerCase().includes(searchTerm.toLowerCase())

      // Filter by cabin
      const matchesCabin = filterCabin === "all" || booking.cabinId === filterCabin

      // Filter by tab
      let matchesTab = true
      if (activeTab === "active") {
        // Check if booking is currently active
        matchesTab =
          booking.dateFrom != null &&
          booking.dateTo != null &&
          !isAfter(today, new Date(booking.dateTo)) &&
          !isBefore(today, new Date(booking.dateFrom))
      } else if (activeTab === "upcoming") {
        // Check if booking is in the future
        matchesTab = booking.dateFrom != null && isBefore(today, new Date(booking.dateFrom))
      }

      return matchesSearch && matchesCabin && matchesTab
    })
  }, [bookings, searchTerm, filterCabin, activeTab])

  // Sort filtered bookings
  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "date":
          if (a.dateFrom && b.dateFrom) {
            comparison = new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime()
          } else if (a.dateFrom) {
            comparison = -1 // a has date, b doesn't
          } else if (b.dateFrom) {
            comparison = 1 // b has date, a doesn't
          }
          break
        case "cabin":
          comparison = a.cabinId.localeCompare(b.cabinId)
          break
        case "tenant":
          comparison = a.tenantName.localeCompare(b.tenantName)
          break
        case "payment":
          comparison = a.payment - b.payment
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filteredBookings, sortBy, sortDirection])

  // Toggle sort direction when clicking the same sort option
  const handleSortChange = (value: "date" | "cabin" | "tenant" | "payment") => {
    if (sortBy === value) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(value)
      setSortDirection("asc")
    }
  }

  // Calculate booking status
  const getBookingStatus = (booking: Booking) => {
    const today = new Date()

    if (!booking.dateFrom || !booking.dateTo) {
      return { label: "Sin fechas", color: "bg-gray-200 text-gray-800" }
    }

    const startDate = new Date(booking.dateFrom)
    const endDate = new Date(booking.dateTo)

    if (isBefore(today, startDate)) {
      return {
        label: "Próxima",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      }
    } else if (!isAfter(today, endDate)) {
      return {
        label: "Activa",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      }
    } else {
      return {
        label: "Finalizada",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      }
    }
  }

  // Calculate days remaining or days passed
  const getDaysInfo = (booking: Booking) => {
    if (!booking.dateFrom || !booking.dateTo) return null

    const today = new Date()
    const startDate = new Date(booking.dateFrom)
    const endDate = new Date(booking.dateTo)

    if (isBefore(today, startDate)) {
      const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return {
        text: `Comienza en ${daysUntilStart} ${daysUntilStart === 1 ? "día" : "días"}`,
        color: "text-blue-600 dark:text-blue-400",
      }
    } else if (!isAfter(today, endDate)) {
      const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return {
        text: `Termina en ${daysUntilEnd} ${daysUntilEnd === 1 ? "día" : "días"}`,
        color: "text-green-600 dark:text-green-400",
      }
    } else {
      const daysSinceEnd = Math.ceil((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))
      return {
        text: `Terminó hace ${daysSinceEnd} ${daysSinceEnd === 1 ? "día" : "días"}`,
        color: "text-gray-600 dark:text-gray-400",
      }
    }
  }

  // Calculate duration of stay
  const getDuration = (booking: Booking) => {
    if (!booking.dateFrom || !booking.dateTo) return "N/A"

    const startDate = new Date(booking.dateFrom)
    const endDate = new Date(booking.dateTo)
    const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    return `${days} ${days === 1 ? "día" : "días"}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por inquilino o cabaña..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 rounded-full border-primary/20 bg-background"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 rounded-full"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={filterCabin} onValueChange={setFilterCabin}>
            <SelectTrigger className="w-[180px] h-10 rounded-full border-primary/20 bg-background">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filtrar por cabaña" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las cabañas</SelectItem>
              {cabinNames.map((cabin) => (
                <SelectItem key={cabin} value={cabin}>
                  {cabin}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 p-1 rounded-full bg-muted/50">
          <TabsTrigger value="active" className="rounded-full">
            Activas
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="rounded-full">
            Próximas
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-full">
            Todas
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {sortedBookings.length} {sortedBookings.length === 1 ? "reserva encontrada" : "reservas encontradas"}
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`text-xs ${sortBy === "date" ? "bg-muted" : ""}`}
            onClick={() => handleSortChange("date")}
          >
            Fecha {sortBy === "date" && (sortDirection === "asc" ? "↑" : "↓")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`text-xs ${sortBy === "cabin" ? "bg-muted" : ""}`}
            onClick={() => handleSortChange("cabin")}
          >
            Cabaña {sortBy === "cabin" && (sortDirection === "asc" ? "↑" : "↓")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`text-xs ${sortBy === "payment" ? "bg-muted" : ""}`}
            onClick={() => handleSortChange("payment")}
          >
            Pago {sortBy === "payment" && (sortDirection === "asc" ? "↑" : "↓")}
          </Button>
        </div>
      </div>

      {sortedBookings.length > 0 ? (
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {sortedBookings.map((booking) => {
              const status = getBookingStatus(booking)
              const daysInfo = getDaysInfo(booking)
              const duration = getDuration(booking)

              return (
                <Card
                  key={booking.id}
                  className="overflow-hidden border border-primary/10 bg-card/50 backdrop-blur-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Left side - Cabin info */}
                      <div className="sm:w-1/4 p-4 bg-gradient-to-r from-primary/5 to-transparent flex flex-col justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{booking.cabinId}</h3>
                          <Badge className={`mt-1 font-normal ${status.color}`}>{status.label}</Badge>
                        </div>

                        {daysInfo && <div className={`text-xs mt-2 ${daysInfo.color}`}>{daysInfo.text}</div>}
                      </div>

                      {/* Right side - Booking details */}
                      <div className="sm:w-3/4 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{booking.tenantName}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatCurrency(booking.payment)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {booking.dateFrom && booking.dateTo ? (
                                <>
                                  {format(new Date(booking.dateFrom), "dd MMM", { locale: es })} -{" "}
                                  {format(new Date(booking.dateTo), "dd MMM yyyy", { locale: es })}
                                  <span className="ml-1 text-muted-foreground">({duration})</span>
                                </>
                              ) : (
                                "Fechas no especificadas"
                              )}
                            </span>
                          </div>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive rounded-full mt-2 sm:mt-0"
                              >
                                <X className="h-3.5 w-3.5 mr-1" />
                                Eliminar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Está seguro de eliminar esta reserva?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto eliminará permanentemente la reserva de{" "}
                                  {booking.tenantName} para la cabaña {booking.cabinId}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="rounded-full" onClick={() => onDelete(booking.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No hay reservas</h3>
          <p className="text-muted-foreground max-w-md">
            {searchTerm || filterCabin !== "all"
              ? "No se encontraron reservas con los filtros actuales. Intente con otros criterios de búsqueda."
              : "No hay reservas registradas en el sistema. Cree una nueva reserva para comenzar."}
          </p>
          {(searchTerm || filterCabin !== "all") && (
            <Button
              variant="outline"
              className="mt-4 rounded-full"
              onClick={() => {
                setSearchTerm("")
                setFilterCabin("all")
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

