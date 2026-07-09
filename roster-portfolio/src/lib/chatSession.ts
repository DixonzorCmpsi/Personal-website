export type PortfolioChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_SESSION_EVENT = "portfolio-chat-session";

let sessionMessages: PortfolioChatMessage[] = [];

function notifyChatSession() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHAT_SESSION_EVENT, { detail: sessionMessages }));
}

export function readChatMessages() {
  return sessionMessages;
}

export function setChatMessages(messages: PortfolioChatMessage[]) {
  sessionMessages = messages;
  notifyChatSession();
}

export function appendChatMessage(message: PortfolioChatMessage) {
  sessionMessages = [...sessionMessages, message];
  notifyChatSession();
}

export function replaceLastAssistantMessage(content: string) {
  const lastIndex = sessionMessages.length - 1;
  if (lastIndex < 0 || sessionMessages[lastIndex].role !== "assistant") return;
  sessionMessages = [
    ...sessionMessages.slice(0, lastIndex),
    { role: "assistant", content },
  ];
  notifyChatSession();
}

export function subscribeToChatMessages(callback: (messages: PortfolioChatMessage[]) => void) {
  if (typeof window === "undefined") return () => {};

  const listener = (event: Event) => {
    callback((event as CustomEvent<PortfolioChatMessage[]>).detail ?? []);
  };

  window.addEventListener(CHAT_SESSION_EVENT, listener);
  return () => window.removeEventListener(CHAT_SESSION_EVENT, listener);
}
