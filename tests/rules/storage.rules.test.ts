import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";

let env: RulesTestEnvironment;

const CUSTOMER = "cust_uid_1";
const OTHER_CUSTOMER = "cust_uid_2";
const CONV = "conv_1";
const PATH = `chat-attachments/${CONV}/msg_1/spec.pdf`;

const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // "%PDF"
const big = new Uint8Array(10 * 1024 * 1024 + 1);

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "aplus-chat-rules-test",
    firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
    storage: { rules: readFileSync("storage.rules", "utf8"), host: "127.0.0.1", port: 9199 },
  });

  // Storage rules cross-read the conversation to authorise the owner, so the
  // Firestore doc must exist for the read tests to mean anything.
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "conversations", CONV), { ownerUid: CUSTOMER });
  });

});

afterAll(async () => env.cleanup());

const asCustomer = () => env.authenticatedContext(CUSTOMER).storage();
const asOtherCustomer = () => env.authenticatedContext(OTHER_CUSTOMER).storage();
const asAgent = () => env.authenticatedContext("agent_1", { agent: true }).storage();

describe("storage: writes", () => {
  it("lets an agent upload an allowed type", async () => {
    await assertSucceeds(
      uploadBytes(ref(asAgent(), PATH), pdf, { contentType: "application/pdf" })
    );
  });

  it("BLOCKS a customer from uploading at all — no anonymous write surface", async () => {
    await assertFails(
      uploadBytes(ref(asCustomer(), PATH), pdf, { contentType: "application/pdf" })
    );
  });

  it("rejects a file over 10 MB even from an agent", async () => {
    await assertFails(
      uploadBytes(ref(asAgent(), `chat-attachments/${CONV}/msg_2/big.pdf`), big, {
        contentType: "application/pdf",
      })
    );
  });

  it("rejects a disallowed content type — zip", async () => {
    await assertFails(
      uploadBytes(ref(asAgent(), `chat-attachments/${CONV}/msg_3/x.zip`), pdf, {
        contentType: "application/zip",
      })
    );
  });

  it("rejects SVG — deny-by-default keeps the script vector out", async () => {
    await assertFails(
      uploadBytes(ref(asAgent(), `chat-attachments/${CONV}/msg_4/x.svg`), pdf, {
        contentType: "image/svg+xml",
      })
    );
  });

  it("rejects an upload outside the chat-attachments prefix", async () => {
    await assertFails(
      uploadBytes(ref(asAgent(), "elsewhere/x.pdf"), pdf, { contentType: "application/pdf" })
    );
  });
});

describe("storage: reads", () => {
  it("lets the conversation's owner open what was sent to them", async () => {
    await assertSucceeds(getDownloadURL(ref(asCustomer(), PATH)));
  });

  it("BLOCKS an unrelated visitor from reading the attachment", async () => {
    await assertFails(getDownloadURL(ref(asOtherCustomer(), PATH)));
  });

  it("lets an agent read it", async () => {
    await assertSucceeds(getDownloadURL(ref(asAgent(), PATH)));
  });
});
