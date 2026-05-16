const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create sample users
  const users = [];
  const userData = [
    {
      username: "mediagram",
      email: "admin@mediagram.com",
      displayName: "MediaGram Official",
      bio: "Welcome to MediaGram! 🎉 The best social media platform.",
    },
    {
      username: "alice_wonder",
      email: "alice@example.com",
      displayName: "Alice Wonderland",
      bio: "Photographer & Travel enthusiast 📸✈️",
    },
    {
      username: "bob_dev",
      email: "bob@example.com",
      displayName: "Bob Developer",
      bio: "Full-stack developer | Open source lover 💻",
    },
    {
      username: "carol_design",
      email: "carol@example.com",
      displayName: "Carol Designer",
      bio: "UI/UX Designer | Making beautiful things 🎨",
    },
    {
      username: "david_music",
      email: "david@example.com",
      displayName: "David Music",
      bio: "Musician & Producer 🎵 | Life is a melody",
    },
  ];

  const hashedPassword = await bcrypt.hash("password123", 10);

  for (const data of userData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        ...data,
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      },
    });
    users.push(user);
    console.log(`✅ Created user: ${user.username}`);
  }

  // Create follow relationships
  await prisma.follow.createMany({
    data: [
      { followerId: users[1].id, followingId: users[0].id },
      { followerId: users[2].id, followingId: users[0].id },
      { followerId: users[3].id, followingId: users[0].id },
      { followerId: users[4].id, followingId: users[0].id },
      { followerId: users[0].id, followingId: users[1].id },
      { followerId: users[0].id, followingId: users[2].id },
      { followerId: users[2].id, followingId: users[1].id },
      { followerId: users[3].id, followingId: users[1].id },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Created follow relationships");

  // Create sample posts
  const postData = [
    {
      userId: users[0].id,
      content:
        "Welcome to MediaGram! 🎉 Share your moments, connect with friends, and explore the world. #MediaGram #SocialMedia",
    },
    {
      userId: users[1].id,
      content:
        "Just came back from an amazing trip to the mountains! 🏔️ The view was breathtaking. #Travel #Photography #Nature",
    },
    {
      userId: users[2].id,
      content:
        "Excited to share my new open-source project! Check it out and let me know what you think. #OpenSource #Developer #Coding",
    },
    {
      userId: users[3].id,
      content:
        "Working on a new design system today. Clean UI makes happy users! 🎨 #Design #UIDesign #UX",
    },
    {
      userId: users[4].id,
      content:
        "New track dropping this Friday! 🎵 Stay tuned for something special. #Music #NewRelease #Producer",
    },
    {
      userId: users[1].id,
      content:
        "Golden hour photography is unmatched. 🌅 There's something magical about that light.",
    },
    {
      userId: users[2].id,
      content:
        "Hot take: TypeScript is worth the learning curve. Your future self will thank you. 💪 #TypeScript #JavaScript",
    },
  ];

  const posts = [];
  for (const data of postData) {
    const post = await prisma.post.create({ data });
    posts.push(post);
  }
  console.log(`✅ Created ${posts.length} sample posts`);

  // Create sample likes
  await prisma.like.createMany({
    data: [
      { userId: users[1].id, postId: posts[0].id },
      { userId: users[2].id, postId: posts[0].id },
      { userId: users[3].id, postId: posts[0].id },
      { userId: users[0].id, postId: posts[1].id },
      { userId: users[2].id, postId: posts[1].id },
      { userId: users[0].id, postId: posts[2].id },
      { userId: users[3].id, postId: posts[2].id },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Created sample likes");

  // Create sample comments
  const comment1 = await prisma.comment.create({
    data: {
      content: "Welcome! So happy to be here 🎉",
      userId: users[1].id,
      postId: posts[0].id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "This platform looks amazing!",
      userId: users[2].id,
      postId: posts[0].id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Can't wait to see more! 🚀",
      userId: users[3].id,
      postId: posts[0].id,
      parentId: comment1.id,
    },
  });
  console.log("✅ Created sample comments");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Test accounts (password: password123):");
  userData.forEach((u) => console.log(`  - ${u.email}`));
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
