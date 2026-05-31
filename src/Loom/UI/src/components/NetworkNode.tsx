import React from 'react';
import { X } from 'lucide-react';

import { Card, CardContent } from '@shadcn/components/ui/card';
import type { Network } from '@/types';

interface NetworkNodeProps {
  network: Network;
  index: number;
  onRemove: (id: string) => void;
  onAddContainer: () => void;
  onClick: (network: Network) => void;
  children?: React.ReactNode;
}

const networkColors = [
  'rgba(99, 102, 241, 0.25)',  // indigo
  'rgba(168, 85, 247, 0.25)',  // purple
  'rgba(59, 130, 246, 0.25)',  // blue
  'rgba(20, 184, 166, 0.25)',  // teal
  'rgba(234, 179, 8, 0.25)',   // yellow
  'rgba(249, 115, 22, 0.25)',  // orange
  'rgba(236, 72, 153, 0.25)',  // pink
];

export const NetworkNode = ({ network, index, onRemove, onAddContainer, onClick, children }: NetworkNodeProps) => {
  const bg = networkColors[index % networkColors.length];

  return (
    <Card
      className="min-w-64 max-w-xl min-h-32 p-4 m-2 relative rounded-md cursor-pointer"
      style={{ backgroundColor: bg }}
      onClick={() => {onClick(network)}}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-brand-lavender">{network.name}</span>
        <span
          className="cursor-pointer text-brand-muted hover:text-white transition-colors"
          onClick={e => {
            e.stopPropagation();
            onRemove(network.id);
          }}
          aria-label={`Remove network ${network.name}`}
        >
          <X className="h-4 w-4" />
        </span>
      </div>
      <span className="text-xs text-white/40 block">
        {network.driver}{network.attachable ? ', attachable' : ''}
      </span>
      <button
        type="button"
        onClick={ e => {
          e.stopPropagation();
          onAddContainer();
        }}
        className="w-full rounded-md border-3 border-white/20 text-white/40 hover:text-white/80 hover:border-white/40 transition-colors py-1 text-lg leading-none"
      >
        +
      </button>
      <CardContent className="flex flex-row flex-wrap gap-2 p-0">
        {children}
      </CardContent>
      
    </Card>
  );
};