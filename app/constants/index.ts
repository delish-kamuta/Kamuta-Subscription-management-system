import { LayoutDashboard, Banknote, Settings, HandPlatter, WalletCards, QrCode, ScanLine, Users, MessageSquare, Building2, UtensilsCrossed, ClipboardCheck } from "lucide-react"

export const sidebarItems = [
  {
    id: 1,
    icon: LayoutDashboard,
    label: "Overview",
    href: "/dashboard",
    roles: ["student", "cashier", "admin"], // Available to supported roles
  },
  {
    id: 11,
    icon: ClipboardCheck,
    label: "Dairy Usage Report",
    href: "/chef-dashboard",
    roles: ["worker"], // Only for chefs
  },
  {
    id: 10,
    icon: UtensilsCrossed,
    label: "Restaurant",
    href: "/restaurant-dashboard",
    roles: ["admin"],
  },
  {
    id: 12,
    icon: ClipboardCheck,
    label: "Manage Stock",
    href: "/manage-stock",
    roles: ["admin", "worker"], 
  },
  {
    id: 2,
    icon: QrCode,
    label: "My QR Code",
    href: "/my-qr-code",
    roles: ["student"], // Only for students
  },
  {
    id: 3,
    icon: ScanLine,
    label: "Scan QR Code",
    href: "/scan-qr",
    roles: ["scanner", "admin"], // Allow scanner, admin
  },
  {
    id: 4,
    icon: HandPlatter,
    label: "Meals Logs",
    href: "/meals-logs",
    roles: ["admin","cashier"], // Only for staff and cashier
  },
  {
    id: 5,
    icon: WalletCards,
    label: "Subscriptions",
    href: "/subscription",
    roles: ["cashier", "admin"], // Only for cashier and admin
  },
  {
    id: 6,
    icon: Banknote,
    label: "Payments",
    href: "/payments",
    roles: ["admin"], // Only for admin
  },
  {
    id: 7,
    icon: Users,
    label: "Users",
    href: "/users",
    roles: ["admin"], // Only for admin
  },
  {
    id: 8,
    icon: Building2,
    label: "Branches",
    href: "/branches",
    roles: ["admin"], // Only for admin
  },
  {
    id: 9,
    icon: MessageSquare,
    label: "Feedback",
    href: "/feedback",
    roles: ["admin"],
  },
];

export const chartOneData: object[] = [
  {
    x: "Jan",
    y1: 0.5,
    y2: 1.5,
    y3: 0.7,
  },
  {
    x: "Feb",
    y1: 0.8,
    y2: 1.2,
    y3: 0.9,
  },
  {
    x: "Mar",
    y1: 1.2,
    y2: 1.8,
    y3: 1.5,
  },
  {
    x: "Apr",
    y1: 1.5,
    y2: 2.0,
    y3: 1.8,
  },
  {
    x: "May",
    y1: 1.8,
    y2: 2.5,
    y3: 2.0,
  },
  {
    x: "Jun",
    y1: 2.0,
    y2: 2.8,
    y3: 2.5,
  },
];

export const budgetOptions = ["Budget", "Mid-range", "Luxury", "Premium"];

export const groupTypes = ["Solo", "Couple", "Family", "Friends", "Business"];

export const footers = ["Terms & Condition", "Privacy Policy"];

export const selectItems = [
  "groupType",
  "travelStyle",
  "interest",
  "budget",
] as (keyof TripFormData)[];

export const CONFETTI_SETTINGS = {
  particleCount: 200, // Number of confetti pieces
  spread: 60, // Spread of the confetti burst
  colors: ["#ff0", "#ff7f00", "#ff0044", "#4c94f4", "#f4f4f4"], // Confetti colors
  decay: 0.95, // Gravity decay of the confetti
};

export const LEFT_CONFETTI = {
  ...CONFETTI_SETTINGS,
  angle: 45, // Direction of the confetti burst (90 degrees is top)
  origin: { x: 0, y: 1 }, // Center of the screen
};

