const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const pkgs = await prisma.package.findMany({
            include: { group: true }
        });
        console.log('SUCCESS:', pkgs.length, 'packages found');
    } catch (error) {
        console.error('DIAGNOSTIC ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
