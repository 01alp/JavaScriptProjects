const form = document.querySelector('section.top-banner form');
const input = document.querySelector('section.top-banner form input');
const msg = document.querySelector('section.top-banner form .msg');
const list = document.querySelector('section.ajax-section .cities');

localStorage.setItem('apiKey', EncryptStringAES('3193209bec6117e66eba1a204c9d0701'));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  getWeatherData();
});

const getWeatherData = async () => {
  let tokenKey = DecryptStringAES(localStorage.getItem('apiKey'));
  let inputVal = input.value;
  let unitType = 'metric';

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${tokenKey}&units=${unitType}`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      const { name, main, sys, weather } = data;
      let iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

      const cityListItems = list.querySelectorAll('.city');
      const cityArray = Array.from(cityListItems);
      if (cityArray.length > 0) {
        const filterArray = cityArray.filter((listItems) => {
          listItems.querySelector('span').innerText == name;
          msg.innerText = `You already searched ${name}, Please search another city :)`;
          setTimeout(() => {
            msg.innerText = '';
          }, 5000);
        });
        form.reset();
        return;
      }

      const newLi = document.createElement('li');
      newLi.classList.add('city');
      const newLiHtml = `

    <h2 class="city-name" data-name="${name}",${sys.country}>
        <span>${name}</span>
        <sup>${sys.country}</sup>
    </h2>
    <div class="city-temp">${Math.round(main.temp)} <sup>°C</sup></div>
    <figure>
        <img class="city-icon" src="${iconUrl}" alt="">
        <figcaption>${weather[0].description}</figcaption>
    </figure>      

      `;
      newLi.innerHTML = newLiHtml;
      list.prepend(newLi);
    } else {
      throw new Error('Request failed with status ' + response.status);
    }
  } catch (error) {
    console.error(error);
    msg.innerText = "Couldn't find the city";
    setTimeout(() => {
      msg.innerText = '';
    }, 5000);
  }
  form.reset();
};
