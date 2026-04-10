import sqlite3
from werkzeug.security import generate_password_hash

def seed():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # Clear all tables
    tables = ['home_config', 'about_config', 'mission_points', 'highlights',
              'events', 'projects', 'achievements', 'team', 'contact_config',
              'gallery', 'faq']
    for t in tables:
        try:
            cursor.execute(f"DELETE FROM {t}")
        except:
            pass

    # ── 1. HOME ─────────────────────────────────────────────
    cursor.execute(
        "INSERT INTO home_config (id, college_name, tagline, intro) VALUES (1, ?, ?, ?)",
        ("Guru Nanak Dev Engineering College Bidar",
         "Next-Gen AIML Innovation Hub",
         "Guru Nanak Dev Engineering College, Bidar — A premier institution empowering tomorrow's engineers with cutting-edge AI research, real-world industrial intelligence, and a legacy of academic excellence since 1980."))

    # ── 2. ABOUT ────────────────────────────────────────────
    cursor.execute(
        "INSERT INTO about_config (id, description, vision) VALUES (1, ?, ?)",
        ("Guru Nanak Dev Engineering College, Bidar (GNDECB), established in 1980, is a premier institution affiliated to VTU Belagavi. Our AIML Innovation Hub is the department's nerve center — a space where cutting-edge research meets hands-on innovation. With world-class labs, industry partnerships, and a faculty of domain experts, we prepare students to lead the next wave of AI-driven transformation across industries.",
         "To be a globally recognized center of excellence in Artificial Intelligence and Machine Learning education, producing ethical innovators who solve humanity's greatest challenges through technology."))

    # ── 3. MISSION ──────────────────────────────────────────
    missions = [
        "Integrate professional skills with academic learning to solve real-world industrial challenges.",
        "Promote cutting-edge research and consultancy activities in AI, ML, and Data Science.",
        "Cultivate ethical values and a humanitarian mindset in future technologists.",
        "Establish strong industry-academic partnerships for global competitiveness.",
        "Foster an entrepreneurial ecosystem encouraging student-led innovation and startups."
    ]
    cursor.executemany("INSERT INTO mission_points (point) VALUES (?)", [(m,) for m in missions])

    # ── 4. HIGHLIGHTS ───────────────────────────────────────
    highlights = [
        "NBA Tier-1 Accredited",
        "15+ AI/ML Research Labs",
        "95% Placement Record",
        "10 LPA+ Top Packages",
        "Active AI-Node Chapter",
        "VGST Research Grants"
    ]
    cursor.executemany("INSERT INTO highlights (point) VALUES (?)", [(h,) for h in highlights])

    # ── 5. EVENTS ───────────────────────────────────────────
    events = [
        ("Smart India Hackathon 2026",
         "Official inner-selection round for SIH 2026 problem statements. 200+ students competed across 8 problem domains including healthcare AI, smart cities, and defense technology.",
         "event1.jpg"),
        ("Tech-Srijan Annual Symposium",
         "Our flagship annual technical festival featuring 25+ events including coding marathons, robotics challenges, AI paper presentations, and industry keynote sessions.",
         "event2.jpg"),
        ("Deep Learning Bootcamp",
         "Intensive 5-day hands-on bootcamp covering CNN architectures, transformer models, GANs, and deployment pipelines with TensorFlow and PyTorch.",
         "event3.jpg"),
        ("AWS Cloud Architecture Workshop",
         "Industry-led workshop on cloud-native application design, serverless computing, and MLOps deployment strategies on Amazon Web Services.",
         "event4.jpg"),
        ("Cyber Security CTF Challenge",
         "Capture The Flag competition focusing on web exploitation, cryptography, reverse engineering, and network vulnerability assessment.",
         "event5.jpg"),
        ("RoboWar Championship 2026",
         "High-stakes robotics competition featuring autonomous navigation challenges, sumo wrestling bots, and line-follower speed trials.",
         "event6.jpg"),
    ]
    cursor.executemany("INSERT INTO events (title, description, image_path) VALUES (?, ?, ?)", events)

    # ── 6. PROJECTS ─────────────────────────────────────────
    projects = [
        ("Rahul Sharma", "IoT Smart Agricultural Bot",
         "An automated precision farming system using soil moisture sensors, weather APIs, and ML-based crop health analysis for intelligent irrigation scheduling.",
         "https://github.com/rahul/smart-agri-bot"),
        ("Priya Singh", "AI Pneumonia Diagnostic Tool",
         "CNN-based medical imaging classifier achieving 96.3% accuracy in detecting pneumonia from chest X-ray imagery using transfer learning with ResNet-50.",
         "https://github.com/priya/pneumonia-ai"),
        ("Amit Kumar", "Blockchain Voting Platform",
         "Secure, decentralized voting platform for institutional elections using Ethereum smart contracts with voter verification and tamper-proof audit trails.",
         "https://github.com/amit/chain-vote"),
        ("Sneha Patil", "Warehouse Logistics Drone",
         "Autonomous indoor navigation drone using SLAM algorithms and computer vision for real-time warehouse inventory management and optimization.",
         "https://github.com/sneha/drone-logistics"),
        ("Vikram Joshi", "Smart Traffic Controller",
         "Density-based adaptive traffic signal controller using YOLOv8 object detection and reinforcement learning to optimize urban traffic flow in real-time.",
         "https://github.com/vikram/traffic-cv"),
        ("Neha Roy", "E-Learning Recommendation Engine",
         "Collaborative filtering and content-based hybrid recommendation system for personalized course suggestions, improving student engagement by 40%.",
         "https://github.com/neha/recommend-ai"),
    ]
    cursor.executemany("INSERT INTO projects (student_name, project_title, description, github_link) VALUES (?, ?, ?, ?)", projects)

    # ── 7. ACHIEVEMENTS ─────────────────────────────────────
    achievements = [
        ("NBA Tier-1 Accreditation", "CSE & AIML departments secured premier-tier accreditation from the National Board of Accreditation, validating our world-class education standards."),
        ("1st Prize — National Hackathon", "Team NeuralNet won the grand prize at IIT Delhi's Smart Solutions Challenge, competing against 500+ teams from across India."),
        ("VGST Research Grant ₹25L", "Received prestigious VGST funding for establishing the Deep Neural Computing Lab with high-end GPU infrastructure."),
        ("95% Placement Index 2025", "Achieved record-breaking placements with students landing roles at Amazon, Microsoft, TCS, Infosys, and major AI startups."),
        ("3 International Patents Filed", "Faculty members successfully filed patents for novel AI-driven solutions in healthcare diagnostics and autonomous systems."),
        ("Best Department Award", "Recognized as the Best Emerging Department at the Karnataka State Technical Education Conference 2025."),
    ]
    cursor.executemany("INSERT INTO achievements (title, description) VALUES (?, ?)", achievements)

    # ── 8. TEAM ─────────────────────────────────────────────
    team = [
        ("Dr. Dhananjay M.", "Principal & AI Research Lead", "team1.jpg"),
        ("Prof. Savita K.", "HOD — AIML Department", "team2.jpg"),
        ("Dr. Rajesh P.", "Associate Professor — Deep Learning", "team3.jpg"),
        ("Prof. Meena S.", "Assistant Professor — NLP & CV", "team4.jpg"),
        ("Arjun Kumar", "Student Lead Coordinator", "team5.jpg"),
        ("Megha Patil", "Technical Event Coordinator", "team6.jpg"),
    ]
    cursor.executemany("INSERT INTO team (name, role, image_path) VALUES (?, ?, ?)", team)

    # ── 9. CONTACT ──────────────────────────────────────────
    cursor.execute(
        "INSERT INTO contact_config (id, address, email, phone, map_location) VALUES (1, ?, ?, ?, ?)",
        ("Mailoor Road, Bidar, Karnataka — 585401",
         "aiml@gndecb.ac.in",
         "+91 84822 26569",
         "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3789.0!2d77.52!3d17.91!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDU0JzM2LjAiTiA3N8KwMzEnMTIuMCJF!5e0!3m2!1sen!2sin!4v1"))

    # ── 10. GALLERY ─────────────────────────────────────────
    gallery = [
        ("https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=600&q=80", "Campus Aerial View"),
        ("https://images.unsplash.com/photo-1523050854058-8df90110c7f1?auto=format&fit=crop&w=600&q=80", "AI Research Lab"),
        ("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80", "Workshop Session"),
        ("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80", "Tech-Srijan Event"),
        ("https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80", "Team Collaboration"),
        ("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80", "Innovation Hub"),
        ("https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80", "Library & Resources"),
        ("https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80", "Robotics Lab"),
    ]
    cursor.executemany("INSERT INTO gallery (url, caption) VALUES (?, ?)", gallery)

    # ── 11. FAQ ─────────────────────────────────────────────
    faq = [
        ("What is the AIML department about?",
         "The AIML (Artificial Intelligence & Machine Learning) department at GNDECB focuses on cutting-edge AI research, hands-on project development, and preparing students for careers in data science, machine learning, deep learning, and intelligent systems engineering."),
        ("What are the placement opportunities?",
         "Our students are placed in top tech companies including Amazon, Microsoft, TCS, Infosys, and emerging AI startups with packages ranging from 4 LPA to 15+ LPA. We maintain a consistent 95%+ placement rate."),
        ("Are there research opportunities for students?",
         "Absolutely! Students can participate in VGST-funded research projects, publish papers in international conferences (IEEE, Springer), and work on real-world AI solutions in our 15+ dedicated research labs."),
        ("How can I participate in department events?",
         "Join our student chapters like AI-Node and Robotics-Link. Follow our events section for upcoming hackathons, workshops, bootcamps, and the annual Tech-Srijan National Symposium."),
        ("What programming languages and tools are taught?",
         "The curriculum covers Python, R, Java, C++, and specialized ML frameworks including TensorFlow, PyTorch, scikit-learn, and Hugging Face, alongside cloud platforms like AWS, Azure, and GCP."),
        ("Is there an AI assistant on this website?",
         "Yes! Meet Aira — our AI-powered virtual assistant. Click the chat icon at the bottom-left corner to ask questions about events, projects, admissions, or anything related to our department."),
    ]
    cursor.executemany("INSERT INTO faq (question, answer) VALUES (?, ?)", faq)

    # ── RESET ADMIN PASSWORD ────────────────────────────────
    hashed_pw = generate_password_hash('admin123')
    try:
        cursor.execute('DELETE FROM admins')
        cursor.execute('INSERT INTO admins (username, password) VALUES (?, ?)', ('admin', hashed_pw))
    except:
        pass

    conn.commit()
    conn.close()
    print("✅ Database fully seeded with professional GNDECB data!")
    print("   Admin: username='admin', password='admin123'")

if __name__ == "__main__":
    seed()
