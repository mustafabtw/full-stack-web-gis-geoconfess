// --- 1. FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAFZhTKsbDsshbKilFX1mUg09RcFOJdXoY",
  authDomain: "geoconfess-5d92a.firebaseapp.com",
  projectId: "geoconfess-5d92a",
  storageBucket: "geoconfess-5d92a.firebasestorage.app",
  messagingSenderId: "725930430037",
  appId: "1:725930430037:web:9a4314228a3c80f7120edc",
  measurementId: "G-671JQBJHKS"
};

// --- YÖNETİCİ AYARI ---
const ADMIN_EMAIL = "halimveselma@gmail.com";

// Firebase Başlatma
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); 
}

const db = firebase.firestore();
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// --- VERİ VE AYARLAR ---
const CITIES = {
    ankara: { name: "Ankara", coords: [39.925, 32.835], zoom: 12 },
    istanbul: { name: "İstanbul", coords: [41.045, 29.010], zoom: 11 },
    izmir: { name: "İzmir", coords: [38.423, 27.142], zoom: 12 }
};

const UNIVERSITIES = [
    // --- ANKARA ---
    // GÜNCELLENDİ: Hacettepe Rektörlük Binası Koordinatları
    { id: 1, name: "Hacettepe (Beytepe)", city: "ankara", lat: 39.8676, lng: 32.7346 },
    { id: 2, name: "ODTÜ", city: "ankara", lat: 39.891, lng: 32.776 },
    { id: 3, name: "Bilkent", city: "ankara", lat: 39.869, lng: 32.749 },
    { id: 4, name: "Ankara Üni (Tandoğan)", city: "ankara", lat: 39.935, lng: 32.831 },
    { id: 5, name: "Gazi Üniversitesi", city: "ankara", lat: 39.936, lng: 32.823 },
    { id: 6, name: "Başkent Üniversitesi", city: "ankara", lat: 39.888, lng: 32.651 },
    { id: 7, name: "TOBB ETÜ", city: "ankara", lat: 39.921, lng: 32.798 },
    { id: 8, name: "AYBÜ (Etlik)", city: "ankara", lat: 39.972, lng: 32.839 },
    
    // --- İSTANBUL ---
    { id: 10, name: "İTÜ (Ayazağa)", city: "istanbul", lat: 41.106, lng: 29.024 },
    { id: 11, name: "Boğaziçi (Güney)", city: "istanbul", lat: 41.083, lng: 29.050 },
    { id: 12, name: "Yıldız Teknik (Davutpaşa)", city: "istanbul", lat: 41.026, lng: 28.889 },
    { id: 13, name: "İstanbul Üni (Beyazıt)", city: "istanbul", lat: 41.011, lng: 28.963 },
    { id: 14, name: "Marmara (Göztepe)", city: "istanbul", lat: 40.988, lng: 29.052 },
    { id: 15, name: "Koç Üniversitesi", city: "istanbul", lat: 41.205, lng: 29.072 },
    { id: 16, name: "Sabancı Üniversitesi", city: "istanbul", lat: 40.891, lng: 29.378 },
    { id: 17, name: "Yeditepe Üniversitesi", city: "istanbul", lat: 40.970, lng: 29.151 },
    { id: 18, name: "Galatasaray Üni", city: "istanbul", lat: 41.047, lng: 29.022 },
    
    // --- İZMİR ---
    { id: 20, name: "Ege Üniversitesi", city: "izmir", lat: 38.455, lng: 27.226 },
    { id: 21, name: "Dokuz Eylül (Tınaztepe)", city: "izmir", lat: 38.370, lng: 27.202 },
    { id: 22, name: "İYTE (Urla)", city: "izmir", lat: 38.323, lng: 26.634 },
    { id: 23, name: "İzmir Ekonomi", city: "izmir", lat: 38.389, lng: 27.058 },
    { id: 24, name: "Yaşar Üniversitesi", city: "izmir", lat: 38.454, lng: 27.200 },
    { id: 25, name: "Katip Çelebi", city: "izmir", lat: 38.495, lng: 27.027 }
];

// --- STATE ---
let map;
let heatLayer = null;
let currentUser = null;
let currentCityKey = null;
let activeFilter = 'all';
let isHeatmapActive = false;
let layers = [];
let tempMarker = null;
let tempCoords = null;
let unsubscribe = null; 

