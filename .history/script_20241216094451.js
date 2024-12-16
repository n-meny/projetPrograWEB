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
                const rows = text.split("\n").map(row => row.split(";"));
                const headers = rows[0];
                jsonData = rows.slice(1).map(row => {
                    return headers.reduce((acc, header, index) => {
                        acc[header] = row[index];
                        return acc;
                    }, {});
                });
                jsonData = jsonData.map(row => {
                    const { col1, col2, col3, col4, col5, ...rest } = row;
                    return rest;
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
        const barChart = d3.select("#bar-chart");
        const barData = data.slice(0, 10); // Exemple avec 10 premières lignes
        barChart.selectAll("rect")
            .data(barData)
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * 30)
            .attr("y", d => 400 - d.value) // Exemple avec une colonne "value"
            .attr("width", 20)
            .attr("height", d => d.value)
            .attr("fill", "steelblue");

        // Graphique à sections
        const pieChart = d3.select("#pie-chart");
        const pieData = d3.pie().value(d => d.value)(barData); // Exemple avec "value"
        const arc = d3.arc().innerRadius(0).outerRadius(150);
        pieChart.selectAll("path")
            .data(pieData)
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => d3.schemeCategory10[i]);

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
