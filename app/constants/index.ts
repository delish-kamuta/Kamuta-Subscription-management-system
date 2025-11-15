import {
  LayoutDashboard,
  Banknote,
  User,
  Settings,
  UtensilsCrossed,
} from "lucide-react";
export const sidebarItems = [
  {
    id: 1,
    icon: LayoutDashboard,
    label: "Overview",
    href: "/dashboard",
  },
  {
    id: 2,
    icon: UtensilsCrossed,
    label: "Meals Logs",
    href: "/meals-logs",
  },
  {
    id: 3,
    icon: Banknote,
    label: "Payments",
    href: "/payments",
  },
  {
    id: 4,
    icon: User,
    label: "Subscription",
    href: "/subscription",
  },
  {
    id: 5,
    icon: Settings,
    label: "Settings",
    href: "/settings",
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

export const travelStyles = [
  "Relaxed",
  "Luxury",
  "Adventure",
  "Cultural",
  "Nature & Outdoors",
  "City Exploration",
];

export const interests = [
  "Food & Culinary",
  "Historical Sites",
  "Hiking & Nature Walks",
  "Beaches & Water Activities",
  "Museums & Art",
  "Nightlife & Bars",
  "Photography Spots",
  "Shopping",
  "Local Experiences",
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

export const comboBoxItems = {
  groupType: groupTypes,
  travelStyle: travelStyles,
  interest: interests,
  budget: budgetOptions,
} as Record<keyof TripFormData, string[]>;

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
    id: "totalPayment",
    title: "Total payment",
    value: 12450,
    currentDay: 1320, // 12% increase
    lastDayCount: 1200,
  },
  {
    id: "totalTrips",
    title: "Total Trips",
    value: 3210,
    currentDay: 2940, // 2% decrease
    lastDayCount: 3000,
  },
  {
    id: "mealsServedToday",
    title: "Meals Served Today",
    value: 520,
    currentDay: 530, // 2% increase
    lastDayCount: 520,
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
    value: 1200,
    currentDay: 1200,
    lastDayCount: 1000,
  },
  {
    id: "newSubscription",
    title: "New Subscription",
    value: 35,
    currentDay: 33,
    lastDayCount: 35,
  },
  {
    id: "expiringThisWeek",
    title: "Expiring This Week",
    value: 12,
    currentDay: 12,
    lastDayCount: 12,
  },
];

export const subscriptionData = [
  {
    id: "12345",
    clientName: "James Anderson",
    subscriptionType: "Vip",
    dateStarted: "Jan 6, 2022",
    lastMealDate: "Jan 6, 2022",
    totalMeals: 12,
    mealsLeft: 12,
    payment: "Cash",
  },
  {
    id: "12345",
    clientName: "Michael Johnson",
    subscriptionType: "Ordinary",
    dateStarted: "Jan 6, 2022",
    lastMealDate: "Jan 6, 2022",
    totalMeals: 21,
    mealsLeft: 21,
    payment: "Cash",
  },
  {
    id: "12345",
    clientName: "David Brown",
    subscriptionType: "VVIP",
    dateStarted: "Jan 6, 2022",
    lastMealDate: "Jan 6, 2022",
    totalMeals: 15,
    mealsLeft: 15,
    payment: "MoMo",
  },
  {
    id: "12345",
    clientName: "Jason Wilson",
    subscriptionType: "Worker",
    dateStarted: "Jan 5, 2022",
    lastMealDate: "Jan 5, 2022",
    totalMeals: 3,
    mealsLeft: 3,
    payment: "Cash",
  },
  {
    id: "12345",
    clientName: "Mark Davis",
    subscriptionType: "weekly",
    dateStarted: "Jan 5, 2022",
    lastMealDate: "Jan 5, 2022",
    totalMeals: 6,
    mealsLeft: 6,
    payment: "MoMo",
  },
  {
    id: "12345",
    clientName: "Kevin Taylor",
    subscriptionType: "Monthly",
    dateStarted: "Jan 5, 2022",
    lastMealDate: "Jan 5, 2022",
    totalMeals: 31,
    mealsLeft: 31,
    payment: "MoMo",
  },
  {
    id: "12345",
    clientName: "Brian Miller",
    subscriptionType: "weekly",
    dateStarted: "Jan 4, 2022",
    lastMealDate: "Jan 4, 2022",
    totalMeals: 17,
    mealsLeft: 17,
    payment: "MoMo",
  },
  {
    id: "12345",
    clientName: "Orlando Diggs",
    subscriptionType: "21 Days",
    dateStarted: "Jan 5, 2022",
    lastMealDate: "Jan 5, 2022",
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
