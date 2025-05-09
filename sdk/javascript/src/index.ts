// sdk/javascript/src/index.ts
import 'cross-fetch/polyfill';

interface FlagManagerOptions {
  apiKey: string;
  environment: string;
  baseUrl?: string;
  defaultFlagValue?: boolean | string | number | object | null;
  enableCache?: boolean;
  cacheTtl?: number;
  bootstrap?: Record<string, any>;
  offline?: boolean;
}

interface EvaluationContext {
  userId?: string;
  [key: string]: any;
}

interface FlagEvaluation {
  key: string;
  value: any;
}

type FlagsMap = Record<string, any>;

class FlagManager {
  private apiKey: string;
  private environment: string;
  private baseUrl: string;
  private defaultFlagValue: any;
  private cache: Map<string, { value: any; timestamp: number }>;
  private enableCache: boolean;
  private cacheTtl: number;
  private bootstrap: FlagsMap | null;
  private offline: boolean;

  /**
   * Creates a new instance of the Feature Flag Manager SDK.
   */
  constructor(options: FlagManagerOptions) {
    this.apiKey = options.apiKey;
    this.environment = options.environment;
    this.baseUrl = options.baseUrl || 'http://localhost:5000/api';
    this.defaultFlagValue = options.defaultFlagValue !== undefined ? options.defaultFlagValue : false;
    this.enableCache = options.enableCache !== undefined ? options.enableCache : true;
    this.cacheTtl = options.cacheTtl || 60000; // Default: 1 minute
    this.bootstrap = options.bootstrap || null;
    this.offline = options.offline || false;
    this.cache = new Map();
  }

  /**
   * Get the value of a specific flag.
   * 
   * @param flagKey - The key of the flag to evaluate
   * @param context - The evaluation context (e.g., user attributes)
   * @param defaultValue - Optional default value if flag cannot be evaluated
   * @returns The evaluated flag value
   */
  async getValue(
    flagKey: string,
    context: EvaluationContext = {},
    defaultValue?: any
  ): Promise<any> {
    try {
      // Check if offline mode is enabled
      if (this.offline) {
        // Use bootstrap values if available
        if (this.bootstrap && this.bootstrap[flagKey] !== undefined) {
          return this.bootstrap[flagKey];
        }
        return defaultValue !== undefined ? defaultValue : this.defaultFlagValue;
      }

      // Check cache if enabled
      if (this.enableCache) {
        const cacheKey = this.getCacheKey(flagKey, context);
        const cachedValue = this.cache.get(cacheKey);
        
        if (cachedValue && Date.now() - cachedValue.timestamp < this.cacheTtl) {
          return cachedValue.value;
        }
      }

      // Evaluate flag
      const result = await this.evaluateFlag(flagKey, context);
      
      // Update cache
      if (this.enableCache) {
        const cacheKey = this.getCacheKey(flagKey, context);
        this.cache.set(cacheKey, {
          value: result.value,
          timestamp: Date.now()
        });
      }
      
      return result.value;
    } catch (error) {
      console.error(`Error evaluating flag '${flagKey}':`, error);
      return defaultValue !== undefined ? defaultValue : this.defaultFlagValue;
    }
  }

  /**
   * Check if a boolean flag is enabled.
   * 
   * @param flagKey - The key of the flag to check
   * @param context - The evaluation context (e.g., user attributes)
   * @param defaultValue - Optional default value if flag cannot be evaluated
   * @returns True if the flag is enabled, false otherwise
   */
  async isEnabled(
    flagKey: string,
    context: EvaluationContext = {},
    defaultValue?: boolean
  ): Promise<boolean> {
    const value = await this.getValue(flagKey, context, defaultValue);
    return Boolean(value);
  }

  /**
   * Get all flags for the current context.
   * 
   * @param context - The evaluation context (e.g., user attributes)
   * @returns A map of all flag values
   */
  async getAllFlags(context: EvaluationContext = {}): Promise<FlagsMap> {
    try {
      // Check if offline mode is enabled
      if (this.offline) {
        return this.bootstrap || {};
      }

      // Build URL and query string
      let url = `${this.baseUrl}/sdk/${this.environment}/flags`;
      
      // Add query parameters for context
      if (context.userId) {
        url += `?userId=${encodeURIComponent(context.userId)}`;
      }
      
      // Make request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        }
      });
      
      // Check if response is OK
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get flags');
      }
      
      // Parse response
      const result = await response.json();
      return result.data || {};
    } catch (error) {
      console.error('Error getting all flags:', error);
      return this.bootstrap || {};
    }
  }

  /**
   * Clear the cache for a specific flag or all flags.
   * 
   * @param flagKey - Optional flag key to clear from cache
   */
  clearCache(flagKey?: string): void {
    if (flagKey) {
      // Clear cache for specific flag
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${flagKey}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear entire cache
      this.cache.clear();
    }
  }

  /**
   * Set the SDK to offline mode.
   * 
   * @param offline - Whether to enable offline mode
   * @param bootstrap - Optional bootstrap values to use in offline mode
   */
  setOffline(offline: boolean, bootstrap?: FlagsMap): void {
    this.offline = offline;
    if (bootstrap) {
      this.bootstrap = bootstrap;
    }
  }

  /**
   * Evaluate a flag on the server.
   * 
   * @param flagKey - The key of the flag to evaluate
   * @param context - The evaluation context
   * @returns The flag evaluation result
   * @private
   */
  private async evaluateFlag(
    flagKey: string,
    context: EvaluationContext = {}
  ): Promise<FlagEvaluation> {
    const url = `${this.baseUrl}/sdk/${this.environment}/evaluate`;
    
    // Make request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({
        flagKey,
        context
      })
    });
    
    // Check if response is OK
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to evaluate flag');
    }
    
    // Parse response
    const result = await response.json();
    return result.data as FlagEvaluation;
  }

  /**
   * Generate a cache key for a flag and context.
   * 
   * @param flagKey - The flag key
   * @param context - The evaluation context
   * @returns A cache key string
   * @private
   */
  private getCacheKey(flagKey: string, context: EvaluationContext = {}): string {
    const contextString = JSON.stringify(context);
    return `${flagKey}:${contextString}`;
  }
}

export { FlagManager, type FlagManagerOptions, type EvaluationContext, type FlagsMap };
export default FlagManager;