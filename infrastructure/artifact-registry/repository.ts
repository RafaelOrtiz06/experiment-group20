import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

export const repository = new gcp.artifactregistry.Repository("experiment", {
    description: "experiment docker repository",
    dockerConfig: {
        immutableTags: false,
    },
    format: "DOCKER",
    location: "us-central1",
    repositoryId: "experiment",
});

// Use an output to get the repository URL
export const repositoryUrl = pulumi.interpolate`us-central1-docker.pkg.dev/${gcp.config.project}/experiment`;
