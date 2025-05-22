//**********************************************/
//    @Project : alphaBot (메타봇)
//    @File : org.model.js
//    @Desc : 기관/회사 model
//    @Author : modeller77@gmail.com
//    include org.model.js to models/index.js
//**********************************************/

module.exports = (sequelize, DataTypes) => {
  const org = sequelize.define("tb_org", {
      org_id: {
        type: DataTypes.DataTypes.INTEGER(10),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        get() { return this.getDataValue('org_id'); }
      },org_name: {
        type: DataTypes.DataTypes.STRING(50),
        
        allowNull: true,
        get() { return this.getDataValue('org_name').toString('utf8'); }
      },area: {
        type: DataTypes.DataTypes.STRING(50),
        
        allowNull: true,
        get() { return this.getDataValue('area').toString('utf8'); }
      },manager_id: {
        type: DataTypes.DataTypes.STRING(50),
        
        allowNull: true,
        get() { return this.getDataValue('manager_id').toString('utf8'); }
      },manager_email: {
        type: DataTypes.DataTypes.STRING(50),
        
        allowNull: true,
        get() { return this.getDataValue('manager_email').toString('utf8'); }
      },manager_hpno: {
        type: DataTypes.DataTypes.STRING(50),
        
        allowNull: true,
        get() { return this.getDataValue('manager_hpno').toString('utf8'); }
      },org_status: {
        type: DataTypes.DataTypes.STRING(10),
        
        allowNull: true,
        get() { return this.getDataValue('org_status').toString('utf8'); }
      },reg_dt: {
        type: DataTypes.DataTypes.DATE,
        
        allowNull: true,
        get() { return this.getDataValue('reg_dt'); }
      },leave_dt: {
        type: DataTypes.DataTypes.DATE,
        
        allowNull: true,
        get() { return this.getDataValue('leave_dt'); }
      },
    },
    {
      freezeTableName: true,
      timestamps: false
    });
  return org;
}
