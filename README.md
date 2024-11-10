# MsaadaPlus

## Table of Contents
- [Overview](#overview)
- [Solution](#solution)
- [Project Structure](#project-structure)
- [Features](#features)
  - [User Roles](#user-roles)
  - [User Stories](#user-stories)
- [Technical Specifications](#technical-specifications)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Testing](#testing)
- [Future Development](#future-development)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup and Installation](#setup-and-installation)
  - [Testing](#testing)
- [Contribution](#contribution)
- [License](#license)

---

## Overview
**MsaadaPlus** is a web application developed to address educational challenges faced by school-going girls in Sub-Saharan Africa, who miss significant school time due to lack of access to sanitary products. Studies reveal that in 2016, girls from low-income families missed 20% of school days annually because they could not afford sanitary towels. This platform aims to facilitate repeat donations, empowering organizations to provide sanitary products, clean water, and adequate sanitation facilities, ensuring adherence to UNICEF's menstrual hygiene guidelines.

## Solution
The platform provides an automated donation system that allows users to set up regular contributions to support charities working in menstrual health and hygiene. The key features include setting up monthly donations, anonymous donations, donation reminders, and beneficiary stories, all designed to encourage continuous donor engagement and support.

## Project Structure
This project is a **full-stack application** utilizing:
- **Frontend**: React.js with Redux Toolkit for state management.
- **Backend**: Flask with SQLAlchemy for database management.
- **Database**: SQLAlchemy.
- **Testing Frameworks**: Jest for frontend testing and MiniTests for backend.

## Features

### User Roles
The platform supports three primary user roles:
1. **Donor** - Individuals who can make one-time or recurring donations.
2. **Charity** - Nonprofit organizations benefiting from donations, focusing on menstrual health and hygiene.
3. **Administrator** - Platform moderator responsible for approving and managing charity applications.

### User Stories

#### Donor
- View available charities to support.
- Create an account and set up their profile.
- Select a charity and make one-time or recurring donations.
- Set up automated, repeat donations (e.g., monthly).
- Choose to donate anonymously or publicly.
- Receive monthly reminders to donate.
- Access stories of beneficiaries impacted by their donations.
- Make donations via M-Pesa.

#### Charity
- Apply to be featured on the platform.
- Upon approval, set up charity details (description, contact, etc.).
- View donations from non-anonymous donors and overall amounts from anonymous donors.
- Track total donation amounts received.
- Create and share beneficiary impact stories.
- Maintain and view inventory records for items sent to beneficiaries.

#### Administrator
- Review and approve or reject charity applications.
- Manage and delete charities as needed to maintain platform integrity.

## Technical Specifications

### Backend
- **Framework**: Flask
- **Database**: SQLAlchemy (SQL-based database)
- **Data Models**: User, Charity, Donation, Beneficiary, Inventory
- **API Endpoints**:
  - **Donor Operations**: Register, login, view charities, donate, set up recurring donations.
  - **Charity Operations**: Apply, update details, manage beneficiaries, and create stories.
  - **Admin Operations**: Manage charity applications, approvals, and deletions.

### Frontend
- **Framework**: React.js
- **State Management**: Redux Toolkit for efficient global state handling.
- **Responsive Design**: Mobile-friendly wireframes using Figma.
- **UI Features**:
  - Charity listings
  - Donation interface with payment options
  - Automated donation setup
  - Beneficiary stories and updates

### Testing
- **Frontend**: Jest for unit and integration testing.
- **Backend**: MiniTests for API testing and validation.

## Future Development
Possible improvements and additional features include:
- Enhanced reporting for charities to track donor demographics.
- Support for additional payment options beyond PayPal and Stripe.
- Integration with messaging platforms to enhance donor engagement through SMS or email notifications.
- Analytics dashboard for administrators to monitor platform performance and donation trends.

---

## Getting Started

### Prerequisites
- **Frontend**: Node.js and npm
- **Backend**: Python 3.x, Flask, SQLAlchemy

### Setup and Installation

1. **Clone the Repository**
   ```
   git clone https://github.com/0097eo/msaadaplus.git
   ```
2. **Backend Setup**
   ```
   cd backend
   pip install -r requirements.txt
   flask run
   ```

3. **Frontend Setup**
   ```
   cd frontend
   npm install
   npm start
   ```
### Testing
- Frontend: Run npm test in the frontend directory.
- Backend: Run tests with python -m unittest in the backend directory.

### Contribution
Contributions are welcome! Please open an issue or submit a pull request for any feature suggestions or bug reports.

### License
This project is licensed under the MIT license
