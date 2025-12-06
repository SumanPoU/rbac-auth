// menu-list.ts
import {
  Tag,
  Users,
  Settings,
  Bookmark,
  LayoutGrid,
  LucideIcon,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  permission?: string;
};

type Menu = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
  submenus?: Submenu[];
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(
  pathname: string,
  userPermissions: string[]
): Group[] {
  const menuList: Group[] = [
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
  ];

  // ----- Filtering logic -----
  return menuList
    .map((group) => {
      const filteredMenus = group.menus
        .map((menu) => {
          // 1️⃣ If menu has NO submenus (like Dashboard)
          if (!menu.submenus) {
            if (!menu.permission) return menu;
            return userPermissions.includes(menu.permission) ? menu : null;
          }

          // 2️⃣ If menu has submenus → filter each submenu
          const allowedSubmenus = menu.submenus.filter((submenu) =>
            submenu.permission
              ? userPermissions.includes(submenu.permission)
              : true
          );

          // Hide menu if NO submenus survive
          if (allowedSubmenus.length === 0) return null;

          return { ...menu, submenus: allowedSubmenus };
        })
        .filter(Boolean) as Menu[];

      return { ...group, menus: filteredMenus };
    })
    .filter((group) => group.menus.length > 0);
}
