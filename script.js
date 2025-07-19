const apiKey = "d892aa3faed8dce4c59737a7d4486b0b";
const getWeatherBtn = document.getElementById("getWeatherBtn");
const cityInput = document.getElementById("cityInput");
const weatherBox = document.getElementById("currentWeather");
const rainVideo = document.getElementById("rainVideo");
const sunnyVideo = document.getElementById("sunnyVideo");
const cloudyVideo = document.getElementById("cloudyVideo");
const clearImg = document.getElementById("clearImg");
const forecastDiv = document.getElementById("forecast");
const topCities = document.getElementById("topCities");

const defaultCities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"];

function isDaytime(dt, timezoneOffset) {
  const localTime = new Date((dt + timezoneOffset) * 1000);
  const hour = localTime.getUTCHours();
  return hour >= 6 && hour < 18;
}

function showBackground(desc) {
  rainVideo.style.display = "none";
  sunnyVideo.style.display = "none";
  cloudyVideo.style.display = "none";
  clearImg.style.display = "none";

  if (desc.includes("rain")) rainVideo.style.display = "block";
  else if (desc.includes("cloud")) cloudyVideo.style.display = "block";
  else if (desc.includes("clear")) clearImg.style.display = "block";
  else if (desc.includes("sun")) sunnyVideo.style.display = "block";
  else cloudyVideo.style.display = "block";
}

async function getWeather(city, cardContainer = null) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await res.json();
    if (data.cod !== 200) throw new Error("City not found");

    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description.toLowerCase();
    const humidity = data.main.humidity;
    const wind = data.wind.speed;

    if (!cardContainer) {
      document.getElementById("locationTitle").textContent = `Weather in ${data.name}`;
      document.getElementById("temp").textContent = temp;
      document.getElementById("desc").textContent = desc;
      document.getElementById("humidity").textContent = humidity;
      document.getElementById("wind").textContent = wind;
      showBackground(desc);
      weatherBox.style.display = "block";
      topCities.style.display = "none";
    } else {
      const videoSrc = getVideoForDesc(desc);
      const isImage = videoSrc.endsWith(".png");

      cardContainer.innerHTML = `
        ${
          isImage
            ? `<img class="city-video" src="${videoSrc}" alt="bg" />`
            : `<video class="city-video" autoplay muted loop>
                 <source src="${videoSrc}" type="video/mp4">
               </video>`
        }
        <div class="city-info">
          <h3>${data.name}</h3>
          <p>${desc}</p>
          <p>${temp}°C</p>
          <p>💧${humidity}-💨${wind}</p>
        </div>
      `;
      cardContainer.className = "city-card";
    }
  } catch (e) {
    if (!cardContainer) alert("City not found or network error");
  }
}

function getVideoForDesc(desc) {
  if (desc.includes("rain")) return "Animated_Raining_with_Lightings.mp4";
  if (desc.includes("cloud")) return "clouds.mp4";
  if (desc.includes("clear")) return "clear.png";
  if (desc.includes("sun")) return "sunny.mp4";
  return "sunny.mp4";
}

async function showForecast(city) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
  );
  const data = await res.json();
  forecastDiv.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const f = data.list[i * 8];
    const day = new Date(f.dt * 1000).toLocaleDateString("en-US", { weekday: "long" });
    const t = Math.round(f.main.temp);
    const d = f.weather[0].description.toLowerCase();
    const h = f.main.humidity;
    const w = f.wind.speed;
    const videoSrc = getVideoForDesc(d);
    const isImage = videoSrc.endsWith(".png");

    forecastDiv.innerHTML += `
      <div class="day">
        ${
          isImage
            ? `<img class="forecast-bg" src="${videoSrc}" alt="bg" />`
            : `<video class="forecast-bg" autoplay muted loop>
                 <source src="${videoSrc}" type="video/mp4">
               </video>`
        }
        <div class="forecast-content">
          <strong>Day: ${day}</strong><br>
          Temperature: ${t}°C<br>
          <small>${d}</small><br>
          💧Humidity ${h}%<br>
          🌬️Wind ${w} m/s
        </div>
      </div>
    `;
  }
}

getWeatherBtn.onclick = async () => {
  const city = cityInput.value.trim();
  if (!city) return alert("Please enter a location");
  await getWeather(city);
  await showForecast(city);
};

window.onload = () => {
  defaultCities.forEach(city => {
    const div = document.createElement("div");
    div.className = "city-card";
    topCities.appendChild(div);
    getWeather(city, div);
  });
};