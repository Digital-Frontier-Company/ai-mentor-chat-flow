
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRightIcon } from 'lucide-react';

interface UserMentor {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface UserMentorCardProps {
  mentor: UserMentor;
  onSelect: (mentorId: string) => void;
}

const UserMentorCard: React.FC<UserMentorCardProps> = ({ mentor, onSelect }) => {
  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-lime-500 transition-all cursor-pointer">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="text-2xl mr-2">{mentor.icon}</span>
              <h3 className="text-lg font-semibold text-white">{mentor.name}</h3>
            </div>
            <span className="px-2 py-0.5 text-xs rounded-md bg-lime-950 text-lime-500">
              custom
            </span>
          </div>
          <p className="text-gray-400 text-xs line-clamp-2">{mentor.description}</p>
        </div>
        
        <div className="mt-auto pt-3">
          <Button 
            onClick={() => onSelect(mentor.id)}
            className="w-full bg-lime-500 hover:bg-lime-600 text-black text-sm font-medium flex items-center justify-center gap-1.5 py-1.5 h-auto"
          >
            Use Mentor
            <ArrowRightIcon size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserMentorCard;
