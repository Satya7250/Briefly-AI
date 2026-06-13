"use client"

import * as React from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
}

const ThemeProviderContext = React.createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({
  theme: "system",
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  attribute = "class",
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)

  React.useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null
    if (storedTheme) {
      setThemeState(storedTheme)
    } else if (enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      setThemeState(systemTheme as Theme)
    }
  }, [storageKey, enableSystem])

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      setThemeState(newTheme)
    },
    [storageKey]
  )

  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme, enableSystem])

  React.useEffect(() => {
    if (!enableSystem) return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      const storedTheme = localStorage.getItem(storageKey) as Theme | null
      if (!storedTheme || storedTheme === "system") {
        const systemTheme = mediaQuery.matches ? "dark" : "light"
        setThemeState(systemTheme as Theme)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [storageKey, enableSystem])

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
