'use client';

import React from 'react';
import { BeatLoader } from 'react-spinners';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  label?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 12,
  color = '#36d7b7',
  label = 'Loading ShopSync...',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-4 animate-in fade-in duration-200">
      <BeatLoader color={color} size={size} margin={4} />
      {label && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono tracking-wide">
          {label}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
}

