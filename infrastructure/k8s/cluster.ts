import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as gcp from '@pulumi/gcp';


const config = new pulumi.Config();
const environment = pulumi.getStack();

export const clusterName = `experiment-${environment}`;

// Create a GKE cluster
const engineVersion = gcp.container.getEngineVersions().then(v => v.latestMasterVersion);


const cluster = new gcp.container.Cluster(clusterName, {
  enableAutopilot: true,
  location: "us-central1",
  name: clusterName,
  minMasterVersion: engineVersion,
  releaseChannel: {
    channel: 'STABLE',
  },
}, {
  ignoreChanges: ['verticalPodAutoscaling'] // beacuse we are using autopilot verticalPodAutoscaling is handle by the GCP
});
export const kubeconfig = pulumi.
  all([cluster.name, cluster.endpoint, cluster.masterAuth]).
  apply(([name, endpoint, masterAuth]) => {
    const context = `${gcp.config.project}_${gcp.config.zone}_${name}`;
    return `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${masterAuth.clusterCaCertificate}
    server: https://${endpoint}
  name: ${context}
contexts:
- context:
    cluster: ${context}
    user: ${context}
  name: ${context}
current-context: ${context}
kind: Config
preferences: {}
users:
- name: ${context}
  user:
    auth-provider:
      config:
        cmd-args: config config-helper --format=json
        cmd-path: gcloud
        expiry-key: '{.credential.token_expiry}'
        token-key: '{.credential.access_token}'
      name: gcp
`;
  });


// Create a Kubernetes provider with the kubeconfig
export const provider = new k8s.Provider("my-provider", {
  kubeconfig: kubeconfig,
});


const deployment = new k8s.apps.v1.Deployment("offers", {
  metadata: {
    name: "offers",
    labels: {
      app: "offers",
    },
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: {
        app: "offers",
      },
    },
    template: {
      metadata: {
        labels: {
          app: "offers",
        },
      },
      spec: {
        containers: [
          {
            name: "offers",
            image: "us-central1-docker.pkg.dev/architecture-experiment/experiment/offers:latest",
            ports: [{ containerPort: 8000 }],
            imagePullPolicy: "Always",
          },
        ],
      },
    },
  },
}, { provider: provider });

const backendConfig = new k8s.apiextensions.CustomResource("offers-config", {
  apiVersion: "cloud.google.com/v1",
  kind: "BackendConfig",
  metadata: {
    name: "offers-config",
  },
  spec: {
    healthCheck: {
      checkIntervalSec: 30,
      port: 8000,
      type: "HTTP",
      requestPath: "/offers",
    },
  },
}, { provider: provider });

const service = new k8s.core.v1.Service("offers-service", {
  metadata: {
    name: "offers-service",
    annotations: {
      "cloud.google.com/backend-config": '{"default": "offers-config"}',
    },
  },
  spec: {
    type: "NodePort",
    selector: {
      app: "offers",
    },
    ports: [{ protocol: "TCP", port: 80, targetPort: 8000, nodePort: 31019 }],
  },
}, { provider: provider });

const ingress = new k8s.networking.v1.Ingress("gateway-ingress-8", {
  metadata: {
    name: "gateway-ingress-8",
    labels: { name: "gateway-ingress-8" },
  },
  spec: {
    rules: [
      {
        http: {
          paths: [
            {
              pathType: "Prefix",
              path: "/offers",
              backend: {
                service: {
                  name: service.metadata.name,
                  port: { number: 80 },
                },
              },
            },
          ],
        },
      },
    ],
  },
}, { provider: provider });


export const deploymentName = deployment.metadata.name;
export const backendConfigName = backendConfig.metadata.name;
export const serviceName = service.metadata.name;
export const ingressName = ingress.metadata.name;
