// Initialisation du tableau produits
let products = [];

/**********************************
 * RÉCUPÉRATION DES PRODUITS (API)
 **********************************/
fetch("https://fakestoreapi.com/products")
    .then(response => response.json()) // Récupère les données JSON depuis l'API
    .then(myproducts => {

        // Stocker les produits récupérés
        products = myproducts;
    
        
        // Calcul des KPI
        const totalProducts = products.length; // Nombre total de produits
        const prices = products.map(p => p.price); // Tableau des prix
        const minPrice = Math.min(...prices); // Prix minimum
        const maxPrice = Math.max(...prices); // Prix maximum

        // Calcul du prix moyen
        let somme = 0;
        for (let i = 0; i < prices.length; i++) {
            somme += prices[i]; // Somme de tous les prix
        }
        const avgPrice = (somme / prices.length).toFixed(2); // Prix moyen avec 2 décimales

        // Affichage des KPI dans le HTML
        document.getElementById("total-products").textContent = totalProducts;
        document.getElementById("min-price").textContent = minPrice + " $";
        document.getElementById("avg-price").textContent = avgPrice + " $";
        document.getElementById("max-price").textContent = maxPrice + " $";

        /**********************************
         * VISITEURS & ACHETEURS
         **********************************/
        const visitors = []; // Tableau des visiteurs simulés
        const buyers = [];   // Tableau des acheteurs simulés

        for (let i = 0; i < products.length; i++) {
            const va = Math.floor(Math.random() * 500) + 50; // visiteurs aléatoires entre 50 et 550
            visitors.push(va);

            const aa = Math.floor(Math.random() * (va + 1)); // acheteurs <= visiteurs
            buyers.push(aa);
        }

        /**********************************
         * TABLEAU DES PRODUITS
         **********************************/
        const tbody = document.querySelector("#products-table tbody");
        tbody.innerHTML = ""; // On vide le tableau avant de le remplir

        for (let i = 0; i < products.length; i++) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><img src="${products[i].image}" width="40"></td>
                <td>${products[i].title}</td>
                <td>${products[i].price} $</td>
                <td>${products[i].rating.rate} / ${products[i].rating.count}</td>
                <td>${visitors[i]}</td>
                <td>${products[i].category}</td>

                <td>
                    <button class="action-btn btn-edit">✏️ Modifier </button>  </td>
                <td>
                    <button class="action-btn btn-delete">🗑️ Supprimer </button>
                </td>
            `;

            // Bouton supprimer avec confirmation
            const deleteBtn = tr.querySelector(".btn-delete");//supprime ds le tableau HTML ligne precise
            deleteBtn.addEventListener("click", function () {
                const confirmed = confirm("⚠️ Êtes-vous sûr de vouloir supprimer ce produit ?");
                if (confirmed) {
                    tr.remove(); // Supprime la ligne du tableau
                    // Optionnel : supprimer du tableau JS
                }
            });

            // Bouton modifier
            const editBtn = tr.querySelector(".btn-edit");
            editBtn.addEventListener("click", function () {
                const newPrice = prompt("Nouveau prix :", products[i].price); // Demande nouveau prix
                if (newPrice !== null) {
                    products[i].price = newPrice; // Mise à jour du tableau JS
                    tr.children[2].textContent = newPrice + " $"; // 📌 children[2] = 3ᵉ colonne (Prix)
                }
            });

            // Ajouter la ligne au tableau HTML
            tbody.appendChild(tr);
        }

        /**********************************
         * GRAPHIQUE KPI
         **********************************/
        new Chart(document.getElementById("kpiChart"), {
            type: "line",
            data: {
                labels: ["Total Produits", "Prix Min", "Prix Moyen", "Prix Max"],
                datasets: [{
                    label: "Valeur",
                    data: [totalProducts, minPrice, avgPrice, maxPrice],
                    backgroundColor: [
                        "#3c8dbc",
                        "#f39c12",
                        "#00a65a",
                        "#d81b60"
                    ],
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true // Le graphique est flexible selon la taille de l'écran
            }
        });

        /**********************************
         * GRAPHIQUE VISITEURS / ACHETEURS
         **********************************/
        new Chart(document.getElementById("visitorsChart"), {
            type: "bar",
            data: {
                labels: products.map(p =>
                    p.title.length > 15 ? p.title.slice(0, 15) + "..." : p.title
                ),
                datasets: [
                    {
                        label: "Visiteurs",
                        data: visitors,
                        backgroundColor: "#3c8dbc"
                    },
                    {
                        label: "Acheteurs",
                        data: buyers,
                        backgroundColor: "#00a65a"
                    }
                ]
            },
            options: {
                responsive: true
            }
        });
    })
    .catch(error => console.error(error)); // Gestion des erreurs API

/**********************************
 * RECHERCHE PRODUITS
 **********************************/
document.getElementById("btn-search").addEventListener("click", function () {
    const valeur = document.getElementById("search").value.toLowerCase(); // Récupère la valeur saisie
    const resultat = products.filter(product => product.title.toLowerCase().includes(valeur)); // Filtre les produits

    const tbody = document.querySelector("#products-table tbody");
    tbody.innerHTML = ""; // Vide le tableau

    // Affichage des résultats
    for (let i = 0; i < resultat.length; i++) {
        tbody.innerHTML += `
            <tr>
                <td><img src="${resultat[i].image}" width="40"></td>
                <td>${resultat[i].title}</td>
                <td>${resultat[i].price} $</td>
                <td>${resultat[i].rating.rate}</td>
                <td>-</td>
            </tr>
        `;
    }
});

/**********************************
 * BOUTON FAQ
 **********************************/
const faqBtn = document.getElementById("faq-btn");
const faqOverlay = document.getElementById("faq-overlay");
const faqClose = document.getElementById("faq-close");
const mainContent = document.querySelector("main");

faqBtn.addEventListener("click", function () {
    faqOverlay.style.display = "flex"; // Affiche le modal FAQ
    mainContent.classList.add("blur");  // Floute le contenu derrière
});

faqClose.addEventListener("click", function () {
    faqOverlay.style.display = "none"; // Ferme le modal FAQ
    mainContent.classList.remove("blur"); // Supprime le flou
});

/**********************************
 * FORMULAIRE AJOUT / MODIFICATION PRODUIT
 **********************************/
const productForm = document.getElementById("product-form");

productForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Empêche le rechargement de la page pour ne pas perdre les données

    // Récupération des valeurs du formulaire
    const title = document.getElementById("name").value.trim();//trim() :supprime les espaces inutiles
    const price = parseFloat(document.getElementById("price").value);
    const ratingValue = parseFloat(document.getElementById("rating").value);
    const visitors = parseInt(document.getElementById("visitors").value);
    const imageUrl = document.getElementById("image").value.trim();
    const category = document.getElementById("category").value;

    // Création de l'objet produit
    const newProduct = {
        title: title,
        price: price,
        rating: {
            rate: ratingValue,
            count: 0//nombre d’avis (initialisé à 0)
        },
        image: imageUrl,
        category: category

    };

    // Ajout au tableau JS
    products.push(newProduct);

    // Création d'une nouvelle ligne HTML
    const tbody = document.querySelector("#products-table tbody");
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td><img src="${imageUrl}" width="40" alt="image produit"></td>
        <td>${title}</td>
        <td>${price.toFixed(2)} $</td>
        <td>${ratingValue} / ${newProduct.rating.count}</td>
        <td>${visitors}</td>
        <td>${category}</td>

        <td>
           <button class="action-btn btn-edit">✏️ Modifier</button> </td>
           <td>
           <button class="action-btn btn-delete">🗑️ Supprimer</button>
        </td>
    `;

    // Ajouter la ligne au tableau
    tbody.appendChild(tr);

    // Réinitialiser le formulaire
    productForm.reset();//Vide le formulaire après l’ajout « On utilise reset pour vider le formulaire après l’ajout afin d’éviter de réutiliser les anciennes valeurs.
});

/**********************************
 * MODAL AJOUT PRODUIT
 **********************************/
const addProductBtn = document.getElementById("add-product-btn");
const productModal = document.getElementById("product-modal");
const productClose = document.getElementById("product-close");

// Ouvrir le modal
addProductBtn.addEventListener("click", function() {
    productModal.style.display = "flex";
    mainContent.classList.add("blur");
});

// Fermer le modal
productClose.addEventListener("click", function() {
    productModal.style.display = "none";
    mainContent.classList.remove("blur");
});

document.getElementById("category-filter").addEventListener("change", function () {
    const selected = this.value;
    const tbody = document.querySelector("#products-table tbody");
    tbody.innerHTML = "";

    const filtered =
        selected === "all"
            ? products
            : products.filter(p => p.category === selected);

    filtered.forEach(p => {//forEach parcourt directement chaque élément de ton tableau, tandis que for utilise un index i pour accéder à chaque élément.
        tbody.innerHTML += `
            <tr>
                <td><img src="${p.image}" width="40"></td>
                <td>${p.title}</td>
                <td>${p.price} $</td>
                <td>${p.rating.rate}</td>
                <td>-</td>
                <td>${p.category}</td>
            </tr>
        `;
    });
});
