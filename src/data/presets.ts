import { CodeFile } from '../types/audit';

export interface AuditPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  files: CodeFile[];
}

export const AUDIT_PRESETS: AuditPreset[] = [
  {
    id: 'express-auth-sqli',
    name: 'Node.js Express API (SQLi & JWT Secret Leak)',
    category: 'Backend / Security Flaws',
    description: 'Realistic user authentication service with concatenated SQL queries, hardcoded JWT secrets, and missing rate limits.',
    files: [
      {
        id: 'f1',
        path: 'src/controllers/authController.js',
        language: 'javascript',
        content: `const jwt = require('jsonwebtoken');
const db = require('../db');

// WARNING: Hardcoded secret key
const JWT_SECRET = "super_secret_jwt_master_key_998877!";

// User login endpoint vulnerable to SQL Injection
async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    // VULNERABLE: Direct string concatenation allows ' OR '1'='1 bypass
    const query = "SELECT * FROM users WHERE email = '" + email + "' AND password = '" + password + "'";
    console.log("Executing SQL: ", query);
    
    const [user] = await db.raw(query);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Token generated with hardcoded secret and no expiration
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);

    // Insecure: password hash sent back to client
    return res.json({
      message: "Logged in successfully",
      token,
      user
    });
  } catch (err) {
    // Leaking raw database error stack trace to client
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}

// Insecure user search without sanitization
async function searchUsers(req, res) {
  const { term } = req.query;
  const results = await db.raw("SELECT id, username, email FROM users WHERE username LIKE '%" + term + "%'");
  res.json(results);
}

module.exports = { loginUser, searchUsers };`
      },
      {
        id: 'f2',
        path: 'server.js',
        language: 'javascript',
        content: `const express = require('express');
const cors = require('cors');
const { loginUser, searchUsers } = require('./src/controllers/authController');

const app = express();
app.use(express.json());

// INSECURE: Open CORS wildcard with credentials
app.use(cors({ origin: '*', credentials: true }));

// Missing rate limiting on sensitive authentication route
app.post('/api/auth/login', loginUser);
app.get('/api/users/search', searchUsers);

// Insecure eval / command execution endpoint
app.post('/api/eval', (req, res) => {
  const result = eval(req.body.code); // Critical Remote Code Execution risk
  res.send({ result });
});

app.listen(8080, () => {
  console.log("Server listening on port 8080");
});`
      },
      {
        id: 'f3',
        path: 'package.json',
        language: 'json',
        content: `{
  "name": "vulnerable-express-auth",
  "version": "1.0.0",
  "dependencies": {
    "express": "4.16.1",
    "jsonwebtoken": "8.5.1",
    "cors": "2.8.5",
    "lodash": "4.17.15"
  }
}`
      }
    ]
  },
  {
    id: 'python-flask-pipeline',
    name: 'Python Flask Data Pipeline (AWS Secret & SSRF)',
    category: 'Cloud / Data Engineering',
    description: 'Data ingestion service containing hardcoded AWS credentials, Server-Side Request Forgery (SSRF), and unsafe pickle deserialization.',
    files: [
      {
        id: 'p1',
        path: 'pipeline.py',
        language: 'python',
        content: `import os
import pickle
import requests
import sqlite3
from flask import Flask, request, jsonify

app = Flask(__name__)

# CRITICAL: Leaked production AWS access keys in source control
AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
DB_PATH = "analytics.db"

@app.route('/ingest-remote', methods=['POST'])
def ingest_remote_data():
    """Fetches data from user supplied URL without validation (SSRF)"""
    url = request.json.get('remote_url')
    
    # VULNERABILITY: Blind SSRF can scan internal metadata service (http://169.254.169.254)
    response = requests.get(url, timeout=30)
    data = response.text
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Unsanitized SQL insert
    cursor.execute(f"INSERT INTO raw_events (payload) VALUES ('{data}')")
    conn.commit()
    # BUG: Connection is not closed, causing resource leak
    
    return jsonify({"status": "ingested", "bytes": len(data)})

@app.route('/deserialize-model', methods=['POST'])
def load_model():
    """Unsafe deserialization allowing Remote Code Execution (RCE)"""
    model_bytes = request.get_data()
    # CRITICAL: Untrusted pickle.loads permits arbitrary code execution
    model = pickle.loads(model_bytes)
    return jsonify({"model_type": str(type(model))})

if __name__ == '__main__':
    # Debug=True exposes interactive Werkzeug debugger pin/terminal to attackers
    app.run(host='0.0.0.0', port=5000, debug=True)`
      },
      {
        id: 'p2',
        path: 'requirements.txt',
        language: 'plaintext',
        content: `Flask==2.0.1
requests==2.25.1
boto3==1.17.0`
      }
    ]
  },
  {
    id: 'react-ts-xss-leak',
    name: 'React & TypeScript (DOM XSS & Memory Leak)',
    category: 'Frontend / Client Security',
    description: 'Frontend component with unescaped HTML injection (XSS), prototype pollution vector, and uncleaned window event listeners.',
    files: [
      {
        id: 'r1',
        path: 'src/components/UserProfile.tsx',
        language: 'typescript',
        content: `import React, { useEffect, useState } from 'react';

interface UserBioProps {
  rawBioHtml: string;
  userId: string;
}

export const UserProfile: React.FC<UserBioProps> = ({ rawBioHtml, userId }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    // MEMORY LEAK: Missing cleanup function in useEffect!
    window.addEventListener('resize', handleResize);
  }, []);

  return (
    <div className="profile-card">
      <h2>User Profile: {userId}</h2>
      <p>Viewport width: {windowWidth}px</p>
      
      {/* CRITICAL: Cross-Site Scripting (XSS) via unsanitized dangerouslySetInnerHTML */}
      <div 
        className="bio-content" 
        dangerouslySetInnerHTML={{ __html: rawBioHtml }} 
      />
    </div>
  );
};`
      }
    ]
  },
  {
    id: 'go-microservice',
    name: 'Go Microservice (Insecure TLS & Command Injection)',
    category: 'Systems / Microservices',
    description: 'Go service with disabled TLS certificate verification, race condition on shared map, and unsanitized exec.Command.',
    files: [
      {
        id: 'g1',
        path: 'main.go',
        language: 'go',
        content: `package main

import (
	"crypto/tls"
	"fmt"
	"net/http"
	"os/exec"
)

var cache = make(map[string]string) // RACE CONDITION: unsynchronized concurrent map writes

func handler(w http.ResponseWriter, r *http.Request) {
	domain := r.URL.Query().Get("domain")
	
	// VULNERABLE: Command injection via shell execution of user input
	cmdStr := fmt.Sprintf("nslookup %s", domain)
	out, err := exec.Command("sh", "-c", cmdStr).CombinedOutput()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	
	// INSECURE: Disabling TLS verification allows Man-In-The-Middle (MITM) attacks
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}
	client := &http.Client{Transport: tr}
	_, _ = client.Get("https://internal.telemetry.svc/log")

	cache[domain] = string(out)
	w.Write(out)
}

func main() {
	http.HandleFunc("/lookup", handler)
	http.ListenAndServe(":8080", nil)
}`
      }
    ]
  }
];