// --- BAŞLATMA ---
document.addEventListener('DOMContentLoaded', () => {
    map = L.map('map', { zoomControl: false, minZoom: 6 }).setView([39.0, 35.5], 6);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: 'GeoConfess'
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.on('click', (e) => {
        // Şehir seçiliyse veya GPS modundaysak tıklamaya izin verelim
        if(currentCityKey || document.getElementById('back-btn-area').classList.contains('hidden') === false) {
             handleMapClick(e.latlng);
        }
    });

    // Oturum Durumunu Dinle
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            document.getElementById('auth-modal').classList.add('hidden');
            document.getElementById('main-app').classList.add('active-app');
            
            const name = user.displayName || "Misafir Ajan";
            const photo = user.photoURL;
            
            // ADMIN KONTROLÜ
            if(user.email === ADMIN_EMAIL) {
                document.getElementById('u-name').innerHTML = `${name} <b style="color:#ff4757">(Yönetici)</b>`;
            } else {
                document.getElementById('u-name').innerText = name;
            }

            if (photo) {
                document.getElementById('u-avatar').src = photo;
                document.getElementById('u-avatar').classList.remove('hidden');
                document.getElementById('u-icon').classList.add('hidden');
            } else {
                document.getElementById('u-avatar').classList.add('hidden');
                document.getElementById('u-icon').classList.remove('hidden');
            }
            
            resetToTurkey();
        } else {
            document.getElementById('auth-modal').classList.remove('hidden');
            document.getElementById('main-app').classList.remove('active-app');
        }
    });
});

// --- AUTH METODLARI ---
function loginWithGoogle() {
    auth.signInWithPopup(googleProvider).catch((error) => {
        alert("Giriş hatası: " + error.message);
    });
}

function loginAnonymously() {
    auth.signInAnonymously().catch((error) => {
        alert("Misafir girişi hatası: " + error.message);
    });
}

function logout() {
    auth.signOut().then(() => {
        location.reload();
    });
}

// --- HARİTA VE NAVİGASYON ---
function resetToTurkey() {
    currentCityKey = null;
    clearMap();
    
    // Akışı başlat (Filtre güncellemeli)
    subscribeToAll();

    document.getElementById('back-btn-area').classList.add('hidden');
    
    // Başlığı filtreye göre güncelle
    let filterText = activeFilter === 'all' ? '' : (activeFilter === 'ask' ? '(Aşk)' : (activeFilter === 'sikayet' ? '(Şikayet)' : '(İtiraf)'));
    document.getElementById('feed-title').innerText = `🔥 Türkiye Geneli ${filterText}`;
    
    map.flyTo([39.0, 35.5], 6, { duration: 1.5 });

    Object.keys(CITIES).forEach(key => {
        const city = CITIES[key];
        
        // --- RADAR İKONU ---
        const radarIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div class="radar-container">
                    <div class="radar-dot"></div>
                    <div class="radar-ring"></div>
                    <div class="radar-ring"></div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20] 
        });

        const marker = L.marker(city.coords, { icon: radarIcon }).addTo(map);
        
        marker.bindTooltip(city.name, { 
            permanent: true, 
            direction: 'bottom', 
            offset: [0, 10],
            className: 'city-label' 
        });

        marker.on('click', (e) => { 
            L.DomEvent.stopPropagation(e); 
            enterCity(key); 
        });
        
        layers.push(marker);
    });
}

function enterCity(key) {
    currentCityKey = key;
    clearMap();
    const city = CITIES[key];
    
    document.getElementById('back-btn-area').classList.remove('hidden');
    document.getElementById('feed-title').innerText = `${city.name} Kampüsleri`;
    map.flyTo(city.coords, city.zoom, { duration: 1.5 });

    UNIVERSITIES.filter(u => u.city === key).forEach(uni => {
        const icon = L.divIcon({ className: 'custom-div-icon', html: `<div class="uni-marker"><i class="fa-solid fa-graduation-cap"></i></div>`, iconSize: [40, 40] });
        const marker = L.marker([uni.lat, uni.lng], { icon: icon }).addTo(map);
        marker.bindTooltip(uni.name, { permanent: true, direction: 'top', offset: [0, -20] });
        marker.on('click', (e) => { 
            L.DomEvent.stopPropagation(e); 
            map.flyTo([uni.lat, uni.lng], 15); 
            handleMapClick(e.latlng); 
        });
        layers.push(marker);
    });

    subscribeToCity(key);
}

// --- GPS FONKSİYONU ---
function locateUser() {
    if (!navigator.geolocation) {
        alert("Tarayıcınız konum özelliğini desteklemiyor.");
        return;
    }
    alert("Konumun alınıyor, lütfen izin ver...");

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Haritayı odakla
            map.flyTo([lat, lng], 15, { duration: 2 });
            
            // Mavi nokta koy
            L.circle([lat, lng], {
                color: '#3388ff', fillColor: '#3388ff', fillOpacity: 0.5, radius: 50
            }).addTo(map).bindPopup("Sen Buradasın!").openPopup();

            // Geri dön butonunu aç
            document.getElementById('back-btn-area').classList.remove('hidden');
            document.getElementById('feed-title').innerText = "📍 Sizin Konumunuz";
        },
        (error) => { alert("Konum alınamadı: " + error.message); }
    );
}

