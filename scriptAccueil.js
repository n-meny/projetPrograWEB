document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("file-input");
    const convertButton = document.getElementById("convert-button");
    const visualisationLink = document.getElementById("visualisation-link");

    let jsonData = [];

    // Charger le fichier CSV
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
            convertButton.style.display = "block";
        }
    });

    // Convertir le CSV en JSON
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

            // Afficher le lien vers la page de visualisation
            visualisationLink.style.display = "inline";
        }
    })
});