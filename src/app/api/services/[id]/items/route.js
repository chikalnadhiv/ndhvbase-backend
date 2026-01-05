import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";



// GET all items for a specific service
export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const items = await prisma.serviceItem.findMany({
            where: { serviceId: parseInt(id) },
            include: { detailTemplates: true },
            orderBy: { id: 'desc' }
        });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching items" }, { status: 500 });
    }
}

// POST new item to a service
export async function POST(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { name, description, price, socialIcon, socialLink, locationUrl, image, detailTemplateIds } = body;

        const newItem = await prisma.serviceItem.create({
            data: {
                name,
                description,
                price: price ? parseFloat(price) : null,
                socialIcon,
                socialLink,
                locationUrl,
                image,
                serviceId: parseInt(id),
                detailTemplates: detailTemplateIds ? {
                    connect: detailTemplateIds.map(templateId => ({ id: parseInt(templateId) }))
                } : undefined
            },
            include: {
                detailTemplates: true
            }
        });
        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error("POST /api/services/[id]/items error:", error);
        return NextResponse.json({ error: "Error creating item", details: error.message }, { status: 500 });
    }
}
