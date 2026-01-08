export interface DateRange {
  label: string;
  start: Date;
  end: Date;
}

export const getTodayRange = (): DateRange => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return { label: 'Today', start, end: now };
};

export const getLast7DaysRange = (): DateRange => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6); // 6 days ago + today = 7 days
  start.setHours(0, 0, 0, 0);
  return { label: '7D', start, end: now };
};

export const getCurrentMonthRange = (): DateRange => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return { label: 'Month', start, end: now };
};
