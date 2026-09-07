import { X } from 'lucide-react';

import { Card } from '@shadcn/components/ui/card';
import type { Container } from '@/types';

interface ContainerNodeProps {
  container: Container;
  onClick: (container: Container) => void;
  onRemove: (id: string) => void;
}

export const ContainerNode = ({ container, onRemove, onClick }: ContainerNodeProps) => {
  return (
    <Card 
      className="min-w-40 max-w-xl p-3 m-2 relative border-dashed border-2 bg-white/10 border-white/30 rounded-md cursor-pointer"
      onClick={e => {
        e.stopPropagation();
        onClick(container);
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white/90">{container.name}</span>
          <span className="text-xs text-white/50 mt-6">{container.image}{container.tag ? `:${container.tag}` : ''}</span>
          {container.ports && container.ports.length > 0 && (
            <span className="text-xs text-white/40 mt-1">
              {container.ports.map(p => `:${p}`).join(', ')}
            </span>
          )}
        </div>
        <span
          className="cursor-pointer text-white/50 hover:text-white transition-colors"
          onClick={e => {
            e.stopPropagation();
            onRemove(container.id);
          }}
          aria-label={`Remove container ${container.name}`}
        >
          <X className="h-3 w-3" />
        </span>
      </div>
    </Card>
  );
};