export {};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: { sitekey: string; theme?: "light" | "dark" | "auto" },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}
