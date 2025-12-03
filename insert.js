// import pkg from "@prisma/client";
// import fs from "fs";

// const { PrismaClient } = pkg;
// const prisma = new PrismaClient();

// async function main() {
//     const raw = fs.readFileSync("./suman.json", "utf8");
//     const data = JSON.parse(raw);

//     // Insert roles
//     for (const role of data.roles) {
//         await prisma.role.upsert({
//             where: { id: role.id },
//             update: role,
//             create: role,
//         });
//     }
//     console.log("Roles inserted ✔️");

//     // Insert permissions
//     for (const perm of data.permissions) {
//         await prisma.permission.upsert({
//             where: { id: perm.id },
//             update: perm,
//             create: perm,
//         });
//     }
//     console.log("Permissions inserted ✔️");

//     // Insert role-permissions
//     for (const rp of data.rolePermissions) {
//         await prisma.rolePermission.upsert({
//             where: {
//                 roleId_permissionId: { roleId: rp.roleId, permissionId: rp.permissionId },
//             },
//             update: {},
//             create: rp,
//         });
//     }
//     console.log("Role permissions inserted ✔️");

//     // Insert users
//     for (const user of data.users) {
//         await prisma.user.upsert({
//             where: { id: user.id },
//             update: {
//                 name: user.name,
//                 username: user.username,
//                 email: user.email,
//                 password: user.password,
//                 roleId: user.roleId,
//             },
//             create: user,
//         });
//     }
//     console.log("Users inserted ✔️");

//     // Insert pages
//     for (const page of data.pages) {
//         await prisma.page.upsert({
//             where: { id: page.id },
//             update: page,
//             create: page,
//         });
//     }
//     console.log("Pages inserted ✔️");

//     console.log("🎉 JSON data successfully inserted!");
// }

// main()
//     .catch((err) => {
//         console.error("❌ Error:", err);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });




import { Client } from "pg";


const client = new Client({
    connectionString: "postgresql://postgres:admin@localhost:5432/authentication",
});

const data = {
    roles: [
        { id: 1, name: "READ_ONLY", description: "Users with this role can only view application content.", isDefault: true },
        { id: 2, name: "ADMIN", description: "Users with this role have administrative privileges.", isDefault: false },
        { id: 3, name: "SUPER_ADMIN", description: "Users with this role have full access and control over the application.", isDefault: false }
    ],
    permissions: [
        { id: 1, name: "user:read", description: "Can read user information" },
        { id: 2, name: "user:write", description: "Can create/update users" },
        { id: 3, name: "user:delete", description: "Can delete users" },
        { id: 4, name: "role:manage", description: "Can manage roles and permissions" },
        { id: 5, name: "admin:access", description: "Can access admin-specific features" }
    ],
    rolePermissions: [
        { roleId: 3, permissionId: 1 },
        { roleId: 3, permissionId: 2 },
        { roleId: 3, permissionId: 3 },
        { roleId: 3, permissionId: 4 },
        { roleId: 3, permissionId: 5 },
        { roleId: 2, permissionId: 1 },
        { roleId: 2, permissionId: 2 },
        { roleId: 2, permissionId: 5 },
        { roleId: 1, permissionId: 1 }
    ],
    users: [
        {
            id: 1,
            name: "Super Admin",
            username: "superadmin",
            email: "acharyas186@gmail.com",
            password: "$2a$10$HASHED_ADMIN123",
            roleId: 3
        },
        {
            id: 2,
            name: "Admin User",
            username: "adminuser",
            email: "sumanacharyas186@gmail.com",
            password: "$2a$10$HASHED_ADMIN123",
            roleId: 2
        },
        {
            id: 3,
            name: "Read Only User",
            username: "readonlyuser",
            email: "suman9815029324@gmail.com",
            password: "$2a$10$HASHED_USER123",
            roleId: 1
        }
    ],
    pages: [
        { id: 1, title: "Dashboard", slug: "dashboard", staticText: "Welcome to the Dashboard", allowedRoles: [1, 2, 3] },
        { id: 2, title: "Admin Panel", slug: "admin-panel", staticText: "Admin functionalities", allowedRoles: [2, 3] },
        { id: 3, title: "Role Management", slug: "role-management", staticText: "Manage user roles and permissions", allowedRoles: [3] }
    ]
};

async function seed() {
    try {
        await client.connect();
        console.log("Connected to database ✔");

        // FIX: Correct tables and timestamps
        await client.query(`
      TRUNCATE "User", roles, permissions, pages, "_RolePermissions", "_PageAllowedRoles"
      RESTART IDENTITY CASCADE;
    `);

        // Insert Roles
        for (const r of data.roles) {
            await client.query(
                `INSERT INTO roles (id, name, description, "isDefault", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
                [r.id, r.name, r.description, r.isDefault]
            );
        }

        // Insert Permissions
        for (const p of data.permissions) {
            await client.query(
                `INSERT INTO permissions (id, name, description, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, NOW(), NOW())`,
                [p.id, p.name, p.description]
            );
        }

        // Insert RolePermissions
        for (const rp of data.rolePermissions) {
            await client.query(
                `INSERT INTO "_RolePermissions" ("A", "B") VALUES ($1, $2)`,
                [rp.roleId, rp.permissionId]
            );
        }

        // Insert Users
        for (const u of data.users) {
            await client.query(
                `INSERT INTO "User" (id, name, username, email, password, "roleId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                [u.id, u.name, u.username, u.email, u.password, u.roleId]
            );
        }

        // Insert Pages
        for (const page of data.pages) {
            await client.query(
                `INSERT INTO pages (id, title, slug, "staticText", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
                [page.id, page.title, page.slug, page.staticText]
            );
        }

        // Insert PageAllowedRoles
        for (const p of data.pages) {
            for (const roleId of p.allowedRoles) {
                await client.query(
                    `INSERT INTO "_PageAllowedRoles" ("A", "B") VALUES ($1, $2)`,
                    [p.id, roleId]
                );
            }
        }

        console.log("Seeding complete ✔");
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
        console.log("Database connection closed.");
    }
}

seed();