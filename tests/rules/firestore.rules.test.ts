import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, addDoc, collection } from "firebase/firestore";

let env: RulesTestEnvironment;

const CUSTOMER = "cust_uid_1";
const OTHER_CUSTOMER = "cust_uid_2";
const CONV = "conv_1";

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "aplus-chat-rules-test",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  // Seed a conversation owned by CUSTOMER, bypassing rules.
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "conversations", CONV), {
      visitorId: CUSTOMER,
      ownerUid: CUSTOMER,
      customer: { name: "Rahul", email: "r@acme.com", phone: "+919310509909" },
      startedBy: "customer",
      page: "/products/samsung-qet-series",
      status: "open",
      needsFollowUp: false,
      lastMessageAt: Date.now(),
      lastPreview: "hi",
      lastSender: "customer",
      unreadForAgent: 1,
    });
    await setDoc(doc(db, "status", "team"), { onlineUntil: Date.now() + 90_000 });
    await setDoc(doc(db, "agentDevices", "tok_1"), { token: "tok_1", agentUid: "agent_1" });
  });
});

const asCustomer = () => env.authenticatedContext(CUSTOMER).firestore();
const asOtherCustomer = () => env.authenticatedContext(OTHER_CUSTOMER).firestore();
const asAgent = () => env.authenticatedContext("agent_1", { agent: true }).firestore();
const asAnon = () => env.unauthenticatedContext().firestore();

describe("conversations", () => {
  it("lets the owner read their own conversation", async () => {
    await assertSucceeds(getDoc(doc(asCustomer(), "conversations", CONV)));
  });

  it("BLOCKS another customer from reading it", async () => {
    await assertFails(getDoc(doc(asOtherCustomer(), "conversations", CONV)));
  });

  it("blocks a signed-out visitor entirely", async () => {
    await assertFails(getDoc(doc(asAnon(), "conversations", CONV)));
  });

  it("lets an agent read any conversation", async () => {
    await assertSucceeds(getDoc(doc(asAgent(), "conversations", CONV)));
  });

  it("blocks a customer from creating a conversation owned by someone else", async () => {
    await assertFails(
      setDoc(doc(asCustomer(), "conversations", "conv_forged"), {
        ownerUid: OTHER_CUSTOMER,
        visitorId: OTHER_CUSTOMER,
        status: "open",
      })
    );
  });

  it("blocks a customer from clearing their own needsFollowUp flag", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), "conversations", CONV), { needsFollowUp: true });
    });
    await assertFails(updateDoc(doc(asCustomer(), "conversations", CONV), { needsFollowUp: false }));
    await assertSucceeds(updateDoc(doc(asAgent(), "conversations", CONV), { needsFollowUp: false }));
  });

  it("blocks a customer from reassigning ownerUid", async () => {
    await assertFails(updateDoc(doc(asCustomer(), "conversations", CONV), { ownerUid: OTHER_CUSTOMER }));
  });
});

