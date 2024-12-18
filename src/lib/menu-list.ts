import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  type LucideIcon,
  Map,
  Database
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Содержание",
      menus: [
        {
          href: "/dashboard/map",
          label: "Карта",
          icon: Map,
        },
        {
          href: "/dashboard/fields",
          label: "Месторождения",
          icon: Database,
        },
        {
          href: "",
          label: "Пользователи",
          icon: Users,
          submenus: [
            {
              href: "/dashboard/users",
              label: "Все Пользователи"
            },
            {
              href: "/dashboard/users/sessions",
              label: "Сессии"
            }
          ]
        },
      ]
    }
  ];
}
