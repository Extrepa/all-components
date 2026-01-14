import { BatchJob, BatchJobItem, GameAsset, AIProviderType } from '../types';
import { generateAssetImage, generateAssetMetadata, getAIService } from './aiService';
import { imageUrlToBase64 } from '../utils';
import { storageService } from './storageService';

/**
 * Batch generation service with job queue
 */
class BatchService {
  private jobs: Map<string, BatchJob> = new Map();
  private activeJobId: string | null = null;
  private isProcessing = false;
  private concurrencyLimit = 2; // Process 2 items at a time to respect rate limits
  private activePromises: Set<Promise<void>> = new Set();

  /**
   * Create a new batch job
   */
  createJob(name: string, items: Omit<BatchJobItem, 'id' | 'status' | 'result' | 'error'>[]): BatchJob {
    const job: BatchJob = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      items: items.map((item, index) => ({
        ...item,
        id: `item-${Date.now()}-${index}`,
        status: 'pending' as const
      })),
      status: 'pending',
      progress: {
        total: items.length,
        completed: 0,
        failed: 0
      },
      createdAt: Date.now()
    };

    this.jobs.set(job.id, job);
    return job;
  }

  /**
   * Get a job by ID
   */
  getJob(jobId: string): BatchJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): BatchJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Start processing a batch job
   */
  async startJob(jobId: string, provider: AIProviderType, onProgress?: (job: BatchJob) => void): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    if (this.activeJobId && this.activeJobId !== jobId) {
      throw new Error('Another job is already running');
    }

    this.activeJobId = jobId;
    job.status = 'running';
    onProgress?.(job);

    // Set provider
    getAIService({ type: provider });

    // Process items with concurrency limit
    // Re-filter pending items each iteration to catch retried items
    while (true) {
      // Check if job is paused
      if (job.status === 'paused') {
        break;
      }

      // Get current pending items (re-filter to catch retried items)
      const pendingItems = job.items.filter(item => item.status === 'pending');
      
      // Start new items up to concurrency limit
      while (this.activePromises.size < this.concurrencyLimit && pendingItems.length > 0) {
        const item = pendingItems.shift()!;
        const promise = this.processItem(job, item, provider, onProgress);
        this.activePromises.add(promise);
        
        promise.finally(() => {
          this.activePromises.delete(promise);
        });
      }

      // Check if we're done
      const allDone = job.items.every(item => item.status === 'complete' || item.status === 'error');
      if (allDone && this.activePromises.size === 0) {
        break;
      }

      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Mark job as completed if all items are done
    if (job.items.every(item => item.status === 'complete' || item.status === 'error')) {
      job.status = job.items.some(item => item.status === 'error') ? 'error' : 'completed';
      job.completedAt = Date.now();
      onProgress?.(job);
    }

    if (this.activeJobId === jobId) {
      this.activeJobId = null;
    }
  }

  /**
   * Process a single batch item
   */
  private async processItem(
    job: BatchJob,
    item: BatchJobItem,
    provider: AIProviderType,
    onProgress?: (job: BatchJob) => void
  ): Promise<void> {
    item.status = 'generating';
    onProgress?.(job);

    try {
      // Prepare input image if needed
      let inputImageBase64: string | undefined = undefined;
      if (item.sourceImageUrl) {
        if (item.sourceImageUrl.startsWith('data:')) {
          inputImageBase64 = item.sourceImageUrl.split(',')[1];
        } else {
          const base64 = await imageUrlToBase64(item.sourceImageUrl);
          if (base64) {
            inputImageBase64 = base64;
          }
        }
      }

      // Generate image
      const imageUri = await generateAssetImage(item.prompt, inputImageBase64);

      // Generate metadata
      const metadata = await generateAssetMetadata(item.name, item.prompt);

      // Create result asset
      const result: GameAsset = {
        id: item.id,
        name: item.name,
        type: item.type,
        originalPrompt: item.prompt,
        remixPrompt: item.prompt,
        imageUrl: imageUri,
        sourceImageUrl: item.sourceImageUrl,
        metadata,
        status: 'complete',
        timestamp: Date.now()
      };

      item.result = result;
      item.status = 'complete';
      job.progress.completed++;

      // Auto-save to storage
      try {
        await storageService.saveAsset(result);
      } catch (error) {
        console.warn('Failed to save batch item:', error);
      }

      onProgress?.(job);
    } catch (error: any) {
      console.error('Batch item generation failed:', error);
      item.status = 'error';
      item.error = error && typeof error === 'object' && 'category' in error
        ? error
        : {
            category: 'generation_error',
            message: error?.message || 'Unknown error',
            userMessage: 'Generation failed',
            retryable: true
          };
      job.progress.failed++;
      onProgress?.(job);
    }
  }

  /**
   * Pause a running job
   */
  pauseJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && job.status === 'running') {
      job.status = 'paused';
    }
  }

  /**
   * Resume a paused job
   */
  async resumeJob(jobId: string, provider: AIProviderType, onProgress?: (job: BatchJob) => void): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');
    
    if (job.status === 'paused') {
      job.status = 'running';
      await this.startJob(jobId, provider, onProgress);
    }
  }

  /**
   * Delete a job
   */
  deleteJob(jobId: string): void {
    this.jobs.delete(jobId);
    if (this.activeJobId === jobId) {
      this.activeJobId = null;
    }
  }

  /**
   * Retry failed items in a job
   */
  async retryFailedItems(jobId: string, provider: AIProviderType, onProgress?: (job: BatchJob) => void): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    // Reset failed items to pending
    job.items.forEach(item => {
      if (item.status === 'error') {
        item.status = 'pending';
        item.error = undefined;
      }
    });

    job.progress.failed = 0;
    job.status = 'running';
    
    await this.startJob(jobId, provider, onProgress);
  }

  /**
   * Export batch results as JSON
   */
  exportJobResults(jobId: string): string {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    const results = job.items
      .filter(item => item.result)
      .map(item => item.result!);

    return JSON.stringify(results, null, 2);
  }
}

// Export singleton
export const batchService = new BatchService();