describe("messages", () => {
  const msgs = (db: ReturnType<typeof asCustomer>) =>
    collection(db, "conversations", CONV, "messages");

  it("lets the owner send a customer message", async () => {
    await assertSucceeds(
      addDoc(msgs(asCustomer()), { sender: "customer", text: "Need pricing", createdAt: Date.now() })
    );
  });

  it("BLOCKS a customer from forging an agent message", async () => {
    await assertFails(
      addDoc(msgs(asCustomer()), { sender: "agent", text: "Sure, ₹1", createdAt: Date.now() })
    );
  });

  it("BLOCKS a customer from attaching a file — agent-only upload surface", async () => {
    await assertFails(
      addDoc(msgs(asCustomer()), {
        sender: "customer",
        text: "",
        createdAt: Date.now(),
        attachment: { url: "https://evil/x.pdf", name: "x.pdf", mime: "application/pdf", size: 1 },
      })
    );
  });

  // The thread is rendered in the CONSOLE, where the reader holds an agent token
  // and can see every conversation. A visitor writing to their own thread with
  // the SDK must not be able to plant a link card — least of all one carrying a
  // javascript: URI — and aim it at the salesperson.
  it("BLOCKS a customer from planting a link card — agent-only quick-send surface", async () => {
    await assertFails(
      addDoc(msgs(asCustomer()), {
        sender: "customer",
        text: "",
        createdAt: Date.now(),
        link: { url: "https://evil/x", label: "Spec sheet", kind: "specSheet" },
      })
    );
  });

  it("BLOCKS a customer from planting a javascript: link at the agent console", async () => {
    await assertFails(
      addDoc(msgs(asCustomer()), {
        sender: "customer",
        text: "",
        createdAt: Date.now(),
        link: { url: "javascript:alert(1)", label: "Spec sheet", kind: "specSheet" },
      })
    );
  });

  it("BLOCKS the same via a forged system message", async () => {
    await assertFails(
      addDoc(msgs(asCustomer()), {
        sender: "system",
        text: "",
        createdAt: Date.now(),
        link: { url: "javascript:alert(1)", label: "Spec sheet", kind: "specSheet" },
      })
    );
  });

  it("still lets an agent send a legitimate quick-send link", async () => {
    await assertSucceeds(
      addDoc(msgs(asAgent()), {
        sender: "agent",
        text: "Here is the spec sheet",
        createdAt: Date.now(),
        link: {
          url: "https://www.aplustechsol.com/products/samsung-qb65?download=spec",
          label: "QB65 spec sheet",
          kind: "specSheet",
        },
      })
    );
  });

  it("blocks a customer from posting an over-long message", async () => {
    await assertFails(
      addDoc(msgs(asCustomer()), { sender: "customer", text: "x".repeat(2001), createdAt: Date.now() })
    );
  });

  it("accepts a message exactly at the 2000-char cap", async () => {
    await assertSucceeds(
      addDoc(msgs(asCustomer()), { sender: "customer", text: "x".repeat(2000), createdAt: Date.now() })
    );
  });

  it("BLOCKS another customer from reading the thread", async () => {
    await assertFails(getDoc(doc(asOtherCustomer(), "conversations", CONV, "messages", "any")));
  });

  it("lets an agent send an agent message with an attachment", async () => {
    await assertSucceeds(
      addDoc(msgs(asAgent()), {
        sender: "agent",
        text: "Spec sheet attached",
        createdAt: Date.now(),
        attachment: { url: "https://x/a.pdf", name: "a.pdf", mime: "application/pdf", size: 100 },
      })
    );
  });
});

describe("visitors", () => {
  it("lets a visitor write only their own doc", async () => {
    await assertSucceeds(
      setDoc(doc(asCustomer(), "visitors", CUSTOMER), { lastSeenAt: Date.now(), currentPage: "/" })
    );
  });

  it("BLOCKS a visitor from writing another visitor's doc", async () => {
    await assertFails(
      setDoc(doc(asCustomer(), "visitors", OTHER_CUSTOMER), { lastSeenAt: Date.now() })
    );
  });

  it("BLOCKS a visitor from reading another visitor's doc", async () => {
    await assertFails(getDoc(doc(asCustomer(), "visitors", OTHER_CUSTOMER)));
  });

  it("lets an agent read any visitor", async () => {
    await assertSucceeds(getDoc(doc(asAgent(), "visitors", CUSTOMER)));
  });
});

describe("status/team", () => {
  it("is public-read — the widget shows presence before sign-in", async () => {
    await assertSucceeds(getDoc(doc(asAnon(), "status", "team")));
  });

  it("is NOT public-write — a visitor cannot fake the team being online", async () => {
    await assertFails(setDoc(doc(asCustomer(), "status", "team"), { onlineUntil: Date.now() }));
  });

  it("lets an agent heartbeat it", async () => {
    await assertSucceeds(setDoc(doc(asAgent(), "status", "team"), { onlineUntil: Date.now() + 90_000 }));
  });
});

describe("agentDevices", () => {
  it("BLOCKS a customer from reading push tokens", async () => {
    await assertFails(getDoc(doc(asCustomer(), "agentDevices", "tok_1")));
  });

  it("lets an agent read and write them", async () => {
    await assertSucceeds(getDoc(doc(asAgent(), "agentDevices", "tok_1")));
  });
});
