import { tool } from 'ai';
import { z } from 'zod';

export const analyzeJobTool = tool({
  description: 'Analyze job description to extract key requirements, skills, and keywords for resume optimization',
  inputSchema: z.object({
    jobDescription: z.string().describe('The full job description text'),
    jobTitle: z.string().describe('The job title'),
    company: z.string().describe('Company name if mentioned'),
    keyRequirements: z.array(z.string()).describe('Key job requirements and qualifications'),
    requiredSkills: z.array(z.string()).describe('Required technical and soft skills'),
    preferredSkills: z.array(z.string()).describe('Preferred or nice-to-have skills'),
    keywords: z.array(z.string()).describe('Important keywords and phrases from the job description'),
    experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).describe('Required experience level'),
    industryFocus: z.string().optional().describe('Industry or domain focus'),
    workLocation: z.string().optional().describe('Work location if specified')
  }),
  execute: async ({ jobDescription, jobTitle, company, keyRequirements, requiredSkills, preferredSkills, keywords, experienceLevel, industryFocus, workLocation }) => {
    console.log('🎯 JOB ANALYSIS TOOL: Starting execution');
    console.log('📊 Job description length:', jobDescription.length);
    
    try {
      const analysis = {
        jobTitle,
        company,
        keyRequirements,
        requiredSkills,
        preferredSkills,
        keywords,
        experienceLevel,
        industryFocus,
        workLocation
      };

      console.log('✅ Job analysis completed');
      console.log('📊 Analysis overview:', {
        jobTitle,
        company,
        requirementsCount: keyRequirements.length,
        skillsCount: requiredSkills.length + preferredSkills.length,
        keywordsCount: keywords.length,
        experienceLevel
      });
      
      return {
        success: true,
        jobAnalysis: analysis,
        timestamp: new Date().toISOString()
      };
      
    } catch (error: unknown) {
      console.error('❌ Job analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze job description',
        timestamp: new Date().toISOString()
      };
    }
  }
});