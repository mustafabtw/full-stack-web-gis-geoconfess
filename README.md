# GeoConfess: Web-GIS Based Spatio-Temporal Campus Social Network

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Tech Stack](https://img.shields.io/badge/Stack-FullStack-orange)

## 📌 Abstract
**GeoConfess** is a real-time, location-based Web-GIS application designed to facilitate spatial interaction within university campuses. Utilizing **Serverless Architecture** and **NoSQL** database technologies, the project enables users to share geotagged content anonymously or via authentication. The system visualizes data density using heatmaps and provides spatial filtering capabilities across major university hubs in Ankara, Istanbul, and Izmir.

This project serves as a proof-of-concept for modern **Volunteered Geographic Information (VGI)** systems, demonstrating the integration of spatial queries with real-time web technologies.

## 🚀 Key Features

### 1. Spatial Visualization & GIS Integration
* **Dynamic Mapping:** Built on **Leaflet.js**, offering interactive map manipulation.
* **Heatmap Layers:** Real-time spatial clustering and density visualization of user activities using `leaflet.heat`.
* **Radar UI:** Custom CSS animations for visualizing active campus nodes.
* **Geolocation API:** Integrated `navigator.geolocation` for precise user positioning and "Fly-to-Location" functionality.

### 2. Data Management & Backend
* **Real-time Data Stream:** Powered by **Google Firebase Firestore** for synchronous data updates across all connected clients.
* **Spatial Queries:** Data filtering based on attribute types (Love, Complaint, Confession) and spatial extents (Cities/Campuses).
* **Role-Based Access Control (RBAC):**
    * *Guest:* Read-only / Write access.
    * *User:* Read / Write / Delete own data.
    * *Admin:* Full system control and moderation capabilities.

### 3. User Experience (UX)
* **Responsive Design:** Mobile-first approach compatible with all modern viewports.
* **Dark Mode Interface:** Optimized for visual comfort and map data contrast.
* **Distance Calculation:** Automatic Haversine calculation to display distance between the user and the event content.

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | Core application logic and UI. |
| **Mapping Engine** | Leaflet.js | Open-source JavaScript library for mobile-friendly interactive maps. |
| **Backend / DB** | Firebase Firestore | NoSQL cloud database for storing geotagged JSON data. |
| **Auth** | Firebase Auth | Google OAuth 2.0 & Anonymous Login handling. |
| **Deployment** | Vercel | CI/CD pipeline and static hosting. |

## 📐 System Architecture

The application follows a **Serverless** model, eliminating the need for traditional backend maintenance.

1.  **Client Layer:** The browser executes JS to render the map and UI.
2.  **Logic Layer:** Geolocation data is captured and processed client-side.
3.  **Data Layer:** Firestore handles `onSnapshot` listeners to push changes instantly to connected clients without manual refreshing (WebSocket-like behavior).

## 📍 Study Areas (Data Coverage)
The spatial database currently includes geodetic coordinates for major campuses in:
* **Ankara:** Hacettepe (Beytepe), METU, Bilkent, Ankara University.
* **Istanbul:** ITU, Bogazici, Yildiz Technical University.
* **Izmir:** Ege University, DEU, IYTE.

## 📦 Installation & Setup

To run this project locally:

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/mustafabtw/geoconfess-final.git](https://github.com/mustafabtw/geoconfess-final.git)
    cd geoconfess-final
    ```

2.  **Configuration**
    * The project uses Firebase. Ensure you have your `firebaseConfig` object in `script.js`.

3.  **Run**
    * Since it is a static web application, you can use any local server (e.g., Live Server for VS Code) or simply open `index.html` in a browser.

## 🔮 Future Roadmap
* [ ] **Geofencing:** Restricting posting capabilities to strictly within campus boundaries using Polygon analysis.
* [ ] **Spatial Statistics:** Implementing Moran's I or Getis-Ord Gi* for analyzing sentiment clusters.
* [ ] **3D Visualization:** Migrating to Mapbox GL JS for 3D building integration.

## 👨‍💻 Author
**Mustafa Baran**
*Final Year Engineering Student*
*Department of Geomatics Engineering, Hacettepe University*

---
*Note: This project is developed for academic purposes.*
