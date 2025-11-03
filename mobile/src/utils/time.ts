export const roundTime = (minutes: number, roundTo: number): number => {
  return Math.ceil(minutes / roundTo) * roundTo;
};

export const calculateDuration = (startTime: Date, endTime: Date): number => {
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.floor(diffMs / 1000 / 60); // Convert to minutes
};

export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

export const startOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const endOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

export const startOfWeek = (date: Date, weekStartsOn: number = 0): Date => {
  const day = date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  const newDate = new Date(date);
  newDate.setDate(date.getDate() - diff);
  return startOfDay(newDate);
};

export const endOfWeek = (date: Date, weekStartsOn: number = 0): Date => {
  const startDate = startOfWeek(date, weekStartsOn);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return endOfDay(endDate);
};

export const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const endOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};
