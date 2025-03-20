// First import the ES modules
import { generateArticle } from './gemini.service';
import { supabaseAdmin } from '@/lib/supabase';
import { ArticleInsert } from '@/types/database.types';

// Then conditionally require node-cron
let cron: any;
if (typeof window === 'undefined') {
  // We're on the server
  cron = require('node-cron');
}

// Schedule article generation
export function scheduleArticleGeneration() {
  // Only run on the server
  if (typeof window !== 'undefined' || !cron) {
    console.log('Scheduler not initialized: running in browser or cron not available');
    return;
  }

  // Morning schedule (9 AM)
  cron.schedule(process.env.ARTICLE_GENERATION_MORNING || '0 9 * * *', async () => {
    console.log('Running morning article generation job');
    await generateAndSaveArticle('Morning');
  });

  // Evening schedule (5 PM)
  cron.schedule(process.env.ARTICLE_GENERATION_EVENING || '0 17 * * *', async () => {
    console.log('Running evening article generation job');
    await generateAndSaveArticle('Evening');
  });

  console.log('Article generation scheduler initialized');
}

// Generate and save an article to Supabase
async function generateAndSaveArticle(timeOfDay: string) {
  try {
    console.log(`Generating ${timeOfDay} article...`);
    
    // Generate article content using Gemini AI
    const article = await generateArticle();
    
    // Prepare article data for insertion
    const articleData: ArticleInsert = {
      title: article.title,
      content: article.content,
      category: article.category,
    };

    // Insert article into Supabase
    const { data, error } = await supabaseAdmin
      .from('articles')
      .insert(articleData)
      .select()
      .single();

    if (error) {
      console.error(`Error saving ${timeOfDay} article:`, error);
      return;
    }

    console.log(`${timeOfDay} article generated and saved successfully:`, data.id);
  } catch (error) {
    console.error(`Error in ${timeOfDay} article generation process:`, error);
  }
}

// New function to generate user-specific article
export async function generateUserSpecificArticle(userId: string, category?: string) {
  try {
    console.log(`Generating user-specific article for user ${userId}...`);
    
    // Generate article content using Gemini AI with user context
    const article = await generateArticle(userId);
    
    // Override category if specified
    if (category) {
      article.category = category;
    }
    
    // Prepare article data for insertion
    const articleData: ArticleInsert = {
      title: article.title,
      content: article.content,
      category: article.category,
    };

    // Insert article into Supabase
    const { data, error } = await supabaseAdmin
      .from('articles')
      .insert(articleData)
      .select()
      .single();

    if (error) {
      console.error(`Error saving user-specific article:`, error);
      throw error;
    }

    console.log(`User-specific article generated and saved successfully:`, data.id);
    return data;
  } catch (error) {
    console.error(`Error in user-specific article generation:`, error);
    throw error;
  }
}