export const RIGHT_CONFETTI = {
  ...CONFETTI_SETTINGS,
  angle: 135,
  origin: { x: 1, y: 1 },
};
export const dashboardStats = [
  {
    id: "totalIncome",
    title: "Total Revenue",
    value: '-',
    currentDay: '-', // 12% increase
    lastDayCount: '-',
  },
  {
    id: "totalCredit",
    title: "Total Credit",
    value: '-',
    currentDay: '-', // 2% decrease
    lastDayCount: '-',
  },
  {
    id: "mealsServedToday",
    title: "Meals Served Today",
    value: '-',
    currentDay: '-', // 2% increase
    lastDayCount: '-',
  },
];
export const user = {
  name: "Shema",
};

// Subscription page data
export const subscriptionStats = [
  {
    id: "totalActiveSubscriptions",
    title: "Total Active Subscriptions",
    value: '-',
    currentDay: '-',
    lastDayCount: '-',
  },
  {
    id: "newSubscription",
    title: "New Subscriptions",
    value: '-',
    currentDay: '-',
    lastDayCount: '-',
  },
  {
    id: "expiringThisWeek",
    title: "Expiring Subscriptions",
    value: '-',
    currentDay: '-',
    lastDayCount: '-',
  },
];

export const subscriptionData = [
  {
    id: "12345",
    clientName: "James Anderson",
    subscriptionType: "Vip",
    customerType: "Student",
    branch: "KIGALI",
    dateStarted: "Jan 6, 2022",
    totalMeals: 12,
    mealsLeft: 12,
    payment: "Cash",
  },
  {
    id: "12345",
    clientName: "Michael Johnson",
    subscriptionType: "Ordinary",
    customerType: "Regular",
    branch: "HUYE",
    dateStarted: "Jan 6, 2022",
    totalMeals: 21,
    mealsLeft: 21,
    payment: "Cash",
  },
  {
    id: "12345",
    clientName: "David Brown",
    subscriptionType: "VVIP",
    customerType: "Campus Worker",
    branch: "MUSANZE",
    dateStarted: "Jan 6, 2022",
    totalMeals: 15,
    mealsLeft: 15,
    payment: "MoMo",
  },
  {
    id: "12345",
    clientName: "Jason Wilson",
    subscriptionType: "Worker",
    customerType: "Campus Worker",
    branch: "RUBAVU",
    dateStarted: "Jan 5, 2022",
    totalMeals: 3,
    mealsLeft: 3,
    payment: "Cash",
  },
  {
    id: "12345",
    clientName: "Mark Davis",
    subscriptionType: "weekly",
    customerType: "Regular",
    branch: "NYARUGENGE",
    dateStarted: "Jan 5, 2022",
    totalMeals: 6,
    mealsLeft: 6,
    payment: "MoMo",
  },
  {
    id: "12345",
    clientName: "Kevin Taylor",
    subscriptionType: "Monthly",
    customerType: "Student",
    branch: "GASABO",
    dateStarted: "Jan 5, 2022",
    totalMeals: 31,
    mealsLeft: 31,
    payment: "MoMo",
  },
  {
    id: "12345",
    clientName: "Brian Miller",
    subscriptionType: "weekly",
    customerType: "Regular",
    branch: "KICUKIRO",
    dateStarted: "Jan 4, 2022",
    totalMeals: 17,
    mealsLeft: 17,
    payment: "MoMo",
  },
  {
    id: "12345",
    clientName: "Orlando Diggs",
    subscriptionType: "21 Days",
    customerType: "Student",
    branch: "RUSIZI",
    dateStarted: "Jan 5, 2022",
    totalMeals: 26,
    mealsLeft: 26,
    payment: "MoMo",
  },
];

