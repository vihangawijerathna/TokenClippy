terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = "tokenclippy" 
  region  = "us-central1"
}

# Enable Compute Engine API (Required for VPC & Networking)
resource "google_project_service" "compute" {
  service            = "compute.googleapis.com"
  disable_on_destroy = false
}

# Enable Artifact Registry API (Required for Docker Repository)
resource "google_project_service" "artifactregistry" {
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

# Enable Kubernetes Engine API (Required for GKE Cluster)
resource "google_project_service" "container" {
  service            = "container.googleapis.com"
  disable_on_destroy = false
}

# 1. Create a Workload Identity Pool for GitHub
resource "google_iam_workload_identity_pool" "github_pool" {
  workload_identity_pool_id = "github-actions-pool"
  display_name              = "GitHub Actions Pool"
  description               = "Identity pool for GitHub Actions automation pipeline"
}

# 2. Configure the Provider to map GitHub repository claims to GCP attributes
resource "google_iam_workload_identity_pool_provider" "github_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "GitHub Provider"

  # 🔒 FIXED: Correct mapping check using the attribute prefix instead of assertion
  attribute_condition = "attribute.repository == 'vihangawijerathna/TokenClippy'"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# 3. Create a dedicated Service Account for your GitHub pipeline
resource "google_service_account" "github_actions_sa" {
  account_id   = "github-actions-deployer"
  display_name = "GitHub Actions Deployment Service Account"
}

# 4. Authorize your specific GitHub repository to assume this Service Account role
resource "google_service_account_iam_binding" "wif_binding" {
  service_account_id = google_service_account.github_actions_sa.name
  role               = "roles/iam.workloadIdentityUser"

  members = [
    "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/vihangawijerathna/TokenClippy"
  ]
}

# 5. Give the Service Account permissions to push to your Artifact Registry
resource "google_project_iam_binding" "registry_power" {
  project = "tokenclippy"
  role    = "roles/artifactregistry.writer"

  members = [
    "serviceAccount:${google_service_account.github_actions_sa.email}"
  ]
}

# 6. Give the Service Account permissions to manage GKE deployments
resource "google_project_iam_binding" "kubernetes_power" {
  project = "tokenclippy"
  role    = "roles/container.developer" # 🚢 Grants full deployment access to GKE

  members = [
    "serviceAccount:${google_service_account.github_actions_sa.email}"
  ]
}