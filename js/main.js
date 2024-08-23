"use strict";

const herbalSearch = document.querySelector("#herbal_search");
const selectFilter = document.querySelector("#select_filter");
const herbalCards = document.querySelector("#herbal_cards");
const herbalInfo = document.querySelector("#herbal_info");
const herbalCreate = document.querySelector("#herbal_create");
const newRecipeBtn = document.querySelector("#new_recipe_btn");
const recipeIngredients = document.querySelector("#recipe_ingredients");
const recipeBenefits = document.querySelector("#recipe_benefits");
const recipeName = document.querySelector("#recipe_name");
const recipeDescription = document.querySelector("#recipe_description");
const recipeType = document.querySelector("#recipe_type");
const saveRecipeBtn = document.querySelector("#save_recipe_btn");
const cancelRecipeBtn = document.querySelector("#cancel_recipe_btn");

let herbsData = [];

const elementTypeIcon = {
  fuego: "https://i.postimg.cc/HxRRjTjT/fire-icon.webp",
  agua: "https://i.postimg.cc/HL7QdHGw/water-icon.webp",
  aire: "https://i.postimg.cc/MKj33kHQ/air-icon.webp",
  tierra: "https://i.postimg.cc/FHVMGtCx/earth-icon.webp",
};

const recipeTypesImages = {
  aceite: "https://i.postimg.cc/1RDTkH6r/aceite.webp",
  bano: "https://i.postimg.cc/gkd5mZHF/ba-o.webp",
  locion: "https://i.postimg.cc/qMLFRv1t/locion.webp",
  pomada: "https://i.postimg.cc/kggptPHT/pomada.webp"
}

const listTabsId = ["fire_tab", "water_tab", "air_tab", "earth_tab"];

let stateRecipe = false;

let medicalBenefits = [];
let magicBenefits = [];


// Función asyncrona para obtener los datos de las hierbas
async function getHerbsData() {
  const response = await fetch("https://mocki.io/v1/bcc5d000-775e-4fef-862a-f6e4454672f8");
  try {
    const data = await response.json();
    herbsData = [...data.herbals];
  } catch (error) {
    console.error(error);
  }
}


// Inicializa las primeras funciones
const init = async () => {
  await getHerbsData();
  localStorage.clear();
  setLocalStorage("herbsData", herbsData);
  createListOfHerbs();
  listTabsId.forEach((id) => filterByElement(id));
  searchHerbs();
  herbalInfo.innerHTML = showEmpty();
};

init();
// Función ára crear la lista de card de hierbas
function createListOfHerbs() {
  let list = getLocalStorage("herbsData");
  herbalCards.replaceChildren();
  list.forEach((herb) => {
    renderHerbCard(herb);
  });
}

// Función para rederizar las tarjetas de las plantas
function renderHerbCard(herb) {
  const card = document.createElement("div");
  card.classList.add("herbal_list__cards__card");
  card.classList.toggle("herbal_card__selected", herb.selected === true);
  card.classList.toggle("herbal_list__cards__card__can_drop", herb.drag === true);
  card.onclick = () => eventClickCard(herb);

  card.innerHTML = `
    <img src="${herb.image}" alt="${
    herb.name
  }" class="herbal_list__cards__card__image gu-mirror__card__image">
      <div class="herbal_list__cards__card__label gu-mirror__card__label">
        <img src="${elementTypeIcon[herb.naturalEnergy.toLowerCase()]}" alt="${
    herb.naturalEnergy
  }" class="herbal_list__cards__card__label__icon gu-mirror__card__label__icon">
        <span class="herbal_list__cards__card__label__title gu-mirror__card__label__title">${
          herb.name
        }</span>
      </div>
  `;

  herbalCards.appendChild(card);
}

// Eventos al hacer click en la tarjeta dependiendo si es para agregar a la receta o para ver la información
function eventClickCard(herb) {
  if (!stateRecipe) {
    renderHerbInfo(herb);
  }
}

// Función para filtrar de forma dinámica
function searchHerbs() {
  let list = getLocalStorage("herbsData");
  herbalSearch.addEventListener("input", (event) => {
    const searchValue = event.target.value.toLowerCase();

    if (searchValue == "") {
      setLocalStorage("herbsData", herbsData);
      createListOfHerbs();
      return;
    }

    let herbsFilter = list.filter((herb) => {
      let name =
        searchValue != ""
          ? herb.name.toLowerCase().includes(searchValue.toLowerCase())
          : false;
      let energy =
        searchValue != ""
          ? herb.naturalEnergy.toLowerCase().includes(searchValue.toLowerCase())
          : false;
      let medic =
        searchValue != ""
          ? herb.medicBenefits.some((medic) =>
              transformString(medic).includes(transformString(searchValue))
            )
          : false;
      let magic =
        searchValue != ""
          ? herb.magicBenefits.some((magic) =>
              transformString(magic).includes(transformString(searchValue))
            )
          : false;
      return name || energy || medic || magic;
    });

    if(herbsFilter.length === 0) {
      herbalCards.innerHTML = showEmpty();
      return
    }

    setLocalStorage("herbsData", herbsFilter);

    createListOfHerbs();
  });
}

