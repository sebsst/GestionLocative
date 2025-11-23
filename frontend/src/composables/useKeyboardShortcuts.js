import { onMounted, onUnmounted } from 'vue'

/**
 * Composable for handling keyboard shortcuts
 * @param {Object} shortcuts - Object mapping key combinations to handlers
 * @example
 * useKeyboardShortcuts({
 *   'Escape': () => closeModal(),
 *   'Control+s': () => saveForm(),
 *   'Control+Enter': () => submitForm()
 * })
 */
export function useKeyboardShortcuts(shortcuts) {
    const handleKeyDown = (event) => {
        // Build the key combination string
        let combination = ''

        if (event.ctrlKey || event.metaKey) combination += 'Control+'
        if (event.shiftKey) combination += 'Shift+'
        if (event.altKey) combination += 'Alt+'

        // Add the actual key
        combination += event.key

        // Check if we have a handler for this combination
        const handler = shortcuts[combination] || shortcuts[event.key]

        if (handler) {
            // Prevent default browser behavior for our shortcuts
            event.preventDefault()
            event.stopPropagation()
            handler(event)
        }
    }

    onMounted(() => {
        window.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyDown)
    })

    return {
        handleKeyDown
    }
}