// Meals Logs data
export const mealsLogsData = [
  {
    clientId: "12345",
    clientName: "James Anderson",
    mealUsed: 1,
    mealsLeft: 12,
    dateTime: "Jan 6, 2022 07:00 AM",
    scannedBy: "James Anderson",
    branch: "KIGALI",
  },
  {
    clientId: "12345",
    clientName: "Michael Johnson",
    mealUsed: 1,
    mealsLeft: 21,
    dateTime: "Jan 6, 2022 07:00 AM",
    scannedBy: "Michael Johnson",
    branch: "HUYE",
  },
  {
    clientId: "12345",
    clientName: "David Brown",
    mealUsed: 1,
    mealsLeft: 15,
    dateTime: "Jan 6, 2022 07:00 AM",
    scannedBy: "David Brown",
    branch: "BUSOGO",
  },
  {
    clientId: "12345",
    clientName: "Jason Wilson",
    mealUsed: 1,
    mealsLeft: 3,
    dateTime: "Jan 6, 2022 07:00 AM",
    scannedBy: "Jason Wilson",
    branch: "BUSOGO",
  },
  {
    clientId: "12345",
    clientName: "Mark Davis",
    mealUsed: 1,
    mealsLeft: 6,
    dateTime: "Jan 6, 2022 07:00 AM",
    scannedBy: "Mark Davis",
    branch: "BUSOGO",
  },
  {
    clientId: "12345",
    clientName: "Kevin Taylor",
    mealUsed: 1,
    mealsLeft: 31,
    dateTime: "Jan 6, 2022 07:00 AM",
    scannedBy: "Kevin Taylor",
    branch: "HUYE",
  },
  {
    clientId: "12345",
    clientName: "Brian Miller",
    mealUsed: 1,
    mealsLeft: 17,
    dateTime: "Jan 6, 2022 07:00 AM",
    scannedBy: "Brian Miller",
    branch: "MUSANZE",
  },
  {
    clientId: "12345",
    clientName: "Orlando Diggs",
    mealUsed: 1,
    mealsLeft: 26,
    dateTime: "Jan 6, 2022 07:00 AM",
    scannedBy: "Orlando Diggs",
    branch: "MUSANZE",
  },
];

// Payments data
export const paymentsData = [
  {
    paymentId: "12345",
    clientName: "James Anderson",
    branch: "KIGALI",
    subscriptionType: "weekly",
    amountPaid: 2000,
    totalMeals: 12,
    paymentDate: "Jan 6, 2022",
    addedNotes: "12",
    payment: "Cash",
  },
  {
    paymentId: "12345",
    clientName: "Michael Johnson",
    branch: "HUYE",
    subscriptionType: "weekly",
    amountPaid: 2000,
    totalMeals: 21,
    paymentDate: "Jan 6, 2022",
    addedNotes: "21",
    payment: "Cash",
  },
  {
    paymentId: "12345",
    clientName: "David Brown",
    branch: "BUSOGO",
    subscriptionType: "Unlimited",
    amountPaid: 2000,
    totalMeals: 15,
    paymentDate: "Jan 6, 2022",
    addedNotes: "15",
    payment: "MoMo",
  },
  {
    paymentId: "12345",
    clientName: "Jason Wilson",
    branch: "BUSOGO",
    subscriptionType: "Worker",
    amountPaid: 2000,
    totalMeals: 3,
    paymentDate: "Jan 5, 2022",
    addedNotes: "03",
    payment: "Cash",
  },
  {
    paymentId: "12345",
    clientName: "Mark Davis",
    branch: "BUSOGO",
    subscriptionType: "weekly",
    amountPaid: 2000,
    totalMeals: 6,
    paymentDate: "Jan 5, 2022",
    addedNotes: "06",
    payment: "MoMo",
  },
  {
    paymentId: "12345",
    clientName: "Kevin Taylor",
    branch: "HUYE",
    subscriptionType: "Monthly",
    amountPaid: 2000,
    totalMeals: 31,
    paymentDate: "Jan 5, 2022",
    addedNotes: "31",
    payment: "MoMo",
  },
  {
    paymentId: "12345",
    clientName: "Brian Miller",
    branch: "MUSANZE",
    subscriptionType: "weekly",
    amountPaid: 2000,
    totalMeals: 17,
    paymentDate: "Jan 4, 2022",
    addedNotes: "17",
    payment: "MoMo",
  },
  {
    paymentId: "12345",
    clientName: "Orlando Diggs",
    branch: "MUSANZE",
    subscriptionType: "21 Days",
    amountPaid: 2000,
    totalMeals: 26,
    paymentDate: "Jan 5, 2022",
    addedNotes: "26",
    payment: "MoMo",
  },
];
