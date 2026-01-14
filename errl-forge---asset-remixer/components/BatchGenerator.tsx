import React, { useState, useEffect, useRef } from 'react';
import { BatchJob, BatchJobItem, GameAsset } from '../types';

type AssetType = GameAsset['type'];
import { batchService } from '../services/batchService';
import { AIProviderType } from '../services/aiProvider';
import { Play, Pause, Trash2, Download, RefreshCw, Plus, X, CheckCircle, XCircle, Clock } from 'lucide-react';

interface BatchGeneratorProps {
  provider: AIProviderType;
  onAssetGenerated?: (asset: GameAsset) => void;
}

export const BatchGenerator: React.FC<BatchGeneratorProps> = ({ provider, onAssetGenerated }) => {
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [activeJob, setActiveJob] = useState<BatchJob | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [jobName, setJobName] = useState('');
  const [items, setItems] = useState<Array<{ name: string; prompt: string; type: AssetType }>>([
    { name: '', prompt: '', type: 'monster' }
  ]);
  const notifiedItems = useRef<Set<string>>(new Set());
  const intervalRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    loadJobs();
    
    // Cleanup intervals on unmount
    return () => {
      intervalRefs.current.forEach(interval => clearInterval(interval));
      intervalRefs.current.clear();
    };
  }, []);

  const loadJobs = () => {
    const allJobs = batchService.getAllJobs();
    setJobs(allJobs);
    
    // Find active job
    const running = allJobs.find(j => j.status === 'running' || j.status === 'paused');
    if (running) {
      setActiveJob(running);
      // Continue monitoring if running
      if (running.status === 'running') {
        monitorJob(running.id);
      }
    }
  };

  const monitorJob = (jobId: string) => {
    // Clear any existing interval for this job
    const existingInterval = intervalRefs.current.get(jobId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }
    
    const interval = setInterval(() => {
      const job = batchService.getJob(jobId);
      if (job) {
        setActiveJob(job);
        setJobs(prev => prev.map(j => j.id === jobId ? job : j));
        
        // Notify about completed items (only once per item)
        job.items.forEach(item => {
          if (item.status === 'complete' && item.result && onAssetGenerated) {
            // Only notify if we haven't already notified for this item
            const itemKey = `${jobId}-${item.id}`;
            if (!notifiedItems.current.has(itemKey)) {
              notifiedItems.current.add(itemKey);
              onAssetGenerated(item.result);
            }
          }
        });

        if (job.status === 'completed' || job.status === 'error') {
          clearInterval(interval);
          intervalRefs.current.delete(jobId);
        }
      } else {
        clearInterval(interval);
        intervalRefs.current.delete(jobId);
      }
    }, 1000);
    
    // Store interval for cleanup
    intervalRefs.current.set(jobId, interval);
  };

  const handleCreateJob = () => {
    const validItems = items.filter(item => item.name && item.prompt);
    if (validItems.length === 0) {
      alert('Please add at least one item with name and prompt');
      return;
    }

    const job = batchService.createJob(
      jobName || `Batch ${new Date().toLocaleString()}`,
      validItems
    );

    setJobs(prev => [job, ...prev]);
    setShowCreateForm(false);
    setJobName('');
    setItems([{ name: '', prompt: '', type: 'monster' }]);
  };

  const handleStartJob = async (jobId: string) => {
    try {
      const job = batchService.getJob(jobId);
      if (!job) return;

      if (job.status === 'paused') {
        await batchService.resumeJob(jobId, provider, (updatedJob) => {
          setActiveJob(updatedJob);
          setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));
        });
      } else {
        await batchService.startJob(jobId, provider, (updatedJob) => {
          setActiveJob(updatedJob);
          setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));
        });
      }

      monitorJob(jobId);
    } catch (error) {
      console.error('Failed to start job:', error);
      alert('Failed to start job. Another job may be running.');
    }
  };

  const handlePauseJob = (jobId: string) => {
    batchService.pauseJob(jobId);
    loadJobs();
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Delete this batch job?')) {
      batchService.deleteJob(jobId);
      loadJobs();
      if (activeJob?.id === jobId) {
        setActiveJob(null);
      }
    }
  };

  const handleRetryFailed = async (jobId: string) => {
    try {
      await batchService.retryFailedItems(jobId, provider, (updatedJob) => {
        setActiveJob(updatedJob);
        setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));
      });
      monitorJob(jobId);
    } catch (error) {
      console.error('Failed to retry:', error);
    }
  };

  const handleExport = (jobId: string) => {
    const json = batchService.exportJobResults(jobId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-${jobId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const addItem = () => {
    setItems(prev => [...prev, { name: '', prompt: '', type: 'monster' }]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: 'name' | 'prompt' | 'type', value: string) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-900/50">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Batch Generator</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Batch
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="p-4 border-b border-gray-800 bg-gray-800/50">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Job Name</label>
              <input
                type="text"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="My Batch Job"
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-400">Items</label>
                <button
                  onClick={addItem}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-900 rounded border border-gray-700">
                    <div className="flex items-start gap-2 mb-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder="Asset Name"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded p-1.5 text-white text-xs"
                      />
                      <select
                        value={item.type}
                        onChange={(e) => updateItem(index, 'type', e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded p-1.5 text-white text-xs"
                      >
                        <option value="monster">Monster</option>
                        <option value="item">Item</option>
                        <option value="npc">NPC</option>
                        <option value="platform">Platform</option>
                        <option value="background">Background</option>
                      </select>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="p-1.5 hover:bg-red-900/30 rounded"
                        >
                          <X className="w-3 h-3 text-red-400" />
                        </button>
                      )}
                    </div>
                    <textarea
                      value={item.prompt}
                      onChange={(e) => updateItem(index, 'prompt', e.target.value)}
                      placeholder="Generation prompt..."
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-xs h-20 resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateJob}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-bold"
              >
                Create Job
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setJobName('');
                  setItems([{ name: '', prompt: '', type: 'monster' }]);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-600">
            <Clock className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm">No batch jobs</p>
            <p className="text-xs text-gray-700 mt-1">Create a new batch to generate multiple assets</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="p-4 bg-gray-800 rounded border border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white">{job.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      job.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                      job.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                      job.status === 'error' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(job.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {job.status === 'running' && (
                    <button
                      onClick={() => handlePauseJob(job.id)}
                      className="p-2 hover:bg-gray-700 rounded"
                      title="Pause"
                    >
                      <Pause className="w-4 h-4 text-yellow-400" />
                    </button>
                  )}
                  {(job.status === 'pending' || job.status === 'paused') && (
                    <button
                      onClick={() => handleStartJob(job.id)}
                      className="p-2 hover:bg-gray-700 rounded"
                      title="Start"
                    >
                      <Play className="w-4 h-4 text-green-400" />
                    </button>
                  )}
                  {job.status === 'error' && job.progress.failed > 0 && (
                    <button
                      onClick={() => handleRetryFailed(job.id)}
                      className="p-2 hover:bg-gray-700 rounded"
                      title="Retry Failed"
                    >
                      <RefreshCw className="w-4 h-4 text-blue-400" />
                    </button>
                  )}
                  {job.status === 'completed' && (
                    <button
                      onClick={() => handleExport(job.id)}
                      className="p-2 hover:bg-gray-700 rounded"
                      title="Export Results"
                    >
                      <Download className="w-4 h-4 text-indigo-400" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 hover:bg-red-900/30 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{job.progress.completed} / {job.progress.total}</span>
                </div>
                <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all"
                    style={{ width: `${(job.progress.completed / job.progress.total) * 100}%` }}
                  />
                </div>
                {job.progress.failed > 0 && (
                  <div className="text-xs text-red-400 mt-1">
                    {job.progress.failed} failed
                  </div>
                )}
              </div>

              <div className="space-y-1 max-h-32 overflow-y-auto">
                {job.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 text-xs p-2 bg-gray-900 rounded"
                  >
                    {item.status === 'complete' ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : item.status === 'error' ? (
                      <XCircle className="w-3 h-3 text-red-400" />
                    ) : item.status === 'generating' ? (
                      <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                    ) : (
                      <Clock className="w-3 h-3 text-gray-500" />
                    )}
                    <span className="flex-1 text-gray-300 truncate">{item.name || 'Unnamed'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

