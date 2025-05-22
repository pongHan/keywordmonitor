//**********************************************/
//    @Project : keywordMonitor 
//    @File : km_request.model.js
//    @Desc : 요청 model
//    @Author : modeller77@gmail.com
//    include km_request.model.js to models/index.js
//**********************************************/

module.exports = (sequelize, DataTypes) => {
    const km_request = sequelize.define("km_request", {
        req_id: {
          type: DataTypes.INTEGER(8),
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
          get() { return this.getDataValue('req_id'); }
        },
        req_mb_id: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: '',
          get() { return this.getDataValue('req_mb_id').toString('utf8'); }
        },
        receiver_email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: '',
          get() { return this.getDataValue('receiver_email').toString('utf8'); }
        },
        req_status: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: 'open',
          get() { return this.getDataValue('req_status').toString('utf8'); }
        },
        board_name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: '',
          get() { return this.getDataValue('board_name').toString('utf8'); }
        },
        board_type: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: '',
          get() { return this.getDataValue('board_type').toString('utf8'); }
        },
        post_url: {
          type: DataTypes.STRING(500),
          allowNull: false,
          defaultValue: '',
          get() { return this.getDataValue('post_url').toString('utf8'); }
        },
        keyword: {
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: '',
          get() { return this.getDataValue('keyword').toString('utf8'); }
        },
        parsing_config: {
          type: DataTypes.STRING(500),
          allowNull: false,
          defaultValue: '',
          get() { return this.getDataValue('parsing_config').toString('utf8'); }
        },
        parsing_type: {
          type: DataTypes.STRING(20),
          allowNull: false,
          defaultValue: '',
          get() { return this.getDataValue('parsing_type').toString('utf8'); }
        },
        start_date: {
          type: DataTypes.STRING(12),
          allowNull: false,
          get() { return this.getDataValue('start_date').toString('utf8'); }
        },
        end_date: {
          type: DataTypes.STRING(12),
          allowNull: false,
          get() { return this.getDataValue('end_date').toString('utf8'); }
        },
        email_send_yn: {
          type: DataTypes.STRING(1),
          allowNull: false,
          get() { return this.getDataValue('email_send_yn').toString('utf8'); }
        },
        pay_type: {
          type: DataTypes.STRING(20),
          allowNull: false,
          get() { return this.getDataValue('pay_type').toString('utf8'); }
        },
        pay_amount: {
          type: DataTypes.INTEGER(8),
          allowNull: false,
          get() { return this.getDataValue('pay_amount'); }
        },
        reg_datetime: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          get() { return this.getDataValue('reg_datetime'); }
        },
      },
      {
        freezeTableName: true,
        timestamps: false
      });
    return km_request;
  }