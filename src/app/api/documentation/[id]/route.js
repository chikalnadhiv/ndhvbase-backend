import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const doc = await prisma.documentation.findUnique({
            where: { id: parseInt(id) }
        });

        if (!doc) return NextResponse.json({ error: "Documentation not found" }, { status: 404 });

        return NextResponse.json(doc);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch documentation detail" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { title, coverImage, images, orientation, clientId } = body;

        const updatedDoc = await prisma.documentation.update({
            where: { id: parseInt(id) },
            data: {
                title,
                coverImage,
                orientation,
                images,
                clientId: clientId ? parseInt(clientId) : null
            }
        });

        return NextResponse.json(updatedDoc);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update documentation" }, { status: 500 });
    }
}
