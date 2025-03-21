import {
  Users,
  LayoutGrid,
  type LucideIcon,
  Map,
  LandPlot,
  Pickaxe,
  Database,
  Cookie,
  Building2,
  MapPinned,
  AlignEndHorizontal,
  Folder
} from "lucide-react";
import { type UserRole } from "./types";

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
export function getMenuList(pathname: string, role: UserRole | undefined): Group[] {
  const menuList: Group[] = [
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
        {
          href: "/dashboard/fmaps",
          label: "Карты Месторождений",
          icon: MapPinned,
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
        {
          href: "/dashboard/profitability",
          label: "Рентабельная добыча",
          icon: AlignEndHorizontal,
        },
        {
          href: "/dashboard/files",
          label: "Файлы",
          icon: Folder
        }
      ]
    }
  ]

  if (role === 'super-admin') return [
    ...menuList,
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
  ] 
  else return menuList
}
