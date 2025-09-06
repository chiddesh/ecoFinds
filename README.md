# 🌿 EcoFinds – Empowering Sustainable Consumption through a Second-Hand Marketplace  

## 📌 Overview  
EcoFinds is a vibrant and trusted second-hand marketplace designed to **revolutionize the way people buy and sell pre-owned goods**. Our mission is to **foster a culture of sustainability** by extending the lifecycle of products, reducing waste, and promoting responsible consumption.  

This project was built as part of a **hackathon challenge**, focusing on developing a foundational version of EcoFinds with **user authentication, product listing, and browsing features**.  

---

## 🎯 Vision  
To become the **go-to destination** for a conscious community seeking **unique finds and sustainable choices**, while enabling buyers and sellers to connect through a seamless and intuitive platform.  

---

## 🚀 Mission  
To develop a **user-friendly and engaging desktop and mobile application** that serves as a hub for buying and selling second-hand items. EcoFinds promotes the **circular economy** and makes sustainable living accessible to everyone.  

---

## ❓ Problem Statement  
Develop a **functional prototype** of EcoFinds with the following features:  
- Simple and secure **user authentication** (email + password).  
- **User profile** creation and dashboard for editing user details.  
- **Product listing management (CRUD)** with attributes:  
  - Title  
  - Description  
  - Category  
  - Price  
  - At least one image (placeholder support included)  
- **Browsing, filtering, and keyword search** for product discovery.  
- **Product detail view** with full information.  
- **Cart functionality** for adding/removing items.  
- **Previous purchases view** for tracking orders.  

---

## 🖥️ Wireframe Screens  

### 🔑 Login / Sign Up  
- App logo  
- Email & password inputs  
- Login button, Sign-up link  

### 🛍️ Product Listing Feed  
- App title/logo in header  
- Search bar  
- Category filter (dropdown or buttons)  
- List of product cards (image, title, price)  
- Floating “+” button to add new products  

### ➕ Add New Product  
- Back button  
- Fields: Title, Category, Description, Price  
- “+ Add Image” placeholder  
- Submit listing button  

### 📂 My Listings  
- List of user’s products with Edit/Delete options  
- “+” button to add new product  

### 📄 Product Detail  
- Larger image placeholder  
- Title, Price, Category, Description  

### 👤 User Dashboard  
- Profile picture  
- Editable user fields  

### 🛒 Cart  
- Cards of all added products  
- Basic product info  

### 📦 Previous Purchases  
- List view of previously purchased products  

---

## ⚙️ Tech Stack  
- **Frontend:** React, TailwindCSS  
- **Backend:** Node.js + Express  
- **Database:** Supabase / PostgreSQL  
- **Auth:** Secure email + password login  
- **Storage:** LocalStorage (for cart) + Supabase (for persistence)  

---

## 🏁 Getting Started  

### 1️⃣ Clone the repo  
```bash
git clone https://github.com/your-username/ecofinds.git
cd ecofinds
```