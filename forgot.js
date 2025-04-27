document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetForm');
    const successMessage = document.getElementById('successMessage');
    const btn = form.querySelector('button');
    const loader = btn.querySelector('.loader');
    const btnText = btn.querySelector('.btn-text');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Désactiver le bouton pendant le traitement
        btn.disabled = true;
        btnText.style.opacity = '0';
        loader.style.display = 'block';

        try {
            // Simulation d'envoi avec délai
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Cacher le formulaire et afficher le message de succès
            form.style.opacity = '0';
            form.style.height = '0';
            form.style.margin = '0';
            form.style.pointerEvents = 'none';

            successMessage.style.display = 'block';
            successMessage.style.animation = 'fadeIn 0.5s ease';

        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            // Réactiver le bouton
            btn.disabled = false;
            btnText.style.opacity = '1';
            loader.style.display = 'none';
        }
    });
});