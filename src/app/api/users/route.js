import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                createdAt: true
            }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const hashedPassword = await bcrypt.hash(body.password, 10);

        const user = await prisma.user.create({
            data: {
                username: body.username,
                name: body.name,
                password: hashedPassword,
                role: body.role || "USER",
            },
        });

        const { password, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Error creating user" }, { status: 500 });
    }
}
