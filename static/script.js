import { factorial, power, calculateExpression } from './calculator.js';

let operationDisplay;
let resultDisplay;
let currentValue = "";  
let previousValue = null;
let operator = null;
let shouldResetDisplay = false;
let openParenCount = 0;
let hasEvaluated = false;
let initialResultFontSize;

document.addEventListener('calculator-ready', () => {
    operationDisplay = document.getElementById("operationDisplay");
    resultDisplay = document.getElementById("resultDisplay");
    initialResultFontSize = window.initialResultFontSize;
});

export function appendToDisplay(input) {
    if (hasEvaluated) {
        if ('+-×÷^%'.includes(input)) {
            currentValue = resultDisplay.value.replace(/,/g, '');  
            shouldResetDisplay = false;
        } else if (input === '√') {
            currentValue = '√' + resultDisplay.value.replace(/,/g, '');  
            updateDisplay();
            hasEvaluated = false;
            return;
        } else if (input === '!') {
            currentValue = resultDisplay.value + '!';
            updateDisplay();
            hasEvaluated = false;
            return;
        } else {
            clearAll();
        }
        hasEvaluated = false;
    }

    if (shouldResetDisplay && !isNaN(input)) {
        currentValue = "";
        shouldResetDisplay = false;
    }
    
    if (!currentValue && '+-×÷^%!√'.includes(input)) {
        currentValue = "0";
    }
    
    if (resultDisplay.value && '+-×÷^%'.includes(input)) {
        shouldResetDisplay = false;
    }

    if (input === '()') {
        if (openParenCount > 0 && currentValue.split('(').length > currentValue.split(')').length) {
            currentValue += ')';
            openParenCount--;
        } else {
            currentValue += '(';
            openParenCount++;
        }
        updateDisplay();
        return;
    }

    if (input === '√') {
        currentValue = '√' + currentValue;
        updateDisplay();
        return;
    }

    if (input === '0') {
        if (currentValue.includes('.') || /[1-9]/.test(currentValue)) {
            currentValue += input;
        }
        updateDisplay();
        return;
    }

    if (currentValue === "" && input !== ".") {
        currentValue = input;
    } else {
        currentValue += input;
    }
    updateDisplay();
    
    operationDisplay.scrollLeft = operationDisplay.scrollWidth;
}

export function clearAll() {
    currentValue = "";
    previousValue = null;
    operator = null;
    openParenCount = 0;
    operationDisplay.value = "";
    resultDisplay.value = "0";
    resultDisplay.style.fontSize = initialResultFontSize;
    hasEvaluated = false;  
    
    const clearBtn = document.getElementById('clearBtn');
    clearBtn.textContent = 'AC';
}

export function clearOne() {
    if (hasEvaluated) {  
        clearAll();
        return;
    }
    
    if (currentValue.length > 0) {
        const lastChar = currentValue[currentValue.length - 1];
        if (lastChar === '(') {
            openParenCount--;
        }
        else if (lastChar === ')') {
            openParenCount++;
        }
        currentValue = currentValue.slice(0, -1);
        
        const clearBtn = document.getElementById('clearBtn');
        if (currentValue === "") {
            clearBtn.textContent = 'AC';
            resultDisplay.style.fontSize = initialResultFontSize;
            resultDisplay.value = "0";
        }
        
        updateDisplay();
    }
}

export function toggleSign() {
    if (hasEvaluated) {
        currentValue = resultDisplay.value;
        hasEvaluated = false;
    }

    if (currentValue.startsWith('-')) {
        currentValue = currentValue.substring(1);
    } else {
        currentValue = '-' + currentValue;
    }

    if (currentValue === '') {
        const clearBtn = document.getElementById('clearBtn');
        clearBtn.textContent = 'AC';
        clearBtn.onclick = clearAll;
        resultDisplay.value = "0";
    } else {
        updateDisplay();
    }
}

function formatNumber(number) {
    if (typeof number !== 'number' || !isFinite(number)) return number;
    
    const parts = number.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

function adjustResultFontSize(text) {
    if (text.length === 1 || (text.length === 2 && text.startsWith('-'))) {
        resultDisplay.style.fontSize = initialResultFontSize;
        return;
    }

    const display = resultDisplay;
    const container = display.parentElement;
    const padding = 30;
    const containerWidth = container.clientWidth - padding;
    
    let fontSize = parseFloat(initialResultFontSize);
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.fontFamily = window.getComputedStyle(display).fontFamily;
    tempSpan.style.padding = '0 5px';
    document.body.appendChild(tempSpan);
    
    let min = 12;
    let max = fontSize;
    
    while (min <= max) {
        fontSize = (min + max) / 2;
        tempSpan.style.fontSize = `${fontSize}px`;
        tempSpan.textContent = text;
        
        if (tempSpan.offsetWidth * 1.02 <= containerWidth) {
            min = fontSize + 0.5;
        } else {
            max = fontSize - 0.5;
        }
    }
    
    document.body.removeChild(tempSpan);
    const finalSize = Math.min(parseFloat(initialResultFontSize), Math.floor(max * 0.98));
    display.style.fontSize = `${finalSize}px`;
}

export function calculate() {
    if (!currentValue) return;
    
    try {
        const cleanExpression = currentValue.replace(/,/g, '');
        const result = calculateExpression(cleanExpression);
        if (result === "ERROR") {
            resultDisplay.value = "ERROR";
            resultDisplay.style.fontSize = initialResultFontSize;
            return;
        }
        
        const formattedResult = formatNumber(parseFloat(result));
        resultDisplay.value = formattedResult;
        adjustResultFontSize(formattedResult);
        currentValue = result.toString(); 
        hasEvaluated = true;
    } catch (e) {
        resultDisplay.value = "ERROR";
        resultDisplay.style.fontSize = initialResultFontSize;
    }
}

function getCharacterWidths(text, element) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const computedStyle = window.getComputedStyle(element);
    context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
    
    return text.split('').map(char => context.measureText(char).width);
}

function updateDisplay() {
    const displayWidth = operationDisplay.clientWidth;
    if (!currentValue) {
        operationDisplay.value = "";
        resultDisplay.value = "0";
        return;
    }

    const charWidths = getCharacterWidths(currentValue, operationDisplay);
    let totalWidth = 0;
    let visibleChars = 0;
    
    for (let i = charWidths.length - 1; i >= 0; i--) {
        totalWidth += charWidths[i];
        if (totalWidth > displayWidth) break;
        visibleChars++;
    }
    
    operationDisplay.value = currentValue.slice(-visibleChars);
    resultDisplay.value = "";
    
    const clearBtn = document.getElementById('clearBtn');
    clearBtn.textContent = currentValue ? 'C' : 'AC';
}