import { db } from "./server/db";
import { users } from "./shared/schema";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash("assisthub@", 10);
    
    const adminUser = {
      id: uuidv4(),
      email: "superadmin@assisthub.com",
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
    console.log("Username: superadmin@assisthub.com");
    console.log("Password: assisthub@");
    console.log("This admin can now log in and take over chat sessions from AI.");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();