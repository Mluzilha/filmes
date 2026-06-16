

const API_KEY = "33e7773609f4b865aeedc4a584d946c9";

const IMG = "https://image.tmdb.org/t/p/w500";
const BACKDROP = "https://image.tmdb.org/t/p/original";
const YOUTUBE = "https://www.youtube.com/embed/";

const FALLBACK =
    "https://via.placeholder.com/500x750?text=Sem+Imagem";


let items = [];
let page = 1;
let loading = false;

let currentMovie = null;

let favorites =
    JSON.parse(
        localStorage.getItem("favorites")
    ) || [];


const featured =
    document.getElementById("featured");

const horror =
    document.getElementById("horror");

const scifi =
    document.getElementById("scifi");

const adventure =
    document.getElementById("adventure");

const favoritesDiv =
    document.getElementById("favorites");

const banner =
    document.getElementById("banner");

const bannerTitle =
    document.getElementById("bannerTitle");

const bannerDesc =
    document.getElementById("bannerDesc");

const search =
    document.getElementById("search");

const filter =
    document.getElementById("filter");

const modal =
    document.getElementById("modal");

const modalImg =
    document.getElementById("img");

const modalTitle =
    document.getElementById("title");

const modalDesc =
    document.getElementById("desc");

const trailer =
    document.getElementById("trailer");

const favBtn =
    document.getElementById("favBtn");

const closeBtn =
    document.getElementById("closeBtn");


const avatarInput =
    document.getElementById("avatarInput");

const profileAvatar =
    document.getElementById("profileAvatar");

const savedAvatar =
    localStorage.getItem("avatar");

if(savedAvatar){
    profileAvatar.src =
        savedAvatar;
}


profileAvatar.addEventListener(
    "click",
    ()=>{
        avatarInput.click();
    }
);


avatarInput.addEventListener(
    "change",
    e=>{

        const file =
            e.target.files[0];

        if(!file) return;

        const reader =
            new FileReader();

        reader.onload = ()=>{

            profileAvatar.src =
                reader.result;

            localStorage.setItem(
                "avatar",
                reader.result
            );

        };

        reader.readAsDataURL(
            file
        );

    }
);


function safeImg(path){

    if(!path)
        return FALLBACK;

    return IMG + path;
}


function createCard(movie){

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "card";

    card.innerHTML = `
        <img
            src="${safeImg(
                movie.poster
            )}"
            loading="lazy"
        >
    `;

    card.onclick = ()=>{
        openModal(movie);
    };

    return card;
}

function setBanner(movie){

    if(!movie.backdrop)
        return;

    banner.style.backgroundImage =
        `url(${
            BACKDROP +
            movie.backdrop
        })`;

    bannerTitle.textContent =
        movie.title;

    bannerDesc.textContent =
        movie.overview
        .slice(0,180)
        + "...";
}

async function loadContent(){

    if(loading)
        return;

    loading = true;

    try{

        const movieRes =
            await fetch(
                `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR&page=${page}`
            );

        const tvRes =
            await fetch(
                `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=pt-BR&page=${page}`
            );

        const movieData =
            await movieRes.json();

        const tvData =
            await tvRes.json();

        const movies =
            movieData.results.map(
                m=>({

                id:"m"+m.id,

                tmdbId:m.id,

                title:m.title,

                type:"movie",

                poster:
                    m.poster_path,

                backdrop:
                    m.backdrop_path,

                overview:
                    m.overview,

                genres:
                    m.genre_ids

            }));

        const tvs =
            tvData.results.map(
                s=>({

                id:"tv"+s.id,

                tmdbId:s.id,

                title:s.name,

                type:"tv",

                poster:
                    s.poster_path,

                backdrop:
                    s.backdrop_path,

                overview:
                    s.overview,

                genres:
                    s.genre_ids

            }));

        const combined = [
            ...movies,
            ...tvs
        ];

        combined.forEach(item=>{

            if(
                !items.find(
                    i=>
                    i.id === item.id
                )
            ){
                items.push(item);
            }

        });

        if(
            page === 1 &&
            items.length > 0
        ){
            setBanner(items[0]);
        }

        render();

        page++;

    }catch(err){

        console.error(err);

    }

    loading = false;
}


