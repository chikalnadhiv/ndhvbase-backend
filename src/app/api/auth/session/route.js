import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 401 }); // Changed to 401 to distinguish from route not found
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
