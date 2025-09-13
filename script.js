const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const creatureInfo = document.getElementById('creature-info');

// API base URL
const API_BASE_URL = 'https://pokeapi-proxy.freecodecamp.rocks/api/pokemon';

// Function to search for creature
async function searchCreature() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        alert('Please enter a Pokémon name or ID');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${searchTerm}`);
        
        if (!response.ok) {
            throw new Error('Creature not found');
        }
        
        const creatureData = await response.json();
        displayCreature(creatureData);
        
    } catch (error) {
        alert('Pokémon not found');
        creatureInfo.style.display = 'none';
    }
}

// Function to display creature data
function displayCreature(data) {
    // Basic info with proper units and formatting
    document.getElementById('creature-name').textContent = data.name.toUpperCase();
    document.getElementById('creature-id').textContent = `#${String(data.id).padStart(3, '0')}`;
    
    // Convert weight from hectograms to kg and height from decimeters to meters
    const weightInKg = (data.weight / 10).toFixed(1);
    const heightInM = (data.height / 10).toFixed(1);
    
    document.getElementById('weight').textContent = `Weight: ${weightInKg} kg`;
    document.getElementById('height').textContent = `Height: ${heightInM} m`;
    document.getElementById('base-experience').textContent = data.base_experience || 'N/A';
    document.getElementById('order').textContent = data.order || 'N/A';
    
    // Creature image with better quality options
    const creatureImage = document.getElementById('creature-image');
    if (data.sprites) {
        // Try to use the highest quality image available
        let imageUrl = data.sprites.other?.['official-artwork']?.front_default || 
                      data.sprites.other?.dream_world?.front_default ||
                      data.sprites.other?.home?.front_default ||
                      data.sprites.front_default;
        
        if (imageUrl) {
            creatureImage.src = imageUrl;
            creatureImage.style.display = 'block';
            creatureImage.alt = `${data.name} official artwork`;
        } else {
            creatureImage.style.display = 'none';
        }
    } else {
        creatureImage.style.display = 'none';
    }
    
    // Abilities
    const abilitiesContainer = document.getElementById('abilities');
    abilitiesContainer.innerHTML = ''; // Clear previous abilities
    
    if (data.abilities && data.abilities.length > 0) {
        data.abilities.forEach(abilityInfo => {
            const abilityElement = document.createElement('span');
            abilityElement.className = 'ability-badge';
            if (abilityInfo.is_hidden) {
                abilityElement.classList.add('hidden');
            }
            abilityElement.textContent = abilityInfo.ability.name.replace('-', ' ');
            abilityElement.title = abilityInfo.is_hidden ? 'Hidden Ability' : 'Normal Ability';
            abilitiesContainer.appendChild(abilityElement);
        });
    }
    
    // Stats
    document.getElementById('hp').textContent = data.stats[0].base_stat;
    document.getElementById('attack').textContent = data.stats[1].base_stat;
    document.getElementById('defense').textContent = data.stats[2].base_stat;
    document.getElementById('special-attack').textContent = data.stats[3].base_stat;
    document.getElementById('special-defense').textContent = data.stats[4].base_stat;
    document.getElementById('speed').textContent = data.stats[5].base_stat;
    
    // Types
    const typesContainer = document.getElementById('types');
    typesContainer.innerHTML = ''; // Clear previous types
    
    data.types.forEach(typeInfo => {
        const typeElement = document.createElement('span');
        typeElement.className = `type-badge ${typeInfo.type.name}`;
        typeElement.textContent = typeInfo.type.name.toUpperCase();
        typesContainer.appendChild(typeElement);
    });
    
    // Show creature info
    creatureInfo.style.display = 'block';
}

// Add event listeners
searchButton.addEventListener('click', searchCreature);
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchCreature();
    }
});

// Add close button functionality
const closeButton = document.getElementById('close-button');
closeButton.addEventListener('click', closeCreatureDetails);

function closeCreatureDetails() {
    const creatureInfo = document.getElementById('creature-info');
    creatureInfo.style.display = 'none';
    
    // Clear the search input
    searchInput.value = '';
    
    // Focus back to search input
    searchInput.focus();
}

// Load available creatures on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAvailableCreatures();
    initializeAccordion();
});

// Initialize accordion functionality
function initializeAccordion() {
    const accordionHeader = document.getElementById('accordion-header');
    const accordionContent = document.getElementById('accordion-content');
    const accordionToggle = accordionHeader.querySelector('.accordion-toggle');
    
    accordionHeader.addEventListener('click', () => {
        const isExpanded = accordionContent.classList.contains('expanded');
        
        if (isExpanded) {
            // Collapse
            accordionContent.classList.remove('expanded');
            accordionToggle.classList.remove('rotated');
            accordionToggle.textContent = '▼';
        } else {
            // Expand
            accordionContent.classList.add('expanded');
            accordionToggle.classList.add('rotated');
            accordionToggle.textContent = '▲';
        }
    });
}

