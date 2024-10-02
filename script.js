const display = document.getElementById("display");

let flag = false;

function factorial(n) {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

function sqrt(n) {
    return Math.sqrt(n);
}

function evaluateExpression(expr) {
    expr = expr.replace(/÷/g, '/')
               .replace(/×/g, '*')
               .replace(/√\(([^)]+)\)/g, (match, inside) => `Math.sqrt(${inside})`)
               .replace(/√(\d+)/g, (match, num) => `Math.sqrt(${num})`)
               .replace(/π/g, 'Math.PI')
               .replace(/(\d+)!/g, (match, num) => factorial(parseInt(num)))
               .replace(/\^/g, '**');

    try {
        let result = eval(expr);
        return parseFloat(result.toFixed(5));
    } catch (error) {
        return 'ERROR';
    }
}

function appendToDisplay(input){
    if (flag == true){
        flag = false;
        clearDisplay();
    }
    display.value += input;
}

function clearDisplay(){
    display.value = '';
}

function calculate(){
    display.value = evaluateExpression(display.value);
    flag = true;
}