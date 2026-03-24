import requests

def test_socratic():
    url = "http://127.0.0.1:8000/chat"
    payload = {
        "topic": "physics",
        "history": [],
        "message": "What is Newton's second law?"
    }
    
    print(f"Testing Socratic AI Service at {url}...")
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            print("✅ Success!")
            print("Response:", response.json()["reply"])
        else:
            print(f"❌ Failed with status code: {response.status_code}")
            print("Response:", response.text)
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        print("\nMake sure you have started the service with: python socratic.py")

if __name__ == "__main__":
    test_socratic()
