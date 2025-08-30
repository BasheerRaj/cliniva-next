import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CollapsibleCardProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleCard({
  title,
  isOpen,
  onToggle,
  children,
  className = ""
}: CollapsibleCardProps) {
  return (
    <Card className={`bg-background border-border shadow-sm ${className}`}>
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={onToggle}
          >
            <h3 className="text-lg font-bold text-primary font-lato">
              {title}
            </h3>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-primary" />
            ) : (
              <ChevronDown className="w-5 h-5 text-primary" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-6 pb-6">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
