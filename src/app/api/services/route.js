import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";




export async function GET() {
    try {
        const services = await prisma.service.findMany({
            include: {
                group: true,
                items: {
                    include: {
                        detailTemplates: true
                    }
                }
            },
            orderBy: { id: "asc" },
        });
        return NextResponse.json(services);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching services" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const newService = await prisma.service.create({
            data: {
                title: body.title,
                description: body.description,
                details: body.details,
                icon: body.icon,
                groupId: body.groupId ? parseInt(body.groupId) : null,
            },
        });
        return NextResponse.json(newService, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Error creating service" }, { status: 500 });
    }
}
