"""Backend tests for Ankommen — Germany Relocation Guide."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or "https://settle-guide-de.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@ankommen.de"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="session")
def s():
    return requests.Session()


# ---- Content -------------------------------------------------------------
def test_meta_returns_types_and_cities():
    r = requests.get(f"{API}/content/meta")
    assert r.status_code == 200
    data = r.json()
    assert len(data["user_types"]) == 4
    ids = {t["id"] for t in data["user_types"]}
    assert ids == {"student", "job", "refugee", "other"}
    assert len(data["cities"]) == 5
    slugs = {c["slug"] for c in data["cities"]}
    assert slugs == {"munich", "berlin", "hamburg", "frankfurt", "cologne"}


def test_journey_berlin_student_anmeldung_appointment():
    r = requests.get(f"{API}/content/journey", params={"city": "berlin", "type": "student"})
    assert r.status_code == 200
    j = r.json()
    step_ids = [s["id"] for p in j["phases"] for s in p["steps"]]
    assert "anmeldung" in step_ids and "enrolment" in step_ids
    an = next(s for p in j["phases"] for s in p["steps"] if s["id"] == "anmeldung")
    assert an["city_info"]["mode"] == "appointment"


def test_journey_munich_job_anmeldung_walkin_and_employment():
    r = requests.get(f"{API}/content/journey", params={"city": "munich", "type": "job"})
    assert r.status_code == 200
    j = r.json()
    an = next(s for p in j["phases"] for s in p["steps"] if s["id"] == "anmeldung")
    assert an["city_info"]["mode"] == "walk-in"
    step_ids = [s["id"] for p in j["phases"] for s in p["steps"]]
    assert "employment_setup" in step_ids
    assert "enrolment" not in step_ids


def test_journey_refugee_has_asylum_and_integration():
    r = requests.get(f"{API}/content/journey", params={"city": "hamburg", "type": "refugee"})
    assert r.status_code == 200
    ids = [s["id"] for p in r.json()["phases"] for s in p["steps"]]
    assert "asylum_registration" in ids
    assert "integration_support" in ids
    assert "entry_permit" not in ids


def test_journey_invalid_city_or_type():
    assert requests.get(f"{API}/content/journey", params={"city": "paris", "type": "student"}).status_code == 400
    assert requests.get(f"{API}/content/journey", params={"city": "berlin", "type": "alien"}).status_code == 400

# ---- New content endpoints (guide/city-guide/compare/basics) --------------
def test_guide_general_returns_4_phases_and_14_steps():
    r = requests.get(f"{API}/content/guide")
    assert r.status_code == 200
    data = r.json()
    assert len(data["phases"]) == 4
    assert data["total_steps"] == 14
    for phase in data["phases"]:
        for step in phase["steps"]:
            assert "applies_label" in step and step["applies_label"]


def test_city_guide_berlin_appointment_and_munich_walkin():
    rb = requests.get(f"{API}/content/city-guide/berlin")
    assert rb.status_code == 200
    b = rb.json()
    an = next(s for p in b["phases"] for s in p["steps"] if s["id"] == "anmeldung")
    assert an["city_info"]["mode"] == "appointment"

    rm = requests.get(f"{API}/content/city-guide/munich")
    assert rm.status_code == 200
    m = rm.json()
    an2 = next(s for p in m["phases"] for s in p["steps"] if s["id"] == "anmeldung")
    assert an2["city_info"]["mode"] == "walk-in"


def test_city_guide_invalid_slug_404():
    r = requests.get(f"{API}/content/city-guide/paris")
    assert r.status_code == 404


def test_compare_steps_and_city_modes():
    r = requests.get(f"{API}/content/compare")
    assert r.status_code == 200
    d = r.json()
    step_ids = [s["id"] for s in d["steps"]]
    assert step_ids == ["anmeldung", "residence_permit"]
    assert len(d["cities"]) == 5
    modes = {c["slug"]: c["notes"]["anmeldung"]["mode"] for c in d["cities"]}
    assert modes["munich"] == "walk-in"
    assert modes["berlin"] == "appointment"
    assert modes["hamburg"] == "appointment"
    assert modes["frankfurt"] == "hybrid"
    assert modes["cologne"] == "appointment"


def test_germany_basics_returns_10_items():
    r = requests.get(f"{API}/content/germany-basics")
    assert r.status_code == 200
    d = r.json()
    assert len(d["items"]) == 10
    for item in d["items"]:
        assert item.get("id") and item.get("title") and item.get("body")




# ---- Auth ----------------------------------------------------------------
def test_admin_login_and_me():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    assert r.json()["email"] == ADMIN_EMAIL
    assert "access_token" in s.cookies
    r2 = s.get(f"{API}/auth/me")
    assert r2.status_code == 200
    assert r2.json()["email"] == ADMIN_EMAIL


def test_login_wrong_password():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-xyz"})
    assert r.status_code == 401


def test_register_login_logout_flow():
    s = requests.Session()
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    # Register
    r = s.post(f"{API}/auth/register", json={"name": "Test User", "email": email, "password": "secret123"})
    assert r.status_code == 200, r.text
    user = r.json()
    assert user["email"] == email
    assert "access_token" in s.cookies

    # Duplicate register -> 400
    r2 = requests.post(f"{API}/auth/register", json={"name": "T", "email": email, "password": "secret123"})
    assert r2.status_code == 400

    # /me works
    r3 = s.get(f"{API}/auth/me")
    assert r3.status_code == 200

    # Profile update
    r4 = s.put(f"{API}/profile", json={"selected_city": "berlin", "user_type": "student"})
    assert r4.status_code == 200
    p = r4.json()
    assert p["selected_city"] == "berlin" and p["user_type"] == "student"

    # Invalid profile
    assert s.put(f"{API}/profile", json={"selected_city": "paris"}).status_code == 400
    assert s.put(f"{API}/profile", json={"user_type": "alien"}).status_code == 400

    # Toggle progress
    r5 = s.post(f"{API}/progress/toggle", json={"step_id": "anmeldung", "completed": True})
    assert r5.status_code == 200
    assert "anmeldung" in r5.json()["completed_steps"]

    r5b = s.post(f"{API}/progress/toggle", json={"step_id": "anmeldung", "completed": False})
    assert r5b.status_code == 200
    assert "anmeldung" not in r5b.json()["completed_steps"]

    # Persistence: login again and check
    s2 = requests.Session()
    s2.post(f"{API}/progress/toggle", json={"step_id": "accommodation", "completed": True})  # unauth -> 401
    s2.post(f"{API}/auth/login", json={"email": email, "password": "secret123"})
    me = s2.get(f"{API}/auth/me").json()
    assert me["selected_city"] == "berlin"

    # Logout
    r6 = s.post(f"{API}/auth/logout")
    assert r6.status_code == 200
    # After logout, /me should 401 (cookies cleared on session)
    r7 = s.get(f"{API}/auth/me")
    assert r7.status_code == 401


def test_unauth_profile_and_progress_401():
    assert requests.put(f"{API}/profile", json={"selected_city": "berlin"}).status_code == 401
    assert requests.post(f"{API}/progress/toggle", json={"step_id": "x", "completed": True}).status_code == 401
