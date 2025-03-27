import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface Booking {
  id: string
  tenantName: string
  dateFrom: Date | null
  dateTo: Date | null
  payment: number
  cabinId: string
}

export function useBookings() {
  const queryClient = useQueryClient()

  const {
    data: bookings = [],
    isLoading,
    error,
  } = useQuery<Booking[], Error>({
    queryKey: ["bookings"],
    queryFn: async () => {
      const response = await fetch("/api/bookings")
      if (!response.ok) {
        throw new Error("Failed to fetch bookings")
      }
      const data = await response.json()
      return data.map((record: any) => ({
        id: record.id,
        tenantName: record.tenantName ?? "",
        dateFrom: record.dateFrom ? new Date(record.dateFrom) : null,
        dateTo: record.dateTo ? new Date(record.dateTo) : null,
        payment: record.payment ?? 0,
        cabinId: record.cabinId?.toString() ?? "",
      }))
    },
  })

  const addBookingMutation = useMutation({
    mutationFn: async (booking: Omit<Booking, "id">) => {
      console.log("Sending booking data:", booking)
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(booking),
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Server response:", errorData)
        throw new Error(errorData.error || "Failed to add booking")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
  })

  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      // Check if this is a temporary booking ID
      if (!bookingId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // For temporary bookings, just return the ID to remove it from the cache
        return { id: bookingId }
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Booking not found")
        }
        const errorData = await response.json().catch(() => ({ error: "Failed to delete booking" }))
        throw new Error(errorData.error || "Failed to delete booking")
      }

      return response.json()
    },
    onSuccess: (_, deletedId) => {
      // Update the cache to remove the deleted booking
      queryClient.setQueryData<Booking[]>(["bookings"], (oldData) => {
        return oldData ? oldData.filter((booking) => booking.id !== deletedId) : []
      })
    },
    onError: (error) => {
      console.error("Error in deleteBookingMutation:", error)
    },
  })

  const getTotalRevenue = (cabinId: string) => {
    return bookings
      .filter((booking: Booking) => booking.cabinId === cabinId)
      .reduce((total: number, booking: Booking) => total + booking.payment, 0)
  }

  const getBookingInfo = (date: Date) => {
    return bookings.filter((booking) => {
      const bookingStart = booking.dateFrom ? new Date(booking.dateFrom) : null
      const bookingEnd = booking.dateTo ? new Date(booking.dateTo) : null
      return bookingStart && bookingEnd && date >= bookingStart && date <= bookingEnd
    })
  }

  const isDateBooked = (date: Date, cabinId: string) => {
    return bookings.some(
      (booking: Booking) =>
        booking.dateFrom &&
        booking.dateTo &&
        date >= booking.dateFrom &&
        date <= booking.dateTo &&
        booking.cabinId === cabinId,
    )
  }

  return {
    bookings,
    isLoading,
    error: error ? error.message : null,
    addBooking: addBookingMutation.mutate,
    deleteBooking: deleteBookingMutation.mutate,
    getTotalRevenue,
    getBookingInfo,
    isDateBooked,
  }
}

