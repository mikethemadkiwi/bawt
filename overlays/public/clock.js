const HEIGHT = 50;
let FORMAT = 24;

const wrapper = document.querySelector(".wrapper");
const formatEl = document.querySelector(".clock .format");
const formats = document.querySelectorAll(".clock .format > span");
const toggleFormatBtn = document.querySelector("#toggle-format");
const themeSelectEl = document.querySelector("#theme-select");
const digits = [...document.querySelectorAll(".clock .digit")];

const numbersCache = digits.map((d) => [...d.querySelectorAll(":scope > span")]);
let prevTime = null;

function startTime() {
  const today = new Date();
  let h = today.getHours();

  const newTime = [
    Math.floor(h / 10),
    h % 10,
    Math.floor(today.getMinutes() / 10),
    today.getMinutes() % 10,
    Math.floor(today.getSeconds() / 10),
    today.getSeconds() % 10
  ];

  newTime.forEach((d, i) => {
    if (!prevTime || prevTime[i] !== d) {
      digits[i].style.transform = `translatey(-${HEIGHT * d + 1}px)`;

      if (prevTime) {
        numbersCache[i][prevTime[i]].classList.remove("active");
      }

      numbersCache[i][d].classList.add("active");
    }
  });

  prevTime = newTime;
}

function setFormat(newFormat) {
  FORMAT = parseInt(newFormat);
  document.documentElement.dataset.format = newFormat;
//   toggleFormatBtn.innerText = FORMAT === 12 ? 'Switch to 24-hour' : 'Switch to 12-hour';
  localStorage.setItem("format", newFormat);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
//   themeSelectEl.value = theme;
  localStorage.setItem("theme", theme);
}

(function main() {
  const savedFormat = localStorage.getItem("format") || "24";
  const savedTheme = localStorage.getItem("theme") || "default";
  setFormat(savedFormat);
  setTheme(savedTheme);
  startTime();
  setInterval(startTime, 1000);
})();
