// API Queue Manager - Handles multiple concurrent API calls efficiently
class APIQueueManager {
    constructor(maxConcurrent = 5) {
        this.maxConcurrent = maxConcurrent; // Maximum concurrent requests
        this.currentRequests = 0;
        this.queue = [];
        this.cache = new Map(); // Cache for GET requests
        this.cacheExpiry = 30000; // 30 seconds cache
    }

    /**
     * Add an API call to the queue
     * @param {Function} apiFunction - The async function to execute
     * @param {string} cacheKey - Optional cache key for GET requests
     * @returns {Promise} - Returns the result of the API call
     */
    async enqueue(apiFunction, cacheKey = null) {
        // Check cache first for GET requests
        if (cacheKey && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                console.log('Returning cached result for:', cacheKey);
                return cached.data;
            } else {
                this.cache.delete(cacheKey); // Remove expired cache
            }
        }

        return new Promise((resolve, reject) => {
            const task = {
                execute: async () => {
                    try {
                        this.currentRequests++;
                        console.log(`Executing API call. Current requests: ${this.currentRequests}`);
                        
                        const result = await apiFunction();
                        
                        // Cache the result if cacheKey provided
                        if (cacheKey) {
                            this.cache.set(cacheKey, {
                                data: result,
                                timestamp: Date.now()
                            });
                        }
                        
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    } finally {
                        this.currentRequests--;
                        console.log(`API call completed. Current requests: ${this.currentRequests}`);
                        this.processQueue();
                    }
                }
            };

            // If we're below the limit, execute immediately
            if (this.currentRequests < this.maxConcurrent) {
                task.execute();
            } else {
                // Otherwise, add to queue
                console.log('Adding to queue. Queue size:', this.queue.length + 1);
                this.queue.push(task);
            }
        });
    }

    /**
     * Process the next item in the queue
     */
    processQueue() {
        if (this.queue.length > 0 && this.currentRequests < this.maxConcurrent) {
            const task = this.queue.shift();
            task.execute();
        }
    }

    /**
     * Clear all cached data
     */
    clearCache() {
        this.cache.clear();
        console.log('Cache cleared');
    }

    /**
     * Get current queue status
     */
    getStatus() {
        return {
            currentRequests: this.currentRequests,
            queueLength: this.queue.length,
            cacheSize: this.cache.size
        };
    }
}

// Create a global instance
const apiQueue = new APIQueueManager(5);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIQueueManager, apiQueue };
}