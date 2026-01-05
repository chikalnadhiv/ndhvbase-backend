import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(clients);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error fetching clients" }, { status: 500 });
    }
}
