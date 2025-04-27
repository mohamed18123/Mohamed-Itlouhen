document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const loader = btn.querySelector('.loader');
    const btnText = btn.querySelector('.btn-text');
    
    btn.disabled = true;
    btnText.style.opacity = '0';
    loader.style.display = 'block';

    // Simulation de délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 2000));

    document.getElementById('resetForm').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
    btn.disabled = false;
    btnText.style.opacity = '1';
    loader.style.display = 'none';
});