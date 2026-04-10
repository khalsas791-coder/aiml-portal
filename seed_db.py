import sqlite3
import os

def seed():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # Clear existing to ensure fresh seed
    tables = ['events', 'projects', 'achievements', 'team', 'contacts']
    for t in tables:
        cursor.execute(f"DELETE FROM {t}")

    # 1. Events (6 technical events)
    events = [
        ("Smart India Hackathon Inner-Round", "The official GNDECB internal selection for SIH 2026, focusing on solving complex government problem statements with digital innovation.", "hacker.jpg"),
        ("Tech-Srijan 2026", "Our annual flagship technical symposium featuring over 20+ competitions including paper presentations, coding sprints, and hardware hacks.", "tech.jpg"),
        ("Advanced AI & Machine Learning Workshop", "A 3-day intensive bootcamp conducted by industry experts on Generative AI, LLMs, and neural network architectures.", "ai.jpg"),
        ("Full-Stack Web Development Bootcamp", "Hands-on training session covering MERN stack development and modern cloud deployment strategies.", "dev.jpg"),
        ("Cyber Security & Ethical Hacking Meetup", "Deep dive into network security, vulnerability assessment, and the latest trends in threat intelligence.", "sec.jpg"),
        ("Inter-College Robotics Challenge", "Battle of the bots! A high-stakes robotics competition focusing on autonomous navigation and obstacle avoidance.", "robot.jpg")
    ]
    cursor.executemany("INSERT INTO events (title, description, image_path) VALUES (?, ?, ?)", events)

    # 2. Projects (6 student projects)
    projects = [
        ("Rahul Sharma", "IoT-Based Smart Agriculture System", "An automated monitoring system using soil moisture sensors and ESP32 for optimized irrigation in greenhouses.", "https://github.com/rahul/smart-agri"),
        ("Priya Singh", "AI-Driven Healthcare Diagnostic Bot", "A diagnostic tool using CNN models to detect early-stage pneumonia from X-ray imagery with 98% accuracy.", "https://github.com/priya/health-bot"),
        ("Amit Patel", "Blockchain-Powered Voting Interface", "A secure, transparent voting system built on Ethereum to prevent electoral fraud in institutional elections.", "https://github.com/amit/chain-vote"),
        ("Sneha K.", "Autonomous Warehouse Robot", "A Lidar-based autonomous mobile robot (AMR) designed for path planning in complex industrial environments.", "https://github.com/sneha/warehouse-bot"),
        ("Kiran M.", "Smart Traffic Management System", "Real-time traffic density estimation using computer vision to dynamically adjust signal timings.", "https://github.com/kiran/smart-traffic"),
        ("Arjun J.", "E-Learning Recommendation Engine", "A collaborative filtering-based system to recommend personalized study materials to engineering students.", "https://github.com/arjun/elearn")
    ]
    cursor.executemany("INSERT INTO projects (student_name, project_title, description, github_link) VALUES (?, ?, ?, ?)", projects)

    # 3. Achievements (5-6 points)
    achievements = [
        ("NBA Tier-1 Accreditation", "GNDECB Bidar has successfully secured the prestigious NBA Tier-1 accreditation for the CSE and AIML departments."),
        ("1st Prize: National Level Tech Fest", "Our students secured the top position at the National Robotics League held at IIT Bombay."),
        ("Patent Filed: Smart Grid Technology", "Faculty and students of the EEE department successfully filed a patent for a decentralized smart grid load balancing system."),
        ("Excellent Placement Record 2025", "Over 95% of eligible students from the circuit branches secured packages in top-tier MNCs including Google, Amazon, and Microsoft."),
        ("Research Grant of 25 Lakhs", "The department received a significant research grant from VGST for establishing a center of excellence in 'Deep Neural Research'.")
    ]
    cursor.executemany("INSERT INTO achievements (title, description) VALUES (?, ?)", achievements)

    # 4. Team (6-8 members)
    team = [
        ("Dr. Dhananjay M.", "HOD - AIML Department", "hod.jpg"),
        ("Prof. Savita K.", "Department Coordinator", "savita.jpg"),
        ("Animesh Roy", "Student Lead Coordinator", "animesh.jpg"),
        ("Megha Deshmukh", "Technical Event Manager", "megha.jpg"),
        ("Vikram Singh", "Public Relations Officer", "vikram.jpg"),
        ("Neha Patil", "Outreach and Sponsorship Lead", "neha.jpg")
    ]
    cursor.executemany("INSERT INTO team (name, role, image_path) VALUES (?, ?, ?)", team)

    conn.commit()
    conn.close()
    print("Database seeded with GNDECB professional data.")

if __name__ == "__main__":
    seed()
