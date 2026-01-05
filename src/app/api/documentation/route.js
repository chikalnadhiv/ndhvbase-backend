import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const clientId = searchParams.get("clientId");
        const publicOnly = searchParams.get("publicOnly") === "true";

        let where = {};
        if (clientId && !isNaN(parseInt(clientId))) {
            where = {
                OR: [
                    { clientId: parseInt(clientId) },
                    { clientId: null }
                ]
            };
        } else if (publicOnly) {
            where = { clientId: null };
        }

        const docs = await prisma.documentation.findMany({
            where,
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(docs);
    } catch (error) {
        console.error("GET Documentation Error:", error);
        return NextResponse.json({ error: "Failed to fetch documentation" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { title, coverImage, images, orientation, clientId } = body;

        const newDoc = await prisma.documentation.create({
            data: {
                title,
                coverImage,
                orientation: orientation || "portrait",
                images: images || "",
                clientId: clientId ? parseInt(clientId) : null
            }
        });

        return NextResponse.json(newDoc);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create documentation" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        await prisma.documentation.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete documentation" }, { status: 500 });
    }
}
