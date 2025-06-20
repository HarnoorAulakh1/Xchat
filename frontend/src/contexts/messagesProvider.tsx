import React, { useState } from 'react';
import { messageContext } from './messages';
import type { message } from '../lib/types';
export default function MessageProvider({ children }: { children: React.ReactNode }) {
    const [messages,setMessages] = useState<message[]>([])
  return (
    <messageContext.Provider value={{ messages, setMessages }}>
      {children}
    </messageContext.Provider>
  );
}