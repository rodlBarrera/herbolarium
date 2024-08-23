"use strict";

const recipeSearch = document.querySelector("#recipe_search");
const selectFilter = document.querySelector("#select_filter");
const recipeCards = document.querySelector("#recipe_cards");
const recipeInfo = document.querySelector("#recipe_info");

let recipes = [];
let recipesDefault = [];

const listTabsId = ["aceite_type", "bano_type", "locion_type", "pomada_type"];

const init = () => {
  recipesDefault = getLocalStorage("recipes") || [];
  createListOfRecipes();
  listTabsId.forEach((id) => filterByRecipeType(id));
  searchRecipes();
  recipeInfo.innerHTML = showEmpty();
};

init();

// Función ára crear la lista de card de recetas
function createListOfRecipes() {
  let list = getLocalStorage("recipes") || [];
  if(list.length === 0) {
    recipeCards.innerHTML = showEmpty();
    return;
  }
  recipeCards.replaceChildren();
  list.forEach((recipe) => {
    renderRecipeCard(recipe);
  });
}

// Función para rederizar las tarjetas de las recetas
function renderRecipeCard(recipe) {
  const card = document.createElement("div");
  card.classList.add("recipe_list__cards__card");
  card.classList.toggle("recipe_card__selected", recipe.selected === true);
  card.onclick = () => renderRecipeInfo(recipe);

  card.innerHTML = `
    <img src="${recipe.img}" alt="${
    recipe.name
  }" class="recipe_list__cards__card__image">
        <div class="recipe_list__cards__card__label">
            <span class="recipe_list__cards__card__label__title">${
              recipe.name
            }</span>
        </div>
    `;

  recipeCards.appendChild(card);
}

// Función para filtrar de forma dinámica
function searchRecipes() {
  let list = getLocalStorage("recipes");
  recipeSearch.addEventListener("input", (event) => {
    const searchValue = event.target.value.toLowerCase();

    if (searchValue == "") {
      setLocalStorage("recipes", recipesDefault);
      createListOfRecipes();
      return;
    }

    let recipesFilter = list.filter((recipe) => {
      let name =
        searchValue != ""
          ? recipe.name.toLowerCase().includes(searchValue.toLowerCase())
          : false;
      let type =
        searchValue != ""
          ? recipe.type.toLowerCase().includes(searchValue.toLowerCase())
          : false;
      let ingredient =
        searchValue != ""
          ? recipe.ingredients.some((ingredient) =>
              transformString(ingredient).includes(transformString(searchValue))
            )
          : false;
      let medic =
        searchValue != ""
          ? recipe.medicBenefits.some((medic) =>
              transformString(medic).includes(transformString(searchValue))
            )
          : false;
      let magic =
        searchValue != ""
          ? recipe.magicBenefits.some((magic) =>
              transformString(magic).includes(transformString(searchValue))
            )
          : false;
      return name || type || ingredient || medic || magic;
    });

    if(recipesFilter.length === 0) {
      recipeCards.innerHTML = showEmpty();
      return;
    }

    setLocalStorage("recipes", recipesFilter);

    createListOfRecipes();
  });
}

// Función para filtrar por tipo de receta
function filterByRecipeType(id) {
  const btn = document.querySelector(`#${id}`);
  const elementSelected = id.split("_")[0];
  let element = btn.innerText;

  btn.addEventListener("click", () => {
    btn.classList.toggle(
      `recipe_list__actions__select_tab_element__tab__${elementSelected}__active`,
      !btn.classList.contains(
        `recipe_list__actions__select_tab_element__tab__${elementSelected}__active`
      )
    );

    const tabList = document.querySelectorAll(
      ".recipe_list__actions__select_tab_element>button"
    );

    Array.from(tabList).map((tab) => {
      if (tab.innerText !== btn.innerText) {
        const elementNotSelected = tab.id.split("_")[0];
        tab.classList.remove(
          `recipe_list__actions__select_tab_element__tab__${elementNotSelected}__active`
        );
      }
    });

    if (
      !btn.classList.contains(
        `recipe_list__actions__select_tab_element__tab__${elementSelected}__active`
      )
    ) {
      setLocalStorage("recipes", recipesDefault);
      createListOfRecipes();
      return;
    }

    let recipesByElement = recipesDefault.filter(
      (recipe) => recipe.type === transformString(element)
    );

    setLocalStorage("recipes", recipesByElement);
    createListOfRecipes();
    searchRecipes();
  });
}

