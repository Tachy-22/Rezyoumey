import { tool } from 'ai';
import { z } from 'zod';

// Interfaces matching ResumeTemplate1 structure
export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

export interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
  achievements?: string[];
}

export interface Education {
  degree: string;
  institution: string;
  graduationDate?: string;
  location?: string;
  gpa?: string;
  honors?: string[];
}

export interface Skill {
  name: string;
  category: string;
  level?: string;
}

export interface ResumeData {
  contactInfo: ContactInfo;
  summary?: string;
  experience: Experience[];
  education?: Education[];
  skills: Skill[];
}

export const extractResumeDataTool = tool({
  description: 'Extract and structure resume information from resume text into ResumeData format',
  inputSchema: z.object({
    resumeText: z.string().describe('The full resume text to extract information from'),
    contactInfo: z.object({
      name: z.string().describe('Full name from resume'),
      email: z.string().describe('Email address'),
      phone: z.string().optional().describe('Phone number'),
      location: z.string().optional().describe('Location/address'),
      linkedin: z.string().optional().describe('LinkedIn profile'),
      website: z.string().optional().describe('Personal website'),
      github: z.string().optional().describe('GitHub profile')
    }),
    summary: z.string().optional().describe('Professional summary or objective'),
    experience: z.array(z.object({
      title: z.string().describe('Job title'),
      company: z.string().describe('Company name'),
      startDate: z.string().describe('Start date'),
      endDate: z.string().optional().describe('End date or "Present"'),
      location: z.string().optional().describe('Job location'),
      description: z.string().optional().describe('Job description'),
      achievements: z.array(z.string()).optional().describe('Key achievements or responsibilities')
    })),
    education: z.array(z.object({
      degree: z.string().describe('Degree title'),
      institution: z.string().describe('School/university name'),
      graduationDate: z.string().optional().describe('Graduation date'),
      location: z.string().optional().describe('School location'),
      gpa: z.string().optional().describe('GPA if mentioned'),
      honors: z.array(z.string()).optional().describe('Honors or achievements')
    })).optional(),
    skills: z.array(z.object({
      name: z.string().describe('Skill name'),
      category: z.string().describe('Skill category (technical, soft, language, etc.)'),
      level: z.string().optional().describe('Skill level (beginner, intermediate, advanced)')
    }))
  }),
  execute: async ({ resumeText, contactInfo, summary, experience, education, skills }) => {
    console.log('📋 RESUME EXTRACTION TOOL: Starting execution');
    console.log('📊 Resume text length:', resumeText.length);
    
    try {
      const extractedData: ResumeData = {
      contactInfo,
        summary,
        experience,
        education,
        skills
      };

      console.log('✅ Resume data extracted successfully');
      console.log('📊 Extracted data overview:', {
        hasContactInfo: !!contactInfo.name,
        hasSummary: !!summary,
        experienceCount: experience.length,
        educationCount: education?.length || 0,
        skillsCount: skills.length
      });
      
      return {
        success: true,
        resumeData: extractedData,
        timestamp: new Date().toISOString()
      };
      
    } catch (error: unknown) {
      console.error('❌ Resume extraction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract resume data',
        timestamp: new Date().toISOString()
      };
    }
  }
});