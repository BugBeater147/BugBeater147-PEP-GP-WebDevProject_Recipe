/**
 * This script defines the add, view, and delete operations for Ingredient objects in the Recipe Management Application.
 */

const BASE_URL = "http://localhost:8081"; // backend URL

/* 
 * TODO: Get references to various DOM elements
 * - addIngredientNameInput
 * - deleteIngredientNameInput
 * - ingredientListContainer
 * - searchInput (optional for future use)
 * - adminLink (if visible conditionally)
 */
const addIngredientNameInput = document.getElementById("add-ingredient-name-input");
const deleteIngredientNameInput = document.getElementById("delete-ingredient-name-input");
const ingredientListContainer = document.getElementById("ingredient-list");

/* 
 * TODO: Attach 'onclick' events to:
 * - "add-ingredient-submit-button" → addIngredient()
 * - "delete-ingredient-submit-button" → deleteIngredient()
 */
document.getElementById("add-ingredient-submit-button").onclick = addIngredient;
document.getElementById("delete-ingredient-submit-button").onclick = deleteIngredient;

/*
 * TODO: Create an array to keep track of ingredients
 */
let ingredients = [];

/* 
 * TODO: On page load, call getIngredients()
 */
getIngredients();

/**
 * TODO: Add Ingredient Function
 * 
 * Requirements:
 * - Read and trim value from addIngredientNameInput
 * - Validate input is not empty
 * - Send POST request to /ingredients
 * - Include Authorization token from sessionStorage
 * - On success: clear input, call getIngredients() and refreshIngredientList()
 * - On failure: alert the user
 */
async function addIngredient() {
    const name = addIngredientNameInput.value.trim();
    if (!name) {
        alert("Please enter an ingredient name.");
        return;
    }
    try {
        const res = await fetch(`${BASE_URL}/ingredients`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + (sessionStorage.getItem("auth-token") || "")
            },
            body: JSON.stringify({ name })
        });
        if (!res.ok) {
            alert("Failed to add ingredient.");
            return;
        }
        addIngredientNameInput.value = "";
        await getIngredients();
    } catch (e) {
        console.error(e);
        alert("Error adding ingredient.");
    }
}


/**
 * TODO: Get Ingredients Function
 * 
 * Requirements:
 * - Fetch all ingredients from backend
 * - Store result in `ingredients` array
 * - Call refreshIngredientList() to display them
 * - On error: alert the user
 */
async function getIngredients() {
    try {
        const res = await fetch(`${BASE_URL}/ingredients`, {
            headers: {
                "Authorization": "Bearer " + (sessionStorage.getItem("auth-token") || "")
            }
        });
        if (!res.ok) {
            alert("Failed to load ingredients.");
            return;
        }
        ingredients = await res.json();
        refreshIngredientList();
    } catch (e) {
        console.error(e);
        alert("Error loading ingredients.");
    }
}


/**
 * TODO: Delete Ingredient Function
 * 
 * Requirements:
 * - Read and trim value from deleteIngredientNameInput
 * - Search ingredientListContainer's <li> elements for matching name
 * - Determine ID based on index (or other backend logic)
 * - Send DELETE request to /ingredients/{id}
 * - On success: call getIngredients() and refreshIngredientList(), clear input
 * - On failure or not found: alert the user
 */
async function deleteIngredient() {
    const name = deleteIngredientNameInput.value.trim();
    if (!name) {
        alert("Please enter an ingredient name.");
        return;
    }
    const idx = ingredients.findIndex(it => {
        const n = typeof it === "string" ? it : (it.name || it.ingredientName || "");
        return n.toLowerCase() === name.toLowerCase();
    });
    if (idx === -1) {
        alert("Ingredient not found.");
        return;
    }
    const obj = ingredients[idx];
    const id = (obj && typeof obj === "object" && "id" in obj) ? obj.id : (idx + 1);
    try {
        const res = await fetch(`${BASE_URL}/ingredients/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + (sessionStorage.getItem("auth-token") || "")
            }
        });
        if (!res.ok) {
            alert("Failed to delete ingredient.");
            return;
        }
        deleteIngredientNameInput.value = "";
        await getIngredients();
    } catch (e) {
        console.error(e);
        alert("Error deleting ingredient.");
    }
}


/**
 * TODO: Refresh Ingredient List Function
 * 
 * Requirements:
 * - Clear ingredientListContainer
 * - Loop through `ingredients` array
 * - For each ingredient:
 *   - Create <li> and inner <p> with ingredient name
 *   - Append to container
 */
function refreshIngredientList() {
    ingredientListContainer.innerHTML = "";
    ingredients.forEach(it => {
        const li = document.createElement("li");
        const p = document.createElement("p");
        const n = typeof it === "string" ? it : (it.name || it.ingredientName || JSON.stringify(it));
        p.innerText = n;
        li.appendChild(p);
        ingredientListContainer.appendChild(li);
    });
}
