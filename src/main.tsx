/**
 * MIT License
 *
 * Copyright (c) 2026 game1024
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from './theme';
import { getSettings } from './store/settings';
import { listen } from '@tauri-apps/api/event';
import './i18n';

// Import local fonts
import '@fontsource/fira-code/index.css';
import '@fontsource/noto-sans/index.css';
import '@fontsource/noto-sans-sc/index.css';
import '@fontsource/noto-sans-tc/index.css';

function resolveTheme(setting: string | undefined): 'light' | 'dark' {
  if (setting === 'dark') return 'dark';
  if (setting === 'light') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function ThemedApp() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => resolveTheme(undefined));

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    let currentSetting: string | undefined;

    getSettings()
      .then(s => {
        currentSetting = s.theme;
        setMode(resolveTheme(s.theme));
      })
      .catch(() => {})
      .finally(() => {
        getCurrentWindow().show();
      });

    const handleMedia = () => {
      if (!currentSetting || currentSetting === 'auto') {
        setMode(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleMedia);

    let unlisten: (() => void) | undefined;
    listen<{ theme: string }>('theme-updated', (event) => {
      currentSetting = event.payload.theme;
      setMode(resolveTheme(event.payload.theme));
    }).then(fn => { unlisten = fn; });

    return () => {
      mediaQuery.removeEventListener('change', handleMedia);
      unlisten?.();
    };
  }, []);

  return (
    <ThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemedApp />
  </React.StrictMode>,
);
