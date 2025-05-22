//**********************************************/
//    @Project : alphaBot (메타봇)
//    @File : code.model.js
//    @Desc : 코드 model
//    @Author : modeller77@gmail.com
//    include code.model.js to models/index.js
//**********************************************/

module.exports = (sequelize, DataTypes) => {
  const code = sequelize.define("tb_code", {
      idx: {
        type: DataTypes.DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        get() { return this.getDataValue('idx').toString('utf8'); }
      },cd_tp: {
        type: DataTypes.DataTypes.STRING(50),
        
        allowNull: true,
        get() { return this.getDataValue('cd_tp').toString('utf8'); }
      },cd_cd: {
        type: DataTypes.DataTypes.STRING(50),
        
        allowNull: true,
        get() { return this.getDataValue('cd_cd').toString('utf8'); }
      },cd_nm: {
        type: DataTypes.DataTypes.STRING(100),
        
        allowNull: true,
        get() { return this.getDataValue('cd_nm').toString('utf8'); }
      },cd_seq: {
        type: DataTypes.DataTypes.STRING(50),
        
        allowNull: true,
        get() { return this.getDataValue('cd_seq').toString('utf8'); }
      },cd_desc: {
        type: DataTypes.DataTypes.STRING(null),
        
        allowNull: true,
        get() { return this.getDataValue('cd_desc').toString('utf8'); }
      },org_id: {
        type: DataTypes.DataTypes.STRING(50),
        
        allowNull: true,
        get() { return this.getDataValue('org_id').toString('utf8'); }
      },
    },
    {
      freezeTableName: true,
      timestamps: false
    });
  return code;
}
