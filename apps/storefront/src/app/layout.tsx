import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artisan Living Europe | D2C Furniture",
  description: "European D2C Furniture direct from manufacturer, powered by GCP Serverless.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'analytics_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'wait_for_update': 500
            });
          `
        }} />
      </head>
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "#f9fafb" }}>
        {children}
      </body>
    </html>
  );
}
