#/bin/bash
gcloud auth application-default login
pulumi config set gcp:project architecture-experiment
pulumi config set gcp:zone us-central1
gcloud services enable container.googleapis.com