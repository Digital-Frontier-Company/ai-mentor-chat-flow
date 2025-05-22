
import React from 'react';
import UserMentorCard from './UserMentorCard';

interface UserMentor {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface UserMentorListProps {
  mentors: UserMentor[];
  onSelect: (mentorId: string) => void;
}

const UserMentorList: React.FC<UserMentorListProps> = ({ mentors, onSelect }) => {
  if (!mentors || mentors.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Your Custom Mentors</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mentors.map((mentor) => (
          <UserMentorCard 
            key={mentor.id}
            mentor={mentor}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default UserMentorList;
