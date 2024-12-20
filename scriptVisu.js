
// taille du dataset : 50 lignes
// 1 ligne = 1 enregistrement
//tailleDataset = length(data);

document.addEventListener("DOMContentLoaded", () => {
    
    // Page de visualisation
    if (window.location.pathname.includes("visualisation.html")) {
        const data = JSON.parse(localStorage.getItem("csvData"));
       // Afficher le tableau de données
        // const table = document.getElementById("data-table");
        // const headers = Object.keys(data[0]);
        // const headerRow = table.insertRow();
        // headers.forEach(header => {
        //     const cell = headerRow.insertCell();
        //     cell.textContent = header;
        // });
        // data.forEach(row => {
        //     const rowElement = table.insertRow();
        //     headers.forEach(header => {
        //         const cell = rowElement.insertCell();
        //         cell.textContent = row[header];
        //     });
        // });

        // Calculer la somme des puissances et la puissance moyenne
        let totalPower = 0;
        let nbBarrage = 0;
        data.forEach(row => {
            if (row["Puissance installée"]) {    
            totalPower += parseFloat(row["Puissance installée"]);
            nbBarrage += 1;}
        });
        const averagePower = totalPower / data.length;
        // Afficher les résultats dans un tableau
        const resultTable = document.getElementById("result-table");
        const resultHeaderRow = resultTable.insertRow();
        const titleRow = resultTable.createTHead().insertRow();
        const titleCell = titleRow.insertCell();
        titleCell.colSpan = 2;
        titleCell.textContent = "Informations sur les barrages étudiées, résultats en MwH";
        titleCell.style.fontWeight = "bold";
        ["Puissance totale", "Puissance Moyenne"].forEach(header => {
            const cell = resultHeaderRow.insertCell();
            cell.textContent = header;
        });
        const resultRow = resultTable.insertRow();
        [resultRow.insertCell().textContent = totalPower.toFixed(2), resultRow.insertCell().textContent = averagePower.toFixed(2)];


        // console.debug(data[1]);

        // Dimensions de la carte
const width = 800;
const height = 1000;

// Création du conteneur SVG
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Définition de la projection centrée sur la France
const projection = d3.geoMercator()
    .center([2.2137, 46.2276]) // Centre approximatif de la France
    .scale(2500) // Échelle pour zoomer sur la France
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Charger les données géographiques de la France
d3.json("https://france-geojson.gregoiredavid.fr/repo/regions.geojson").then(function(geojson) {
    // Afficher les contours des régions
    svg.append("g")
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#e3e3e3") // Gris clair pour la carte
        .attr("stroke", "#666") // Contours gris foncé
        .attr("stroke-width", 0.5);

    // Charger les données des barrages depuis localStorage (ou autre source)
    const data = JSON.parse(localStorage.getItem("csvData"));

    // Ajouter les points pour chaque barrage
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => d["Coordonnées X_WGS"] && d["Coordonnées Y_WGS"] 
            ? projection([+d["Coordonnées X_WGS"], +d["Coordonnées Y_WGS"]])[0] 
            : null)
        .attr("cy", d => d["Coordonnées X_WGS"] && d["Coordonnées Y_WGS"] 
            ? projection([+d["Coordonnées X_WGS"], +d["Coordonnées Y_WGS"]])[1] 
            : null)
        .attr("r", d => d["Puissance installée"] 
            ? Math.sqrt(+d["Puissance installée"]) / 10 // Rayon proportionnel à la puissance installée
            : 0)
        .attr("fill", "red")
        .attr("opacity", 0.6)
        .filter(d => d["Coordonnées X_WGS"] && d["Coordonnées Y_WGS"]); // Ignorer les points sans coordonnées
});

    //     // Graphique à barres
    //     const barChart = d3.select("#bar-chart");
    //     const barData = data.slice(0, 10); // Exemple avec 10 premières lignes
    //     barChart.selectAll("rect")
    //         .data(barData)
    //         .enter()
    //         .append("rect")
    //         .attr("x", (d, i) => i * 30)
    //         .attr("y", d => 400 - d.value) // Exemple avec une colonne "value"
    //         .attr("width", 20)
    //         .attr("height", d => d.value)
    //         .attr("fill", "steelblue");

    //     // Graphique à sections
    //     const pieChart = d3.select("#pie-chart");
    //     const pieData = d3.pie().value(d => d.value)(barData); // Exemple avec "value"
    //     const arc = d3.arc().innerRadius(0).outerRadius(150);
    //     pieChart.selectAll("path")
    //         .data(pieData)
    //         .enter()
    //         .append("path")
    //         .attr("d", arc)
    //         .attr("fill", (d, i) => d3.schemeCategory10[i]);

    //     // Graphique complexe
    //     const complexChart = d3.select("#complex-chart");
    //     const lineData = data.slice(0, 50); // Exemple avec les 50 premières lignes
    //     const xScale = d3.scaleLinear().domain([0, lineData.length]).range([0, 500]);
    //     const yScale = d3.scaleLinear().domain([0, d3.max(lineData, d => d.value)]).range([400, 0]);
    //     const line = d3.line()
    //         .x((d, i) => xScale(i))
    //         .y(d => yScale(d.value));
    //     complexChart.append("path")
    //         .datum(lineData)
    //         .attr("d", line)
    //         .attr("fill", "none")
    //         .attr("stroke", "steelblue");
    }
});
const data = JSON.parse(localStorage.getItem("csvData"));

