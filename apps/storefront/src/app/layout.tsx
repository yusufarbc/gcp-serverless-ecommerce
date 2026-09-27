import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apex Direct Europe | Serverless D2C Commerce",
  description: "Next-generation Direct-to-Consumer e-commerce platform powered by Google Cloud Serverless.",
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
