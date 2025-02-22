class CalculatorLayout {
    constructor() {
        this.calculator = document.getElementById('calculator');
        this.createCalculatorElements();
        this.setupLayout();
        
        window.addEventListener('resize', () => this.setupLayout());
        window.addEventListener('orientationchange', () => this.setupLayout());

        this.initializeFontSize();
        document.dispatchEvent(new CustomEvent('calculator-ready'));
    }

    createCalculatorElements() {
        this.display = document.createElement('div');
        this.display.id = 'display-container';
        
        this.operationDisplay = document.createElement('input');
        this.operationDisplay.id = 'operationDisplay';
        this.operationDisplay.readOnly = true;
        this.operationDisplay.value = '';
        
        this.resultDisplay = document.createElement('input');
        this.resultDisplay.id = 'resultDisplay';
        this.resultDisplay.readOnly = true;
        this.resultDisplay.value = '0';
        
        [this.operationDisplay, this.resultDisplay].forEach(input => {
            input.oncopy = input.onpaste = input.oncut = () => false;
        });

        this.display.appendChild(this.operationDisplay);
        this.display.appendChild(this.resultDisplay);

        this.keys = document.createElement('div');
        this.keys.id = 'keys';

        const buttonConfig = [
            { text: '√', action: '√', class: 'mod-btn' },
            { text: '( )', action: '()', class: 'mod-btn' },
            { text: 'xʸ', action: '^', class: 'mod-btn' },
            { text: '!', action: '!', class: 'operator-btn' },
            { text: 'AC', action: 'clear', class: 'mod-btn clear-btn', id: 'clearBtn' },
            { text: '+/-', action: 'sign', class: 'mod-btn' },
            { text: '%', action: '%', class: 'mod-btn' },
            { text: '÷', action: '÷', class: 'operator-btn' },
            { text: '7', action: '7' },
            { text: '8', action: '8' },
            { text: '9', action: '9' },
            { text: '×', action: '×', class: 'operator-btn' },
            { text: '4', action: '4' },
            { text: '5', action: '5' },
            { text: '6', action: '6' },
            { text: '−', action: '-', class: 'operator-btn' },
            { text: '1', action: '1' },
            { text: '2', action: '2' },
            { text: '3', action: '3' },
            { text: '+', action: '+', class: 'operator-btn' },
            { text: '0', action: '0' },
            { text: '.', action: '.' },
            { text: '=', action: 'calculate', class: 'operator-btn' }
        ];

        buttonConfig.forEach(config => {
            const button = document.createElement('button');
            button.textContent = config.text;
            button.setAttribute('data-action', config.action);
            if (config.class) button.className = config.class;
            if (config.id) button.id = config.id;
            this.keys.appendChild(button);
        });

        this.calculator.innerHTML = '';
        this.calculator.appendChild(this.display);
        this.calculator.appendChild(this.keys);

        this.buttons = this.keys.querySelectorAll('button');
    }

    setupLayout() {
        const isIPhone = /iPhone/.test(navigator.userAgent);
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const isLandscape = viewportWidth > viewportHeight;
        
        const topSafeArea = isIPhone ? (isLandscape ? 0 : 47) : 0;
        const bottomSafeArea = isIPhone ? 34 : 0;
        
        this.calculator.style.height = `${viewportHeight}px`;
        this.calculator.style.paddingTop = `${topSafeArea}px`;
        this.calculator.style.paddingBottom = `${bottomSafeArea}px`;
        
        const availableHeight = viewportHeight - topSafeArea - bottomSafeArea;
        const availableWidth = viewportWidth;
        
        const displayHeight = Math.floor(availableHeight * 0.25);
        this.display.style.height = `${displayHeight}px`;
        
        const operationDisplayHeight = Math.floor(displayHeight * 0.3);
        const resultDisplayHeight = Math.floor(displayHeight * 0.7);
        
        this.operationDisplay.style.height = `${operationDisplayHeight}px`;
        this.resultDisplay.style.height = `${resultDisplayHeight}px`;
        
        this.operationDisplay.style.fontSize = `${operationDisplayHeight * 0.6}px`;
        this.resultDisplay.style.fontSize = `${resultDisplayHeight * 0.6}px`;
        
        const keysHeight = availableHeight - displayHeight;
        this.keys.style.height = `${keysHeight}px`;
        
        const minGap = Math.min(
            Math.floor(keysHeight * 0.02),
            Math.floor(availableWidth * 0.02)
        );
        const gap = minGap;
        this.keys.style.gap = `${gap}px`;
        
        const maxButtonWidth = Math.min(100, Math.floor((availableWidth - gap * 5) / 4)); 
        const maxButtonHeight = Math.floor((keysHeight - gap * 6) / 6); 
        const buttonSize = Math.min(maxButtonWidth, maxButtonHeight);
        
        const totalGridWidth = buttonSize * 4 + gap * 3;
        const horizontalPadding = (availableWidth - totalGridWidth) / 2;
        
        this.keys.style.padding = `${gap}px ${horizontalPadding}px`;
        this.display.style.width = `${totalGridWidth}px`;
        this.display.style.padding = `0 ${gap}px`;
        
        this.buttons.forEach(button => {
            button.style.width = `${buttonSize}px`;
            button.style.height = `${buttonSize}px`;
            button.style.fontSize = `${buttonSize * 0.4}px`;
            
            if (button.textContent === '0') {
                button.style.width = `${buttonSize * 2 + gap}px`;
                button.style.gridColumn = 'span 2';
                button.style.borderRadius = `${buttonSize/2}px`;
            }
        });
    }

    initializeFontSize() {
        const resultDisplay = document.getElementById('resultDisplay');
        window.initialResultFontSize = window.getComputedStyle(resultDisplay).fontSize;
    }
}

window.CalculatorLayout = CalculatorLayout;

document.addEventListener('DOMContentLoaded', () => {
    new CalculatorLayout();
});
