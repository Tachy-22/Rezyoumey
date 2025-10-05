#!/usr/bin/env npx tsx

import { Agent } from './agents/agent/agent';
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

async function startInteractiveCLI() {
  console.log('🚀 Agent - Interactive CLI\n');

  const agent = new Agent();

  // Show tool inventory
  console.log('🔧 Tool Inventory:');
  const inventory = agent.getToolInventory();
  console.log(`Total tools: ${inventory.total}`);
  console.log(`Available tools: ${inventory.allTools.join(', ')}\n`);

  console.log('💡 Available information:');
  console.log('   - Name: Entekume Jeffrey');
  console.log('   - Age: 25');
  console.log('   - Location: Nigeria');
  console.log('   - Profession: Software Engineer');
  console.log('   - Experience: 4 years\n');

  console.log('📝 Ask me questions about this person! (Type "exit" to quit)\n');

  const userContext = {
    userId: 'cli-user',
    conversationHistory: [] as Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }>
  };

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = (): Promise<string> => {
    return new Promise((resolve) => {
      rl.question('❓ Your question: ', (answer) => {
        resolve(answer);
      });
    });
  };

  while (true) {
    try {
      const question = await askQuestion();

      if (question.toLowerCase().trim() === 'exit') {
        console.log('\n👋 Goodbye!');
        break;
      }

      if (!question.trim()) {
        console.log('Please ask a question or type "exit" to quit.\n');
        continue;
      }

      console.log('\n' + '='.repeat(60));
      console.log(`Processing: "${question}"`);
      console.log('='.repeat(60));

      const result = await agent.executeTask(
        question,
        userContext,
        (progress) => {
          console.log(`🔄 ${progress.message}`);
          if (progress.toolsUsed && progress.toolsUsed.length > 0) {
            console.log(`   🔧 Tools: ${progress.toolsUsed.join(', ')}`);
          }
        }
      );

      console.log('\n📤 RESPONSE:');
      if (result.success) {
        console.log(`✅ ${result.response}`);
        console.log(`\n⏱️  Execution Time: ${result.executionTime}ms`);
        console.log(`📊 Steps Used: ${result.stepsUsed}`);
        if (result.toolsUsed && result.toolsUsed.length > 0) {
          console.log(`🔧 Tools Used: ${result.toolsUsed.join(', ')}`);
        }

        // Add to conversation history for context
        userContext.conversationHistory.push(
          { role: 'user', content: question },
          { role: 'assistant', content: result.response }
        );
      } else {
        console.log(`❌ Error: ${result.response}`);
        if (result.errors && result.errors.length > 0) {
          console.log(`🚨 Details: ${result.errors.join(', ')}`);
        }
      }

      console.log('\n' + '-'.repeat(60) + '\n');

    } catch (error) {
      console.error('❌ Unexpected error:', error);
      console.log('\n' + '-'.repeat(60) + '\n');
    }
  }

  rl.close();
}

// Start the interactive CLI
startInteractiveCLI().catch(console.error);