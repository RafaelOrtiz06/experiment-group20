import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

const config = new pulumi.Config();
const environment = pulumi.getStack();
export const clusterName = `${config.require('gcp:k8s-cluster-name')}-${environment}`;


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

export const clusterProvider = new k8s.Provider(clusterName, {
  kubeconfig: kubeconfig,
});