export function factorial(n) {
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

export function power(base, exponent) {
    if (base === 0 && exponent <= 0) return "ERROR";
    if (base < 0 && !Number.isInteger(exponent)) return "ERROR";
    
    const result = Math.pow(base, exponent);
    
    if (!isFinite(result) || isNaN(result)) return "ERROR";
    
    return result;
}

export function parseNumber(str) {
    return parseFloat(str);
}

export function splitExpression(expr) {
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

export function calculateExpression(expr) {
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
            if (result === "ERROR") return "ERROR";
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
