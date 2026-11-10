// The buyer's message to the seller (bug 8, design option A): covered by tests/unit/orderMessage.test.ts.
import { canConfirmReceipt, type OrderStatus } from "./orderProgress";

export const MAX_MESSAGE_LENGTH = 500; // the same limit as the order_messages table

export const EMPTY_MESSAGE = "Write a message first.";
export const MESSAGE_TOO_LONG = `Use at most ${MAX_MESSAGE_LENGTH} characters.`;

// Only an order still "Paid" (not yet confirmed as delivered) can get a message, and only one.
export function canMessageSeller(status: OrderStatus, alreadySent: boolean): boolean {
  return canConfirmReceipt(status) && !alreadySent;
}

// The text to send (trimmed), or the message to show. Checked before anything is saved.
export function checkMessage(typed: string): { text: string } | { error: string } {
  const text = typed.trim();
  if (text === "") return { error: EMPTY_MESSAGE };
  if (text.length > MAX_MESSAGE_LENGTH) return { error: MESSAGE_TOO_LONG };
  return { text };
}
