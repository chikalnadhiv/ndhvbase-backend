import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";




export async function GET() {
    try {
        const transactions = await prisma.transaction.findMany({
            include: { booking: true },
            orderBy: { date: "desc" },
        });
        return NextResponse.json(transactions);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error fetching transactions" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const transaction = await prisma.transaction.create({
            data: {
                type: body.type, // INCOME or EXPENSE
                category: body.category,
                amount: parseFloat(body.amount),
                description: body.description,
                date: body.date ? new Date(body.date) : new Date(),
                bookingId: body.bookingId ? parseInt(body.bookingId) : null,
            },
        });
        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error creating transaction" }, { status: 500 });
    }
}
