import React from 'react';

export interface JobCardProps {
  title: string;
  company: string;
  location: string;
  salary?: string;
  tags?: string[];
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
}

export default function JobCard({ title, company, location, salary, tags = [] }: JobCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-600 mt-1">{company}</p>
      <p className="text-gray-500 text-sm mt-1">{location}</p>
      {salary && <p className="text-indigo-600 font-semibold mt-2">{salary}</p>}
      <div className="flex flex-wrap gap-2 mt-4">
        {tags.map(tag => (
          <span key={tag} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}