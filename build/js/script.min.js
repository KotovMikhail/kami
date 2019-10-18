const btnSettings = document.querySelectorAll(`.btn--settings`);

const addBtnClickHandler = function (btn) {

  btn.addEventListener(`click`, function () {
    const btnDropdown = btn.querySelector(`.btn--dropdown`);

    btnDropdown.addEventListener(`click`, function () {
      const cardsItem = this.closest(`.cards__item`);
      const search = cardsItem.querySelector(`.search`);
      search.classList.toggle(`search--hidden`);
      const btnSearchs = search.querySelectorAll(`.btn--search`);

      for (let i = 0; i < btnSearchs.length; i++) {
        btnSearchs[i].classList.toggle(`btn--hidden`);
      }
    });

    btnDropdown.classList.toggle(`btn--show`);
  });
};


for (let i = 0; i < btnSettings.length; i++) {
  addBtnClickHandler(btnSettings[i]);
}





