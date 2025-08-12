// यह आपकी API Key है जो आपके Google Cloud Console से मिली है।
const API_KEY = "AIzaSyCEyTs3Uerqo4av8KZGPTUCWfx_T5Er0vI";

// यह आपके YouTube चैनल का ID है।
const CHANNEL_ID = "UCeLzE4Wj1u9fK9kP5jK2hQw";

const videoListElement = document.getElementById('video-list');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const loadingText = document.getElementById('loading-text');
const loadMoreButton = document.getElementById('loadMoreButton');
const videoModal = document.getElementById('videoModal');
const closeButton = document.getElementsByClassName('close-button')[0];
const videoPlayer = document.getElementById('videoPlayer');

let nextPageToken = '';
let currentQuery = '';

// वीडियो दिखाने का फंक्शन
function renderVideos(items) {
    items.forEach(item => {
        if (item.id.videoId) {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            
            const thumbnail = document.createElement('img');
            thumbnail.src = item.snippet.thumbnails.high.url;
            thumbnail.alt = item.snippet.title;
            
            const title = document.createElement('h3');
            title.textContent = item.snippet.title;
            
            videoItem.appendChild(thumbnail);
            videoItem.appendChild(title);
            
            videoItem.addEventListener('click', () => {
                videoPlayer.src = `https://www.youtube.com/embed/${item.id.videoId}`;
                videoModal.style.display = "block";
            });
            
            videoListElement.appendChild(videoItem);
        }
    });
}

// मोडल को बंद करने का फंक्शन
closeButton.onclick = function() {
  videoModal.style.display = "none";
  videoPlayer.src = ""; // वीडियो को रोकना
}

window.onclick = function(event) {
  if (event.target == videoModal) {
    videoModal.style.display = "none";
    videoPlayer.src = "";
  }
}

// पेज को दिखाने और छुपाने का फंक्शन
function showPage(pageId) {
    const pages = document.querySelectorAll('main');
    pages.forEach(page => {
        page.classList.add('hidden');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
}

// आपके चैनल के वीडियो लोड करने का फंक्शन
async function fetchMyChannelVideos() {
    loadingText.style.display = 'block';
    videoListElement.innerHTML = ''; // होमपेज लोड होने पर वीडियो लिस्ट साफ़ करें
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=6`);
        const data = await response.json();
        
        loadingText.style.display = 'none';
        renderVideos(data.items);
        
        // इसके बाद डिफ़ॉल्ट हॉरर वीडियो लोड करें
        fetchHorrorVideos("horror stories");
    } catch (error) {
        console.error("मेरे चैनल के वीडियो लाने में एरर:", error);
        loadingText.style.display = 'none';
        videoListElement.innerHTML = "<p>वीडियो लोड नहीं हो पाए। कृपया बाद में कोशिश करें।</p>";
    }
}

// हॉरर वीडियो लोड करने का फंक्शन (सर्च और 'और लोड करें' के लिए)
async function fetchHorrorVideos(query, pageToken = '') {
    loadingText.style.display = 'block';
    loadMoreButton.style.display = 'none';
    currentQuery = query;

    try {
        let url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=${encodeURIComponent(query)}&part=snippet&type=video&videoEmbeddable=true&maxResults=10`;
        if (pageToken) {
            url += `&pageToken=${pageToken}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        loadingText.style.display = 'none';
        renderVideos(data.items);
        
        if (data.nextPageToken) {
            nextPageToken = data.nextPageToken;
            loadMoreButton.style.display = 'block';
        } else {
            loadMoreButton.style.display = 'none';
        }

    } catch (error) {
        console.error("वीडियो लाने में एरर:", error);
        loadingText.style.display = 'none';
        videoListElement.innerHTML = "<p>वीडियो लोड नहीं हो पाए। कृपया बाद में कोशिश करें।</p>";
    }
}

// सर्च बटन पर क्लिक करने पर
searchButton.addEventListener('click', () => {
    const query = searchInput.value || "horror stories";
    videoListElement.innerHTML = '';
    fetchHorrorVideos(query);
});

// 'और लोड करें' बटन पर क्लिक करने पर
loadMoreButton.addEventListener('click', () => {
    fetchHorrorVideos(currentQuery, nextPageToken);
});

// वेबसाइट लोड होते ही आपके चैनल के वीडियो दिखाएँ और होमपेज को डिफ़ॉल्ट रूप से दिखाएँ
document.addEventListener('DOMContentLoaded', () => {
    fetchMyChannelVideos();
    showPage('homepage');
});
