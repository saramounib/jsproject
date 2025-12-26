let electronics =[];
    // 1️⃣ Envoyer une requête HTTP pour récupérer les produits depuis l’API
    fetch("https://fakestoreapi.com/products")//fetch envoie un requete https
    .then(response =>{
        console.log(response);
        return response.json();//json elle meme envoie une promesse.
    })
    .then(myproducts => {
     electronics = myproducts.filter(p => p.category === "electronics");
    console.log(electronics);
    const totalProducts = electronics.length;

    // Créer un tableau contenant uniquement les prix des produits
    const prices = electronics.map(p => p.price);

    // Trouver le prix minimum (Math.min n’accepte pas un tableau → ...prices)
    const minPrice = Math.min(...prices);

    // Trouver le prix maximum
    const maxPrice = Math.max(...prices);

    // Calculer le prix moyen :
    let somme = 0;

    for (let i = 0; i < prices.length; i++) {
        somme += prices[i];
    }
    
    const avgPrice = (somme / prices.length).toFixed(2);
    

    // Afficher les KPI dans le HTML
    document.getElementById("total-products").textContent = totalProducts;
    document.getElementById("min-price").textContent = minPrice + " $";
    document.getElementById("avg-price").textContent = avgPrice + " $";
    document.getElementById("max-price").textContent = maxPrice + " $";

    // 4️⃣ Simulation des visiteurs et acheteurs

    // Générer un nombre aléatoire de visiteurs pour chaque produit (50 à 550) 
    // // Générer le nombre d’acheteurs (toujours ≤ visiteurs)buyers
    const buyers = [];
    const visitors = [];
    for (let i = 0; i < electronics.length; i++){
        const va = Math.floor(Math.random() * 500) + 50;
        visitors.push(va);

        const aa = Math.floor(Math.random() * (va+1));
        buyers.push(aa);
    }
    // 5️⃣ Remplir le tableau HTML avec les produits

    
    const tbody = document.querySelector("tbody");


    for(let i=0; i < electronics.length ;i++){
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${electronics[i].image}" /></td>
            <td>${electronics[i].title}</td>
            <td>${electronics[i].price} $</td>
            <td>${electronics[i].rating.rate} / ${electronics[i].rating.count}</td>
            <td>${visitors[i]}</td>
        `;
        tbody.appendChild(tr);
        //ajoute la ligne <tr> à la fin du <tbody> du tableau.
    }

    // 6️⃣ Graphique KPI (line chart)
    new Chart(document.getElementById("kpiChart"), {
        type: "line", // type de graphique : line, bar, pie, etc.
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
                ]
            }]
        },
        options: {
            responsive: true // le graphique s’adapte à la taille de l’écran
        }
    });

    // 7️⃣ Graphique Visiteurs vs Acheteurs
    new Chart(document.getElementById("visitorsChart"), {
        type: "bar",
        data: {
            // Raccourcir les titres trop longs
            labels: electronics.map(p =>
                p.title.length > 15
                    ? p.title.slice(0, 15) + "..."
                    : p.title
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
 .catch(error => console.error(error));

