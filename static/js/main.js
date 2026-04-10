document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        if(loader) loader.classList.add('hidden');
    }, 500); // short simulated loading
});

function confirmDelete(event) {
    if(!confirm("Are you sure you want to delete this? This action cannot be undone.")) {
        event.preventDefault();
    }
}

const searchBars = document.querySelectorAll('.search-bar');
searchBars.forEach(bar => {
    bar.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const cards = document.querySelectorAll('.item-card');
        cards.forEach(card => {
            const title = card.querySelector('.item-title').innerText.toLowerCase();
            if(title.includes(query)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});
