import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-opportunities',
  standalone: true,
  imports: [CommonModule],
  // Updated file paths
  templateUrl: './opportunities.html',
  styleUrl: './opportunities.css'
})
// Updated class name
export class Opportunities {
  // Default view is 'list'
  viewMode: 'grid' | 'list' = 'list';

  // Method to switch views
  setView(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  // Sample job data (remains the same)
  jobs = [
    {
      logo: 'https://i.imgur.com/2JV8V4A.png',
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      type: 'Full-time',
      remote: true,
      salary: '$80,000 - $120,000',
      applicants: 45,
      skills: ['React', 'TypeScript', 'Tailwind CSS'],
      description: 'Join our innovative team building next-generation web applications.',
      rating: 4.8,
      posted: '2 days ago',
      priority: 'high priority'
    },
    {
      logo: 'https://i.imgur.com/5g2x4sB.png',
      title: 'Data Analyst',
      company: 'DataFlow Inc.',
      location: 'New York, NY',
      type: 'Full-time',
      remote: false,
      salary: '$65,000 - $90,000',
      applicants: 23,
      skills: ['Python', 'SQL', 'Tableau'],
      description: 'Analyze complex datasets to derive business decisions.',
      rating: 4.6,
      posted: '1 week ago',
      priority: 'medium priority'
    },
    {
      logo: 'https://i.imgur.com/s65r3vV.png',
      title: 'UX Designer',
      company: 'Design Studio',
      location: 'Remote',
      type: 'Contract',
      remote: true,
      salary: '$45,000 - $85,000',
      applicants: 67,
      skills: ['Figma', 'Prototyping', 'User Research'],
      description: 'Create beautiful and intuitive user experiences.',
      rating: 4.9,
      posted: '3 days ago',
      priority: 'low priority'
    },
    {
      logo: 'https://i.imgur.com/PvYpGk5.png',
      title: 'Product Manager',
      company: 'InnovateCo',
      location: 'Austin, TX',
      type: 'Full-time',
      remote: true,
      salary: '$95,000 - $130,000',
      applicants: 12,
      skills: ['Strategy', 'Analytics', 'Leadership'],
      description: 'Lead product development from conception to launch.',
      rating: 4.7,
      posted: '5 days ago',
      priority: 'high priority'
    },
    {
      logo: 'https://i.imgur.com/2JV8V4A.png',
      title: 'Software Engineer',
      company: 'StartUpXYZ',
      location: 'Seattle, WA',
      type: 'Full-time',
      remote: false,
      salary: '$90,000 - $140,000',
      applicants: 34,
      skills: ['Node.js', 'AWS', 'Docker'],
      description: 'Build scalable backend systems for millions of users.',
      rating: 4.5,
      posted: '1 week ago',
      priority: 'high priority'
    },
    {
      logo: 'https://i.imgur.com/5g2x4sB.png',
      title: 'Marketing Coordinator',
      company: 'GrowthLLC',
      location: 'Chicago, IL',
      type: 'Full-time',
      remote: false,
      salary: '$45,000 - $65,000',
      applicants: 34,
      skills: ['Content Creation', 'Social Media', 'Analytics'],
      description: 'Drive marketing campaigns and brand awareness.',
      rating: 4.4,
      posted: '1 week ago',
      priority: 'medium priority'
    }
  ];
}
