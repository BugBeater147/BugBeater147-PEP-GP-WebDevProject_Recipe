/**
 * This script defines the CRUD operations for Recipe objects in the Recipe Management Application.
 */

const BASE_URL = "http://localhost:8081"; // backend URL

let recipes = [];

// Wait for DOM to fully load before accessing elements
window.addEventListener("DOMContentLoaded", () => {

    /* 
     * TODO: Get references to various DOM elements
     * - Recipe name and instructions fields (add, update, delete)
     * - Recipe list container
     * - Admin link and logout button
     * - Search input
    */
    const adminLink = document.getElementById("admin-link");
    const logoutButton = document.getElementById("logout-button");

    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");

    const listEl = document.getElementById("recipe-list");

    const addNameEl = document.getElementById("add-recipe-name-input");
    const addInstrEl = document.getElementById("add-recipe-instructions-input");
    const addSubmitEl = document.getElementById("add-recipe-submit-input");

    const updNameEl = document.getElementById("update-recipe-name-input");
    const updInstrEl = document.getElementById("update-recipe-instructions-input");
    const updSubmitEl = document.getElementById("update-recipe-submit-input");

    const delNameEl = document.getElementById("delete-recipe-name-input");
    const delSubmitEl = document.getElementById("delete-recipe-submit-input");

    /*
     * TODO: Show logout button if auth-token exists in sessionStorage
     */
    if (sessionStorage.getItem("auth-token")) {
        logoutButton.style.display = "";
    }

    /*
     * TODO: Show admin link if is-admin flag in sessionStorage is "true"
     */
    if (sessionStorage.getItem("is-admin") === "true") {
        adminLink.style.display = "";
    }

    /*
     * TODO: Attach event handlers
     * - Add recipe button → addRecipe()
     * - Update recipe button → updateRecipe()
     * - Delete recipe button → deleteRecipe()
     * - Search button → searchRecipes()
     * - Logout button → processLogout()
     */
    addSubmitEl.addEventListener("click", addRecipe);
    updSubmitEl.addEventListener("click", updateRecipe);
    delSubmitEl.addEventListener("click", deleteRecipe);
    searchButton.addEventListener("click", searchRecipes);
    logoutButton.addEventListener("click", processLogout);

    /*
     * TODO: On page load, call getRecipes() to populate the list
     */
    getRecipes();


    /**
     * TODO: Search Recipes Function
     * - Read search term from input field
     * - Send GET request with name query param
     * - Update the recipe list using refreshRecipeList()
     * - Handle fetch errors and alert user
     */
    async function searchRecipes() {
        const term = (searchInput.value || "").trim();
        const token = sessionStorage.getItem("auth-token");
        try {
            if (!term) {
                await getRecipes();
                return;
            }
            const res = await fetch(`${BASE_URL}/recipes?name=${encodeURIComponent(term)}`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (!res.ok) throw new Error("Search failed");
            recipes = await res.json();
            refreshRecipeList();
        } catch (e) {
            alert("Failed to search recipes.");
        }
    }

    /**
     * TODO: Add Recipe Function
     * - Get values from add form inputs
     * - Validate both name and instructions
     * - Send POST request to /recipes
     * - Use Bearer token from sessionStorage
     * - On success: clear inputs, fetch latest recipes, refresh the list
     */
    async function addRecipe() {
        const name = (addNameEl.value || "").trim();
        const instructions = (addInstrEl.value || "").trim();
        const token = sessionStorage.getItem("auth-token");
        if (!name || !instructions) {
            alert("Please provide name and instructions.");
            return;
        }
        try {
            const res = await fetch(`${BASE_URL}/recipes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ name, instructions })
            });
            if (!res.ok) throw new Error("Add failed");
            addNameEl.value = "";
            addInstrEl.value = "";
            await getRecipes();
        } catch (e) {
            alert("Failed to add recipe.");
        }
    }

    /**
     * TODO: Update Recipe Function
     * - Get values from update form inputs
     * - Validate both name and updated instructions
     * - Fetch current recipes to locate the recipe by name
     * - Send PUT request to update it by ID
     * - On success: clear inputs, fetch latest recipes, refresh the list
     */
    async function updateRecipe() {
        const name = (updNameEl.value || "").trim();
        const newInstructions = (updInstrEl.value || "").trim();
        const token = sessionStorage.getItem("auth-token");
        if (!name || !newInstructions) {
            alert("Please provide name and updated instructions.");
            return;
        }
        try {
            if (!recipes.length) await getRecipes();
            const target = recipes.find(r => (r.name || "").toLowerCase() === name.toLowerCase());
            if (!target || target.id == null) {
                alert("Recipe not found.");
                return;
            }
            const res = await fetch(`${BASE_URL}/recipes/${encodeURIComponent(target.id)}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ instructions: newInstructions })
            });
            if (!res.ok) throw new Error("Update failed");
            updNameEl.value = "";
            updInstrEl.value = "";
            await getRecipes();
        } catch (e) {
            alert("Failed to update recipe.");
        }
    }

    /**
     * TODO: Delete Recipe Function
     * - Get recipe name from delete input
     * - Find matching recipe in list to get its ID
     * - Send DELETE request using recipe ID
     * - On success: refresh the list
     */
    async function deleteRecipe() {
        const name = (delNameEl.value || "").trim();
        const token = sessionStorage.getItem("auth-token");
        if (!name) {
            alert("Please provide a recipe name to delete.");
            return;
        }
        try {
            if (!recipes.length) await getRecipes();
            const target = recipes.find(r => (r.name || "").toLowerCase() === name.toLowerCase());
            if (!target || target.id == null) {
                alert("Recipe not found.");
                return;
            }
            const res = await fetch(`${BASE_URL}/recipes/${encodeURIComponent(target.id)}`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });
            if (!res.ok) throw new Error("Delete failed");
            delNameEl.value = "";
            await getRecipes();
        } catch (e) {
            alert("Failed to delete recipe.");
        }
    }

    /**
     * TODO: Get Recipes Function
     * - Fetch all recipes from backend
     * - Store in recipes array
     * - Call refreshRecipeList() to display
     */
    async function getRecipes() {
        const token = sessionStorage.getItem("auth-token");
        try {
            const res = await fetch(`${BASE_URL}/recipes`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (!res.ok) throw new Error("Fetch failed");
            recipes = await res.json();
            refreshRecipeList();
        } catch (e) {
            alert("Failed to load recipes.");
        }
    }

    /**
     * TODO: Refresh Recipe List Function
     * - Clear current list in DOM
     * - Create <li> elements for each recipe with name + instructions
     * - Append to list container
     */
    function refreshRecipeList() {
        listEl.innerHTML = "";
        recipes.forEach(r => {
            const li = document.createElement("li");
            li.textContent = `${r.name ?? "(no name)"} — ${r.instructions ?? ""}`;
            listEl.appendChild(li);
        });
    }

    /**
     * TODO: Logout Function
     * - Send POST request to /logout
     * - Use Bearer token from sessionStorage
     * - On success: clear sessionStorage and redirect to login
     * - On failure: alert the user
     */
    async function processLogout() {
        const token = sessionStorage.getItem("auth-token");
        try {
            await fetch(`${BASE_URL}/logout`, {
                method: "POST",
                headers: { "Authorization": "Bearer " + token }
            });
        } catch (_) {
            // ignore network errors on logout
        } finally {
            sessionStorage.removeItem("auth-token");
            sessionStorage.removeItem("is-admin");
            window.location.href = "../login/login-page.html";
        }
    }

});
