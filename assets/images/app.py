import sqlite3

# Connect to database
conn = sqlite3.connect("database.db")
cursor = conn.cursor()

# Create tables (run once)
with open("schema.sql") as f:
    cursor.executescript(f.read())

conn.commit()
conn.close()