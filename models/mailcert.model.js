module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define("tb_mail_cert", {
        mb_no: {  //번호
            type: DataTypes.INTEGER(8),
            allowNull: false,
            parmarayLey: true,
            get() { return this.getDataValue('mb_no'); }
        },
        mb_email: {  
            type: DataTypes.STRING(100),
            allowNull: true,
            get() { return this.getDataValue('mb_email'); }
        },
        type: {  
            type: DataTypes.STRING(20),
            allowNull: true,
            get() { return this.getDataValue('type'); }
        },
        token: {  
            type: DataTypes.STRING(100),
            allowNull: true,
            get() { return this.getDataValue('token'); }
        },
        status: { 
            type: DataTypes.STRING(50),
            allowNull: true,
            get() { return this.getDataValue('status'); }
        },
        reg_dt: {  
            type: DataTypes.DATE,
            allowNull: true,
            timestamps: true,
            updatedAt: true,
            get() { return this.getDataValue('reg_dt'); }
        },
    },
        {
            freezeTableName: true,
            timestamps: false
        });
    return user;
}