
import React from 'react';
import MentorTemplateCard from './MentorTemplateCard';

interface MentorTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  gradient?: string;
  expertise?: string;
  learningPath?: { name: string }[];
}

interface MentorTemplateListProps {
  mentors: MentorTemplate[];
  onSelect: (mentorId: string) => void;
}

const MentorTemplateList: React.FC<MentorTemplateListProps> = ({ mentors, onSelect }) => {
  if (!mentors || mentors.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-zinc-400">No mentor templates available.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Mentor Templates</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mentors.map((mentor) => (
          <MentorTemplateCard 
            key={mentor.id}
            mentor={mentor}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default MentorTemplateList;
