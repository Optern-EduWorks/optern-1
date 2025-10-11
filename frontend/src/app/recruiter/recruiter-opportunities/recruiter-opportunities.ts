import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Job {
  id: number;
  title: string;
  icon: string;
  status: 'active' | 'closed' | 'draft';
  location: string;
  workMode: string;
  salary: string;
  tags: { label: string; color: string }[];
  applicants: number;
  posted: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
}

@Component({
  selector: 'app-recruiter-opportunities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recruiter-opportunities.html',
  styleUrls: ['./recruiter-opportunities.css'],
})
export class RecruiterOpportunitiesComponent {
  viewMode: 'grid' | 'list' = 'grid';
  showDetailModal = false;
  showPostJobModal = false;
  filterActiveTab: string = 'All Jobs';

  selectedJob?: Job;

jobs: Job[] = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    icon: 'S',
    status: 'active',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    salary: '$120,000 - $150,000',
    tags: [
      { label: 'Full time', color: 'blue' },
      { label: 'Senior', color: 'blue' },
      { label: 'Engineering', color: 'blue' }
    ],
    applicants: 45,
    posted: '1/15/2024',
    description: 'Build cutting-edge frontend applications using React and TypeScript, collaborating with UI/UX teams and backend engineers.',
    requirements: ['React', 'TypeScript', 'Team collaboration', '5+ years experience'],
    benefits: ['Health Insurance', '401k Match', 'Flexible Hours']
  },
  {
    id: 2,
    title: 'Data Science Intern',
    icon: 'D',
    status: 'active',
    location: 'New York, NY',
    workMode: 'Remote',
    salary: '$25/hour',
    tags: [
      { label: 'Internship', color: 'orange' },
      { label: 'Intern', color: 'blue' },
      { label: 'Data & Analytics', color: 'blue' }
    ],
    applicants: 32,
    posted: '1/12/2024',
    description: 'Assist the data science team with analysis and machine learning projects while gaining real-world experience.',
    requirements: ['Python', 'Statistics', 'Machine Learning Basics'],
    benefits: ['Mentorship', 'Certificate', 'Stipend']
  },
  {
    id: 3,
    title: 'Backend Engineer',
    icon: 'B',
    status: 'closed',
    location: 'Austin, TX',
    workMode: 'Onsite',
    salary: '$100,000 - $130,000',
    tags: [
      { label: 'Full time', color: 'blue' },
      { label: 'Mid-level', color: 'blue' },
      { label: 'Engineering', color: 'blue' }
    ],
    applicants: 28,
    posted: '1/8/2024',
    description: 'Design scalable backend APIs and services using Node.js, PostgreSQL, and AWS technologies.',
    requirements: ['Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    benefits: ['Health Insurance', 'Dental & Vision', 'Team Outings']
  },
];

  // Add getter methods to avoid template binding errors
  get allJobsCount() { return this.jobs.length; }
  get activeJobsCount() { return this.jobs.filter(j => j.status === 'active').length; }
  get closedJobsCount() { return this.jobs.filter(j => j.status === 'closed').length; }
  get draftJobsCount() { return this.jobs.filter(j => j.status === 'draft').length; }

  openDetailModal(job: Job) {
    this.selectedJob = job;
    this.showDetailModal = true;
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedJob = undefined;
  }

  openPostJobModal() {
    this.showPostJobModal = true;
  }

  closePostJobModal() {
    this.showPostJobModal = false;
  }

  setFilter(tab: string) {
    this.filterActiveTab = tab;
  }
}
