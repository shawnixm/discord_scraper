/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  electron: {
    fetchMessages: (args: {
      token: string;
      channelId: string;
      startDate: string;
      endDate: string;
      timeBuffer: number;
    }) => Promise<any>;
    saveFile: (fileName: string, content: string) => Promise<boolean>;
  };
}

