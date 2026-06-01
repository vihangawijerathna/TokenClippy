resource "google_artifact_registry_repository" "repo" {
  location      = "us-central1"
  repository_id = "tokenclippy-apps"
  description   = "Docker repository for TokenClippy frontend and backend"
  format        = "DOCKER"

  # 🧠 Wait for the artifact registry API to turn on first!
  depends_on = [google_project_service.artifactregistry]
}

resource "google_container_cluster" "primary" {
  name     = "tokenclippy-cluster"
  location = "us-central1"

  network    = google_compute_network.main.name
  subnetwork = google_compute_subnetwork.private.name
  enable_autopilot = true
  deletion_protection = false 

  # 🧠 Wait for the container API to turn on first!
  depends_on = [google_project_service.container]
}