// Función para filtrar por elemento
function filterByElement(id) {
  const btn = document.querySelector(`#${id}`);
  const elementSelected = id.split("_")[0];
  let element = btn.innerText;

  btn.addEventListener("click", () => {
    btn.classList.toggle(
      `herbal_list__actions__select_tab_element__tab__${elementSelected}__active`,
      !btn.classList.contains(
        `herbal_list__actions__select_tab_element__tab__${elementSelected}__active`
      )
    );

    const tabList = document.querySelectorAll(
      ".herbal_list__actions__select_tab_element>button"
    );

    Array.from(tabList).map((tab) => {
      if (tab.innerText !== btn.innerText) {
        const elementNotSelected = tab.id.split("_")[0];
        tab.classList.remove(
          `herbal_list__actions__select_tab_element__tab__${elementNotSelected}__active`
        );
      }
    });

    if (
      !btn.classList.contains(
        `herbal_list__actions__select_tab_element__tab__${elementSelected}__active`
      )
    ) {
      setLocalStorage("herbsData", herbsData);
      createListOfHerbs();
      return;
    }

    let herbsByElement = herbsData.filter(
      (herb) => herb.naturalEnergy === element
    );

    setLocalStorage("herbsData", herbsByElement);
    createListOfHerbs();
    searchHerbs();
  });
}

// Función para renderizar la información de cada Hierba
function renderHerbInfo(herb) {
  let herbDescription = "";
  let herbMedicBenefits = "";
  let herbMagicBenefits = "";

  herb.description.forEach((description) => {
    herbDescription += `<p class="herbal_info__description__paragraph">${description}</p>`;
  });

  herb.medicBenefits.forEach((medicBenefit) => {
    herbMedicBenefits += `<li>${medicBenefit}</li>`;
  });

  herb.magicBenefits.forEach((magicBenefit) => {
    herbMagicBenefits += `<li>${magicBenefit}</li>`;
  });

  let herbSelected = herbsData.map((herbal) => {
    if (herbal.name === herb.name) {
      herbal.selected = !herbal.selected;
      if (herbal.selected === true) {
        herbalInfo.innerHTML = `
            <div class="herbal_info__general">
                <img class="herbal_info__general__image" src="${
                  herb.image
                }" alt="${herb.name}">
                <div class="herbal_info__general__stats">
                    <div class="herbal_info__general__stats__element">
                        <img class="herbal_info__general__stats__element__icon" src="${
                          elementTypeIcon[herb.naturalEnergy.toLowerCase()]
                        }" alt="${herb.naturalEnergy}">
                        <h2 class="herbal_info__general__stats__element__name">${
                          herb.name
                        }</h2>
                    </div>
                    <div class="herbal_info__general__stats__benefits_list">
                        <p class="herbal_info__general__stats__benefits_list__title">Beneficios Médicos:</p>
                        <ul class="herbal_info__general__stats__benefits_list__list">
                          ${herbMedicBenefits}
                        </ul>
                    </div>
                    <div class="herbal_info__general__stats__benefits_list">
                        <p class="herbal_info__general__stats__benefits_list__title">Beneficios Mágicos:</p>
                        <ul class="herbal_info__general__stats__benefits_list__list">
                          ${herbMagicBenefits}
                        </ul>
                    </div>
                </div>
            </div>
            <div class="herbal_info__description">
                ${herbDescription}
                <p class="herbal_info__description__alchemist_advice">${
                  herb.alchemicalAdvice
                }</p>
            </div>
    `;
      } else {
        herbalInfo.innerHTML = showEmpty();
      }
    } else {
      herbal.selected = false;
    }
    return herbal;
  });
  setLocalStorage("herbsData", herbSelected);
  createListOfHerbs();
}

// Función para obtener la información de la hierba seleccionada
function getHerbInfo(herb) {
  card.addEventListener("click", () => {
    let herbSelected = herbsData.find((herbal) => herbal.name === herb.name);

    renderHerbInfo(herbSelected);
  });
}

// Método para activar la selección de ingredientes
newRecipeBtn.addEventListener("click", () => {
  changeRecipeMode(true);
  addIngredient();
});

// Método para cancelar la receta
cancelRecipeBtn.addEventListener("click", () => {
  changeRecipeMode(false);
  cancelRecipe();
});

