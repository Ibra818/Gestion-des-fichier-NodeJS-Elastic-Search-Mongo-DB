const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/Kankou_Moussa', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connexion MongoDB réussie');
    } catch (error) {
        console.error(' Échec de la connexion', error);
        process.exit(1); // Arrêter le serveur si la connexion échoue
    }
};

connectDB();

module.exports = mongoose;
