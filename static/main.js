import { appendToDisplay, clearAll, clearOne, toggleSign, calculate } from './script.js';

class Calculator {
    static init() {
        const layout = new CalculatorLayout();
        
        setTimeout(() => {
            document.querySelectorAll('#calculator button').forEach(button => {
                button.addEventListener('click', () => {
                    const action = button.getAttribute('data-action');
                    switch(action) {
                        case 'clear':
                            if (button.textContent === 'C') {
                                clearOne();
                            } else {
                                clearAll();
                            }
                            break;
                        case 'sign':
                            toggleSign();
                            break;
                        case 'calculate':
                            calculate();
                            break;
                        default:
                            appendToDisplay(action);
                    }
                });
            });

            document.dispatchEvent(new CustomEvent('calculator-ready'));
        }, 0);
    }
}

document.addEventListener('DOMContentLoaded', Calculator.init);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const basePath = window.location.pathname.includes('simple-calculator') 
            ? '/simple-calculator'
            : '';
        
        navigator.serviceWorker.register(`${basePath}/sw.js`, {
            scope: `${basePath}/`
        })
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.error('ServiceWorker registration failed: ', err);
            });
    });
}
