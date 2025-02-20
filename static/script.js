const operationDisplay = document.getElementById("operationDisplay");
const resultDisplay = document.getElementById("resultDisplay");
let currentValue = "";  
let previousValue = null;
let operator = null;
let shouldResetDisplay = false;
let openParenCount = 0;
let hasEvaluated = false;

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
            tokens.push(char + (expr[i + 1] || ''));
            i++;
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
    resultDisplay.value = "";
    hasEvaluated = false;  
    
    const clearBtn = document.getElementById('clearBtn');
    clearBtn.textContent = 'AC';
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

function calculate() {
    if (!currentValue) return;
    
    try {
        const result = calculateExpression(currentValue);
        if (result === "ERROR") {
            resultDisplay.value = "ERROR";
            return;
        }
        
        resultDisplay.value = result;
        currentValue = result.toString();
        hasEvaluated = true;  
    } catch (e) {
        resultDisplay.value = "ERROR";
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
        resultDisplay.value = "";
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
    clearBtn.textContent = currentValue ? '⌧' : 'AC';
    clearBtn.onclick = currentValue ? clearOne : clearAll;
}