import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  type LucideIcon
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
      groupLabel: "Contents",
      menus: [
        {
          href: "",
          label: "Posts",
          icon: SquarePen,
          submenus: [
            {
              href: "/posts",
              label: "All Posts"
            },
            {
              href: "/posts/new",
              label: "New Post"
            }
          ]
        },
        {
          href: "/categories",
          label: "Categories",
          icon: Bookmark
        },
        {
          href: "/tags",
          label: "Tags",
          icon: Tag
        }
      ]
    },
    {
      groupLabel: "Настройки",
      menus: [
        // {
        //   href: "/dashboard/users",
        //   label: "Пользователи",
        //   icon: Users
        // },
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
        {
          href: "/account",
          label: "Account",
          icon: Settings
        }
      ]
    }
  ];
}
