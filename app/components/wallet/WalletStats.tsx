interface WalletStatsProps {
  data: {
    prepaid_amount: number;
    remaining_amount: number;
    credit_limit: number;
    credit_used: number;
  }
}

export function WalletStats({ data }: WalletStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 border rounded">
        <p className="text-xs text-gray-500">Prepaid Amount</p>
        <p className="text-lg font-semibold">{data.prepaid_amount}</p>
      </div>
      <div className="p-4 border rounded">
        <p className="text-xs text-gray-500">Credit Limit</p>
        <p className="text-lg font-semibold">{data.credit_limit}</p>
      </div>
      <div className="p-4 border rounded">
        <p className="text-xs text-gray-500">Credit Used</p>
        <p className="text-lg font-semibold">{data.credit_used}</p>
      </div>
    </div>
  )
}