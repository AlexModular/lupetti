import { NextRequest, NextResponse } from "next/server";
import { getSiteData } from "@/lib/content";
import {
  getBookedSpotsByEvent,
  listAllBookings,
  createBooking,
  cancelBookingById,
  CapacityError,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeList = searchParams.get("admin") === "1";
    const eventSlug = searchParams.get("event") || undefined;

    const [{ eventi }, bookedMap] = await Promise.all([
      getSiteData(),
      getBookedSpotsByEvent(),
    ]);

    const availability = eventi.map((ev) => {
      const maxCapacity = ev.maxCapacity ?? 10;
      const bookedSpots = bookedMap[ev.slug] ?? 0;
      const remainingSpots = Math.max(0, maxCapacity - bookedSpots);
      return {
        slug: ev.slug,
        title: ev.title,
        date: ev.date,
        category: ev.category,
        ageRange: ev.ageRange,
        price: ev.price ?? "12€",
        bookable: ev.bookable ?? true,
        maxCapacity,
        bookedSpots,
        remainingSpots,
        isSoldOut: remainingSpots === 0,
      };
    });

    if (includeList) {
      const bookings = await listAllBookings(eventSlug);
      return NextResponse.json({ availability, bookings });
    }

    return NextResponse.json({ availability });
  } catch (error) {
    console.error("GET /api/prenotazioni error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento delle disponibilità." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      event_slug,
      parent_name,
      parent_email,
      parent_phone,
      child_name,
      child_age,
      spots,
      notes,
    } = body;

    if (
      !event_slug ||
      !parent_name?.trim() ||
      !parent_email?.trim() ||
      !parent_phone?.trim() ||
      !child_name?.trim()
    ) {
      return NextResponse.json(
        { error: "Compila tutti i campi obbligatori per completare la prenotazione." },
        { status: 400 }
      );
    }

    const { eventi } = await getSiteData();
    const targetEvent = eventi.find((e) => e.slug === event_slug);

    if (!targetEvent) {
      return NextResponse.json(
        { error: "L'attività selezionata non è stata trovata." },
        { status: 404 }
      );
    }

    if (targetEvent.bookable === false) {
      return NextResponse.json(
        { error: "Questa attività non richiede o non accetta prenotazioni online." },
        { status: 400 }
      );
    }

    const booking = await createBooking({
      event_slug: targetEvent.slug,
      event_title: targetEvent.title,
      event_date: targetEvent.date,
      max_capacity: targetEvent.maxCapacity ?? 10,
      parent_name: parent_name.trim(),
      parent_email: parent_email.trim(),
      parent_phone: parent_phone.trim(),
      child_name: child_name.trim(),
      child_age: (child_age || "").trim() || "N/D",
      spots: Number(spots) || 1,
      notes: (notes || "").trim(),
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof CapacityError) {
      return NextResponse.json(
        {
          error: error.message,
          remainingSpots: error.remainingSpots,
        },
        { status: 409 }
      );
    }
    console.error("POST /api/prenotazioni error:", error);
    return NextResponse.json(
      { error: "Errore interno durante il salvataggio della prenotazione." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "ID prenotazione mancante." }, { status: 400 });
    }
    await cancelBookingById(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/prenotazioni error:", error);
    return NextResponse.json(
      { error: "Impossibile annullare la prenotazione." },
      { status: 500 }
    );
  }
}

