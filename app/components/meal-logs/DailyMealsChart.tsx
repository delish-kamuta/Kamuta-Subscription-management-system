import { TrendList } from "~/../components/TrendList";

interface DailyLog {
  date: string;
  count: number;
  filterValue?: string; // Optional raw value for filtering
}

interface DailyMealsChartProps {
  data: DailyLog[];
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
}

export const DailyMealsChart = ({ data, selectedDate, onSelectDate }: DailyMealsChartProps) => {
  // Transform data for TrendList
  const trendItems = (data || []).map(d => ({
    label: d.date,
    value: d.count,
    formattedValue: `${d.count.toLocaleString()} meals`,
    key: d.filterValue // Use filterValue as the unique key for selection
  }));

  const handleSelect = (item: any) => {
    // Check if we are clearing (empty key) or selecting
    if (!item.key) {
        if (onSelectDate) onSelectDate(""); 
        return;
    }
    
    if (onSelectDate) {
        onSelectDate(item.key); 
    }
  };

  return (
    <TrendList 
      title="Meals Log Trends"
      items={trendItems}
      selectedKey={selectedDate}
      onSelect={onSelectDate ? handleSelect : undefined}
      emptyMessage="No meal data available"
    />
  );
};

