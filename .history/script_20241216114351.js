document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("file-input");
    const convertButton = document.getElementById("convert-button");
    const visualisationLink = document.getElementById("visualisation-link");

    let jsonData = [];

    // Charger le fichier CSV
    if (fileInput) {
        fileInput.addEventListener("change", () => {
            const file = fileInput.files[0];
            if (file) {
                convertButton.style.display = "block";
            }
        });
    }

    // Convertir le CSV en JSON
    if (convertButton) {
        convertButton.addEventListener("click", async () => {
            const file = fileInput.files[0];
            if (file) {
                const text = await file.text();
                const rows = text.split("\n").filter(row => row.trim() !== "").map(row => row.split(";"));
                const headers = rows[0];
                
                jsonData = rows.slice(1).map(row => {
                    return headers.reduce((acc, header, index) => {
                        acc[header] = row[index];
                        return acc;
                    }, {});
                });
                // Supprimer l'item "Perimètre juridique" de jsonData
                jsonData = jsonData.map(obj => {
                    delete obj["Perimètre juridique"];
                    delete obj["Perimètre spatial"];
                    delete obj["Spatial perimeter"];
                    delete obj["Filière"];
                    delete obj["Sector"];
                    delete obj["Unité"];
                    delete obj["Power station category"];
                    return obj;
                });
                // Enregistrer les données dans le localStorage pour la visualisation
                localStorage.setItem("csvData", JSON.stringify(jsonData));
                console.log(jsonData);
                // Afficher le lien vers la page de visualisation
                visualisationLink.style.display = "inline";
            }
        });
    }
    

    // Page de visualisation
    if (window.location.pathname.includes("visualisation.html")) {
        const data = JSON.parse(localStorage.getItem("csvData"));

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

        // Graphique à barres
        function getPowerByDepartment(data) {
            const powerByDepartment = {};
            data.forEach(item => {
                const department = item.Département;
                const power = item["Puissance installée"];
        
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


        const svg = d3.select("#bar-chart").append("svg")
            .attr("width", width)
            .attr("height", barHeight * powers.length)
            .style('background-color', 'lightgray');
        var g = svg.selectAll("g")
            .data(powers)
            .enter()
            .append("g")
            .attr("transform", function (d, i) {
                return "translate(0," + i * barHeight + ")";
        });
        g.append("rect")
            .attr("width", function (d) { return scale(d); })
            .attr("height", barHeight - margin)
            .style('fill', 'red');

            
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
            .attr("width",1000)
            .attr("height",500);
        var base_diagramme=d3.pie().value(function(d) {return d.nombre;})
            (dataCategory);
        var arc = d3.arc().innerRadius(0).outerRadius(200).padAngle(0.05).padRadius(50);
        var couleur = d3.scaleOrdinal(d3.schemeCategory10);
        var sections = svg.append("g")
            .attr("transform","translate(300,250)")
            .selectAll("path")
            .data(base_diagramme)
            .enter().append("path")
            .attr("d",arc)
            .attr("fill", function(d){return couleur(d.data.Categorie_centrale);});
        
        var libelle =d3.select("g").selectAll("text")
            .data(base_diagramme)
            .enter()
            .append("text")
            .classed("inside",true).each(function(d){
                var centre = arc.centroid(d);
                d3.select(this).attr("x",centre[0]).attr("y",centre[1]).text(d.data.nombre);
            });

        // Graphique complexe
        const complexChart = d3.select("#complex-chart");
        const lineData = data.slice(0, 50); // Exemple avec les 50 premières lignes
        const xScale = d3.scaleLinear().domain([0, lineData.length]).range([0, 500]);
        const yScale = d3.scaleLinear().domain([0, d3.max(lineData, d => d.value)]).range([400, 0]);
        const line = d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScale(d.value));
        complexChart.append("path")
            .datum(lineData)
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke", "steelblue");
    }
});