// Función para cambiar el DOM al modo de creación de receta
function changeRecipeMode(newRecipe) {
  if(stateRecipe === newRecipe) return;
  stateRecipe = newRecipe;

  herbalInfo.style.display = newRecipe ? "none" : "block";
  herbalCreate.style.display = newRecipe ? "block" : "none";

  let listOfHerbs = getLocalStorage("herbsData");
  listOfHerbs.forEach((herb) => herb.drag = stateRecipe);

  setLocalStorage("herbsData", listOfHerbs);
  createListOfHerbs();
  
  // const listCards = herbalCards.querySelectorAll(".herbal_list__cards__card");
  // listCards.forEach((card) => {
  //   card.className += newRecipe ? " herbal_list__cards__card__can_drop" : "";
  // });

}

// Función para cancelar la receta y volver a la lista de hierbas
function cancelRecipe() {
  magicBenefits = [];
  medicalBenefits = [];
  recipeName.value = "";
  recipeDescription.value = "";
  recipeType.selectedIndex = 0;
  recipeIngredients.innerHTML = "";
  recipeBenefits.innerHTML = "";
  dragula([herbalCards, recipeIngredients]).destroy();
  setLocalStorage("herbsData", herbsData);
  createListOfHerbs();
}

// Función para agregar un ingrediente a la receta
function addIngredient() {
  dragula([herbalCards, recipeIngredients], {
    accepts: function (el, target) {
      return el !== herbalCards
    },

  })
  .on("drop", (el) => {
    let ingredientName = el.querySelector(".herbal_list__cards__card__label__title").innerText;
    let ingredient = herbsData.find((herb) => herb.name === ingredientName);
    recipeIngredients.appendChild(el);
    getBenefits(ingredient);
  });
}

// Función para guardar la receta
saveRecipeBtn.addEventListener("click", () => {
  if(recipeName.value === "" || recipeDescription.value === "" || recipeType.value === "") {
    Toastify({
      text: "Por favor, complete todos los campos para guardar la receta.",
      style: {
        background: "linear-gradient(to right, #ad0606, #531010)",
      }
    }).showToast();
    return
  }

  getIngredients();

  let recipe = {
    name: recipeName.value,
    description: recipeDescription.value.split("\n"),
    type: recipeType.value,
    img: recipeTypesImages[recipeType.value],
    ingredients: getIngredients(),
    medicBenefits: [...medicalBenefits],
    magicBenefits: [...magicBenefits],
  };

  let recipes = getLocalStorage("recipes") || [];
  recipes.push(recipe);
  setLocalStorage("recipes", recipes);
  Toastify({
    text: "Receta guardada exitosamente.",
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    }
  }).showToast();
  changeRecipeMode(false);
  cancelRecipe();
});

// Función para retornar la lista de ingredientes
function getIngredients() {
  let ingredients = recipeIngredients.querySelectorAll(".herbal_list__cards__card__label__title");
  let ingredientToRecipe = [];

  ingredients.forEach((ingredient) => {
    ingredientToRecipe.push(ingredient.innerText);
  });

  return ingredientToRecipe;
}

// Función para obtener los beneficios medicos de todos los ingredientes agregados
function getBenefits(ingredients) {
  ingredients.medicBenefits.forEach((benefit) => {
    if(medicalBenefits.includes(benefit)) return;
    medicalBenefits.push(benefit);
  });

  ingredients.magicBenefits.forEach((benefit) => {
    if(magicBenefits.includes(benefit)) return;
    magicBenefits.push(benefit);
  });

  renderBenefits(medicalBenefits, magicBenefits);
}

// Función para renderizar los beneficios en el DOM
function renderBenefits(medicalBenefits, magicBenefits) {
  recipeBenefits.innerHTML = `
    <div class="herbal_create__new_recipe__recipe_benefits__benefits_list">
      <p class="herbal_create__new_recipe__recipe_benefits__benefits_list__title">Beneficios Médicos:</p>
      <ul class="herbal_create__new_recipe__recipe_benefits__benefits_list__list">
        ${medicalBenefits.map((benefit) => `<li>${benefit}</li>`).join("")}
      </ul>
    </div>
    <div class="herbal_create__new_recipe__recipe_benefits__benefits_list">
      <p class="herbal_create__new_recipe__recipe_benefits__benefits_list__title">Beneficios Mágicos:</p>
      <ul class="herbal_create__new_recipe__recipe_benefits__benefits_list__list">
        ${magicBenefits.map((benefit) => `<li>${benefit}</li>`).join("")}
      </ul>
    </div>
  `;
}

// Función para mostrar el Empty 
function showEmpty() {
  return `
    <div class="empty-content">
      <img src="https://i.postimg.cc/T1p4d7JL/Caldero.webp" alt="Empty Icon" class="empty-content__image" />
    </div>
  `;
}

// Función para eliminar tildes y transformar en minúsculas un string
function transformString(text) {
  const minText = text.toLowerCase();
  return minText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Función para guardar en local storage
function setLocalStorage(name, value) {
  localStorage.setItem(name, JSON.stringify(value));
}

// Función para obtener de local storage
function getLocalStorage(name) {
  return JSON.parse(localStorage.getItem(name));
}
