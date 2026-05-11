import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'

// ─── Mock globali ─────────────────────────────────────────────────────────────

const matchMediaMock = vi.fn()
Object.defineProperty(window, 'matchMedia', { value: matchMediaMock })

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

vi.useFakeTimers()


import { useTheme } from '@/composables/useTheme'
import { mount, flushPromises as fp } from '@vue/test-utils'
import { defineComponent } from 'vue'

function mountComposable() {
  let result: ReturnType<typeof useTheme>
  const Dummy = defineComponent({
    setup() { result = useTheme() },
    template: '<div/>',
  })
  mount(Dummy)
  return result!
}

function setPrefersDark(value: boolean) {
  matchMediaMock.mockReturnValue({ matches: value })
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorageMock.clear()
    document.documentElement.classList.remove('dark', 'disable-transitions')
    setPrefersDark(false)
    vi.clearAllTimers()
  })

  it('defaults to system when localStorage is empty', () => {
    const { theme } = mountComposable()
    expect(theme.value).toBe('system')
  })

  it('loads the saved theme from localStorage', () => {
    localStorageMock.setItem('theme', 'dark')
    const { theme } = mountComposable()
    expect(theme.value).toBe('dark')
  })

  it('applies the dark class when the saved theme is dark', () => {
    localStorageMock.setItem('theme', 'dark')
    mountComposable()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('does not apply the dark class when the saved theme is light', () => {
    localStorageMock.setItem('theme', 'light')
    mountComposable()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('setTheme("dark") adds the dark class', async () => {
    const { setTheme } = mountComposable()
    setTheme('dark')
    await flushPromises()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('setTheme("light") removes the dark class', async () => {
    document.documentElement.classList.add('dark')
    const { setTheme } = mountComposable()
    setTheme('light')
    await flushPromises()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('setTheme persists the value in localStorage', async () => {
    const { setTheme } = mountComposable()
    setTheme('dark')
    await flushPromises()
    expect(localStorageMock.getItem('theme')).toBe('dark')
  })

  it('system and prefersDark true equals adds the dark class', async () => {
    setPrefersDark(true)
    const { setTheme } = mountComposable()
    setTheme('system')
    await flushPromises()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('system and prefersDark false equals does not add the dark class', async () => {
    setPrefersDark(false)
    const { setTheme } = mountComposable()
    setTheme('system')
    await flushPromises()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('adds disable-transitions on theme change and removes it after 50ms', async () => {
    const { setTheme } = mountComposable()
    setTheme('dark')
    await flushPromises()
    expect(document.documentElement.classList.contains('disable-transitions')).toBe(true)
    vi.advanceTimersByTime(50)
    expect(document.documentElement.classList.contains('disable-transitions')).toBe(false)
  })
})