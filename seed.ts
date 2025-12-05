import { db } from './src/db';
import { pricing, projects } from './src/db/schema';

// Seed initial pricing data
const seedData = async () => {
  // Seed Pricing
  const plans = [
    {
      name: 'Starter',
      price: '$999',
      description: 'Perfect for small businesses and startups.',
      features: ['Custom Landing Page', 'Mobile Responsive', 'Contact Form', 'Basic SEO', '1 Month Support'],
      popular: false,
      displayOrder: 1,
    },
    {
      name: 'Professional',
      price: '$2,499',
      description: 'For growing companies needing more features.',
      features: ['Everything in Starter', 'CMS Integration', 'Blog Functionality', 'Advanced Animations', 'Analytics Setup', '3 Months Support'],
      popular: true,
      displayOrder: 2,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Tailored solutions for large organizations.',
      features: ['Everything in Professional', 'Custom Web App', 'Database Integration', 'API Development', 'Priority Support', 'SLA'],
      popular: false,
      displayOrder: 3,
    },
  ];

  try {
    // Check if pricing exists
    const existingPricing = await db.select().from(pricing);
    if (existingPricing.length === 0) {
      for (const plan of plans) {
        await db.insert(pricing).values(plan);
      }
      console.log('✅ Pricing data seeded successfully!');
    } else {
      console.log('ℹ️ Pricing data already exists, skipping.');
    }

    // Seed Projects
    const projectList = [
      {
        title: 'E-Commerce Platform',
        description: 'A modern e-commerce solution with real-time inventory management and seamless payment integration.',
        imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80',
        link: 'https://example.com/ecommerce',
      },
      {
        title: 'Fintech Dashboard',
        description: 'Comprehensive financial analytics dashboard with interactive charts and reporting tools.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
        link: 'https://example.com/fintech',
      },
      {
        title: 'Healthcare App',
        description: 'Patient management system with appointment scheduling and telemedicine features.',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
        link: 'https://example.com/healthcare',
      },
    ];

    const existingProjects = await db.select().from(projects);
    if (existingProjects.length === 0) {
      for (const project of projectList) {
        await db.insert(projects).values(project);
      }
      console.log('✅ Projects data seeded successfully!');
    } else {
      console.log('ℹ️ Projects data already exists, skipping.');
    }

  } catch (error) {
    console.error('❌ Failed to seed data:', error);
  }

  process.exit(0);
};

seedData();
