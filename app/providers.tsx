"use client";

import { ConfigProvider } from "antd";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#0f172a",
            colorSuccess: "#15803d",
            borderRadius: 10,
            fontFamily: "var(--font-space-grotesk)",
          },
        }}
      >
        {children}
      </ConfigProvider>
    </SessionProvider>
  );
}
