import React from 'react';

export default function AdBannerBlock({ block }: { block: any }) {
  return (
    <div className="w-full h-24 bg-gray-100 flex items-center justify-center rounded-xl border border-gray-200 shadow-sm mb-8">
      <span className="text-gray-400 text-sm tracking-widest uppercase font-semibold">
        REKLAM ALANI {block.title && `(${block.title})`}
      </span>
    </div>
  );
}
