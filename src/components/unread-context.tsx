"use client";

import React, { createContext, useContext, useState } from "react";

const UnreadCountContext = createContext<{
  count: number;
  setCount: (count: number) => void;
}>({
  count: 0,
  setCount: () => { },
});

export function useUnreadCount() {
  return useContext(UnreadCountContext);
}

export function UnreadCountProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [count, setCount] = useState(0);

  return (
    <UnreadCountContext.Provider value={{ count, setCount }}>
      {children}
    </UnreadCountContext.Provider>
  );
}
