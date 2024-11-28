/**
 * Interface representing a cache manager.
 */
export interface ICacheManager {
    /**
     * Retrieves the value associated with the given key from the cache.
     * 
     * @param key - The key of the cached value.
     * @returns A promise that resolves to the cached value, or null if the key does not exist.
     */
    get(key: string): Promise<string | null>;

    /**
     * Sets a value in the cache with the specified key and time-to-live (TTL).
     * 
     * @param key - The key to associate with the value.
     * @param value - The value to cache.
     * @param ttl - The time-to-live for the cached value, in seconds.
     * @returns A promise that resolves when the value has been set.
     */
    set(key: string, value: string, ttl: number): Promise<void>;

    /**
     * Deletes the value associated with the given key from the cache.
     * 
     * @param key - The key of the cached value to delete.
     * @returns A promise that resolves when the value has been deleted.
     */
    delete(key: string): Promise<void>;

    /**
     * Clears all values from the cache.
     * 
     * @returns A promise that resolves when the cache has been cleared.
     */
    clear(): Promise<void>;

    /**
     * Checks if a value associated with the given key exists in the cache.
     * 
     * @param key - The key to check for existence.
     * @returns A promise that resolves to true if the key exists, or false otherwise.
     */
    exists(key: string): Promise<boolean>;

    /**
     * Retrieves all keys currently stored in the cache.
     * 
     * @returns A promise that resolves to an array of all keys in the cache.
     */
    getAllKeys(): Promise<string[]>;
}
