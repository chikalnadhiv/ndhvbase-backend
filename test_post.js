const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPost() {
    try {
        const newPkg = await prisma.package.create({
            data: {
                name: "Test Package",
                price: 1000000,
                features: "Feature 1, Feature 2",
                isPopular: false,
                bookingGoal: 0,
                revenueGoal: 0,
                groupId: null
            }
        });
        console.log('SUCCESS: Created package', newPkg.id);

        // Clean up
        await prisma.package.delete({ where: { id: newPkg.id } });
        console.log('SUCCESS: Deleted test package');
    } catch (error) {
        console.error('POST DIAGNOSTIC ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPost();
