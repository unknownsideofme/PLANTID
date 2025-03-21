
# 🌿 Crop Disease Prediction: AI-Powered Diagnosis Platform
## 📌 Overview
Crop Disease Prediction is an advanced AI-powered system designed to help farmers and agricultural professionals diagnose plant diseases efficiently. By leveraging computer vision, deep learning models, and natural language processing, this platform provides instant insights on plant health using image analysis and chatbot interactions.

---

## 🚀 Why It Matters
### 🌾 Crop Diseases Cause 20-40% Yield Loss Annually
→ According to the FAO, plant diseases significantly impact global food security. AI-powered diagnosis can help mitigate this!

### 🤖 AI Can Detect Diseases with Over 90% Accuracy
→ Deep learning models like CNNs & Transformers have been shown to outperform traditional human-based diagnosis.

### 📈 Precision Agriculture is Growing Rapidly
→ The global precision farming market is expected to exceed $16 billion by 2030, driven by AI, IoT, and big data.

---

## 🏗 Project Structure
```
📂 CropDisease-Prediction
├── 📂 backend  (FastAPI & AI Processing)
│   ├── main.py  (FastAPI backend server)
│   ├── modelgpt.py  (AI model handling image processing & chat)
│   ├── requirements.txt  (Python dependencies)
├── 📂 frontend  (React.js Frontend with WebSockets)
│   ├── 📂 public
│   │   ├── plant-icon.svg  (Favicon & static assets)
│   ├── 📂 src
│   │   ├── 📂 assets  (Static assets)
│   │   │   ├── react.svg
│   │   ├── 📂 components  (UI Components)
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── DiagnosisPanel.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── UploadModal.jsx
│   │   ├── App.css  (Global styling)
│   │   ├── App.jsx  (Main React component)
│   │   ├── index.css  (TailwindCSS styling)
│   │   ├── main.jsx  (React entry point)
│   ├── .gitignore
│   ├── eslint.config.js  (ESLint configuration)
│   ├── index.html  (Base HTML file)
│   ├── package-lock.json
│   ├── package.json  (Dependencies & scripts)
│   ├── postcss.config.js  (PostCSS setup)
│   ├── tailwind.config.js  (TailwindCSS configuration)
│   ├── vite.config.js  (Vite configuration & API proxy setup)
│   ├── .gitattributes
└── 📖 README.md  (Project documentation)
```

---

## 🚀 Features

✅ **Plant Disease Diagnosis:** Upload an image of a plant and receive an AI-generated diagnosis.  
✅ **AI Chatbot Support:** Get personalized recommendations and follow-up responses using OpenAI GPT models.  
✅ **Real-time WebSocket Communication:** Engage in live AI-driven chat for immediate assistance.  
✅ **Object Detection & Image Captioning:** Extract plant details from images for better accuracy.  
✅ **Modern UI/UX:** Built with React.js, TailwindCSS, and Vite for optimal performance.  

---

## 🔧 Tech Stack
• **Frontend:** React.js, TailwindCSS, WebSockets, Vite.  
• **Backend:** FastAPI, LangChain, OpenAI GPT-4o, GROQ API  
• **Machine Learning Models:** Transformers (BLIP, DETR for image processing)  
• **WebSocket Support:** FastAPI WebSocket for real-time interaction  
• **Hosting & Deployment:** Vercel (Frontend), AWS/GCP (Backend)  

---

