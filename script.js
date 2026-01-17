let products = JSON.parse(localStorage.getItem("products")) || [];

let categories = JSON.parse(localStorage.getItem("categories")) || [
    "electronics","jewelery","men's clothing","women's clothing"
];

// --- Chargement API seulement si localStorage vide ---
if(products.length === 0){
    fetch("https://fakestoreapi.com/products")
    .then(r => r.json())
    .then(data => {
        products = data;
        localStorage.setItem("products", JSON.stringify(products)); // sauvegarde initiale
        initDashboard();
        renderCategoriesSelect();
    })
    .catch(err => console.error(err));
} else {
    // Si produits dans localStorage, on les affiche directement
    initDashboard();
    renderCategoriesSelect();
}


/**********************************
 * INIT DASHBOARD
 **********************************/
function initDashboard() {
    const totalProducts = products.length;
    const prices = products.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = (prices.reduce((a,b)=>a+b,0)/prices.length).toFixed(2);

    document.getElementById("total-products").textContent = totalProducts;
    document.getElementById("min-price").textContent = minPrice+" $";
    document.getElementById("avg-price").textContent = avgPrice+" $";
    document.getElementById("max-price").textContent = maxPrice+" $";

    const visitors = products.map(()=>Math.floor(Math.random()*500)+50);
    const buyers = visitors.map(v=>Math.floor(Math.random()*(v+1)));

    // Tableau produits
    const tbody = document.querySelector("#products-table tbody");
    tbody.innerHTML = "";
    products.forEach((p,i)=>{
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${p.image}" width="40"></td>
            <td>${p.title}</td>
            <td>${p.price} $</td>
            <td>${p.rating.rate} / ${p.rating.count}</td>
            <td>${visitors[i]}</td>
            <td>${p.category}</td>
            <td><button class="btn-edit">✏️</button></td>
            <td><button class="btn-delete">🗑️</button></td>
        `;
        tbody.appendChild(tr);

        // Supprimer
        tr.querySelector(".btn-delete").addEventListener("click",()=>{ 
            if(confirm("Supprimer ce produit ?")){
                products.splice(i,1);
                localStorage.setItem("products", JSON.stringify(products));

                initDashboard();
            }
        });

        // Modifier
        tr.querySelector(".btn-edit").addEventListener("click",()=>openEditModal(p));
    });

    // Graphiques
    new Chart(document.getElementById("kpiChart"),{
        type:"line",
        data:{
            labels:["Total","Min","Moyen","Max"],
            datasets:[{label:"Valeur",data:[totalProducts,minPrice,avgPrice,maxPrice],fill:false,tension:0.4}]
        }
    });
    new Chart(document.getElementById("visitorsChart"),{
        type:"bar",
        data:{labels:products.map(p=>p.title.slice(0,15)),datasets:[
            {label:"Visiteurs",data:visitors,backgroundColor:"#3c8dbc"},
            {label:"Acheteurs",data:buyers,backgroundColor:"#00a65a"}
        ]}
    });
}

/**********************************
 * MODAL AJOUT PRODUIT
 **********************************/
const addProductBtn = document.getElementById("add-product-btn");
const productModal = document.getElementById("product-modal");
const productClose = document.getElementById("product-close");
const mainContent = document.querySelector("main");
const productForm = document.getElementById("product-form");

addProductBtn.addEventListener("click",()=>{
    productModal.style.display="flex";
    mainContent.classList.add("blur");
});

productClose.addEventListener("click",()=>{
    productModal.style.display="none";
    mainContent.classList.remove("blur");
});

// Ajouter produit
productForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    const newP = {
        title:document.getElementById("name").value,
        price:parseFloat(document.getElementById("price").value),
        rating:{rate:parseFloat(document.getElementById("rating").value),count:0},
        image:document.getElementById("image").value,
        category:document.getElementById("category").value
    };
    products.push(newP);
    localStorage.setItem("products", JSON.stringify(products));
    productForm.reset();
    productModal.style.display="none";
    mainContent.classList.remove("blur");
    initDashboard();
});

/**********************************
 * MODAL MODIFICATION PRODUIT
 **********************************/
let currentProduct = null;
const editModal = document.getElementById("edit-modal");
const editClose = document.getElementById("edit-close");

function openEditModal(p){
    currentProduct = p;
    editModal.style.display="flex";
    mainContent.classList.add("blur");
    document.getElementById("edit-title").value=p.title;
    document.getElementById("edit-price").value=p.price;
    document.getElementById("edit-image").value=p.image;

    const sel = document.getElementById("edit-category");
    sel.innerHTML="";
    categories.forEach(c=>{
        const opt = document.createElement("option");
        opt.value=c; opt.textContent=c;
        if(c===p.category) opt.selected=true;
        sel.appendChild(opt);
    });
}

editClose.addEventListener("click",()=>{
    editModal.style.display="none";
    mainContent.classList.remove("blur");
});

document.getElementById("save-edit").addEventListener("click",()=>{
    currentProduct.title=document.getElementById("edit-title").value;
    currentProduct.price=parseFloat(document.getElementById("edit-price").value);
    currentProduct.image=document.getElementById("edit-image").value;
    currentProduct.category=document.getElementById("edit-category").value;
    localStorage.setItem("products", JSON.stringify(products));
    editModal.style.display="none";
    mainContent.classList.remove("blur");
    initDashboard();
});

/**********************************
 * MODAL CRUD CATEGORIES
 **********************************/
const catModal = document.getElementById("category-modal");
document.getElementById("category-close").addEventListener("click",()=>{
    catModal.style.display="none";
    mainContent.classList.remove("blur");
});

document.getElementById("manage-categories-btn").addEventListener("click",()=>{
    catModal.style.display="flex";
    mainContent.classList.add("blur");
});

function renderCategoriesSelect(){
    const sel1 = document.getElementById("category");
    const sel2 = document.getElementById("category-filter");
    sel1.innerHTML="<option value=''>-- Choisir catégorie --</option>";
    sel2.innerHTML="<option value='all'>📂 Toutes les catégories</option>";
    categories.forEach(c=>{
        sel1.innerHTML+=`<option value="${c}">${c}</option>`;
        sel2.innerHTML+=`<option value="${c}">${c}</option>`;
    });
}

function renderCategoriesList(){
    const ul = document.getElementById("category-list");
    ul.innerHTML="";
    categories.forEach((c,i)=>{
        const li = document.createElement("li");
        li.innerHTML=`${c} <button class="btn-edit">✏️</button> <button class="btn-delete">🗑️</button>`;
        ul.appendChild(li);
        li.querySelector(".btn-delete").addEventListener("click",()=>{
            categories.splice(i,1);
            localStorage.setItem("categories",JSON.stringify(categories));
            renderCategoriesList();
            renderCategoriesSelect();
        });
        li.querySelector(".btn-edit").addEventListener("click",()=>{
            const newName = prompt("Modifier la catégorie:",c);
            if(newName){
                categories[i]=newName;
                localStorage.setItem("categories",JSON.stringify(categories));
                renderCategoriesList();
                renderCategoriesSelect();
            }
        });
    });
}
renderCategoriesList();

document.getElementById("add-category-btn").addEventListener("click",()=>{
    const val = document.getElementById("new-category").value.trim();
    if(val){categories.push(val); document.getElementById("new-category").value=""; renderCategoriesList(); renderCategoriesSelect();}
});

/**********************************
 * RECHERCHE PRODUITS
 **********************************/
document.getElementById("btn-search").addEventListener("click",()=>{
    const val = document.getElementById("search").value.toLowerCase();
    const tbody = document.querySelector("#products-table tbody");
    tbody.innerHTML="";
    products.filter(p=>p.title.toLowerCase().includes(val)).forEach(p=>{
        const tr = document.createElement("tr");
        tr.innerHTML=`<td><img src="${p.image}" width="40"></td><td>${p.title}</td><td>${p.price} $</td><td>${p.rating.rate}</td><td>-</td><td>${p.category}</td>`;
        tbody.appendChild(tr);
    });
});

/**********************************
 * FAQ modal
 **********************************/
const faqBtn = document.getElementById("faq-btn");
const faqOverlay = document.getElementById("faq-overlay");
const faqClose = document.getElementById("faq-close");
faqBtn.addEventListener("click",()=>{
    faqOverlay.style.display="flex";
     mainContent.classList.add("blur");});
faqClose.addEventListener("click",()=>{faqOverlay.style.display="none"; 
    mainContent.classList.remove("blur");
});

const sortSelect = document.getElementById("sort");
sortSelect.addEventListener("change", () => {
    let sortedProducts = [...products]; // copie du tableau pour ne pas modifier l'original
    switch(sortSelect.value){
        case "alphabetical":
            sortedProducts.sort((a,b) => a.title.localeCompare(b.title));
            break;
        case "price-asc":
            sortedProducts.sort((a,b) => a.price - b.price);
            break;
        case "price-desc":
            sortedProducts.sort((a,b) => b.price - a.price);
            break;
        default:
            sortedProducts = [...products];
    }
    renderProductTable(sortedProducts);
});

// Nouvelle fonction pour afficher le tableau (à remplacer dans initDashboard)
function renderProductTable(array) {
    const tbody = document.querySelector("#products-table tbody");
    tbody.innerHTML = "";
    array.forEach((p,i)=>{
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${p.image}" width="40"></td>
            <td>${p.title}</td>
            <td>${p.price} $</td>
            <td>${p.rating.rate} / ${p.rating.count}</td>
            <td>-</td>
            <td>${p.category}</td>
            <td><button class="btn-edit">✏️</button></td>
            <td><button class="btn-delete">🗑️</button></td>
        `;
        tbody.appendChild(tr);

        // Supprimer
        tr.querySelector(".btn-delete").addEventListener("click",()=>{ 
            if(confirm("Supprimer ce produit ?")){
                const index = products.findIndex(prod => prod.title === p.title && prod.price === p.price);
                products.splice(index,1);
                localStorage.setItem("products", JSON.stringify(products));
                renderProductTable(products);
            }
        });

        // Modifier
        tr.querySelector(".btn-edit").addEventListener("click",()=>openEditModal(p));

        // Fiche détaillée clic sur nom
        tr.querySelector("td:nth-child(2)").addEventListener("click", ()=>openDetailModal(p));
    });
}
const detailModal = document.getElementById("detail-modal");
const detailClose = document.getElementById("detail-close");

function openDetailModal(p){
    detailModal.style.display="flex";
    mainContent.classList.add("blur");
    document.getElementById("detail-title").textContent = p.title;
    document.getElementById("detail-image").src = p.image;
    document.getElementById("detail-price").textContent = p.price;
    document.getElementById("detail-rating").textContent = p.rating.rate;
    document.getElementById("detail-category").textContent = p.category;
    // si tu veux afficher visiteurs, génère aléatoire comme dashboard
    document.getElementById("detail-visitors").textContent = Math.floor(Math.random()*500)+50;
}

detailClose.addEventListener("click", ()=>{
    detailModal.style.display="none";
    mainContent.classList.remove("blur");
});
/**********************************
 * FILTRAGE PAR CATÉGORIE
 **********************************/
const categoryFilter = document.getElementById("category-filter");

categoryFilter.addEventListener("change", function () {
    renderProductTable(
        this.value === "all"
            ? products
            : products.filter(p => p.category === this.value)
    );
});
