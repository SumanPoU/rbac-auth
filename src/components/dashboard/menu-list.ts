import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  permission?: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
  active?: boolean;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
        },
      ],
    },
    {
      groupLabel: "Management",
      menus: [
        {
          href: "/dashboard/users",
          label: "Users",
          icon: Users,
          submenus: [
            {
              href: "/dashboard/users",
              label: "All Users",
              permission: "read:users",
            },
            {
              href: "/dashboard/users/new",
              label: "Add User",
              permission: "create:users",
            },
            {
              href: "/dashboard/users/update",
              label: "Update User",
              permission: "update:users",
            },
            {
              href: "/dashboard/users/disable",
              label: "Disable User",
              permission: "disable:users",
            },
            {
              href: "/dashboard/users/soft-delete",
              label: "Soft Delete User",
              permission: "soft-delete:users",
            },
            {
              href: "/dashboard/users/hard-delete",
              label: "Hard Delete User",
              permission: "hard-delete:users",
            },
          ],
        },
        {
          href: "/dashboard/roles",
          label: "Roles",
          icon: Settings,
          submenus: [
            {
              href: "/dashboard/roles",
              label: "All Roles",
              permission: "read:roles",
            },
            {
              href: "/dashboard/roles/new",
              label: "Add Role",
              permission: "add:roles",
            },
          ],
        },
        {
          href: "/dashboard/pages",
          label: "Pages",
          icon: Bookmark,
          submenus: [
            {
              href: "/dashboard/pages",
              label: "All Pages",
              permission: "read:pages",
            },
            {
              href: "/dashboard/pages/new",
              label: "Add Page",
              permission: "add:pages",
            },
          ],
        },
        {
          href: "/dashboard/permissions",
          label: "Permissions",
          icon: Tag,
          submenus: [
            {
              href: "/dashboard/permissions",
              label: "All Permissions",
              permission: "read:permissions",
            },
            {
              href: "/dashboard/permissions/new",
              label: "Add Permission",
              permission: "add:permissions",
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Assignments",
      menus: [
        {
          href: "/dashboard/assignments",
          label: "Role & User Assignments",
          icon: Users,
          submenus: [
            {
              href: "/dashboard/assignments/user-role",
              label: "Update User Role",
              permission: "update:users-role",
            },
            {
              href: "/dashboard/assignments/roles-pages",
              label: "Update Roles Pages",
              permission: "update:roles-pages",
            },
            {
              href: "/dashboard/assignments/roles-permissions",
              label: "Update Roles Permissions",
              permission: "update:roles-permissions",
            },
          ],
        },
      ],
    },
  ];
}
