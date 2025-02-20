function isMobileDevice() {
    const mobilePhonePatterns = [
        /(?!.*tablet).*android.*mobile/i,  
        /iPhone/i,                        
        /iPod/i,                          
        /webOS/i,                         
        /BlackBerry/i,                    
        /Windows Phone/i,                 
        /Opera Mini/i,                    
        /IEMobile/i                       
    ];

    const userAgent = navigator.userAgent;

    const isMobilePhone = mobilePhonePatterns.some(pattern => pattern.test(userAgent));

    const hasMobileDimensions = window.matchMedia(
        '(max-width: 767px) and (max-height: 1024px) and (orientation: portrait), ' +
        '(max-width: 1024px) and (max-height: 767px) and (orientation: landscape)'
    ).matches;

    return isMobilePhone && hasMobileDimensions;
}

function checkDevice() {
    const calculator = document.getElementById('calculator');
    let overlay = document.getElementById('device-overlay');
    
    if (!isMobileDevice()) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'device-overlay';
            overlay.textContent = 'This app is not compatible with your device.';
            document.body.appendChild(overlay);
        }
        calculator.style.display = 'none';
        overlay.style.display = 'flex';
    } else {
        if (overlay) {
            overlay.style.display = 'none';
        }
        calculator.style.display = 'flex';
    }
}

window.addEventListener('load', checkDevice);
window.addEventListener('resize', checkDevice);

const operationDisplay = document.getElementById("operationDisplay");
const resultDisplay = document.getElementById("resultDisplay");
let currentValue = "";  
let previousValue = null;
let operator = null;
let shouldResetDisplay = false;
let openParenCount = 0;
let hasEvaluated = false;

const DEFAULT_FONT_SIZE = 4.5;

let initialFontSize;

window.addEventListener('load', () => {
    checkDevice();
    initialFontSize = window.getComputedStyle(resultDisplay).fontSize;
});

function getTextWidth(text, font) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
}

function adjustResultDisplaySize(text) {
    if (!text) return;
    
    const display = resultDisplay;
    const container = display.parentElement;
    const containerWidth = container.clientWidth - 40; 
    const computedStyle = window.getComputedStyle(display);
    let fontSize = 4.5; 
    
    while (fontSize > 1.5) {
        const font = `${fontSize}rem -apple-system, BlinkMacSystemFont, sans-serif`;
        const textWidth = getTextWidth(text, font);
        
        if (textWidth <= containerWidth) {
            break;
        }
        fontSize -= 0.1;
    }
    
    display.style.fontSize = `${Math.max(1.5, fontSize)}rem`;
}

function factorial(n) {
    n = parseFloat(n);
    
    if (!Number.isInteger(n)) return "ERROR";
    if (n < 0) return "ERROR";
    if (n === 0 || n === 1) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
        if (!isFinite(result)) return "ERROR";
    }
    return result;
}

function power(base, exponent) {
    return Math.pow(base, exponent);
}

function parseNumber(str) {
    if (str.includes('π')) {
        const parts = str.split('π');
        const beforePi = parts[0] ? parseFloat(parts[0]) : 1;
        const afterPi = parts[1] ? parseFloat(parts[1]) : 1;
        return beforePi * Math.PI * afterPi;
    }
    return parseFloat(str);
}

function splitExpression(expr) {
    const tokens = [];
    let number = '';
    
    for (let i = 0; i < expr.length; i++) {
        const char = expr[i];
        if (char === '-' && (i === 0 || '+-×÷^(%'.includes(expr[i-1]))) {
            number = '-';
            continue;
        }
        if ('0123456789.'.includes(char)) {
            number += char;
        } else if (char === 'π') {
            if (number) {
                number += 'π';
            } else if (i < expr.length - 1 && '0123456789'.includes(expr[i + 1])) {
                number = 'π';
            } else {
                tokens.push('π');
            }
        } else if (char === '√') {
            if (number) {
                tokens.push(number);
                number = '';
            }
            let restOfExpression = expr.slice(i + 1);
            let nextOperatorIndex = restOfExpression.search(/[+\-×÷^%]/);
            if (nextOperatorIndex === -1) nextOperatorIndex = restOfExpression.length;
            tokens.push('√' + restOfExpression.slice(0, nextOperatorIndex));
            i += nextOperatorIndex;
        } else if (char === '!') {  
            if (number) {
                tokens.push(number + '!');
                number = '';
            } else if (tokens.length > 0) {
                tokens[tokens.length - 1] += '!';
            }
        } else if ('+-×÷^%'.includes(char)) {
            if (number) {
                tokens.push(number);
                number = '';
            }
            if (tokens.length > 0 && '+-×÷^%'.includes(tokens[tokens.length - 1])) {
                continue;
            }
            tokens.push(char);
        }
    }
    if (number) tokens.push(number);
    return tokens;
}

