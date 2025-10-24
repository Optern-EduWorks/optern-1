export interface RecruiterProfile {
  recruiterID: number;
  companyID: number;
  fullName: string;
  email: string;
  jobTitle: string;
  phoneNumber: string;
  bio: string;
  createdDate: Date;
  updatedDate: Date;
  company?: Company;
}

export interface Company {
  companyID: number;
  name: string;
  website: string;
  size: string;
  address: string;
  phone: string;
  createdDate: string;
  industryID?: number;
  industry?: {
    industryID: number;
    name: string;
  };
}

export interface RecruiterProfileDto {
  RecruiterID: number;
  CompanyID: number;
  FullName: string;
  Email: string;
  JobTitle: string;
  PhoneNumber: string;
  Bio: string;
  CreatedDate: string;
  UpdatedDate: string;
  Company?: {
    CompanyID: number;
    Name: string;
    Website: string;
    Size: string;
    Address: string;
    Phone: string;
    CreatedDate: string;
    IndustryID?: number;
    Industry?: {
      IndustryID: number;
      IndustryName: string;
    };
  };
}
