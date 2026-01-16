/***********************
 * CONFIG
 ***********************/
const API_BASE = "http://localhost:8000";
const userID = localStorage.getItem("userID") || "6968faf10ac167df95f56cb5";

/***********************
 * ELEMENTS
 ***********************/
const calendar = document.querySelector(".calendar");
const monthYear = document.getElementById("monthYear");
const todayMoodDisplay = document.getElementById("todayMoodDisplay");

/***********************
 * DATE SETUP
 ***********************/
const today = new Date();
today.setHours(0, 0, 0, 0);

let currentYear = today.getFullYear();
let currentMonth = today.getMonth();
let selectedDay = today.getDate();

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

/***********************
 * GENERATE CALENDAR
 ***********************/
function generateCalendar(year, month) {
  monthYear.innerText = `${monthNames[month]} ${year}`;

  document.querySelectorAll(".day, .empty").forEach(e => e.remove());

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // empty slots
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "empty";
    calendar.appendChild(empty);
  }

  // days
  for (let day = 1; day <= totalDays; day++) {
    const div = document.createElement("div");
    div.className = "day";
    div.dataset.day = day;

    const dateObj = new Date(year, month, day);
    dateObj.setHours(0,0,0,0);

    // today highlight
    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      div.classList.add("today");
    }

    // future dates disabled
    if (dateObj > today) {
      div.classList.add("disabled");
    } else {
      div.onclick = () => selectedDay = day;
    }

    calendar.appendChild(div);
  }

  loadMoods(year, month);
}

/***********************
 * SELECT MOOD (EMOJI)
 ***********************/
function selectMood(emoji) {
  const selectedDate = new Date(currentYear, currentMonth, selectedDay);
  selectedDate.setHours(0,0,0,0);

  if (selectedDate > today) {
    alert("Future date ka mood add nahi ho sakta ❌");
    return;
  }

  todayMoodDisplay.innerText = emoji;

  fetch(`${API_BASE}/save-mood`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userID,
      detectedEmotion: emoji,
      dateTime: selectedDate
    })
  }).then(() => {
    loadMoods(currentYear, currentMonth);
  });
}

/***********************
 * LOAD MOODS FROM DB
 ***********************/
/***********************
 * LOAD MOODS FROM DB
 ***********************/
function loadMoods(year, month) {
    fetch(`${API_BASE}/moods/${userID}`)
      .then(res => res.json())
      .then(data => {
        const days = document.querySelectorAll(".day");
  
        todayMoodDisplay.innerText = "No mood logged yet";
  
        data.forEach(mood => {
          const d = new Date(mood.dateTime);
          d.setHours(0, 0, 0, 0);
  
          // ❌ TEXT moods ko ignore karo
          if (typeof mood.detectedEmotion === "string" && mood.detectedEmotion.length > 2) {
            // allow only emoji (😊 😐 😔 😡 😴)
            const isEmoji = /[\p{Emoji}]/u.test(mood.detectedEmotion);
            if (!isEmoji) return;
          }
  
          // 📅 Calendar emoji
          if (d.getFullYear() === year && d.getMonth() === month) {
            days.forEach(dayDiv => {
              if (
                parseInt(dayDiv.dataset.day) === d.getDate() &&
                !dayDiv.querySelector(".emoji")
              ) {
                const emojiSpan = document.createElement("span");
                emojiSpan.className = "emoji";
                emojiSpan.innerText = mood.detectedEmotion;
                dayDiv.appendChild(emojiSpan);
              }
            });
          }
  
          // 📦 Today's Mood box
          if (d.getTime() === today.getTime()) {
            todayMoodDisplay.innerText = mood.detectedEmotion;
          }
        });
      })
      .catch(err => console.error(err));
  }
  
/***********************
 * NAVIGATION
 ***********************/
function goFeedback() {
  window.location.href = "feedback.html";
}
function facialEmotion() {
    alert("Facial Emotion feature will be added soon 😊");
  }
  
  function voiceEmotion() {
    alert("Voice Emotion feature will be added soon 🎤");
  }
  
  function startChat() {
    alert("AI Chatbot feature will be added soon 🤖");
  }
  

/***********************
 * INIT
 ***********************/
generateCalendar(currentYear, currentMonth);
function logout() {
    localStorage.clear();        // user session clear
    window.location.href = "index.html"; // ya index.html / home page
  }
  