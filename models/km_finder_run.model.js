/**********************************************/
//    @Project : keywordmonitor
//    @File : km_finder_run.model.js
//    @Desc : 파인더 실행 로그 모델
//    @Author : modeller77@gmail.com
//    Include km_finder_run.model.js to models/index.js
/**********************************************/

module.exports = (sequelize, DataTypes) => {
    const km_finder_run = sequelize.define("km_finder_run", {
        run_id: {
          type: DataTypes.INTEGER(11),
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
          get() { return this.getDataValue('run_id'); }
        },
        run_date: {
          type: DataTypes.STRING(10),
          allowNull: false,
          defaultValue: '',
          get() { return this.getDataValue('run_date').toString('utf8'); }
        },
        elapsed: {
          type: DataTypes.INTEGER(8),
          allowNull: false,
          get() { return this.getDataValue('elapsed'); }
        },
        run_cnt: {
          type: DataTypes.INTEGER(8),
          allowNull: false,
          get() { return this.getDataValue('run_cnt'); }
        },
        run_datetime: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.fn("NOW"),
          get() { return this.getDataValue('run_datetime'); }
        }
      },
      {
        freezeTableName: true,
        timestamps: false
      });
    return km_finder_run;
  };