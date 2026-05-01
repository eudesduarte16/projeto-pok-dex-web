const listaContainer = document.getElementById('lista-pokemon');
const campoBusca = document.getElementById('campo-busca');
const modal = document.getElementById('modal-detalhes');
const infoPokemon = document.getElementById('info-pokemon');

let offset = 0; // 
const limit = 20;

// Função para buscar favoritos do localStorage [cite: 18]
const getFavoritos = () => JSON.parse(localStorage.getItem('favs')) || [];

// 1. Listar Pokémon ao abrir a página [cite: 7, 24]
async function carregarPokemons() {
    listaContainer.innerHTML = "<h3>Carregando...</h3>"; // [cite: 19, 30]
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        const data = await response.json();
        
        // Buscamos os detalhes de cada pokemon da lista
        const promises = data.results.map(p => fetch(p.url).then(res => res.json()));
        const pokemonsCompletos = await Promise.all(promises);
        
        renderizarLista(pokemonsCompletos);
    } catch (error) {
        listaContainer.innerHTML = "<h3>Erro ao conectar com a API.</h3>"; // [cite: 19]
    }
}

// Renderizar os cards na tela
function renderizarLista(lista) {
    listaContainer.innerHTML = "";
    if (lista.length === 0) {
        listaContainer.innerHTML = "<h3>Nenhum resultado encontrado.</h3>"; // [cite: 30]
        return;
    }

    const favoritos = getFavoritos();

    lista.forEach(poke => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => mostrarDetalhes(poke); // [cite: 12, 27]

        const isFav = favoritos.includes(poke.id);

        card.innerHTML = `
            <button class="btn-fav" onclick="event.stopPropagation(); alternarFavorito(${poke.id}, this)">
                ${isFav ? '⭐' : '☆'}
            </button>
            <img src="${poke.sprites.front_default}" alt="${poke.name}">
            <h3>#${poke.id} - ${poke.name}</h3>
        `;
        listaContainer.appendChild(card);
    });
}

// 3. Busca por nome ou ID [cite: 11, 26]
async function buscarPokemon() {
    const termo = campoBusca.value.toLowerCase().trim();
    if (!termo) return carregarPokemons();

    listaContainer.innerHTML = "<h3>Buscando...</h3>";
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${termo}`);
        if (!response.ok) throw new Error();
        const poke = await response.json();
        renderizarLista([poke]);
    } catch {
        listaContainer.innerHTML = "<h3>Nenhum Pokémon encontrado.</h3>";
    }
}

// 4. Mostrar detalhes no Modal [cite: 12-17]
function mostrarDetalhes(poke) {
    infoPokemon.innerHTML = `
        <img src="${poke.sprites.other['official-artwork'].front_default}" style="width: 200px">
        <h2 style="text-transform: capitalize">${poke.name} (ID: ${poke.id})</h2>
        <p><strong>Tipos:</strong> ${poke.types.map(t => t.type.name).join(', ')}</p>
        <p><strong>Altura:</strong> ${poke.height / 10} m</p>
        <p><strong>Peso:</strong> ${poke.weight / 10} kg</p>
    `;
    modal.style.display = "block";
}

// 5. Favoritar (localStorage) 
function alternarFavorito(id, botao) {
    let favs = getFavoritos();
    if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
        botao.textContent = '☆';
    } else {
        favs.push(id);
        botao.textContent = '⭐';
    }
    localStorage.setItem('favs', JSON.stringify(favs));
}

// 6. Mostrar apenas favoritos [cite: 18, 29]
async function verFavoritos() {
    const IDs = getFavoritos();
    if (IDs.length === 0) {
        listaContainer.innerHTML = "<h3>Você ainda não tem favoritos.</h3>";
        return;
    }
    
    listaContainer.innerHTML = "<h3>Carregando favoritos...</h3>";
    const promises = IDs.map(id => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json()));
    const pokemons = await Promise.all(promises);
    renderizarLista(pokemons);
}

// Eventos de Navegação 
document.getElementById('btn-proximo').onclick = () => {
    offset += limit;
    carregarPokemons();
};

document.getElementById('btn-anterior').onclick = () => {
    if (offset >= limit) {
        offset -= limit;
        carregarPokemons();
    }
};

document.getElementById('btn-buscar').onclick = buscarPokemon;
document.getElementById('btn-favoritos').onclick = verFavoritos;
document.getElementById('btn-todos').onclick = () => { offset = 0; carregarPokemons(); };

// Fechar Modal
document.querySelector('.fechar').onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };

// Iniciar app [cite: 24]
carregarPokemons();
