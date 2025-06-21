import React, { useState } from 'react';

const timelineData = [
  {
    id: 1,
    year: '2023',
    title: 'R&D Group Manager',
    company: 'AT&T Israel',
    description: 'Leading technology strategy and R&D initiatives',
    impact: 'Transformed product development process, reducing time-to-market by 40% while maintaining quality standards. Led AI integration strategy across multiple product lines.',
    lessons: 'The key to successful technology leadership is balancing innovation with execution. You need to inspire teams to think big while ensuring they deliver results.',
    category: 'leadership'
  },
  {
    id: 2,
    year: '2021',
    title: 'Director of Engineering',
    company: 'AT&T Israel',
    description: 'Led engineering teams and technical strategy',
    impact: 'Built and scaled engineering teams from 15 to 50+ developers. Implemented agile methodologies that improved delivery predictability by 60%.',
    lessons: 'Great engineering teams are built on trust, clear communication, and a shared vision. Technical excellence follows when people feel valued and supported.',
    category: 'leadership'
  },
  {
    id: 3,
    year: '2019',
    title: 'Senior Engineering Manager',
    company: 'Tech Company',
    description: 'Managed multiple development teams',
    impact: 'Led the development of a flagship product that generated $10M+ in revenue. Mentored 8 junior managers who went on to lead their own teams.',
    lessons: 'Leadership is about creating an environment where people can do their best work. Sometimes that means stepping back and letting your team shine.',
    category: 'leadership'
  },
  {
    id: 4,
    year: '2017',
    title: 'Technical Lead',
    company: 'Startup',
    description: 'Led technical architecture and team development',
    impact: 'Architected and delivered a scalable platform that supported 1M+ users. Built a culture of technical excellence and continuous learning.',
    lessons: 'Technical leadership isn\'t about being the smartest person in the room—it\'s about helping everyone else become smarter.',
    category: 'technical'
  },
  {
    id: 5,
    year: '2015',
    title: 'Senior Software Engineer',
    company: 'Growing Tech Company',
    description: 'Full-stack development and system design',
    impact: 'Developed critical infrastructure components that improved system reliability by 99.9%. Contributed to open-source projects used by thousands of developers.',
    lessons: 'The best engineers are those who understand that code is written for humans, not machines. Readability and maintainability matter more than cleverness.',
    category: 'technical'
  },
  {
    id: 6,
    year: '2013',
    title: 'Software Engineer',
    company: 'First Tech Role',
    description: 'Started career in software development',
    impact: 'Built my first production systems and learned the fundamentals of software engineering. Contributed to team processes and documentation.',
    lessons: 'Every role, no matter how junior, is an opportunity to lead. Leadership isn\'t about title—it\'s about taking responsibility and helping others succeed.',
    category: 'technical'
  }
];

export default function Timeline() {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredData = activeCategory === 'all' 
    ? timelineData 
    : timelineData.filter(entry => entry.category === activeCategory);

  return (
    <div className="timeline-container">
      {/* Category Filter */}
      <div className="flex justify-center mb-8 space-x-4">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            activeCategory === 'all'
              ? 'bg-white/20 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/15'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveCategory('leadership')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            activeCategory === 'leadership'
              ? 'bg-blue-500/20 text-blue-200'
              : 'bg-blue-500/10 text-blue-200/70 hover:bg-blue-500/15'
          }`}
        >
          👥 Leadership
        </button>
        <button
          onClick={() => setActiveCategory('technical')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            activeCategory === 'technical'
              ? 'bg-green-500/20 text-green-200'
              : 'bg-green-500/10 text-green-200/70 hover:bg-green-500/15'
          }`}
        >
          ⚙️ Technical
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-white/20 via-white/10 to-white/20"></div>
        
        <div className="space-y-8">
          {filteredData.map((entry, index) => (
            <div
              key={entry.id}
              className={`relative flex items-center ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              {/* Timeline Dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full border-2 border-white/30 z-10"></div>
              
              {/* Content Card */}
              <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                <div 
                  className={`glass-card p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedEntry?.id === entry.id ? 'ring-2 ring-white/30' : ''
                  }`}
                  onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-white">{entry.year}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      entry.category === 'leadership' 
                        ? 'bg-blue-500/20 text-blue-300' 
                        : 'bg-green-500/20 text-green-300'
                    }`}>
                      {entry.category === 'leadership' ? '👥' : '⚙️'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{entry.title}</h3>
                  <p className="text-white/80 text-sm mb-2">{entry.company}</p>
                  <p className="text-white/70 text-sm">{entry.description}</p>
                  
                  {/* Expanded Content */}
                  {selectedEntry?.id === entry.id && (
                    <div className="mt-4 pt-4 border-t border-white/10 animate-fadeIn">
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-white/90 mb-1">💡 Impact</h4>
                        <p className="text-sm text-white/80">{entry.impact}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white/90 mb-1">🎯 Key Lesson</h4>
                        <p className="text-sm text-white/80">{entry.lessons}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 