document.addEventListener('DOMContentLoaded', async()=>{
    const param = new URLSearchParams(window.location.search)
    const id  = param.get('id')
    console.log('L\'id est : ' ,id);
    const doc = await fetch(`http://localhost:5000/edit/${id}`, {method : 'GET'})
    const find = await doc.json()
    console.log(find)
    const inputNom = document.querySelector('#nom')
    const inputDoc = document.querySelector('#doc')
    //inputDoc.value = find.path
    inputNom.value = find.doc_name || find.nom

    const a = document.querySelector('a');
    a.style = 'text-decoration : none; color : white; margin-top : 5%; display : block'
    a.href = `${find.path}`;
    a.download = `${find.path}`;

    const formModif = document.querySelector('form')
    formModif.addEventListener('submit', async(e)=>{
        e.preventDefault();
        const params = new URLSearchParams(window.location.search)
        const id = params.get('id')
        const form = e.currentTarget;
        const data = new FormData(form);

        const reponse = await fetch(`http://localhost:5000/editForm/${id}`, {method : 'PUT', body : data}).then(res =>{
            if(res.ok){
                alert('Document modifié')
            }else{
                alert('Document non-modifié')
            }
        })

    })

    document.querySelector('.supprimer').addEventListener('click', async()=>{
        const params = new URLSearchParams(window.location.search)
        const id = params.get('id');

        const res = await fetch(`http://localhost:5000/delete/${id}`, {method : 'DELETE', headers : {'Content-Type' : 'application/json'}});
        const rep = await res.json();
        alert(rep.message);
    })

    
})






