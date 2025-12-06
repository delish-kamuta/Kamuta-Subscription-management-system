import StatsCard from "../../../components/StatsCard";

interface PaymentData {
  paymentId: string;
  clientName: string;
  branch: string;
  subscriptionType: string;
  amountPaid: number;
  totalMeals: number;
  paymentDate: string;
  addedNotes: string;
  payment: string;
}

interface FinancialStatsSectionProps {
  paymentsData: PaymentData[];
}

export default function FinancialStatsSection({ paymentsData }: FinancialStatsSectionProps) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);
  const endOfLastWeek = new Date(startOfWeek);
  endOfLastWeek.setDate(startOfWeek.getDate() - 1);

  const totalRevenue = paymentsData.reduce((sum, payment) => {
    return sum + payment.amountPaid;
  }, 0);

  const todayRevenue = paymentsData
    .filter((payment) => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate.toDateString() === today.toDateString();
    })
    .reduce((sum, payment) => sum + payment.amountPaid, 0);

  const yesterdayRevenue = paymentsData
    .filter((payment) => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate.toDateString() === yesterday.toDateString();
    })
    .reduce((sum, payment) => sum + payment.amountPaid, 0);

  const thisWeekRevenue = paymentsData
    .filter((payment) => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate >= startOfWeek && paymentDate <= today;
    })
    .reduce((sum, payment) => sum + payment.amountPaid, 0);

  const lastWeekRevenue = paymentsData
    .filter((payment) => {
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate >= startOfLastWeek && paymentDate <= endOfLastWeek;
    })
    .reduce((sum, payment) => sum + payment.amountPaid, 0);

  const todayPaymentsCount = paymentsData.filter((payment) => {
    const paymentDate = new Date(payment.paymentDate);
    return paymentDate.toDateString() === today.toDateString();
  }).length;

  const yesterdayPaymentsCount = paymentsData.filter((payment) => {
    const paymentDate = new Date(payment.paymentDate);
    return paymentDate.toDateString() === yesterday.toDateString();
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6">
      <StatsCard
        title="Total Revenue"
        value={totalRevenue}
        currentDay={todayRevenue}
        lastDayCount={yesterdayRevenue}
      />
      <StatsCard
        title="Weekly Revenue"
        value={thisWeekRevenue}
        currentDay={thisWeekRevenue}
        lastDayCount={lastWeekRevenue}
      />
      <StatsCard
        title="Total Payments"
        value={paymentsData.length}
        currentDay={todayPaymentsCount}
        lastDayCount={yesterdayPaymentsCount}
      />
    </div>
  );
}
