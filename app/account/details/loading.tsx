import { TabLoading } from "../TabStates";

// While the Account details tab loads (SPEC · Shared rules; story 31).
export default function Loading() {
  return <TabLoading label="Loading your details…" />;
}
