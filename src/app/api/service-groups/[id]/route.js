import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const updatedGroup = await prisma.serviceGroup.update({
            where: { id: parseInt(id) },
            data: {
                name: body.name,
                description: body.description,
                bookingGoal: body.bookingGoal ? parseInt(body.bookingGoal) : 0,
                revenueGoal: body.revenueGoal ? parseFloat(body.revenueGoal) : 0,
            },
        });
        return NextResponse.json(updatedGroup);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error updating service group" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.serviceGroup.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ message: "Service group deleted" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error deleting service group" }, { status: 500 });
    }
}
