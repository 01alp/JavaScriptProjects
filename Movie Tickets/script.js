const container = document.querySelector('.container');

const count = document.getElementById('count');

const amount = document.getElementById('amount');

const select = document.getElementById('movie');

const seats = document.querySelectorAll('.seat');

const seatNumbers = document.querySelectorAll('.text');

getFromLocalStorage();
calculateTotal();

container.addEventListener('click', function (e) {
  // console.log(e.target);
  if (e.target.classList.contains('seat') && !e.target.classList.contains('reserved')) {
    e.target.classList.toggle('selected');
    calculateTotal();
  }
});

select.addEventListener('change', function (e) {
  console.log(e);
  calculateTotal();
});

function calculateTotal() {
  const selectedSeats = container.querySelectorAll('.seat.selected');
  //console.log(selectedSeats);

  const selectedSeatArray = [];
  const seatArray = [];

  seats.forEach(function (seat) {
    seatArray.push(seat);
  });

  selectedSeats.forEach(function (seat) {
    selectedSeatArray.push(seat);
  });
  // console.log(selectedSeatArray);
  // console.log(seatArray);

  let sellectedSeatsIndex = selectedSeatArray.map(function (seat) {
    return seatArray.indexOf(seat) + 1;
  });
  console.log(sellectedSeatsIndex);
  let price = select.value;
  let selectedSeatCount = container.querySelectorAll('.seat.selected').length;
  //console.log(selectedSeatCount);

  count.innerText = selectedSeatCount;
  amount.innerText = selectedSeatCount * price;
  saveToLocalStorage(sellectedSeatsIndex);
}

function saveToLocalStorage(index) {
  localStorage.setItem('selectedSeats', JSON.stringify(index));
  localStorage.setItem('selectedMovieIndex', select.selectedIndex);
}

function getFromLocalStorage() {
  const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats'));
  const selectedMovieIndex = localStorage.getItem('selectedMovieIndex');

  if (selectedSeats !== null && selectedSeats.length > 0) {
    seats.forEach((seat, index) => {
      if (selectedSeats.includes(index + 1)) {
        seat.classList.add('selected');
      }
    });
  }
  if (selectedMovieIndex !== null) {
    select.selectedIndex = selectedMovieIndex;
  }
}
