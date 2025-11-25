import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LeaseDocument = sequelize.define('LeaseDocument', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    leaseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Leases',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    category: {
        type: DataTypes.ENUM(
            'contract',           // Contrat de bail
            'inventory_in',       // État des lieux entrée
            'inventory_out',      // État des lieux sortie
            'amendment',          // Avenant
            'letter',            // Courrier
            'insurance',         // Assurance
            'receipt',           // Quittance
            'other'              // Autre
        ),
        allowNull: false,
        defaultValue: 'other'
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nom du fichier sur le serveur (UUID)'
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nom original du fichier uploadé'
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Taille du fichier en bytes'
    },
    mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Type MIME du fichier'
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Chemin relatif du fichier'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description optionnelle du document'
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['leaseId']
        },
        {
            fields: ['category']
        }
    ]
});

export default LeaseDocument;
