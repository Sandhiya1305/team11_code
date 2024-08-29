document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('extractButton').addEventListener('click', function() {
        const inputTextElement = document.getElementById('inputText');
        const fileInput = document.getElementById('fileInput');
        let inputText = '';

        if (inputTextElement.value.trim()) {
            inputText = inputTextElement.value;
            processText(inputText);
        } else if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = function(event) {
                inputText = event.target.result;
                processText(inputText);
            };

            reader.readAsText(file);
        } else {
            alert("Please enter text or upload a file.");
        }
    });

    function processText(inputText) {
        const extractedInfo = extractInformation(inputText);

        // Display the extracted information on the page
        document.getElementById('requirementsOutput').textContent = JSON.stringify(extractedInfo["Customer Requirements"], null, 4);
        document.getElementById('policiesOutput').textContent = JSON.stringify(extractedInfo["Company Policies Discussed"], null, 4);
        document.getElementById('objectionsOutput').textContent = JSON.stringify(extractedInfo["Customer Objections"], null, 4);

        // Visualize the output with charts
        createCharts(extractedInfo);

        // Save the output as a JSON file
        saveJSONToFile(extractedInfo, 'extracted_info.json');
    }

    function createCharts(data) {
        const carRequirements = data["Customer Requirements"];
        const carTypes = {};
        const fuelTypes = {};
        const transmissionTypes = {};
        const colors = {};

        carRequirements.forEach(car => {
            if (car["Car Type"]) {
                carTypes[car["Car Type"]] = (carTypes[car["Car Type"]] || 0) + 1;
            }
            if (car["Fuel Type"]) {
                fuelTypes[car["Fuel Type"]] = (fuelTypes[car["Fuel Type"]] || 0) + 1;
            }
            if (car["Transmission Type"]) {
                transmissionTypes[car["Transmission Type"]] = (transmissionTypes[car["Transmission Type"]] || 0) + 1;
            }
            if (car["Color"]) {
                colors[car["Color"]] = (colors[car["Color"]] || 0) + 1;
            }
        });

        // Bar Chart for Car Types
        const ctxBar = document.getElementById('barChart').getContext('2d');
        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: Object.keys(carTypes),
                datasets: [{
                    label: 'Car Types',
                    data: Object.values(carTypes),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Pie Chart for Fuel Types
        const ctxPie = document.getElementById('pieChart').getContext('2d');
        new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: Object.keys(fuelTypes),
                datasets: [{
                    label: 'Fuel Types',
                    data: Object.values(fuelTypes),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            }
        });
    }

    function extractInformation(text) {
        // Your existing extraction logic here
        const cars = [];
        let currentCar = {
            "Car Type": null,
            "Fuel Type": null,
            "Color": null,
            "Distance Travelled": null,
            "Make Year": null,
            "Transmission Type": null
        };

        const companyPolicies = {
            "Free RC Transfer": false,
            "5-Day Money Back Guarantee": false,
            "Free RSA for One Year": false,
            "Return Policy": false
        };

        const customerObjections = {
            "Refurbishment Quality": false,
            "Car Issues": false,
            "Price Issues": false,
            "Customer Experience Issues": false
        };

        const colors = [
            "red", "green", "yellow", "white", "gray", "silver", "orange", "brown",
            "purple", "pink", "beige", "cyan", "magenta", "gold", "teal", "violet", "indigo", "maroon"
        ];

        const sentences = text.split('.');

        sentences.forEach(sentence => {
            const sentText = sentence.toLowerCase().trim();

            if (sentText.includes("sedan") || sentText.includes("suv") || sentText.includes("hatchback")) {
                if (Object.values(currentCar).some(value => value !== null)) {
                    cars.push({ ...currentCar });
                }
                currentCar = {
                    "Car Type": null,
                    "Fuel Type": null,
                    "Color": null,
                    "Distance Travelled": null,
                    "Make Year": null,
                    "Transmission Type": null
                };
            }

            if (sentText.includes("sedan")) currentCar["Car Type"] = "Sedan";
            if (sentText.includes("suv")) currentCar["Car Type"] = "SUV";
            if (sentText.includes("hatchback")) currentCar["Car Type"] = "Hatchback";
            if (sentText.includes("manual")) currentCar["Transmission Type"] = "Manual";
            if (sentText.includes("automatic")) currentCar["Transmission Type"] = "Automatic";
            if (["petrol", "diesel", "electric", "hybrid"].some(fuel => sentText.includes(fuel))) {
                currentCar["Fuel Type"] = ["Petrol", "Diesel", "Electric", "Hybrid"].find(fuel => sentText.includes(fuel.toLowerCase()));
            }

            colors.forEach(color => {
                if (sentText.includes(color)) {
                    currentCar["Color"] = color.charAt(0).toUpperCase() + color.slice(1);
                }
            });

            const distanceMatch = sentText.match(/\d{1,5}\s?km/);
            if (distanceMatch) currentCar["Distance Travelled"] = distanceMatch[0];

            const yearMatch = sentText.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) currentCar["Make Year"] = yearMatch[0];

            if (sentText.includes("free rc transfer")) companyPolicies["Free RC Transfer"] = true;
            if (sentText.includes("5-day money back guarantee")) companyPolicies["5-Day Money Back Guarantee"] = true;
            if (sentText.includes("free rsa for one year")) companyPolicies["Free RSA for One Year"] = true;
            if (sentText.includes("return policy")) companyPolicies["Return Policy"] = true;

            if (sentText.includes("refurbishment quality")) customerObjections["Refurbishment Quality"] = true;
            if (sentText.includes("car issues") || sentText.includes("reliability")) customerObjections["Car Issues"] = true;
            if (sentText.includes("price")) customerObjections["Price Issues"] = true;
            if (["long wait time", "salesperson behavior"].some(issue => sentText.includes(issue))) {
                customerObjections["Customer Experience Issues"] = true;
            }
        });

        if (Object.values(currentCar).some(value => value !== null)) {
            cars.push(currentCar);
        }

        return {
            "Customer Requirements": cars,
            "Company Policies Discussed": companyPolicies,
            "Customer Objections": customerObjections
        };
    }

    function saveJSONToFile(data, filename) {
        const jsonStr = JSON.stringify(data, null, 4);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});
