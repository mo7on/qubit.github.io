// This script can be run manually to generate an article
import { generateArticle } from '@/services/gemini.service';
import { supabaseAdmin } from '@/lib/supabase';
import { ArticleInsert } from '@/types/database.types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  try {
    console.log('Generating article...');
    
    // Generate article content using Gemini AI
    const article = await generateArticle();
    
    console.log('Article generated:', article.title);
    
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
      console.error('Error saving article:', error);
      process.exit(1);
    }

    console.log('Article saved successfully with ID:', data.id);
    process.exit(0);
  } catch (error) {
    console.error('Error generating article:', error);
    process.exit(1);
  }
}

main();