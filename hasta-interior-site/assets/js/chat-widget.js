/* ====================================================
   Hasta Interior Studio – Lead Capture Chat Widget
   Rule-based chatbot + WhatsApp redirect
   ==================================================== */
(function () {
    'use strict';

    var WA_NUMBER = '917904123120';
    var WA_BASE   = 'https://wa.me/' + WA_NUMBER;

    /* ── Lead data store ── */
    var lead = { name: '', phone: '', project: '', message: '' };

    /* ── Conversational steps ── */
    var STEP = {
        WELCOME    : 'welcome',
        CHOICE     : 'choice',
        COLLECT    : 'collect',
        DONE       : 'done'
    };
    var currentStep = STEP.WELCOME;
    var collectStage = 0;  // 0=name 1=phone 2=project 3=message
    var chosenOption = '';

    /* ──────────────────────────────────────────────
       BUILD THE WIDGET SCAFFOLD
    ─────────────────────────────────────────────── */
    function buildWidget() {
        // Remove old WA float buttons (we replace them)
        var oldBtns = document.querySelectorAll('.whatsapp-float, #whatsapp-float-btn');
        oldBtns.forEach(function(el){ el.remove(); });

        // ── Chat stack (bottom-right)
        var stack = document.createElement('div');
        stack.className = 'hasta-widget-stack';
        stack.id = 'hasta-widget-stack';
        stack.innerHTML = [
            /* --- Chat panel --- */
            '<div class="hw-chat-panel" id="hw-chat-panel" role="dialog" aria-label="Chat with us" aria-hidden="true">',
            '  <div class="hw-panel-head">',
            '    <div class="hw-avatar">',
            '      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a3 3 0 110 6 3 3 0 010-6zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08A7.2 7.2 0 0112 19.2z"/></svg>',
            '    </div>',
            '    <div class="hw-head-text">',
            '      <h5>Hasta Interior Studio <span class="hw-online-dot"></span></h5>',
            '      <p>Typically replies in minutes</p>',
            '    </div>',
            '  </div>',
            '  <div class="hw-panel-body" id="hw-panel-body"></div>',
            '  <div class="hw-panel-footer">',
            '    Powered by <a href="https://wa.me/' + WA_NUMBER + '" target="_blank">WhatsApp</a>',
            '  </div>',
            '</div>',

            /* --- Chat trigger button --- */
            '<button class="hw-chat-trigger" id="hw-chat-trigger" aria-label="Open chat" aria-expanded="false">',
            '  <svg class="hw-icon-chat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>',
            '  <svg class="hw-icon-close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
            '  <span class="hw-dot" id="hw-dot"></span>',
            '</button>'
        ].join('');

        document.body.appendChild(stack);
        document.getElementById('hw-chat-trigger').addEventListener('click', toggleChat);

        // ── WhatsApp standalone button (left-center)
        var waBtn = document.createElement('a');
        waBtn.href = WA_BASE + '?text=Hi%2C%20I%E2%80%99m%20interested%20in%20your%20interior%20design%20services.';
        waBtn.className = 'hw-wa-btn';
        waBtn.id = 'hw-wa-btn';
        waBtn.target = '_blank';
        waBtn.rel = 'noopener';
        waBtn.setAttribute('aria-label', 'Chat on WhatsApp');
        waBtn.innerHTML = [
            '<span class="hw-wa-tip">WhatsApp Us</span>',
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>'
        ].join('');
        document.body.appendChild(waBtn);
    }

    /* ──────────────────────────────────────────────
       TOGGLE CHAT
    ─────────────────────────────────────────────── */
    function toggleChat() {
        var panel   = document.getElementById('hw-chat-panel');
        var trigger = document.getElementById('hw-chat-trigger');
        var dot     = document.getElementById('hw-dot');
        var isOpen  = panel.classList.contains('is-open');

        if (isOpen) {
            panel.classList.remove('is-open');
            panel.setAttribute('aria-hidden', 'true');
            trigger.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
        } else {
            panel.classList.add('is-open');
            panel.setAttribute('aria-hidden', 'false');
            trigger.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
            if (dot) dot.remove();  // remove notification dot once opened
            if (currentStep === STEP.WELCOME) startConversation();
        }
    }

    /* ──────────────────────────────────────────────
       CONVERSATION ENGINE
    ─────────────────────────────────────────────── */
    function startConversation() {
        currentStep = STEP.CHOICE;
        addBotBubble('👋 Hi there! Welcome to <strong>Hasta Interior Studio</strong>.');
        delay(700, function(){
            addBotBubble('How can we help you today?');
        });
        delay(1300, function(){
            addChips([
                { label: '🏠 Get a Quote',         value: 'quote' },
                { label: '📅 Book a Consultation', value: 'consult' },
                { label: '💬 Ask a Question',      value: 'question' }
            ], handleOptionChoice);
        });
    }

    function handleOptionChoice(val) {
        chosenOption = val;
        var labels = { quote: 'Get a Quote', consult: 'Book a Consultation', question: 'Ask a Question' };
        addUserBubble(labels[val]);
        removeChips();
        delay(600, function(){
            addBotBubble('Great choice! Let me collect a few details so we can get back to you. 🙂');
        });
        delay(1200, function(){
            collectStage = 0;
            currentStep  = STEP.COLLECT;
            askCollect();
        });
    }

    var collectQuestions = [
        { key: 'name',    prompt: 'What\'s your <strong>name</strong>?',         placeholder: 'e.g. Rajesh Kumar',           type: 'text' },
        { key: 'phone',   prompt: 'Your <strong>phone number</strong>?',          placeholder: '+91 98765 43210',             type: 'tel'  },
        { key: 'project', prompt: 'What\'s your <strong>project type</strong>?',  placeholder: 'e.g. Residential, Kitchen…',  type: 'text' },
        { key: 'message', prompt: 'Briefly describe your <strong>requirements</strong>:', placeholder: 'Tell us more…',        type: 'textarea' }
    ];

    function askCollect() {
        if (collectStage >= collectQuestions.length) {
            showSubmit();
            return;
        }
        var q = collectQuestions[collectStage];
        delay(300, function(){
            addBotBubble(q.prompt);
            delay(400, function(){
                addInputField(q.type, q.placeholder, function(val){
                    lead[q.key] = val;
                    addUserBubble(val);
                    collectStage++;
                    askCollect();
                });
            });
        });
    }

    function showSubmit() {
        currentStep = STEP.DONE;
        delay(400, function(){
            addBotBubble('Perfect! Here\'s a summary of your request:');
        });
        delay(900, function(){
            var summary = '📋 <strong>' + esc(lead.name) + '</strong><br>' +
                          '📞 ' + esc(lead.phone) + '<br>' +
                          '🏗️ ' + esc(lead.project) + '<br>' +
                          '💬 ' + esc(lead.message);
            addBotBubble(summary);
        });
        delay(1500, function(){
            addBotBubble('Click below to send this directly on WhatsApp and our team will contact you shortly! 🚀');
            delay(400, addSendButton);
        });
    }

    function handleSend() {
        var optionLabel = { quote: 'Get a Quote', consult: 'Book a Consultation', question: 'Ask a Question' }[chosenOption] || 'Enquiry';
        var msg = 'Hi, I\'m ' + lead.name + '. I\'m interested in *' + lead.project + '*. My requirement: ' + lead.message + '. Please contact me at ' + lead.phone + '.';
        var url = WA_BASE + '?text=' + encodeURIComponent(msg);
        window.open(url, '_blank');
        removeSendButton();
        delay(300, function(){
            addBotBubble('✅ Opening WhatsApp… We\'ll get back to you soon!');
        });
        delay(1000, function(){
            addChips([{ label: '🔄 Start Over', value: 'reset' }], function(){
                resetChat();
            });
        });
    }

    function resetChat() {
        lead         = { name: '', phone: '', project: '', message: '' };
        collectStage = 0;
        chosenOption = '';
        currentStep  = STEP.WELCOME;
        var body = document.getElementById('hw-panel-body');
        if (body) body.innerHTML = '';
        startConversation();
    }

    /* ──────────────────────────────────────────────
       DOM HELPERS
    ─────────────────────────────────────────────── */
    function body() { return document.getElementById('hw-panel-body'); }

    function addBotBubble(html) {
        var el = document.createElement('div');
        el.className = 'hw-bubble';
        el.innerHTML = html;
        body().appendChild(el);
        scrollBottom();
    }

    function addUserBubble(text) {
        var el = document.createElement('div');
        el.className = 'hw-bubble user-msg';
        el.textContent = text;
        body().appendChild(el);
        scrollBottom();
    }

    function addChips(options, callback) {
        var wrap = document.createElement('div');
        wrap.className = 'hw-chips';
        wrap.id = 'hw-chips';
        options.forEach(function(opt){
            var btn = document.createElement('button');
            btn.className = 'hw-chip';
            btn.textContent = opt.label;
            btn.addEventListener('click', function(){
                callback(opt.value);
            });
            wrap.appendChild(btn);
        });
        body().appendChild(wrap);
        scrollBottom();
    }

    function removeChips() {
        var el = document.getElementById('hw-chips');
        if (el) el.remove();
    }

    function addInputField(type, placeholder, onEnter) {
        var wrap = document.createElement('div');
        wrap.className = 'hw-input-row';
        wrap.id = 'hw-input-row';

        var field;
        if (type === 'textarea') {
            field = document.createElement('textarea');
            field.rows = 3;
        } else {
            field = document.createElement('input');
            field.type = type;
        }
        field.placeholder = placeholder;
        field.id = 'hw-field';

        var btn = document.createElement('button');
        btn.className = 'hw-submit-btn';
        btn.textContent = 'Continue →';
        btn.type = 'button';

        btn.addEventListener('click', function(){
            var val = field.value.trim();
            if (!val) { field.style.borderColor = '#e84c4c'; field.focus(); return; }
            wrap.remove();
            onEnter(val);
        });

        // Allow Enter key on inputs (not textarea)
        if (type !== 'textarea') {
            field.addEventListener('keydown', function(e){
                if (e.key === 'Enter') btn.click();
            });
        }

        wrap.appendChild(field);
        wrap.appendChild(btn);
        body().appendChild(wrap);
        field.focus();
        scrollBottom();
    }

    function addSendButton() {
        var btn = document.createElement('button');
        btn.className = 'hw-submit-btn';
        btn.id = 'hw-send-btn';
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width:14px;height:14px;fill:#fff;margin-right:6px;vertical-align:middle"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg> Send on WhatsApp';
        btn.addEventListener('click', handleSend);
        body().appendChild(btn);
        scrollBottom();
    }

    function removeSendButton() {
        var btn = document.getElementById('hw-send-btn');
        if (btn) btn.remove();
    }

    function scrollBottom() {
        var b = body();
        if (b) b.scrollTop = b.scrollHeight;
    }

    function delay(ms, fn) { setTimeout(fn, ms); }

    function esc(str) {
        var d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    /* ── Boot ── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildWidget);
    } else {
        buildWidget();
    }
})();
