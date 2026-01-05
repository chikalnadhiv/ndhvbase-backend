import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const templates = await prisma.detailTemplate.findMany({
            orderBy: { id: "asc" },
        });
        return NextResponse.json(templates);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching templates" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const newTemplate = await prisma.detailTemplate.create({
            data: {
                name: body.name,
                content: body.content,
            },
        });
        return NextResponse.json(newTemplate, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Error creating template" }, { status: 500 });
    }
}
