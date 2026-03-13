import { format, formatDistanceToNow, isAfter, isPast } from 'date-fns';

export const formatDate = (date: string) =>
  format(new Date(date), 'MMM d, yyyy');

export const formatRelative = (date: string) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatDue = (date: string) =>
  format(new Date(date), 'MMM d');

export const isOverdue = (dueDate: string) =>
  isAfter(new Date(), new Date(dueDate));

export const isDueSoon = (dueDate: string) => {
  const due  = new Date(dueDate);
  const soon = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
  return !isPast(due) && due <= soon;
};