## 📥 Installation & Setup  
### 1️⃣ 📝Clone the Repository  
```
git clone https://github.com/HozefaTravadi/CropDisease-Prediction.git
cd CropDisease-Prediction
```
### 2️⃣ Backend Setup
```
cd backend
python -m venv venv
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```
### 3️⃣ Frontend Setup
```
cd frontend
npm install
```
### 4️⃣ Set Environment Variables
Create a `.env` file in the backend directory and add your API keys:
```
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key
```
## 📌 Steps to Run the Project
### 5️⃣ Run the Backend Server
```
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The API will be available at: http://localhost:8000

### 6️⃣ Run the Frontend
```
cd frontend
npm run dev
```
Frontend will be available at: http://localhost:5173

---

## 📡 API Endpoints
| Method | Endpoint | Description |
|----------|----------|----------|
|  GET   |  `/`   | 	Health check   |
| POST   | `/api/upload`   | Upload a plant image for analysis   |
| POST   | `/api/chat`   | Send a message to AI chatbot   |
| WS   | `/ws/{session_id}`   | Real-time chat via WebSocket   |

---

## 🚀 Deployment
### 🌍 Backend Deployment (FastAPI)
⚡ Deploy on AWS EC2 / GCP Compute Engine
```
cd backend
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```
🔹 Use  [![AWS EC2](https://img.shields.io/badge/AWS%20EC2-%23FF9900?style=plastic&logo=amazonaws&logoColor=white)](https://aws.amazon.com/ec2/) 
[![Azure Virtual Machines](https://img.shields.io/badge/Azure%20VMs-%230078D4?style=plastic&logo=microsoft-azure&logoColor=white)](https://azure.microsoft.com/en-us/products/virtual-machines/) 
[![GCP Compute Engine](https://img.shields.io/badge/Google%20Cloud-%234285F4?style=plastic&logo=google-cloud&logoColor=white)](https://cloud.google.com/compute) 
[![DigitalOcean](https://img.shields.io/badge/DigitalOcean-%230167ff?style=plastic&logo=digitalocean&logoColor=white)](https://www.digitalocean.com/)  to host the backend.

🔹 Set up [![NGINX](https://img.shields.io/badge/NGINX-%23009639?style=plastic&logo=nginx&logoColor=white)](https://www.nginx.com/) to reverse proxy the FastAPI application.

### ⚡ Deploy on [![Railway](https://img.shields.io/badge/Railway-005571?style=plastic&logo=railway&logoColor=white)](https://railway.app/)
1. Create a new project on [![Railway](https://img.shields.io/badge/Railway-005571?style=plastic&logo=railway&logoColor=white)](https://railway.app/).  
2. Upload your backend folder and connect it to Railway GitHub integration.  
3. Set environment variables in Railway settings.  
4. Deploy 🚀

### ⚡ Deploy on [![Render](https://img.shields.io/badge/Render-4353FF?style=plastic&logo=render&logoColor=white)](https://render.com/)  
1. Create a new project on [![Render](https://img.shields.io/badge/Render-4353FF?style=plastic&logo=render&logoColor=white)](https://render.com/).  
2. Select FastAPI and connect your GitHub repo.  
3. Add environment variables in Render settings.  
4. Click Deploy 🚀.


## 🖥 Frontend Deployment (React + Vite)
### ⚡ Deploy on   [![Vercel](https://img.shields.io/badge/Vercel-ffffff?style=plastic&logo=vercel&logoColor=black)](https://vercel.com/)
```
cd frontend
vercel deploy
```
🔹 📦 Install Vercel CLI if not already installed:
```
npm install -g vercel
```
🔹 Run `vercel login` to authenticate.
🔹 Deploy the project using `vercel deploy`.

### ⚡ Deploy on [![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=plastic&logo=netlify&logoColor=white)](https://www.netlify.com/)
```
cd frontend
netlify deploy --prod
```
🔹 📦 Install Netlify CLI:  
```
npm install -g netlify-cli
```
🔹 Authenticate using `netlify login`.  
🔹 Deploy the frontend with `netlify deploy --prod`.

---

## 🖼 Image Processing
The system leverages cutting-edge AI models:

• 🏷️ BLIP (Salesforce): Image captioning for detailed visual understanding  
• 📸 DETR (Facebook): Object detection for plant disease localization  

## 🔍 Why These Models?  
✔ BLIP: Helps understand plant characteristics and symptoms from images.  
✔ DETR: Detects affected regions on leaves, stems, or fruits with precision.  

---

## 🌱 How It Works
1️⃣ **Upload an image** of a plant showing symptoms.  
2️⃣ **AI processes the image**, detecting potential diseases.  
3️⃣ **Chat with the AI** to get detailed insights and solutions.  
4️⃣ **Receive recommendations** for treatment and prevention.  

---

## 🛠 Future Roadmap
📱 **Mobile App (React Native)** for seamless access.  
🌍 **Multi-language Support** for global users.  
📊 **AI-powered Analytics Dashboard** for plant health tracking.  
🧑‍🌾 **Integration with Agricultural Databases** for disease prediction trends.  

---

## 🤝 Real-World Use Cases  
🌾 Farmers & Agronomists: Instantly detect crop diseases and get expert advice.  
🧑‍🏫 Researchers & Students: Use AI-powered image analysis for agriculture studies.  
🏭 Agriculture Companies: Improve monitoring of large-scale plantations.  

---

## 🤝 Contributing  
We welcome contributions from the community! Feel free to:  
• Fork the repository  
• Create a pull request with your changes  
• Report issues or suggest improvements  

---

## 📜 License  
This project is licensed under the **MIT License** [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT).    

---

**🚜 Empowering Farmers with AI! 🌿**
