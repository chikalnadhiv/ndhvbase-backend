import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";



export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { name, description, price, socialIcon, socialLink, locationUrl, image, serviceId, detailTemplateIds } = body;

        const updatedItem = await prisma.serviceItem.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : null,
                socialIcon,
                socialLink,
                locationUrl,
                image,
                serviceId: serviceId ? parseInt(serviceId) : undefined,
                detailTemplates: detailTemplateIds ? {
                    set: detailTemplateIds.map(templateId => ({ id: parseInt(templateId) }))
                } : undefined
            },
            include: {
                detailTemplates: true
            }
        });
        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error("PUT /api/service-items error:", error);
        return NextResponse.json({ error: "Error updating item", details: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.serviceItem.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ message: "Item deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Error deleting item" }, { status: 500 });
    }
}
