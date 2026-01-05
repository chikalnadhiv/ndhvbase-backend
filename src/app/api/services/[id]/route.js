import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";



export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const updatedService = await prisma.service.update({
            where: { id: parseInt(id) },
            data: {
                title: body.title,
                description: body.description,
                details: body.details,
                icon: body.icon,
                groupId: body.groupId ? parseInt(body.groupId) : null,
            },
        });
        return NextResponse.json(updatedService);
    } catch (error) {
        return NextResponse.json({ error: "Error updating service" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.service.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ message: "Service deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Error deleting service" }, { status: 500 });
    }
}
