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





