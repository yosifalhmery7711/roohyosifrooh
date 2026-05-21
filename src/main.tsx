import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global dynamic fetch proxy for Vercel apps to talk to the unified API server
if (typeof window !== "undefined") {
  try {
    const originalFetch = window.fetch;
    const customFetch = function (input: RequestInfo | URL, init?: RequestInit) {
      let url = "";
      if (typeof input === "string") {
        url = input;
      } else if (input instanceof Request) {
        url = input.url;
      } else if (input && typeof input === "object" && "href" in input) {
        url = (input as any).href;
      }

      let isTarget = false;
      let path = "";

      if (url) {
        if (url.startsWith("/api/") || url.startsWith("/aa/")) {
          isTarget = true;
          path = url;
        } else {
          try {
            const parsed = new URL(url, window.location.origin);
            if (parsed.origin === window.location.origin) {
              if (parsed.pathname.startsWith("/api/") || parsed.pathname.startsWith("/aa/")) {
                isTarget = true;
                path = parsed.pathname + parsed.search;
              }
            }
          } catch (e) {}
        }
      }

      if (isTarget && window.location.hostname.includes("vercel.app")) {
        const targetHost = "https://ais-pre-dc5p3pczmmoan5ndqfa2rc-559339625468.europe-west2.run.app";
        const newUrl = `${targetHost}${path}`;
        if (typeof input === "string") {
          input = newUrl;
        } else if (input instanceof Request) {
          input = new Request(newUrl, input);
        } else if (input && typeof input === "object" && "href" in input) {
          input = new URL(newUrl) as any;
        }
      }
      return originalFetch.call(window, input, init);
    };

    // Safely check if we can write or configure window.fetch to avoid fatal error on getter-only environments
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    const isConfigurable = descriptor ? descriptor.configurable : true;
    const isWritable = descriptor ? (descriptor.writable !== false || !!descriptor.set) : true;

    if (isConfigurable) {
      try {
        Object.defineProperty(window, 'fetch', {
          value: customFetch,
          writable: true,
          configurable: true,
          enumerable: true
        });
      } catch (defineError) {
        if (isWritable) {
          (window as any).fetch = customFetch;
        }
      }
    } else if (isWritable) {
      try {
        (window as any).fetch = customFetch;
      } catch (assignError) {
        console.warn("⚠️ window.fetch setter failed despite descriptor evaluation:", assignError);
      }
    } else {
      console.warn("⚠️ window.fetch is completely non-configurable and read-only in this environment. Proxy disabled.");
    }
  } catch (err) {
    console.error("⚠️ Failed to proxy window.fetch safely:", err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
