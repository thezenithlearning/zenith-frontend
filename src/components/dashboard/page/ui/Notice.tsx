import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck } from 'lucide-react';

interface NoticeProps {
  tone: 'error' | 'success';
  children: ReactNode;
}

const tones = {
  error: 'border-gray-200 bg-red-50 text-red-700 ',
  success: 'border-gray-200 bg-green-50 text-green-700 ',
};

export function Notice({ tone, children }: NoticeProps) {
  const Icon = tone === 'error' ? CircleAlert : CircleCheck;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${tones[tone]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}
