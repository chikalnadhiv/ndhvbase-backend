import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";




// Route for fetching and creating testimonials
export async function GET() {
    try {
        const testimonials = await prisma.testimonial.findMany({
            orderBy: { id: "desc" },
        });
        return NextResponse.json(testimonials);
    } catch (error) {
        console.error("Error fetching testimonials:", error);
        return NextResponse.json({ error: "Error fetching testimonials" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        console.log("Testimonial POST body:", body);
        const data = {
            name: body.name,
            role: body.role,
            content: body.content,
            image: body.image,
            rating: typeof body.rating === 'number' ? body.rating : (body.rating ? parseInt(body.rating) : 5),
            clientId: typeof body.clientId === 'number' ? body.clientId : (body.clientId ? parseInt(body.clientId) : null),
        };
        console.log("Testimonial creation data:", data);

        const newTestimonial = await prisma.testimonial.create({ data });
        return NextResponse.json(newTestimonial, { status: 201 });
    } catch (error) {
        console.error("Error creating testimonial:", error);
        return NextResponse.json({ error: error.message || "Error creating testimonial" }, { status: 500 });
    }
}
