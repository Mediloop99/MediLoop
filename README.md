# 💊 Mediloop

<p align="center">
  <img src="./public/banner.png" alt="Mediloop Banner" width="100%" />
</p>

<p align="center">

**An intelligent platform for verifying and redistributing unused medicines safely.**

Reducing medicine waste through AI-assisted verification and transparent donation workflows.

[![React](https://img.shields.io/badge/React-19-61DAFB)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6)]()
[![Tesseract.js](https://img.shields.io/badge/OCR-Tesseract.js-blue)]()
[![ZXing](https://img.shields.io/badge/Barcode-ZXing-green)]()
[![License](https://img.shields.io/badge/License-MIT-success)]()

</p>

---

# Why Mediloop?

Every year, large quantities of unopened and unexpired medicines are discarded, while many NGOs, charitable organizations, and underserved communities struggle to access essential medication.

Although medicine donation has the potential to reduce waste and improve accessibility, the lack of reliable verification often prevents safe redistribution.

Mediloop explores how AI-assisted verification, OCR, and barcode scanning can help create a safer, more transparent medicine donation ecosystem.

---

# Overview

Mediloop is a healthcare-focused platform that enables individuals to donate unused medicines while helping organizations verify and manage those donations responsibly.

The platform combines intelligent document scanning, medicine verification, and donation workflows to improve trust throughout the redistribution process.

---

# The Problem

Medicine donation is often limited by uncertainty.

Questions such as:

* Is the medicine genuine?
* Has it expired?
* Does the packaging match the product?
* Can an NGO trust this donation?

often remain unanswered.

As a result, many perfectly usable medicines are discarded instead of reaching people who need them.

---

# Our Approach

Instead of relying solely on manual verification, Mediloop combines computer vision and structured workflows to assist in medicine validation before donations are accepted.

The goal is not to replace healthcare professionals but to provide better tools for safer decision-making.

---

# Features

## 🔍 Intelligent Medicine Verification

Extracts medicine information using:

* OCR
* Barcode Scanning
* QR Code Recognition

Detects:

* Medicine Name
* Batch Number
* Expiry Date
* Manufacturer Details

---

## 🤖 AI-Assisted Validation

Verifies extracted information and prepares structured medicine records for review.

---

## ♻️ Donation Management

Allows donors to:

* Register medicine donations
* Upload medicine information
* Track donation status

---

## 🏥 NGO Dashboard

Organizations can:

* Browse available medicines
* Review verification details
* Accept eligible donations
* Track donation requests

---

## 📍 Smart Matching

Matches available medicines with nearby organizations based on location and availability.

---

# Example Workflow

```text
Donor
   │
   ▼
Upload Medicine
   │
   ▼
OCR & Barcode Scanner
   │
   ▼
Verification Engine
   │
   ▼
Medicine Validation
   │
   ▼
Verified Inventory
   │
   ▼
NGO Dashboard
   │
   ▼
Recipient
```

---

# Screenshots

| Home           | Verification   |
| -------------- | -------------- |
| Add Screenshot | Add Screenshot |

| Donation Flow  | NGO Dashboard  |
| -------------- | -------------- |
| Add Screenshot | Add Screenshot |

---

# Demo

A short demonstration showing:

Medicine Scan → Verification → Donation Listing → NGO Acceptance

*(Demo video coming soon.)*

---

# Tech Stack

## Frontend

* React
* TypeScript
* Vite

## AI & Verification

* Tesseract.js
* ZXing
* QuaggaJS

## Future Integrations

* Medicine Databases
* Verification APIs
* NGO Management Services

---

# System Architecture

```text
                    Donor
                      │
                      ▼
            Upload Medicine Details
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
 OCR Text Extraction         Barcode Scanner
        │                           │
        └─────────────┬─────────────┘
                      ▼
             Verification Engine
                      │
                      ▼
           Structured Medicine Record
                      │
                      ▼
             Verified Donation Pool
                      │
                      ▼
                 NGO Dashboard
                      │
                      ▼
                  Beneficiaries
```

---

# Repository Status

| Status        | Value            |
| ------------- | ---------------- |
| Project Stage | Prototype        |
| Built For     | MumbaiHacks 2025 |
| Development   | Active           |
| Open Source   | Yes              |
| Contributions | Welcome          |

---

# Getting Started

Clone the repository

```bash
git clone https://github.com/yourusername/mediloop.git
```

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

Open

```text
http://localhost:3000
```

---

# Project Structure

```text
Mediloop/

├── src/
├── components/
├── pages/
├── hooks/
├── services/
├── assets/
├── public/
├── README.md
└── package.json
```

---

# Roadmap

## Phase 1 ✅

* Medicine OCR
* Barcode Verification
* Donation Listings
* NGO Portal Prototype

---

## Phase 2 🚧

* Authentication
* Real-time Inventory
* Medicine Database Integration
* Advanced Search

---

## Phase 3 🚀

* Mobile Application
* NGO Analytics Dashboard
* AI-Based Authenticity Assistance
* Multi-language Support
* Hospital Partnerships

---

# Future Vision

Mediloop explores a future where technology helps reduce avoidable medicine waste while improving access to essential healthcare resources.

Although currently a prototype, the long-term vision is to build an ecosystem where medicine donations are easier to verify, safer to distribute, and more transparent for everyone involved.

---

# Hackathon

This project was originally developed as a solo submission for **MumbaiHacks 2025**, where the focus was on exploring practical technology solutions for healthcare accessibility and sustainability.

---

# Contributing

Contributions are welcome from developers, designers, healthcare professionals, and open-source enthusiasts.

If you'd like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a Pull Request.

Please open an issue before proposing major changes.

---

# License

This project is licensed under the **MIT License**.

---

# Acknowledgements

Mediloop was built to explore how AI-assisted verification and transparent workflows can make medicine donation safer and more accessible.

Special thanks to the open-source community and everyone working to improve healthcare accessibility through technology.

---

<p align="center">

If you find this project interesting, consider giving it a ⭐ to support its development.

</p>
