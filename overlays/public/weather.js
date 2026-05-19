//
const sunny = document.getElementById('sunny')
const cloudy = document.getElementById('cloudy')
const fewclouds = document.getElementById('fewclouds')
const drizzle = document.getElementById('drizzle')
const rainy = document.getElementById('rainy')
const thunderstorm = document.getElementById('thunderstorm')
const flurries = document.getElementById('flurries')
const atmo = document.getElementById('atmo')
//
const weathertext = document.getElementById('weathertext')
//
function weathersetup(){
    const api = "3b2313c21d058b5423b423220a87c332";
    const wCityId = 6058560;
    const wDegreeKey = "metric";
    const base = `http://api.openweathermap.org/data/2.5/weather?id=${wCityId}&units=${wDegreeKey}&APPID=${api}`;
    //
    fetch(base).then((response) => {
        return response.json();
    }).then((data) => {
        let weathermsg = data.weather[0].description
        let weathertemp = `<p style="font-weight: 70; font-size: 1.25em; text-transform: uppercase; color: #e6d8ad;">${data.main.temp}°c</p>`
        if (data.main.temp<0){
            weathertemp = `<p style="font-weight: 70; font-size: 1.25em; text-transform: uppercase; color: #add8e6;">${data.main.temp}°c</p>`
        }
        // clear previous
        weathertext.innerHTML = ``;
        weathertext.style.display = 'none';
        sunny.style.display = 'none';
        cloudy.style.display = 'none';
        fewclouds.style.display = 'none';
        drizzle.style.display = 'none';
        rainy.style.display = 'none';
        thunderstorm.style.display = 'none';
        flurries.style.display = 'none';
        atmo.style.display = 'none';
        //
        switch (data.weather[0].id) {                        
            case 200: // Thunder Storms
                thunderstorm.style.display = 'inline-block'
                break;
            case 201:
                thunderstorm.style.display = 'inline-block'
                break;
            case 202:
                thunderstorm.style.display = 'inline-block'
                break;
            case 210:
                thunderstorm.style.display = 'inline-block'
                break;
            case 211:
                thunderstorm.style.display = 'inline-block'
                break;
            case 212:
                thunderstorm.style.display = 'inline-block'
                break;
            case 221:
                thunderstorm.style.display = 'inline-block'
                break;
            case 230:
                thunderstorm.style.display = 'inline-block'
                break;
            case 231:
                thunderstorm.style.display = 'inline-block'
                break;
            case 232:
                thunderstorm.style.display = 'inline-block'
                break;
            case 300: // Drizzle
                drizzle.style.display = 'inline-block'
                break;
            case 301:
                drizzle.style.display = 'inline-block'
                break;
            case 302:
                drizzle.style.display = 'inline-block'
                break;
            case 310:
                drizzle.style.display = 'inline-block'
                break;
            case 311:
                drizzle.style.display = 'inline-block'
                break;
            case 312:
                drizzle.style.display = 'inline-block'
                break;
            case 313:
                drizzle.style.display = 'inline-block'
                break;
            case 314:
                drizzle.style.display = 'inline-block'
                break;
            case 321:
                drizzle.style.display = 'inline-block'
                break;
            case 500: // Rain
                rainy.style.display = 'inline-block'
                break;
            case 501:
                rainy.style.display = 'inline-block'
                break;
            case 502:
                rainy.style.display = 'inline-block'
                break;
            case 503:
                rainy.style.display = 'inline-block'
                break;
            case 504:
                rainy.style.display = 'inline-block'
                break;
            case 511:
                rainy.style.display = 'inline-block'
                break;
            case 520:
                rainy.style.display = 'inline-block'
                break;
            case 521:
                rainy.style.display = 'inline-block'
                break;
            case 522:
                rainy.style.display = 'inline-block'
                break;
            case 531:
                rainy.style.display = 'inline-block'
                break;
            case 600: // Snow
                flurries.style.display = 'inline-block'
                break;
            case 601:
                flurries.style.display = 'inline-block'
                break;
            case 602:
                flurries.style.display = 'inline-block'
                break;
            case 611:
                flurries.style.display = 'inline-block'
                break;
            case 612:
                flurries.style.display = 'inline-block'
                break;
            case 615:
                flurries.style.display = 'inline-block'
                break;
            case 616:
                flurries.style.display = 'inline-block'
                break;
            case 620:
                flurries.style.display = 'inline-block'
                break;
            case 621:
                flurries.style.display = 'inline-block'
                break;
            case 622:
                flurries.style.display = 'inline-block'
                break;
            case 701: // Atmospheric 
                atmo.style.display = 'inline-block'
                break;
            case 711:
                atmo.style.display = 'inline-block'
                break;
            case 721:
                atmo.style.display = 'inline-block'
                break;
            case 731:
                atmo.style.display = 'inline-block'
                break;
            case 741:
                atmo.style.display = 'inline-block'
                break;
            case 751:
                atmo.style.display = 'inline-block'
                break;
            case 761:
                atmo.style.display = 'inline-block'
                break;
            case 762:
                atmo.style.display = 'inline-block'
                break;
            case 771:
                atmo.style.display = 'inline-block'
                break;
            case 781:
                atmo.style.display = 'inline-block'
                break;
            case 800: // Clear / Cloudy
                sunny.style.display = 'inline-block'
                break;
            case 801:
                fewclouds.style.display = 'inline-block'
                break;
            case 802:
                fewclouds.style.display = 'inline-block'
                break;
            case 803:
                cloudy.style.display = 'inline-block'
                break;
            case 804:
                cloudy.style.display = 'inline-block'
                break;
            default:
                break;
        }
        weathertext.innerHTML = `<h1>${weathermsg}\n${weathertemp}</h1>`;
        weathertext.style.display = 'inline-block';
    });
}
window.addEventListener("load", () => {
    weathersetup()
    setInterval(() => {
        weathersetup()
    }, 60000);
});