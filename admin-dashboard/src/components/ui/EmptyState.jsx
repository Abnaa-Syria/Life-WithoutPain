import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'لا توجد بيانات', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Icon className="w-16 h-16 mb-4" />
      <p className="text-lg">{message}</p>
    </div>
  );
}
