import { TabLoading } from "./TabStates";

// While the Orders tab loads (SPEC · Shared rules; story 31). /account shows Orders.
export default function Loading() {
  return <TabLoading label="Loading your orders…" />;
}
