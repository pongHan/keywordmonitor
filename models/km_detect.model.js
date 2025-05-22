const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Assuming database config file

module.exports = (sequelize, DataTypes) => {
  const km_detect = sequelize.define(
    "km_detect",
    {
      detect_id: {
        type: DataTypes.INTEGER(8),
        primaryKey: true,
        autoIncrement: true,
        comment: "ID",
      },
      req_id: {
        type: DataTypes.INTEGER(8),
        allowNull: false,
        defaultValue: 0,
        comment: "요청ID",
      },
      req_mb_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "",
        comment: "회원ID",
      },
      board_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "",
        comment: "게시판명",
      },
      post_url: {
        type: DataTypes.STRING(500),
        allowNull: false,
        defaultValue: "",
        comment: "URL",
      },
      keyword: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "",
        comment: "키워드",
      },
      detect_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "감지일시",
      },
      post_title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "",
        comment: "글제목",
      },
      post_content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "글내용",
      },
      detect_status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "open",
        comment: "상태",
      },
      after_proc: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "",
        comment: "사후조치",
      },
      proc_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: "0000-00-00 00:00:00",
        comment: "조치일시",
      },
    },
    {
      tableName: "km_detect",
      charset: "utf8",
      collate: "utf8_general_ci",
      engine: "MyISAM",
      indexes: [
        {
          name: "index1",
          fields: ["req_id"],
        },
      ],
      timestamps: false,
    }
  );
};
