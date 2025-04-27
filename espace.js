// État global
let currentExam = null;
let questions = [];
let currentQuestionType = 'direct';

// Sélectionneurs DOM
const DOM = {
    examTitle: document.getElementById('exam-title'),
    examDescription: document.getElementById('exam-description'),
    examAudience: document.getElementById('exam-audience'),
    examLink: document.getElementById('exam-link'),
    questionText: document.getElementById('question-text'),
    mediaUpload: document.getElementById('media-upload'),
    questionPoints: document.getElementById('question-points'),
    questionDuration: document.getElementById('question-duration'),
    directAnswer: document.getElementById('direct-answer'),
    tolerance: document.getElementById('tolerance'),
    optionsContainer: document.getElementById('options-container'),
    questionsList: document.getElementById('questions-list'),
    mediaPreview: document.getElementById('media-preview')
};

// Initialisation
function init() {
    // Gestionnaires d'événements
    document.querySelectorAll('.question-type-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleQuestionType(btn.dataset.type));
    });
    
    DOM.mediaUpload.addEventListener('change', handleMediaUpload);
}

// Création d'examen
function createExam() {
    const exam = {
        title: DOM.examTitle.value,
        description: DOM.examDescription.value,
        audience: DOM.examAudience.value,
        link: generateUniqueLink(),
        questions: []
    };
    
    currentExam = exam;
    DOM.examLink.innerHTML = 
        `<p class="exam-link__text">Lien d'accès : 
            <a href="${exam.link}" class="exam-link__url" target="_blank">${exam.link}</a>
        </p>`;
    DOM.examLink.classList.add('show');
}

function generateUniqueLink() {
    return `https://exam-platform.com/exam/${btoa(Date.now()).slice(-12)}`;
}

// Gestion des types de questions
function toggleQuestionType(type) {
    currentQuestionType = type;
    
    // Mise à jour des boutons
    document.querySelectorAll('.question-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
    
    // Affichage des formulaires
    document.querySelectorAll('.question-type-content').forEach(form => {
        form.hidden = form.id !== `${type}-form`;
    });
}

// Gestion des options QCM
function addOption() {
    const optionId = Date.now();
    const optionHTML = `
        <div class="option-item" data-option="${optionId}">
            <div class="option-item__controls">
                <input type="checkbox" 
                       id="option-${optionId}" 
                       class="option-item__checkbox">
                <label for="option-${optionId}" class="option-item__label"></label>
            </div>
            <input type="text" 
                   class="option-item__text form-control" 
                   placeholder="Texte de l'option">
            <button class="option-item__remove btn btn--danger" 
                    aria-label="Supprimer l'option">
                &times;
            </button>
        </div>
    `;
    
    DOM.optionsContainer.insertAdjacentHTML('beforeend', optionHTML);
    
    // Gestionnaire de suppression
    const newOption = DOM.optionsContainer.querySelector(`[data-option="${optionId}"]`);
    newOption.querySelector('.option-item__remove')
        .addEventListener('click', () => newOption.remove());
}

// Ajout de question
function addQuestion() {
    const question = {
        type: currentQuestionType,
        text: DOM.questionText.value,
        media: DOM.mediaUpload.files[0],
        points: parseFloat(DOM.questionPoints.value),
        duration: parseInt(DOM.questionDuration.value)
    };

    if (currentQuestionType === 'direct') {
        question.answer = DOM.directAnswer.value;
        question.tolerance = parseInt(DOM.tolerance.value);
    } else {
        question.options = Array.from(
            DOM.optionsContainer.querySelectorAll('.option-item')
        ).map(option => ({
            text: option.querySelector('.option-item__text').value,
            correct: option.querySelector('.option-item__checkbox').checked
        }));
    }

    questions.push(question);
    displayQuestions();
    clearQuestionForm();
}

// Affichage des questions
function displayQuestions() {
    DOM.questionsList.innerHTML = questions.map((q, index) => `
        <div class="questions-grid__item">
            <div class="question-card">
                <header class="question-card__header">
                    <span class="question-card__type">${q.type.toUpperCase()}</span>
                    <span class="question-card__points">${q.points} pts</span>
                </header>
                <div class="question-card__body">
                    <p class="question-card__text">${q.text}</p>
                    ${q.media ? `<div class="question-card__media">Fichier joint: ${q.media.name}</div>` : ''}
                </div>
                <footer class="question-card__footer">
                    <span class="question-card__duration">${q.duration}s</span>
                    <div class="question-card__actions">
                        <button class="btn btn--icon" data-action="edit" data-index="${index}">
                            <span aria-hidden="true">✏️</span>
                        </button>
                        <button class="btn btn--icon" data-action="delete" data-index="${index}">
                            <span aria-hidden="true">🗑️</span>
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    `).join('');
    
    // Ajout des gestionnaires d'événements
    DOM.questionsList.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', handleQuestionAction);
    });
}

// Gestion des actions
function handleQuestionAction(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const action = e.currentTarget.dataset.action;
    
    if (action === 'delete') {
        questions.splice(index, 1);
        displayQuestions();
    } else if (action === 'edit') {
        editQuestion(index);
    }
}

// Réinitialisation du formulaire
function clearQuestionForm() {
    DOM.questionText.value = '';
    DOM.mediaUpload.value = '';
    DOM.questionPoints.value = '';
    DOM.questionDuration.value = '';
    DOM.directAnswer.value = '';
    DOM.tolerance.value = '25';
    DOM.optionsContainer.innerHTML = '';
    DOM.mediaPreview.innerHTML = '';
}

// Gestion des médias
function handleMediaUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        DOM.mediaPreview.innerHTML = file.type.startsWith('image/') ? 
            `<img src="${e.target.result}" class="media-upload__preview">` :
            `<div class="media-upload__file">
                <a href="${e.target.result}" 
                   class="btn btn--secondary" 
                   target="_blank">
                   Prévisualiser le fichier
                </a>
             </div>`;
    };
    reader.readAsDataURL(file);
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', init);