// Función para renderizar la información de cada Receta
function renderRecipeInfo(recipe) {
  let recipeDescription = "";
  let recipeIngredients = "";
  let recipeMedicBenefits = "";
  let recipeMagicBenefits = "";

  const listOfRecipe = getLocalStorage("recipes") || [];

  let recipeInfoBtns = document.createElement("div");
  recipeInfoBtns.classList.add("recipe_info__buttons");
  
  let deleteRecipeBtn = document.createElement("button");
  deleteRecipeBtn.classList.add("recipe_info__buttons__button");
  deleteRecipeBtn.classList.add("recipe_info__buttons__button__cancel");
  deleteRecipeBtn.id = "delete_recipe_btn";
  deleteRecipeBtn.innerText = "Eliminar";

  deleteRecipeBtn.onclick = () => deleteRecipe(recipe);

  recipeInfoBtns.appendChild(deleteRecipeBtn);

  recipe.description.forEach((description) => {
    recipeDescription += `<p class="recipe_info__description__paragraph">${description}</p>`;
  });

  recipe.ingredients.forEach((ingredient) => {
    recipeIngredients += `<li>${ingredient}</li>`;
  });

  recipe.medicBenefits.forEach((medicBenefit) => {
    recipeMedicBenefits += `<li>${medicBenefit}</li>`;
  });

  recipe.magicBenefits.forEach((magicBenefit) => {
    recipeMagicBenefits += `<li>${magicBenefit}</li>`;
  });

  let recipeSelected = listOfRecipe.map((recipeElement) => {
    if (recipeElement.name === recipe.name) {
      recipeElement.selected = !recipeElement.selected;
      if (recipeElement.selected === true) {
        recipeInfo.innerHTML = `
            <div class="recipe_info__general">
                <img class="recipe_info__general__image" src="${
                  recipe.img
                }" alt="${recipe.name}">
                <div class="recipe_info__general__stats">
                    <div class="recipe_info__general__stats__element">
                        <h2 class="recipe_info__general__stats__element__name">${
                          recipe.name
                        }</h2>
                    </div>
                    <div class="recipe_info__general__stats__benefits_list">
                        <p class="recipe_info__general__stats__benefits_list__title">Ingredientes:</p>
                        <ul class="recipe_info__general__stats__benefits_list__list">
                          ${recipeIngredients}
                        </ul>
                    </div>
                    <div class="recipe_info__general__stats__benefits_list">
                        <p class="recipe_info__general__stats__benefits_list__title">Beneficios Médicos:</p>
                        <ul class="recipe_info__general__stats__benefits_list__list">
                          ${recipeMedicBenefits}
                        </ul>
                    </div>
                    <div class="recipe_info__general__stats__benefits_list">
                        <p class="recipe_info__general__stats__benefits_list__title">Beneficios Mágicos:</p>
                        <ul class="recipe_info__general__stats__benefits_list__list">
                          ${recipeMagicBenefits}
                        </ul>
                    </div>
                </div>
            </div>
            <div class="recipe_info__description">
                ${recipeDescription}
            </div>
    `;
        recipeInfo.appendChild(recipeInfoBtns);
      } else {
        recipeInfo.innerHTML = showEmpty();
      }
    } else {
      recipeElement.selected = false;
    }
    return recipeElement;
  });
  setLocalStorage("recipes", recipeSelected);
  createListOfRecipes();
}

// Función para obtener la información de la hierba seleccionada
function getRecipeInfo(recipeInfo) {
  card.addEventListener("click", () => {
    let recipeSelected = recipes.find((recipe) => recipe.name === recipeInfo.name);

    renderRecipeInfo(recipeSelected);
  });
}

// Function para eliminar una receta
function deleteRecipe(recipe) {
  const listOfRecipe = getLocalStorage("recipes") || [];
  let recipeIndex = listOfRecipe.findIndex((recipeElement) => recipeElement.name === recipe.name);
  let newRecipesList = [...listOfRecipe];
  newRecipesList.splice(recipeIndex, 1);
  Toastify({
    text: "Receta eliminada exitosamente.",
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    }
  }).showToast();
  recipeInfo.innerHTML = showEmpty();
  setLocalStorage("recipes", newRecipesList);
  createListOfRecipes();
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
