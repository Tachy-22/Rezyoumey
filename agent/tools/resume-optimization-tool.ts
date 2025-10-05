import { tool } from 'ai';
import { z } from 'zod';
import { ResumeData } from './resume-extraction-tool';

export const optimizeResumeTool = tool({
  description: 'Optimize resume data for a specific job by enhancing content while keeping all facts accurate',
  inputSchema: z.object({
    originalResumeData: z.any().describe('The original extracted resume data'),
    jobAnalysis: z.any().describe('The job analysis results'),
    contactInfo: z.object({
      name: z.string().describe('Full name (unchanged)'),
      email: z.string().describe('Email address (unchanged)'),
      phone: z.string().optional().describe('Phone number (unchanged)'),
      location: z.string().optional().describe('Location (unchanged)'),
      linkedin: z.string().optional().describe('LinkedIn profile (unchanged)'),
      website: z.string().optional().describe('Personal website (unchanged)'),
      github: z.string().optional().describe('GitHub profile (unchanged)')
    }),
    summary: z.string().optional().describe('Professional summary optimized for the target job'),
    experience: z.array(z.object({
      title: z.string().describe('Job title (unchanged)'),
      company: z.string().describe('Company name (unchanged)'),
      startDate: z.string().describe('Start date (unchanged)'),
      endDate: z.string().optional().describe('End date (unchanged)'),
      location: z.string().optional().describe('Job location (unchanged)'),
      description: z.string().optional().describe('Job description optimized for target role'),
      achievements: z.array(z.string()).optional().describe('Achievements rewritten to highlight relevant skills and impact')
    })),
    education: z.array(z.object({
      degree: z.string().describe('Degree title (unchanged)'),
      institution: z.string().describe('School name (unchanged)'),
      graduationDate: z.string().optional().describe('Graduation date (unchanged)'),
      location: z.string().optional().describe('School location (unchanged)'),
      gpa: z.string().optional().describe('GPA (unchanged)'),
      honors: z.array(z.string()).optional().describe('Honors (unchanged)')
    })).optional(),
    skills: z.array(z.object({
      name: z.string().describe('Skill name'),
      category: z.string().describe('Skill category'),
      level: z.string().optional().describe('Skill level')
    })).describe('Skills reordered and categorized to match job requirements')
  }),
  execute: async ({ originalResumeData, jobAnalysis, contactInfo, summary, experience, education, skills }) => {
    console.log('✨ RESUME OPTIMIZATION TOOL: Starting execution');
    
    try {
      const optimizedResume: ResumeData = {
        contactInfo,
        summary,
        experience,
        education,
        skills
      };

      console.log('✅ Resume optimization completed');
      console.log('📊 Optimization overview:', {
        originalExperienceCount: originalResumeData.experience?.length || 0,
        optimizedExperienceCount: experience.length,
        originalSkillsCount: originalResumeData.skills?.length || 0,
        optimizedSkillsCount: skills.length,
        targetJob: jobAnalysis.jobTitle,
        targetCompany: jobAnalysis.company
      });
      
      return {
        success: true,
        optimizedResumeData: optimizedResume,
        optimizationApplied: true,
        targetJob: jobAnalysis.jobTitle,
        timestamp: new Date().toISOString()
      };
      
    } catch (error: unknown) {
      console.error('❌ Resume optimization failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to optimize resume',
        timestamp: new Date().toISOString()
      };
    }
  }
});