//**********************************************/
//    @Project : keywordmonitor
//    @File : km_job_log.model.js
//    @Desc : Job log model
//    @Author : modeller77@gmail.com
//    include km_job_log.model.js to models/index.js
//**********************************************/

module.exports = (sequelize, DataTypes) => {
  const kmJobLog = sequelize.define("km_job_log", {
    log_id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      get() { return this.getDataValue('log_id'); }
    },
    req_id: {
      type: DataTypes.INTEGER(8),
      allowNull: false,
      get() { return this.getDataValue('req_id'); }
    },
    board_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '',
      get() { return this.getDataValue('board_name').toString('utf8'); }
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '',
      get() { return this.getDataValue('status').toString('utf8'); }
    },
    result: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: '',
      get() { return this.getDataValue('result').toString('utf8'); }
    },
    post_cnt: {
      type: DataTypes.INTEGER(8),
      allowNull: false,
      get() { return this.getDataValue('post_cnt'); }
    },
    new_cnt: {
      type: DataTypes.INTEGER(8),
      allowNull: false,
      get() { return this.getDataValue('new_cnt'); }
    },
    reg_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      get() { return this.getDataValue('reg_datetime'); }
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });
  return kmJobLog;
};
