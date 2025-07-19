import * as queryStore from "@sanity/react-loader";
import { createClient, type ClientConfig } from "@sanity/client";

const { SANITY_STUDIO_DATASET, SANITY_STUDIO_PROJECT_ID } = process.env;

export const SANITY_API_VERSION = "2025-03-31" as const;
export const SANITY_API_URL = `https://${SANITY_STUDIO_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_STUDIO_DATASET}`;

const config: ClientConfig = {
  projectId: SANITY_STUDIO_PROJECT_ID,
  dataset: SANITY_STUDIO_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn: true,
};

export const client = createClient(config);
queryStore.setServerClient(client);
