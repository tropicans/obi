import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default user
  const user = await prisma.user.upsert({
    where: { phoneE164: '+6281234567890' },
    update: {},
    create: {
      name: 'Owner',
      phoneE164: '+6281234567890',
      timezone: 'Asia/Jakarta',
    },
  });
  console.log('✅ User created:', user.name);

  // Create pet Obi
  const pet = await prisma.pet.upsert({
    where: { id: 'obi-default' },
    update: {},
    create: {
      id: 'obi-default',
      userId: user.id,
      name: 'Obi',
      species: 'Betta',
      tankLiters: 2.6,
    },
  });
  console.log('✅ Pet created:', pet.name);

  // Create message templates
  const templates = [
    {
      key: 'daily',
      title: 'HARIAN – Obi 🐠',
      body: `1) Cek perilaku (aktif? responsif?)
2) Cek air (bau/keruh/lapisan?)
3) Pakan: 1–2 butir pelet (1×)

Balas: SELESAI / TUNDA / CATAT:...`,
    },
    {
      key: 'bi_daily',
      title: 'GANTI AIR – Obi (30–40%) 💧',
      body: `• Air baru suhu sama & diendapkan
• Jangan aduk dasar agresif

Balas: SELESAI / TUNDA`,
    },
    {
      key: 'weekly',
      title: 'MINGGUAN – Obi 🧹',
      body: `• Sedot kotoran sela kerikil
• Cek tanaman (pangkas daun rusak)
• Evaluasi ketapang (angkat jika lembek)

Balas: SELESAI / TUNDA`,
    },
    {
      key: 'bi_weekly',
      title: '2 MINGGU – Obi (±50%) 🔄',
      body: `• Ganti air ±50%
• Tata ulang ringan tanaman/dekor
• Reset mikro

Balas: SELESAI / TUNDA`,
    },
    {
      key: 'emergency',
      title: '⚠️ DARURAT – Obi',
      body: `• Ganti air 40% SEGERA
• Angkat ketapang jika ragu
• Pantau: sering ke permukaan / diam lama / air bau

Balas: SELESAI`,
    },
  ];

  for (const t of templates) {
    await prisma.messageTemplate.upsert({
      where: { key: t.key },
      update: { title: t.title, body: t.body },
      create: t,
    });
    console.log('✅ Template created:', t.key);
  }

  // Get template IDs for schedules
  const dailyTemplate = await prisma.messageTemplate.findUnique({ where: { key: 'daily' } });
  const biDailyTemplate = await prisma.messageTemplate.findUnique({ where: { key: 'bi_daily' } });
  const weeklyTemplate = await prisma.messageTemplate.findUnique({ where: { key: 'weekly' } });
  const biWeeklyTemplate = await prisma.messageTemplate.findUnique({ where: { key: 'bi_weekly' } });

  // Create default schedules
  const schedules = [
    { templateId: dailyTemplate!.id, cron: '0 9 * * *', key: 'daily' }, // 9 AM daily
    { templateId: biDailyTemplate!.id, cron: '0 9 */2 * *', key: 'bi_daily' }, // 9 AM every 2 days
    { templateId: weeklyTemplate!.id, cron: '0 10 * * 0', key: 'weekly' }, // 10 AM Sunday
    { templateId: biWeeklyTemplate!.id, cron: '0 10 1,15 * *', key: 'bi_weekly' }, // 10 AM 1st & 15th
  ];

  for (const s of schedules) {
    const existing = await prisma.schedule.findFirst({
      where: { userId: user.id, petId: pet.id, templateId: s.templateId },
    });
    if (!existing) {
      await prisma.schedule.create({
        data: {
          userId: user.id,
          petId: pet.id,
          templateId: s.templateId,
          cron: s.cron,
          enabled: true,
        },
      });
      console.log('✅ Schedule created:', s.key);
    }
  }

  console.log('🌱 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
