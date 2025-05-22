
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRightIcon } from 'lucide-react';

interface MentorTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
}

interface MentorTemplateCardProps {
  mentor: MentorTemplate;
  onSelect: (mentorId: string) => void;
}

const MentorTemplateCard: React.FC<MentorTemplateCardProps> = ({ mentor, onSelect }) => {
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'business': return 'bg-emerald-950 text-emerald-500';
      case 'technology': return 'bg-violet-950 text-violet-500';
      case 'creative': return 'bg-rose-950 text-rose-500';
      case 'language': return 'bg-blue-950 text-blue-500';
      default: return 'bg-amber-950 text-amber-500';
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="text-2xl mr-2">{mentor.icon}</span>
              <h3 className="text-lg font-semibold text-white">{mentor.name}</h3>
            </div>
            <span className={`px-2 py-0.5 text-xs rounded-md ${getCategoryStyle(mentor.category)}`}>
              {mentor.category}
            </span>
          </div>
          <p className="text-gray-400 text-xs line-clamp-2">{mentor.description}</p>
        </div>
        
        <div className="mt-auto pt-3">
          <Button 
            onClick={() => onSelect(mentor.id)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-medium flex items-center justify-center gap-1.5 py-1.5 h-auto"
          >
            Use Template
            <ArrowRightIcon size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MentorTemplateCard;
