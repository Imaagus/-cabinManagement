import { NextResponse } from 'next/server';
import { getXataClient } from "@/src/xata";

const xata = getXataClient();

export async function GET() {
  try {
    const bookings = await xata.db.cabin.getAll();
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const overlappingBookings = await xata.db.cabin.filter({
      cabinId: body.cabinId,
      dateFrom: { $lt: new Date(body.dateTo) },
      dateTo: { $gt: new Date(body.dateFrom) }
    }).getMany();

    if (overlappingBookings.length > 0) {
      return NextResponse.json({ error: 'This cabin is already booked for the selected dates' }, { status: 400 });
    }

    const newBooking = await xata.db.cabin.create(body);
    return NextResponse.json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const xata = getXataClient()
    const id = params.id

    // Validate the ID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return NextResponse.json({ error: "Invalid booking ID format" }, { status: 400 })
    }

    // Try to find the booking first
    const booking = await xata.db.cabin.read(id)
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Delete the booking
    await xata.db.cabin.delete(id)

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
      id,
    })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
  }
}




