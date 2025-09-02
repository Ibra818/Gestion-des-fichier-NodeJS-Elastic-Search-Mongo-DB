document.querySelector('.form-enregistrement').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const form = e.currentTarget
    const doc = document.querySelector('#doc')
    const formdata = new FormData(form)
    const fichier = formdata.get('doc')

    const response = await fetch('http://localhost:5000/upload', {method : 'POST', body : formdata});
    const res = await response.json()
    console.log(res)
    window.alert(res.message)
})

 async function getDocs (){
    const rep = await fetch('http://localhost:5000/getDocs', {method : 'GET'})
    console.log(rep)
    return rep.json()
}

document.querySelector('.form-search').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const form = e.currentTarget;
    let search = new FormData(form);
    search = search.get('recherche');
    console.log(search)

    const resultat = await fetch('http://localhost:5000/recherche', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ q: search })
    });

    let recherche = await resultat.json()
    console.log(recherche)
    if(recherche.length !=0){
        const results = document.querySelector('.results');
            recherche.forEach((element) => {
                const div = document.createElement('div');
                div.innerHTML = `
                <img src="doc.png"> 
                <h4 class="mt-4">${element.nom}</h4>
                <a href="${element.chemin}">Lien vers le document</a>
                `
                results.appendChild(div)
                div.addEventListener('click', (e)=>{
                    window.location.href = `edit.html?id=${element.id}`
                })
            });
        
        }else{
            window.alert('Pas de documents trouvé pour cette recherche')
        }
})  

document.addEventListener('DOMContentLoaded', async ()=>{

   let lastestDocs = await getDocs()
   console.log(lastestDocs)

    let article = document.querySelector('.lastestDocs');

    if(lastestDocs.length != 0){
        lastestDocs.forEach((element) => {
            const div = document.createElement('div');
            div.innerHTML = `
            <img src="doc.png"> 
            <h4 class="mt-4">${element.doc_name}</h4>
            <a href="${element.path}">Lien vers le document</a>
            `
            article.appendChild(div)
            div.addEventListener('click', (e)=>{
                window.location.href = `edit.html?id=${element._id}`
            })
        });
    
    }else{
        const div = document.createElement('div');
        div.innerHTML = `
            <img src="doc.png"> 
            <h4 class="mt-4">Aucun document enregistré</h4>
            `
            article.appendChild(div)
    }
    
    
})

const slids = document.querySelectorAll('.slid');
const slider = document.querySelector('.slider');
    let currentIndex = 0;
    
    
    const t = setInterval(()=>{

        slids[currentIndex].style = 'transition : transform 2s ease; transform : translateX(-1200px)';
        currentIndex++;
        if(currentIndex ==3){
            clearInterval(t)
        }
    }, 3000)