// Graphique à barres
function getPowerByDepartment(data) {
    const powerByDepartment = {};
    data.forEach(item => {
        const department = item.Département;
        const power = parseFloat(item["Puissance installée"]); // Parse power as float

        if (powerByDepartment[department]) {
            powerByDepartment[department] += power;
        } else {
            powerByDepartment[department] = power;
        }
    });

    return powerByDepartment;
}
const powerData = getPowerByDepartment(data);
// Extraire les départements et les puissances installées
const departments = Object.keys(powerData);
const powers = Object.values(powerData);

var width = 800; // largeur du graphique
var barHeight = 20; // hauteur de chaque barre
var margin = 1; // marge entre les barres

// Définir l'échelle pour la puissance installée
var scale = d3.scaleLinear()
    .domain([0, d3.max(powers)]) // Plage de puissance installée
    .range([50, 500]); 
const barChart = d3.select("#bar-chart").append("svg")
    .attr("width", width)
    .attr("height", barHeight * powers.length + 40) // Adjust height for title
    .style('background-color', 'white');
// titre
barChart.append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Puissance installée par département");

var barg = barChart.selectAll("g")
    .data(powers)
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
        return "translate(0," + (i * barHeight + 40) + ")";
});
barg.append("rect")
    .attr("width", function (d) { return scale(d); })
    .attr("height", barHeight - margin)
    .style('fill', 'red');
barg.append("text")
    .attr("x", function (d) { return scale(d) + 5; }) // Décalage pour le texte à droite de la barre
    .attr("y", barHeight / 2)
    .attr("dy", ".35em")
    .text(function (d, i) { return departments[i] + ": " + d + " MW"; });
    
// Graphique à sections
function countCategorie(data, property) {
    const frequency = {};
    data.forEach(item => {
      const value = item[property];
      if (frequency[value]) {
        frequency[value]++;
      } else {
        frequency[value] = 1;
      }
    });
    return Object.keys(frequency).map(key => ({
        Categorie_centrale: key,
        nombre: frequency[key]
      }));
  }
const dataCategory = countCategorie(data, "Catégorie centrale");
console.log(dataCategory);

var svg = d3.select("#pie-chart").append("svg")
    .attr("width", 1000)
    .attr("height", 500)
    .style('background-color', 'white');

// Add title
svg.append("text")
    .attr("x", 500)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Répartition des catégories centrales");

var base_diagramme = d3.pie().value(function(d) { return d.nombre; })(dataCategory);
var arc = d3.arc().innerRadius(0).outerRadius(200).padAngle(0.05).padRadius(50);
var couleur = d3.scaleOrdinal(d3.schemeCategory10);
var sections = svg.append("g")
    .attr("transform", "translate(300,250)")
    .selectAll("path")
    .data(base_diagramme)
    .enter().append("path")
    .attr("d", arc)
    .attr("fill", function(d) { return couleur(d.data.Categorie_centrale); });

var libelle = svg.select("g").selectAll("text")
    .data(base_diagramme)
    .enter()
    .append("text")
    .classed("inside", true).each(function(d) {
        var centre = arc.centroid(d);
        d3.select(this).attr("x", centre[0]).attr("y", centre[1]).text(d.data.nombre);
    });

// Add percentage labels
libelle.append("text")
    .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .style("text-anchor", "middle")
    .text(function(d) { return Math.round((d.data.nombre / d3.sum(dataCategory, d => d.nombre)) * 100) + "%"; });

// Add legend
var legend = svg.append("g")
    .attr("transform", "translate(600, 100)")
    .selectAll("g")
    .data(base_diagramme)
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

legend.append("rect")
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", function(d) { return couleur(d.data.Categorie_centrale); });

legend.append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .text(function(d) { return d.data.Categorie_centrale; });
