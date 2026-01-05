import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
        }

        const client = await prisma.client.findUnique({
            where: { username },
        });

        if (!client || !client.password || !(await bcrypt.compare(password, client.password))) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // We use a different cookie name or a different session structure to distinguish between Admin and Client if needed
        // For now, let's use "client_session" to avoid conflict with admin "session"
        const session = await encrypt({
            id: client.id,
            username: client.username,
            name: client.name,
            role: "CLIENT"
        });

        (await cookies()).set("client_session", session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return NextResponse.json({
            message: "Login successful",
            client: {
                id: client.id,
                username: client.username,
                name: client.name
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
