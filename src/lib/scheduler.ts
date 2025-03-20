import { scheduleArticleGeneration } from '@/services/scheduler.service';

let schedulerInitialized = false;

export function initializeScheduler() {
  if (typeof window === 'undefined' && !schedulerInitialized) {
    console.log('Initializing article generation scheduler...');
    scheduleArticleGeneration();
    schedulerInitialized = true;
  }
}