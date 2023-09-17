import * as gcp from "@pulumi/gcp";

export const repository = new gcp.artifactregistry.Repository("experiment", {
    description: "example docker repository",
    dockerConfig: {
        immutableTags: true,
    },
    format: "DOCKER",
    location: "us-central1",
    repositoryId: "experiment",
});