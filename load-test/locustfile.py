"""
Locust load tests for the public Rotaract District 3131 site.

Setup (once):
  cd load-test
  python -m venv .venv
  .venv\\Scripts\\activate          # Windows
  # source .venv/bin/activate       # macOS/Linux
  pip install -r requirements.txt

Web dashboard (recommended):
  locust -f locustfile.py --host=https://rotaractweb.vercel.app
  Open http://localhost:8089 → set 100 users, spawn rate 10, Start

Headless (CI / quick check):
  locust -f locustfile.py --host=https://rotaractweb.vercel.app \\
    --headless -u 100 -r 10 -t 60s --html report.html
"""

from locust import HttpUser, between, task


class PublicVisitor(HttpUser):
    """Simulates a visitor browsing public pages with short pauses between clicks."""

    wait_time = between(1, 3)

    @task(4)
    def home(self) -> None:
        self.client.get("/", name="/")

    @task(3)
    def login(self) -> None:
        self.client.get("/login", name="/login")

    @task(2)
    def calendar(self) -> None:
        self.client.get("/calendar", name="/calendar")

    @task(2)
    def events(self) -> None:
        self.client.get("/events", name="/events")

    @task(1)
    def clubs(self) -> None:
        self.client.get("/clubs", name="/clubs")

    @task(1)
    def contact(self) -> None:
        self.client.get("/contact", name="/contact")