// --- AKIŞ ---
function subscribeToAll() {
    const list = document.getElementById('feed-list');
    list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-satellite-dish fa-spin"></i> Türkiye geneli taranıyor...</div>';
    
    if(unsubscribe) unsubscribe();

    let query = db.collection('confessions').orderBy('createdAt', 'desc').limit(30);

    unsubscribe = query.onSnapshot((snapshot) => {
        list.innerHTML = "";
        const data = [];
        snapshot.forEach((doc) => {
            const item = doc.data();
            item.id = doc.id;
            
            if (activeFilter !== 'all' && item.cat !== activeFilter) return;

            data.push(item);
            renderCard(item);
        });
        
        if (data.length === 0) list.innerHTML = '<div class="empty-state">Bu kategoride henüz ses yok...</div>';
    });
}

function subscribeToCity(cityKey) {
    const list = document.getElementById('feed-list');
    list.innerHTML = '<div class="empty-state">Veriler yükleniyor...</div>';
    
    if(unsubscribe) unsubscribe();

    let query = db.collection('confessions').where('city', '==', cityKey).orderBy('createdAt', 'desc');

    unsubscribe = query.onSnapshot((snapshot) => {
        list.innerHTML = "";
        const data = [];

        snapshot.forEach((doc) => {
            const item = doc.data();
            item.id = doc.id;
            
            if (activeFilter !== 'all' && item.cat !== activeFilter) return;

            data.push(item);
            renderCard(item);
            addMapMarker(item);
        });

        if (data.length === 0) list.innerHTML = '<div class="empty-state">Henüz veri yok. İlk sen yaz!</div>';
        if(isHeatmapActive) updateHeatmap(data);
    });
}

