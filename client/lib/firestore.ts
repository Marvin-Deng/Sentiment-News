import { Firestore } from "@google-cloud/firestore";

let firestore: Firestore | undefined;

export function getFirestore(): Firestore {
  if (!firestore) {
    firestore = new Firestore({
      projectId: process.env.GCP_PROJECT_ID,
    });
  }
  return firestore;
}
