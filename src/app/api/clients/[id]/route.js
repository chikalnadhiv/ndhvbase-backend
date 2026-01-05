import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        await prisma.client.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ message: "Client deleted successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error deleting client" }, { status: 500 });
    }
}
