import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";




export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const updateData = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.price !== undefined) {
            const val = parseFloat(body.price);
            updateData.price = isNaN(val) ? 0 : val;
        }
        if (body.features !== undefined) updateData.features = body.features;
        if (body.isPopular !== undefined) updateData.isPopular = body.isPopular;
        if (body.bookingGoal !== undefined) {
            const val = parseInt(body.bookingGoal);
            updateData.bookingGoal = isNaN(val) ? 0 : val;
        }
        if (body.revenueGoal !== undefined) {
            const val = parseFloat(body.revenueGoal);
            updateData.revenueGoal = isNaN(val) ? 0 : val;
        }
        if (body.groupId !== undefined) updateData.groupId = body.groupId ? parseInt(body.groupId) : null;

        const updatedPackage = await prisma.package.update({
            where: { id: parseInt(id) },
            data: updateData,
        });
        return NextResponse.json(updatedPackage);
    } catch (error) {
        console.error("PUT /api/packages/[id] error:", error);
        return NextResponse.json({ error: error.message || "Error updating package" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.package.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ message: "Package deleted" });
    } catch (error) {
        console.error("DELETE /api/packages/[id] error:", error);
        return NextResponse.json({ error: error.message || "Error deleting package" }, { status: 500 });
    }
}