function calculateExpression(expr) {
    expr = expr.trim().replace(/\s+/g, '');
    
    while (expr.includes('(')) {
        const lastOpenParen = expr.lastIndexOf('(');
        const nextCloseParen = expr.indexOf(')', lastOpenParen);
        if (nextCloseParen === -1) break;
        
        const subExpr = expr.substring(lastOpenParen + 1, nextCloseParen);
        const result = calculateExpression(subExpr);
        expr = expr.substring(0, lastOpenParen) + result + expr.substring(nextCloseParen + 1);
    }

    const tokens = splitExpression(expr);
    
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].startsWith('√')) {
            const num = parseNumber(tokens[i].substring(1));
            tokens[i] = Math.sqrt(num).toString();
        } else if (tokens[i].endsWith('!')) {
            const num = parseNumber(tokens[i].slice(0, -1));
            tokens[i] = factorial(num).toString();
        }
    }

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '%') {
            const num1 = parseNumber(tokens[i-1]);
            const result = num1 / 100;
            
            if (i + 1 < tokens.length && !isNaN(parseNumber(tokens[i+1]))) {
                const nextNum = parseNumber(tokens[i+1]);
                tokens.splice(i-1, 3, (result * nextNum).toString());
            } else {
                tokens.splice(i-1, 2, result.toString());
            }
            i--;
        }
    }

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '^') {
            const result = power(parseNumber(tokens[i-1]), parseNumber(tokens[i+1]));
            tokens.splice(i-1, 3, result.toString());
            i--;
        }
    }

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '×' || tokens[i] === '÷') {
            const num1 = parseNumber(tokens[i-1]);
            const num2 = parseNumber(tokens[i+1]);
            const result = tokens[i] === '×' ? num1 * num2 : 
                          (num2 === 0 ? "ERROR" : num1 / num2);
            if (result === "ERROR") return "ERROR";
            tokens.splice(i-1, 3, result.toString());
            i--;
        }
    }

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === '+' || tokens[i] === '-') {
            const num1 = parseNumber(tokens[i-1] || '0'); 
            const num2 = parseNumber(tokens[i+1]);
            const result = tokens[i] === '+' ? num1 + num2 : num1 - num2;
            tokens.splice(i-1 || 0, tokens[i-1] ? 3 : 2, result.toString());
            i--;
        }
    }

    return tokens[0];
}

function appendToDisplay(input) {
    if (hasEvaluated && !'+-×÷^%'.includes(input)) {
        clearAll();
    }
    hasEvaluated = false;  

    if (shouldResetDisplay && !isNaN(input)) {
        currentValue = "";
        shouldResetDisplay = false;
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

    if (input === 'pi' || input === 'π') {
        currentValue = currentValue + 'π';
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

function clearAll() {
    currentValue = "";
    previousValue = null;
    operator = null;
    openParenCount = 0;
    operationDisplay.value = "";
    resultDisplay.value = "0";
    hasEvaluated = false;  
    
    const clearBtn = document.getElementById('clearBtn');
    clearBtn.textContent = 'AC';
    resultDisplay.style.fontSize = initialFontSize;
}

function clearOne() {
    if (hasEvaluated) {  
        clearAll();
        return;
    }
    
    if (currentValue.length > 0) {
        if (currentValue[currentValue.length - 1] === '(') {
            openParenCount--;
        }
        else if (currentValue[currentValue.length - 1] === ')') {
            openParenCount++;
        }
        currentValue = currentValue.slice(0, -1);
        updateDisplay();
        
        const clearBtn = document.getElementById('clearBtn');
        if (currentValue === "") {
            clearBtn.textContent = 'AC';
            clearBtn.onclick = clearAll;
        }
    }
}

function toggleSign() {
    if (currentValue.startsWith('-')) {
        currentValue = currentValue.substring(1);

        if (currentValue === '') {
            const clearBtn = document.getElementById('clearBtn');
            clearBtn.textContent = 'AC';
            clearBtn.onclick = clearAll;
        }
    } else {
        currentValue = '-' + currentValue;
    }
    updateDisplay();
}

function formatNumber(number) {
    if (typeof number !== 'number' || !isFinite(number)) return number;
    
    const parts = number.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

function calculate() {
    if (!currentValue) return;
    
    try {
        const result = calculateExpression(currentValue);
        if (result === "ERROR") {
            resultDisplay.value = "ERROR";
            resultDisplay.style.fontSize = initialFontSize;
            return;
        }
        
        const formattedResult = formatNumber(parseFloat(result));
        resultDisplay.value = formattedResult;
        adjustResultDisplaySize(formattedResult);
        currentValue = result.toString(); 
        hasEvaluated = true;
    } catch (e) {
        resultDisplay.value = "ERROR";
        resultDisplay.style.fontSize = initialFontSize;
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
    clearBtn.onclick = currentValue ? clearOne : clearAll;
}