#!/usr/bin/env npx tsx

import { ResumeOptimizerAgent } from './agent';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key] = value;
      }
    }
  }
}

// Check for API key
const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY environment variable is required');
  console.error('💡 Please set it in your .env.local file');
  process.exit(1);
}

console.log('🔑 Using API key:', GEMINI_API_KEY.substring(0, 10) + '...');

async function startResumeOptimizer() {
  console.log('🚀 Resume Optimizer Agent - Interactive CLI\n');
  
  const agent = new ResumeOptimizerAgent();
  
  // Show tool inventory
  console.log('🔧 Tool Inventory:');
  const inventory = agent.getToolInventory();
  console.log(`Total tools: ${inventory.total}`);
  console.log(`Available tools: ${inventory.allTools.join(', ')}\n`);
  
  console.log('📝 Resume Optimization System');
  console.log('This system takes a resume and job description, then optimizes the resume for that specific job.\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askQuestion = (question: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  };
  
  while (true) {
    try {
      console.log('📋 Step 1: Provide Resume Text');
      const resumeText = await askQuestion('Paste your resume text (all in one line): ');
      
      if (resumeText.toLowerCase().trim() === 'exit') {
        console.log('\n👋 Goodbye!');
        break;
      }
      
      if (!resumeText.trim()) {
        console.log('Please provide resume text or type "exit" to quit.\n');
        continue;
      }
      
      console.log('\n🎯 Step 2: Provide Job Description');
      const jobDescription = await askQuestion('Paste the job description (all in one line): ');
      
      if (!jobDescription.trim()) {
        console.log('Please provide job description.\n');
        continue;
      }
      
      console.log('\n' + '='.repeat(80));
      console.log('🚀 OPTIMIZING RESUME FOR TARGET JOB');
      console.log('='.repeat(80));
      
      const result = await agent.optimizeResume(
        { resumeText, jobDescription },
        (progress) => {
          console.log(`🔄 ${progress.message}`);
          if (progress.toolsUsed && progress.toolsUsed.length > 0) {
            console.log(`   🔧 Tools: ${progress.toolsUsed.join(', ')}`);
          }
        }
      );
      
      console.log('\n📤 OPTIMIZATION RESULTS:');
      console.log('='.repeat(50));
      
      if (result.success && result.optimizedResumeData) {
        console.log('✅ Resume successfully optimized!\n');
        
        const optimized = result.optimizedResumeData;
        
        console.log('👤 CONTACT INFORMATION:');
        console.log(`Name: ${optimized.contactInfo.name}`);
        console.log(`Email: ${optimized.contactInfo.email}`);
        if (optimized.contactInfo.phone) console.log(`Phone: ${optimized.contactInfo.phone}`);
        if (optimized.contactInfo.location) console.log(`Location: ${optimized.contactInfo.location}`);
        if (optimized.contactInfo.linkedin) console.log(`LinkedIn: ${optimized.contactInfo.linkedin}`);
        if (optimized.contactInfo.website) console.log(`Website: ${optimized.contactInfo.website}`);
        
        if (optimized.summary) {
          console.log('\n📝 OPTIMIZED SUMMARY:');
          console.log(optimized.summary);
        }
        
        if (optimized.experience && optimized.experience.length > 0) {
          console.log('\n💼 OPTIMIZED EXPERIENCE:');
          optimized.experience.forEach((exp, idx) => {
            console.log(`\n${idx + 1}. ${exp.title} at ${exp.company}`);
            console.log(`   ${exp.startDate} - ${exp.endDate || 'Present'}`);
            if (exp.description) console.log(`   ${exp.description}`);
            if (exp.achievements && exp.achievements.length > 0) {
              console.log('   Achievements:');
              exp.achievements.forEach(achievement => {
                console.log(`   • ${achievement}`);
              });
            }
          });
        }
        
        if (optimized.skills && optimized.skills.length > 0) {
          console.log('\n🛠️  OPTIMIZED SKILLS:');
          const skillsByCategory = optimized.skills.reduce((acc: any, skill) => {
            if (!acc[skill.category]) acc[skill.category] = [];
            acc[skill.category].push(skill.name);
            return acc;
          }, {});
          
          Object.entries(skillsByCategory).forEach(([category, skills]: [string, any]) => {
            console.log(`${category}: ${skills.join(', ')}`);
          });
        }
        
        console.log(`\n⏱️  Execution Time: ${result.executionTime}ms`);
        if (result.toolsUsed && result.toolsUsed.length > 0) {
          console.log(`🔧 Tools Used: ${result.toolsUsed.join(', ')}`);
        }
        
      } else {
        console.log(`❌ Optimization failed: ${result.error}`);
      }
      
      console.log('\n' + '-'.repeat(80) + '\n');
      
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      console.log('\n' + '-'.repeat(80) + '\n');
    }
  }
  
  rl.close();
}

// Start the resume optimizer
startResumeOptimizer().catch(console.error);