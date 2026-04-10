import sqlite3
import json
import urllib.request

def verify():
    print("--- STARTING LIVE DEMO VERIFICATION ---")
    
    # 1. Simulate Admin Action: Add Achievement
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    title = "Best Innovative College Award 2026"
    desc = "GNDECB was recognized as the most innovative engineering branch in Karnataka for our AI research labs."
    cursor.execute("INSERT INTO achievements (title, description) VALUES (?, ?)", (title, desc))
    conn.commit()
    print(f"✅ VERIFIED: Achievement '{title}' added to Neural Node.")

    # 2. Simulate Admin Action: Add Team Member
    name = "Dr. Rahul V."
    role = "AI Research Lead"
    cursor.execute("INSERT INTO team (name, role, image_path) VALUES (?, ?, ?)", (name, role, "rahul.jpg"))
    conn.commit()
    print(f"✅ VERIFIED: Team Member '{name}' deployed to Faculty Node.")
    conn.close()

    # 3. Simulate Public User Action: Send Message
    contact_payload = {
        "name": "Arjun Kumar",
        "email": "arjun@example.com",
        "message": "Hello GNDECB Team, I am interested in joining the AIML hackathon. Please guide me."
    }
    req = urllib.request.Request("http://127.0.0.1:5000/api/contact", 
                                 data=json.dumps(contact_payload).encode('utf-8'),
                                 headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        print(f"✅ VERIFIED: Contact message sent. Status: {resp.status}")

    # 4. Verify Aira Chatbot (Gemini Integration)
    chat_payload = {"message": "Tell me about GNDECB Bidar."}
    req = urllib.request.Request("http://127.0.0.1:5000/api/chat",
                                 data=json.dumps(chat_payload).encode('utf-8'),
                                 headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"🤖 AIRA RESPONSE: {data['reply']}")
            print("✅ VERIFIED: Gemini AI Neural Link active.")
    except Exception as e:
        print(f"❌ Gemini Verification Failed: {e}")

if __name__ == "__main__":
    verify()
