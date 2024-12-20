// taille du dataset : 50 lignes
// 1 ligne = 1 enregistrement
//tailleDataset = length(data);
const data = JSON.parse(localStorage.getItem("csvData"));
console.log(data);
       // Afficher le tableau de données
         const table = document.getElementById("data-table");
         const headers = Object.keys(data[0]);
         const headerRow = table.insertRow();
         headers.forEach(header => {
             const cell = headerRow.insertCell();
             cell.textContent = header;
         });
         data.forEach(row => {
             const rowElement = table.insertRow();
             headers.forEach(header => {
                 const cell = rowElement.insertCell();
                 cell.textContent = row[header];
             });
         });

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
const widthMap = 800;
const heightMap = 1000;

// Création du conteneur SVG
const svgMap = d3.select("#map")
    .append("svg")
    .attr("width", widthMap)
    .attr("height", heightMap);

// Définition de la projection centrée sur la France
const projection = d3.geoMercator()
    .center([2.2137, 46.2276]) // Centre approximatif de la France
    .scale(2500) // Échelle pour zoomer sur la France
    .translate([widthMap / 2, heightMap / 2]);

const path = d3.geoPath().projection(projection);

// Charger les données géographiques de la France
d3.json("https://france-geojson.gregoiredavid.fr/repo/regions.geojson").then(function(geojson) {
    // Afficher les contours des régions
    svgMap.append("g")
        .selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#e3e3e3") // Gris clair pour la carte
        .attr("stroke", "#666") // Contours gris foncé
        .attr("stroke-width", 0.5);

    // Charger les données des centrales depuis localStorage ou une autre source
    const data = JSON.parse(localStorage.getItem("csvData"));

    // Ajouter les points pour chaque centrale
    svgMap.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => {
            // Vérifier que les coordonnées sont présentes
            if (d["Coordonnées X_WGS"] && d["Coordonnées Y_WGS"]) {
                return projection([+d["Coordonnées X_WGS"], +d["Coordonnées Y_WGS"]])[0];
            }
            return null;
        })
        .attr("cy", d => {
            // Vérifier que les coordonnées sont présentes
            if (d["Coordonnées X_WGS"] && d["Coordonnées Y_WGS"]) {
                return projection([+d["Coordonnées X_WGS"], +d["Coordonnées Y_WGS"]])[1];
            }
            return null;
        })
        .attr("r", d => {
            // Calculer le rayon du cercle en fonction de la puissance installée
            if (d["Puissance installée"]) {
                return Math.sqrt(+d["Puissance installée"]) / 10; // Ajuster l'échelle selon vos besoins
            }
            return 0;
        })
        .attr("fill", "red")
        .attr("opacity", 0.6)
        .filter(d => d["Coordonnées X_WGS"] && d["Coordonnées Y_WGS"]); // Ignorer les points sans coordonnées
});

// Graphique à barres
// Créer un document pour la puissance installée par département
function getPowerByDepartment(data) {
    const powerByDepartment = {};
    data.forEach(item => {
        const department = item.Département;
        const power = parseFloat(item["Puissance installée"]); // Parse power as float
        // Arrondir la puissance à l'entier le plus proche
        const roundedPower = Math.round(power);
        if (powerByDepartment[department]) {
            powerByDepartment[department] += roundedPower;
        } else {
            powerByDepartment[department] = roundedPower;
        }
    });
    return powerByDepartment;
}

const powerData = getPowerByDepartment(data);
// Extraire les départements et les puissances installées
const departments = Object.keys(powerData);
const powers = Object.values(powerData);

var width = 1000; // largeur du graphique
var barHeight = 20; // hauteur de chaque barre
var margin = 1; // marge entre les barres

// Définir l'échelle pour la puissance installée
var scale = d3.scaleLinear()
    .domain([0, d3.max(powers)]) // Plage de puissance installée
    .range([50, 500]);
// Créer le graphique à barres
const barChart = d3.select("#bar-chart").append("svg")
    .attr("width", width)
    .attr("height", barHeight * powers.length + 40) // Ajuster la hauteur pour le titre
    .style('background-color', 'white');

// Titre
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

// Barre
barg.append("rect")
    .attr("x", 230) // Décalage des barres encore plus vers la droite
    .attr("width", function (d) { return scale(d); })
    .attr("height", barHeight - margin)
    .style('fill', 'red');

// Nom du département à gauche
barg.append("text")
    .attr("x", 220) 
    .attr("y", barHeight / 2)
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .text(function (d, i) { return departments[i]; });

// Valeur en MW à droite
barg.append("text")
    .attr("x", function (d) { return scale(d) + 230; }) 
    .attr("y", barHeight / 2)
    .attr("dy", ".35em")
    .text(function (d, i) { return d + " MW"; });

// Graphique à sections
//Creation de documents pour les catégories de centrales
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

// Création du graphique
var svg = d3.select("#pie-chart").append("svg")
    .attr("width", 1000)
    .attr("height", 500)
    .style('background-color', 'white');

// Titre du graphique
svg.append("text")
    .attr("x", 500)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Répartition des catégories centrales");

//Contenu du graphique
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
var total = d3.sum(dataCategory, function(d) { return d.nombre; });
// Ajouter les textes pour les pourcentages avec le calcul du total
var libelle = svg.select("g").selectAll("text")
    .data(base_diagramme)
    .enter()
    .append("text")
    .classed("inside", true)
    .each(function(d) {
        var centre = arc.centroid(d);
        var percentage = (d.data.nombre / total) * 100;
        var xPosition = centre[0]-10 * 1.4; // Décalage vers la droite
        var yPosition = centre[1] * 1.4; // Décalage vers le bas
        d3.select(this)
            .attr("x", xPosition)
            .attr("y", yPosition)
            .text(Math.round(percentage) + "%");
    });
// legende
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
