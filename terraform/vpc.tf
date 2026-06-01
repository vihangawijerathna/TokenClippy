# Create the VPC network
resource "google_compute_network" "main" {
  name                    = "tokenclippy-vpc"
  auto_create_subnetworks = false

  # 🧠 Wait for the compute API to turn on first!
  depends_on = [google_project_service.compute] 
}

# Create a private subnet within our VPC
resource "google_compute_subnetwork" "private" {
  name          = "tokenclippy-subnet"
  ip_cidr_range = "10.0.0.0/16"
  region        = "us-central1"
  network       = google_compute_network.main.id

  # Gives internal instances access to Google APIs without public IPs
  private_ip_google_access = true
}