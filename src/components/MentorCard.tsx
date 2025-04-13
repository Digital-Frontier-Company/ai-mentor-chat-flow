
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MentorType } from '@/contexts/MentorContext';

interface MentorCardProps {
  mentor: MentorType;
  selected: boolean;
  onClick: () => void;
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor, selected, onClick }) => {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 overflow-hidden 
                 ${selected ? 'ring-2 ring-primary scale-105' : 'hover:scale-105'}`}
      onClick={onClick}
    >
      <div className={`w-full h-2 bg-gradient-to-r ${mentor.gradient}`}></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <span className="text-3xl">{mentor.icon}</span>
            <span className="text-lg">{mentor.name}</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{mentor.description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default MentorCard;
