import { ref, watch, onMounted, onUnmounted } from 'vue'

/**
 * Composable for auto-saving form data to localStorage
 * @param {string} storageKey - Unique key for localStorage
 * @param {Object} formData - Reactive form data object
 * @param {number} debounceMs - Debounce time in milliseconds (default: 30000 = 30 seconds)
 */
export function useFormAutoSave(storageKey, formData, debounceMs = 30000) {
    const lastSaved = ref(null)
    const isSaving = ref(false)
    let saveTimeout = null

    // Save form data to localStorage
    const saveToStorage = () => {
        try {
            isSaving.value = true
            const dataToSave = JSON.stringify(formData)
            localStorage.setItem(storageKey, dataToSave)
            lastSaved.value = new Date()
            console.log(`[AutoSave] Saved form data for key: ${storageKey}`)
        } catch (error) {
            console.error('[AutoSave] Error saving to localStorage:', error)
        } finally {
            isSaving.value = false
        }
    }

    // Restore form data from localStorage
    const restoreFromStorage = () => {
        try {
            const savedData = localStorage.getItem(storageKey)
            if (savedData) {
                const parsed = JSON.parse(savedData)
                Object.assign(formData, parsed)
                console.log(`[AutoSave] Restored form data for key: ${storageKey}`)
                return true
            }
        } catch (error) {
            console.error('[AutoSave] Error restoring from localStorage:', error)
        }
        return false
    }

    // Clear saved data from localStorage
    const clearStorage = () => {
        try {
            localStorage.removeItem(storageKey)
            lastSaved.value = null
            console.log(`[AutoSave] Cleared form data for key: ${storageKey}`)
        } catch (error) {
            console.error('[AutoSave] Error clearing localStorage:', error)
        }
    }

    // Watch for changes and debounce save
    const stopWatching = watch(
        () => formData,
        () => {
            clearTimeout(saveTimeout)
            saveTimeout = setTimeout(saveToStorage, debounceMs)
        },
        { deep: true }
    )

    // Restore on mount
    onMounted(() => {
        restoreFromStorage()
    })

    // Cleanup on unmount
    onUnmounted(() => {
        clearTimeout(saveTimeout)
        stopWatching()
    })

    return {
        lastSaved,
        isSaving,
        saveToStorage,
        restoreFromStorage,
        clearStorage
    }
}