function render(){

    featured.innerHTML = "";
    horror.innerHTML = "";
    scifi.innerHTML = "";
    adventure.innerHTML = "";
    favoritesDiv.innerHTML = "";

    const used = new Set();

    const searchValue =
        search.value.trim().toLowerCase();

    const selectedFilter =
        filter.value;

    
    if(searchValue !== ""){

        banner.style.display = "none";

        horror.parentElement.style.display = "none";
        scifi.parentElement.style.display = "none";
        adventure.parentElement.style.display = "none";
        favoritesDiv.parentElement.style.display = "none";

        const title =
            document.getElementById(
                "featuredTitle"
            );

        if(title){
            title.textContent =
                `🔍 Resultados para "${searchValue}"`;
        }

    }else{

        banner.style.display = "flex";

        horror.parentElement.style.display = "block";
        scifi.parentElement.style.display = "block";
        adventure.parentElement.style.display = "block";
        favoritesDiv.parentElement.style.display = "block";

        const title =
            document.getElementById(
                "featuredTitle"
            );

        if(title){
            title.textContent =
                "🔥 Em Alta";
        }

    }

    items.forEach(movie => {

        if(used.has(movie.id))
            return;

    
        if(
            !movie.title
                .toLowerCase()
                .includes(searchValue)
        ){
            return;
        }

      
        if(
            selectedFilter === "movie"
            && movie.type !== "movie"
        ) return;

        if(
            selectedFilter === "tv"
            && movie.type !== "tv"
        ) return;

        if(
            selectedFilter === "horror"
            && !movie.genres.includes(27)
        ) return;

        if(
            selectedFilter === "scifi"
            && !movie.genres.includes(878)
        ) return;

        used.add(movie.id);

        featured.appendChild(
            createCard(movie)
        );

      
        if(searchValue === ""){

            if(
                movie.genres.includes(27)
            ){
                horror.appendChild(
                    createCard(movie)
                );
            }

            if(
                movie.genres.includes(878)
            ){
                scifi.appendChild(
                    createCard(movie)
                );
            }

            if(
                movie.genres.includes(12)
            ){
                adventure.appendChild(
                    createCard(movie)
                );
            }

        }

    });


    favorites.forEach(movie => {

        favoritesDiv.appendChild(
            createCard(movie)
        );

    });

}


async function openModal(movie){

    currentMovie = movie;

    modal.style.display = "flex";

    modalImg.src =
        safeImg(movie.poster);

    modalTitle.textContent =
        movie.title;

    modalDesc.textContent =
        movie.overview;

    trailer.src = "";

    try{

        const endpoint =
            movie.type === "tv"
            ? "tv"
            : "movie";

        const res =
            await fetch(
                `https://api.themoviedb.org/3/${endpoint}/${movie.tmdbId}/videos?api_key=${API_KEY}&language=pt-BR`
            );

        const data =
            await res.json();

        const video =
            data.results.find(
                v =>
                    v.site === "YouTube"
            );

        if(video){

            trailer.src =
                YOUTUBE + video.key;

        }

    }catch(err){

        console.error(err);

    }

}

closeBtn.onclick = ()=>{

    modal.style.display =
        "none";

    trailer.src = "";

};

modal.addEventListener(
    "click",
    e=>{

        if(e.target === modal){

            modal.style.display =
                "none";

            trailer.src = "";

        }

    }
);


favBtn.onclick = ()=>{

    if(!currentMovie)
        return;

    const exists =
        favorites.find(
            f =>
                f.id ===
                currentMovie.id
        );

    if(!exists){

        favorites.push(
            currentMovie
        );

        localStorage.setItem(
            "favorites",
            JSON.stringify(
                favorites
            )
        );

        render();

    }

};


search.addEventListener(
    "input",
    render
);

filter.addEventListener(
    "change",
    render
);


window.addEventListener(
    "scroll",
    ()=>{

        if(

            window.innerHeight
            +
            window.scrollY

            >=

            document.body
                .offsetHeight
            - 700

        ){

            loadContent();

        }

    }
);


loadContent();
