import {
  Users,
  LayoutGrid,
  type LucideIcon,
  Map,
  LandPlot,
  Pickaxe,
  Database,
  Cookie,
  Building2
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
          label: "Панель",
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Карты",
      menus: [
        {
          href: "/dashboard/map",
          label: "Карта - Главная",
          icon: Map,
        },
      ]
    },
    {
      groupLabel: "Данные",
      menus: [
        {
          href: "/dashboard/companies",
          label: "Компании",
          icon: Building2,
        },
        {
          href: "/dashboard/fields",
          label: "Месторождения",
          icon: Pickaxe,
        },
        {
          href: "/dashboard/licensed-areas",
          label: "Лицензионные участки",
          icon: LandPlot,
        },
        {
          href: "/dashboard/areas-data",
          label: "Данные ЛУ",
          icon: Database,
        },
      ]
    },
    {
      groupLabel: "Пользователи",
      menus: [
        {
          href: "/dashboard/users",
          label: "Пользователи",
          icon: Users
        },
        {
          href: "/dashboard/sessions",
          label: "Сессии",
          icon: Cookie
        },
      ]
    }
  ];
}
