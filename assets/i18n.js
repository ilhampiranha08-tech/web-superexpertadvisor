/**
 * Super Modular I18n Core Engine
 * Ilham Sugiri Software Lab
 *
 * Lightweight, zero-dependency translation engine.
 * Translations are loaded dynamically or statically via module files in assets/i18n/.
 */

(function() {
    window.I18N_DICTIONARY = window.I18N_DICTIONARY || {
        en: {},
        id: {},
        es: {},
        pt: {},
        ru: {},
        hi: {}
    };

    /**
     * Register a translation module into the global dictionary
     */
    window.registerI18nModule = function(moduleData) {
        if (!moduleData) return;
        ['en', 'id', 'es', 'pt', 'ru', 'hi'].forEach(lang => {
            if (moduleData[lang]) {
                window.I18N_DICTIONARY[lang] = Object.assign(window.I18N_DICTIONARY[lang] || {}, moduleData[lang]);
            }
        });

        // Re-apply translation if DOM is already ready
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            const activeLang = document.documentElement.lang || detectPreferredLanguage();
            applyDomTranslations(activeLang);
        }
    };

    // Drain any modules that loaded before this engine
    if (window.__i18n_pending && Array.isArray(window.__i18n_pending)) {
        window.__i18n_pending.forEach(window.registerI18nModule);
        window.__i18n_pending = [];
    }

    /**
     * Apply translations to the DOM
     */
    function applyDomTranslations(lang) {
        const dict = window.I18N_DICTIONARY[lang];
        if (!dict) return;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key] !== undefined) {
                el.innerHTML = dict[key];
            }
        });
    }

    /**
     * Switch active language
     */
    window.setLanguage = function(lang) {
        if (!window.I18N_DICTIONARY[lang]) {
            lang = 'en';
        }

        try {
            localStorage.setItem('preferred_lang', lang);
        } catch (e) {
            // LocalStorage fallback
        }

        document.documentElement.lang = lang;

        // Update switcher button label
        const labelEl = document.getElementById('currentLangLabel');
        if (labelEl) {
            labelEl.textContent = lang.toUpperCase();
        }

        // Update active dropdown item
        document.querySelectorAll('.lang-option').forEach(el => {
            el.classList.remove('active');
        });
        const activeOpt = document.getElementById('opt-' + lang);
        if (activeOpt) {
            activeOpt.classList.add('active');
        }

        // Translate all DOM elements with data-i18n
        applyDomTranslations(lang);

        // Close dropdown
        closeLangDropdown();
    };

    /**
     * Dropdown Toggle Controls
     */
    window.toggleLangDropdown = function(event) {
        if (event) event.stopPropagation();
        const dropdown = document.getElementById('langDropdown');
        const btn = document.getElementById('langBtn');
        if (dropdown) {
            dropdown.classList.toggle('show');
            if (btn) btn.classList.toggle('open');
        }
    };

    window.closeLangDropdown = function() {
        const dropdown = document.getElementById('langDropdown');
        const btn = document.getElementById('langBtn');
        if (dropdown) dropdown.classList.remove('show');
        if (btn) btn.classList.remove('open');
    };

    // Global click & keyboard listeners
    document.addEventListener('click', (e) => {
        const wrapper = document.querySelector('.lang-switch-wrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            closeLangDropdown();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLangDropdown();
        }
    });

    /**
     * Detect user's preferred language automatically
     */
    window.detectPreferredLanguage = function() {
        try {
            const savedLang = localStorage.getItem('preferred_lang');
            if (savedLang && window.I18N_DICTIONARY[savedLang]) {
                return savedLang;
            }
        } catch (e) {
            // LocalStorage fallback
        }

        const candidateLanguages = navigator.languages || [navigator.language || navigator.userLanguage || ''];
        for (const rawLang of candidateLanguages) {
            if (!rawLang) continue;
            const code = rawLang.toLowerCase().trim();
            if (code.startsWith('id') || code.startsWith('in')) return 'id';
            if (code.startsWith('es')) return 'es';
            if (code.startsWith('pt')) return 'pt';
            if (code.startsWith('ru')) return 'ru';
            if (code.startsWith('hi')) return 'hi';
            if (code.startsWith('en')) return 'en';
        }

        return 'en';
    };

    // Auto-initialize on load
    document.addEventListener('DOMContentLoaded', () => {
        const initialLang = detectPreferredLanguage();
        setLanguage(initialLang);
    });
})();
