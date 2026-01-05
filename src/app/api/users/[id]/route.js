import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.user.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ message: "User deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const data = {
            username: body.username,
            name: body.name,
            role: body.role,
        };

        if (body.password) {
            data.password = await bcrypt.hash(body.password, 10);
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data,
        });

        const { password, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        return NextResponse.json({ error: "Error updating user" }, { status: 500 });
    }
}
