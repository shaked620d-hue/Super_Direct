const initializeAccessibilityWidget = () => {
    if (document.getElementById('accessibilityWidget')) return;

    const allowedTextScales = [100, 112.5, 125];
    const savedTextScale = Number(localStorage.getItem('superDirectAccessibilityTextScale'));
    let textScale = allowedTextScales.includes(savedTextScale) ? savedTextScale : 100;
    let highContrast = localStorage.getItem('superDirectAccessibilityHighContrast') === 'true';

    const widget = document.createElement('aside');
    widget.id = 'accessibilityWidget';
    widget.className = 'accessibility-widget';
    widget.setAttribute('aria-label', 'כלי נגישות');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'accessibility-toggle';
    toggle.textContent = '♿ נגישות';
    toggle.setAttribute('aria-label', 'פתיחת תפריט נגישות');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'accessibilityPanel');

    const panel = document.createElement('section');
    panel.id = 'accessibilityPanel';
    panel.className = 'accessibility-panel';
    panel.setAttribute('aria-labelledby', 'accessibilityTitle');
    panel.hidden = true;

    const title = document.createElement('h2');
    title.id = 'accessibilityTitle';
    title.textContent = 'אפשרויות נגישות';

    const textControls = document.createElement('div');
    textControls.className = 'accessibility-text-controls';

    const decreaseText = document.createElement('button');
    decreaseText.type = 'button';
    decreaseText.textContent = 'הקטנת טקסט';

    const increaseText = document.createElement('button');
    increaseText.type = 'button';
    increaseText.textContent = 'הגדלת טקסט';

    const textSize = document.createElement('p');
    textSize.className = 'accessibility-text-size';
    textSize.setAttribute('aria-live', 'polite');

    const resetText = document.createElement('button');
    resetText.type = 'button';
    resetText.className = 'accessibility-reset';
    resetText.textContent = 'איפוס גודל טקסט';

    const contrast = document.createElement('button');
    contrast.type = 'button';
    contrast.className = 'accessibility-contrast';
    contrast.textContent = 'ניגודיות גבוהה';

    textControls.append(decreaseText, increaseText);
    panel.append(title, textControls, textSize, resetText, contrast);
    widget.append(toggle, panel);
    document.body.append(widget);

    const updateTextSize = () => {
        document.documentElement.style.fontSize = `${textScale}%`;
        textSize.textContent = `גודל הטקסט: ${textScale}%`;
        decreaseText.disabled = textScale === allowedTextScales[0];
        increaseText.disabled = textScale === allowedTextScales[allowedTextScales.length - 1];
        localStorage.setItem('superDirectAccessibilityTextScale', String(textScale));
    };

    const updateContrast = () => {
        document.body.classList.toggle('high-contrast', highContrast);
        contrast.setAttribute('aria-pressed', String(highContrast));
        localStorage.setItem('superDirectAccessibilityHighContrast', String(highContrast));
    };

    const closePanel = (returnFocus = false) => {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'פתיחת תפריט נגישות');
        if (returnFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => {
        const isOpening = panel.hidden;
        panel.hidden = !isOpening;
        toggle.setAttribute('aria-expanded', String(isOpening));
        toggle.setAttribute('aria-label', isOpening ? 'סגירת תפריט נגישות' : 'פתיחת תפריט נגישות');
        if (isOpening) {
            panel.querySelector('button:not(:disabled)').focus();
        }
    });

    decreaseText.addEventListener('click', () => {
        const currentIndex = allowedTextScales.indexOf(textScale);
        if (currentIndex > 0) {
            textScale = allowedTextScales[currentIndex - 1];
            updateTextSize();
        }
    });

    increaseText.addEventListener('click', () => {
        const currentIndex = allowedTextScales.indexOf(textScale);
        if (currentIndex < allowedTextScales.length - 1) {
            textScale = allowedTextScales[currentIndex + 1];
            updateTextSize();
        }
    });

    resetText.addEventListener('click', () => {
        textScale = allowedTextScales[0];
        updateTextSize();
    });

    contrast.addEventListener('click', () => {
        highContrast = !highContrast;
        updateContrast();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) closePanel(true);
    });

    document.addEventListener('click', (event) => {
        if (!panel.hidden && !widget.contains(event.target)) closePanel();
    });

    updateTextSize();
    updateContrast();
};

document.addEventListener('DOMContentLoaded', initializeAccessibilityWidget);
