'use strict';
// console.log(document.querySelector('.message').textContent);
// document.querySelector('.message').textContent = '🥳 Correct Number!';
// document.querySelector('.score').textContent = 26;
// document.querySelector('.number').textContent = '❓';
// document.querySelector('.guess').value = '26';

let Secretnumber = Math.round(Math.random() * 20);
console.log(Secretnumber);

let score = 20;

let highScore = 0;

const showMessage = function (message) {
  document.querySelector('.message').textContent = message;
};

document.querySelector('.check').addEventListener('click', function () {
  const guess = Number(document.querySelector('.guess').value);

  console.log(guess);
  //No input
  if (!guess) {
    showMessage('🔕 Not a Number');
    //When player wins
  } else if (guess === Secretnumber) {
    showMessage('🍕 Correct Number');
    document.querySelector('body').style.backgroundColor = 'green';
    document.querySelector('.number').textContent = Secretnumber;
    document.querySelector('.number').style.width = '30rem';
    document.querySelector('.message').style.backgroundColor = 'black';
    if (score > highScore) {
      highScore = score;
      document.querySelector('.highscore').textContent = highScore;
    }
  }
  //Low High Guess
  if (guess !== Secretnumber) {
    showMessage(
      guess > Secretnumber ? '⬆️ Number is Too high' : '⬇️ Number is Too Low'
    );
    score--;
    document.querySelector('.score').textContent = score;
  }
  if (score <= 0) {
    showMessage('Game Over');
    document.querySelector('.btn.check').style.display = 'none';
  }
});

document.querySelector('.btn.again').addEventListener('click', function () {
  Secretnumber = Math.round(Math.random() * 20);
  score = 20;
  document.querySelector('.number').textContent = '?';
  document.querySelector('.score').textContent = score;
  showMessage('Start guessing...');
  document.querySelector('body').style.backgroundColor = 'black';
  document.querySelector('.number').style.width = '';
  document.querySelector('.guess').value = '';
  document.querySelector('.btn.check').style.display = '';
});
