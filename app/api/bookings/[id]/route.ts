import { NextResponse } from "next/server"
import { getXataClient } from "@/src/xata"

const xata = getXataClient()

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`API: Attempting to delete cabin record with ID: ${id}`)

    if (!id) {
      console.error("API: Missing ID parameter")
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Delete the record
    console.log(`API: Executing delete operation for ID: ${id}`)
    const deleted = await xata.db.cabin.delete(id)

    console.log("API: Delete operation result:", deleted)

    if (!deleted) {
      console.error(`API: Record with ID ${id} not found or could not be deleted`)
      return NextResponse.json({ error: "Record not found or could not be deleted" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
      id,
    })
  } catch (error) {
    console.error("API: Error deleting record:", error)
    return NextResponse.json(
      {
        error: "Failed to delete record",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

