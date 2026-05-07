import { ref, watch, onMounted } from 'vue'

type Theme = 'light' | 'dark' | 'system'

const theme = ref<Theme>('system')

function prefersDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(t: Theme) {
    disableTransitionsTemporarily()

    const isDark = t === 'dark' || (t === 'system' && prefersDark())

    document.documentElement.classList.toggle('dark', isDark)
}

function disableTransitionsTemporarily() {
    document.documentElement.classList.add('disable-transitions')

    window.setTimeout(() => {
        document.documentElement.classList.remove('disable-transitions')
    }, 50)
}


export function useTheme() {
    onMounted(() => {
        const saved = localStorage.getItem('theme') as Theme | null

        theme.value = saved ?? 'system'
        applyTheme(theme.value)
    })

    watch(theme, (newTheme) => {
        localStorage.setItem('theme', newTheme)
        applyTheme(newTheme)
    })

    function setTheme(t: Theme) {
        theme.value = t
    }

    return {
        theme,
        setTheme
    }
}