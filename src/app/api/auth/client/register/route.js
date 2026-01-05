import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
    try {
        const { username, password, phone, address } = await request.json();

        if (!username || !password || !phone || !address) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Check if username already exists
        const existingUsername = await prisma.client.findFirst({
            where: { username },
        });

        if (existingUsername) {
            return NextResponse.json({ error: "Username already taken" }, { status: 400 });
        }

        // Check if phone already exists
        const existingPhone = await prisma.client.findFirst({
            where: { phone },
        });

        if (existingPhone) {
            return NextResponse.json({ error: "Phone number already registered" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const client = await prisma.client.create({
            data: {
                username,
                password: hashedPassword,
                name: username, // Using username as name for now
                phone,
                address,
            },
        });

        return NextResponse.json({
            message: "Registration successful",
            client: {
                id: client.id,
                username: client.username,
                name: client.name
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
