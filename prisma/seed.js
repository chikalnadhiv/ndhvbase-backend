const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const username = 'admin';
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { username: username },
        update: {},
        create: {
            username: username,
            name: 'Super Admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    // Seed Settings (About Page Defaults)
    const settingsData = [
        { key: "about_subtitle", value: "Who We Are" },
        { key: "about_title", value: "Weaving Your Love Story into Reality" },
        { key: "about_description_1", value: "At Jenggala Project, we believe that every wedding is a unique masterpiece, reflecting the individuality of the couple. Our name, derived from the Sanskrit word for \"jungle,\" symbolizes growth, natural beauty, and the serene wildness of love." },
        { key: "about_description_2", value: "With years of experience in orchestrating intimate gatherings and grand celebrations, we ensure your special day flows effortlessly, allowing you to cherish every moment." },
        { key: "about_stat_1_value", value: "150+" },
        { key: "about_stat_1_label", value: "Weddings Planned" },
        { key: "about_stat_2_value", value: "100%" },
        { key: "about_stat_2_label", value: "Happy Couples" },
        { key: "docs_subtitle", value: "Our Work" },
        { key: "docs_title", value: "Event Documentation" },
        { key: "docs_description", value: "Witness the magic we've created for our clients through these captured moments." },
    ];

    for (const setting of settingsData) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting
        });
    }

    // Seed Services
    const servicesData = [
        { title: "Venue", description: "Find the perfect location for your dream wedding ceremony and reception.", icon: "fa-solid fa-building" },
        { title: "MUA", description: "Professional makeup and hair styling to make you look stunning on your special day.", icon: "fa-solid fa-paintbrush" },
        { title: "MC", description: "Master Of Ceremony to guide your event flow smoothly and professionally.", icon: "fa-solid fa-microphone" },
        { title: "Decoration", description: "Transform your venue into a magical space with our bespoke decoration services.", icon: "fa-solid fa-leaf" },
        { title: "Photography", description: "Capture every precious moment with our expert photography and videography team.", icon: "fa-solid fa-camera" },
        { title: "Catering", description: "Delight your guests with exquisite culinary experiences customized to your taste.", icon: "fa-solid fa-utensils" },
    ];

    for (const service of servicesData) {
        await prisma.service.create({
            data: service
        });
    }

    console.log({ admin, servicesSeeded: servicesData.length, settingsSeeded: settingsData.length });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
