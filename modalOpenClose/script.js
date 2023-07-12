'use strict';
const modal = document.querySelector('.modal.hidden');
const overlay = document.querySelector('.overlay.hidden');

const btnCloseModel = document.querySelector('.close-modal');
const btnsOpenModal = document.querySelectorAll('.show-modal');

const openModal = function () {
  console.log('Button clicked');
  modal.classList.remove('hidden'); //sellect'de . yaziyoruz, classlist de remove icin . yok
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

//console.log(btnsOpenModal);

for (
  let i = 0;
  i < btnsOpenModal.length;
  i++ //Tek satir ise {} gerek yok
)
  btnsOpenModal[i].addEventListener('click', openModal);

btnCloseModel.addEventListener('click', closeModal);
//burada yukarida closeModal fonksiyonu yazip kullandik.
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});
