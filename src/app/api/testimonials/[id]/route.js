import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";



export async function PUT(request, { params }) {
    const { id } = await params;
    try {
        const body = await request.json();
        const updatedTestimonial = await prisma.testimonial.update({
            where: { id: parseInt(id) },
            data: {
                name: body.name,
                role: body.role,
                content: body.content,
                image: body.image,
                rating: body.rating ? parseInt(body.rating) : 5,
                isPublished: body.isPublished !== undefined ? body.isPublished : undefined,
            },
        });
        return NextResponse.json(updatedTestimonial);
    } catch (error) {
        return NextResponse.json({ error: "Error updating testimonial" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        await prisma.testimonial.delete({
            where: { id: parseInt(id) },
        });
        return NextResponse.json({ message: "Testimonial deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Error deleting testimonial" }, { status: 500 });
    }
}
