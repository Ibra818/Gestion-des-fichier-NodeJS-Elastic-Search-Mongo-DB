const express = require('express')
const multer = require('multer')
const textextract = require('textract')
const path = require('path')
const bodyParser = require('body-parser')
const Document = require('./models/document')
const esClient = require('./elastic')
const cors = require('cors')

const app = express()
app.use(bodyParser.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors())
app.listen(5000, ()=>{
    console.log('Listening at port:5000')
})

    const storage = multer.diskStorage({
    destination: path.join(__dirname, 'uploads'),
    filename : (req, file, cb) => cb(null, file.originalname)
    
    });

    const upload = multer({storage});

    // Recherher de document dans la base MongoDB

    app.post('/recherche', async (req, res)=>{
        console.log(req.body);
        const {q} = req.body

        
        try {
            const { hits } = await esClient.search({
                index: 'documents',
                query: {
                  multi_match: {
                    query: q,
                    fields: ['id','doc_name', 'nom','contenu', 'type', 'format'],
                    fuzziness: 'AUTO'
                  }
                }
              });
    
            res.json(hits.hits.map(hit => ({ id: hit._id, ...hit._source })));
        } catch (err) {
            console.error("Erreur Elasticsearch :", err);
            res.status(500).json({ error: "Erreur lors de la recherche" });
        }
    })

    // Recuperer les 3 derniers documents 

    app.get('/getDocs', async(req, res)=>{
        let docs = await Document.find().sort({insert_date : -1}).limit(3)
        return res.status(200).json(docs)
    })

    // Ajout de documents dans la base de données MongoDB

    app.post('/upload', upload.single('doc'), async (req, res) => {
        const chemin = req.file.path;
        const nom = req.file.originalname;
        const format = path.extname(req.file.originalname)
        const type = req.body.type
    
        textextract.fromFileWithPath(chemin, async (error, contenu) => {
            if (!req.file) {
                return res.status(400).json({ message: 'Aucun fichier n’a été envoyé.' });
            }
            else if (error) {
                return res.status(500).json({ message: 'Erreur lors de l\'extraction', error });
            }
    
            try {
                const doc = new Document({
                    doc_name: nom,
                    contenu : contenu,
                    update_date: Date.now(),
                    insert_date: Date.now(),
                    format: path.extname(nom),
                    path: chemin,
                });
    
                await doc.save();
    
                await esClient.index({
                    index: 'documents',
                    id: doc._id.toString(),
                    document: {
                        nom,
                        contenu,
                        type,
                        chemin,
                        format
                    },
                });
    
                res.status(201).json({ message: 'Document ajouté', doc });
    
            } catch (err) {
                res.status(500).json({ message: 'Erreur lors de l\'enregistrement', error: err });
            }
        });
    });

    // Modification de document

    app.get('/edit/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const doc = await Document.findById(id);
            if (doc) {
                return res.status(200).json(doc);
            } else {
                return res.status(404).json({ message: 'Document introuvable' });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
    });

    app.put('/editForm/:id', upload.single('doc'), async (req, res) => {
        const id = req.params.id;
        const nom = req.body.nom;
        const type = req.body.type;
        
        if(req.file){
            const chemin = req.file.path;
            const format = path.extname(req.file.originalname);
            textextract.fromFileWithPath(chemin, async(error, contenu)=>{
                try{
                    const doc = await Document.findByIdAndUpdate(
                        id,
                        {
                           doc_name : nom,
                           type : type,
                           format : format,
                           path : chemin,
                           contenu : contenu,
                           update_date : Date.now(),

                        });
                    await doc.save();

                    await esClient.update({
                        index : 'documents',
                        id : id,
                        doc : {
                            nom,
                            type,
                            contenu,
                            format,
                            chemin
                        }

                    })
                    return res.status(200).json({message : 'Document ajouté !'})
                }catch(error){
                    res.status(500).json({message : error})
                }
            })
        
        }else{

            try{
                const doc = await Document.findByIdAndUpdate(id,{
                    doc_name : nom,
                    update_date : Date.now(),
                    type : req.body.type,
                })
    
                await doc.save();
    
                await esClient.update({
                    index : 'documents',
                    id : id,
                    doc : {
                       nom,
                       type,
                    },
                })
    
                return res.status(200).json({message : 'Documents modifié sans fichier joint !'});
            }catch(error){
                return res.status(400).json({message : error})
            }
            
        }
        
    });

    // Suppression de document :

    app.delete('/delete/:id', async (req, res) => {
        try {
            const id  = req.params.id;
            await Document.findByIdAndDelete(id);
            await esClient.delete({
                index: 'documents',
                id: id
            });
            res.json({ message: 'Document supprimé avec succès' });
        } catch (err) {
            res.status(500).json({ message: 'Erreur lors de la suppression', error: err });
        }
    });