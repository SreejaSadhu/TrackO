import {
  LuLayoutDashboard,
  LuHandCoins,
  LuWalletMinimal,
  LuLogOut,
  LuPiggyBank,
  LuMic,
  LuSparkles,
} from "react-icons/lu";

export const SIDE_MENU_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: LuLayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "02",
    label: "Income",
    icon: LuWalletMinimal,
    path: "/income",
  },
  {
    id: "03",
    label: "Expense",
    icon: LuHandCoins,
    path: "/expense",
  },
  {
    id: "04",
    label: "Smart Budget",
    icon: LuPiggyBank,
    path: "/smartbudget",
  },
  {
    id: "05",
    label: "AI Analysis",
    icon: LuSparkles,
    path: "/aianalysis",
  },
  {
    id: "06",
    label: "Voice Assistant",
    icon: LuMic,
    path: "/voice-assistant",
  },
  {
    id: "07",
    label: "Logout",
    icon: LuLogOut,
    path: "logout",
  },
];
