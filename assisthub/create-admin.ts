import { db } from "./server/db";
import { users } from "./shared/schema";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

async function createAdminUser() {
  try {
    // Generate secure random password
    const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
    const adminEmail = "admin@assisthub.com";
    
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    
    const adminUser = {
      id: uuidv4(),
      email: adminEmail,
      password: hashedPassword,
      firstName: "Super",
      lastName: "Admin",
      isAdmin: true,
      authType: "email" as const,
      hasSeenWelcome: true,
    };

    await db
      .insert(users)
      .values(adminUser)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          password: hashedPassword,
          isAdmin: true,
          firstName: "Super",
          lastName: "Admin",
          updatedAt: new Date(),
        },
      });

    console.log("✅ Admin user created successfully!");
    console.log("==========================================");
    console.log("🔑 ADMIN CREDENTIALS (Save these securely!)");
    console.log("==========================================");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${randomPassword}`);
    console.log("==========================================");
    console.log("⚠️  Save these credentials now - they won't be shown again!");
    console.log("This admin can log in and take over chat sessions from AI.");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
