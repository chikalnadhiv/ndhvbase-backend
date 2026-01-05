import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const updatedTemplate = await prisma.detailTemplate.update({
            where: { id: parseInt(id) },
            data: {
                name: body.name,
                content: body.content,
            },
        });
        return NextResponse.json(updatedTemplate);
    } catch (error) {
        return NextResponse.json({ error: "Error updating template" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.detailTemplate.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ message: "Template deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Error deleting template" }, { status: 500 });
    }
}
