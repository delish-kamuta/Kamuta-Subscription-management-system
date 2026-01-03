interface StatsCard {
  title: string;
  value: number | string;
  currentDay: number | string;
  lastDayCount: number | string;
}
import { calculateTrendPercentage, cn } from "app/lib/utils";
const StatsCard = ({ title, value, currentDay, lastDayCount }: StatsCard) => {
  const current = typeof currentDay === 'number' ? currentDay : Number(currentDay) || 0;
  const last = typeof lastDayCount === 'number' ? lastDayCount : Number(lastDayCount) || 0;
  const { trend, percentage } = calculateTrendPercentage(current, last);
  const isDecrement = trend === "decrement";
  return (
    <article className="stats-card">
      <h3 className="text-base font-medium">
        {title}
      </h3>
      <div className="content">
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl">{value}</h2>
          <div className="flex items-center gap-2">
            <figure className="flex items-center gap-1">
              <img src={`/assets/icons/${isDecrement ? "arrow-down-red.svg": "arrow-up-green.svg"}`} className="size-5" alt="" />
              <figcaption className={cn('text-sm font-medium', isDecrement ? 'text-red-500': 'text-success-700')}>
                {Math.round(percentage)}%
              </figcaption>
            </figure>
            <p className="text-sm font-medium text-gray-100 truncate">vs yesterday</p>
          </div>
        </div>
        <div className="w-full">
          <img src={`/assets/icons/${isDecrement ?"decrement.svg":"increment.svg"}`} alt="trend graph" className="xl:w-32 w-full h-full md:h-32 xl:h-full" />
        </div>
      </div>
    </article>
  )
}

export default StatsCard
