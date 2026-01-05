import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(id) },
            include: {
                package: {
                    include: {
                        group: true
                    }
                },
                client: true,
                vendors: true,

                preparation: true,
                items: true,
                transactions: true
            }
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        return NextResponse.json(booking);
    } catch (error) {
        console.error("Error fetching booking:", error);
        return NextResponse.json({ error: "Error fetching booking" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const bookingId = parseInt(id);

        // Fetch current booking to get info
        const currentBooking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });

        if (!currentBooking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const { status, location, dpAmount, invoiceUrl, vendors, preparation, items, totalAmount, eventDate, isPublished } = body;

        // Update booking and its related vendors/preparation
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: status !== undefined ? status : currentBooking.status,
                location: location !== undefined ? location : currentBooking.location,
                dpAmount: dpAmount !== undefined ? parseFloat(dpAmount) : currentBooking.dpAmount,
                invoiceUrl: invoiceUrl !== undefined ? invoiceUrl : currentBooking.invoiceUrl,
                totalAmount: totalAmount !== undefined ? parseFloat(totalAmount) : currentBooking.totalAmount,
                eventDate: eventDate !== undefined ? new Date(eventDate) : currentBooking.eventDate,
                isPublished: isPublished !== undefined ? isPublished : currentBooking.isPublished,
                // Simple approach: delete all and recreate for vendors and preparation
                // or use connectOrCreate/upsert for better performance.
                // For simplicity here, we'll use deleteMany and createMany if they are provided.
                vendors: vendors ? {
                    deleteMany: {},
                    create: vendors.map(v => ({
                        category: v.category,
                        vendorName: v.vendorName,
                        packageIncludes: v.packageIncludes,
                        notes: v.notes,
                        isConfirmed: v.isConfirmed || false,
                        price: parseFloat(v.price) || 0
                    }))
                } : undefined,
                preparation: preparation ? {
                    deleteMany: {},
                    create: preparation.map(p => ({
                        agenda: p.agenda,
                        date: new Date(p.date),
                        time: p.time,
                        location: p.location,
                        pendamping: p.pendamping,
                        notes: p.notes
                    }))
                } : undefined,
                items: items ? {
                    deleteMany: {},
                    create: items.map(i => ({
                        name: i.name,
                        isCustom: i.isCustom
                    }))
                } : undefined
            },
            include: {
                package: {
                    include: {
                        group: true
                    }
                },
                client: true,
                vendors: true,
                preparation: true,
                items: true
            }
        });

        // If status changed to CONFIRMED or COMPLETED, create a transaction if it doesn't exist
        if (status === 'CONFIRMED' || status === 'COMPLETED') {
            // Check if transaction already exists for this booking
            const existingTx = await prisma.transaction.findFirst({
                where: { bookingId: bookingId, type: 'INCOME' }
            });

            if (!existingTx) {
                await prisma.transaction.create({
                    data: {
                        type: 'INCOME',
                        category: 'Client Payment',
                        amount: updatedBooking.totalAmount,
                        description: `Payment for booking: ${updatedBooking.clientName} (${status})`,
                        bookingId: bookingId,
                        date: new Date()
                    }
                });
            } else {
                // Update transaction amount if it changed
                await prisma.transaction.update({
                    where: { id: existingTx.id },
                    data: {
                        amount: updatedBooking.totalAmount,
                        description: `Payment for booking: ${updatedBooking.clientName} (${status})`
                    }
                });
            }
        }
        // If status changed to CANCELLED, we might want to remove the income record
        else if (status === 'CANCELLED') {
            await prisma.transaction.deleteMany({
                where: { bookingId: bookingId, type: 'INCOME' }
            });
        }

        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error("Error updating booking:", error);
        return NextResponse.json({ error: "Error updating booking" }, { status: 500 });
    }
}


export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        const bookingId = parseInt(id);

        // Use a transaction to ensure both are deleted
        await prisma.$transaction([
            prisma.transaction.deleteMany({ where: { bookingId } }),
            prisma.booking.delete({ where: { id: bookingId } })
        ]);

        return NextResponse.json({ message: "Booking and related transactions deleted" });
    } catch (error) {
        console.error("Error deleting booking:", error);
        return NextResponse.json({ error: "Error deleting booking" }, { status: 500 });
    }
}