// Function to load and display all available creatures
async function loadAvailableCreatures() {
    try {
        const response = await fetch('https://pokeapi-proxy.freecodecamp.rocks/api/pokemon');
        const data = await response.json();
        
        const creaturesGrid = document.getElementById('creatures-grid');
        creaturesGrid.innerHTML = '';
        
        // Create clickable creature name elements with real Pokémon sprites
        data.results.forEach(creature => {
            const creatureElement = document.createElement('div');
            creatureElement.className = 'creature-name-item';
            
            // Extract Pokémon ID from URL for sprite
            const pokemonId = creature.url.split('/').filter(Boolean).pop();
            
            const iconImg = document.createElement('img');
            iconImg.className = 'pokemon-sprite';
            iconImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
            iconImg.alt = `${creature.name} sprite`;
            iconImg.loading = 'lazy';
            iconImg.onerror = function() {
                // Fallback to official artwork if sprite fails
                this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
                this.onerror = function() {
                    // Final fallback to a placeholder
                    this.style.display = 'none';
                    const fallbackSpan = document.createElement('span');
                    fallbackSpan.textContent = '⭐';
                    fallbackSpan.className = 'pokemon-fallback-icon';
                    this.parentNode.insertBefore(fallbackSpan, this);
                };
            };
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'pokemon-name';
            nameSpan.textContent = creature.name;
            
            creatureElement.appendChild(iconImg);
            creatureElement.appendChild(nameSpan);
            creatureElement.title = `Click to search for ${creature.name}`;
            
            // Add click event to search for this creature
            creatureElement.addEventListener('click', () => {
                searchInput.value = creature.name;
                searchCreature();
                // Scroll to top to see the results
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            creaturesGrid.appendChild(creatureElement);
        });
        
    } catch (error) {
        const creaturesGrid = document.getElementById('creatures-grid');
        creaturesGrid.innerHTML = '<div class="loading">Failed to load Pokémon list. Please refresh the page.</div>';
    }
}

// Pokémon icon mapping function
function getPokemonIcon(pokemonName) {
    const iconMap = {
        // Generation 1
        'bulbasaur': '🌱', 'ivysaur': '🌿', 'venusaur': '🌺',
        'charmander': '🔥', 'charmeleon': '🔥', 'charizard': '🐉',
        'squirtle': '🐢', 'wartortle': '🐢', 'blastoise': '🐢',
        'caterpie': '🐛', 'metapod': '🛡️', 'butterfree': '🦋',
        'weedle': '🐛', 'kakuna': '🛡️', 'beedrill': '🐝',
        'pidgey': '🐦', 'pidgeotto': '🐦', 'pidgeot': '🦅',
        'rattata': '🐭', 'raticate': '🐭',
        'spearow': '🐦', 'fearow': '🦅',
        'ekans': '🐍', 'arbok': '🐍',
        'pikachu': '⚡', 'raichu': '⚡',
        'sandshrew': '🦔', 'sandslash': '🦔',
        'nidoran-f': '💜', 'nidorina': '💜', 'nidoqueen': '👑',
        'nidoran-m': '💙', 'nidorino': '💙', 'nidoking': '👑',
        'clefairy': '🧚', 'clefable': '🧚',
        'vulpix': '🦊', 'ninetales': '🦊',
        'jigglypuff': '🎵', 'wigglytuff': '🎵',
        'zubat': '🦇', 'golbat': '🦇',
        'oddish': '🌱', 'gloom': '🌸', 'vileplume': '🌺',
        'paras': '🍄', 'parasect': '🍄',
        'venonat': '🐛', 'venomoth': '🦋',
        'diglett': '🕳️', 'dugtrio': '🕳️',
        'meowth': '🐱', 'persian': '🐱',
        'psyduck': '🦆', 'golduck': '🦆',
        'mankey': '🐒', 'primeape': '🐒',
        'growlithe': '🐕', 'arcanine': '🐕',
        'poliwag': '🐸', 'poliwhirl': '🐸', 'poliwrath': '🐸',
        'abra': '🔮', 'kadabra': '🔮', 'alakazam': '🔮',
        'machop': '💪', 'machoke': '💪', 'machamp': '💪',
        'bellsprout': '🌱', 'weepinbell': '🌿', 'victreebel': '🌺',
        'tentacool': '🪼', 'tentacruel': '🪼',
        'geodude': '🪨', 'graveler': '🪨', 'golem': '🪨',
        'ponyta': '🐴', 'rapidash': '🐴',
        'slowpoke': '🐌', 'slowbro': '🐌',
        'magnemite': '🧲', 'magneton': '🧲',
        'farfetchd': '🦆', 'doduo': '🐦', 'dodrio': '🐦',
        'seel': '🦭', 'dewgong': '🦭',
        'grimer': '💜', 'muk': '💜',
        'shellder': '🐚', 'cloyster': '🐚',
        'gastly': '👻', 'haunter': '👻', 'gengar': '👻',
        'onix': '🐍', 'drowzee': '🐘', 'hypno': '🐘',
        'krabby': '🦀', 'kingler': '🦀',
        'voltorb': '⚡', 'electrode': '⚡',
        'exeggcute': '🥚', 'exeggutor': '🌴',
        'cubone': '🦴', 'marowak': '🦴',
        'hitmonlee': '🥋', 'hitmonchan': '🥊',
        'lickitung': '👅', 'koffing': '💨', 'weezing': '💨',
        'rhyhorn': '🦏', 'rhydon': '🦏',
        'chansey': '🥚', 'tangela': '🌿',
        'kangaskhan': '🦘', 'horsea': '🐴', 'seadra': '🐴',
        'goldeen': '🐠', 'seaking': '🐠',
        'staryu': '⭐', 'starmie': '⭐',
        'mr-mime': '🤡', 'scyther': '🦂',
        'jynx': '💋', 'electabuzz': '⚡', 'magmar': '🔥',
        'pinsir': '🪲', 'tauros': '🐂',
        'magikarp': '🐟', 'gyarados': '🐉',
        'lapras': '🦕', 'ditto': '💧',
        'eevee': '🦊', 'vaporeon': '💧', 'jolteon': '⚡', 'flareon': '🔥',
        'porygon': '🤖', 'omanyte': '🐚', 'omastar': '🐚',
        'kabuto': '🦀', 'kabutops': '🦀',
        'aerodactyl': '🦴', 'snorlax': '😴',
        'articuno': '❄️', 'zapdos': '⚡', 'moltres': '🔥',
        'dratini': '🐉', 'dragonair': '🐉', 'dragonite': '🐉',
        'mewtwo': '🧬', 'mew': '🌟',
        
        // Generation 2 - Popular ones
        'chikorita': '🌱', 'bayleef': '🌿', 'meganium': '🌺',
        'cyndaquil': '🔥', 'quilava': '🔥', 'typhlosion': '🔥',
        'totodile': '🐊', 'croconaw': '🐊', 'feraligatr': '🐊',
        'sentret': '🐿️', 'furret': '🐿️',
        'hoothoot': '🦉', 'noctowl': '🦉',
        'ledyba': '🐞', 'ledian': '🐞',
        'spinarak': '🕷️', 'ariados': '🕷️',
        'crobat': '🦇', 'chinchou': '🐠', 'lanturn': '🐠',
        'pichu': '⚡', 'cleffa': '🧚', 'igglybuff': '🎵',
        'togepi': '🥚', 'togetic': '🧚',
        'natu': '🐦', 'xatu': '🦅',
        'mareep': '🐑', 'flaaffy': '🐑', 'ampharos': '⚡',
        'bellossom': '🌺', 'marill': '💧', 'azumarill': '💧',
        'sudowoodo': '🌳', 'politoed': '🐸',
        'hoppip': '🌸', 'skiploom': '🌸', 'jumpluff': '🌸',
        'aipom': '🐒', 'sunkern': '🌻', 'sunflora': '🌻',
        'yanma': '🦋', 'wooper': '🐸', 'quagsire': '🐸',
        'espeon': '🔮', 'umbreon': '🌙',
        'murkrow': '🐦', 'slowking': '👑',
        'misdreavus': '👻', 'unown': '❓',
        'wobbuffet': '💙', 'girafarig': '🦒',
        'pineco': '🐛', 'forretress': '🛡️',
        'dunsparce': '🐍', 'gligar': '🦂',
        'steelix': '🐍', 'snubbull': '🐕', 'granbull': '🐕',
        'qwilfish': '🐡', 'scizor': '🦂',
        'shuckle': '🐛', 'heracross': '🪲',
        'sneasel': '🐱', 'teddiursa': '🐻', 'ursaring': '🐻',
        'slugma': '🌋', 'magcargo': '🌋',
        'swinub': '🐷', 'piloswine': '🐷',
        'corsola': '🪸', 'remoraid': '🐠', 'octillery': '🐙',
        'delibird': '🎁', 'mantine': '🐠',
        'skarmory': '🦅', 'houndour': '🐕', 'houndoom': '🐕',
        'kingdra': '🐉', 'phanpy': '🐘', 'donphan': '🐘',
        'porygon2': '🤖', 'stantler': '🦌',
        'smeargle': '🎨', 'tyrogue': '🥋',
        'hitmontop': '🥋', 'smoochum': '💋',
        'elekid': '⚡', 'magby': '🔥',
        'miltank': '🐄', 'blissey': '🥚',
        'raikou': '⚡', 'entei': '🔥', 'suicune': '💧',
        'larvitar': '🪨', 'pupitar': '🛡️', 'tyranitar': '🦕',
        'lugia': '🌊', 'ho-oh': '🔥', 'celebi': '🌟'
    };
    
    const name = pokemonName.toLowerCase();
    return iconMap[name] || '⭐'; // Default star icon for unknown Pokémon
}

// Focus on input when page loads
window.addEventListener('load', () => {
    searchInput.focus();
});