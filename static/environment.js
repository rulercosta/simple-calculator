function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
}

function setupEnvironment() {
    const calculatorElement = document.getElementById('calculator');
    const readmeContainer = document.getElementById('readme-content');
    const calculatorStylesheet = document.getElementById('calculator-styles');

    if (isPWA()) {
        if (readmeContainer) readmeContainer.style.display = 'none';
        if (calculatorElement) calculatorElement.style.display = 'flex';
        if (calculatorStylesheet) calculatorStylesheet.disabled = false;
    } else {
        if (calculatorElement) calculatorElement.style.display = 'none';
        if (calculatorStylesheet) calculatorStylesheet.disabled = true;
        
        fetch('README.md')
            .then(response => response.text())
            .then(markdown => {
                if (readmeContainer && window.marked) {
                    readmeContainer.innerHTML = marked.parse(markdown);
                }
            })
            .catch(console.error);
    }
}

window.addEventListener('load', setupEnvironment);
window.matchMedia('(display-mode: standalone)').addEventListener('change', setupEnvironment);
