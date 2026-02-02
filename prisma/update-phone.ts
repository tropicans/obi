import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePhone() {
    // Update all users to use the correct phone number
    const result = await prisma.user.updateMany({
        data: {
            phoneE164: '+628111268777'
        }
    });

    console.log(`✅ Updated ${result.count} user(s) with correct phone number: +628111268777`);

    // Show updated users
    const users = await prisma.user.findMany();
    console.log('Users:', users);
}

updatePhone()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