function renderCard(item) {
    const list = document.getElementById('feed-list');
    const uni = UNIVERSITIES.find(u => u.name === item.uniName);
    
    let distStr = "";
    if(uni) {
        const dist = getDistanceFromLatLonInKm(item.lat, item.lng, uni.lat, uni.lng);
        distStr = `<span class="dist-badge">${dist.toFixed(2)} km</span>`;
    }

    let hotBadge = "";
    if (item.likes >= 5) {
        hotBadge = `<span style="color:#ff6b6b; margin-right:5px;" title="Popüler!"><i class="fa-solid fa-fire"></i></span>`;
    }

    let deleteBtnHTML = "";
    const isOwner = currentUser && currentUser.uid === item.userId;
    const isAdmin = currentUser && currentUser.email === ADMIN_EMAIL;

    if (isOwner || isAdmin) {
        deleteBtnHTML = `
            <button class="delete-btn" onclick="deleteConfession('${item.id}', event)" title="Bu itirafı sil">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
    }

    const div = document.createElement('div');
    div.className = `card ${item.cat}`;
    div.innerHTML = `
        ${deleteBtnHTML}
        <div class="card-header">
            <span>${hotBadge}<span class="uni-tag">${item.uniName}</span></span>
            <span>${timeAgo(item.createdAt)}</span>
        </div>
        <div class="location-detail">
            <i class="fa-solid fa-location-dot"></i> ${item.detail}
        </div>
        <div class="card-text">${item.text}</div>
        <div class="card-footer">
            <div><i class="fa-solid fa-user"></i> ${item.userName}</div>
            ${distStr}
            <button class="like-btn" onclick="toggleLike('${item.id}', event)">
                <i class="fa-solid fa-heart"></i> ${item.likes || 0}
            </button>
        </div>`;
    
    div.onclick = () => {
        if(!currentCityKey) {
            if(tempMarker) map.removeLayer(tempMarker);
            let color = item.cat === 'ask' ? '#ff4757' : (item.cat === 'sikayet' ? '#ffa502' : '#a29bfe');
            const icon = L.divIcon({ 
                className: 'custom-div-icon', 
                html: `<div class="confess-pin" style="background:${color}"><i class="fa-solid fa-comment"></i></div>`, 
                iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -35] 
            });
            tempMarker = L.marker([item.lat, item.lng], {icon: icon}).addTo(map);
            tempMarker.bindPopup(`<div style="text-align:center"><b style="color:${color}">${item.detail}</b><br>${item.text}</div>`).openPopup();
        }
        
        map.flyTo([item.lat, item.lng], 18);
    };
    
    list.appendChild(div);
}

function addMapMarker(item) {
    let color = item.cat === 'ask' ? '#ff4757' : (item.cat === 'sikayet' ? '#ffa502' : '#a29bfe');
    const icon = L.divIcon({ 
        className: 'custom-div-icon', 
        html: `<div class="confess-pin" style="background:${color}"><i class="fa-solid fa-comment"></i></div>`, 
        iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -35] 
    });
    
    const m = L.marker([item.lat, item.lng], { icon: icon }).addTo(map);
    m.bindPopup(`<div style="text-align:center"><b style="color:${color}">${item.detail}</b><br>${item.text}<br><small>${item.userName}</small></div>`);
    layers.push(m);
}

function handleMapClick(latlng) {
    if(tempMarker) map.removeLayer(tempMarker);
    tempCoords = latlng;
    const nearest = findNearestUni(latlng.lat, latlng.lng);
    tempMarker = L.marker(latlng).addTo(map);
    document.getElementById('confess-modal').classList.remove('hidden');
    document.getElementById('target-uni-name').innerText = nearest.name;
    document.getElementById('coords-text').innerText = `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
}

function submitConfession() {
    const text = document.getElementById('confess-text').value;
    const detail = document.getElementById('location-detail').value;
    const cat = document.querySelector('input[name="cat"]:checked').value;

    if(!text) return alert("Boş bırakma!");

    const nearest = findNearestUni(tempCoords.lat, tempCoords.lng);
    
    db.collection("confessions").add({
        text: text,
        detail: detail || "Kampüs Çevresi",
        cat: cat,
        lat: tempCoords.lat,
        lng: tempCoords.lng,
        city: currentCityKey,
        uniName: nearest.name,
        userName: currentUser.displayName || "Misafir",
        userId: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        likes: 0
    })
    .then(() => { closeModal(); })
    .catch((error) => { alert("Gönderilemedi: " + error.message); });
}

function deleteConfession(docId, event) {
    event.stopPropagation();
    if(confirm("Bu itirafı kalıcı olarak silmek istiyor musun?")) {
        db.collection("confessions").doc(docId).delete()
        .then(() => { console.log("Silindi!"); })
        .catch((error) => { alert("Hata: " + error.message); });
    }
}

function toggleLike(docId, event) {
    event.stopPropagation(); 
    const docRef = db.collection("confessions").doc(docId);
    docRef.update({ likes: firebase.firestore.FieldValue.increment(1) });
}

// --- FİLTRELEME BUTONU ---
function toggleFilter(f) { 
    activeFilter = f; 
    
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); 
    document.getElementById(`btn-${f}`).classList.add('active'); 
    
    // Hangi moddaysak onu yenile
    if(currentCityKey) {
        subscribeToCity(currentCityKey);
    } else {
        subscribeToAll(); // Türkiye genelindeyken de listeyi yenile
        
        // Başlığı güncelle
        let filterText = activeFilter === 'all' ? '' : (activeFilter === 'ask' ? '(Aşk)' : (activeFilter === 'sikayet' ? '(Şikayet)' : '(İtiraf)'));
        document.getElementById('feed-title').innerText = `🔥 Türkiye Geneli ${filterText}`;
    }
}

function toggleHeatmap() { 
    isHeatmapActive = document.getElementById('heatmap-check').checked;
    if(currentCityKey) subscribeToCity(currentCityKey); 
}
function updateHeatmap(data) {
    if(heatLayer) map.removeLayer(heatLayer);
    const pts = data.map(d => [d.lat, d.lng, 1]);
    heatLayer = L.heatLayer(pts, { radius: 25, blur: 15, maxZoom: 14 }).addTo(map);
}
function timeAgo(timestamp) {
    if(!timestamp) return "Az önce";
    const date = timestamp.toDate();
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "Az önce";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + " dk önce";
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + " saat önce";
    return Math.floor(hours / 24) + " gün önce";
}
function findNearestUni(lat, lng) {
    let n = null, min = Infinity;
    UNIVERSITIES.filter(u => u.city === currentCityKey).forEach(u => {
        const d = Math.sqrt((u.lat-lat)**2 + (u.lng-lng)**2);
        if(d < min) { min = d; n = u; }
    });
    return n || { name: "Bilinmiyor" };
}
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; var dLat = (lat2-lat1)*(Math.PI/180); var dLon = (lon2-lon1)*(Math.PI/180);
    var a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*(Math.PI/180))*Math.cos(lat2*(Math.PI/180))*Math.sin(dLon/2)*Math.sin(dLon/2);
    var c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return R*c;
}
function clearMap() { layers.forEach(l => map.removeLayer(l)); layers = []; if(heatLayer) { map.removeLayer(heatLayer); heatLayer = null; } }
function closeModal() { document.getElementById('confess-modal').classList.add('hidden'); if(tempMarker) map.removeLayer(tempMarker); document.getElementById('confess-text').value = ''; document.getElementById('location-detail').value = ''; }