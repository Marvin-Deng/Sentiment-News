import { Firestore } from "@google-cloud/firestore";

let firestore: Firestore | undefined;

export function getFirestore(): Firestore {
  if (!firestore) {
    const saKeyBase64 = process.env.GCP_SA_KEY_BASE64;

    if (saKeyBase64) {
      const credentials = JSON.parse(Buffer.from(saKeyBase64, "base64").toString("utf-8"));
      firestore = new Firestore({
        projectId: process.env.GCP_PROJECT_ID ?? credentials.project_id,
        credentials,
      });
    } else {
      firestore = new Firestore({
        projectId: process.env.GCP_PROJECT_ID,
      });
    }
  }
  return firestore;
}
